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
  Hourglass,
  FileCheck2,
  RotateCcw,
  BadgeCheck,
} from 'lucide-react';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { filterNavItemsByPermissions } from '@/shared/constants/sidebar-catalog';
import { getPreparerOrigin, PREPARER_PAGES, getReviewerOrigin, REVIEWER_PAGES } from '../utils/preparer-origin';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
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

  const isManager = user?.role === 'PREP_MANAGER' || user?.role === 'ADMIN';

  // Role-specific Navigation Items (Matching Documenter standard)
  const rawNavItems = isManager
    ? [
        { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, section: 'Management', path: '/prep-review/manager' },
        { id: 'caseload', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', path: '/prep-review/manager/queue' },
        { id: 'staff', label: 'Staff Matrix & Capacity', icon: Users, section: 'Operations', path: '/prep-review/manager/staff' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Management', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/prep-review/notifications' },
      ]
    : [
        { id: 'specialist_hub', label: 'My Operations Hub', icon: LayoutDashboard, section: 'Specialist Workspace', path: '/prep-review/dashboard' },
        { id: 'preparer', label: 'Preparer Workbench', icon: Calculator, section: 'Active Operations', path: '/prep-review/preparer' },
        { id: 'reviewer', label: 'QA Audit Deck', icon: ShieldCheck, section: 'Active Operations', path: '/prep-review/reviewer' },
        { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Specialist Workspace', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/prep-review/notifications' },
      ];

  const isRootAdmin = user?.role === 'ADMIN' && (!activeOrgRole || activeOrgRole.systemRole === 'ADMIN');
  const permittedItems = filterNavItemsByPermissions(rawNavItems, sidebarPermissions, isRootAdmin);

  // The preparer workbench permission unlocks all four preparer pages
  const navItems = permittedItems.flatMap((item) =>
    item.id === 'preparer'
      ? [
          { ...item, label: 'Return Preparation' },
          { id: 'preparer_pending', label: 'Pending Returns', icon: Clock, section: item.section, path: '/prep-review/preparer/pending' },
          { id: 'preparer_review', label: 'Under Review', icon: Hourglass, section: item.section, path: '/prep-review/preparer/under-review' },
          { id: 'preparer_completed', label: 'Completed Returns', icon: FileCheck2, section: item.section, path: '/prep-review/preparer/completed' },
        ]
      : item.id === 'reviewer'
      ? [
          // The QA Audit Deck permission unlocks all four reviewer pages
          { ...item, label: 'Assigned Returns' },
          { id: 'reviewer_pending', label: 'Pending Returns', icon: Clock, section: item.section, path: '/prep-review/reviewer/pending' },
          { id: 'reviewer_revisions', label: 'Revision Required', icon: RotateCcw, section: item.section, path: '/prep-review/reviewer/revisions' },
          { id: 'reviewer_approved', label: 'Approved Returns', icon: BadgeCheck, section: item.section, path: '/prep-review/reviewer/approved' },
        ]
      : [item]
  );

  const currentPath = location.pathname;
  const getActiveId = () => {
    if (currentPath.includes('/prep-review/notifications')) return 'notifications';
    if (currentPath.includes('/prep-review/manager/staff')) return 'staff';
    if (currentPath.includes('/prep-review/manager/queue')) return 'caseload';
    if (currentPath.includes('/prep-review/manager')) return 'dashboard';
    if (currentPath.includes('/prep-review/dashboard')) return 'specialist_hub';
    // Client / workspace screens highlight the page they were opened from
    if (currentPath.includes('/prep-review/preparer/client/') || currentPath.includes('/prep-review/preparer/workspace/')) {
      const origin = getPreparerOrigin(location.search);
      if (origin) return PREPARER_PAGES[origin].navId;
    }
    if (currentPath.includes('/prep-review/reviewer/client/') || currentPath.includes('/prep-review/reviewer/audit/') || currentPath.includes('/prep-review/reviewer/workspace/')) {
      const origin = getReviewerOrigin(location.search);
      if (origin) return REVIEWER_PAGES[origin].navId;
    }
    if (currentPath.includes('/prep-review/reviewer/pending')) return 'reviewer_pending';
    if (currentPath.includes('/prep-review/reviewer/revisions')) return 'reviewer_revisions';
    if (currentPath.includes('/prep-review/reviewer/approved')) return 'reviewer_approved';
    if (currentPath.includes('/prep-review/preparer/pending')) return 'preparer_pending';
    if (currentPath.includes('/prep-review/preparer/under-review')) return 'preparer_review';
    if (currentPath.includes('/prep-review/preparer/completed')) return 'preparer_completed';
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
            : user?.role === 'TAX_REVIEWER'
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
