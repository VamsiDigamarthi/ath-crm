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
import { DocumenterLayout } from '@/features/documenter/layouts/DocumenterLayout';
import { SalesDepartmentScreen } from '@/features/sales/screens/SalesDepartmentScreen';
import { FilingDepartmentScreen } from '@/features/filing/screens/FilingDepartmentScreen';
import { AdminSettingsScreen } from '@/features/admin/screens/AdminSettingsScreen';
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
        ],
      },
    ],
  },

  // 5. Common & Fallback Routes
  {
    path: '/unauthorized',
    element: <UnauthorizedScreen />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
