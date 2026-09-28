import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { HeaderUserProfile } from '@/shared/components/HeaderUserProfile';
import {
  LayoutDashboard,
  FileSpreadsheet,
  RotateCcw,
  Users,
  Calculator,
  DollarSign,
  FileCheck2,
  UserPlus,
  UserCheck,
  Settings,
  Bell,
  Mail,
  Globe,
  Tag,
} from 'lucide-react';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import toast from 'react-hot-toast';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

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
    { id: 'self-signups', label: 'Direct Sign-ups', icon: Globe, section: 'Operations', path: '/admin/self-signups' },
    { id: 'returned-leads', label: 'Returned Leads', icon: RotateCcw, section: 'Operations', path: '/admin/returned-leads' },
    { id: 'all-taxpayers', label: 'All Taxpayers Hub', icon: Users, section: 'Management', path: '/admin/all-taxpayers' },
    { id: 'coupons', label: 'Discount Coupons', icon: Tag, section: 'Management', path: '/admin/coupons' },
    { id: 'customers', label: 'Customers', icon: UserCheck, section: 'Management', path: '/admin/customers' },
    { id: 'employees', label: 'Team & Staff', icon: UserPlus, section: 'Management', path: '/admin/employees' },
    { id: 'email-templates', label: 'Email Templates', icon: Mail, section: 'Management', path: '/admin/email-templates' },
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
    if (currentPath.includes('/admin/coupons') || currentPath.includes('/admin/coupon') || currentPath.includes('/admin/discount-coupons')) return 'coupons';
    if (currentPath.includes('/admin/all-taxpayers')) return 'all-taxpayers';
    if (currentPath.includes('/admin/self-signups')) return 'self-signups';
    if (currentPath.includes('/admin/returned-leads')) return 'returned-leads';
    if (currentPath.includes('/admin/prospects') || currentPath.includes('/admin/leads')) return 'prospects';
    if (currentPath.includes('/admin/customers')) return 'customers';
    if (currentPath.includes('/admin/employees')) return 'employees';
    if (currentPath.includes('/admin/email-templates')) return 'email-templates';
    if (currentPath.includes('/admin/documenter')) return 'documenter';
    if (currentPath.includes('/admin/prep-review')) return 'prep-review';
    if (currentPath.includes('/admin/sales')) return 'sales';
    if (currentPath.includes('/admin/filing')) return 'filing';
    if (currentPath.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    if (id === 'coupons') {
      navigate('/admin/coupons');
      return;
    }
    const item = navItems.find((n) => n.id === id);
    if (item?.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar
        width={240}
        variant="light"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: 'Tax Filing Operations',
          logo: (
            <div className="w-7 h-7 rounded-md bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        showLogoutOnly={true}
        onLogout={handleLogout}
      />

      {/* Right Container (Header + Routed Content Body) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-end px-6 bg-white border-b border-slate-300 shrink-0 gap-3">
          <NotificationBellPopover />

          {/* Reusable Header User Profile Pill */}
          <HeaderUserProfile />
        </header>

        {/* Scrollable Right Main Content rendered via React Router Outlet */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
