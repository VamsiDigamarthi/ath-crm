import { Router } from "express";
import { getNotifications } from "./notification-controller.js";
import { requireAuth } from "../../middlewares/require-auth.js";

const router = Router();

// All authenticated roles can fetch their department notifications
router.get("/", requireAuth, getNotifications);

export { router as notificationRouter };
