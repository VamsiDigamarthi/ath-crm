import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { Button } from '@/shared/components/Button';
import {
  DollarSign,
  PhoneCall,
  LayoutDashboard,
  LayoutGrid,
  Users,
  LogOut,
  Bell,
} from 'lucide-react';
import { salesService } from '../services/sales-service';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import toast from 'react-hot-toast';

export const SalesLayout: React.FC = () => {
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

  const isManager = user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN';

  const [queueBadgeCount, setQueueBadgeCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function loadBadge() {
      try {
        const res = await salesService.getPipelineLeads({ limit: 100 });
        const all = res.leads || [];
        if (isManager) {
          setQueueBadgeCount(all.length);
        } else {
          const myId = user?.id;
          const myEmail = user?.email?.toLowerCase().trim();
          const myLeads = all.filter((l) => {
            if (!l.assignedSalesAgent) return false;
            return l.assignedSalesAgent.id === myId || l.assignedSalesAgent.email?.toLowerCase().trim() === myEmail;
          });
          setQueueBadgeCount(myLeads.length);
        }
      } catch {
        // ignore
      }
    }
    loadBadge();
  }, [isManager, user?.id, user?.email]);

  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  // Role-specific Navigation Items (Matching PrepReview and Documenter standard)
  const navItems = isManager
    ? [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, section: 'Management', path: '/sales/manager' },
        { id: 'pipeline', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', badge: queueBadgeCount !== null ? String(queueBadgeCount) : undefined, path: '/sales/manager/queue' },
        { id: 'team', label: 'Staff Matrix & Capacity', icon: Users, section: 'Operations', path: '/sales/manager/team' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Management', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/sales/notifications' },
      ]
    : [
        { id: 'agent_hub', label: 'Closer Hub', icon: LayoutDashboard, section: 'Closer Workspace', path: '/sales/agent' },
        { id: 'pitch_queue', label: 'Pitch Queue', icon: PhoneCall, section: 'Active Operations', badge: queueBadgeCount !== null ? String(queueBadgeCount) : undefined, path: '/sales/agent/queue' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Closer Workspace', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/sales/notifications' },
      ];

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/sales/notifications')) return 'notifications';
    if (currentPath.includes('/sales/manager/team')) return 'team';
    if (currentPath.includes('/sales/manager/queue')) return 'pipeline';
    if (currentPath.includes('/sales/manager')) return 'dashboard';
    if (currentPath.includes('/sales/agent/queue') || currentPath.includes('/sales/agent/pitch')) return 'pitch_queue';
    if (currentPath.includes('/sales/agent')) return 'agent_hub';
    return isManager ? 'dashboard' : 'pitch_queue';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    const target = navItems.find((n) => n.id === id);
    if (target?.path) {
      navigate(target.path);
    }
  };

  const getRoleBadgeLabel = () => {
    if (user?.role === 'SALES_MANAGER') return 'Sales Department Manager';
    if (user?.role === 'SALES_CLOSER' || user?.role === 'SALES_AGENT') return 'Senior Sales Closer';
    if (user?.role === 'ADMIN') return 'Administrator';
    return 'Sales Closer';
  };

  const getHeaderTitle = () => {
    if (activeId === 'notifications') return 'Sales Department Notifications Hub';
    if (activeId === 'team') return 'Sales Closers Staff Matrix & Capacity';
    if (activeId === 'pipeline') return 'Sales & Fee Quotation Department Queue';
    if (activeId === 'dashboard') return 'Sales Revenue & Closers Command Center';
    if (activeId === 'agent_hub') return 'Sales Closer Daily Operations Hub';
    if (activeId === 'pitch_queue') return 'Sales Closer Pitch & Revenue Workbench';
    return 'Sales Department Operations';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar - Matching Documenter & PrepReview standard */}
      <AppSidebar
        width={240}
        variant="light"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isManager ? 'Sales Manager Portal' : 'Sales Closer Portal',
          logo: (
            <div className="w-7 h-7 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        user={{
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0] || 'Sales Rep',
          email: user?.email || 'sales@taxcrm.com',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'sales'}`,
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
              <DollarSign className="w-3 h-3 text-[#16A34A]" /> {getRoleBadgeLabel()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBellPopover />

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
