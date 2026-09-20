import { Request, Response } from "express";
import { prisma } from "../../config/db.js";
import { TokenManager } from "../../utils/token-manager.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { SuccessHandler } from "../../utils/success-handler.js";
import { EmailService } from "../../utils/email-service.js";
import { otpEmailQueue } from "../queue/email-queue.js";
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
              currentStage: true,
            },
            orderBy: { taxYear: "desc" },
          },
        },
      },
    },
  });

  return SuccessHandler.handle(res, "Login successful", authUser || {
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
              currentStage: true,
            },
            orderBy: { taxYear: "desc" },
          },
        },
      },
    },
  });

  return SuccessHandler.handle(res, "Current user fetched", {
    user: authUser || req.currentUser,
  });
};

export const registerTaxpayer = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    taxYear = 2025,
    visaType,
    ssnTin,
  } = req.body;

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanFirstName = firstName.trim();
  const cleanLastName = lastName.trim();
  const targetTaxYear = Number(taxYear) || 2025;
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
    },
  });

  // 4. Insert new TaxApplication with leadSource: "SELF_SIGNUP"
  const initialDraftSummary = {
    leadSource: 'SELF_SIGNUP',
    source: 'SELF_SIGNUP',
    signupMethod: 'ONLINE_PORTAL',
    isSelfRegistered: true,
    registrationChannel: 'SELF_SERVICE_WEB',
    registeredAt: new Date().toISOString(),
    grossIncome: 0,
    w2Wages: 0,
    deductionType: 'STANDARD (Single)',
    status: null,
    notes: 'Direct online self-registration via public sign-up form',
  };

  const application = await prisma.taxApplication.create({
    data: {
      customerId: customerProfile.id,
      taxYear: targetTaxYear,
      filingType: 'INDIVIDUAL',
      currentStage: ApplicationStage.RAW_PROSPECT,
      priority: ApplicationPriority.HIGH,
      taxDraftSummary: initialDraftSummary,
    },
  });

  // A. Stage History Audit Trail
  try {
    await prisma.stageHistory.create({
      data: {
        applicationId: application.id,
        toStage: ApplicationStage.RAW_PROSPECT,
        movedByUserId: user.id,
        remarks: `Taxpayer self-registered online via Public Client Portal (Source: SELF_SIGNUP, Method: ONLINE_PORTAL, Tax Year: ${targetTaxYear})`,
      },
    });
  } catch (err) {
    console.error('Failed to create stage history on self-signup:', err);
  }

  // B. Audit Log
  try {
    await prisma.auditLog.create({
      data: {
        applicationId: application.id,
        actorId: user.id,
        actorType: AuditActorType.CLIENT,
        actorName: `${cleanFirstName} ${cleanLastName}`,
        actorRole: 'TAXPAYER_USER',
        action: AuditActionType.ORGANIZER_UPDATE,
        moduleKey: 'AUTH_SIGNUP',
        details: {
          leadSource: 'SELF_SIGNUP',
          source: 'SELF_SIGNUP',
          signupMethod: 'ONLINE_PORTAL',
          isSelfRegistered: true,
          registrationChannel: 'SELF_SERVICE_WEB',
          taxYear: targetTaxYear,
          visaType: visaType || 'Standard',
          registeredAt: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error('Failed to create audit log on self-signup:', err);
  }

  // C. In-App Notification dispatched to Super Admins & Documenter Managers
  try {
    const adminManagers = await prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.DOC_MANAGER, Role.DOC_TEAM_LEAD] },
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
            applicationId: application.id,
            category: NotificationCategory.DOCUMENTER,
            priority: NotificationPriority.HIGH,
            title: `New Online Sign-Up: ${cleanFirstName} ${cleanLastName}`,
            message: `${cleanFirstName} ${cleanLastName} (${cleanPhone} • ${visaType || 'Standard'}) registered online for Tax Year ${targetTaxYear}. Lead is in Raw Prospects queue for document intake.`,
            actionUrl: `/documenter/manager/queue`,
            actionLabel: 'View Ingested Lead',
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
              currentStage: true,
            },
            orderBy: { taxYear: "desc" },
          },
        },
      },
    },
  });

  return SuccessHandler.handle(res, "Taxpayer registered successfully! Your account and filing case have been created.", {
    token,
    user: authUser || {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
    application,
  });
};
