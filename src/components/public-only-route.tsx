import { Navigate, Outlet, useSearchParams } from 'react-router';
import { useSession } from '@/lib/auth';
import { FullPageSpinner } from '@/components/loading-spinner';
import { APP_ROUTES } from '@/lib/constants';
import { safeRedirectPath } from '@/lib/utils';

export function PublicOnlyRoute() {
  const { initialized, isAuthenticated } = useSession();
  const [params] = useSearchParams();

  if (!initialized) {
    return <FullPageSpinner label="Cargando" />;
  }

  if (isAuthenticated) {
    const redirectTo = safeRedirectPath(params.get('returnTo'), APP_ROUTES.appHome);
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
