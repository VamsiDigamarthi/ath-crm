import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { Button } from '@/shared/components/Button';
import {
  Send,
  UploadCloud,
  LayoutDashboard,
  LayoutGrid,
  Users,
  LogOut,
  FileCheck2,
} from 'lucide-react';
import { filingService } from '../services/filing-service';
import toast from 'react-hot-toast';

export const FilingLayout: React.FC = () => {
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

  const isManager = user?.role === 'FILE_OP_MANAGER' || user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER' || user?.role === 'PREP_MANAGER';

  const [queueBadgeCount, setQueueBadgeCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function loadBadge() {
      try {
        const res = await filingService.getQueue({ limit: 100 });
        const all = res.leads || [];
        if (isManager) {
          setQueueBadgeCount(all.length);
        } else {
          const myId = user?.id;
          const myEmail = user?.email?.toLowerCase().trim();
          const myLeads = all.filter((l) => {
            if (!l.assignedFilingAgent) return false;
            return l.assignedFilingAgent.id === myId || l.assignedFilingAgent.email?.toLowerCase().trim() === myEmail;
          });
          setQueueBadgeCount(myLeads.length);
        }
      } catch {
        // ignore
      }
    }
    loadBadge();
  }, [isManager, user?.id, user?.email]);

  const navItems = isManager
    ? [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, section: 'Management', path: '/filing/manager' },
        { id: 'queue', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', badge: queueBadgeCount !== null ? String(queueBadgeCount) : undefined, path: '/filing/manager/queue' },
        { id: 'team', label: 'Staff Matrix & Capacity', icon: Users, section: 'Operations', path: '/filing/manager/staff' },
      ]
    : [
        { id: 'agent_hub', label: 'Filing Hub', icon: LayoutDashboard, section: 'Filing Workspace', path: '/filing/agent' },
        { id: 'agent_queue', label: 'Transmission Queue', icon: Send, section: 'Active Operations', badge: queueBadgeCount !== null ? String(queueBadgeCount) : undefined, path: '/filing/agent/queue' },
      ];

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/filing/manager/staff')) return 'team';
    if (currentPath.includes('/filing/manager/queue')) return 'queue';
    if (currentPath.includes('/filing/manager')) return 'dashboard';
    if (currentPath.includes('/filing/agent/queue') || currentPath.includes('/filing/workspace')) return 'agent_queue';
    if (currentPath.includes('/filing/agent')) return 'agent_hub';
    return isManager ? 'dashboard' : 'agent_queue';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    const target = navItems.find((n) => n.id === id);
    if (target?.path) {
      navigate(target.path);
    }
  };

  const getRoleBadgeLabel = () => {
    if (user?.role === 'FILE_OP_MANAGER') return 'IRS E-Filing Department Manager';
    if (user?.role === 'FILE_OP_AGENT' || user?.role === 'FILE_OP_TEAM_LEAD') return 'IRS E-Filing Specialist / CPA';
    if (user?.role === 'ADMIN') return 'Administrator';
    return 'Filing Specialist';
  };

  const getHeaderTitle = () => {
    if (activeId === 'team') return 'Filing Specialists Staff Matrix & Capacity';
    if (activeId === 'queue') return 'IRS Modernized e-File (MeF) Department Queue';
    if (activeId === 'dashboard') return 'IRS Transmission Command Center';
    if (activeId === 'agent_hub') return 'Filing Specialist Operations Hub';
    if (activeId === 'agent_queue') return 'My IRS Transmission Queue';
    return 'IRS E-Filing Operations';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar - Matching Documenter, PrepReview, and Sales standard */}
      <AppSidebar
        width={240}
        variant="light"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isManager ? 'Filing Manager Portal' : 'Filing Specialist Portal',
          logo: (
            <div className="w-7 h-7 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <UploadCloud className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        user={{
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0] || 'Filing Specialist',
          email: user?.email || 'filing@taxcrm.com',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'filing'}`,
        }}
        onUserClick={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-base text-slate-900 leading-tight flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#16A34A]" />
              <span>{getHeaderTitle()}</span>
            </h1>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{getRoleBadgeLabel()}</span>
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

        {/* Dynamic Nested View - Exactly matching Sales and Prep-Review padding */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
