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
        'border-destructive/30 bg-destructive/10 flex items-start gap-3 rounded-lg border p-4 text-sm',
        className
      )}
    >
      <AlertCircle className="text-destructive mt-0.5 h-5 w-5" strokeWidth={1.5} />
      <div>
        <p className="text-destructive font-medium">{title}</p>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
