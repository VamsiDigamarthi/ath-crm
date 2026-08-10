import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4">
      <h1 className="text-6xl font-bold text-red-600">403</h1>
      <h2 className="text-2xl font-semibold">Access Denied</h2>
      <p className="text-gray-600 text-center max-w-md">
        You do not have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.
      </p>
      <div className="flex gap-4 mt-4">
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    </div>
  );
};
