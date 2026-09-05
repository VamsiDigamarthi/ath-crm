import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { Button } from '@/shared/components/Button';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Calculator,
  DollarSign,
  FileCheck2,
  UserPlus,
  UserCheck,
  Settings,
  ShieldCheck,
  LogOut,
  Bell,
} from 'lucide-react';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import toast from 'react-hot-toast';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Main', path: '/admin/dashboard' },
    { id: 'prospects', label: 'Bulk Lead Import', icon: FileSpreadsheet, section: 'Operations', path: '/admin/prospects' },
    { id: 'customers', label: 'Client Directory', icon: UserCheck, section: 'Management', path: '/admin/customers' },
    { id: 'employees', label: 'Team & Staff', icon: UserPlus, section: 'Management', path: '/admin/employees' },
    { id: 'documenter', label: 'Documenter Dept', icon: Users, section: 'Operations', path: '/admin/documenter' },
    { id: 'prep-review', label: 'Prep & Review Dept', icon: Calculator, section: 'Operations', path: '/admin/prep-review' },
    { id: 'sales', label: 'Sales Dept', icon: DollarSign, section: 'Operations', path: '/admin/sales' },
    { id: 'filing', label: 'File Operator Hub', icon: FileCheck2, section: 'Operations', path: '/admin/filing' },
    { id: 'notifications', label: 'Notifications', icon: Bell, section: 'System', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/admin/notifications' },
    { id: 'settings', label: 'System Settings', icon: Settings, section: 'Admin', path: '/admin/settings' },
  ];

  // Determine active item from URL pathname
  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/admin/notifications')) return 'notifications';
    if (currentPath.includes('/admin/prospects') || currentPath.includes('/admin/leads')) return 'prospects';
    if (currentPath.includes('/admin/customers')) return 'customers';
    if (currentPath.includes('/admin/employees')) return 'employees';
    if (currentPath.includes('/admin/documenter')) return 'documenter';
    if (currentPath.includes('/admin/prep-review')) return 'prep-review';
    if (currentPath.includes('/admin/sales')) return 'sales';
    if (currentPath.includes('/admin/filing')) return 'filing';
    if (currentPath.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeId = getActiveId();

  const getHeaderTitle = () => {
    switch (activeId) {
      case 'notifications':
        return 'Department Notifications & Activity Hub';
      case 'customers':
        return 'Customer & Client Directory';
      case 'employees':
        return 'Staff & Team Directory';
      case 'prospects':
        return 'Bulk Lead Import & Deduplication';
      case 'documenter':
        return 'Documenter Department Supervision';
      case 'prep-review':
        return 'Tax Prep & QA Review Department Supervision';
      case 'sales':
        return 'Sales & Fee Quotations Supervision';
      case 'filing':
        return 'File Operator & CPA E-Filing Hub';
      case 'settings':
        return 'System Settings';
      case 'dashboard':
      default:
        return 'Executive Operations Dashboard';
    }
  };

  const handleItemClick = (id: string) => {
    const item = navItems.find((n) => n.id === id);
    if (item?.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar
        width={240}
        variant="light"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: 'Tax Filing Operations',
          logo: (
            <div className="w-7 h-7 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        user={{
          name: user?.email?.split('@')[0] || 'Admin',
          email: user?.email || user?.mobile || 'admin@taxcrm.com',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`,
        }}
        onUserClick={handleLogout}
      />

      {/* Right Container (Header + Routed Content Body) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-base text-slate-900">
              {getHeaderTitle()}
            </h1>
            <span className="text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#16A34A]" /> Super Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBellPopover />

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Right Main Content rendered via React Router Outlet */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
