import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { Button } from '@/shared/components/Button';
import {
  Users,
  LogOut,
  Bell,
  LayoutDashboard,
  LayoutGrid
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PrepReviewLayout: React.FC = () => {
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
    {
      id: 'dashboard',
      label: 'Operations Hub',
      icon: LayoutDashboard,
      section: 'Management',
      path: '/prep-review/manager',
    },
    {
      id: 'queue',
      label: 'Pipeline Caseload',
      icon: LayoutGrid,
      section: 'Operations',
      path: '/prep-review/manager/queue',
    },
    {
      id: 'staff',
      label: 'Staff Matrix & Capacity',
      icon: Users,
      section: 'Operations',
      path: '/prep-review/manager/staff',
    },
  ];

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/prep-review/manager/staff')) return 'staff';
    if (currentPath.includes('/prep-review/manager/queue')) return 'queue';
    if (currentPath.includes('/prep-review/manager')) return 'dashboard';
    return 'dashboard';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    const target = navItems.find((n) => n.id === id);
    if (target?.path) {
      navigate(target.path);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <AppSidebar
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        brand={{
          title: 'TaxCRM Engine',
          subtitle: 'Tax Prep & QA Operations',
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              Tax Prep &amp; Review Operations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Department Manager
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center border border-indigo-300">
                {user?.email?.[0]?.toUpperCase() || 'M'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.email?.split('@')[0] || 'Suresh Raina'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Tax Prep Manager</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 ml-2 cursor-pointer h-8 px-2.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Nested View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
