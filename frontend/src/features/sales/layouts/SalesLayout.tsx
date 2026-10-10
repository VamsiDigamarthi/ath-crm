import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { HeaderUserProfile } from '@/shared/components/HeaderUserProfile';
import {
  DollarSign,
  PhoneCall,
  LayoutDashboard,
  LayoutGrid,
  Users,
  Bell,
  Sparkles,
  Tag,
  Clock,
  RotateCcw,
  Hourglass,
  BadgeCheck,
} from 'lucide-react';
import { filterNavItemsByPermissions } from '@/shared/constants/sidebar-catalog';
import { salesService } from '../services/sales-service';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import toast from 'react-hot-toast';

export const SalesLayout: React.FC = () => {
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

  const isManager = user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN';

  const [queueBadgeCount, setQueueBadgeCount] = React.useState<number | null>(null);
  const [dualBadgeCount, setDualBadgeCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function loadBadge() {
      try {
        const res = await salesService.getPipelineLeads({ limit: 150 });
        const all = res.leads || [];
        const dualLeads = all.filter((l) => Boolean(l.isDualDocSalesRole || (l.taxDraftSummary as any)?.isDualDocSalesRole));
        const regularLeads = all.filter((l) => !Boolean(l.isDualDocSalesRole || (l.taxDraftSummary as any)?.isDualDocSalesRole));

        setDualBadgeCount(dualLeads.length);

        if (isManager) {
          setQueueBadgeCount(regularLeads.length);
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
  const rawNavItems = isManager
    ? [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Management', path: '/sales/manager' },
      { id: 'pipeline', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', badge: queueBadgeCount !== null ? String(queueBadgeCount) : undefined, path: '/sales/manager/queue' },
      { id: 'dual_role', label: 'Dual Doc + Sales', icon: Sparkles, section: 'Operations', badge: dualBadgeCount !== null ? String(dualBadgeCount) : undefined, path: '/sales/manager/dual-role' },
      { id: 'team', label: 'Staff Matrix & Capacity', icon: Users, section: 'Operations', path: '/sales/manager/team' },
      { id: 'coupons', label: 'Discount Coupons', icon: Tag, section: 'Management', path: '/sales/coupons' },
      { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Management', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/sales/notifications' },
    ]
    : [
      { id: 'agent_hub', label: 'Closer Hub', icon: LayoutDashboard, section: 'Closer Workspace', path: '/sales/agent' },
      { id: 'pitch_queue', label: 'My Leads', icon: PhoneCall, section: 'Active Operations', badge: queueBadgeCount !== null ? String(queueBadgeCount) : undefined, path: '/sales/agent/queue' },
      { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Closer Workspace', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/sales/notifications' },
    ];

  const isRootAdmin = user?.role === 'ADMIN' && (!activeOrgRole || activeOrgRole.systemRole === 'ADMIN');
  const permittedItems = filterNavItemsByPermissions(rawNavItems, sidebarPermissions, isRootAdmin);

  // The My Leads permission unlocks all five sales prospect pages
  const navItems = permittedItems.flatMap((item) =>
    item.id === 'pitch_queue'
      ? [
          { ...item, label: 'My Prospects' },
          { id: 'sales_pending', label: 'Pending Prospects', icon: Hourglass, section: item.section, path: '/sales/agent/pending' },
          { id: 'sales_callbacks', label: 'Scheduled Callbacks', icon: Clock, section: item.section, path: '/sales/agent/callbacks' },
          { id: 'sales_follow_ups', label: 'Follow-Ups', icon: RotateCcw, section: item.section, path: '/sales/agent/follow-ups' },
          { id: 'sales_converted', label: 'Converted Clients', icon: BadgeCheck, section: item.section, path: '/sales/agent/converted' },
        ]
      : [item]
  );

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/sales/notifications')) return 'notifications';
    if (currentPath.includes('/sales/coupons')) return 'coupons';
    if (currentPath.includes('/sales/manager/dual-role')) return 'dual_role';
    if (currentPath.includes('/sales/manager/team')) return 'team';
    if (currentPath.includes('/sales/manager/pitch') || currentPath.includes('/sales/manager/queue')) return 'pipeline';
    if (currentPath === '/sales/manager' || currentPath === '/sales/manager/') return 'dashboard';
    if (isManager && (currentPath.includes('/sales/agent/pitch') || currentPath.includes('/sales/pitch') || currentPath.includes('/sales/agent/queue'))) return 'pipeline';
    if (currentPath.includes('/sales/agent/pending')) return 'sales_pending';
    if (currentPath.includes('/sales/agent/callbacks')) return 'sales_callbacks';
    if (currentPath.includes('/sales/agent/follow-ups')) return 'sales_follow_ups';
    if (currentPath.includes('/sales/agent/converted')) return 'sales_converted';
    // Client / pitch screens highlight the page they were opened from (?from=)
    if (currentPath.includes('/sales/agent/client/') || currentPath.includes('/sales/agent/pitch')) {
      const from = new URLSearchParams(location.search).get('from');
      const byFrom: Record<string, string> = { pending: 'sales_pending', callbacks: 'sales_callbacks', 'follow-ups': 'sales_follow_ups', converted: 'sales_converted' };
      if (from && byFrom[from]) return byFrom[from];
      return 'pitch_queue';
    }
    if (currentPath.includes('/sales/agent/queue')) return 'pitch_queue';
    if (currentPath.includes('/sales/agent')) return 'agent_hub';
    return isManager ? 'pipeline' : 'pitch_queue';
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
      {/* Sidebar - Matching Documenter & PrepReview standard */}
      <AppSidebar
        width={240}
        variant="dark"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isManager ? 'Sales Manager Portal' : 'Sales Closer Portal',
          logo: (
            <div className="w-7 h-7 rounded-md bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <DollarSign className="w-4 h-4 text-white" />
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
