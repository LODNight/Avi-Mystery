import React from 'react';

/** Skeleton primitive */
export function Skeleton({ className = 'h-4 w-full', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-muted/80 animate-pulse rounded-xl ${className}`} aria-hidden="true" />
      ))}
    </>
  );
}

/** SkeletonCard */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 space-y-3.5 animate-pulse ${className}`} aria-hidden="true">
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

/** MissionCardSkeleton */
export function MissionCardSkeleton({ className = '' }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border border-border bg-card p-4 animate-pulse ${className}`} aria-hidden="true">
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

/** AdminCourseCardSkeleton */
export function AdminCourseCardSkeleton({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-4 flex items-center justify-between animate-pulse ${className}`} aria-hidden="true">
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

/** StatCardSkeleton */
export function StatCardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse" aria-hidden="true">
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

/** DashboardSkeleton */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-9 w-72 sm:w-96 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl shrink-0" />
      </div>
      <StatCardSkeleton count={4} />
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

/** PageSkeleton */
export function PageSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-fade-in p-1" aria-busy="true" aria-label="Đang tải trang...">
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

/** CoursesSkeleton */
export function CoursesSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-9 w-72 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-lg rounded-md" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mt-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

/** CourseDetailSkeleton */
export function CourseDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-6 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <Skeleton className="h-5 w-32 rounded-md" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-48 rounded-lg" />
        {[1,2,3].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="size-5 rounded-md" />
            </div>
            <Skeleton className="h-3.5 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** LearningMapSkeleton */
export function LearningMapSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      {/* Header Card */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-9 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
             <div key={i} className="h-16 rounded-2xl border border-border/50 bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Map Items */}
      <div className="flex gap-3 mt-2">
        {[1,2].map(i => <Skeleton key={i} className="h-10 w-48 rounded-xl" />)}
      </div>
      <div className="flex flex-col gap-4 pl-4 mt-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm animate-pulse">
            <div className="size-12 rounded-2xl shrink-0 bg-muted/80" />
            <div className="h-8 flex-1 rounded-xl bg-muted/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** MissionIntroSkeleton */
export function MissionIntroSkeleton() {
  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <Skeleton className="h-5 w-32 rounded-md" />
      <Skeleton className="h-52 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 animate-pulse">
        <Skeleton className="h-5 w-32 rounded-md" />
        <div className="flex gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-8 flex-1 rounded-xl" />)}
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

/** ExcelMissionSkeleton */
export function ExcelMissionSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-[420px] w-full rounded-2xl" />
    </div>
  );
}

/** SqlMissionSkeleton */
export function SqlMissionSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-2/3" />
      </div>
      <div className="grid grid-cols-[240px_1fr] gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/** PracticePageSkeleton */
export function PracticePageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-9 w-56 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-lg rounded-md" />
      </div>
      <div className="flex gap-3">
        {[1,2,3].map(i => <Skeleton key={i} className="h-9 w-32 rounded-full" />)}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-60 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)}
      </div>
    </div>
  );
}

/** AchievementsSkeleton */
export function AchievementsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in mx-auto max-w-5xl" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 animate-pulse">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-9 w-56 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 min-w-[160px] space-y-3">
          <Skeleton className="h-4 w-20 rounded-md mx-auto" />
          <Skeleton className="h-8 w-24 rounded-lg mx-auto" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
      <div className="flex gap-2">
        {[1,2,3].map(i => <Skeleton key={i} className="h-9 w-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
      </div>
    </div>
  );
}

/** ProfileSkeleton */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in mx-auto max-w-7xl" aria-busy="true" aria-label="Đang tải dữ liệu...">
      {/* Profile Header */}
      <div className="h-44 w-full rounded-3xl border border-border bg-card p-6 flex flex-col justify-end shadow-sm animate-pulse">
        <div className="flex items-center gap-5">
           <div className="size-16 sm:size-18 rounded-2xl bg-muted/80 ring-3 ring-background" />
           <div className="space-y-2">
             <div className="h-7 w-48 bg-muted/80 rounded-lg" />
             <div className="h-4 w-32 bg-muted/80 rounded-md" />
           </div>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
           <div key={i} className="h-24 rounded-2xl border border-border bg-card p-5 animate-pulse flex flex-col justify-between shadow-sm">
             <div className="h-4 w-20 bg-muted/80 rounded-md" />
             <div className="h-6 w-12 bg-muted/80 rounded-md" />
           </div>
        ))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-72 rounded-3xl border border-border bg-card p-6 md:col-span-2 animate-pulse space-y-6 shadow-sm">
           <div className="h-6 w-32 bg-muted/80 rounded-md" />
           <div className="space-y-3">
             <div className="h-12 w-full bg-muted/80 rounded-xl" />
             <div className="h-12 w-full bg-muted/80 rounded-xl" />
             <div className="h-12 w-full bg-muted/80 rounded-xl" />
           </div>
        </div>
        <div className="h-72 rounded-3xl border border-border bg-card p-6 animate-pulse space-y-6 shadow-sm">
           <div className="h-6 w-24 bg-muted/80 rounded-md" />
           <div className="space-y-3">
             <div className="h-10 w-full bg-muted/80 rounded-xl" />
             <div className="h-10 w-full bg-muted/80 rounded-xl" />
           </div>
        </div>
      </div>
    </div>
  );
}

/** ActivityHistorySkeleton */
export function ActivityHistorySkeleton() {
  return (
    <div className="space-y-6 animate-fade-in mx-auto max-w-4xl pt-6" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-12 w-36 rounded-xl shrink-0" />
      </div>
      
      {/* Filter Tabs */}
      <div className="h-14 w-full rounded-2xl border border-border bg-card p-1.5 flex gap-2 animate-pulse">
        <div className="h-full w-24 bg-muted/80 rounded-xl" />
        <div className="h-full w-24 bg-transparent rounded-xl" />
        <div className="h-full w-24 bg-transparent rounded-xl" />
      </div>
      
      <div className="space-y-8 mt-4">
        {[1,2].map(g => (
          <div key={g} className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            {/* Timeline Items */}
            {[1,2,3].map(i => (
               <div key={i} className="h-24 w-full rounded-2xl border border-border bg-card p-4 flex gap-4 animate-pulse shadow-sm">
                 <div className="size-12 rounded-full bg-muted/80 shrink-0" />
                 <div className="flex-1 space-y-3 py-1">
                   <div className="h-5 w-48 bg-muted/80 rounded-md" />
                   <div className="h-3 w-32 bg-muted/80 rounded-md" />
                 </div>
                 <div className="h-6 w-16 bg-muted/80 rounded-md shrink-0" />
               </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** AdminOverviewSkeleton */
export function AdminOverviewSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in" aria-busy="true" aria-label="Đang tải dữ liệu...">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-44 rounded-md" />
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <AdminCourseCardSkeleton />
          <AdminCourseCardSkeleton />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/** Spinner */
export function Spinner({ size = 20, className = '' }) {
  return (
    <svg aria-label="Đang tải..." role="status" width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin text-primary ${className}`}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/** PageLoader */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-64" role="status" aria-label="Đang tải" aria-busy="true">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-sm font-medium text-muted-foreground">Đang tải bố cục...</p>
      </div>
    </div>
  );
}

/** AppShellSkeleton (For global auth loading to simulate LearnerLayout) */
export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex animate-fade-in" aria-busy="true" aria-label="Đang khởi tạo ứng dụng...">
      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-border bg-sidebar py-5 px-4 shadow-sm">
        <div className="flex items-center gap-3 px-1 mb-8">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-2.5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-3 px-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-col min-h-screen w-full lg:pl-72">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 lg:hidden rounded-xl" />
            <Skeleton className="hidden lg:block size-10 rounded-xl" />
            <div className="space-y-1.5 hidden sm:block">
              <Skeleton className="h-3 w-32 rounded-md" />
              <Skeleton className="h-5 w-48 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-xl" />
            <Skeleton className="size-9 rounded-xl" />
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="flex-1 p-4 sm:p-6 mt-2">
          <PageSkeleton />
        </main>
      </div>
    </div>
  );
}
