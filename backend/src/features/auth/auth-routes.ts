import { Router } from "express";
import { requestOtp, verifyOtp, logout, getCurrentUser } from "./auth-controller.js";
import { requestOtpSchema, verifyOtpSchema } from "./auth-validator.js";
import { validateRequest } from "../../middlewares/validate-request.js";

const router = Router();

router.post("/request-otp", validateRequest(requestOtpSchema), requestOtp);
router.post("/verify-otp", validateRequest(verifyOtpSchema), verifyOtp);
router.post("/logout", logout);
router.get("/current-user", getCurrentUser);

export { router as authRouter };
