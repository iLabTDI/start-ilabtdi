import { useState } from 'react';
import { Copy, Check, Database, Sparkles } from 'lucide-react';
import { DEMO_ACCOUNTS } from '@/features/auth/services/demo-auth-service';
import { authBackend, isDemoMode } from '@/lib/env';
import { cn } from '@/lib/utils';

interface DemoBannerProps {
  variant?: 'card' | 'strip';
  className?: string;
}

export function DemoBanner({ variant = 'card', className }: DemoBannerProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isDemoMode) {
    // Si el proyecto está en modo PHP, mostramos un aviso distinto
    if (authBackend === 'php' && variant === 'strip') {
      return (
        <div
          role="status"
          className={cn(
            'flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary',
            className
          )}
        >
          <Database className="h-3 w-3" strokeWidth={1.5} />
          <span>
            Backend: PHP + MySQL (iLab TDI cPanel)
          </span>
        </div>
      );
    }
    return null;
  }

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  };

  if (variant === 'strip') {
    return (
      <div
        role="status"
        className={cn(
          'flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary',
          className
        )}
      >
        <Sparkles className="h-3 w-3" strokeWidth={1.5} />
        <span>
          Modo demo · usa <code className="font-mono font-semibold">demo@ilabtdi.com</code> /{' '}
          <code className="font-mono font-semibold">Demo2026!</code>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Sparkles className="h-4 w-4" strokeWidth={1.5} />
        <span className="font-medium">Modo demo activo</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        No hay Supabase conectado. Usa una de estas cuentas hardcodeadas para entrar.
      </p>
      <ul className="space-y-2">
        {DEMO_ACCOUNTS.map((a) => {
          const payload = `${a.email} · ${a.password}`;
          const isCopied = copied === a.email;
          return (
            <li
              key={a.email}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/50 px-3 py-2"
            >
              <div className="min-w-0 flex-1 font-mono text-xs">
                <div className="truncate text-foreground">{a.email}</div>
                <div className="truncate text-muted-foreground">{a.password}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void copy(payload, a.email);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
                aria-label={`Copiar credenciales de ${a.email}`}
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5 text-primary" strokeWidth={1.8} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
