import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { authService, sessionApi } from '@/features/auth/services/auth-service';
import { logger } from '@/lib/logger';
import type {
  AuthActionResult,
  AuthState,
  ResetPasswordInput,
  SignInCredentials,
  SignUpCredentials,
  UpdatePasswordInput,
} from '@/features/auth/types';

interface AuthContextValue extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<AuthActionResult>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  resetPassword: (input: ResetPasswordInput) => Promise<AuthActionResult>;
  updatePassword: (input: UpdatePasswordInput) => Promise<AuthActionResult>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;

    void sessionApi.getInitialSession().then((initial) => {
      if (!mountedRef.current) return;
      setSession(initial);
      setUser(initial?.user ?? null);
      setInitialized(true);
    });

    const unsubscribe = sessionApi.subscribe((event, next) => {
      if (!mountedRef.current) return;
      logger.debug('auth event', { event });
      setSession(next);
      setUser(next?.user ?? null);
      setInitialized((prev) => prev || true);
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setLoading(true);
    try {
      return await authService.signIn(credentials);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setLoading(true);
    try {
      return await authService.signUp(credentials);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      if (result.ok) {
        setSession(null);
        setUser(null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    setLoading(true);
    try {
      return await authService.requestPasswordReset(input);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (input: UpdatePasswordInput) => {
    setLoading(true);
    try {
      return await authService.updatePassword(input);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      initialized,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [session, user, loading, initialized, signIn, signUp, signOut, resetPassword, updatePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
