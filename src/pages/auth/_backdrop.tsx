import { brand } from '@/config/brand';

/**
 * Panel decorativo derecho del auth layout.
 *
 * Hero editorial con tipografía grande + bullets breves.
 * Cero logo centrado giratorio — puro contenido que vende.
 * Todo el copy lee de `brand.ts` · reusable entre proyectos.
 */
export function AuthBackdrop() {
  return (
    <aside
      aria-hidden="true"
      className="border-border/40 bg-card/30 relative hidden overflow-hidden border-l lg:flex"
    >
      <MeshGradient />
      <DottedPattern />
      <Vignette />

      <CornerMark position="tl" />
      <CornerMark position="tr" />
      <CornerMark position="bl" />
      <CornerMark position="br" />

      <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
        <TopLabel />
        <Hero />
        <Footer />
      </div>
    </aside>
  );
}

/* ─── Top label editorial ─── */

function TopLabel() {
  return (
    <div className="flex items-start justify-between">
      <span className="text-muted-foreground/60 font-mono text-[10px] tracking-[0.32em] uppercase">
        <span className="bg-primary mr-2 inline-block h-[4px] w-[4px] translate-y-[-2px] animate-pulse rounded-full align-middle" />
        {brand.name}
      </span>
      <span className="text-muted-foreground/40 font-mono text-[10px] tracking-[0.2em]">
        01 / Auth
      </span>
    </div>
  );
}

/* ─── Hero editorial — tipografía grande + bullets ─── */

function Hero() {
  const bullets = [
    'Auth lista · login, registro y reset',
    'Supabase o MySQL · tú eliges',
    'Deploy automático a GoDaddy',
  ];

  return (
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
  );
}

/* ─── Footer del backdrop ─── */

function Footer() {
  return (
    <div className="flex items-center justify-between pt-8">
      <span className="text-muted-foreground/50 font-mono text-[10px] tracking-[0.3em] uppercase">
        Ready · v1
      </span>
      <span className="text-muted-foreground/35 font-mono text-[10px] tracking-[0.2em]">
        {brand.name.toLowerCase().replace(/\s+/g, '-')}.auth
      </span>
    </div>
  );
}

/* ─── Mesh gradient estático · sin animación molesta ─── */

function MeshGradient() {
  return (
    <>
      {/* Radial principal · top-left */}
      <div
        aria-hidden="true"
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-70"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--color-primary) 16%, transparent), transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Radial secundario · bottom-right */}
      <div
        aria-hidden="true"
        className="absolute -right-32 -bottom-32 h-[500px] w-[500px] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--color-primary) 10%, transparent), transparent 65%)',
          filter: 'blur(90px)',
        }}
      />
      {/* Glow central sutil */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/3 h-[300px] w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse, color-mix(in oklch, var(--color-foreground) 3%, transparent), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
    </>
  );
}

/* ─── Dotted pattern sutil ─── */

function DottedPattern() {
  return (
    <div
      aria-hidden="true"
      className="text-foreground pointer-events-none absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 80% 70% at center, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at center, black 30%, transparent 100%)',
      }}
    />
  );
}

function Vignette() {
  return (
    <div
      aria-hidden="true"
      className="to-background/60 pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent"
    />
  );
}

/* ─── Corner markers arquitectónicos ─── */

interface CornerMarkProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
}

function CornerMark({ position }: CornerMarkProps) {
  const pos = {
    tl: 'top-4 left-4 xl:top-6 xl:left-6',
    tr: 'top-4 right-4 xl:top-6 xl:right-6 rotate-90',
    bl: 'bottom-4 left-4 xl:bottom-6 xl:left-6 -rotate-90',
    br: 'bottom-4 right-4 xl:bottom-6 xl:right-6 rotate-180',
  }[position];

  return (
    <div aria-hidden="true" className={`text-foreground/25 pointer-events-none absolute ${pos}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M0.5 0.5 L0.5 6.5 M0.5 0.5 L6.5 0.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}
