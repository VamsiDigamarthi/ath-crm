import { Request, Response } from "express";
import { NotificationService } from "./notification-service.js";
import { SuccessHandler } from "../../utils/success-handler.js";

export const getNotifications = async (req: Request, res: Response) => {
  const user = req.currentUser || { id: "anon", role: "ADMIN" };
  const scope = req.query.scope as string | undefined;
  const notifications = await NotificationService.getNotificationsForUser(user as any, { scope });

  return SuccessHandler.handle(
    res,
    "Department notifications fetched successfully",
    notifications,
    200
  );
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const user = req.currentUser || { id: "anon", role: "ADMIN" };
  const id = req.params.id as string;
  const updated = await NotificationService.markAsRead(id, user as any);

  return SuccessHandler.handle(
    res,
    "Notification marked as read",
    updated,
    200
  );
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  const user = req.currentUser || { id: "anon", role: "ADMIN" };
  const scope = req.query.scope as string | undefined;
  const result = await NotificationService.markAllAsRead(user as any, { scope });

  return SuccessHandler.handle(
    res,
    "All notifications marked as read",
    result,
    200
  );
};
