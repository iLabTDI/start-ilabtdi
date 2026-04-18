import { AuthLayout } from '@/pages/auth/_layout';
import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterPage() {
  return (
    <AuthLayout title="Crear cuenta" description="Llena tus datos para empezar.">
      <RegisterForm />
    </AuthLayout>
  );
}
