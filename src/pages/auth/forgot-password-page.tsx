import { AuthLayout } from '@/pages/auth/_layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recupera tu acceso"
      description="Dinos tu correo y te mandamos un enlace seguro para crear una nueva contraseña."
      asideCta="Nunca te quedes fuera. Un enlace, tu correo, de vuelta adentro."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
