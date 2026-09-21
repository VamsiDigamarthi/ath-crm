import { create } from 'zustand';
import { authService } from '@/features/auth/services/auth-service';
import { useNotificationStore } from '@/features/notifications/store/notification-store';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: any) => void;
  login: (identifier: string) => Promise<void>;
  verify: (identifier: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: any) => {
    set({ user, isAuthenticated: Boolean(user), isLoading: false });
    if (user) {
      useNotificationStore.getState().fetchNotifications();
    }
  },

  refreshUser: async () => {
    try {
      const response: any = await authService.getCurrentUser();
      if (response.data && response.data.user) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        useNotificationStore.getState().fetchNotifications();
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
        useNotificationStore.getState().clearAll();
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      useNotificationStore.getState().clearAll();
    }
  },

  login: async (identifier: string) => {
    await authService.requestOtp(identifier);
  },

  verify: async (identifier: string, otp: string) => {
    const response: any = await authService.verifyOtp(identifier, otp);
    set({ user: response.data, isAuthenticated: true });
    useNotificationStore.getState().fetchNotifications();
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
    useNotificationStore.getState().clearAll();
  },
}));
