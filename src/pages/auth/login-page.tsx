import { AuthLayout } from '@/pages/auth/_layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { DemoBanner } from '@/components/common/demo-banner';

export function LoginPage() {
  return (
    <AuthLayout title="Iniciar sesión" description="Entra a tu cuenta para continuar.">
      <div className="space-y-5">
        <DemoBanner />
        <LoginForm />
      </div>
    </AuthLayout>
  );
}
