import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/800.css'
import '@fontsource/poppins/900.css'
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
