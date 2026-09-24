import { z } from "zod";
import { CouponDiscountType, CouponJustificationCategory } from "@prisma/client";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(30, "Coupon code cannot exceed 30 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Coupon code can only contain letters, numbers, hyphens, and underscores")
    .transform((val) => val.toUpperCase().trim()),
  description: z.string().max(255).optional(),
  discountType: z.nativeEnum(CouponDiscountType),
  discountValue: z.number().positive("Discount value must be greater than 0"),
  minServiceFee: z.number().nonnegative().optional().default(0),
  maxDiscountAmount: z.number().positive().optional(),
  justificationCategory: z.nativeEnum(CouponJustificationCategory, {
    message: "Valid business justification reason is required",
  }),
  justificationNotes: z
    .string()
    .min(10, "Manager justification notes must be at least 10 characters explaining authorization rationale")
    .max(1000, "Justification notes cannot exceed 1000 characters"),
  approvedById: z.string().uuid("Invalid Manager / Approver ID").optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional().nullable(),
  maxUsageLimit: z.number().int().positive().optional().nullable(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").transform((val) => val.toUpperCase().trim()),
  serviceFee: z.number().nonnegative("Service fee must be non-negative"),
  applicationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").transform((val) => val.toUpperCase().trim()),
  serviceFee: z.number().nonnegative("Service fee must be non-negative"),
  applicationId: z.string().uuid("Tax Application ID is required"),
  customerId: z.string().uuid().optional(),
});

export const toggleCouponStatusSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.enum(["ACTIVE", "DISABLED", "EXPIRED", "DEPLETED"]).optional(),
});
