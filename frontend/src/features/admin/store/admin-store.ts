import { create } from 'zustand';

interface AdminState {
  isSidebarOpen: boolean;
  activeTab: string;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isSidebarOpen: true,
  activeTab: 'overview',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
}));
