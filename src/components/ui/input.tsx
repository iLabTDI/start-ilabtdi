import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Icono que se renderiza en el costado izquierdo del input. */
  leftIcon?: ReactNode;
  /** Slot que se renderiza en el costado derecho (icono, botón, etc.). */
  rightSlot?: ReactNode;
  /** Clase para el wrapper (cuando tiene iconos/slots). */
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', leftIcon, rightSlot, wrapperClassName, ...props },
    ref
  ) => {
    const base =
      'flex h-11 w-full rounded-xl border border-border bg-background/60 px-3.5 py-2 text-base shadow-sm shadow-black/5 transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30 aria-[invalid=true]:bg-destructive/[0.02] sm:h-10 sm:text-sm';

    if (!leftIcon && !rightSlot) {
      return <input type={type} className={cn(base, className)} ref={ref} {...props} />;
    }

    return (
      <div
        className={cn(
          'relative flex items-center',
          wrapperClassName
        )}
      >
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 flex h-4 w-4 items-center justify-center text-muted-foreground">
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            base,
            leftIcon && 'pl-10',
            rightSlot && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-2 flex items-center">{rightSlot}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
