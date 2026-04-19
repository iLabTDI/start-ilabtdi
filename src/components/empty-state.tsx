import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border bg-card/50 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center',
        className
      )}
    >
      <div className="bg-muted/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="font-sans text-lg font-semibold tracking-tight">{title}</h3>
      {description && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
