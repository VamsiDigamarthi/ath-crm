export type NotificationCategory = 
  | 'FILING'
  | 'SALES'
  | 'PREP_REVIEW'
  | 'DOCUMENTER'
  | 'SYSTEM'
  | 'REJECTION_ALERT';

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'INFO';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedLeadName?: string;
  relatedApplicationId?: string;
  metadata?: Record<string, any>;
}
