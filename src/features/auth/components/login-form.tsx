import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
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
import { isDemoMode } from '@/lib/env';
import { DEMO_ACCOUNTS } from '@/features/auth/services/demo-auth-service';

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [cooldown, setCooldown] = useState<number>(0);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const doSignIn = async (values: LoginFormValues) => {
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
    void navigate(redirectTo, { replace: true });
  };

  const quickLogin = async (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    await doSignIn({ email, password });
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(doSignIn)(e);
      }}
      noValidate
      className="space-y-5"
    >
      {/* ── Demo quick-access ─────────────── */}
      {isDemoMode && <DemoQuickAccess onSelect={quickLogin} disabled={isSubmitting} />}

      {/* ── Email ─────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
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

      {/* ── Password ──────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            to={AUTH_ROUTES.forgotPassword}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 transition hover:underline"
          >
            ¿La olvidaste?
          </Link>
        </div>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Mínimo 10 caracteres"
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
        {errors.password && <FieldError message={errors.password.message} />}
      </div>

      {/* ── Remember me ───────────────────── */}
      <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
        <span className="relative inline-flex h-4 w-4 shrink-0">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="peer border-border bg-background/60 checked:border-primary checked:bg-primary h-4 w-4 cursor-pointer appearance-none rounded-[5px] border transition-colors"
          />
          <FiCheck className="text-primary-foreground pointer-events-none absolute top-0 left-0 h-4 w-4 scale-0 opacity-0 transition-[opacity,transform] peer-checked:scale-100 peer-checked:opacity-100" />
        </span>
        Recordarme en este dispositivo
      </label>

      {/* ── Error global ──────────────────── */}
      {errors.root && (
        <div
          key={shakeKey}
          role="alert"
          className="animate-shake border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm"
        >
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-snug">{errors.root.message}</p>
        </div>
      )}

      {/* ── Submit ────────────────────────── */}
      <Button
        type="submit"
        size="lg"
        className="h-11 w-full"
        disabled={isSubmitting || cooldown > 0}
      >
        {isSubmitting && <ImSpinner8 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
      </Button>

      {/* ── Divider ───────────────────────── */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border/50 w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card/60 text-muted-foreground/70 px-3 text-[11px] tracking-wider uppercase">
            o continúa con
          </span>
        </div>
      </div>

      {/* ── Social buttons (visuales · el dev los conecta después) ── */}
      <div className="grid grid-cols-2 gap-3">
        <SocialButton icon={<FcGoogle className="h-5 w-5" />} label="Google" />
        <SocialButton icon={<FaGithub className="h-5 w-5" />} label="GitHub" />
      </div>

      {/* ── Footer ────────────────────────── */}
      <p className="text-muted-foreground pt-2 text-center text-sm">
        ¿Aún no tienes cuenta?{' '}
        <Link
          to={AUTH_ROUTES.register}
          className="text-foreground hover:text-primary font-medium underline-offset-4 transition hover:underline"
        >
          Créala gratis
        </Link>
      </p>
    </form>
  );
}

/* ─── Quick-access en modo demo ─── */

interface DemoQuickAccessProps {
  onSelect: (email: string, password: string) => void | Promise<void>;
  disabled: boolean;
}

function DemoQuickAccess({ onSelect, disabled }: DemoQuickAccessProps) {
  return (
    <div className="border-primary/25 bg-primary/5 rounded-2xl border p-3">
      <p className="text-primary/80 mb-2 flex items-center gap-1.5 text-[11px] tracking-wider uppercase">
        <span className="bg-primary inline-block h-[5px] w-[5px] animate-pulse rounded-full" />
        Acceso rápido · demo
      </p>
      <div className="flex flex-wrap gap-2">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.email}
            type="button"
            disabled={disabled}
            onClick={() => {
              void onSelect(acc.email, acc.password);
            }}
            className="border-border/60 bg-background/50 hover:border-primary/50 hover:bg-background inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50"
          >
            <span className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
            Entrar como {acc.role}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Social button (visual · marca el "próximamente") ─── */

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
}

function SocialButton({ icon, label }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        toast.info(`${label} · próximamente`, {
          description: 'Conecta OAuth en src/features/auth/services/ cuando lo necesites.',
        })
      }
      className="border-border/60 bg-background/40 hover:border-border hover:bg-background/70 inline-flex h-10 items-center justify-center gap-2 rounded-full border text-sm font-medium transition active:scale-[0.98]"
    >
      {icon}
      <span>{label}</span>
    </button>
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
