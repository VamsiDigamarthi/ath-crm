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
  RotateCcw,
  BadgeCheck,
} from 'lucide-react';
import { filingService } from '../services/filing-service';
import { filterNavItemsByPermissions } from '@/shared/constants/sidebar-catalog';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
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
          // Badge sits on "Ready for Filing": count only my returns that can be transmitted now
          const readyNow = myLeads.filter((l) => l.currentStage === 'FILING_QUEUE' && !l.filingHold?.onHold);
          setQueueBadgeCount(readyNow.length);
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
        { id: 'agent_hub', label: 'Filing Hub', icon: LayoutDashboard, section: 'Filing Workspace', path: '/filing/agent' },
        { id: 'agent_queue', label: 'Transmission Queue', icon: Send, section: 'Active Operations', badge: queueBadgeCount !== null ? String(queueBadgeCount) : undefined, path: '/filing/agent/queue' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Filing Workspace', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/filing/notifications' },
      ];

  const isRootAdmin = user?.role === 'ADMIN' && (!activeOrgRole || activeOrgRole.systemRole === 'ADMIN');
  const permittedItems = filterNavItemsByPermissions(rawNavItems, sidebarPermissions, isRootAdmin);

  // The Transmission Queue permission unlocks all five filing pages
  const navItems = permittedItems.flatMap((item) =>
    item.id === 'agent_queue'
      ? [
          { ...item, label: 'Ready for Filing' },
          { id: 'filing_pending', label: 'Filing Pending', icon: Clock, section: item.section, path: '/filing/agent/pending' },
          { id: 'filing_on_hold', label: 'Filing on Hold', icon: PauseCircle, section: item.section, path: '/filing/agent/on-hold' },
          { id: 'filing_returned', label: 'Returned Status', icon: RotateCcw, section: item.section, path: '/filing/agent/returned' },
          { id: 'filing_filed', label: 'Filed Returns', icon: BadgeCheck, section: item.section, path: '/filing/agent/filed' },
        ]
      : [item]
  );

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/filing/notifications')) return 'notifications';
    if (currentPath.includes('/filing/manager/staff')) return 'team';
    if (currentPath.includes('/filing/manager/queue') || currentPath.includes('/filing/manager/client')) return 'queue';
    if (currentPath.includes('/filing/manager')) return 'dashboard';
    if (currentPath.includes('/filing/agent/pending')) return 'filing_pending';
    if (currentPath.includes('/filing/agent/on-hold')) return 'filing_on_hold';
    if (currentPath.includes('/filing/agent/returned')) return 'filing_returned';
    if (currentPath.includes('/filing/agent/filed')) return 'filing_filed';
    // Workspace keeps the page it was opened from (?from=)
    if (currentPath.includes('/filing/workspace') || currentPath.includes('/filing/agent/client')) {
      if (isManager) return 'queue';
      const from = new URLSearchParams(location.search).get('from');
      const byFrom: Record<string, string> = { pending: 'filing_pending', 'on-hold': 'filing_on_hold', returned: 'filing_returned', filed: 'filing_filed' };
      return (from && byFrom[from]) || 'agent_queue';
    }
    if (currentPath.includes('/filing/agent/queue')) return 'agent_queue';
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

