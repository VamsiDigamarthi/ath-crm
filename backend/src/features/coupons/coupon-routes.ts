import { Router } from "express";
import {
  createCoupon,
  getCoupons,
  getCouponStats,
  validateCoupon,
  applyCoupon,
  toggleCouponStatus,
  getCouponAuditTrail,
} from "./coupon-controller.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import {
  createCouponSchema,
  validateCouponSchema,
  applyCouponSchema,
  toggleCouponStatusSchema,
} from "./coupon-validator.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { Role } from "../../types/index.js";

const router = Router();

// Manager Roles Authorized to create coupons
const MANAGER_ROLES = [
  Role.ADMIN,
  Role.SALES_MANAGER,
  Role.SALES_TEAM_LEAD,
  Role.DOC_MANAGER,
  Role.DOC_TEAM_LEAD,
  Role.PREP_MANAGER,
  Role.FILE_OP_MANAGER,
];

// List all coupons
router.get("/", requireAuth, getCoupons);

// Coupon statistics & justification analytics
router.get("/stats", requireAuth, getCouponStats);

// Redemptions audit trail
router.get("/audit-trail", requireAuth, getCouponAuditTrail);

// Create manager-approved coupon (Managers & TLs only)
router.post(
  "/",
  requireAuth,
  authorize(...MANAGER_ROLES),
  validateRequest(createCouponSchema),
  createCoupon
);

// Validate coupon against a fee amount (Live quote simulator)
router.post(
  "/validate",
  requireAuth,
  validateRequest(validateCouponSchema),
  validateCoupon
);

// Apply coupon to a tax application quote
router.post(
  "/apply",
  requireAuth,
  validateRequest(applyCouponSchema),
  applyCoupon
);

// Toggle coupon status / disable coupon (Managers only)
router.patch(
  "/:id/status",
  requireAuth,
  authorize(...MANAGER_ROLES),
  validateRequest(toggleCouponStatusSchema),
  toggleCouponStatus
);

export { router as couponRouter };
