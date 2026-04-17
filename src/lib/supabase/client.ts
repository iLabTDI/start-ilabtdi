import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import type { Database } from '@/types/database';

export type TypedSupabaseClient = SupabaseClient<Database>;

export const supabase: TypedSupabaseClient = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'ilabtdi.auth',
    },
    global: {
      headers: {
        'x-client-info': 'start-ilabtdi',
      },
    },
  }
);
