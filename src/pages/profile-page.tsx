import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/features/profile/components/profile-form';

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-semibold tracking-tight text-3xl">Tu perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualiza tu información visible en el lab.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
          <CardDescription>Los cambios se guardan sobre tu propio perfil (RLS activa).</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
