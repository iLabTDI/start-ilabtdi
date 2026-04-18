import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { FiCheckCircle, FiAlertCircle, FiMail, FiArrowRight } from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import { AuthLayout } from '@/pages/auth/_layout';
import { Button } from '@/components/ui/button';
import { authBackend } from '@/lib/env';
import { verifyEmailToken } from '@/features/auth/services/php-auth-service';
import { supabase } from '@/lib/supabase/client';
import { AUTH_ROUTES } from '@/lib/constants';

type Status = 'verifying' | 'success' | 'invalid' | 'missing';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const token = params.get('token');
    if (!token) {
      setStatus('missing');
      return;
    }

    void (async () => {
      if (authBackend === 'php') {
        const result = await verifyEmailToken(token);
        if (result.ok) setStatus('success');
        else {
          setStatus('invalid');
          setErrorMsg(result.error);
        }
        return;
      }
      // Supabase: la sesión ya se establece con detectSessionInUrl.
      // Verificamos que haya sesión válida.
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setStatus('invalid');
        setErrorMsg(error?.message ?? 'No fue posible verificar el correo.');
      } else {
        setStatus('success');
      }
    })();
  }, [params]);

  return (
    <AuthLayout title={titleFor(status)} description={descriptionFor(status)}>
      {status === 'verifying' && <Verifying />}
      {status === 'success' && <Success />}
      {status === 'invalid' && <Invalid message={errorMsg} />}
      {status === 'missing' && <Missing />}
    </AuthLayout>
  );
}

function titleFor(status: Status): string {
  if (status === 'verifying') return 'Confirmando tu correo…';
  if (status === 'success') return 'Listo, tu cuenta está activa';
  if (status === 'invalid') return 'Enlace inválido o expirado';
  return 'Falta el token';
}

function descriptionFor(status: Status): string | undefined {
  if (status === 'verifying') return 'Solo toma un segundo.';
  if (status === 'success') return 'Ya puedes entrar y empezar a trabajar.';
  if (status === 'invalid') {
    return 'Solicita un nuevo enlace para confirmar tu correo.';
  }
  return 'El enlace de verificación no incluye un token. Revisa tu correo.';
}

function Verifying() {
  return (
    <div className="animate-fade-in-up text-muted-foreground flex items-center justify-center gap-3 py-6">
      <ImSpinner8 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Verificando…</span>
    </div>
  );
}

function Success() {
  return (
    <div className="animate-fade-in-up space-y-5 text-center">
      <div className="border-primary/30 bg-primary/10 text-primary relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border">
        <FiCheckCircle className="h-7 w-7" />
      </div>
      <p className="text-muted-foreground text-sm">Tu correo quedó confirmado.</p>
      <Button asChild size="lg" className="group h-11 w-full rounded-xl">
        <Link to={AUTH_ROUTES.login}>
          Ir a iniciar sesión
          <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}

function Invalid({ message }: { message: string | null }) {
  return (
    <div className="animate-fade-in-up space-y-5 text-center">
      <div className="border-destructive/30 bg-destructive/10 text-destructive mx-auto flex h-16 w-16 items-center justify-center rounded-full border">
        <FiAlertCircle className="h-7 w-7" />
      </div>
      <p className="text-muted-foreground text-sm">
        {message ?? 'El enlace ya no es válido. Puede haber expirado o haberse usado.'}
      </p>
      <div className="grid gap-2">
        <Button asChild size="lg" className="h-11 rounded-xl">
          <Link to={AUTH_ROUTES.login}>Volver al inicio de sesión</Link>
        </Button>
      </div>
    </div>
  );
}

function Missing() {
  return (
    <div className="animate-fade-in-up space-y-5 text-center">
      <div className="border-muted-foreground/30 bg-muted/40 text-muted-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-full border">
        <FiMail className="h-7 w-7" />
      </div>
      <p className="text-muted-foreground text-sm">
        Abre este enlace desde el correo que te enviamos.
      </p>
      <Button asChild size="lg" className="h-11 rounded-xl">
        <Link to={AUTH_ROUTES.login}>Volver al inicio de sesión</Link>
      </Button>
    </div>
  );
}
