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
   * targeted specifically for the authenticated user and their assigned role.
   */
  public static async getNotificationsForUser(user: { id: string; role: string; email?: string }): Promise<ServerNotificationItem[]> {
    const dbNotifications = await prisma.notification.findMany({
      where: {
        OR: [
          ...(user.id ? [{ recipientUserId: user.id }] : []),
          ...(user.role ? [{ targetRole: user.role as any }] : []),
          { targetRole: null, recipientUserId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
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
}
