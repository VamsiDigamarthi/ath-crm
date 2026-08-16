import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { Button } from '@/shared/components/Button';
import {
  Users,
  LogOut,
  Bell,
  Headphones,
  LayoutDashboard,
  LayoutGrid,
  PhoneCall,
  Clock,
  FileCheck2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DocumenterLayout: React.FC = () => {
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

  const isManager = user?.role === 'DOC_MANAGER' || user?.role === 'ADMIN';

  // Role-specific Navigation Items
  const navItems = isManager
    ? [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, section: 'Management', path: '/documenter/manager' },
        { id: 'scorecards', label: 'Agent Scorecards', icon: Users, section: 'Operations', badge: '8', path: '/documenter/manager/scorecards' },
        { id: 'caseload', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', badge: '20', path: '/documenter/manager/queue' },
      ]
    : [
        { id: 'agent_dashboard', label: 'Calling Dashboard', icon: LayoutDashboard, section: 'Calling Workspace', path: '/documenter/agent' },
        { id: 'agent_queue', label: 'My Calling Queue', icon: PhoneCall, section: 'Calling Workspace', badge: '20', path: '/documenter/agent/queue' },
        { id: 'agent_callbacks', label: 'Scheduled Callbacks', icon: Clock, section: 'Calling Workspace', badge: '3', path: '/documenter/agent/callbacks' },
        { id: 'agent_prep', label: 'Tax Prep Active', icon: FileCheck2, section: 'Intake Pipeline', badge: '4', path: '/documenter/agent/prep' },
      ];

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/documenter/manager/scorecards')) return 'scorecards';
    if (currentPath.includes('/documenter/manager/queue')) return 'caseload';
    if (currentPath.includes('/documenter/manager')) return 'dashboard';
    if (currentPath.includes('/documenter/agent/queue')) return 'agent_queue';
    if (currentPath.includes('/documenter/agent/callbacks')) return 'agent_callbacks';
    if (currentPath.includes('/documenter/agent/prep')) return 'agent_prep';
    if (currentPath.includes('/documenter/agent')) return 'agent_dashboard';
    return 'agent_dashboard';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    const target = navItems.find((n) => n.id === id);
    if (target?.path) {
      navigate(target.path);
    }
  };

  const getRoleBadgeLabel = () => {
    if (user?.role === 'DOC_MANAGER') return 'Documenter Manager';
    if (user?.role === 'DOC_TEAM_LEAD') return 'Documenter Team Lead';
    return 'Calling Agent';
  };

  const getHeaderTitle = () => {
    if (activeId === 'scorecards') return 'Calling Agent Scorecards & Workload Health';
    if (activeId === 'caseload') return 'Department Caseload Queue & Pipeline';
    if (activeId === 'dashboard') return 'Documenter Operations Command Center';
    if (activeId === 'agent_queue') return 'My Active Calling Queue';
    if (activeId === 'agent_callbacks') return 'Scheduled Callbacks & Follow-ups';
    if (activeId === 'agent_prep') return 'Active W-2 Tax Preparation Intakes';
    return 'Calling Agent Performance Hub';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Documenter Department Sidebar */}
      <AppSidebar
        width={240}
        variant="light"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isManager ? 'Doc Manager Portal' : 'Calling Agent Portal',
          logo: (
            <div className="w-7 h-7 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <Headphones className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        user={{
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email?.split('@')[0] || 'Staff',
          email: user?.email || 'staff@taxcrm.com',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'doc'}`,
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
              <Headphones className="w-3 h-3 text-[#16A34A]" /> {getRoleBadgeLabel()}
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
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Screen Outlet */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
