import { AuthLayout } from '@/pages/auth/_layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Te enviaremos un enlace para restablecerla."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
