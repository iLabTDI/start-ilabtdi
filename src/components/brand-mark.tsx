import { cn } from '@/lib/utils';
import { brand } from '@/config/brand';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  withWordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: 'h-8 w-8', text: 'text-sm' },
  md: { box: 'h-10 w-10', text: 'text-base' },
  lg: { box: 'h-14 w-14', text: 'text-xl' },
} as const;

export function BrandMark({ size = 'md', withWordmark = false, className }: BrandMarkProps) {
  const s = sizes[size];
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'from-primary/20 to-primary/5 ring-border/60 grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br p-1 ring-1',
          s.box
        )}
      >
        <img
          src={brand.logoPath}
          alt={`${brand.name} logo`}
          className="h-full w-full object-contain"
          loading="eager"
          decoding="async"
        />
      </div>
      {withWordmark && (
        <span className={cn('font-sans font-semibold tracking-tight', s.text)}>{brand.name}</span>
      )}
    </div>
  );
}
