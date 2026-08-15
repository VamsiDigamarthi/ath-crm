import { Request, Response } from "express";
import { prisma } from "../../config/db.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { SuccessHandler } from "../../utils/success-handler.js";
import { Role } from "@prisma/client";

export const registerAdmin = async (req: Request, res: Response) => {
  const { email, mobile } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new BadRequestError("User or Admin already exists with this email or mobile");
  }

  const admin = await prisma.user.create({
    data: {
      email,
      mobile,
      role: Role.ADMIN,
    },
  });

  return SuccessHandler.handle(res, "Admin registered successfully", {
    id: admin.id,
    email: admin.email,
    mobile: admin.mobile,
    role: admin.role,
    createdAt: admin.createdAt,
  }, 201);
};
