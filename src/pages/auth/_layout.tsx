import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { FiShield, FiZap, FiCode } from 'react-icons/fi';
import { siteConfig } from '@/config/site';
import { brand } from '@/config/brand';
import { BrandMark } from '@/components/common/brand-mark';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Opcional: override del texto del panel derecho */
  asideCta?: string;
}

export function AuthLayout({ title, description, children, asideCta }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_1.1fr]">
      {/* ─── Columna formulario ──────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col px-5 py-8 sm:px-8 sm:py-10 lg:min-h-0 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-80 bg-gradient-to-b from-primary/10 via-primary/[0.03] to-transparent lg:hidden"
        />

        <Link
          to="/"
          className="relative z-10 self-start rounded-md transition hover:opacity-90"
          aria-label={`Ir al inicio de ${brand.name}`}
        >
          <BrandMark size="md" withWordmark />
        </Link>

        {/* Card envolvente en desktop · bare en mobile */}
        <div className="relative z-10 my-10 w-full max-w-md self-center sm:my-auto">
          <div className="animate-fade-in-up rounded-2xl border border-border/40 bg-card/40 p-6 shadow-2xl shadow-black/10 backdrop-blur-sm sm:p-8 lg:border-border/60 lg:bg-card/60">
            <div className="space-y-2 pb-7 sm:pb-8">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {description && (
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              )}
            </div>
            {children}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protegido con cifrado de nivel bancario · {siteConfig.lab.name}
          </p>
        </div>

        <p className="relative pt-6 text-center text-xs text-muted-foreground sm:pt-10 sm:text-left">
          © {new Date().getFullYear()} {siteConfig.lab.owner}. Todos los derechos reservados.
        </p>
      </div>

      {/* ─── Columna decorativa (desktop only) ──────────────── */}
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden border-l border-border/40 bg-card lg:block"
      >
        <BackgroundFX />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Online
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Laboratorio</p>
              <p className="max-w-xs text-lg leading-snug text-foreground/80">
                {siteConfig.lab.owner}
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="group relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-primary/15 blur-3xl transition-opacity group-hover:opacity-100" />
              <img
                src={brand.logoPath}
                alt={brand.name}
                className="max-h-64 w-auto object-contain opacity-95 drop-shadow-[0_0_50px_color-mix(in_oklch,var(--color-primary)_30%,transparent)] xl:max-h-72"
              />
            </div>
          </div>

          <div className="space-y-6">
            <ul className="grid gap-3">
              <ValueProp icon={FiZap} label="Login funcional en minutos" />
              <ValueProp icon={FiShield} label="Seguridad por default · CSP, HSTS, RLS" />
              <ValueProp icon={FiCode} label="TypeScript estricto · DX cuidado" />
            </ul>

            <blockquote className="max-w-md border-l-2 border-primary/40 pl-4">
              <p className="text-base leading-snug text-foreground/80">
                &ldquo;{asideCta ?? brand.tagline}&rdquo;
              </p>
              <footer className="mt-2 text-xs text-muted-foreground">
                — Equipo {brand.name}
              </footer>
            </blockquote>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ValueProp({ icon: Icon, label }: { icon: typeof FiZap; label: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span>{label}</span>
    </li>
  );
}

function BackgroundFX() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background" />
      <div className="absolute -left-20 top-1/3 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </>
  );
}
