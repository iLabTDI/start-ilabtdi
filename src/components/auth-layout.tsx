import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { brand } from '@/config/brand';
import { siteConfig } from '@/config/site';
import { BrandMark } from '@/components/brand-mark';

/**
 * Layout compartido para login / register / forgot / reset.
 *
 * Dos columnas en pantallas grandes (form a la izquierda, panel decorativo
 * a la derecha). En móvil solo el form. Todo el copy del panel lee de
 * `config/brand.ts` — cámbialo ahí, no aquí.
 */

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-10 lg:py-6">
        <Link
          to="/"
          className="ring-ring rounded-md transition-opacity outline-none hover:opacity-70 focus-visible:ring-2"
          aria-label="Inicio"
        >
          <BrandMark size="sm" withWordmark />
        </Link>
        <span className="text-muted-foreground/50 hidden font-mono text-[10px] tracking-[0.3em] uppercase sm:block">
          {new Date().getFullYear()} · {brand.name}
        </span>
      </header>

      {/* Main · 2 columnas asimétricas en lg+ */}
      <div className="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
          <div className="animate-fade-in-up w-full max-w-md">
            <Card>
              <div className="mb-7 space-y-2">
                <h1 className="text-foreground text-[26px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[30px]">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                )}
              </div>
              {children}
            </Card>
          </div>
        </main>

        <Backdrop />
      </div>

      {/* Footer */}
      <footer className="border-border/40 text-muted-foreground/60 relative z-10 flex flex-col items-center justify-between gap-1 border-t px-5 py-4 text-[11px] tracking-wide sm:flex-row sm:px-8 lg:px-10">
        <span>
          © {new Date().getFullYear()} · {siteConfig.lab.name}
        </span>
        <span className="text-muted-foreground/40 font-mono text-[10px] tracking-[0.25em] uppercase">
          v{siteConfig.version}
        </span>
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 *  Card con spotlight que sigue el cursor
 * ────────────────────────────────────────────────────────────── */

function Card({ children }: { children: ReactNode }) {
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--glare-x', `${x}%`);
    el.style.setProperty('--glare-y', `${y}%`);
  };

  return (
    <div
      onPointerMove={handleMove}
      className="group/card border-border/50 bg-card/60 relative overflow-hidden rounded-2xl border px-6 py-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-8 sm:py-10"
      style={
        {
          '--glare-x': '50%',
          '--glare-y': '0%',
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--glare-x) var(--glare-y), color-mix(in oklch, var(--color-primary) 12%, transparent), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 *  Panel decorativo (solo en lg+)
 * ────────────────────────────────────────────────────────────── */

function Backdrop() {
  const bullets = [
    'Auth lista · login, registro y reset',
    'Supabase o MySQL · tú eliges',
    'Deploy automático a GoDaddy',
  ];

  return (
    <aside
      aria-hidden="true"
      className="border-border/40 bg-card/30 relative hidden overflow-hidden border-l lg:flex"
    >
      {/* Mesh gradient */}
      <div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-70"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--color-primary) 16%, transparent), transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute -right-32 -bottom-32 h-[500px] w-[500px] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--color-primary) 10%, transparent), transparent 65%)',
          filter: 'blur(90px)',
        }}
      />
      {/* Dotted pattern */}
      <div
        className="text-foreground pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 80% 70% at center, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at center, black 30%, transparent 100%)',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
        {/* Top label */}
        <div className="flex items-start justify-between">
          <span className="text-muted-foreground/60 font-mono text-[10px] tracking-[0.32em] uppercase">
            <span className="bg-primary mr-2 inline-block h-[4px] w-[4px] translate-y-[-2px] animate-pulse rounded-full align-middle" />
            {brand.name}
          </span>
          <span className="text-muted-foreground/40 font-mono text-[10px] tracking-[0.2em]">
            01 / Auth
          </span>
        </div>

        {/* Hero editorial */}
        <div className="max-w-lg space-y-10">
          <div>
            <h2 className="text-foreground text-[44px] leading-[0.95] font-semibold tracking-[-0.035em] xl:text-[56px]">
              Empieza.
              <br />
              <span className="from-foreground to-foreground/60 bg-gradient-to-br bg-clip-text text-transparent">
                Construye.
              </span>
              <br />
              <span className="text-primary">Despliega.</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-md text-[15px] leading-relaxed xl:text-base">
              &ldquo;{brand.tagline}&rdquo;
            </p>
          </div>

          <ul className="space-y-3.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="text-foreground/80 flex items-center gap-3 text-sm">
                <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                  <span className="bg-primary/40 absolute inline-flex h-full w-full rounded-full blur-[4px]" />
                  <span className="bg-primary relative inline-flex h-1.5 w-1.5 rounded-full" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer del panel */}
        <div className="flex items-center justify-between pt-8">
          <span className="text-muted-foreground/50 font-mono text-[10px] tracking-[0.3em] uppercase">
            Ready · v1
          </span>
          <span className="text-muted-foreground/35 font-mono text-[10px] tracking-[0.2em]">
            {brand.name.toLowerCase().replace(/\s+/g, '-')}.auth
          </span>
        </div>
      </div>
    </aside>
  );
}
