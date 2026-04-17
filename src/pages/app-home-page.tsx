import { Link } from 'react-router';
import { FiBookOpen, FiUser, FiSettings, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import type { IconType } from 'react-icons';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from '@/features/auth/hooks/use-session';
import { APP_ROUTES } from '@/lib/constants';
import { siteConfig } from '@/config/site';

interface Shortcut {
  icon: IconType;
  title: string;
  description: string;
  to: string;
}

const shortcuts: Shortcut[] = [
  {
    icon: FiBookOpen,
    title: 'Documentación',
    description: 'Stack oficial, decisiones por qué sí / por qué no, cheatsheets y guías del lab.',
    to: APP_ROUTES.docs,
  },
  {
    icon: FiUser,
    title: 'Tu perfil',
    description: 'Nombre, avatar y datos visibles para el resto del equipo.',
    to: APP_ROUTES.profile,
  },
  {
    icon: FiSettings,
    title: 'Configuración',
    description: 'Tema, preferencias de cuenta y zona avanzada.',
    to: APP_ROUTES.settings,
  },
];

export function AppHomePage() {
  const { user } = useSession();
  const name =
    typeof user?.user_metadata?.['full_name'] === 'string'
      ? (user.user_metadata['full_name'] as string)
      : user?.email?.split('@')[0];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary">
            <HiSparkles className="h-3 w-3" />
            {siteConfig.shortName}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Hola{name ? `, ${name}` : ''}
          </h1>
          <p className="mt-3 text-muted-foreground">
            Esta es la plantilla base del {siteConfig.lab.name}. Fue creada para resolver el
            dolor #1 del equipo: la configuración inicial de proyectos. Antes de empezar,
            pasa por la <Link to={APP_ROUTES.docs} className="text-foreground underline-offset-4 hover:underline">documentación</Link> —
            te ahorrará tiempo en decisiones que ya están tomadas.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Atajos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((s) => (
            <ShortcutCard key={s.to} shortcut={s} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ShortcutCard({ shortcut }: { shortcut: Shortcut }) {
  const Icon = shortcut.icon;
  return (
    <Link to={shortcut.to} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold tracking-tight">{shortcut.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{shortcut.description}</p>
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs text-muted-foreground transition-colors group-hover:text-primary">
            Abrir
            <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
