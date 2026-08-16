import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { Button } from '@/shared/components/Button';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  DollarSign,
  FileCheck,
  UserPlus,
  Settings,
  ShieldCheck,
  LogOut,
  Bell,
} from 'lucide-react';
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Main', path: '/admin/dashboard' },
    { id: 'prospects', label: 'Bulk Lead Import', icon: FileSpreadsheet, section: 'Operations', badge: '1,248', path: '/admin/prospects' },
    { id: 'employees', label: 'Team & Staff', icon: UserPlus, section: 'Management', badge: '8', path: '/admin/employees' },
    { id: 'documenter', label: 'Documenter Dept', icon: Users, section: 'Operations', badge: '432', path: '/admin/documenter' },
    { id: 'sales', label: 'Sales Pitches', icon: DollarSign, section: 'Operations', badge: '289', path: '/admin/sales' },
    { id: 'filing', label: 'File Operator', icon: FileCheck, section: 'Operations', badge: '527', path: '/admin/filing' },
    { id: 'settings', label: 'System Settings', icon: Settings, section: 'Admin', path: '/admin/settings' },
  ];

  // Determine active item from URL pathname
  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/admin/prospects') || currentPath.includes('/admin/leads')) return 'prospects';
    if (currentPath.includes('/admin/employees')) return 'employees';
    if (currentPath.includes('/admin/documenter')) return 'documenter';
    if (currentPath.includes('/admin/sales')) return 'sales';
    if (currentPath.includes('/admin/filing')) return 'filing';
    if (currentPath.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeId = getActiveId();

  const getHeaderTitle = () => {
    switch (activeId) {
      case 'employees':
        return 'Staff & Team Directory';
      case 'prospects':
        return 'Bulk Lead Import & Deduplication';
      case 'documenter':
        return 'Documenter Department Queue';
      case 'sales':
        return 'Sales Pitches & Quotations';
      case 'filing':
        return 'File Operator & CPA E-Filing';
      case 'settings':
        return 'System Settings';
      case 'dashboard':
      default:
        return 'Operations Dashboard';
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
      {/* Compact Width Left Sidebar with aligned h-16 Brand header */}
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
          name: user?.email?.split('@')[0] || 'Super Admin',
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
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg p-2"
            >
              <Bell className="w-4 h-4 text-slate-500" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 text-xs flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
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
