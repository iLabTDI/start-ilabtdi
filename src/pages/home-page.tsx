import { Link } from 'react-router';
import {
  FiArrowRight,
  FiShield,
  FiZap,
  FiGitBranch,
  FiCode,
  FiLayers,
  FiCloud,
  FiCheckCircle,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import {
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiVite,
  SiSupabase,
  SiReactquery,
  SiReacthookform,
  SiZod,
} from 'react-icons/si';
import type { IconType } from 'react-icons';
import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { APP_ROUTES, AUTH_ROUTES } from '@/lib/constants';
import { useSession } from '@/features/auth/hooks/use-session';

export function HomePage() {
  const { isAuthenticated } = useSession();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNav />

      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <Features />
        <Stack />
        <Cta isAuthenticated={isAuthenticated} />
      </main>

      <PublicFooter />
    </div>
  );
}

function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute left-1/2 top-0 -z-0 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary">
            <HiSparkles className="h-3 w-3" />
            Template oficial · {siteConfig.lab.name}
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Login funcional <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              en 5 minutos.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Plantilla oficial del lab. Auth, base de datos y deploy a GoDaddy
            preconfigurados. Clona, pega dos keys, despliega.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/docs/quickstart">
                Empezar ahora
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {isAuthenticated ? (
              <Button asChild variant="outline" size="lg">
                <Link to={APP_ROUTES.appHome}>Entrar al lab</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link to={AUTH_ROUTES.login}>Probar demo</Link>
              </Button>
            )}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            MIT · sin tracking · sin vendor lock-in innecesario
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl lg:mt-16">
          <QuickstartTerminal />
        </div>
      </div>
    </section>
  );
}

function QuickstartTerminal() {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-card/50 p-2 shadow-2xl shadow-primary/5 backdrop-blur">
      <div className="overflow-hidden rounded-xl bg-background">
        <div className="flex items-center gap-1.5 border-b border-border/40 bg-card/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">
            camino rápido · demo en 30s
          </span>
        </div>
        <pre className="overflow-x-auto p-6 font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <span className="text-primary">$</span> pnpm dlx degit ilabtdi/start-ilabtdi mi-proyecto
          {'\n'}
          <span className="text-primary">$</span> cd mi-proyecto && pnpm install
          {'\n'}
          <span className="text-primary">$</span> pnpm dev
          {'\n\n'}
          <span className="text-muted-foreground/70"># Entra con demo@ilabtdi.com / Demo2026!</span>
          {'\n'}
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <FiCheckCircle className="inline h-3.5 w-3.5 text-primary" />
            VITE ready · localhost:5173 · login funcional
          </span>
        </pre>
      </div>
      <div className="mt-3 px-2 pb-1 text-center text-xs text-muted-foreground">
        ¿Prefieres Supabase real o MySQL del lab?{' '}
        <Link to="/docs/quickstart" className="text-primary underline-offset-4 hover:underline">
          Ver los 3 caminos →
        </Link>
      </div>
    </div>
  );
}

interface Feature {
  icon: IconType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: FiShield,
    title: 'Seguridad por default',
    description:
      'CSP, HSTS, RLS, rate limiting, validación con Zod y headers Apache ya configurados. Lista de verificación OWASP cubierta.',
  },
  {
    icon: FiZap,
    title: 'Auth en 10 minutos',
    description:
      'Supabase Auth completo: login, registro, recuperación, magic links, sesión persistente. Con protección contra enumeración.',
  },
  {
    icon: FiCloud,
    title: 'Deploy a GoDaddy',
    description:
      'GitHub Actions listo que builda y sube a cPanel vía FTP/SFTP. Cache inmutable, gzip, SPA routing funcionando.',
  },
  {
    icon: FiLayers,
    title: 'Arquitectura feature-first',
    description:
      'Estructura por dominio, no por tipo. Capas claras: pages delgadas, features autocontenidas, lib pura.',
  },
  {
    icon: FiCode,
    title: 'TypeScript estricto',
    description:
      'Modo strict total + exactOptionalPropertyTypes + noUncheckedIndexedAccess. Zod comparte tipos con forms.',
  },
  {
    icon: FiGitBranch,
    title: 'DX cuidado',
    description:
      'Husky, commitlint, Prettier con plugin Tailwind, ESLint flat config, Dependabot y CodeQL desde el día 1.',
  },
];

function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Características
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Lo que te ahorras configurar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cada pieza del template resuelve un dolor real del equipo, identificado
            en una encuesta interna al lab.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6 transition-colors hover:border-primary/40 hover:bg-card/70">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </article>
  );
}

interface StackPiece {
  icon: IconType;
  name: string;
  tag: string;
}

const stack: StackPiece[] = [
  { icon: SiVite, name: 'Vite', tag: 'Build' },
  { icon: SiReact, name: 'React 19', tag: 'UI' },
  { icon: SiTypescript, name: 'TypeScript', tag: 'Types' },
  { icon: SiTailwindcss, name: 'Tailwind v4', tag: 'Styles' },
  { icon: SiSupabase, name: 'Supabase', tag: 'Auth + DB' },
  { icon: SiReactquery, name: 'TanStack Query', tag: 'Data' },
  { icon: SiReacthookform, name: 'RHF', tag: 'Forms' },
  { icon: SiZod, name: 'Zod', tag: 'Validation' },
];

function Stack() {
  return (
    <section id="stack" className="relative scroll-mt-20 border-y border-border/40 bg-card/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Stack</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Todo lo que necesitas, nada extra.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Seleccionado para minimizar dependencias y maximizar velocidad. Sin
              meta-frameworks, sin runtime de Node en hosting compartido, sin
              vendor lock-in extra.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Lo que NO está también es decisión:{' '}
              <span className="text-foreground">Redux, Auth0, Axios, styled-components</span> — no
              los necesitas para 95% de casos y añaden mantenimiento.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/docs/decisiones-tecnicas">
                  Ver decisiones técnicas
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {stack.map((piece) => {
              const Icon = piece.icon;
              return (
                <li
                  key={piece.name}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 p-3 transition-colors hover:border-primary/40"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-card text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{piece.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{piece.tag}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Cta({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center shadow-lg shadow-primary/5 sm:p-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
            ¿Listo para empezar?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
            Elige el camino que va con tu proyecto y ten login funcional en
            minutos. No hay que leer todo antes — es literal copy-paste.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/docs/quickstart">
                Ver quickstart (5 min)
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {isAuthenticated ? (
              <Button asChild variant="ghost" size="lg">
                <Link to={APP_ROUTES.appHome}>Entrar al lab</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="lg">
                <Link to={AUTH_ROUTES.login}>Probar demo ahora</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
