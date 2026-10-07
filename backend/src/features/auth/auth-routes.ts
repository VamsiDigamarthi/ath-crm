import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requestOtp, verifyOtp, registerTaxpayer, logout, getCurrentUser, checkReferralCode } from "./auth-controller.js";
import { requestOtpSchema, verifyOtpSchema, registerTaxpayerSchema, referralCodeParamSchema } from "./auth-validator.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { OrgRoleController } from "../admin/org-role-controller.js";

const router = Router();

// Public referral code lookup is throttled to prevent code guessing
const referralCodeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.post("/register", validateRequest(registerTaxpayerSchema), registerTaxpayer);
router.post("/signup", validateRequest(registerTaxpayerSchema), registerTaxpayer);
router.post("/request-otp", validateRequest(requestOtpSchema), requestOtp);
router.post("/verify-otp", validateRequest(verifyOtpSchema), verifyOtp);
router.get("/referral-code/:code", referralCodeLimiter, validateRequest(referralCodeParamSchema), checkReferralCode);
router.post("/logout", logout);
router.get("/current-user", getCurrentUser);
router.post("/switch-active-role", OrgRoleController.switchActiveRole);

export { router as authRouter };              