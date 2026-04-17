import { AuthLayout } from '@/pages/auth/_layout';
import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterPage() {
  return (
    <AuthLayout
      title="Únete al lab"
      description="Un par de datos, confirmas tu correo y estás dentro."
      asideCta="Crea, despliega y duerme tranquilo — seguridad resuelta de fábrica."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
