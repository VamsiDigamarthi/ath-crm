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
import { SalesDepartmentScreen } from '@/features/sales/screens/SalesDepartmentScreen';
import { FilingDepartmentScreen } from '@/features/filing/screens/FilingDepartmentScreen';
import { AdminSettingsScreen } from '@/features/admin/screens/AdminSettingsScreen';
import { CustomerLayout } from '@/features/customer/layouts/CustomerLayout';
import { CustomerDashboardScreen } from '@/features/customer/screens/CustomerDashboardScreen';
import { CustomerOrganizerScreen } from '@/features/customer/screens/CustomerOrganizerScreen';
import { CustomerDocumentsScreen } from '@/features/customer/screens/CustomerDocumentsScreen';
import { CustomerBillingScreen } from '@/features/customer/screens/CustomerBillingScreen';
import { CustomerExpertScreen } from '@/features/customer/screens/CustomerExpertScreen';
import { UnauthorizedScreen } from '@/features/auth/screens/UnauthorizedScreen';

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

  // 2. Protected Routes (Common / Fallback Dashboard)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardScreen />,
      },
    ],
  },

  // 3. Super Admin Portal (/admin/*)
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
            element: <Navigate to="/prep-review/manager" replace />,
          },
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
