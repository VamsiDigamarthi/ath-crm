import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { AdminLayout } from '@/features/admin/layouts/AdminLayout';
import { AdminOverviewScreen } from '@/features/admin/screens/AdminOverviewScreen';
import { BulkLeadImportScreen } from '@/features/admin/screens/BulkLeadImportScreen';
import { EmployeeManagementScreen } from '@/features/admin/screens/EmployeeManagementScreen';
import { DocumenterDepartmentScreen } from '@/features/documenter/screens/DocumenterDepartmentScreen';
import { DocumenterManagerDashboardScreen } from '@/features/documenter/screens/DocumenterManagerDashboardScreen';
import { ManagerScorecardsScreen } from '@/features/documenter/screens/ManagerScorecardsScreen';
import { ManagerQueueScreen } from '@/features/documenter/screens/ManagerQueueScreen';
import { DocumenterAgentDashboardScreen } from '@/features/documenter/screens/DocumenterAgentDashboardScreen';
import { DocumenterAgentQueueScreen } from '@/features/documenter/screens/DocumenterAgentQueueScreen';
import { DocumenterAgentCallbacksScreen } from '@/features/documenter/screens/DocumenterAgentCallbacksScreen';
import { DocumenterAgentPrepScreen } from '@/features/documenter/screens/DocumenterAgentPrepScreen';
import { Taxpayer360DetailScreen } from '@/features/documenter/screens/Taxpayer360DetailScreen';
import { DocumenterLayout } from '@/features/documenter/layouts/DocumenterLayout';
import { PrepReviewLayout } from '@/features/prep-review/layouts/PrepReviewLayout';
import { PrepManagerDashboardScreen } from '@/features/prep-review/screens/PrepManagerDashboardScreen';
import { PrepManagerQueueScreen } from '@/features/prep-review/screens/PrepManagerQueueScreen';
import { PrepStaffScorecardsScreen } from '@/features/prep-review/screens/PrepStaffScorecardsScreen';
import { TaxSpecialistDashboardScreen } from '@/features/prep-review/screens/TaxSpecialistDashboardScreen';
import { TaxPreparerQueueScreen } from '@/features/prep-review/screens/TaxPreparerQueueScreen';
import { TaxPreparerWorkspaceScreen } from '@/features/prep-review/screens/TaxPreparerWorkspaceScreen';
import { TaxReviewerQueueScreen } from '@/features/prep-review/screens/TaxReviewerQueueScreen';
import { TaxReviewerAuditScreen } from '@/features/prep-review/screens/TaxReviewerAuditScreen';
import { SalesLayout } from '@/features/sales/layouts/SalesLayout';
import { SalesManagerDashboardScreen } from '@/features/sales/screens/SalesManagerDashboardScreen';
import { SalesManagerQueueScreen } from '@/features/sales/screens/SalesManagerQueueScreen';
import { SalesTeamScorecardsScreen } from '@/features/sales/screens/SalesTeamScorecardsScreen';
import { SalesAgentDashboardScreen } from '@/features/sales/screens/SalesAgentDashboardScreen';
import { SalesAgentQueueScreen } from '@/features/sales/screens/SalesAgentQueueScreen';
import { SalesPitchWorkspaceScreen } from '@/features/sales/screens/SalesPitchWorkspaceScreen';
import { SalesDepartmentScreen } from '@/features/sales/screens/SalesDepartmentScreen';
import { FilingDepartmentScreen } from '@/features/filing/screens/FilingDepartmentScreen';
import { FilingLayout } from '@/features/filing/layouts/FilingLayout';
import { FilingManagerDashboardScreen } from '@/features/filing/screens/FilingManagerDashboardScreen';
import { FilingManagerQueueScreen } from '@/features/filing/screens/FilingManagerQueueScreen';
import { FilingStaffScorecardsScreen } from '@/features/filing/screens/FilingStaffScorecardsScreen';
import { FilingSpecialistDashboardScreen } from '@/features/filing/screens/FilingSpecialistDashboardScreen';
import { FilingSpecialistQueueScreen } from '@/features/filing/screens/FilingSpecialistQueueScreen';
import { FilingTransmissionWorkspaceScreen } from '@/features/filing/screens/FilingTransmissionWorkspaceScreen';
import { AdminSettingsScreen } from '@/features/admin/screens/AdminSettingsScreen';
import { CustomerLayout } from '@/features/customer/layouts/CustomerLayout';
import { CustomerDashboardScreen } from '@/features/customer/screens/CustomerDashboardScreen';
import { CustomerOrganizerScreen } from '@/features/customer/screens/CustomerOrganizerScreen';
import { CustomerDocumentsScreen } from '@/features/customer/screens/CustomerDocumentsScreen';
import { CustomerBillingScreen } from '@/features/customer/screens/CustomerBillingScreen';
import { CustomerExpertScreen } from '@/features/customer/screens/CustomerExpertScreen';
import { UnauthorizedScreen } from '@/features/auth/screens/UnauthorizedScreen';
import { NotificationCenterScreen } from '@/features/notifications/screens/NotificationCenterScreen';
import { useAuthStore } from '@/features/auth/store/auth-store';

/**
 * Smart redirect component: Navigates user to their role's layout-wrapped notification screen
 */
const NotificationRedirect: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === 'ADMIN') return <Navigate to="/admin/notifications" replace />;
  if (role === 'DOC_MANAGER' || role === 'DOC_TEAM_LEAD' || role === 'DOC_AGENT') {
    return <Navigate to="/documenter/notifications" replace />;
  }
  if (role === 'PREP_MANAGER' || role === 'TAX_REVIEWER' || role === 'TAX_PREPARER') {
    return <Navigate to="/prep-review/notifications" replace />;
  }
  if (role === 'SALES_MANAGER' || role === 'SALES_CLOSER' || role === 'SALES_AGENT') {
    return <Navigate to="/sales/notifications" replace />;
  }
  if (role === 'FILE_OP_MANAGER' || role === 'FILE_OP_TEAM_LEAD' || role === 'FILE_OP_AGENT') {
    return <Navigate to="/filing/notifications" replace />;
  }
  return <Navigate to="/customer/notifications" replace />;
};

export const router = createBrowserRouter([
  // 1. Public Routes (Accessible ONLY when NOT logged in)
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginScreen />,
      },
    ],
  },

  // 2. Protected Routes (Common / Fallback Dashboard & Smart Notification Redirect)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardScreen />,
      },
      {
        path: '/notifications',
        element: <NotificationRedirect />,
      },
    ],
  },

  // 3. Admin Portal (/admin/*)
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <AdminOverviewScreen />,
          },
          {
            path: 'prospects',
            element: <BulkLeadImportScreen />,
          },
          {
            path: 'employees',
            element: <EmployeeManagementScreen />,
          },
          {
            path: 'documenter',
            element: <DocumenterDepartmentScreen />,
          },
          {
            path: 'sales',
            element: <SalesDepartmentScreen />,
          },
          {
            path: 'filing',
            element: <FilingDepartmentScreen />,
          },
          {
            path: 'notifications',
            element: <NotificationCenterScreen />,
          },
          {
            path: 'settings',
            element: <AdminSettingsScreen />,
          },
        ],
      },
    ],
  },

  // 4. Documenter Department Portal (/documenter/*)
  {
    element: <ProtectedRoute allowedRoles={['ADMIN', 'DOC_MANAGER', 'DOC_TEAM_LEAD', 'DOC_AGENT']} />,
    children: [
      {
        path: '/documenter',
        element: <DocumenterLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/documenter/agent" replace />,
          },
          // Manager Routes
          {
            path: 'manager',
            element: <DocumenterManagerDashboardScreen />,
          },
          {
            path: 'manager/scorecards',
            element: <ManagerScorecardsScreen />,
          },
          {
            path: 'manager/queue',
            element: <ManagerQueueScreen />,
          },
          {
            path: 'notifications',
            element: <NotificationCenterScreen />,
          },
          // Calling Agent Routes
          {
            path: 'agent',
            element: <DocumenterAgentDashboardScreen />,
          },
          {
            path: 'agent/queue',
            element: <DocumenterAgentQueueScreen />,
          },
          {
            path: 'agent/callbacks',
            element: <DocumenterAgentCallbacksScreen />,
          },
          {
            path: 'agent/prep',
            element: <DocumenterAgentPrepScreen />,
          },
          {
            path: 'agent/lead/:id',
            element: <Taxpayer360DetailScreen />,
          },
          {
            path: 'lead/:id',
            element: <Taxpayer360DetailScreen />,
          },
        ],
      },
    ],
  },

  // 4b. Tax Prep & Review Operations Portal (/prep-review/*)
  {
    element: (
      <ProtectedRoute
        allowedRoles={['ADMIN', 'PREP_MANAGER', 'TAX_REVIEWER', 'TAX_PREPARER']}
      />
    ),
    children: [
      {
        path: '/prep-review',
        element: <PrepReviewLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/prep-review/dashboard" replace />,
          },
          // Manager Routes
          {
            path: 'manager',
            element: <PrepManagerDashboardScreen />,
          },
          {
            path: 'manager/queue',
            element: <PrepManagerQueueScreen />,
          },
          {
            path: 'manager/staff',
            element: <PrepStaffScorecardsScreen />,
          },
          // Specialist Unified Operations Dashboard
          {
            path: 'dashboard',
            element: <TaxSpecialistDashboardScreen />,
          },
          // Tax Preparer Routes
          {
            path: 'preparer',
            element: <TaxPreparerQueueScreen />,
          },
          {
            path: 'preparer/workspace/:id',
            element: <TaxPreparerWorkspaceScreen />,
          },
          // QA Compliance Reviewer Routes
          {
            path: 'reviewer',
            element: <TaxReviewerQueueScreen />,
          },
          {
            path: 'reviewer/audit/:id',
            element: <TaxReviewerAuditScreen />,
          },
          {
            path: 'notifications',
            element: <NotificationCenterScreen />,
          },
        ],
      },
    ],
  },

  // 4c. Sales Department Operations Portal (/sales/*)
  {
    element: (
      <ProtectedRoute
        allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_CLOSER', 'SALES_AGENT', 'DOC_MANAGER', 'PREP_MANAGER', 'TAX_REVIEWER', 'TAX_PREPARER', 'DOC_AGENT']}
      />
    ),
    children: [
      {
        path: '/sales',
        element: <SalesLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/sales/agent/queue" replace />,
          },
          // Manager Routes
          {
            path: 'manager',
            element: <SalesManagerDashboardScreen />,
          },
          {
            path: 'manager/queue',
            element: <SalesManagerQueueScreen />,
          },
          {
            path: 'manager/team',
            element: <SalesTeamScorecardsScreen />,
          },
          // Agent / Closer Routes
          {
            path: 'agent',
            element: <SalesAgentDashboardScreen />,
          },
          {
            path: 'agent/queue',
            element: <SalesAgentQueueScreen />,
          },
          {
            path: 'agent/pitch/:id',
            element: <SalesPitchWorkspaceScreen />,
          },
          {
            path: 'pitch/:id',
            element: <SalesPitchWorkspaceScreen />,
          },
          {
            path: 'notifications',
            element: <NotificationCenterScreen />,
          },
        ],
      },
    ],
  },

  // 4d. IRS Modernized e-File (MeF) Department Portal (/filing/*)
  {
    element: (
      <ProtectedRoute
        allowedRoles={['ADMIN', 'FILE_OP_MANAGER', 'FILE_OP_TEAM_LEAD', 'FILE_OP_AGENT', 'SALES_MANAGER', 'PREP_MANAGER', 'DOC_MANAGER', 'TAX_REVIEWER', 'TAX_PREPARER', 'SALES_CLOSER', 'SALES_AGENT', 'DOC_AGENT']}
      />
    ),
    children: [
      {
        path: '/filing',
        element: <FilingLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/filing/manager/queue" replace />,
          },
          // Manager Routes
          {
            path: 'manager',
            element: <FilingManagerDashboardScreen />,
          },
          {
            path: 'manager/queue',
            element: <FilingManagerQueueScreen />,
          },
          {
            path: 'manager/staff',
            element: <FilingStaffScorecardsScreen />,
          },
          // Specialist Routes
          {
            path: 'agent',
            element: <FilingSpecialistDashboardScreen />,
          },
          {
            path: 'agent/queue',
            element: <FilingSpecialistQueueScreen />,
          },
          {
            path: 'queue',
            element: <FilingSpecialistQueueScreen />,
          },
          {
            path: 'workspace/:id',
            element: <FilingTransmissionWorkspaceScreen />,
          },
          {
            path: 'notifications',
            element: <NotificationCenterScreen />,
          },
        ],
      },
    ],
  },

  // 5. Customer / Taxpayer Lifetime Portal (/customer/*)
  {
    element: <ProtectedRoute allowedRoles={['TAXPAYER_USER', 'ADMIN']} />,
    children: [
      {
        path: '/customer',
        element: <CustomerLayout />,
        children: [
          {
            index: true,
            element: <CustomerDashboardScreen />,
          },
          {
            path: 'organizer',
            element: <CustomerOrganizerScreen />,
          },
          {
            path: 'documents',
            element: <CustomerDocumentsScreen />,
          },
          {
            path: 'vault',
            element: <Navigate to="/customer/documents" replace />,
          },
          {
            path: 'billing',
            element: <CustomerBillingScreen />,
          },
          {
            path: 'notifications',
            element: <NotificationCenterScreen />,
          },
          {
            path: 'expert',
            element: <CustomerExpertScreen />,
          },
        ],
      },
    ],
  },

  // 6. Common & Fallback Routes
  {
    path: '/unauthorized',
    element: <UnauthorizedScreen />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
