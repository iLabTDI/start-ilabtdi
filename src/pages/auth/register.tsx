import { AuthLayout } from '@/components/auth-layout';
import { RegisterForm } from '@/components/register-form';

export function Register() {
  return (
    <AuthLayout title="Crear cuenta" description="Llena tus datos para empezar.">
      <RegisterForm />
    </AuthLayout>
  );
}
