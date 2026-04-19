import { useEffect, useState } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';
import { authBackend, isDemoMode } from '@/lib/env';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'ilabtdi:demo-banner-dismissed';

interface DemoBannerProps {
  className?: string;
}

/**
 * Pill discreto que avisa que el proyecto está en modo demo o con
 * backend PHP alterno. Se puede cerrar con la X y la preferencia
 * queda persistida en localStorage.
 *
 * - En modo Supabase normal → no aparece.
 * - En modo demo → sugiere consultar la terminal para las credenciales.
 * - En modo PHP → indica que la auth va contra el backend propio.
 */
export function DemoBanner({ className }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  const show = !dismissed && (isDemoMode || authBackend === 'php');
  if (!show) return null;

  const message = isDemoMode
    ? 'Modo demo · las credenciales aparecen en la terminal donde corriste `pnpm bootstrap`.'
    : 'Backend PHP · la auth apunta a tu MySQL local.';

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* noop */
    }
  };

  return (
    <div
      role="status"
      className={cn(
        'border-border/60 bg-muted/30 text-muted-foreground flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] leading-snug',
        className
      )}
    >
      <FiInfo className="text-primary/80 mt-[1px] h-3 w-3 shrink-0" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Cerrar aviso"
        className="text-muted-foreground/60 hover:bg-muted hover:text-foreground -my-0.5 -mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-md transition"
      >
        <FiX className="h-3 w-3" />
      </button>
    </div>
  );
}
