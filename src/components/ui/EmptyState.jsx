import React from 'react';
import { InboxIcon, SearchX, AlertTriangle, Lock } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * EmptyState — hiển thị khi không có dữ liệu.
 *
 * Props:
 *  - type: 'empty' | 'search' | 'locked' | 'error'
 *  - title: string
 *  - description: string
 *  - action: { label, onClick }
 */
export function EmptyState({
  type = 'empty',
  title,
  description,
  action,
  className = '',
}) {
  const config = {
    empty:  { Icon: InboxIcon,       iconClass: 'text-slate-400', bg: 'bg-slate-50' },
    search: { Icon: SearchX,         iconClass: 'text-slate-400', bg: 'bg-slate-50' },
    locked: { Icon: Lock,            iconClass: 'text-primary-400', bg: 'bg-primary-50' },
    error:  { Icon: AlertTriangle,   iconClass: 'text-warning-500', bg: 'bg-warning-50' },
  };

  const { Icon, iconClass, bg } = config[type] ?? config.empty;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
        <Icon size={24} className={iconClass} />
      </div>
      {title && (
        <p className="text-sm font-semibold text-slate-900 mb-1">{title}</p>
      )}
      {description && (
        <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * ErrorState — hiển thị khi có lỗi fetch.
 */
export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <EmptyState
      type="error"
      title="Đã xảy ra lỗi"
      description={message ?? 'Không thể tải dữ liệu. Vui lòng thử lại.'}
      action={onRetry ? { label: 'Thử lại', onClick: onRetry } : undefined}
      className={className}
    />
  );
}

/**
 * ProgressBar — thanh tiến trình.
 * Props: value (0-100), size ('sm'|'md'), color ('primary'|'success'|'warning')
 */
export function ProgressBar({
  value = 0,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className = '',
}) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heights = { sm: 'h-1.5', md: 'h-2.5' };
  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`w-full ${heights[size] ?? heights.md} bg-slate-200 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clampedValue}% hoàn thành`}
      >
        <div
          className={`${heights[size] ?? heights.md} ${colors[color] ?? colors.primary} rounded-full transition-all duration-500`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 mt-1">{clampedValue}%</span>
      )}
    </div>
  );
}
