import { create } from 'zustand';
import { authService } from '@/features/auth/services/auth-service';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string) => Promise<void>;
  verify: (identifier: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  refreshUser: async () => {
    try {
      const response: any = await authService.getCurrentUser();
      if (response.data && response.data.user) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (identifier: string) => {
    await authService.requestOtp(identifier);
  },

  verify: async (identifier: string, otp: string) => {
    const response: any = await authService.verifyOtp(identifier, otp);
    set({ user: response.data, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
