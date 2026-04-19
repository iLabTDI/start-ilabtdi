import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiMail, FiArrowRight, FiArrowLeft, FiAlertCircle, FiSend } from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/auth';
import { AUTH_ROUTES } from '@/lib/constants';

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    await resetPassword(values);
    setSent(values.email);
  };

  if (sent) {
    return <SuccessState email={sent} onResend={() => setSent(null)} />;
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      noValidate
      className="space-y-5"
    >
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
          <p
            role="alert"
            className="animate-fade-in-up text-destructive flex items-center gap-1.5 text-xs"
          >
            <FiAlertCircle className="h-3.5 w-3.5" />
            {errors.email.message}
          </p>
        )}
        <p className="text-muted-foreground pt-1 text-xs">
          Te llegará un enlace para definir una nueva contraseña.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="group shadow-primary/20 hover:shadow-primary/30 h-12 w-full rounded-xl text-base shadow-sm transition-shadow hover:shadow-md sm:h-11 sm:text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <ImSpinner8 className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            <FiSend className="h-4 w-4" />
            Enviar enlace
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>

      <Link
        to={AUTH_ROUTES.login}
        className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-sm transition"
      >
        <FiArrowLeft className="h-3.5 w-3.5" />
        Volver al inicio de sesión
      </Link>
    </form>
  );
}

function SuccessState({ email, onResend }: { email: string; onResend: () => void }) {
  return (
    <div className="animate-fade-in-up space-y-6 text-center">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
        <div className="border-primary/30 bg-primary/10 text-primary relative flex h-16 w-16 items-center justify-center rounded-full border">
          <FiMail className="h-7 w-7" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Revisa tu correo</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Si existe una cuenta con <strong className="text-foreground">{email}</strong>, acabamos de
          enviarte un enlace para restablecer tu contraseña.
        </p>
        <p className="text-muted-foreground text-xs">
          El enlace expira en 1 hora. Revisa también el spam.
        </p>
      </div>

      <div className="grid gap-2">
        <Button asChild size="lg" className="h-11 rounded-xl">
          <Link to={AUTH_ROUTES.login}>Volver al inicio de sesión</Link>
        </Button>
        <button
          type="button"
          onClick={onResend}
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 transition hover:underline"
        >
          ¿No te llegó? Intentar con otro correo
        </button>
      </div>
    </div>
  );
}
