import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { THEME_OPTIONS } from '@/config/theme';
import { cn } from '@/lib/utils';

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Preferencias de la aplicación para tu cuenta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Elige cómo se ve la interfaz.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={theme === opt.value ? 'default' : 'outline'}
                onClick={() => setTheme(opt.value)}
                className={cn('min-w-[110px]')}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Zona de peligro</CardTitle>
          <CardDescription>
            Acciones irreversibles. Contacta al administrador del lab si necesitas eliminar tu
            cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Eliminar cuenta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
