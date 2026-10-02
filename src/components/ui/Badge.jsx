import React from 'react';

/**
 * Badge — label hiển thị thông tin phụ.
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
  const base = 'inline-flex items-center gap-1 font-medium rounded-full leading-none transition-colors';

  const variants = {
    default:    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    primary:    'bg-primary/15 text-primary border border-primary/25',
    secondary:  'bg-secondary-100 text-secondary-700 dark:bg-secondary-950 dark:text-secondary-300',
    success:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    warning:    'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    danger:     'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    outline:    'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200 bg-transparent',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
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
    in_progress: { label: 'Đang làm',    variant: 'warning',   dot: 'bg-warning-500' },
    completed:   { label: 'Hoàn thành',  variant: 'success',   dot: 'bg-success-500' },
    draft:       { label: 'Nháp',        variant: 'default',   dot: 'bg-slate-400'   },
    published:   { label: 'Đã đăng',     variant: 'success',   dot: 'bg-success-500' },
    archived:    { label: 'Lưu trữ',     variant: 'outline',   dot: 'bg-slate-400'   },
    easy:        { label: 'Dễ',          variant: 'success',   dot: 'bg-success-500' },
    medium:      { label: 'Trung bình',  variant: 'warning',   dot: 'bg-warning-500' },
    hard:        { label: 'Khó',         variant: 'danger',    dot: 'bg-danger-500'  },
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
