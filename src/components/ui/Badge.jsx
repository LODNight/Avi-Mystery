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
    primary:    'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
    secondary:  'bg-secondary-100 text-secondary-700 dark:bg-secondary-950 dark:text-secondary-300',
    success:    'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300',
    warning:    'bg-warning-50 text-warning-600 dark:bg-warning-950 dark:text-warning-300',
    danger:     'bg-danger-50 text-danger-600 dark:bg-danger-950 dark:text-danger-300',
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
    available:   { label: 'Có thể làm',  variant: 'primary',   dot: 'bg-primary-500' },
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
