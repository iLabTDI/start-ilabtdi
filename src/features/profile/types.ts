import type { Profile } from '@/lib/supabase/types';

export type { Profile };

export interface ProfileUpdatePayload {
  fullName: string;
  avatarUrl: string | null;
}
