import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { HeaderUserProfile } from '@/shared/components/HeaderUserProfile';
import {
  Send,
  UploadCloud,
  LayoutDashboard,
  LayoutGrid,
  Users,
  Bell,
  Clock,
  PauseCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { filingService } from '../services/filing-service';
import { filterNavItemsByPermissions } from '@/shared/constants/sidebar-catalog';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import {
  isReturnOnHold,
  isReturnRejected,
  isReturnFiled,
  isReturnPending,
} from '../hooks/useFilingQueue';
import toast from 'react-hot-toast';

export const FilingLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeOrgRole, sidebarPermissions, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const isManager =
    user?.role === 'FILE_OP_MANAGER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'SALES_MANAGER' ||
    user?.role === 'PREP_MANAGER';

  const [queueBadgeCount, setQueueBadgeCount] = React.useState<number | null>(null);
  const [filingCounts, setFilingCounts] = React.useState({
    ready: 0,
    pending: 0,
    onHold: 0,
    rejected: 0,
    filed: 0,
    all: 0,
  });

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
            return (
              l.assignedFilingAgent.id === myId ||
              l.assignedFilingAgent.email?.toLowerCase().trim() === myEmail
            );
          });
          setQueueBadgeCount(myLeads.length);

          let ready = 0;
          let pending = 0;
          let onHold = 0;
          let rejected = 0;
          let filed = 0;

          myLeads.forEach((lead) => {
            if (isReturnOnHold(lead)) {
              onHold++;
            } else if (isReturnRejected(lead)) {
              rejected++;
            } else if (isReturnFiled(lead)) {
              filed++;
            } else if (isReturnPending(lead)) {
              pending++;
            } else {
              ready++;
            }
          });

          setFilingCounts({
            ready,
            pending,
            onHold,
            rejected,
            filed,
            all: myLeads.length,
          });
        }
      } catch {
        // ignore
      }
    }
    loadBadge();
  }, [isManager, user?.id, user?.email]);

  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  const rawNavItems = isManager
    ? [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, section: 'Management', path: '/filing/manager' },
        { id: 'queue', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', badge: queueBadgeCount !== null ? String(queueBadgeCount) : undefined, path: '/filing/manager/queue' },
        { id: 'team', label: 'Staff Matrix & Capacity', icon: Users, section: 'Operations', path: '/filing/manager/staff' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Management', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/filing/notifications' },
      ]
    : [
        { id: 'filing_dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Filing Workspace', path: '/filing/agent' },
        { id: 'filing_ready', label: 'Ready for Filing', icon: Send, section: 'Active Operations', badge: filingCounts.ready ? String(filingCounts.ready) : undefined, path: '/filing/agent/queue' },
        { id: 'filing_pending', label: 'Filing Pending', icon: Clock, section: 'Active Operations', badge: filingCounts.pending ? String(filingCounts.pending) : undefined, path: '/filing/agent/pending' },
        { id: 'filing_on_hold', label: 'Filing on Hold', icon: PauseCircle, section: 'Active Operations', badge: filingCounts.onHold ? String(filingCounts.onHold) : undefined, path: '/filing/agent/on-hold' },
        { id: 'filing_rejected', label: 'Rejected Returns', icon: AlertTriangle, section: 'Active Operations', badge: filingCounts.rejected ? String(filingCounts.rejected) : undefined, path: '/filing/agent/rejected' },
        { id: 'filing_filed', label: 'Filed Returns', icon: CheckCircle2, section: 'My Filings', badge: filingCounts.filed ? String(filingCounts.filed) : undefined, path: '/filing/agent/filed' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'My Filings', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/filing/notifications' },
      ];

  const isRootAdmin = user?.role === 'ADMIN' && (!activeOrgRole || activeOrgRole.systemRole === 'ADMIN');
  const navItems = filterNavItemsByPermissions(rawNavItems, sidebarPermissions, isRootAdmin);

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/filing/notifications')) return 'notifications';
    if (currentPath.includes('/filing/manager/staff')) return 'team';
    if (currentPath.includes('/filing/manager/queue')) return 'queue';
    if (currentPath.includes('/filing/manager')) return 'dashboard';

    // Filing Specialist items
    if (currentPath.includes('/filing/agent/pending')) return 'filing_pending';
    if (currentPath.includes('/filing/agent/on-hold')) return 'filing_on_hold';
    if (currentPath.includes('/filing/agent/rejected')) return 'filing_rejected';
    if (currentPath.includes('/filing/agent/filed')) return 'filing_filed';
    if (currentPath.includes('/filing/agent/queue') || currentPath.includes('/filing/agent/ready') || currentPath.includes('/filing/workspace')) return 'filing_ready';
    if (currentPath === '/filing/agent' || currentPath === '/filing/agent/') return 'filing_dashboard';
    return isManager ? 'dashboard' : 'filing_ready';
  };

  const activeId = getActiveId();

  const handleItemClick = (id: string) => {
    const target = navItems.find((n) => n.id === id);
    if (target?.path) {
      navigate(target.path);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans">
      {/* Sidebar - Matching Documenter, PrepReview, Sales, and Admin standard */}
      <AppSidebar
        width={240}
        variant="dark"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isManager ? 'Filing Manager Portal' : 'Filing Specialist Portal',
          logo: (
            <div className="w-7 h-7 rounded-md bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <UploadCloud className="w-4 h-4 text-white" />
            </div>
          ),
        }}
        items={navItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        showLogoutOnly={true}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-end px-6 bg-white border-b border-slate-200 shrink-0 gap-3">
          <NotificationBellPopover />

          {/* Reusable Header User Profile Pill */}
          <HeaderUserProfile />
        </header>

        {/* Dynamic Nested View */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
