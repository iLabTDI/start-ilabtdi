import { AuthLayout } from '@/components/auth-layout';
import { LoginForm } from '@/components/login-form';
import { DemoBanner } from '@/components/demo-banner';

export function Login() {
  return (
    <AuthLayout title="Iniciar sesión" description="Entra a tu cuenta para continuar.">
      <div className="space-y-5">
        <DemoBanner />
        <LoginForm />
      </div>
    </AuthLayout>
  );
}
