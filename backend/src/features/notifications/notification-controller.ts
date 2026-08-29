import { Request, Response } from "express";
import { NotificationService } from "./notification-service.js";
import { SuccessHandler } from "../../utils/success-handler.js";

export const getNotifications = async (req: Request, res: Response) => {
  const user = req.currentUser || { id: "anon", role: "ADMIN" };
  const notifications = await NotificationService.getNotificationsForUser(user as any);

  return SuccessHandler.handle(
    res,
    "Department notifications fetched successfully",
    notifications,
    200
  );
};
