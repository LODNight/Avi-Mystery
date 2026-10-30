import React from 'react';

/**
 * Badge — nhãn phân loại hồ sơ (Forensic Classification Tag).
 *
 * Props:
 *  - variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
 *  - size: 'sm' | 'md'
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const base = 'inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider rounded-sm leading-none transition-colors';

  const variants = {
    default:    'bg-muted text-muted-foreground border border-border',
    primary:    'bg-primary/15 text-primary border border-primary/35',
    secondary:  'bg-secondary text-secondary-foreground border border-border',
    success:    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    warning:    'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    danger:     'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30',
    outline:    'border border-border text-foreground bg-transparent',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
  };

  return (
    <span
      className={[
        base,
        variants[variant] ?? variants.default,
        sizes[size] ?? sizes.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}

/**
 * StatusBadge — badge với dot indicator và màu theo trạng thái.
 *
 * status: 'locked' | 'available' | 'in_progress' | 'completed' | 'draft' | 'published' | 'archived'
 */
export function StatusBadge({ status, className = '' }) {
  const config = {
    locked:      { label: 'Khóa',        variant: 'default',   dot: 'bg-slate-400 dark:bg-slate-500'   },
    available:   { label: 'Có thể làm',  variant: 'primary',   dot: 'bg-primary' },
    in_progress: { label: 'Đang làm',    variant: 'warning',   dot: 'bg-amber-500' },
    completed:   { label: 'Hoàn thành',  variant: 'success',   dot: 'bg-emerald-500' },
    draft:       { label: 'Nháp',        variant: 'default',   dot: 'bg-slate-400'   },
    published:   { label: 'Đã đăng',     variant: 'success',   dot: 'bg-emerald-500' },
    archived:    { label: 'Lưu trữ',     variant: 'outline',   dot: 'bg-slate-400'   },
    easy:        { label: 'Dễ',          variant: 'success',   dot: 'bg-emerald-500' },
    medium:      { label: 'Trung bình',  variant: 'warning',   dot: 'bg-amber-500' },
    hard:        { label: 'Khó',         variant: 'danger',    dot: 'bg-rose-500'  },
  };

  const { label, variant, dot } = config[status] ?? {
    label: status,
    variant: 'default',
    dot: 'bg-slate-400',
  };

  return (
    <Badge variant={variant} className={className}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </Badge>
  );
}
