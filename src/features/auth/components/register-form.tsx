import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiUser,
  FiArrowRight,
  FiAlertCircle,
  FiCheck,
} from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/auth-schemas';
import { evaluatePasswordStrength } from '@/lib/security';
import { AUTH_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password') ?? '';
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const onSubmit = async (values: RegisterFormValues) => {
    const result = await signUp({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
    });

    if (!result.ok) {
      setError('root', { message: result.error });
      setShakeKey((k) => k + 1);
      return;
    }

    toast.success('Cuenta creada', {
      description: 'Revisa tu correo para confirmar el registro.',
    });
    navigate(AUTH_ROUTES.login, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">Tu nombre</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="María Hernández"
          disabled={isSubmitting}
          aria-invalid={errors.fullName ? 'true' : 'false'}
          leftIcon={<FiUser className="h-4 w-4" />}
          {...register('fullName')}
        />
        {errors.fullName && <FieldError message={errors.fullName.message} />}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          disabled={isSubmitting}
          aria-invalid={errors.email ? 'true' : 'false'}
          leftIcon={<FiMail className="h-4 w-4" />}
          {...register('email')}
        />
        {errors.email && <FieldError message={errors.email.message} />}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Mínimo 10 caracteres"
          disabled={isSubmitting}
          aria-invalid={errors.password ? 'true' : 'false'}
          leftIcon={<FiLock className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />
        <PasswordStrengthMeter value={password} strength={strength} />
        {errors.password && <FieldError message={errors.password.message} />}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Repite la contraseña</Label>
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

      <TermsCheckbox
        register={register('acceptTerms')}
        error={errors.acceptTerms?.message}
      />

      {errors.root && (
        <div
          key={shakeKey}
          role="alert"
          className="flex animate-shake items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-snug">{errors.root.message}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="group h-12 w-full rounded-xl text-base shadow-sm shadow-primary/20 transition-shadow hover:shadow-md hover:shadow-primary/30 sm:h-11 sm:text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <ImSpinner8 className="h-4 w-4 animate-spin" />
            Creando cuenta…
          </>
        ) : (
          <>
            Crear cuenta
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link
          to={AUTH_ROUTES.login}
          className="font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

interface PasswordStrengthMeterProps {
  value: string;
  strength: ReturnType<typeof evaluatePasswordStrength>;
}

function PasswordStrengthMeter({ value, strength }: PasswordStrengthMeterProps) {
  if (!value) return null;

  const colors = [
    'from-destructive to-destructive',
    'from-destructive/80 to-destructive/80',
    'from-amber-500 to-amber-400',
    'from-primary/80 to-primary',
    'from-primary to-primary',
  ] as const;

  const labelColor = [
    'text-destructive',
    'text-destructive',
    'text-amber-400',
    'text-primary',
    'text-primary',
  ] as const;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 overflow-hidden rounded-full bg-border/60 transition-colors duration-300',
              i < strength.score && 'bg-gradient-to-r',
              i < strength.score && colors[strength.score]
            )}
          />
        ))}
      </div>
      <p className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Fuerza:{' '}
          <span className={cn('font-medium', labelColor[strength.score])}>
            {strength.label}
          </span>
        </span>
        {strength.suggestions[0] && (
          <span className="text-muted-foreground/70">· {strength.suggestions[0]}</span>
        )}
      </p>
    </div>
  );
}

interface TermsCheckboxProps {
  register: ReturnType<ReturnType<typeof useForm<RegisterFormValues>>['register']>;
  error?: string;
}

function TermsCheckbox({ register, error }: TermsCheckboxProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/30 p-3 text-sm transition-colors hover:bg-background/60">
        <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0">
          <input
            type="checkbox"
            className="peer h-4 w-4 cursor-pointer appearance-none rounded-[5px] border border-border bg-background transition-colors checked:border-primary checked:bg-primary"
            {...register}
          />
          <FiCheck className="pointer-events-none absolute left-0 top-0 h-4 w-4 scale-0 text-primary-foreground opacity-0 transition-[opacity,transform] peer-checked:scale-100 peer-checked:opacity-100" />
        </span>
        <span className="leading-snug text-muted-foreground">
          Acepto los{' '}
          <a
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            términos
          </a>{' '}
          y la{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            política de privacidad
          </a>
          .
        </span>
      </label>
      {error && <FieldError message={error} />}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex animate-fade-in-up items-center gap-1.5 text-xs text-destructive"
    >
      <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}
