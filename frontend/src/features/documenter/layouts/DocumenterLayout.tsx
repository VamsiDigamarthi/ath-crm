import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { HeaderUserProfile } from '@/shared/components/HeaderUserProfile';
import {
  Users,
  Headphones,
  LayoutDashboard,
  LayoutGrid,
  PhoneCall,
  Clock,
  RotateCcw,
  FileCheck2,
  Bell,
  Globe,
} from 'lucide-react';
import { NotificationBellPopover } from '@/features/notifications/components/NotificationBellPopover';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import toast from 'react-hot-toast';

export const DocumenterLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
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

  const isManager = user?.role === 'DOC_MANAGER' || user?.role === 'ADMIN';

  // Role-specific Navigation Items
  const navItems = isManager
    ? [
      { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, section: 'Management', path: '/documenter/manager' },
      { id: 'self_signups', label: 'Direct Sign-ups', icon: Globe, section: 'Operations', path: '/documenter/manager/self-signups' },
      { id: 'caseload', label: 'Department Queue', icon: LayoutGrid, section: 'Operations', path: '/documenter/manager/queue' },
      { id: 'scorecards', label: 'Agent Scorecards', icon: Users, section: 'Operations', path: '/documenter/manager/scorecards' },
      // { id: 'audit_logs', label: 'Audit logs', icon: History, section: 'Operations', path: '/documenter/manager/audit-logs' },
      { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Management', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/documenter/notifications' },
    ]
    : [
      { id: 'agent_dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Calling Workspace', path: '/documenter/agent' },
      { id: 'agent_queue', label: 'My Calling', icon: PhoneCall, section: 'Calling Workspace', path: '/documenter/agent/queue' },
      { id: 'agent_callbacks', label: 'Scheduled Callbacks', icon: Clock, section: 'Calling Workspace', path: '/documenter/agent/callbacks' },
      { id: 'agent_fallback', label: 'Fallback Leads', icon: RotateCcw, section: 'Calling Workspace', path: '/documenter/agent/fallback' },
      { id: 'agent_documents', label: 'My Documents', icon: FileCheck2, section: 'Intake Pipeline', path: '/documenter/agent/documents' },
      // { id: 'audit_logs', label: 'Audit logs', icon: History, section: 'Intake Pipeline', path: '/documenter/agent/audit-logs' },
      { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Calling Workspace', badge: unreadCount > 0 ? String(unreadCount) : undefined, path: '/documenter/notifications' },
    ];

  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const fromQuery = searchParams.get('from');
  const locationState = location.state as { from?: string } | null;

  // Track the last active tab in sessionStorage whenever user is on a top-level route
  React.useEffect(() => {
    if (currentPath.includes('/documenter/agent/documents') || currentPath.includes('/documenter/agent/prep')) {
      sessionStorage.setItem('doc_last_tab', 'agent_documents');
    } else if (currentPath.includes('/documenter/agent/queue')) {
      sessionStorage.setItem('doc_last_tab', 'agent_queue');
    } else if (currentPath.includes('/documenter/agent/callbacks')) {
      sessionStorage.setItem('doc_last_tab', 'agent_callbacks');
    } else if (currentPath.includes('/documenter/agent/fallback')) {
      sessionStorage.setItem('doc_last_tab', 'agent_fallback');
    } else if (currentPath.includes('/audit-logs')) {
      sessionStorage.setItem('doc_last_tab', 'audit_logs');
    } else if (currentPath.includes('/documenter/notifications')) {
      sessionStorage.setItem('doc_last_tab', 'notifications');
    } else if (currentPath === '/documenter/agent' || currentPath === '/documenter/agent/') {
      sessionStorage.setItem('doc_last_tab', 'agent_dashboard');
    } else if (currentPath.includes('/documenter/manager/queue')) {
      sessionStorage.setItem('doc_last_tab', 'caseload');
    } else if (currentPath.includes('/documenter/manager/self-signups')) {
      sessionStorage.setItem('doc_last_tab', 'self_signups');
    } else if (currentPath.includes('/documenter/manager/scorecards')) {
      sessionStorage.setItem('doc_last_tab', 'scorecards');
    } else if (currentPath === '/documenter/manager' || currentPath === '/documenter/manager/') {
      sessionStorage.setItem('doc_last_tab', 'dashboard');
    }
  }, [currentPath]);

  const getActiveId = () => {
    if (currentPath.includes('/audit-logs')) return 'audit_logs';
    if (currentPath.includes('/documenter/notifications')) return 'notifications';
    if (currentPath.includes('/documenter/manager/scorecards')) return 'scorecards';
    if (currentPath.includes('/documenter/manager/self-signups')) return 'self_signups';
    if (currentPath.includes('/documenter/manager/queue')) return 'caseload';
    if (currentPath === '/documenter/manager' || currentPath === '/documenter/manager/') return 'dashboard';
    if (currentPath.includes('/documenter/agent/queue')) return 'agent_queue';
    if (currentPath.includes('/documenter/agent/callbacks')) return 'agent_callbacks';
    if (currentPath.includes('/documenter/agent/fallback')) return 'agent_fallback';
    if (currentPath.includes('/documenter/agent/documents') || currentPath.includes('/documenter/agent/prep')) return 'agent_documents';
    if (currentPath === '/documenter/agent' || currentPath === '/documenter/agent/') return 'agent_dashboard';

    // When viewing a lead detail screen (/documenter/agent/lead/:id or /documenter/lead/:id)
    if (currentPath.includes('/lead/')) {
      if (fromQuery === 'documents' || fromQuery === 'agent_documents') return 'agent_documents';
      if (fromQuery === 'queue' || fromQuery === 'agent_queue') return 'agent_queue';
      if (fromQuery === 'callbacks' || fromQuery === 'agent_callbacks') return 'agent_callbacks';
      if (fromQuery === 'fallback' || fromQuery === 'agent_fallback') return 'agent_fallback';
      if (fromQuery === 'audit_logs' || fromQuery === 'audit-logs') return 'audit_logs';
      if (fromQuery === 'caseload') return 'caseload';

      if (locationState?.from) {
        if (locationState.from === 'documents' || locationState.from === 'agent_documents') return 'agent_documents';
        if (locationState.from === 'queue' || locationState.from === 'agent_queue') return 'agent_queue';
        if (locationState.from === 'callbacks' || locationState.from === 'agent_callbacks') return 'agent_callbacks';
        if (locationState.from === 'fallback' || locationState.from === 'agent_fallback') return 'agent_fallback';
        if (locationState.from === 'audit_logs') return 'audit_logs';
        if (locationState.from === 'caseload') return 'caseload';
      }

      const rememberedTab = sessionStorage.getItem('doc_last_tab');
      if (rememberedTab) return rememberedTab;

      return isManager ? 'caseload' : 'agent_documents';
    }

    if (currentPath.includes('/documenter/agent')) return 'agent_dashboard';
    return isManager ? 'dashboard' : 'agent_dashboard';
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
      {/* Documenter Department Sidebar */}
      <AppSidebar
        width={240}
        variant="dark"
        accentColor="#16A34A"
        brand={{
          title: 'TaxCRM Engine',
          subtitle: isManager ? 'Doc Manager Portal' : 'Calling Agent Portal',
          logo: (
            <div className="w-7 h-7 rounded-md bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <Headphones className="w-4 h-4 text-white" />
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC] min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-end px-6 bg-white border-b border-slate-200 shrink-0 gap-3">
          <NotificationBellPopover />

          {/* Reusable Header User Profile Pill */}
          <HeaderUserProfile />
        </header>

        {/* Dynamic Screen Outlet */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
