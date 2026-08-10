import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useAuthStore } from './features/auth/store/auth-store';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

function App() {
  const { refreshUser } = useAuthStore();

  // Try to restore user session when the application loads
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0F172A',
            color: '#F8FAFC',
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif',
            borderRadius: '12px',
            border: '1px solid #1E293B',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#16A34A',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </>
  );
}

export default App;
