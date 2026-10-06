import { prisma } from "../../config/db.js";

export interface ServerNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'FILING' | 'SALES' | 'PREP_REVIEW' | 'DOCUMENTER' | 'SYSTEM' | 'REJECTION_ALERT';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'INFO';
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedLeadName?: string;
  relatedApplicationId?: string;
}

function formatTimeAgo(date: Date | string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export class NotificationService {
  /**
   * Fetches real, persistent database notifications from the `Notification` table
   * targeted specifically for the authenticated user.
   * - Individual staff agents only receive notifications specifically targeted to their user ID.
   * - Department Managers & Admins also receive queue & department-level management alerts.
   * - Admins can optionally pass scope='all' to view company-wide activity.
   */
  public static async getNotificationsForUser(
    user: { id: string; role: string; email?: string },
    options?: { scope?: string }
  ): Promise<ServerNotificationItem[]> {
    if (!user || !user.id) {
      return [];
    }

    // Only if admin explicitly requests scope === 'all', show company-wide activity
    const isGlobalScope = user.role === 'ADMIN' && options?.scope === 'all';

    const isManagementRole = [
      'ADMIN',
      'DOC_MANAGER',
      'PREP_MANAGER',
      'SALES_MANAGER',
      'FILE_OP_MANAGER',
    ].includes(user.role);

    const whereClause = isGlobalScope
      ? {}
      : {
          OR: [
            { recipientUserId: user.id },
            ...(isManagementRole && user.role
              ? [{ targetRole: user.role as any, recipientUserId: null }]
              : []),
          ],
        };

    const dbNotifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return dbNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      category: n.category as any,
      priority: n.priority as any,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      timeAgo: formatTimeAgo(n.createdAt),
      actionUrl: n.actionUrl || undefined,
      actionLabel: n.actionLabel || undefined,
      relatedLeadName: n.relatedLeadName || undefined,
      relatedApplicationId: n.applicationId || undefined,
    }));
  }

  /**
   * Marks a single notification as read in the database.
   */
  public static async markAsRead(id: string, _user?: { id: string; role: string }) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Marks unread notifications as read in the database for the user.
   */
  public static async markAllAsRead(
    user: { id: string; role: string },
    options?: { scope?: string }
  ) {
    if (!user || !user.id) {
      return { count: 0 };
    }

    const isGlobalScope = user.role === 'ADMIN' && options?.scope === 'all';

    const isManagementRole = [
      'ADMIN',
      'DOC_MANAGER',
      'PREP_MANAGER',
      'SALES_MANAGER',
      'FILE_OP_MANAGER',
    ].includes(user.role);

    const whereClause = isGlobalScope
      ? { isRead: false }
      : {
          isRead: false,
          OR: [
            { recipientUserId: user.id },
            ...(isManagementRole && user.role
              ? [{ targetRole: user.role as any, recipientUserId: null }]
              : []),
          ],
        };

    return await prisma.notification.updateMany({
      where: whereClause,
      data: { isRead: true },
    });
  }
}
