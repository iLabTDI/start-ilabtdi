import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ErrorDisplay({
  title = 'Algo salió mal',
  message = 'Ocurrió un error. Intenta de nuevo en unos segundos.',
  className,
}: ErrorDisplayProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm',
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" strokeWidth={1.5} />
      <div>
        <p className="font-medium text-destructive">{title}</p>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
