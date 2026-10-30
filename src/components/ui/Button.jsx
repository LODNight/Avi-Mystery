import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button — component button cơ bản với phản hồi xúc giác (tactile feedback).
 *
 * Props:
 *  - variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
 *  - size: 'sm' | 'md' | 'lg'
 *  - loading: boolean
 *  - disabled: boolean
 *  - fullWidth: boolean
 *  - icon: ReactNode (icon bên trái)
 *  - iconRight: ReactNode (icon bên phải)
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:opacity-90 active:opacity-95 shadow-sm',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90 border border-border shadow-sm',
    outline:
      'border border-border bg-card text-foreground hover:bg-muted active:bg-muted/80',
    ghost:
      'text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80',
    danger:
      'bg-destructive text-destructive-foreground hover:opacity-90 active:opacity-95 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 h-7',
    md: 'text-sm px-4 py-2 h-9',
    lg: 'text-sm px-5 py-2.5 h-10',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      className={[
        base,
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && iconRight && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  );
}
