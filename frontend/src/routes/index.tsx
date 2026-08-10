import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { AdminScreen } from '@/features/dashboard/screens/AdminScreen';
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
      // Add more standard protected routes here (e.g., profile, settings)
    ],
  },

  // 3. Role-Based Protected Routes (Accessible ONLY to specific roles)
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AdminScreen />,
      },
      // Add more admin-only routes here
    ],
  },

  // 4. Common & Fallback Routes
  {
    path: '/unauthorized',
    element: <UnauthorizedScreen />,
  },
  {
    path: '*',
    // Redirect unknown routes to dashboard if logged in, otherwise ProtectedRoute handles the redirect to login
    element: <Navigate to="/dashboard" replace />,
  },
]);
