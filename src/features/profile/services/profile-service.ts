import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { AVATAR_ALLOWED_MIMES, AVATAR_MAX_BYTES } from '@/lib/constants';
import type { Profile, ProfileUpdatePayload } from '@/features/profile/types';

const AVATAR_BUCKET = 'avatars';

export const profileService = {
  async getOwn(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      logger.error('profileService.getOwn failed', { code: error.code });
      throw new Error('No fue posible cargar tu perfil.');
    }
    return data;
  },

  async update(userId: string, payload: ProfileUpdatePayload): Promise<Profile> {
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
      logger.error('profileService.update failed', { code: error?.code });
      throw new Error('No fue posible actualizar tu perfil.');
    }
    return data;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
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
      logger.error('avatar upload failed', { code: uploadError.message });
      throw new Error('No fue posible subir la imagen.');
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};
