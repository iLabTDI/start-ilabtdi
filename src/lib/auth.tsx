/**
 * Auth · todo en un solo archivo para que sea fácil seguir el flujo.
 *
 * Contiene:
 *   - Tipos (SignInCredentials, SignUpCredentials, etc.)
 *   - Schemas de Zod (loginSchema, registerSchema, …)
 *   - AuthContext + AuthProvider — pone la sesión disponible en toda la app
 *   - useAuth() — hook para hacer signIn/signOut desde los formularios
 *   - useSession() — hook de solo-lectura para saber si hay usuario
 *   - evaluatePasswordStrength — helper para la barrita del registro
 *
 * La lógica real de los backends (Supabase / PHP / Demo) vive en auth-service.ts.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { z } from 'zod';
import { authService, sessionApi } from '@/lib/auth-service';
import { PASSWORD_MIN_LENGTH, FULL_NAME_MAX_LENGTH } from '@/lib/constants';

/* ═══════════════════════════════════════════════════════════════
 *  Tipos
 * ══════════════════════════════════════════════════════════════ */

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  fullName: string;
}

export interface ResetPasswordInput {
  email: string;
}

export interface UpdatePasswordInput {
  password: string;
}

export type AuthActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/* ═══════════════════════════════════════════════════════════════
 *  Schemas de validación (Zod)
 * ══════════════════════════════════════════════════════════════ */

const emailSchema = z.string().trim().min(1, 'El correo es obligatorio').email('Correo no válido');

const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(128, 'Máximo 128 caracteres')
  .refine((v) => /[a-z]/.test(v), 'Incluye al menos una minúscula')
  .refine((v) => /[A-Z]/.test(v), 'Incluye al menos una mayúscula')
  .refine((v) => /\d/.test(v), 'Incluye al menos un número')
  .refine((v) => /[^A-Za-z0-9]/.test(v), 'Incluye al menos un símbolo');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'El nombre es muy corto')
      .max(FULL_NAME_MAX_LENGTH, `Máximo ${FULL_NAME_MAX_LENGTH} caracteres`),
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    acceptTerms: z.boolean().refine((v) => v === true, { message: 'Debes aceptar los términos' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/* ═══════════════════════════════════════════════════════════════
 *  Helper · fuerza de contraseña (para la barrita visual)
 * ══════════════════════════════════════════════════════════════ */

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'muy débil' | 'débil' | 'aceptable' | 'fuerte' | 'excelente';
  suggestions: string[];
}

export function evaluatePasswordStrength(pw: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (pw.length >= 10) score++;
  else suggestions.push('Usa al menos 10 caracteres');

  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  else suggestions.push('Combina mayúsculas y minúsculas');

  if (/\d/.test(pw)) score++;
  else suggestions.push('Incluye al menos un número');

  if (/[^A-Za-z0-9]/.test(pw)) score++;
  else suggestions.push('Añade un símbolo (!, @, #, etc.)');

  const clamped = Math.min(score, 4) as PasswordStrength['score'];
  const labels: Record<PasswordStrength['score'], PasswordStrength['label']> = {
    0: 'muy débil',
    1: 'débil',
    2: 'aceptable',
    3: 'fuerte',
    4: 'excelente',
  };
  return { score: clamped, label: labels[clamped], suggestions };
}

/* ═══════════════════════════════════════════════════════════════
 *  Context · sesión disponible en toda la app
 * ══════════════════════════════════════════════════════════════ */

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (c: SignInCredentials) => Promise<AuthActionResult>;
  signUp: (c: SignUpCredentials) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  resetPassword: (i: ResetPasswordInput) => Promise<AuthActionResult>;
  updatePassword: (i: UpdatePasswordInput) => Promise<AuthActionResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    void sessionApi.getInitialSession().then((initial) => {
      if (!mountedRef.current) return;
      setSession(initial);
      setUser(initial?.user ?? null);
      setInitialized(true);
    });

    const unsubscribe = sessionApi.subscribe((_event, next) => {
      if (!mountedRef.current) return;
      setSession(next);
      setUser(next?.user ?? null);
      setInitialized((prev) => prev || true);
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (c: SignInCredentials) => {
    setLoading(true);
    try {
      return await authService.signIn(c);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (c: SignUpCredentials) => {
    setLoading(true);
    try {
      return await authService.signUp(c);
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

  const resetPassword = useCallback(async (i: ResetPasswordInput) => {
    setLoading(true);
    try {
      return await authService.requestPasswordReset(i);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (i: UpdatePasswordInput) => {
    setLoading(true);
    try {
      return await authService.updatePassword(i);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      initialized,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [user, session, loading, initialized, signIn, signUp, signOut, resetPassword, updatePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ═══════════════════════════════════════════════════════════════
 *  Hooks
 * ══════════════════════════════════════════════════════════════ */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider />');
  return ctx;
}

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
