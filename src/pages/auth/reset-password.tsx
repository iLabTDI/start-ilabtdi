import { AuthLayout } from '@/components/auth-layout';
import { ResetPasswordForm } from '@/components/reset-password-form';

export function ResetPassword() {
  return (
    <AuthLayout
      title="Nueva contraseña"
      description="Elige una contraseña fuerte para proteger tu cuenta."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
