import type { Session, User } from '@supabase/supabase-js';
import type {
  AuthActionResult,
  ResetPasswordInput,
  SignInCredentials,
  SignUpCredentials,
  UpdatePasswordInput,
} from '@/features/auth/types';

const STORAGE_KEY = 'ilabtdi.demo-session';

interface DemoAccount {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'member';
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: 'demo@ilabtdi.com',
    password: 'Demo2026!',
    fullName: 'Usuario Demo',
    role: 'member',
  },
  {
    email: 'admin@ilabtdi.com',
    password: 'Admin2026!',
    fullName: 'Admin iLab',
    role: 'admin',
  },
] as const;

type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT';
type AuthListener = (event: AuthEvent, session: Session | null) => void;

const listeners = new Set<AuthListener>();
let currentSession: Session | null = readStoredSession();

function buildSession(account: DemoAccount): Session {
  const now = Math.floor(Date.now() / 1000);
  const user = {
    id: `demo-${account.email.split('@')[0]}`,
    email: account.email,
    app_metadata: { provider: 'demo', role: account.role },
    user_metadata: { full_name: account.fullName, avatar_url: null },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date(now * 1000).toISOString(),
    updated_at: new Date(now * 1000).toISOString(),
    email_confirmed_at: new Date(now * 1000).toISOString(),
    phone: '',
    confirmation_sent_at: undefined,
    recovery_sent_at: undefined,
    last_sign_in_at: new Date(now * 1000).toISOString(),
    factors: undefined,
    identities: [],
    is_anonymous: false,
  } as unknown as User;

  return {
    access_token: `demo.${btoa(account.email)}.token`,
    refresh_token: `demo.${btoa(account.email)}.refresh`,
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: 'bearer',
    user,
  };
}

function readStoredSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed.expires_at && parsed.expires_at * 1000 < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredSession(session: Session | null): void {
  if (typeof window === 'undefined') return;
  if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEY);
}

function emit(event: AuthEvent, session: Session | null): void {
  listeners.forEach((cb) => cb(event, session));
}

async function delay(ms = 250): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const demoAuthService = {
  async signIn({ email, password }: SignInCredentials): Promise<AuthActionResult> {
    await delay();
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) {
      return {
        ok: false,
        error: 'Credenciales inválidas. Revisa el banner con las cuentas demo.',
      };
    }
    currentSession = buildSession(account);
    writeStoredSession(currentSession);
    emit('SIGNED_IN', currentSession);
    return { ok: true, data: undefined };
  },

  async signUp(_credentials: SignUpCredentials): Promise<AuthActionResult> {
    await delay();
    return {
      ok: false,
      error:
        'Modo demo: el registro está deshabilitado. Usa una cuenta demo del banner para entrar.',
    };
  },

  async signOut(): Promise<AuthActionResult> {
    await delay(150);
    currentSession = null;
    writeStoredSession(null);
    emit('SIGNED_OUT', null);
    return { ok: true, data: undefined };
  },

  async requestPasswordReset(_input: ResetPasswordInput): Promise<AuthActionResult> {
    await delay();
    return { ok: true, data: undefined };
  },

  async updatePassword(_input: UpdatePasswordInput): Promise<AuthActionResult> {
    await delay();
    return {
      ok: false,
      error: 'Modo demo: no se pueden cambiar contraseñas de cuentas hardcodeadas.',
    };
  },

  async getSession(): Promise<Session | null> {
    return currentSession;
  },
};

export const demoSessionApi = {
  async getInitialSession(): Promise<Session | null> {
    return currentSession;
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    queueMicrotask(() => listener('INITIAL_SESSION', currentSession));
    return () => listeners.delete(listener);
  },
};
