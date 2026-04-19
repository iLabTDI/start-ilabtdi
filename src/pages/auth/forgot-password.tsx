import { AuthLayout } from '@/components/auth-layout';
import { ForgotPasswordForm } from '@/components/forgot-password-form';

export function ForgotPassword() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Te enviaremos un enlace para restablecerla."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
