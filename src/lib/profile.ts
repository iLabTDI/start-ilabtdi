/**
 * Profile · hooks + servicio + tipos en un solo archivo.
 *
 * Contiene:
 *   - Tipos (Profile, ProfileUpdatePayload)
 *   - Funciones del servicio (fetchProfile, updateProfile, uploadAvatar)
 *   - Hooks de React Query (useProfile, useUpdateProfile, useUploadAvatar)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/auth-service';
import { useSession } from '@/lib/auth';
import { AVATAR_ALLOWED_MIMES, AVATAR_MAX_BYTES } from '@/lib/constants';

/* ═══════════════════════════════════════════════════════════════
 *  Tipos
 * ══════════════════════════════════════════════════════════════ */

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdatePayload {
  fullName: string;
  avatarUrl: string | null;
}

const AVATAR_BUCKET = 'avatars';

/* ═══════════════════════════════════════════════════════════════
 *  Servicio · hits directos a Supabase
 * ══════════════════════════════════════════════════════════════ */

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('fetchProfile failed', error);
    throw new Error('No fue posible cargar tu perfil.');
  }
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  payload: ProfileUpdatePayload
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: payload.fullName.trim() || null,
      avatar_url: payload.avatarUrl,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) {
    console.error('updateProfile failed', error);
    throw new Error('No fue posible actualizar tu perfil.');
  }
  return data as Profile;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error('La imagen es demasiado grande (máximo 2 MB).');
  }
  if (!AVATAR_ALLOWED_MIMES.includes(file.type as (typeof AVATAR_ALLOWED_MIMES)[number])) {
    throw new Error('Formato no soportado. Usa JPG, PNG o WebP.');
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: false, cacheControl: '3600' });

  if (uploadError) {
    console.error('avatar upload failed', uploadError);
    throw new Error('No fue posible subir la imagen.');
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/* ═══════════════════════════════════════════════════════════════
 *  Hooks de React Query
 * ══════════════════════════════════════════════════════════════ */

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string | undefined) => ['profile', userId] as const,
};

export function useProfile() {
  const { user } = useSession();
  return useQuery<Profile | null>({
    queryKey: profileKeys.detail(user?.id),
    queryFn: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
    enabled: Boolean(user?.id),
  });
}

export function useUpdateProfile() {
  const { user } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => {
      if (!user) throw new Error('No authenticated user');
      return updateProfile(user.id, payload);
    },
    onSuccess: (data) => {
      qc.setQueryData(profileKeys.detail(user?.id), data);
    },
  });
}

export function useUploadAvatar() {
  const { user } = useSession();
  return useMutation({
    mutationFn: (file: File) => {
      if (!user) throw new Error('No authenticated user');
      return uploadAvatar(user.id, file);
    },
  });
}
