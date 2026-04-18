import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { siteConfig } from '@/config/site';
import { brand } from '@/config/brand';
import { BrandMark } from '@/components/common/brand-mark';
import { AuthBackdrop } from '@/pages/auth/_backdrop';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
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

      {/* ── Main grid · 5fr / 7fr asimétrico ────────────────── */}
      <div className="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Form column — con card envolvente y moving border */}
        <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
          <FormCard>
            <div className="mb-7 space-y-2">
              <h1 className="text-foreground text-[26px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[30px]">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              )}
            </div>
            {children}
          </FormCard>
        </main>

        {/* Decorative backdrop */}
        <AuthBackdrop />
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
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

/* ─── Card sobria con spotlight interior (aceternity glare) ─── */

function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-in-up w-full max-w-md">
      <GlareCard>{children}</GlareCard>
    </div>
  );
}

function GlareCard({ children }: { children: ReactNode }) {
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
      {/* Glare que sigue el cursor · solo visible on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--glare-x) var(--glare-y), color-mix(in oklch, var(--color-primary) 12%, transparent), transparent 70%)',
        }}
      />
      {/* Hairline top glow · siempre visible, sutil */}
      <div
        aria-hidden="true"
        className="via-primary/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />

      <div className="relative">{children}</div>
    </div>
  );
}
