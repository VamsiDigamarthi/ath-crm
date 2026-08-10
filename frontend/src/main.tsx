import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { useAuthStore } from './features/auth/store/auth-store.ts'

const Root = () => {
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <StrictMode>
      <App />
      <Toaster position="top-right" richColors />
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<Root />);
