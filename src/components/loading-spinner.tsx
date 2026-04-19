import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label = 'Cargando' }: LoadingSpinnerProps) {
  return (
    <div className={cn('text-muted-foreground flex items-center gap-2 text-sm', className)}>
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
      className="bg-background text-muted-foreground flex min-h-screen items-center justify-center"
    >
      <Loader2 className="h-6 w-6 animate-spin" strokeWidth={1.5} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
