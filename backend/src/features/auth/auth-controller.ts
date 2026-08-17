import { Request, Response } from "express";
import { prisma } from "../../config/db.js";
import { TokenManager } from "../../utils/token-manager.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { SuccessHandler } from "../../utils/success-handler.js";
import { EmailService } from "../../utils/email-service.js";

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

  // Send OTP via Email if email is provided
  if (cleanEmail) {
    await EmailService.sendOTP(cleanEmail, otp);
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
