import { Navigate, Outlet, useLocation } from 'react-router';
import { useSession } from '@/features/auth/hooks/use-session';
import { FullPageSpinner } from '@/components/common/loading-spinner';
import { AUTH_ROUTES } from '@/lib/constants';

export function ProtectedRoute() {
  const { initialized, isAuthenticated } = useSession();
  const location = useLocation();

  if (!initialized) {
    return <FullPageSpinner label="Verificando sesión" />;
  }

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${AUTH_ROUTES.login}?returnTo=${returnTo}`} replace />;
  }

  return <Outlet />;
}
