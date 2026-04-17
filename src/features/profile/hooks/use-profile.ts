import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/features/profile/services/profile-service';
import type { Profile, ProfileUpdatePayload } from '@/features/profile/types';
import { useSession } from '@/features/auth/hooks/use-session';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string | undefined) => ['profile', userId] as const,
};

export function useProfile() {
  const { user } = useSession();
  return useQuery<Profile | null>({
    queryKey: profileKeys.detail(user?.id),
    queryFn: () => (user ? profileService.getOwn(user.id) : Promise.resolve(null)),
    enabled: Boolean(user?.id),
  });
}

export function useUpdateProfile() {
  const { user } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => {
      if (!user) throw new Error('No authenticated user');
      return profileService.update(user.id, payload);
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
      return profileService.uploadAvatar(user.id, file);
    },
  });
}
