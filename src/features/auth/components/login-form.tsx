import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiArrowRight,
} from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth-schemas';
import { checkClientRateLimit, resetClientRateLimit } from '@/lib/security';
import { LOGIN_RATE_LIMIT, AUTH_ROUTES } from '@/lib/constants';
import { safeRedirectPath } from '@/lib/utils';

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const limit = checkClientRateLimit(
      `login:${values.email}`,
      LOGIN_RATE_LIMIT.maxAttempts,
      LOGIN_RATE_LIMIT.windowMs
    );

    if (!limit.allowed) {
      const seconds = Math.ceil(limit.retryAfterMs / 1000);
      setCooldown(seconds);
      setError('root', {
        message: `Demasiados intentos. Espera ${seconds}s y vuelve a intentar.`,
      });
      setShakeKey((k) => k + 1);
      return;
    }

    const result = await signIn(values);

    if (!result.ok) {
      setError('root', { message: result.error });
      setShakeKey((k) => k + 1);
      return;
    }

    resetClientRateLimit(`login:${values.email}`);
    toast.success('Bienvenido de vuelta', {
      description: 'Sesión iniciada correctamente.',
    });
    const redirectTo = safeRedirectPath(params.get('returnTo'));
    navigate(redirectTo, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* ── Email ─────────────────────────── */}
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
        {errors.email && (
          <FieldError message={errors.email.message} />
        )}
      </div>

      {/* ── Password ──────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            to={AUTH_ROUTES.forgotPassword}
            className="text-xs text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
          >
            ¿La olvidaste?
          </Link>
        </div>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••••"
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
              {showPassword ? (
                <FiEyeOff className="h-4 w-4" />
              ) : (
                <FiEye className="h-4 w-4" />
              )}
            </button>
          }
          {...register('password')}
        />
        {errors.password && (
          <FieldError message={errors.password.message} />
        )}
      </div>

      {/* ── Error global ──────────────────── */}
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

      {/* ── Submit ────────────────────────── */}
      <Button
        type="submit"
        size="lg"
        className="group h-12 w-full rounded-xl text-base shadow-sm shadow-primary/20 transition-shadow hover:shadow-md hover:shadow-primary/30 sm:h-11 sm:text-sm"
        disabled={isSubmitting || cooldown > 0}
      >
        {isSubmitting ? (
          <>
            <ImSpinner8 className="h-4 w-4 animate-spin" />
            Entrando…
          </>
        ) : (
          <>
            Iniciar sesión
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>

      {/* ── Footer ────────────────────────── */}
      <p className="text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{' '}
        <Link
          to={AUTH_ROUTES.register}
          className="font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline"
        >
          Créala gratis
        </Link>
      </p>
    </form>
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
