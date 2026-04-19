import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/lib/profile';
import { FULL_NAME_MAX_LENGTH } from '@/lib/constants';
import { getInitials } from '@/lib/utils';

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre es muy corto')
    .max(FULL_NAME_MAX_LENGTH, `Máximo ${FULL_NAME_MAX_LENGTH} caracteres`),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const uploadMutation = useUploadAvatar();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '' },
  });

  useEffect(() => {
    if (profile) {
      reset({ fullName: profile.full_name ?? '' });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateMutation.mutateAsync({ fullName: values.fullName, avatarUrl });
      toast.success('Perfil actualizado');
      reset(values);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMutation.mutateAsync(file);
      setAvatarUrl(url);
      await updateMutation.mutateAsync({
        fullName: profile?.full_name ?? '',
        avatarUrl: url,
      });
      toast.success('Avatar actualizado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Cargando perfil…</div>;
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      noValidate
      className="space-y-6"
    >
      <div className="flex items-center gap-5">
        <Avatar className="border-border/60 h-20 w-20 border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
          <AvatarFallback className="text-lg">
            {getInitials(profile?.full_name ?? profile?.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <Camera className="h-4 w-4" strokeWidth={1.5} />
            )}
            Cambiar foto
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              void onFileChange(e);
            }}
          />
          <p className="text-muted-foreground mt-1 text-xs">JPG, PNG o WebP · máximo 2 MB</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          disabled={isSubmitting}
          aria-invalid={errors.fullName ? 'true' : 'false'}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p role="alert" className="text-destructive text-xs">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" value={profile?.email ?? ''} readOnly className="bg-muted/30" />
        <p className="text-muted-foreground text-xs">
          Para cambiar tu correo contacta al administrador del lab.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
