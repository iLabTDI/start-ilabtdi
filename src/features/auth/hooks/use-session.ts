import { useAuth } from '@/features/auth/hooks/use-auth';

export function useSession() {
  const { session, user, loading, initialized } = useAuth();
  return {
    session,
    user,
    loading,
    initialized,
    isAuthenticated: Boolean(session),
  };
}
