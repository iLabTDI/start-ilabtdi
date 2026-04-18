import { AuthLayout } from '@/pages/auth/_layout';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Nueva contraseña"
      description="Elige una contraseña fuerte para proteger tu cuenta."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
