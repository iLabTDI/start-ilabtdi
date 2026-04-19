import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile-form';

export function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-semibold tracking-tight">Tu perfil</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Actualiza tu información visible en el lab.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
          <CardDescription>
            Los cambios se guardan sobre tu propio perfil (RLS activa).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
