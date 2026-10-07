import { Request, Response } from "express";
import { prisma } from "../../config/db.js";
import { TokenManager } from "../../utils/token-manager.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { SuccessHandler } from "../../utils/success-handler.js";
import { EmailService } from "../../utils/email-service.js";
import { otpEmailQueue } from "../queue/email-queue.js";
import { generateUniqueReferralCode } from "../../utils/referral.js";
import { Role, ApplicationStage, ApplicationPriority, AuditActorType, AuditActionType, NotificationCategory, NotificationPriority } from "@prisma/client";

export const requestOtp = async (req: Request, res: Response) => {
  const { email, mobile } = req.body;

  const isStaticOtp = process.env.STATIC_OTP === "true";
  const otp = isStaticOtp
    ? "123456"
    : Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const cleanEmail = email ? email.trim().toLowerCase() : undefined;
  const cleanMobile = mobile ? mobile.trim() : undefined;

  const existingUser = await prisma.user.findFirst({
    where: {
      isActive: true,
      ...(cleanEmail ? { email: cleanEmail } : { mobile: cleanMobile }),
    },
  });

  if (!existingUser) {
    throw new BadRequestError("Account not found. Only registered staff and authorized clients can log in.");
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      otp,
      otpExpiresAt,
    },
  });

  // Send OTP via BullMQ queue (or fallback) if email is provided or associated with account
  const targetEmail = cleanEmail || existingUser.email;
  if (targetEmail) {
    try {
      const fullName = `${existingUser.firstName || ""} ${existingUser.lastName || ""}`.trim() || undefined;
      await otpEmailQueue.add("send-otp", {
        identifier: cleanEmail || cleanMobile || existingUser.id,
        otp,
        email: targetEmail,
        fullName,
      });
      console.log(`[BULLMQ QUEUE] Enqueued OTP job for ${targetEmail}`);
    } catch (queueErr) {
      console.warn(`[BULLMQ QUEUE WARNING] Failed to queue, falling back to direct dispatch:`, queueErr);
      await EmailService.sendOTP(targetEmail, otp);
    }
  } else if (cleanMobile) {
    // In a real app, you would use an SMSService here
    console.log(`[SMS SIMULATION] OTP for ${cleanMobile}: ${otp}`);
  }

  return SuccessHandler.handle(res, "OTP sent successfully");
};

import { OrgRoleService } from "../admin/org-role-service.js";

const userSelectFields = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  mobile: true,
  role: true,
  activeOrgRoleId: true,
  isActive: true,
  smtpEmail: true,
  orgRoles: {
    include: {
      orgRole: true,
    },
    orderBy: { isPrimary: "desc" as const },
  },
  customerProfile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      visaType: true,
      isConvertedCustomer: true,
      applications: {
        select: {
          id: true,
          taxYear: true,
          filingType: true,
          currentStage: true,
        },
        orderBy: { taxYear: "desc" as const },
      },
    },
  },
};

async function formatAuthUser(userRecord: any) {
  if (!userRecord) return null;

  // If user has no orgRoles yet and is a staff member, backfill default org role
  if ((!userRecord.orgRoles || userRecord.orgRoles.length === 0) && userRecord.role !== Role.TAXPAYER_USER) {
    try {
      await OrgRoleService.seedDefaultOrgRoles();
      const refreshed = await prisma.user.findUnique({
        where: { id: userRecord.id },
        select: userSelectFields,
      });
      if (refreshed) {
        userRecord = refreshed;
      }
    } catch {
      // continue with existing record if seed errors
    }
  }

  const assignedOrgRoles = (userRecord.orgRoles || []).map((ur: any) => ({
    id: ur.orgRole.id,
    name: ur.orgRole.name,
    description: ur.orgRole.description,
    systemRole: ur.orgRole.systemRole,
    department: ur.orgRole.department,
    sidebarPermissions: ur.orgRole.sidebarPermissions || [],
    defaultRoute: ur.orgRole.defaultRoute,
    isPrimary: ur.isPrimary,
  }));

  const activeOrgRole =
    assignedOrgRoles.find((r: any) => r.id === userRecord.activeOrgRoleId) ||
    assignedOrgRoles[0] ||
    null;

  return {
    ...userRecord,
    assignedOrgRoles,
    activeOrgRole,
    sidebarPermissions: activeOrgRole?.sidebarPermissions || [],
  };
}

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, mobile, otp } = req.body;

  const cleanEmail = email ? email.trim().toLowerCase() : undefined;
  const cleanMobile = mobile ? mobile.trim() : undefined;

  const user = await prisma.user.findFirst({
    where: {
      isActive: true,
      ...(cleanEmail ? { email: cleanEmail } : { mobile: cleanMobile }),
    },
  });

  if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new BadRequestError("Invalid or expired OTP");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otp: null, otpExpiresAt: null },
  });

  const token = TokenManager.generateToken({
    id: user.id,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // Required for sameSite: "none"
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const authUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: userSelectFields,
  });

  const formatted = await formatAuthUser(authUser);

  return SuccessHandler.handle(res, "Login successful", formatted || {
    id: user.id,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    smtpEmail: user.smtpEmail,
  });
};

export const logout = async (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return SuccessHandler.handle(res, "Logged out successfully");
};

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return SuccessHandler.handle(res, "Current user fetched", { user: null });
  }

  const authUser = await prisma.user.findUnique({
    where: { id: req.currentUser.id },
    select: userSelectFields,
  });

  const formatted = await formatAuthUser(authUser);

  return SuccessHandler.handle(res, "Current user fetched", {
    user: formatted,
  });
};

export const registerTaxpayer = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    taxYear,
    visaType,
    ssnTin,
    referralCode,
  } = req.body;

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanFirstName = firstName.trim();
  const cleanLastName = lastName.trim();
  const cleanSsn = ssnTin?.trim() || null;

  // 1. Strict Duplicate Check: If already in DB by email, phone, or SSN, directly reject with contact message
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: cleanEmail },
        { mobile: cleanPhone },
      ],
    },
  });

  const existingProfile = await prisma.customerProfile.findFirst({
    where: {
      OR: [
        { email: cleanEmail },
        { phone: cleanPhone },
        ...(cleanSsn ? [{ ssnTin: cleanSsn }] : []),
      ],
    },
  });

  if (existingUser || existingProfile) {
    throw new BadRequestError(
      "An account with this email, phone, or SSN is already registered in our system. Please sign in or contact our support team."
    );
  }

  // 1b. Validate referral code against an existing lead
  const cleanReferralCode = referralCode?.trim().toUpperCase() || null;
  let referrer: { id: string; firstName: string; lastName: string } | null = null;
  if (cleanReferralCode) {
    referrer = await prisma.customerProfile.findUnique({
      where: { referralCode: cleanReferralCode },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!referrer) {
      throw new BadRequestError("Invalid referral code. Please check the code and try again.");
    }
  }

  // 2. Insert new User account
  const user = await prisma.user.create({
    data: {
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      mobile: cleanPhone,
      role: Role.TAXPAYER_USER,
      isActive: true,
    },
  });

  // 3. Insert new CustomerProfile linked to User
  const customerProfile = await prisma.customerProfile.create({
    data: {
      userId: user.id,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      phone: cleanPhone,
      ssnTin: cleanSsn,
      visaType: visaType?.trim() || 'Standard',
      maritalStatus: 'Single',
      referralCode: await generateUniqueReferralCode(cleanFirstName),
      referredByCustomerId: referrer?.id || null,
    },
  });

  // 4. In-App Notification dispatched to Super Admins & Documenter Managers
  try {
    const adminManagers = await prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.DOC_MANAGER] },
        isActive: true,
      },
      select: { id: true, role: true },
    });

    for (const recipient of adminManagers) {
      try {
        await prisma.notification.create({
          data: {
            recipientUserId: recipient.id,
            targetRole: recipient.role,
            applicationId: null,
            category: NotificationCategory.DOCUMENTER,
            priority: NotificationPriority.HIGH,
            title: `New Online Sign-Up: ${cleanFirstName} ${cleanLastName}`,
            message: `${cleanFirstName} ${cleanLastName} (${cleanPhone}) registered online as a new taxpayer client.${referrer ? ` Referred by ${referrer.firstName} ${referrer.lastName}.` : ''}`,
            actionUrl: `/leads`,
            actionLabel: 'View Clients',
            relatedLeadName: `${cleanFirstName} ${cleanLastName}`,
          },
        });
      } catch {
        // ignore notification write error
      }
    }
  } catch (err) {
    console.error('Failed to dispatch notifications to admins on signup:', err);
  }

  // 5. Generate Auth Session Token & Set Cookie
  const token = TokenManager.generateToken({
    id: user.id,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const authUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      mobile: true,
      role: true,
      isActive: true,
      smtpEmail: true,
      customerProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          visaType: true,
          isConvertedCustomer: true,
          applications: {
            select: {
              id: true,
              taxYear: true,
              filingType: true,
              currentStage: true,
            },
            orderBy: { taxYear: "desc" },
          },
        },
      },
    },
  });

  return SuccessHandler.handle(res, "Taxpayer registered successfully! Your account has been created.", {
    token,
    user: authUser || {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
    application: null,
  });
};

/**
 * Public: checks a lead referral code and returns the referrer's display name only
 */
export const checkReferralCode = async (req: Request, res: Response) => {
  const code = String(req.params.code || "").trim().toUpperCase();
  const referrer = await prisma.customerProfile.findUnique({
    where: { referralCode: code },
    select: { firstName: true, lastName: true },
  });

  if (!referrer) {
    throw new BadRequestError("Invalid referral code");
  }

  const lastInitial = referrer.lastName ? ` ${referrer.lastName.charAt(0)}.` : "";
  return SuccessHandler.handle(res, "Referral code is valid", {
    valid: true,
    referrerName: `${referrer.firstName}${lastInitial}`,
  });
};
