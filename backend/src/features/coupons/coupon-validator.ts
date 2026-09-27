import { z } from "zod";
import { CouponDiscountType, CouponJustificationCategory } from "@prisma/client";

export const createCouponSchema = z.object({
  body: z.object({
    code: z
      .string({ message: "Coupon code is required" })
      .min(2, "Coupon code must be at least 2 characters")
      .max(50, "Coupon code cannot exceed 50 characters")
      .transform((val) => val.toUpperCase().trim()),
    description: z.string().max(255).optional().nullable(),
    discountType: z.nativeEnum(CouponDiscountType).default(CouponDiscountType.FLAT),
    discountValue: z.coerce.number().positive("Discount value must be greater than 0"),
    minServiceFee: z.coerce.number().nonnegative().optional().default(0),
    maxDiscountAmount: z.coerce.number().positive().optional().nullable(),
    justificationCategory: z.nativeEnum(CouponJustificationCategory, {
      message: "Valid business justification reason is required",
    }).default(CouponJustificationCategory.IMMEDIATE_CLOSING_INCENTIVE),
    justificationNotes: z
      .string({ message: "Manager justification notes are required" })
      .min(3, "Please enter manager justification notes (at least 3 characters)")
      .max(1000, "Justification notes cannot exceed 1000 characters"),
    approvedById: z.string().optional().nullable(),
    validFrom: z.string().optional().nullable(),
    validUntil: z.string().optional().nullable(),
    maxUsageLimit: z.coerce.number().int().positive().optional().nullable(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Coupon code is required").transform((val) => val.toUpperCase().trim()),
    serviceFee: z.coerce.number().nonnegative("Service fee must be non-negative"),
    applicationId: z.string().optional(),
    customerId: z.string().optional(),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Coupon code is required").transform((val) => val.toUpperCase().trim()),
    serviceFee: z.coerce.number().nonnegative("Service fee must be non-negative"),
    applicationId: z.string().min(1, "Tax Application ID is required"),
    customerId: z.string().optional(),
  }),
});

export const toggleCouponStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional(),
    status: z.enum(["ACTIVE", "DISABLED", "EXPIRED", "DEPLETED"]).optional(),
  }),
});
