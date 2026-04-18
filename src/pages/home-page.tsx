import { useState } from 'react';
import { Link } from 'react-router';
import {
  FiArrowRight,
  FiShield,
  FiZap,
  FiCode,
  FiLayers,
  FiCloud,
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiTerminal,
  FiGitBranch,
  FiPackage,
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
    <div className="bg-background flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <CommandSection />
        <Features />
        <Stack />
        <Cta isAuthenticated={isAuthenticated} />
      </main>

      <PublicFooter />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */

function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <DottedBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at center, color-mix(in oklch, var(--color-primary) 14%, transparent), transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="border-primary/25 bg-primary/5 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wider uppercase backdrop-blur">
            <HiSparkles className="h-3 w-3" />
            Template · {siteConfig.lab.name}
          </span>

          <h1 className="mt-6 text-[44px] leading-[0.98] font-semibold tracking-[-0.035em] sm:text-[60px] lg:text-[72px]">
            Login funcional
            <br />
            <span className="relative inline-block">
              <span className="from-primary via-primary/80 to-primary/40 bg-gradient-to-br bg-clip-text text-transparent">
                en 5 minutos.
              </span>
              <span
                aria-hidden="true"
                className="via-primary/40 absolute -bottom-2 left-0 h-px w-full bg-gradient-to-r from-transparent to-transparent"
              />
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-[15px] leading-relaxed sm:text-base">
            Plantilla oficial del lab. Auth, base de datos y deploy a GoDaddy preconfigurados. Un
            comando, pega dos keys, despliega.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

          <p className="text-muted-foreground/50 mt-5 font-mono text-[10px] tracking-widest uppercase">
            MIT · sin tracking · sin vendor lock-in
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMMAND SECTION · terminal dedicado · 1 sola vez en toda la landing
   ═══════════════════════════════════════════════════════════════ */

function CommandSection() {
  return (
    <section className="border-border/40 relative border-y py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-primary text-[11px] font-medium tracking-[0.25em] uppercase">
            · un comando
          </p>
          <h2 className="mt-3 text-[28px] leading-tight font-semibold tracking-[-0.02em] sm:text-[36px]">
            Copia. Pega. Corre.
          </h2>
        </div>
        <div className="mt-8">
          <QuickstartTerminal />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TERMINAL · copy-to-clipboard
   ═══════════════════════════════════════════════════════════════ */

function QuickstartTerminal() {
  return (
    <div className="relative">
      {/* Glow debajo del terminal */}
      <div
        aria-hidden="true"
        className="bg-primary/15 pointer-events-none absolute inset-x-10 top-1/3 bottom-0 rounded-full blur-3xl"
      />

      <div className="border-border/50 bg-card/60 relative rounded-2xl border p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="bg-background overflow-hidden rounded-[14px]">
          {/* Topbar */}
          <div className="border-border/40 bg-card/60 flex items-center gap-1.5 border-b px-4 py-3">
            <span className="bg-destructive/50 h-2.5 w-2.5 rounded-full" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
            <span className="bg-primary/50 h-2.5 w-2.5 rounded-full" />
            <span className="text-muted-foreground/60 ml-3 flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase">
              <FiTerminal className="h-3 w-3" />
              un comando · proyecto listo
            </span>
          </div>

          <CopyableCommand command="pnpm create ilabtdi mi-proyecto" />

          <pre className="text-muted-foreground overflow-x-auto px-5 pt-3 pb-6 font-mono text-xs leading-relaxed sm:text-sm">
            <span className="text-muted-foreground/70">
              # wizard interactivo · elige backend · pega keys (o luego)
            </span>
            {'\n'}
            <span className="text-foreground/90 inline-flex items-center gap-1.5 font-medium">
              <FiCheckCircle aria-hidden className="text-primary inline h-3.5 w-3.5" />
              dev server · login funcional · ready
            </span>
          </pre>
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        Funciona con pnpm, npm y yarn ·{' '}
        <Link
          to="/docs/quickstart"
          className="text-primary underline-offset-4 transition hover:underline"
        >
          Ver los 3 caminos →
        </Link>
      </p>
    </div>
  );
}

function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="group border-border/30 bg-background/40 relative flex items-center gap-3 border-b px-5 py-5 sm:px-6">
      <span className="text-primary font-mono text-sm select-none">$</span>
      <code className="text-foreground flex-1 overflow-x-auto font-mono text-[15px] font-semibold whitespace-nowrap select-all sm:text-base">
        {command}
      </code>
      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        className="border-border/60 bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-foreground grid h-9 w-9 shrink-0 place-items-center rounded-full border transition active:scale-95"
        aria-label="Copiar comando"
      >
        {copied ? <FiCheck className="text-primary h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function DottedBackground() {
  return (
    <div
      aria-hidden="true"
      className="text-foreground pointer-events-none absolute inset-0 opacity-[0.045]"
      style={{
        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES · bento grid asimétrico
   ═══════════════════════════════════════════════════════════════ */

interface Feature {
  icon: IconType;
  title: string;
  description: string;
  span?: string;
  accent?: boolean;
}

const features: Feature[] = [
  {
    icon: FiShield,
    title: 'Seguridad por default',
    description:
      'CSP, HSTS, RLS en Supabase, rate limiting cliente+servidor, validación Zod, password hashing con bcrypt. Checklist OWASP ya cubierto.',
    span: 'md:col-span-2',
    accent: true,
  },
  {
    icon: FiZap,
    title: 'Auth en minutos',
    description: 'Login, registro, reset, magic links. Supabase o MySQL propio.',
  },
  {
    icon: FiCloud,
    title: 'Deploy a GoDaddy',
    description:
      'GitHub Actions que sube a cPanel con FTP/SFTP. `.htaccess` endurecido con cache inmutable y SPA routing.',
  },
  {
    icon: FiLayers,
    title: 'Arquitectura feature-first',
    description: 'Features autocontenidas · pages delgadas · lib pura. Sin spaghetti.',
    span: 'md:col-span-2',
  },
  {
    icon: FiCode,
    title: 'TypeScript estricto',
    description: 'strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess.',
  },
  {
    icon: FiGitBranch,
    title: 'DX cuidada',
    description: 'Husky, commitlint, Prettier con plugin Tailwind, ESLint flat config.',
  },
  {
    icon: FiPackage,
    title: 'Scripts mágicos',
    description: '`pnpm bootstrap` configura todo en un wizard · `db:setup` aplica migraciones.',
  },
];

function Features() {
  return (
    <section
      id="features"
      className="border-border/40 relative scroll-mt-20 border-b py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-primary text-[11px] font-medium tracking-[0.25em] uppercase">
            · lo que trae incluido
          </p>
          <h2 className="mt-3 text-[34px] leading-[1.05] font-semibold tracking-[-0.025em] sm:text-[44px]">
            Todo lo que normalmente pierdes 3 días configurando.
          </h2>
        </div>

        <div className="grid auto-rows-fr gap-4 md:grid-cols-3 lg:gap-5">
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
    <article
      className={`group border-border/50 bg-card/40 hover:border-primary/40 hover:bg-card/70 relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${feature.span ?? ''}`}
    >
      {/* Hover halo · top gradient line */}
      <div
        aria-hidden="true"
        className="via-primary/50 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Accent background para la primera card */}
      {feature.accent && (
        <div
          aria-hidden="true"
          className="bg-primary/10 pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl"
        />
      )}

      <div className="relative">
        <div className="bg-primary/10 text-primary ring-primary/20 mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset">
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <h3 className="text-[17px] font-semibold tracking-tight">{feature.title}</h3>
        <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
          {feature.description}
        </p>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STACK · grid con glow
   ═══════════════════════════════════════════════════════════════ */

interface StackPiece {
  icon: IconType;
  name: string;
  tag: string;
  color: string;
}

const stack: StackPiece[] = [
  { icon: SiVite, name: 'Vite', tag: 'Build', color: '#646cff' },
  { icon: SiReact, name: 'React 19', tag: 'UI', color: '#61dafb' },
  { icon: SiTypescript, name: 'TypeScript', tag: 'Types', color: '#3178c6' },
  { icon: SiTailwindcss, name: 'Tailwind v4', tag: 'Styles', color: '#06b6d4' },
  { icon: SiSupabase, name: 'Supabase', tag: 'Auth + DB', color: '#3ecf8e' },
  { icon: SiReactquery, name: 'TanStack Query', tag: 'Data', color: '#ff4154' },
  { icon: SiReacthookform, name: 'React Hook Form', tag: 'Forms', color: '#ec5990' },
  { icon: SiZod, name: 'Zod', tag: 'Validation', color: '#3068b7' },
];

function Stack() {
  return (
    <section
      id="stack"
      className="border-border/40 bg-card/20 relative scroll-mt-20 border-b py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-primary text-[11px] font-medium tracking-[0.25em] uppercase">
              · stack oficial
            </p>
            <h2 className="mt-3 text-[34px] leading-[1.05] font-semibold tracking-[-0.025em] sm:text-[42px]">
              Cada pieza, con un motivo.
            </h2>
            <p className="text-muted-foreground mt-4">
              Stack minimal que maximiza velocidad. Sin meta-frameworks, sin Node en runtime, sin
              vendor lock-in extra.
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              Lo que <strong className="text-foreground">no está</strong> también es decisión:
              Redux, Auth0, Axios, styled-components — no los necesitas para 95% de casos.
            </p>

            <div className="mt-8">
              <Button asChild variant="outline">
                <Link to="/docs/decisiones-tecnicas">
                  Ver decisiones técnicas
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3">
            {stack.map((piece) => (
              <StackItem key={piece.name} piece={piece} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StackItem({ piece }: { piece: StackPiece }) {
  const Icon = piece.icon;
  return (
    <li
      className="group border-border/50 bg-background/50 hover:border-primary/40 hover:bg-background/80 relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5"
      style={{ ['--color' as string]: piece.color }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: piece.color }}
      />

      <div className="relative flex items-center gap-3">
        <span
          className="bg-card grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors"
          style={{ color: piece.color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-medium">{piece.name}</p>
          <p className="text-muted-foreground/70 truncate text-[11px] tracking-wider uppercase">
            {piece.tag}
          </p>
        </div>
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CTA final
   ═══════════════════════════════════════════════════════════════ */

function Cta({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="text-foreground pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 70% at center, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at center, black 30%, transparent 90%)',
        }}
      />
      <div
        aria-hidden="true"
        className="bg-primary/[0.06] pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span aria-hidden="true" className="bg-foreground/25 h-px w-8" />
            <span className="text-muted-foreground/70 font-mono text-[10px] tracking-[0.32em] uppercase">
              Siguiente paso
            </span>
            <span aria-hidden="true" className="bg-foreground/25 h-px w-8" />
          </div>

          <h2 className="text-[40px] leading-[1] font-semibold tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
            ¿Listo para empezar?
          </h2>

          <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-[15px] leading-relaxed sm:text-base">
            Lee el quickstart en 3 minutos o prueba el demo sin configurar nada.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/docs/quickstart">
                Ver quickstart
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/docs">Explorar docs</Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild variant="ghost" size="lg">
                <Link to={AUTH_ROUTES.login}>Probar demo</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="border-border/40 text-muted-foreground/50 mt-14 flex items-center justify-between border-t pt-6 font-mono text-[10px] tracking-[0.25em] uppercase">
          <span>{siteConfig.lab.name}</span>
          <span>01 / Ready</span>
        </div>
      </div>
    </section>
  );
}
