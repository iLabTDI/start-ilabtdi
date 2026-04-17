import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label = 'Cargando' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FullPageSpinner({ label = 'Cargando' }: Pick<LoadingSpinnerProps, 'label'>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-background text-muted-foreground"
    >
      <Loader2 className="h-6 w-6 animate-spin" strokeWidth={1.5} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
