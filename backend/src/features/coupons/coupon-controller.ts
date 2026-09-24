import { Request, Response } from "express";
import { SuccessHandler } from "../../utils/success-handler.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { CouponService } from "./coupon-service.js";

export const createCoupon = async (req: Request, res: Response) => {
  const currentUserId = req.currentUser?.id;
  if (!currentUserId) {
    throw new BadRequestError("User authentication required");
  }

  const result = await CouponService.createCoupon(req.body, currentUserId);
  return SuccessHandler.handle(res, "Manager-approved discount coupon created successfully", result, 201);
};

export const getCoupons = async (req: Request, res: Response) => {
  const { search, status, category, discountType, page, limit } = req.query;

  const result = await CouponService.getCoupons({
    search: typeof search === "string" ? search : undefined,
    status: typeof status === "string" ? (status as any) : undefined,
    category: typeof category === "string" ? (category as any) : undefined,
    discountType: typeof discountType === "string" ? (discountType as any) : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  return SuccessHandler.handle(res, "Coupons retrieved successfully", result, 200);
};

export const getCouponStats = async (req: Request, res: Response) => {
  const stats = await CouponService.getCouponStats();
  return SuccessHandler.handle(res, "Coupon analytics retrieved successfully", stats, 200);
};

export const validateCoupon = async (req: Request, res: Response) => {
  const { code, serviceFee, applicationId, customerId } = req.body;
  const result = await CouponService.validateCoupon({
    code,
    serviceFee: Number(serviceFee),
    applicationId,
    customerId,
  });
  return SuccessHandler.handle(res, "Coupon validated successfully", result, 200);
};

export const applyCoupon = async (req: Request, res: Response) => {
  const currentUserId = req.currentUser?.id;
  if (!currentUserId) {
    throw new BadRequestError("User authentication required");
  }

  const { code, serviceFee, applicationId, customerId } = req.body;
  const result = await CouponService.applyCoupon(
    {
      code,
      serviceFee: Number(serviceFee),
      applicationId,
      customerId,
    },
    currentUserId
  );

  return SuccessHandler.handle(res, "Coupon applied and recorded to quotation successfully", result, 200);
};

export const toggleCouponStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, isActive } = req.body;

  if (!id) {
    throw new BadRequestError("Coupon ID is required");
  }

  const result = await CouponService.toggleCouponStatus(String(id), status, isActive);
  return SuccessHandler.handle(res, "Coupon status updated successfully", result, 200);
};

export const getCouponAuditTrail = async (req: Request, res: Response) => {
  const { couponCode, applicationId, category, page, limit } = req.query;

  const result = await CouponService.getCouponAuditTrail({
    couponCode: typeof couponCode === "string" ? couponCode : undefined,
    applicationId: typeof applicationId === "string" ? applicationId : undefined,
    category: typeof category === "string" ? (category as any) : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  return SuccessHandler.handle(res, "Coupon audit trail retrieved successfully", result, 200);
};
