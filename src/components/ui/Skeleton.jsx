import React from 'react';

/**
 * Skeleton — placeholder cho content đang load.
 * Props: className (để set width/height), count (số lượng)
 */
export function Skeleton({ className = 'h-4 w-full', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${className}`} aria-hidden="true" />
      ))}
    </>
  );
}

/**
 * SkeletonCard — skeleton hình card đầy đủ
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3" aria-hidden="true">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Spinner — loading indicator inline
 */
export function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      aria-label="Đang tải..."
      role="status"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin text-primary-500 ${className}`}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * PageLoader — full page loading overlay
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-48" role="status" aria-label="Đang tải">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-sm text-slate-500">Đang tải...</p>
      </div>
    </div>
  );
}
