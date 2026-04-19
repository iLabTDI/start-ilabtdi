import { Link } from 'react-router';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/constants';
import { siteConfig } from '@/config/site';

export function NotFound() {
  return (
    <div className="bg-background grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="border-primary/30 bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full border">
          <Compass className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Error 404</p>
          <h1 className="font-sans text-4xl font-semibold tracking-tight">Ruta no encontrada</h1>
          <p className="text-muted-foreground text-sm">
            La página que buscas no existe o fue movida. Desde aquí puedes volver al inicio de{' '}
            {siteConfig.shortName}.
          </p>
        </div>
        <Button asChild>
          <Link to={APP_ROUTES.appHome}>
            <Home className="h-4 w-4" strokeWidth={1.5} />
            Entrar al lab
          </Link>
        </Button>
      </div>
    </div>
  );
}
