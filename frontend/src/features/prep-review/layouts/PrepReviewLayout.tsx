import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { HeaderUserProfile } from '@/shared/components/HeaderUserProfile';
import {
  Users,
  Calculator,
  LayoutDashboard,
  LayoutGrid,
  ShieldCheck,
  Bell,
  Clock,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { filterNavItemsByPermissions } from '@/shared/constants/sidebar-catalog';
import { getPreparerOrigin, getReviewerOrigin } from '../utils/preparer-origin';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import { prepReviewService } from '../services/prep-review-service';
import toast from 'react-hot-toast';

export const PrepReviewLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activeOrgRole, sidebarPermissions, logout } = useAuthStore();
  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

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
    user?.role === 'PREP_MANAGER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'SALES_MANAGER' ||
    user?.role === 'DOC_MANAGER';

  const isReviewerOnly = user?.role === 'TAX_REVIEWER';

  // Live badge counters for assigned leads
  const [prepCounts, setPrepCounts] = React.useState({
    working: 0,
    pending: 0,
    underReview: 0,
    completed: 0,
  });

  // Reviewer sidebar badges removed (client); counts kept in state in case they come back
  const [, setReviewerCounts] = React.useState({
    assigned: 0,
    pending: 0,
    revisions: 0,
    approved: 0,
  });

  React.useEffect(() => {
    if (isManager) return;

    async function loadPipelineCounts() {
      try {
        const res = await prepReviewService.getPipelineLeads({ limit: 150 });
        const all = res.leads || [];
        const myId = user?.id;
        const myEmail = user?.email?.toLowerCase().trim();

        // 1. Preparer Pipeline Counts
        const myLeads = all.filter((l) => {
          if (!l.assignedPreparer) return false;
          if (myId && l.assignedPreparer.id === myId) return true;
          if (myEmail && l.assignedPreparer.email?.toLowerCase().trim() === myEmail) return true;
          return false;
        });

        let working = 0;
        let pending = 0;
        let underReview = 0;
        let completed = 0;

        myLeads.forEach((lead) => {
          const isReverted =
            (lead.prepStage as any) === 'REVERTED_TO_DOC' ||
            (lead.prepStage as any) === 'REVERTED_TO_DOCUMENTER' ||
            lead.currentStage === 'DOC_OUTREACH' ||
            lead.taxDraftSummary?.status === 'REVERTED_TO_DOCUMENTER';
          const isApproved =
            !isReverted &&
            (lead.prepStage === 'QA_APPROVED' ||
              lead.taxDraftSummary?.status === 'QA_APPROVED' ||
              [
                'QA_APPROVED',
                'SALES_PITCH_QUEUE',
                'SALES_PITCHING',
                'FILING_QUEUE',
                'FILING_IN_PROGRESS',
                'FILING_SUCCESS',
              ].includes(lead.currentStage));
          const isRevision =
            !isReverted &&
            (lead.prepStage === 'QA_REVISION_REQUESTED' ||
              lead.currentStage === 'QA_REVISION_REQUESTED' ||
              lead.currentStage === 'CORRECTION_NEEDED' ||
              lead.taxDraftSummary?.status === 'REVISION_REQUESTED');
          const isSubmitted =
            !isReverted &&
            (lead.prepStage === 'QA_IN_REVIEW' ||
              lead.currentStage === 'QA_IN_REVIEW' ||
              lead.currentStage === 'QA_REVIEW_QUEUE' ||
              lead.taxDraftSummary?.status === 'SUBMITTED_FOR_QA');

          const hasStarted = Boolean((lead as any).prepStartedAt);
          const draftSummary = lead.taxDraftSummary as any;
          const hasDraftContent = Boolean(
            draftSummary?.status === 'DRAFTING' ||
              draftSummary?.w2Wages ||
              draftSummary?.grossIncome ||
              draftSummary?.updatedAt ||
              (draftSummary?.calculations && Object.keys(draftSummary.calculations).length > 0)
          );
          const isPendingItem =
            !isReverted && !isApproved && !isRevision && !isSubmitted && (lead.prepStage === 'PREP_ASSIGNED' || (!hasStarted && !hasDraftContent));

          if (isApproved) completed++;
          else if (isSubmitted) underReview++;
          else if (isPendingItem) pending++;
          else working++;

          if (isRevision && !isApproved && !isSubmitted) {
            working++;
          }
        });

        setPrepCounts({ working, pending, underReview, completed });

        // 2. Reviewer Pipeline Counts
        const myReviewLeads = all.filter((l) => {
          if (!l.assignedReviewer) return false;
          if (myId && l.assignedReviewer.id === myId) return true;
          if (myEmail && l.assignedReviewer.email?.toLowerCase().trim() === myEmail) return true;
          return false;
        });

        let revPending = 0;
        let revRevisions = 0;
        let revApproved = 0;

        myReviewLeads.forEach((lead) => {
          const isRevision =
            lead.prepStage === 'QA_REVISION_REQUESTED' ||
            lead.currentStage === 'QA_REVISION_REQUESTED' ||
            lead.currentStage === 'CORRECTION_NEEDED' ||
            lead.taxDraftSummary?.status === 'REVISION_REQUESTED';
          const isApproved =
            !isRevision &&
            (lead.prepStage === 'QA_APPROVED' ||
              lead.taxDraftSummary?.status === 'QA_APPROVED' ||
              Boolean(lead.taxDraftSummary?.qaApprovedByUserId) ||
              Boolean(lead.taxDraftSummary?.qaApprovedAt) ||
              [
                'QA_APPROVED',
                'SALES_PITCH_QUEUE',
                'SALES_PITCHING',
                'QUOTATION_SENT',
                'PAYMENT_PENDING',
                'PAID_AND_AUTHORIZED',
                'FILING_QUEUE',
                'FILING_IN_PROGRESS',
                'FILING_SUCCESS',
              ].includes(lead.currentStage));

          if (isRevision) {
            revRevisions++;
          } else if (isApproved) {
            revApproved++;
          } else {
            revPending++;
          }
        });

        setReviewerCounts({
          assigned: myReviewLeads.length,
          pending: revPending,
          revisions: revRevisions,
          approved: revApproved,
        });
      } catch {
        // ignore
      }
    }
    loadPipelineCounts();
  }, [isManager, user?.id, user?.email]);

  // Role-specific Navigation Items (Matching Preparer & Reviewer standards)
  const rawNavItems = isManager
    ? [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, section: 'Management', path: '/prep-review/manager' },
        { id: 'caseload', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', path: '/prep-review/manager/queue' },
        { id: 'staff', label: 'Staff Matrix & Capacity', icon: Users, section: 'Operations', path: '/prep-review/manager/staff' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Management', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/prep-review/notifications' },
      ]
    : isReviewerOnly
    ? [
        { id: 'specialist_hub', label: 'Dashboard', icon: LayoutDashboard, section: 'Reviewer Workspace', path: '/prep-review/dashboard' },
        { id: 'reviewer_assigned', label: 'Assigned Returns', icon: ShieldCheck, section: 'Active Operations', path: '/prep-review/reviewer' },
        { id: 'reviewer_pending', label: 'Pending Returns', icon: Clock, section: 'Active Operations', path: '/prep-review/reviewer/pending' },
        { id: 'reviewer_revisions', label: 'Revision Required', icon: RotateCcw, section: 'Active Operations', path: '/prep-review/reviewer/revisions' },
        { id: 'reviewer_approved', label: 'Approved Returns', icon: CheckCircle2, section: 'My Filings', path: '/prep-review/reviewer/approved' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'My Filings', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/prep-review/notifications' },
      ]
    : [
        { id: 'specialist_hub', label: 'Dashboard', icon: LayoutDashboard, section: 'Preparer Workspace', path: '/prep-review/dashboard' },
        { id: 'preparer_working', label: 'Return Preparation', icon: Calculator, section: 'Active Operations', badge: prepCounts.working ? String(prepCounts.working) : undefined, path: '/prep-review/preparer' },
        { id: 'preparer_pending', label: 'Pending Returns', icon: Clock, section: 'Active Operations', badge: prepCounts.pending ? String(prepCounts.pending) : undefined, path: '/prep-review/preparer/pending' },
        { id: 'preparer_under_review', label: 'Under Review', icon: ShieldCheck, section: 'Active Operations', badge: prepCounts.underReview ? String(prepCounts.underReview) : undefined, path: '/prep-review/preparer/under-review' },
        { id: 'preparer_completed', label: 'Completed Returns', icon: CheckCircle2, section: 'My Filings', badge: prepCounts.completed ? String(prepCounts.completed) : undefined, path: '/prep-review/preparer/completed' },
        ...(user?.role === 'ADMIN' ? [{ id: 'reviewer_assigned', label: 'Assigned Returns (QA)', icon: ShieldCheck, section: 'Active Operations', path: '/prep-review/reviewer' }] : []),
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'My Filings', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/prep-review/notifications' },
      ];

  const isRootAdmin = user?.role === 'ADMIN' && (!activeOrgRole || activeOrgRole.systemRole === 'ADMIN');
  const navItems = filterNavItemsByPermissions(rawNavItems, sidebarPermissions, isRootAdmin);

  const currentPath = location.pathname;

  const getActiveId = () => {
    if (currentPath.includes('/prep-review/notifications')) return 'notifications';
    if (currentPath.includes('/prep-review/manager/staff')) return 'staff';
    if (currentPath.includes('/prep-review/manager/queue')) return 'caseload';
    if (currentPath.includes('/prep-review/manager')) return 'dashboard';

    // Client / workspace screens highlight the page they were opened from
    if (currentPath.includes('/prep-review/preparer/client/') || currentPath.includes('/prep-review/preparer/workspace/')) {
      const origin = getPreparerOrigin(location.search);
      if (origin === 'pending') return 'preparer_pending';
      if (origin === 'under-review') return 'preparer_under_review';
      if (origin === 'completed') return 'preparer_completed';
      return 'preparer_working';
    }
    if (currentPath.includes('/prep-review/reviewer/client/') || currentPath.includes('/prep-review/reviewer/audit/') || currentPath.includes('/prep-review/reviewer/workspace/')) {
      const origin = getReviewerOrigin(location.search);
      if (origin === 'reviewer-pending') return 'reviewer_pending';
      if (origin === 'revisions') return 'reviewer_revisions';
      if (origin === 'approved') return 'reviewer_approved';
      return 'reviewer_assigned';
    }

    // Preparer paths
    if (currentPath.includes('/prep-review/preparer/pending')) return 'preparer_pending';
    if (currentPath.includes('/prep-review/preparer/under-review')) return 'preparer_under_review';
    if (currentPath.includes('/prep-review/preparer/completed')) return 'preparer_completed';
    if (currentPath.includes('/prep-review/preparer/working') || currentPath === '/prep-review/preparer' || currentPath.includes('/prep-review/preparer/client')) return 'preparer_working';

    // Reviewer paths
    if (currentPath.includes('/prep-review/reviewer/pending')) return 'reviewer_pending';
    if (currentPath.includes('/prep-review/reviewer/revisions')) return 'reviewer_revisions';
    if (currentPath.includes('/prep-review/reviewer/approved')) return 'reviewer_approved';
    if (currentPath.includes('/prep-review/reviewer/assigned') || currentPath === '/prep-review/reviewer' || currentPath.includes('/prep-review/reviewer/queue')) return 'reviewer_assigned';

    if (currentPath.includes('/prep-review/dashboard')) return 'specialist_hub';
    return isManager ? 'dashboard' : 'specialist_hub';
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
      {/* Sidebar - Matching Documenter standard */}
      <AppSidebar
        width={240}
        variant="dark"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isManager
            ? 'Prep Manager Portal'
            : user?.role === 'TAX_REVIEWER' || currentPath.startsWith('/prep-review/reviewer')
            ? 'Reviewer'
            : user?.role === 'TAX_PREPARER'
            ? 'Preparer'
            : 'Tax Specialist Portal',
          logo: (
            <div className="w-7 h-7 rounded-md bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <Calculator className="w-4 h-4 text-white" />
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
