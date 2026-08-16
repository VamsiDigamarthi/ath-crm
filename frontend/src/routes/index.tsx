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
  
  // 2. Protected Routes (Accessible to ALL logged in users)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardScreen />,
      },
    ],
  },

  // 3. Role-Based Protected Routes (Accessible ONLY to ADMIN role with dedicated URL paths)
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

  // 4. Common & Fallback Routes
  {
    path: '/unauthorized',
    element: <UnauthorizedScreen />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
