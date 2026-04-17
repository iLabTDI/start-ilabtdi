import type { AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { GENERIC_AUTH_ERROR } from '@/lib/constants';
import { authBackend, env, isDemoMode } from '@/lib/env';
import { demoAuthService, demoSessionApi } from '@/features/auth/services/demo-auth-service';
import { phpAuthService, phpSessionApi } from '@/features/auth/services/php-auth-service';
import type {
  AuthActionResult,
  ResetPasswordInput,
  SignInCredentials,
  SignUpCredentials,
  UpdatePasswordInput,
} from '@/features/auth/types';

function resolveAuthError(error: AuthError, fallback = GENERIC_AUTH_ERROR): string {
  const msg = error.message.toLowerCase();
  if (msg.includes('email not confirmed')) {
    return 'Confirma tu correo desde el enlace que te enviamos antes de iniciar sesión.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
  }
  if (msg.includes('invalid login credentials')) return fallback;
  if (msg.includes('user already registered')) {
    return 'Este correo ya está registrado. Inicia sesión o recupera tu contraseña.';
  }
  if (msg.includes('password')) return 'La contraseña no cumple los requisitos mínimos.';
  return fallback;
}

const realAuthService = {
  async signIn({ email, password }: SignInCredentials): Promise<AuthActionResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.warn('signIn failed', { code: error.status });
      return { ok: false, error: resolveAuthError(error) };
    }
    return { ok: true, data: undefined };
  },

  async signUp({ email, password, fullName }: SignUpCredentials): Promise<AuthActionResult> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${env.VITE_APP_URL}/login`,
      },
    });
    if (error) {
      logger.warn('signUp failed', { code: error.status });
      return { ok: false, error: resolveAuthError(error) };
    }
    return { ok: true, data: undefined };
  },

  async signOut(): Promise<AuthActionResult> {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      logger.warn('signOut failed', { code: error.status });
      return { ok: false, error: 'No fue posible cerrar sesión. Intenta de nuevo.' };
    }
    return { ok: true, data: undefined };
  },

  async requestPasswordReset({ email }: ResetPasswordInput): Promise<AuthActionResult> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.VITE_APP_URL}/reset-password`,
    });
    if (error) logger.warn('resetPasswordForEmail failed', { code: error.status });
    return { ok: true, data: undefined };
  },

  async updatePassword({ password }: UpdatePasswordInput): Promise<AuthActionResult> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      logger.warn('updatePassword failed', { code: error.status });
      return {
        ok: false,
        error: resolveAuthError(error, 'No fue posible actualizar la contraseña.'),
      };
    }
    return { ok: true, data: undefined };
  },

  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) logger.warn('getSession failed', { code: error.status });
    return data.session;
  },
};

const realSessionApi = {
  async getInitialSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  subscribe(listener: (event: string, session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((event, session) => listener(event, session));
    return () => data.subscription.unsubscribe();
  },
};

function pick<T>(supabaseImpl: T, phpImpl: T, demoImpl: T): T {
  if (authBackend === 'php') return phpImpl;
  if (isDemoMode) return demoImpl;
  return supabaseImpl;
}

export const authService = pick(realAuthService, phpAuthService, demoAuthService);
export const sessionApi = pick(realSessionApi, phpSessionApi, demoSessionApi);
