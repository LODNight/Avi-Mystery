import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Input — text input với label, helper text và error.
 *
 * Props:
 *  - label: string
 *  - error: string
 *  - helper: string
 *  - icon: ReactNode (icon bên trái)
 *  - fullWidth: boolean
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
    icon,
    fullWidth = true,
    id,
    className = '',
    required,
    ...props
  },
  ref
) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 select-none"
        >
          {label}
          {required && (
            <span className="ml-1 text-danger-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          className={[
            'block bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            icon ? 'pl-9' : 'pl-3',
            'pr-3 py-2 h-9',
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-slate-300 hover:border-slate-400',
            fullWidth ? 'w-full' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="flex items-center gap-1 text-xs text-danger-600" role="alert">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500">
          {helper}
        </p>
      )}
    </div>
  );
});
