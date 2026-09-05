import { Router } from "express";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "./notification-controller.js";
import { requireAuth } from "../../middlewares/require-auth.js";

const router = Router();

// All authenticated roles can fetch and manage their department notifications
router.get("/", requireAuth, getNotifications);
router.patch("/mark-all-read", requireAuth, markAllNotificationsAsRead);
router.patch("/:id/read", requireAuth, markNotificationAsRead);

export { router as notificationRouter };
