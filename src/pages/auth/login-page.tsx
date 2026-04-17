import { Link } from 'react-router';
import { FiBookOpen } from 'react-icons/fi';
import { AuthLayout } from '@/pages/auth/_layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { DemoBanner } from '@/components/common/demo-banner';

export function LoginPage() {
  return (
    <AuthLayout
      title="Nos da gusto verte"
      description="Entra a tu cuenta y sigue donde dejaste tu trabajo."
      asideCta="Todo el poder del lab, detrás de un solo login."
    >
      <div className="space-y-6">
        <DemoBanner />
        <LoginForm />
        <Link
          to="/docs/quickstart"
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <FiBookOpen className="h-3 w-3" />
          ¿Primera vez? Ver quickstart en 5 minutos
        </Link>
      </div>
    </AuthLayout>
  );
}
