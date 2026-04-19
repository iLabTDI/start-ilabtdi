import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEye, FiEyeOff, FiLock, FiAlertCircle, FiShield, FiArrowRight } from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAuth,
  resetPasswordSchema,
  evaluatePasswordStrength,
  type ResetPasswordFormValues,
} from '@/lib/auth';
import { AUTH_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function ResetPasswordForm() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password') ?? '';
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    const result = await updatePassword({ password: values.password });
    if (!result.ok) {
      setError('root', { message: result.error });
      setShakeKey((k) => k + 1);
      return;
    }
    toast.success('Contraseña actualizada', {
      description: 'Inicia sesión con tu nueva contraseña.',
    });
    void navigate(AUTH_ROUTES.login, { replace: true });
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      noValidate
      className="space-y-5"
    >
      <div className="border-border/60 bg-muted/30 text-muted-foreground flex items-start gap-3 rounded-xl border p-3 text-xs">
        <FiShield className="text-primary/70 mt-0.5 h-4 w-4 shrink-0" />
        <p className="leading-snug">
          Elige una contraseña distinta a las anteriores. Mínimo 10 caracteres con mayúscula,
          minúscula, número y símbolo.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••••"
          disabled={isSubmitting}
          aria-invalid={errors.password ? 'true' : 'false'}
          leftIcon={<FiLock className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:bg-accent hover:text-foreground grid h-8 w-8 place-items-center rounded-md transition"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />
        {password && <PasswordStrengthBar strength={strength} />}
        {errors.password && <FieldError message={errors.password.message} />}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Repítela</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          disabled={isSubmitting}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          leftIcon={<FiLock className="h-4 w-4" />}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <FieldError message={errors.confirmPassword.message} />}
      </div>

      {errors.root && (
        <div
          key={shakeKey}
          role="alert"
          className="animate-shake border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
        >
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-snug">{errors.root.message}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="group shadow-primary/20 hover:shadow-primary/30 h-12 w-full rounded-xl text-base shadow-sm transition-shadow hover:shadow-md sm:h-11 sm:text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <ImSpinner8 className="h-4 w-4 animate-spin" />
            Actualizando…
          </>
        ) : (
          <>
            Actualizar contraseña
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}

function PasswordStrengthBar({
  strength,
}: {
  strength: ReturnType<typeof evaluatePasswordStrength>;
}) {
  const colors = [
    'from-destructive to-destructive',
    'from-destructive/80 to-destructive/80',
    'from-amber-500 to-amber-400',
    'from-primary/80 to-primary',
    'from-primary to-primary',
  ] as const;

  return (
    <div className="flex gap-1 pt-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-border/60 h-1.5 flex-1 overflow-hidden rounded-full transition-colors duration-300',
            i < strength.score && 'bg-gradient-to-r',
            i < strength.score && colors[strength.score]
          )}
        />
      ))}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="animate-fade-in-up text-destructive flex items-center gap-1.5 text-xs"
    >
      <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}
