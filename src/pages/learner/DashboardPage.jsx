import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Flame,
  Target,
  TrendingUp,
  Clock3,
  Play,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Zap,
  Award,
  MoreHorizontal,
  BookOpen,
  CheckCircle2,
  LockKeyhole,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useAsync } from '../../hooks/useAsync.js';
import { missionService, courseService, onboardingService, ONBOARDING_STATUS } from '../../services/index.js';
import { formatXP, formatDuration, difficultyLabel, toolLabel } from '../../utils/format.js';
import { SkeletonCard, MissionCardSkeleton, Skeleton, DashboardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { OnboardingSpotlight } from '../../features/onboarding/OnboardingSpotlight.jsx';
import { DASHBOARD_TOUR_STEPS } from '../../features/onboarding/dashboardTourContent.js';

export function DashboardPage() {
  const { user } = useAuth();
  const courses = useAsync();
  const recommended = useAsync();
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    courses.execute(() => courseService.getCourses({ status: 'published' }));
    recommended.execute(() => missionService.getRecommendedMissions(user?.id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.id && !onboardingService.hasSeenDashboardTour(user.id)) {
      setIsTourOpen(true);
    }
  }, [user?.id]);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    if (user?.id) {
      onboardingService.markDashboardTourSeen(user.id);
    }
  };

  const handleStartTour = () => {
    setIsTourOpen(true);
  };

  // Route guard: Nếu user chưa chạy onboarding → điều hướng về Welcome Gate (/onboarding)
  if (user?.id && onboardingService.getStatus(user.id) === ONBOARDING_STATUS.NOT_STARTED) {
    return <Navigate to="/onboarding" replace />;
  }

  const formattedDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const xpPercent = user
    ? Math.min(100, Math.round((user.xp / (user.xpToNextLevel || 1000)) * 100))
    : 0;

  const onboardingStatus = user?.id ? onboardingService.getStatus(user.id) : null;

  if (courses.loading && recommended.loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in">
      {/* ── Section 1: Learning Pulse Header ── */}
      <section id="dashboard-welcome-header" className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {formattedDate}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Chào mừng nhà điều tra, {user?.name?.split(' ').pop() || 'bạn'} 👋
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400 font-normal">
            Tiến độ nhỏ mỗi ngày tạo nên đột phá lớn. Bạn đang tích lũy kỹ năng phân tích dữ liệu qua từng vụ án.
          </p>
          {onboardingStatus === ONBOARDING_STATUS.COMPLETED && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>Đã hoàn thành Huấn luyện nhập môn (Case #00) · +50 XP khởi đầu</span>
              <Link to="/onboarding/case-0" className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Xem lại
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleStartTour}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
            title="Xem hướng dẫn giao diện Dashboard"
          >
            <HelpCircle className="size-4 text-primary" />
            <span className="hidden sm:inline">Hướng dẫn Dashboard</span>
          </button>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Khám phá khóa học
          </Link>
        </div>
      </section>

      {/* ── Section 2: 4 Key Stat Cards ── */}
      <section id="dashboard-stat-cards" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Chuỗi Streak"
          value={`${user?.streak || 0} ngày`}
          detail="Học liên tiếp hôm nay"
          accent="text-amber-500"
        />
        <StatCard
          icon={Target}
          label="Mục tiêu tuần"
          value="4 / 5"
          detail="nhiệm vụ hoàn thành"
          accent="text-violet-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Tổng điểm XP"
          value={formatXP(user?.xp || 0)}
          detail="+320 XP tuần này"
          accent="text-emerald-500"
        />
        <StatCard
          icon={Clock3}
          label="Thời gian học"
          value="3h 42m"
          detail="tuần này"
          accent="text-cyan-500"
        />
      </section>

      {/* ── Section 3: Continue Learning & Quest Progress ── */}
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Continue Learning */}
        <div id="dashboard-continue-investigation" className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                Tiếp tục cuộc điều tra
              </p>
              <h3 className="mt-2 text-xl font-bold text-foreground">Trở lại vụ án gần nhất</h3>
            </div>
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Tùy chọn">
              <MoreHorizontal className="size-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-muted/60 p-4 sm:flex-row sm:items-center">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-500/15 font-mono text-2xl text-amber-500">
              📊
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to="/missions/mission-001"
                  className="truncate font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Vì sao doanh thu tháng 3 giảm?
                </Link>
                <span className="shrink-0 font-mono text-xs font-bold text-primary">72%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full w-[72%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                Chương 1 · Excel Foundations (Phân tích dữ liệu kinh doanh)
              </p>
            </div>
            <Link
              to="/missions/mission-001/workspace"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              aria-label="Tiếp tục vụ án"
            >
              <Play className="size-4 fill-current" />
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Nhiệm vụ tiếp theo: <span className="font-semibold text-foreground">Truy vấn bảng dữ liệu SQL</span>
            </p>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </div>

        {/* Quest Progress Level Card */}
        <div id="dashboard-investigator-level" className="rounded-3xl border-2 border-amber-500/30 bg-card p-6 text-card-foreground shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div>
            <div className="flex items-start justify-between">
              <div className="grid size-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Award className="size-6 text-amber-500" />
              </div>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Cấp {user?.level || 1}
              </span>
            </div>
            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
              Tiến trình danh hiệu
            </p>
            <h3 className="mt-1.5 text-2xl font-bold text-foreground">Data Investigator</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 font-normal">
              Còn <span className="font-semibold text-foreground">{formatXP((user?.xpToNextLevel || 1000) - (user?.xp || 0))}</span> để mở khóa danh hiệu kế tiếp.
            </p>
          </div>

          <div className="mt-6">
            <div className="h-2.5 overflow-hidden rounded-full bg-amber-500/15">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              <span>{formatXP(user?.xp || 0)}</span>
              <span>{formatXP(user?.xpToNextLevel || 1000)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Active Courses ── */}
      <section id="dashboard-active-courses" aria-busy={courses.loading ? "true" : undefined}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Hành trình học tập
            </p>
            <h3 className="mt-2 text-xl font-bold text-foreground">Khóa học đang diễn ra</h3>
          </div>
          <Link to="/courses" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Xem tất cả <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {courses.loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : courses.error ? (
            <div className="col-span-2">
              <ErrorState message={courses.error} />
            </div>
          ) : (
            (courses.data || []).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>
      </section>

      {/* ── Section 5: Recommended Missions ── */}
      <section id="dashboard-recommended-missions" aria-busy={recommended.loading ? "true" : undefined}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Bảng hồ sơ vụ án
            </p>
            <h3 className="mt-2 text-xl font-bold text-foreground">Nhiệm vụ điều tra đề xuất</h3>
          </div>
        </div>

        {recommended.loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <MissionCardSkeleton />
            <MissionCardSkeleton />
          </div>
        ) : recommended.error ? (
          <ErrorState message={recommended.error} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(recommended.data || []).map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        )}
      </section>

      {/* ── Dashboard Spotlight Guided Tour (Step 6.6) ── */}
      <OnboardingSpotlight
        isOpen={isTourOpen}
        steps={DASHBOARD_TOUR_STEPS}
        onClose={handleCloseTour}
        onComplete={handleCloseTour}
      />
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ icon: Icon, label, value, detail, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <Icon className={`size-4 ${accent}`} />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function CourseCard({ course }) {
  const icon = course.tool === 'excel' ? '📊' : '🔍';
  const progress = course.id === 'course-001' ? 72 : 38;

  return (
    <Link
      to={`/courses/${course.slug || course.id}`}
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="grid size-11 place-items-center rounded-2xl bg-amber-500/15 font-mono text-xl text-amber-600 dark:text-amber-400">
          {icon}
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] font-bold text-muted-foreground uppercase">
          {course.tool}
        </span>
      </div>
      <h4 className="mt-5 font-semibold text-foreground group-hover:text-primary transition-colors">
        {course.title}
      </h4>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{course.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{course.totalMissions || 12} bài học</span>
        <span className="font-mono font-bold text-foreground">{progress}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
    </Link>
  );
}

function MissionCard({ mission }) {
  return (
    <Link
      to={`/missions/${mission.id}`}
      className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-mono text-lg text-primary">
          {mission.tool === 'excel' ? '📊' : '🔍'}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {mission.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
              {mission.tool}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDuration(mission.estimatedDuration)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
          +{mission.rewardXp} XP
        </span>
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
