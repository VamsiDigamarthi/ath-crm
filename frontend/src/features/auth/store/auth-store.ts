import { create } from 'zustand';
import { authService } from '@/features/auth/services/auth-service';
import { useNotificationStore } from '@/features/notifications/store/notification-store';

export interface AssignedOrgRole {
  id: string;
  name: string;
  description?: string;
  systemRole: string;
  department?: string;
  sidebarPermissions: string[];
  defaultRoute?: string;
  isPrimary?: boolean;
}

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeOrgRole: AssignedOrgRole | null;
  assignedOrgRoles: AssignedOrgRole[];
  sidebarPermissions: string[];
  setUser: (user: any) => void;
  login: (identifier: string) => Promise<void>;
  verify: (identifier: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchActiveRole: (orgRoleId: string) => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  activeOrgRole: null,
  assignedOrgRoles: [],
  sidebarPermissions: [],

  setUser: (user: any) => {
    const assignedOrgRoles: AssignedOrgRole[] = user?.assignedOrgRoles || [];
    const activeOrgRole: AssignedOrgRole | null =
      user?.activeOrgRole ||
      assignedOrgRoles.find((r) => r.id === user?.activeOrgRoleId) ||
      assignedOrgRoles[0] ||
      null;
    const sidebarPermissions: string[] = activeOrgRole?.sidebarPermissions || user?.sidebarPermissions || [];

    set({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      activeOrgRole,
      assignedOrgRoles,
      sidebarPermissions,
    });

    if (user) {
      useNotificationStore.getState().fetchNotifications();
    }
  },

  refreshUser: async () => {
    try {
      const response: any = await authService.getCurrentUser();
      const userData = response.data?.user;
      if (userData) {
        get().setUser(userData);
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          activeOrgRole: null,
          assignedOrgRoles: [],
          sidebarPermissions: [],
        });
        useNotificationStore.getState().clearAll();
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        activeOrgRole: null,
        assignedOrgRoles: [],
        sidebarPermissions: [],
      });
      useNotificationStore.getState().clearAll();
    }
  },

  login: async (identifier: string) => {
    await authService.requestOtp(identifier);
  },

  verify: async (identifier: string, otp: string) => {
    const response: any = await authService.verifyOtp(identifier, otp);
    const userData = response.data;
    get().setUser(userData);
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      activeOrgRole: null,
      assignedOrgRoles: [],
      sidebarPermissions: [],
    });
    useNotificationStore.getState().clearAll();
  },

  switchActiveRole: async (orgRoleId: string) => {
    try {
      const response: any = await authService.switchActiveRole(orgRoleId);
      const data = response?.data?.data || response?.data;
      if (data && data.activeOrgRole) {
        const nextRole: AssignedOrgRole = data.activeOrgRole;
        const currentUser = get().user || {};

        set({
          user: {
            ...currentUser,
            ...data.user,
            role: nextRole.systemRole,
            activeOrgRoleId: nextRole.id,
            activeOrgRole: nextRole,
            sidebarPermissions: nextRole.sidebarPermissions || [],
          },
          activeOrgRole: nextRole,
          sidebarPermissions: nextRole.sidebarPermissions || [],
        });

        useNotificationStore.getState().fetchNotifications();
        return nextRole.defaultRoute || null;
      }
      throw new Error(response?.data?.message || 'Failed to switch role');
    } catch (err) {
      console.error('Failed to switch active role:', err);
      throw err;
    }
  },
}));
