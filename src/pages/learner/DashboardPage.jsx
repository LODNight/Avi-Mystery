import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Flame,
  Target,
  Clock3,
  ArrowUpRight,
  ChevronRight,
  Award,
  CheckCircle2,
  HelpCircle,
  FolderOpen,
  FileSpreadsheet,
  Database,
  Briefcase,
  Stamp,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useAsync } from '../../hooks/useAsync.js';
import { missionService, courseService, onboardingService, ONBOARDING_STATUS, progressService } from '../../services/index.js';
import { formatXP, formatDuration } from '../../utils/format.js';
import { SkeletonCard, MissionCardSkeleton, DashboardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { OnboardingSpotlight } from '../../features/onboarding/OnboardingSpotlight.jsx';
import { DASHBOARD_TOUR_STEPS } from '../../features/onboarding/dashboardTourContent.js';
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation(['dashboard', 'common', 'nav']);
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

  if (user?.id && onboardingService.getStatus(user.id) === ONBOARDING_STATUS.NOT_STARTED) {
    return <Navigate to="/onboarding" replace />;
  }

  const activeLocale = (i18n.language || 'vi').toLowerCase().startsWith('en') ? 'en-US' : 'vi-VN';
  const formattedDate = new Date().toLocaleDateString(activeLocale, {
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
      {/* ── ZONE 0: Bureau Dispatch Masthead (Editorial Newspaper / Police Dispatch Header) ── */}
      <section
        id="dashboard-welcome-header"
        className="flex flex-col justify-between gap-4 border-b-2 border-border pb-5 md:flex-row md:items-end"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary/15 border border-primary/35 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {t('dashboard:hqBriefing', 'Bản tin Tổng hành dinh')}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              // {formattedDate}
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {t('dashboard:welcomeInvestigator', { name: user?.name?.split(' ').pop() || 'bạn', defaultValue: `Chào mừng nhà điều tra, ${user?.name?.split(' ').pop() || 'bạn'}` })}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t('dashboard:welcomeSubtitle', 'Bàn làm việc điều tra dữ liệu. Mỗi truy vấn và bảng tính là một manh mối đưa bạn tới sự thật vụ án.')}
          </p>
          {onboardingStatus === ONBOARDING_STATUS.COMPLETED && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-sm bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span className="font-mono text-[11px]">{t('dashboard:onboardingCompleted', 'Đã hoàn thành Huấn luyện nhập môn (Case #00) · +50 XP')}</span>
              <Link to="/onboarding/case-0" className="ml-1 text-primary font-semibold hover:underline">
                {t('dashboard:review', 'Xem lại')}
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleStartTour}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted hover:border-primary/40 transition-colors cursor-pointer"
            title={t('dashboard:dashboardTour', 'Xem hướng dẫn giao diện Dashboard')}
          >
            <HelpCircle className="size-4 text-primary" />
            <span>{t('dashboard:dashboardTour', 'Hướng dẫn Dashboard')}</span>
          </button>
        </div>
      </section>

      {/* ── ZONE 1: Active Manila Case File Folder + Perforated Warrant Stub ── */}
      <section
        id="dashboard-continue-investigation"
        className="relative pt-3"
      >
        {/* Physical Manila Folder Tab */}
        <div className="inline-flex items-center gap-2 rounded-t-md border-t border-x border-primary/50 bg-card px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary -mb-px relative z-10 ml-3">
          <Paperclip className="size-3" />
          <span>SPRINT 1 PROTOTYPE · CASE #001</span>
        </div>

        <div className="dossier-card corner-brackets rounded-md border border-primary/45 bg-card shadow-sm transition-all hover:border-primary/70">
          <div className="grid lg:grid-cols-12">
            {/* Left 8 Cols: Case Dossier Briefing */}
            <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary/15 border border-primary/35 text-primary font-mono shadow-2xs">
                    <FileSpreadsheet className="size-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {t('dashboard:newCaseFile', 'Hồ sơ Vụ án mới')} // REF: 84-KHO-29
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {t('dashboard:case001Title', 'Đường Dây Buôn Lậu Cà Phê')}
                    </h3>
                    <p
                      className="mt-1.5 text-sm text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: t(
                          'dashboard:case001Desc',
                          'Mục tiêu điều tra: Khám phá <strong class="text-foreground">Detective Workspace mới</strong>, kiểm tra bảng điều khiển Case File, Evidence Panel và HQ Communication.'
                        ),
                      }}
                    />
                  </div>
                </div>

                {/* Forensic Ink Classification Stamp */}
                <span className="detective-stamp text-primary border-primary/70 hidden sm:inline-block shrink-0">
                  ĐANG THỤ LÝ
                </span>
              </div>

              {/* Evidence Verification Progress Bar */}
              <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                    TIẾN ĐỘ HỒ SƠ
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-sm bg-muted border border-border">
                    <div className="h-full w-[72%] bg-primary" />
                  </div>
                  <span className="font-mono text-xs font-bold text-primary shrink-0">
                    {t('dashboard:percentCompleted', '{{percent}}% hoàn thành', { percent: 72 })}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  CHỨNG CỨ: 03/04 XÁC MINH
                </span>
              </div>
            </div>

            {/* Right 4 Cols: Perforated Warrant Stub & Dominant Action */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-dashed border-primary/40 bg-muted/35 p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>MÃ LỆNH:</span>
                  <span className="font-bold text-foreground">WRT-2026-001</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>CÔNG CỤ PHÁP Y:</span>
                  <span className="font-bold text-primary">EXCEL + SQL</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>PHẦN THƯỞNG:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+250 XP</span>
                </div>
              </div>

              <Link
                to="/cases/case-001"
                className="inline-flex w-full items-center justify-between gap-2.5 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
                title="Xem Hồ Sơ Vụ Án & Giao Nhiệm Vụ"
              >
                <div className="flex flex-col text-left">
                  <span className="leading-tight text-sm font-bold">Mở Hồ Sơ Vụ Án</span>
                  <span className="font-mono text-[10px] opacity-85">Phòng Tiếp Nhận Điều Tra</span>
                </div>
                <ArrowUpRight className="size-5 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 2: Investigator Service Ledger (Open Horizontal Ruled Strip — No Boxed Card Wall) ── */}
      <section
        id="dashboard-investigator-docket"
        aria-label="Thông số hồ sơ điều tra viên"
        className="border-y border-border bg-card/45 py-4 px-2 sm:px-4"
      >
        <div className="grid gap-5 md:grid-cols-3 md:divide-x md:divide-border items-center">
          {/* Metric 1: Clearance Rank & Title */}
          <div className="flex items-center gap-3.5 pr-2">
            <div className="grid size-10 shrink-0 place-items-center rounded-sm bg-primary/10 border border-primary/30 text-primary">
              <Award className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t('dashboard:detectiveTitle', 'Danh hiệu thám tử')}
                </span>
                <span className="rounded-sm bg-primary/15 border border-primary/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                  {t('dashboard:level', 'Cấp {{level}}', { level: user?.level || 1 })}
                </span>
              </div>
              <p className="text-sm font-bold text-foreground truncate mt-0.5">Data Investigator</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${xpPercent}%` }} />
                </div>
                <span className="font-mono text-[10px] font-bold text-foreground shrink-0">
                  {formatXP(dashboardStats.totalXp)}
                </span>
              </div>
            </div>
          </div>

          {/* Metric 2: Active Duty Streak */}
          <div className="flex items-center gap-3.5 px-0 md:px-5">
            <div className="grid size-10 shrink-0 place-items-center rounded-sm bg-primary/10 border border-primary/30 text-primary">
              <Flame className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('dashboard:streakTitle', 'Chuỗi phá án')}
              </p>
              <p className="font-mono text-base font-bold text-foreground">
                {dashboardStats.streak} {t('dashboard:streakUnit', 'ngày liên tiếp')}
              </p>
              <p className="text-xs text-muted-foreground">{t('dashboard:streakSub', 'Giữ nhịp phân tích mỗi ngày')}</p>
            </div>
          </div>

          {/* Metric 3: Weekly Quota & Field Hours */}
          <div className="flex items-center gap-3.5 px-0 md:px-5">
            <div className="grid size-10 shrink-0 place-items-center rounded-sm bg-primary/10 border border-primary/30 text-primary">
              <Target className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('dashboard:weeklyMissionsTitle', 'Chỉ tiêu điều tra tuần')}
              </p>
              <p className="font-mono text-base font-bold text-foreground">
                {dashboardStats.weeklyMissions} / 5
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Clock3 className="size-3 inline text-muted-foreground" />
                {t('dashboard:timeSpentTitle', 'Thời gian điều tra')}: {dashboardStats.timeSpent}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 3: Asymmetric Split Board (Left: Indexed Case Binders | Right: Wire Dispatch Ledger) ── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Section 3A (Left 5 Cols): Indexed Case Binders */}
        <section
          id="dashboard-active-courses"
          aria-busy={courses.loading ? 'true' : undefined}
          className="lg:col-span-5 flex flex-col"
        >
          <div className="flex items-end justify-between border-b border-border pb-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4 text-primary shrink-0" />
              <h3 className="text-base font-bold text-foreground tracking-tight">
                {t('dashboard:specializedDataInvestigation', 'Chuyên án điều tra dữ liệu')}
              </h3>
            </div>
            <Link to="/courses" className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1">
              {t('dashboard:viewAll', 'Xem tất cả')} <ArrowUpRight className="size-3.5" />
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
              (courses.data || []).slice(0, 2).map((course, idx) => (
                <CaseDossierCard key={course.id} course={course} index={idx + 1} />
              ))
            )}
          </div>
        </section>

        {/* Section 3B (Right 7 Cols): Police Wire Dispatch Table (Distinct from Card Stack) */}
        <section
          id="dashboard-recommended-missions"
          aria-busy={recommended.loading ? 'true' : undefined}
          className="lg:col-span-7 flex flex-col"
        >
          <div className="flex items-end justify-between border-b border-border pb-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-primary shrink-0" />
              <h3 className="text-base font-bold text-foreground tracking-tight">
                {t('dashboard:casesNeedCoordination', 'Vụ án cần phối hợp xử lý')}
              </h3>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              DISPATCH WIRE // LIVE
            </span>
          </div>

          <div className="rounded-md border border-border bg-card overflow-hidden">
            {/* Ledger Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 border-b border-border bg-muted/60 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="col-span-2">MÃ VỤ ÁN</span>
              <span className="col-span-6">HỒ SƠ HIỆN TRƯỜNG</span>
              <span className="col-span-2">NGHIỆP VỤ</span>
              <span className="col-span-2 text-right">THƯỞNG</span>
            </div>

            <div className="divide-y divide-border">
              {recommended.loading ? (
                <div className="p-4 space-y-3">
                  <MissionCardSkeleton />
                  <MissionCardSkeleton />
                </div>
              ) : recommended.error ? (
                <div className="p-4">
                  <ErrorState message={recommended.error} />
                </div>
              ) : (
                (recommended.data || []).slice(0, 3).map((mission, idx) => (
                  <IncidentReportRow key={mission.id} mission={mission} index={idx + 1} />
                ))
              )}
            </div>
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

/* ── Detective Dossier Binder & Wire Dispatch Row Sub-components ── */

function CaseDossierCard({ course, index }) {
  const { t } = useTranslation(['dashboard']);
  const isExcel = course.tool === 'excel';
  const progress = course.id === 'course-001' ? 72 : 38;

  return (
    <Link
      to={`/courses/${course.slug || course.id}`}
      className="dossier-card group rounded-md border border-border bg-card p-4 pl-5 transition-all hover:border-primary/60 hover:shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-primary">
              [0{index}]
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 border border-primary/25 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              {isExcel ? <FileSpreadsheet className="size-3" /> : <Database className="size-3" />}
              {course.tool?.toUpperCase()} DOSSIER
            </span>
          </div>
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
            {t('dashboard:totalMissions', '{{count}} giai đoạn', { count: course.totalMissions || 12 })}
          </span>
        </div>

        <h4 className="mt-2 font-bold text-sm text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] text-muted-foreground">{t('dashboard:investigationProgress', 'Tiến độ điều tra')}</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-sm bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-mono font-bold text-primary">{progress}%</span>
        </div>
      </div>
    </Link>
  );
}

function IncidentReportRow({ mission, index }) {
  const isExcel = mission.tool === 'excel';
  const serialCode = `INC-0${index}`;

  return (
    <Link
      to={`/missions/${mission.id}`}
      className="group grid sm:grid-cols-12 items-center gap-2 px-4 py-3.5 transition-colors hover:bg-muted/50"
    >
      {/* Col 1-2: Serial */}
      <div className="sm:col-span-2 flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-primary">
          {serialCode}
        </span>
      </div>

      {/* Col 3-8: Title & Duration */}
      <div className="sm:col-span-6 min-w-0">
        <p className="truncate font-bold text-sm text-foreground group-hover:text-primary transition-colors">
          {mission.title}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
          Thời lượng dự kiến: {formatDuration(mission.estimatedDuration)}
        </p>
      </div>

      {/* Col 9-10: Tool Badge */}
      <div className="sm:col-span-2 flex items-center">
        <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-foreground">
          {isExcel ? <FileSpreadsheet className="size-3 text-primary" /> : <Database className="size-3 text-primary" />}
          {mission.tool}
        </span>
      </div>

      {/* Col 11-12: Reward & Arrow */}
      <div className="sm:col-span-2 flex items-center justify-end gap-2">
        <span className="font-mono text-xs font-bold text-primary">
          +{mission.rewardXp} XP
        </span>
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-transform" />
      </div>
    </Link>
  );
}
