/**
 * Servicio de autenticación · el cerebro del login.
 *
 * Aquí vive TODO lo que hace signIn / signUp / signOut:
 *   - Cliente de Supabase (si usas Supabase)
 *   - Cliente HTTP al backend PHP (si usas MySQL en GoDaddy)
 *   - Modo demo con cuentas hardcodeadas (para presentaciones sin backend)
 *
 * La elección entre uno y otro se hace con VITE_AUTH_BACKEND en tu .env.
 * La UI (los formularios) no saben ni les importa qué backend se usa —
 * todos responden con el mismo shape: { ok: true } o { ok: false, error }.
 */

import { createClient, type Session, type User } from '@supabase/supabase-js';
import { env, authBackend, isDemoMode } from '@/lib/env';
import type {
  AuthActionResult,
  ResetPasswordInput,
  SignInCredentials,
  SignUpCredentials,
  UpdatePasswordInput,
} from '@/lib/auth';

/* ═══════════════════════════════════════════════════════════════
 *  Cliente de Supabase
 * ══════════════════════════════════════════════════════════════ */

export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'ilabtdi.auth',
  },
  global: {
    headers: { 'x-client-info': 'start-ilabtdi' },
  },
});

/* ═══════════════════════════════════════════════════════════════
 *  Tipos compartidos entre listeners y API
 * ══════════════════════════════════════════════════════════════ */

type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT';
type AuthListener = (event: AuthEvent, session: Session | null) => void;

interface AuthApi {
  signIn: (c: SignInCredentials) => Promise<AuthActionResult>;
  signUp: (c: SignUpCredentials) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  requestPasswordReset: (i: ResetPasswordInput) => Promise<AuthActionResult>;
  updatePassword: (i: UpdatePasswordInput) => Promise<AuthActionResult>;
  getSession: () => Promise<Session | null>;
}

interface SessionApi {
  getInitialSession: () => Promise<Session | null>;
  subscribe: (listener: AuthListener) => () => void;
}

/* ═══════════════════════════════════════════════════════════════
 *  Mensajes de error amigables
 * ══════════════════════════════════════════════════════════════ */

const GENERIC_ERROR = 'Credenciales inválidas. Verifica tu correo y contraseña.';

function humanize(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('email not confirmed')) {
    return 'Confirma tu correo desde el enlace que te enviamos antes de iniciar sesión.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
  }
  if (m.includes('invalid login credentials')) return GENERIC_ERROR;
  if (m.includes('user already registered')) {
    return 'Este correo ya está registrado. Inicia sesión o recupera tu contraseña.';
  }
  if (m.includes('password')) return 'La contraseña no cumple los requisitos mínimos.';
  return GENERIC_ERROR;
}

/* ═══════════════════════════════════════════════════════════════
 *  Backend: Supabase (default)
 * ══════════════════════════════════════════════════════════════ */

const supabaseAuth: AuthApi = {
  async signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: humanize(error.message) };
    return { ok: true, data: undefined };
  },

  async signUp({ email, password, fullName }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${env.VITE_APP_URL}/login`,
      },
    });
    if (error) return { ok: false, error: humanize(error.message) };
    return { ok: true, data: undefined };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) return { ok: false, error: 'No fue posible cerrar sesión. Intenta de nuevo.' };
    return { ok: true, data: undefined };
  },

  async requestPasswordReset({ email }) {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.VITE_APP_URL}/reset-password`,
    });
    // Nunca revelamos si el correo existe o no · retornamos ok siempre.
    return { ok: true, data: undefined };
  },

  async updatePassword({ password }) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: humanize(error.message) };
    return { ok: true, data: undefined };
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};

const supabaseSessions: SessionApi = {
  async getInitialSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  subscribe(listener) {
    const { data } = supabase.auth.onAuthStateChange((event, session) =>
      listener(event as AuthEvent, session)
    );
    return () => data.subscription.unsubscribe();
  },
};

/* ═══════════════════════════════════════════════════════════════
 *  Backend: Demo · cuentas hardcodeadas · no pega a ningún server
 * ══════════════════════════════════════════════════════════════ */

interface DemoAccount {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'member';
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { email: 'demo@ilabtdi.com', password: 'Demo2026!', fullName: 'Usuario Demo', role: 'member' },
  { email: 'admin@ilabtdi.com', password: 'Admin2026!', fullName: 'Admin iLab', role: 'admin' },
] as const;

const DEMO_STORAGE = 'ilabtdi.demo-session';
const demoListeners = new Set<AuthListener>();
let demoCurrent: Session | null = readDemo();

function readDemo(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed.expires_at && parsed.expires_at * 1000 < Date.now()) {
      window.localStorage.removeItem(DEMO_STORAGE);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeDemo(session: Session | null): void {
  if (typeof window === 'undefined') return;
  if (session) window.localStorage.setItem(DEMO_STORAGE, JSON.stringify(session));
  else window.localStorage.removeItem(DEMO_STORAGE);
}

function buildDemoSession(acc: DemoAccount): Session {
  const now = Math.floor(Date.now() / 1000);
  const user = {
    id: `demo-${acc.email.split('@')[0]}`,
    email: acc.email,
    app_metadata: { provider: 'demo', role: acc.role },
    user_metadata: { full_name: acc.fullName, avatar_url: null },
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
    access_token: `demo.${btoa(acc.email)}.token`,
    refresh_token: `demo.${btoa(acc.email)}.refresh`,
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: 'bearer',
    user,
  };
}

function emitDemo(event: AuthEvent, session: Session | null): void {
  demoListeners.forEach((cb) => cb(event, session));
}

const delay = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));

const demoAuth: AuthApi = {
  async signIn({ email, password }) {
    await delay();
    const acc = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!acc) {
      return { ok: false, error: 'Credenciales inválidas. Usa una cuenta del banner.' };
    }
    demoCurrent = buildDemoSession(acc);
    writeDemo(demoCurrent);
    emitDemo('SIGNED_IN', demoCurrent);
    return { ok: true, data: undefined };
  },

  async signUp() {
    await delay();
    return { ok: false, error: 'Modo demo: el registro está deshabilitado.' };
  },

  async signOut() {
    await delay(150);
    demoCurrent = null;
    writeDemo(null);
    emitDemo('SIGNED_OUT', null);
    return { ok: true, data: undefined };
  },

  async requestPasswordReset() {
    await delay();
    return { ok: true, data: undefined };
  },

  async updatePassword() {
    await delay();
    return { ok: false, error: 'Modo demo: no se pueden cambiar contraseñas hardcodeadas.' };
  },

  getSession() {
    return Promise.resolve(demoCurrent);
  },
};

const demoSessions: SessionApi = {
  getInitialSession() {
    return Promise.resolve(demoCurrent);
  },
  subscribe(listener) {
    demoListeners.add(listener);
    queueMicrotask(() => listener('INITIAL_SESSION', demoCurrent));
    return () => demoListeners.delete(listener);
  },
};

/* ═══════════════════════════════════════════════════════════════
 *  Backend: PHP · habla con tu backend en GoDaddy
 * ══════════════════════════════════════════════════════════════ */

const PHP_STORAGE = 'ilabtdi.php-session';
const phpListeners = new Set<AuthListener>();
let phpCurrent: Session | null = readPhp();

interface PhpStored {
  accessToken: string;
  expiresAt: number;
  user: { id: string; email: string; full_name: string | null; avatar_url: string | null };
}

function readPhp(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PHP_STORAGE);
    if (!raw) return null;
    const stored = JSON.parse(raw) as PhpStored;
    if (stored.expiresAt * 1000 < Date.now()) {
      window.localStorage.removeItem(PHP_STORAGE);
      return null;
    }
    return phpToSession(stored);
  } catch {
    return null;
  }
}

function writePhp(stored: PhpStored | null): void {
  if (typeof window === 'undefined') return;
  if (!stored) window.localStorage.removeItem(PHP_STORAGE);
  else window.localStorage.setItem(PHP_STORAGE, JSON.stringify(stored));
}

function phpToSession(stored: PhpStored): Session {
  const user = {
    id: stored.user.id,
    email: stored.user.email,
    app_metadata: { provider: 'php' },
    user_metadata: { full_name: stored.user.full_name ?? '', avatar_url: stored.user.avatar_url },
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

function emitPhp(event: AuthEvent, session: Session | null): void {
  phpListeners.forEach((cb) => cb(event, session));
}

interface ApiOk {
  ok: true;
  [key: string]: unknown;
}
interface ApiErr {
  ok: false;
  error: string;
}
type ApiResponse = ApiOk | ApiErr;

async function phpFetch(path: string, init: RequestInit = {}): Promise<ApiResponse> {
  const res = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(phpCurrent?.access_token ? { Authorization: `Bearer ${phpCurrent.access_token}` } : {}),
      ...init.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as ApiResponse;
  if (!res.ok && (data as ApiErr).ok !== false) {
    return { ok: false, error: `HTTP ${res.status}` };
  }
  return data;
}

const phpAuth: AuthApi = {
  async signIn({ email, password }) {
    const r = await phpFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) return { ok: false, error: r.error };

    const stored: PhpStored = {
      accessToken: r.access_token as string,
      expiresAt: Math.floor(Date.now() / 1000) + (r.expires_in as number),
      user: r.user as PhpStored['user'],
    };
    writePhp(stored);
    phpCurrent = phpToSession(stored);
    emitPhp('SIGNED_IN', phpCurrent);
    return { ok: true, data: undefined };
  },

  async signUp({ email, password, fullName }) {
    const r = await phpFetch('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (!r.ok) return { ok: false, error: r.error };

    const stored: PhpStored = {
      accessToken: r.access_token as string,
      expiresAt: Math.floor(Date.now() / 1000) + (r.expires_in as number),
      user: r.user as PhpStored['user'],
    };
    writePhp(stored);
    phpCurrent = phpToSession(stored);
    emitPhp('SIGNED_IN', phpCurrent);
    return { ok: true, data: undefined };
  },

  async signOut() {
    try {
      await phpFetch('/logout', { method: 'POST' });
    } catch {
      /* ignoramos · igual borramos la sesión local */
    }
    writePhp(null);
    phpCurrent = null;
    emitPhp('SIGNED_OUT', null);
    return { ok: true, data: undefined };
  },

  async requestPasswordReset({ email }) {
    await phpFetch('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { ok: true, data: undefined };
  },

  async updatePassword({ password }) {
    const token = new URLSearchParams(window.location.search).get('token') ?? '';
    if (!token) {
      return { ok: false, error: 'El enlace no incluye un token válido. Solicita uno nuevo.' };
    }
    const r = await phpFetch('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, data: undefined };
  },

  getSession() {
    return Promise.resolve(phpCurrent);
  },
};

const phpSessions: SessionApi = {
  getInitialSession() {
    return Promise.resolve(phpCurrent);
  },
  subscribe(listener) {
    phpListeners.add(listener);
    queueMicrotask(() => listener('INITIAL_SESSION', phpCurrent));
    return () => phpListeners.delete(listener);
  },
};

// Extras solo para el backend PHP (verificación de email).
// Las páginas de verify-email los importan directamente.
export async function verifyEmailToken(token: string): Promise<AuthActionResult> {
  const r = await phpFetch('/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, data: undefined };
}

export async function resendVerification(email: string): Promise<AuthActionResult> {
  await phpFetch('/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return { ok: true, data: undefined };
}

/* ═══════════════════════════════════════════════════════════════
 *  Selector · elige el backend según VITE_AUTH_BACKEND
 * ══════════════════════════════════════════════════════════════ */

function pick<T>(sbImpl: T, phpImpl: T, demoImpl: T): T {
  if (authBackend === 'php') return phpImpl;
  if (isDemoMode) return demoImpl;
  return sbImpl;
}

export const authService = pick(supabaseAuth, phpAuth, demoAuth);
export const sessionApi = pick(supabaseSessions, phpSessions, demoSessions);
