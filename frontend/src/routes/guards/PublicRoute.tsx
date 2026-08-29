import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { getRoleDefaultRoute } from '@/features/auth/utils/auth-redirect';

export const PublicRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-sans">
        <p className="text-sm font-bold animate-pulse text-slate-500">Authenticating session...</p>
      </div>
    );
  }

  // If user is already logged in, redirect them directly to their department workspace!
  if (isAuthenticated && user) {
    return <Navigate to={getRoleDefaultRoute(user.role)} replace />;
  }

  return <Outlet />;
};
