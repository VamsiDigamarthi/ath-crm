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
  Calendar,
  RotateCcw,
  CheckCircle2,
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
  const [salesCounts, setSalesCounts] = React.useState<{
    all?: number;
    pending?: number;
    callbacks?: number;
    followUps?: number;
    converted?: number;
  }>({});

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

          let pending = 0;
          let callbacks = 0;
          let followUps = 0;
          let converted = 0;

          myLeads.forEach((lead) => {
            const draftStatus = (lead.taxDraftSummary as any)?.status;
            const lastRevert = (lead.taxDraftSummary as any)?.lastRevert;
            const isReverted = (
              lead.currentStage === 'CORRECTION_NEEDED' ||
              lead.currentStage === 'DOC_OUTREACH' ||
              lead.currentStage === 'DOC_PREP' ||
              draftStatus === 'REVISION_REQUESTED' ||
              draftStatus === 'REVERTED_TO_DOCUMENTER' ||
              Boolean(lastRevert && !lastRevert.resolved)
            );
            if (isReverted) return;

            const isConverted = (
              lead.paymentStatus === 'PAID' ||
              lead.currentStage === 'PAID_AND_AUTHORIZED' ||
              lead.currentStage === 'FILING_QUEUE' ||
              lead.currentStage === 'FILING_IN_PROGRESS' ||
              lead.currentStage === 'FILING_SUCCESS' ||
              lead.clientPaymentStatus === 'PAID'
            );

            if (isConverted) {
              converted++;
              return;
            }

            const hasCallbackDate = Boolean(lead.callbackScheduledAt || (lead.taxDraftSummary as any)?.callbackScheduledAt);
            const hasCallbackDisposition = ['CALLBACK', 'SCHEDULED_CALLBACK', 'PITCH_CALLBACK'].includes(lead.callDisposition || '');
            const hasCallbackPitchStatus = lead.pitchStatus === 'NEED_CALL_WITH_CPA' || (lead.salesPitch?.pitchStatus === 'NEED_CALL_WITH_CPA');
            const notes = `${lead.closerCallNotes || ''} ${lead.notes || ''} ${lead.salesPitch?.comment || ''}`.toLowerCase();
            const hasCallbackNote = notes.includes('callback') || notes.includes('call back') || notes.includes('call at') || notes.includes('call tomorrow') || notes.includes('call scheduled');

            if (hasCallbackDate || hasCallbackDisposition || hasCallbackPitchStatus || hasCallbackNote) {
              callbacks++;
              return;
            }

            const hasQuoteSent = lead.currentStage === 'QUOTATION_SENT' || Boolean(lead.feeBreakdown?.isQuoted);
            const isPaymentPending = (
              lead.currentStage === 'PAYMENT_PENDING' ||
              lead.currentStage === 'SALES_PAYMENT_PENDING' ||
              lead.currentStage === 'SALES_ESIGN_PENDING' ||
              lead.paymentStatus === 'PAYMENT_LINK_SENT' ||
              lead.paymentStatus === 'PARTIALLY_PAID'
            );
            const hasNegotiation = (
              lead.pitchStatus === 'NEED_TIME' ||
              lead.pitchStatus === 'PRICING_ISSUE' ||
              lead.salesPitch?.pitchStatus === 'NEED_TIME' ||
              lead.salesPitch?.pitchStatus === 'PRICING_ISSUE' ||
              Boolean(lead.negotiatedAmount) ||
              (lead.feeBreakdown?.discountAmount || 0) > 0
            );
            const hasContactHistory = Boolean(lead.lastContactedAt || lead.closerCallNotes || (lead.closerNotesHistory && lead.closerNotesHistory.length > 0));

            if (hasQuoteSent || isPaymentPending || hasNegotiation || (lead.currentStage === 'SALES_PITCHING' && hasContactHistory)) {
              followUps++;
              return;
            }

            pending++;
          });

          setSalesCounts({
            all: myLeads.length,
            pending,
            callbacks,
            followUps,
            converted,
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
      { id: 'sales_agent_hub', label: 'Dashboard', icon: LayoutDashboard, section: 'Closer Workspace', path: '/sales/agent' },
      { id: 'sales_my_prospects', label: 'My Prospects (My leads)', icon: PhoneCall, section: 'Active Operations', badge: salesCounts.all ? String(salesCounts.all) : undefined, path: '/sales/agent/queue' },
      { id: 'sales_pending_prospects', label: 'Pending Prospects (pending Leads)', icon: Clock, section: 'Active Operations', badge: salesCounts.pending ? String(salesCounts.pending) : undefined, path: '/sales/agent/pending' },
      { id: 'sales_callbacks', label: 'Scheduled Callbacks', icon: Calendar, section: 'Active Operations', badge: salesCounts.callbacks ? String(salesCounts.callbacks) : undefined, path: '/sales/agent/callbacks' },
      { id: 'sales_follow_ups', label: 'Follow-Ups', icon: RotateCcw, section: 'Active Operations', badge: salesCounts.followUps ? String(salesCounts.followUps) : undefined, path: '/sales/agent/follow-ups' },
      { id: 'sales_converted', label: 'Converted Clients', icon: CheckCircle2, section: 'My Filings', badge: salesCounts.converted ? String(salesCounts.converted) : undefined, path: '/sales/agent/converted' },
      { id: 'notifications', label: 'Notifications', icon: Bell, section: 'My Filings', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/sales/notifications' },
    ];

  const isRootAdmin = user?.role === 'ADMIN' && (!activeOrgRole || activeOrgRole.systemRole === 'ADMIN');
  const navItems = filterNavItemsByPermissions(rawNavItems, sidebarPermissions, isRootAdmin);

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/sales/notifications')) return 'notifications';
    if (currentPath.includes('/sales/coupons')) return 'coupons';
    if (currentPath.includes('/sales/manager/dual-role')) return 'dual_role';
    if (currentPath.includes('/sales/manager/team')) return 'team';
    if (currentPath.includes('/sales/manager/pitch') || currentPath.includes('/sales/manager/queue')) return 'pipeline';
    if (currentPath === '/sales/manager' || currentPath === '/sales/manager/') return 'dashboard';

    if (isManager && (currentPath.includes('/sales/agent/pitch') || currentPath.includes('/sales/pitch') || currentPath.includes('/sales/agent/queue'))) return 'pipeline';

    // Closer items
    if (currentPath.includes('/sales/agent/pending')) return 'sales_pending_prospects';
    if (currentPath.includes('/sales/agent/callbacks')) return 'sales_callbacks';
    if (currentPath.includes('/sales/agent/follow-ups')) return 'sales_follow_ups';
    if (currentPath.includes('/sales/agent/converted')) return 'sales_converted';

    // Client / pitch screens highlight the page they were opened from (?from=)
    if (currentPath.includes('/sales/agent/client/') || currentPath.includes('/sales/agent/pitch')) {
      const from = new URLSearchParams(location.search).get('from');
      const byFrom: Record<string, string> = {
        pending: 'sales_pending_prospects',
        callbacks: 'sales_callbacks',
        'follow-ups': 'sales_follow_ups',
        converted: 'sales_converted',
        prospects: 'sales_my_prospects',
      };
      if (from && byFrom[from]) return byFrom[from];
      return 'sales_my_prospects';
    }

    if (currentPath.includes('/sales/agent/queue') || currentPath.includes('/sales/agent/prospects')) return 'sales_my_prospects';
    if (currentPath === '/sales/agent' || currentPath === '/sales/agent/') return 'sales_agent_hub';

    return isManager ? 'pipeline' : 'sales_my_prospects';
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
