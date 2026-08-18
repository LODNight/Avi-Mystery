import React from 'react';

/**
 * Card — container cơ bản.
 * Props: padding ('none' | 'sm' | 'md' | 'lg'), hover (boolean)
 */
export function Card({ children, padding = 'md', hover = false, className = '', ...props }) {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-5',
    lg:   'p-6',
  };
  return (
    <div
      className={[
        'bg-white rounded-xl border border-slate-200',
        hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : '',
        paddings[padding] ?? paddings.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
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
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
