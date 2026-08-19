import React from 'react';

/**
 * Skeleton — primitive placeholder component với hiệu ứng shimmer/pulse
 */
export function Skeleton({ className = 'h-4 w-full', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-muted/80 animate-pulse rounded-xl ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/**
 * SkeletonCard — Thẻ bài học / Nhiệm vụ skeleton
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 space-y-3.5 animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="size-11 rounded-2xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 rounded-lg" />
      <Skeleton className="h-3.5 w-full rounded-md" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

/**
 * MissionCardSkeleton — Thẻ Nhiệm vụ đề xuất skeleton (bảo toàn hình học layout)
 */
export function MissionCardSkeleton({ className = '' }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border border-border bg-card p-4 animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <Skeleton className="size-10 rounded-xl shrink-0" />
        <div className="space-y-2 min-w-0">
          <Skeleton className="h-4 w-36 sm:w-48 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-12 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="size-4 rounded shrink-0" />
      </div>
    </div>
  );
}

/**
 * AdminCourseCardSkeleton — Thẻ quản lý khóa học Admin skeleton
 */
export function AdminCourseCardSkeleton({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-4 flex items-center justify-between animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-4 min-w-0">
        <Skeleton className="size-12 rounded-2xl shrink-0" />
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-36 sm:w-48 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-44 rounded-md" />
        </div>
      </div>
      <Skeleton className="size-4 rounded shrink-0" />
    </div>
  );
}

/**
 * StatCardSkeleton — 4 thẻ thống kê chỉ số
 */
export function StatCardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse"
          aria-hidden="true"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="size-4 rounded-full" />
          </div>
          <Skeleton className="h-7 w-20 rounded-lg mt-2" />
          <Skeleton className="h-3 w-28 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * DashboardSkeleton — Skeleton bố cục trang Dashboard Nhà điều tra
 */
export function DashboardSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in"
      role="region"
      aria-label="Đang tải dữ liệu..."
      aria-busy="true"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-9 w-72 sm:w-96 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl shrink-0" />
      </div>

      {/* 4 Stat Cards Skeleton */}
      <StatCardSkeleton count={4} />

      {/* Main Quest / Continue Learning Skeleton */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-6 w-56 rounded-lg" />
          <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-4">
            <Skeleton className="size-14 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="size-10 rounded-2xl" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-48 rounded-lg mt-4" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-3 w-full rounded-full mt-4" />
        </div>
      </div>

      {/* Active Courses Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

/**
 * PageSkeleton — Skeleton bố cục chung cho tất cả các trang
 */
export function PageSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-7xl flex-col gap-6 animate-fade-in p-1"
      role="region"
      aria-label="Đang tải trang..."
      aria-busy="true"
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-xl" />
      </div>
      <StatCardSkeleton count={4} />
      <div className="grid gap-4 md:grid-cols-2 mt-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

/**
 * Spinner — Loading indicator dạng vòng xoay inline
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
      className={`animate-spin text-primary ${className}`}
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
 * PageLoader — Full page spinner fallback
 */
export function PageLoader() {
  return (
    <div
      className="flex items-center justify-center h-full min-h-64"
      role="status"
      aria-label="Đang tải"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-sm font-medium text-muted-foreground">Đang tải bố cục...</p>
      </div>
    </div>
  );
}
