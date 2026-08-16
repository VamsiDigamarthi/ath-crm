import { Router } from "express";
import { authRouter } from "../features/auth/auth-routes.js";
import { adminRouter } from "../features/admin/admin-routes.js";
import { documenterRouter } from "../features/documenter/documenter-routes.js";

const router = Router();

// Combine all feature routes here
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/documenter", documenterRouter);

export { router as rootRouter };
