import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AdminScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-blue-100 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Welcome to the secure admin area. Only users with the <strong>ADMIN</strong> role can access this page.
        </p>
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
          Back to Main Dashboard
        </Button>
      </div>
    </div>
  );
};
