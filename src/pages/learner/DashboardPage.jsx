import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Flame,
  Target,
  Clock3,
  Play,
  ArrowUpRight,
  ChevronRight,
  Award,
  CheckCircle2,
  HelpCircle,
  FolderOpen,
  FileSpreadsheet,
  Database,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useAsync } from '../../hooks/useAsync.js';
import { missionService, courseService, onboardingService, ONBOARDING_STATUS, progressService } from '../../services/index.js';
import { formatXP, formatDuration } from '../../utils/format.js';
import { SkeletonCard, MissionCardSkeleton, DashboardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { OnboardingSpotlight } from '../../features/onboarding/OnboardingSpotlight.jsx';
import { DASHBOARD_TOUR_STEPS } from '../../features/onboarding/dashboardTourContent.js';

export function DashboardPage() {
  const { user } = useAuth();
  const courses = useAsync();
  const recommended = useAsync();
  const [isTourOpen, setIsTourOpen] = useState(false);

  const [dashboardStats, setDashboardStats] = useState({
    streak: user?.streak || 0,
    totalXp: user?.xp || 0,
    weeklyXp: 0,
    weeklyMissions: 0,
    timeSpent: '0h 0m',
    lastMission: null,
  });

  useEffect(() => {
    courses.execute(() => courseService.getCourses({ status: 'published' }));
    recommended.execute(() => missionService.getRecommendedMissions(user?.id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return;
      try {
        const [xpRes, historyRes] = await Promise.all([
          progressService.getLearnerXp(user.id),
          progressService.getFullHistory(user.id),
        ]);

        const history = historyRes.data || [];
        const totalXp = xpRes.data?.totalXp || user?.xp || 0;

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        let weeklyXp = 0;
        let weeklyMissions = 0;
        let activeStreak = 0;

        const lastMission = history.find((h) => h.type === 'mission');

        const formatDateKey = (dateObj) => {
          return `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
        };

        const dateMap = {};
        history.forEach((h) => {
          if (h.timestamp) {
            const d = new Date(h.timestamp);
            if (!isNaN(d.getTime())) {
              if (d >= startOfWeek) {
                weeklyXp += h.xp || 0;
                if (h.type === 'mission') weeklyMissions++;
              }
              dateMap[formatDateKey(d)] = true;
            }
          }
        });

        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          if (dateMap[formatDateKey(d)]) {
            activeStreak++;
          } else if (i > 0) {
            break;
          }
        }

        const weeklyMinutes = weeklyXp > 0 ? Math.floor(weeklyXp / 10) : 0;
        const timeSpent = `${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m`;

        const streak = xpRes.data?.streakSummary?.currentStreak ?? (activeStreak || user?.streak || 0);

        setDashboardStats({
          streak,
          totalXp,
          weeklyXp,
          weeklyMissions,
          timeSpent,
          lastMission,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    }
    loadStats();
  }, [user]);

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

  const xpPercent = Math.min(100, Math.round((dashboardStats.totalXp / (user?.xpToNextLevel || 1000)) * 100));
  const onboardingStatus = user?.id ? onboardingService.getStatus(user.id) : null;

  if (courses.loading && recommended.loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-fade-in pb-12">
      {/* ── ZONE 0: Headquarters Header ── */}
      <section id="dashboard-welcome-header" className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Bản tin Tổng hành dinh · {formattedDate}
            </span>
          </div>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl text-foreground">
            Chào mừng nhà điều tra, {user?.name?.split(' ').pop() || 'bạn'} 👋
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Bàn làm việc điều tra dữ liệu. Mỗi truy vấn và bảng tính là một manh mối đưa bạn tới sự thật vụ án.
          </p>
          {onboardingStatus === ONBOARDING_STATUS.COMPLETED && (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
              <CheckCircle2 className="size-4 text-amber-500 shrink-0" />
              <span>Đã hoàn thành Huấn luyện nhập môn (Case #00) · +50 XP</span>
              <Link to="/onboarding/case-0" className="ml-1 text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Xem lại
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleStartTour}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-sm hover:bg-muted hover:border-amber-500/40 transition-colors"
            title="Xem hướng dẫn giao diện Dashboard"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Hướng dẫn Dashboard</span>
          </button>
        </div>
      </section>

      {/* ── ZONE 1: Open Case File (P0: What am I doing right now?) ── */}
      <section
        id="dashboard-continue-investigation"
        className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-card p-6 sm:p-7 shadow-sm transition-all hover:border-primary/60"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary/15 border border-primary/25 text-primary text-2xl font-mono shadow-sm">
              <FileSpreadsheet className="size-7 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/15 border border-primary/30 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                  HỒ SƠ ĐANG THỤ LÝ · CASE #{dashboardStats.lastMission ? '01' : '01'}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Chương 1 · Manh mối ưu tiên
                </span>
              </div>
              <h3 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-foreground truncate">
                {dashboardStats.lastMission ? dashboardStats.lastMission.title.replace('Vụ án: ', '') : 'Vì sao doanh thu tháng 3 giảm?'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                Mục tiêu điều tra: <strong className="text-foreground">Truy vấn và xử lý số liệu bảng tính</strong> để phân tích nguyên nhân tụt giảm doanh số chi nhánh.
              </p>

              {/* Progress track */}
              <div className="mt-3.5 flex items-center gap-3 max-w-sm">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[72%] rounded-full bg-primary" />
                </div>
                <span className="font-mono text-xs font-bold text-primary shrink-0">72% hoàn thành</span>
              </div>
            </div>
          </div>

          {/* SINGLE DOMINANT CTA */}
          <div className="flex items-center shrink-0">
            <Link
              to={dashboardStats.lastMission?.link ? `${dashboardStats.lastMission.link}/workspace` : '/missions/mission-001/workspace'}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] transition-all"
              title="Mở ngay bàn làm việc toàn màn hình để phá án"
            >
              <Play className="size-4 fill-current" />
              <span>Tiếp tục điều tra vụ án</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Subtle ambient light */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </section>

      {/* ── ZONE 2: Detective Docket Ribbon (Replaces 4-Card SaaS Wall) ── */}
      <section
        id="dashboard-investigator-docket"
        aria-label="Thông số hồ sơ điều tra viên"
        className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-3 md:divide-x md:divide-border items-center">
          {/* Rank & Title with inline XP progress */}
          <div className="flex items-center gap-3.5 pr-2">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/25 text-primary">
              <Award className="size-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Danh hiệu thám tử
                </span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                  Cấp {user?.level || 1}
                </span>
              </div>
              <p className="text-sm font-bold text-foreground truncate">Data Investigator</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${xpPercent}%` }} />
                </div>
                <span className="font-mono text-[10px] font-semibold text-muted-foreground shrink-0">
                  {formatXP(dashboardStats.totalXp)}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Investigation Streak */}
          <div className="flex items-center gap-3.5 px-0 md:px-5">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/25 text-primary">
              <Flame className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Chuỗi phá án
              </p>
              <p className="text-base font-bold text-foreground">
                {dashboardStats.streak} ngày liên tiếp
              </p>
              <p className="text-xs text-muted-foreground">Giữ nhịp phân tích mỗi ngày</p>
            </div>
          </div>

          {/* Weekly Quota & Active Time */}
          <div className="flex items-center gap-3.5 px-0 md:px-5">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/25 text-primary">
              <Target className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Chỉ tiêu điều tra tuần
              </p>
              <p className="text-base font-bold text-foreground">
                {dashboardStats.weeklyMissions} / 5 vụ án
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock3 className="size-3 inline text-muted-foreground" />
                Đã xử lý {dashboardStats.timeSpent}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 3: Active Case Files & Inquiries ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section 3A: Long-term Specialized Cases (formerly Active Courses) */}
        <section
          id="dashboard-active-courses"
          aria-busy={courses.loading ? 'true' : undefined}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="size-4 text-primary" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Hồ sơ chuyên án
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Chuyên án điều tra dữ liệu</h3>
            </div>
            <Link to="/courses" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {courses.loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : courses.error ? (
              <ErrorState message={courses.error} />
            ) : (
              (courses.data || []).slice(0, 2).map((course) => (
                <CaseDossierCard key={course.id} course={course} />
              ))
            )}
          </div>
        </section>

        {/* Section 3B: Incident Missions (Recommended Next Missions) */}
        <section
          id="dashboard-recommended-missions"
          aria-busy={recommended.loading ? 'true' : undefined}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-primary" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nhiệm vụ hiện trường
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Vụ án cần phối hợp xử lý</h3>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {recommended.loading ? (
              <>
                <MissionCardSkeleton />
                <MissionCardSkeleton />
              </>
            ) : recommended.error ? (
              <ErrorState message={recommended.error} />
            ) : (
              (recommended.data || []).slice(0, 3).map((mission) => (
                <IncidentReportCard key={mission.id} mission={mission} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Dashboard Spotlight Guided Tour ── */}
      <OnboardingSpotlight
        isOpen={isTourOpen}
        steps={DASHBOARD_TOUR_STEPS}
        onClose={handleCloseTour}
        onSkip={handleCloseTour}
        onComplete={handleCloseTour}
      />
    </div>
  );
}

/* ── Detective Dossier & Incident Card Sub-components ── */

function CaseDossierCard({ course }) {
  const isExcel = course.tool === 'excel';
  const progress = course.id === 'course-001' ? 72 : 38;

  return (
    <Link
      to={`/courses/${course.slug || course.id}`}
      className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
              {isExcel ? <FileSpreadsheet className="size-4" /> : <Database className="size-4" />}
            </span>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
              {course.tool?.toUpperCase()} DOSSIER
            </span>
          </div>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            {course.totalMissions || 12} giai đoạn
          </span>
        </div>

        <h4 className="mt-2.5 font-bold text-sm text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Tiến độ điều tra</span>
        <span className="font-mono font-bold text-primary">{progress}%</span>
      </div>
    </Link>
  );
}

function IncidentReportCard({ mission }) {
  const isExcel = mission.tool === 'excel';

  return (
    <Link
      to={`/missions/${mission.id}`}
      className="group flex items-center justify-between rounded-xl border border-border bg-card p-3.5 transition-all hover:border-primary/50 hover:shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {isExcel ? <FileSpreadsheet className="size-4 text-primary" /> : <Database className="size-4 text-primary" />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-sm text-foreground group-hover:text-primary transition-colors">
            {mission.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground">
              {mission.tool}
            </span>
            <span className="text-[11px] text-muted-foreground">
              · {formatDuration(mission.estimatedDuration)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
          +{mission.rewardXp} XP
        </span>
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
