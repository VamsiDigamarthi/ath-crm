import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { AdminDashboardScreen } from '@/features/admin/screens/AdminDashboardScreen';
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

  // 3. Role-Based Protected Routes (Accessible ONLY to ADMIN role)
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AdminDashboardScreen />,
      },
      {
        path: '/admin/dashboard',
        element: <AdminDashboardScreen />,
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
