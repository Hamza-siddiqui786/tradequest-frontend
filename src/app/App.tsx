import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { Toaster } from './components/ui/sonner';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" theme="dark" />
    </>
  );
}

