import { AuthLayout } from '@/pages/auth/_layout';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Define tu nueva contraseña"
      description="Una contraseña fuerte y estás listo para continuar."
      asideCta="Contraseñas fuertes, cuentas seguras. Así trabajamos."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
