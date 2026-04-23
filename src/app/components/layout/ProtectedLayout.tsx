import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import { useMarketWebSocket } from '../../hooks/useMarketWebSocket';

export function ProtectedLayout() {
  const token = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  useMarketWebSocket(Boolean(token));

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
