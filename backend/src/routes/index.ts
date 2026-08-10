import { Router } from "express";
import { authRouter } from "../features/auth/auth-routes.js";

const router = Router();

// Combine all feature routes here
router.use("/auth", authRouter);

// Example: router.use("/admin", adminRouter);

export { router as rootRouter };
