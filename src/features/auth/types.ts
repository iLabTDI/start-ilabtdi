import type { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

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

export type AuthActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
