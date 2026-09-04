import { create } from 'zustand';
import apiClient from '@/lib/api-client';
import type { AppNotification, NotificationCategory } from '../types/notification.types';

interface NotificationState {
  notifications: AppNotification[];
  filterCategory: NotificationCategory | 'ALL';
  filterOnlyUnread: boolean;
  isLoading: boolean;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  setCategoryFilter: (category: NotificationCategory | 'ALL') => void;
  setOnlyUnreadFilter: (onlyUnread: boolean) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'timeAgo' | 'isRead'>) => void;
  
  // Computed helpers
  getUnreadCount: () => number;
  getRecentNotifications: (limit?: number) => AppNotification[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  filterCategory: 'ALL',
  filterOnlyUnread: false,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/notifications');
      const serverItems = (res as any)?.data || [];
      if (Array.isArray(serverItems)) {
        set((state) => {
          const readMap = new Map(state.notifications.map((n) => [n.id, n.isRead]));
          const merged = serverItems.map((item: any) => ({
            ...item,
            isRead: readMap.has(item.id) ? readMap.get(item.id)! : item.isRead,
          }));
          return { notifications: merged, isLoading: false };
        });
      } else {
        set({ notifications: [], isLoading: false });
      }
    } catch {
      set({ notifications: [], isLoading: false });
    }
  },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      deleteNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      setCategoryFilter: (category) => {
        set({ filterCategory: category });
      },

      setOnlyUnreadFilter: (onlyUnread) => {
        set({ filterOnlyUnread: onlyUnread });
      },

      addNotification: (item) => {
        const newNotif: AppNotification = {
          ...item,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString(),
          timeAgo: 'Just now',
          isRead: false,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      getRecentNotifications: (limit = 4) => {
        return get().notifications.slice(0, limit);
      },
}));

