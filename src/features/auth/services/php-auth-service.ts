import type { Session, User } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type {
  AuthActionResult,
  ResetPasswordInput,
  SignInCredentials,
  SignUpCredentials,
  UpdatePasswordInput,
} from '@/features/auth/types';

/**
 * Auth service que habla con el backend PHP (MySQL en GoDaddy).
 * Reemplaza a supabase cuando VITE_AUTH_BACKEND=php.
 *
 * Sesión = JWT access_token en localStorage. Sin refresh token por simplicidad
 * (si necesitas sesiones largas, agrega la tabla `refresh_tokens` y endpoints).
 */

const STORAGE_KEY = 'ilabtdi.php-session';
const API_BASE = env.VITE_API_URL || '/api';

type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT';
type AuthListener = (event: AuthEvent, session: Session | null) => void;

interface StoredSession {
  accessToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const listeners = new Set<AuthListener>();
let currentSession: Session | null = readSession();

function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredSession;
    if (stored.expiresAt * 1000 < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return toSession(stored);
  } catch {
    return null;
  }
}

function writeSession(stored: StoredSession | null): void {
  if (!stored) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }
}

function toSession(stored: StoredSession): Session {
  const user = {
    id: stored.user.id,
    email: stored.user.email,
    app_metadata: { provider: 'php' },
    user_metadata: {
      full_name: stored.user.full_name ?? '',
      avatar_url: stored.user.avatar_url,
    },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    identities: [],
    is_anonymous: false,
  } as unknown as User;

  return {
    access_token: stored.accessToken,
    refresh_token: '',
    expires_in: stored.expiresAt - Math.floor(Date.now() / 1000),
    expires_at: stored.expiresAt,
    token_type: 'bearer',
    user,
  };
}

function emit(event: AuthEvent, session: Session | null): void {
  listeners.forEach((cb) => cb(event, session));
}

interface ApiOk<T> { ok: true; [key: string]: unknown; data?: T }
interface ApiErr { ok: false; error: string; [key: string]: unknown }
type ApiResponse<T> = (ApiOk<T> & T) | ApiErr;

async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(currentSession?.access_token
        ? { Authorization: `Bearer ${currentSession.access_token}` }
        : {}),
      ...init.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (!res.ok && data.ok !== false) {
    return { ok: false, error: `HTTP ${res.status}` };
  }
  return data;
}

async function signIn({ email, password }: SignInCredentials): Promise<AuthActionResult> {
  type Body = { user: StoredSession['user']; access_token: string; expires_in: number };
  const result = await api<Body>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!result.ok) return { ok: false, error: result.error };

  const stored: StoredSession = {
    accessToken: result.access_token,
    expiresAt: Math.floor(Date.now() / 1000) + result.expires_in,
    user: result.user,
  };
  writeSession(stored);
  currentSession = toSession(stored);
  emit('SIGNED_IN', currentSession);
  return { ok: true, data: undefined };
}

async function signUp({ email, password, fullName }: SignUpCredentials): Promise<AuthActionResult> {
  type Body = { user: StoredSession['user']; access_token: string; expires_in: number };
  const result = await api<Body>('/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  if (!result.ok) return { ok: false, error: result.error };

  const stored: StoredSession = {
    accessToken: result.access_token,
    expiresAt: Math.floor(Date.now() / 1000) + result.expires_in,
    user: result.user,
  };
  writeSession(stored);
  currentSession = toSession(stored);
  emit('SIGNED_IN', currentSession);
  return { ok: true, data: undefined };
}

async function signOut(): Promise<AuthActionResult> {
  try {
    await api('/logout', { method: 'POST' });
  } catch (err) {
    logger.warn('php logout fetch failed', {
      err: err instanceof Error ? err.message : String(err),
    });
  }
  writeSession(null);
  currentSession = null;
  emit('SIGNED_OUT', null);
  return { ok: true, data: undefined };
}

async function requestPasswordReset({ email }: ResetPasswordInput): Promise<AuthActionResult> {
  // El backend siempre responde ok (no filtramos existencia).
  await api('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return { ok: true, data: undefined };
}

async function updatePassword({ password }: UpdatePasswordInput): Promise<AuthActionResult> {
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  if (!token) {
    return {
      ok: false,
      error: 'El enlace no incluye un token válido. Solicita uno nuevo.',
    };
  }
  const result = await api<{ message: string }>('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: undefined };
}

export async function verifyEmailToken(token: string): Promise<AuthActionResult> {
  const result = await api<{ verified: boolean }>('/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: undefined };
}

export async function resendVerification(email: string): Promise<AuthActionResult> {
  await api('/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return { ok: true, data: undefined };
}

async function getSession(): Promise<Session | null> {
  return currentSession;
}

export const phpAuthService = {
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  updatePassword,
  getSession,
};

export const phpSessionApi = {
  async getInitialSession(): Promise<Session | null> {
    return currentSession;
  },
  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    queueMicrotask(() => listener('INITIAL_SESSION', currentSession));
    return () => listeners.delete(listener);
  },
};
