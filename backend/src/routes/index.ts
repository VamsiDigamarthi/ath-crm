import { Router } from "express";
import { authRouter } from "../features/auth/auth-routes.js";
import { adminRouter } from "../features/admin/admin-routes.js";
import { documenterRouter } from "../features/documenter/documenter-routes.js";
import { prepReviewRouter } from "../features/prep-review/prep-review-routes.js";
import { salesRouter } from "../features/sales/sales-routes.js";
import { customerRouter } from "../features/customer/customer-routes.js";
import { filingRouter } from "../features/filing/filing-routes.js";

const router = Router();

// Combine all feature routes here
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/documenter", documenterRouter);
router.use("/prep-review", prepReviewRouter);
router.use("/sales", salesRouter);
router.use("/customer", customerRouter);
router.use("/filing", filingRouter);

export { router as rootRouter };
