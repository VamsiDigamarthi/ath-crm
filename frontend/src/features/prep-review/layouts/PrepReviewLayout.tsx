import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { Button } from '@/shared/components/Button';
import {
  Users,
  LogOut,
  Calculator,
  LayoutDashboard,
  LayoutGrid,
  ShieldCheck
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

  const isManager = user?.role === 'PREP_MANAGER' || user?.role === 'ADMIN';

  // Role-specific Navigation Items (Matching Documenter standard)
  const navItems = isManager
    ? [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, section: 'Management', path: '/prep-review/manager' },
        { id: 'caseload', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', badge: '1', path: '/prep-review/manager/queue' },
        { id: 'staff', label: 'Staff Matrix & Capacity', icon: Users, section: 'Operations', badge: '5', path: '/prep-review/manager/staff' },
      ]
    : [
        { id: 'specialist_hub', label: 'My Operations Hub', icon: LayoutDashboard, section: 'Specialist Workspace', path: '/prep-review/dashboard' },
        { id: 'preparer', label: 'Preparer Workbench', icon: Calculator, section: 'Active Operations', badge: '1', path: '/prep-review/preparer' },
        { id: 'reviewer', label: 'QA Audit Deck', icon: ShieldCheck, section: 'Active Operations', badge: '1', path: '/prep-review/reviewer' },
      ];

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/prep-review/manager/staff')) return 'staff';
    if (currentPath.includes('/prep-review/manager/queue')) return 'caseload';
    if (currentPath.includes('/prep-review/manager')) return 'dashboard';
    if (currentPath.includes('/prep-review/dashboard')) return 'specialist_hub';
    if (currentPath.includes('/prep-review/preparer')) return 'preparer';
    if (currentPath.includes('/prep-review/reviewer')) return 'reviewer';
    return isManager ? 'dashboard' : 'specialist_hub';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    const target = navItems.find((n) => n.id === id);
    if (target?.path) {
      navigate(target.path);
    }
  };

  const getRoleBadgeLabel = () => {
    if (user?.role === 'PREP_MANAGER') return 'Tax Prep Manager';
    if (user?.role === 'TAX_PREPARER') return 'Tax Preparer';
    if (user?.role === 'TAX_REVIEWER') return 'Senior QA Reviewer';
    if (user?.role === 'ADMIN') return 'Administrator';
    return 'Tax Specialist';
  };

  const getHeaderTitle = () => {
    if (activeId === 'staff') return 'Staff Matrix & Workload Allocation';
    if (activeId === 'caseload') return 'Tax Preparation Department Queue';
    if (activeId === 'dashboard') return 'Tax Prep & Review Operations Command Center';
    if (activeId === 'specialist_hub') return 'Tax Specialist Unified Operations Deck';
    if (activeId === 'preparer') return 'Tax Preparer 1040 Drafting Workbench';
    if (activeId === 'reviewer') return 'Senior QA Compliance Audit Deck';
    return 'Tax Prep & Review Operations';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar - Matching Documenter standard */}
      <AppSidebar
        width={240}
        variant="light"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isManager ? 'Prep Manager Portal' : 'Tax Specialist Portal',
          logo: (
            <div className="w-7 h-7 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <Calculator className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        user={{
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email?.split('@')[0] || 'Staff',
          email: user?.email || 'prep@taxcrm.com',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'prep'}`,
        }}
        onUserClick={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-base text-slate-900 leading-tight">
              {getHeaderTitle()}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              <Calculator className="w-3 h-3 text-[#16A34A]" /> {getRoleBadgeLabel()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-8 px-2.5"
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
