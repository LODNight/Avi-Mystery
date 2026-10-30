import React from 'react';
import { Skeleton } from './Skeleton.jsx';

/**
 * Card — container cơ bản mang phong cách hồ sơ lưu trữ (Archival Dossier).
 * Props: padding ('none' | 'sm' | 'md' | 'lg'), hover (boolean), loading (boolean)
 */
export function Card({ children, padding = 'md', hover = false, loading = false, className = '', ...props }) {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-5',
    lg:   'p-6',
  };
  return (
    <div
      aria-busy={loading ? 'true' : undefined}
      className={[
        'bg-card rounded-lg border border-border',
        hover && !loading ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer hover:border-primary/50' : '',
        loading ? 'animate-pulse' : '',
        paddings[padding] ?? paddings.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-5 w-1/2 rounded-sm" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-3/4 rounded-sm" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/**
 * CardHeader — phần tiêu đề trong card.
 */
export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        {title && (
          <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
