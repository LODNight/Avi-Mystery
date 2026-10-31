import React, { useEffect, useState, useMemo } from 'react';
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
  Paperclip,
  GraduationCap,
  Dumbbell,
  Compass,
  Map,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useAsync } from '../../hooks/useAsync.js';
import {
  missionService,
  courseService,
  onboardingService,
  ONBOARDING_STATUS,
  progressService,
} from '../../services/index.js';
import {
  caseStateService,
  investigationStateService,
} from '../../services/investigationSessionService.js';
import { formatXP, formatDuration } from '../../utils/format.js';
import { SkeletonCard, MissionCardSkeleton, DashboardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { OnboardingSpotlight } from '../../features/onboarding/OnboardingSpotlight.jsx';
import { DASHBOARD_TOUR_STEPS } from '../../features/onboarding/dashboardTourContent.js';
import { useTranslation } from 'react-i18next';

const INTENT_TRACKS = [
  {
    id: 'case',
    icon: Briefcase,
    badgeKey: 'trackCaseBadge',
    badge: 'HƯỚNG 01 // THỰC CHIẾN',
    titleKey: 'trackCaseTitle',
    title: 'Phá án thực chiến',
    subtitleKey: 'trackCaseSubtitle',
    subtitle: 'Đọc hồ sơ hiện trường, soi bảng dữ liệu & tìm thủ phạm ngay',
  },
  {
    id: 'academy',
    icon: GraduationCap,
    badgeKey: 'trackAcademyBadge',
    badge: 'HƯỚNG 02 // NỀN TẢNG',
    titleKey: 'trackAcademyTitle',
    title: 'Học từ cơ bản (Academy)',
    subtitleKey: 'trackAcademySubtitle',
    subtitle: 'Dành cho người mới: nắm vững lý thuyết Excel & SQL từ con số 0',
  },
  {
    id: 'practice',
    icon: Dumbbell,
    badgeKey: 'trackPracticeBadge',
    badge: 'HƯỚNG 03 // RÈN KỸ NĂNG',
    titleKey: 'trackPracticeTitle',
    title: 'Luyện tập thao tác',
    subtitleKey: 'trackPracticeSubtitle',
    subtitle: 'Làm thử thách ngắn 5-10 phút hoặc thực hành tự do trong Sandbox',
  },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation(['dashboard', 'common', 'nav']);
  const courses = useAsync();
  const recommended = useAsync();
  const [isTourOpen, setIsTourOpen] = useState(false);

  const userId = user?.id || 'user-001';

  // Personal Intent State (persisted per user)
  const [selectedIntent, setSelectedIntent] = useState(() => {
    try {
      return localStorage.getItem(`avi:user_intent:${userId}`) || 'case';
    } catch {
      return 'case';
    }
  });

  const handleSelectIntent = (intentId) => {
    setSelectedIntent(intentId);
    try {
      localStorage.setItem(`avi:user_intent:${userId}`, intentId);
    } catch {
      // ignore storage errors
    }
  };

  const [dashboardStats, setDashboardStats] = useState({
    streak: user?.streak || 0,
    totalXp: user?.xp || 0,
    weeklyXp: 0,
    weeklyMissions: 0,
    timeSpent: '0h 0m',
    lastMission: null,
    completedMissionsCount: 0,
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
        const completedMissionsCount = history.filter((h) => h.type === 'mission').length;

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

        const streak =
          xpRes.data?.streakSummary?.currentStreak ?? (activeStreak || user?.streak || 0);

        setDashboardStats({
          streak,
          totalXp,
          weeklyXp,
          weeklyMissions,
          timeSpent,
          lastMission,
          completedMissionsCount,
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

  // Real progress for Case #001 (no fake 72% when user is brand new)
  const case001Telemetry = useMemo(() => {
    const cs = caseStateService.getState('case-001', userId);
    const inv = investigationStateService.getState('case-001', userId);
    const viewedCount = inv?.viewedSourceIds?.length || 0;
    const totalSources = 4;
    const completedPhases = cs?.completedPhaseIds?.length || 0;

    let percent = 0;
    if (cs?.status === 'CASE_CLOSED') {
      percent = 100;
    } else if (completedPhases > 0 || viewedCount > 0 || cs?.status !== 'OPEN') {
      percent = Math.min(90, Math.round((completedPhases * 45) + (viewedCount / totalSources) * 40));
    }

    return {
      status: cs?.status || 'OPEN',
      currentPhaseNum: cs?.currentPhaseId?.replace('phase-', '') || '1',
      viewedCount,
      totalSources,
      percent,
    };
  }, [userId]);

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

  const xpPercent = Math.min(
    100,
    Math.round((dashboardStats.totalXp / (user?.xpToNextLevel || 1000)) * 100)
  );
  const onboardingStatus = user?.id ? onboardingService.getStatus(user.id) : null;

  if (courses.loading && recommended.loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-fade-in pb-12">
      {/* ═══════════════════════════════════════════════════════════════════════
          [KHỐI 1] LỜI CHÀO & SỔ CHỈ SỐ TÁC NGHIỆP TỔNG HÀNH DINH
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="dashboard-welcome-header"
        className="flex flex-col gap-4 border-b border-border pb-5"
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary/15 border border-primary/35 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                {t('dashboard:hqBriefing', 'Bản tin Tổng hành dinh')}
              </span>
              <span className="font-mono text-xs text-muted-foreground">// {formattedDate}</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              {t('dashboard:welcomeInvestigator', {
                name: user?.name?.split(' ').pop() || 'bạn',
                defaultValue: `Chào mừng nhà điều tra, ${user?.name?.split(' ').pop() || 'bạn'}`,
              })}
            </h2>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {t(
                'dashboard:welcomeSubtitle',
                'Bàn giao việc điều tra cá nhân hóa. Chọn hướng ưu tiên của bạn bên dưới để bắt đầu ngay mà không bị ngợp thông tin.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onboardingStatus === ONBOARDING_STATUS.COMPLETED ? (
              <Link
                to="/onboarding/case-0"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors"
              >
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span>{t('dashboard:onboardingCompleted', 'Đã hoàn thành Huấn luyện nhập môn (Case #00) · +50 XP')}</span>
              </Link>
            ) : (
              <Link
                to="/onboarding/case-0"
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="size-3.5 shrink-0" />
                <span>{t('dashboard:onboardingPrompt', 'Mới bắt đầu? Thử Vụ án Tập sự 2 phút (#00)')}</span>
              </Link>
            )}

            <button
              onClick={handleStartTour}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted hover:border-primary/40 transition-colors cursor-pointer"
              title={t('dashboard:dashboardTour', 'Xem hướng dẫn giao diện Dashboard')}
            >
              <HelpCircle className="size-4 text-primary" />
              <span>{t('dashboard:dashboardTour', 'Hướng dẫn Dashboard')}</span>
            </button>
          </div>
        </div>

        {/* Integrated Investigator Telemetry Strip */}
        <div
          id="dashboard-investigator-docket"
          aria-label="Thông số hồ sơ điều tra viên"
          className="rounded-xl border border-border/80 bg-card/75 p-3.5 shadow-2xs backdrop-blur-xs"
        >
          <div className="grid gap-3 sm:grid-cols-3 sm:divide-x sm:divide-border/80 items-center">
            {/* Metric 1: Clearance Rank & Title */}
            <div className="flex items-center gap-3 pr-2">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/25 text-primary shadow-2xs">
                <Award className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('dashboard:detectiveTitle', 'Danh hiệu thám tử')}
                  </span>
                  <span className="rounded-sm bg-primary/15 border border-primary/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary">
                    {t('dashboard:level', 'Cấp {{level}}', { level: user?.level || 1 })}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground truncate mt-0.5">Data Investigator</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-primary shrink-0">
                    {formatXP(dashboardStats.totalXp)} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 2: Active Duty Streak */}
            <div className="flex items-center gap-3 px-0 sm:px-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 shadow-2xs">
                <Flame className="size-5 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t('dashboard:streakTitle', 'Chuỗi phá án')}
                </p>
                <p className="font-mono text-sm font-bold text-foreground">
                  {dashboardStats.streak} {t('dashboard:streakUnit', 'ngày liên tiếp')}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {t('dashboard:streakSub', 'Duy trì thói quen phân tích mỗi ngày')}
                </p>
              </div>
            </div>

            {/* Metric 3: Weekly Quota & Field Hours */}
            <div className="flex items-center gap-3 px-0 sm:px-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 shadow-2xs">
                <Target className="size-5 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t('dashboard:weeklyMissionsTitle', 'Chỉ tiêu điều tra tuần')}
                </p>
                <p className="font-mono text-sm font-bold text-foreground">
                  {dashboardStats.weeklyMissions} / 5
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono truncate">
                  <Clock3 className="size-3 inline text-muted-foreground" />
                  {t('dashboard:timeSpentTitle', 'Thời gian điều tra')}: {dashboardStats.timeSpent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          [KHỐI 2] THANH CHUYỂN TRỌNG TÂM TÁC NGHIỆP TINH GỌN (TACTICAL MODE SWITCHER)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
            <Compass className="size-3.5" />
            {t('dashboard:compassTitle', 'LA BÀN ĐỊNH HƯỚNG CÁ NHÂN — BẠN MUỐN BẮT ĐẦU THEO NHU CẦU NÀO?')}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
            {t('dashboard:compassHint', 'Nhấp để chuyển trọng tâm bàn làm việc')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1.5 rounded-xl border border-border bg-card/75 shadow-xs">
          {INTENT_TRACKS.map((track) => {
            const Icon = track.icon;
            const isSelected = selectedIntent === track.id;
            const badgeText = track.badgeKey ? t(`dashboard:${track.badgeKey}`, track.badge) : track.badge;
            const titleText = track.titleKey ? t(`dashboard:${track.titleKey}`, track.title) : track.title;
            const subtitleText = track.subtitleKey ? t(`dashboard:${track.subtitleKey}`, track.subtitle) : track.subtitle;

            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectIntent(track.id)}
                className={`group relative text-left rounded-lg p-3 transition-all cursor-pointer flex items-center gap-3 border ${
                  isSelected
                    ? 'border-primary bg-primary/12 text-primary shadow-xs ring-1 ring-primary/40'
                    : 'border-transparent bg-muted/30 hover:bg-muted/70 hover:border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-md border transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                      : 'border-border/60 bg-card text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
                      {badgeText}
                    </span>
                    {isSelected && (
                      <span className="font-mono text-[8px] font-black uppercase px-1.5 py-0.2 rounded-xs bg-primary text-primary-foreground">
                        {t('dashboard:trackActive', 'Đang chọn')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5 truncate">
                    {titleText}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">
                    {subtitleText}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          [KHU VỰC 2] NHIỆM VỤ TRỌNG TÂM TIẾP THEO (ADAPTIVE NEXT BEST ACTION)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="dashboard-continue-investigation" className="relative pt-2">
        {/* Manila Folder Top Tab */}
        <div className="inline-flex items-center gap-2 rounded-t-md border-t border-x border-primary/50 bg-card px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary -mb-px relative z-10 ml-3">
          <Paperclip className="size-3" />
          <span>
            {selectedIntent === 'academy'
              ? t('dashboard:focusAcademy', 'TRỌNG TÂM ĐỀ XUẤT · HỌC VIỆN NGHIỆP VỤ TỪ CƠ BẢN')
              : selectedIntent === 'practice'
              ? t('dashboard:focusPractice', 'TRỌNG TÂM ĐỀ XUẤT · TRẠM RÈN LUYỆN KỸ NĂNG NHANH')
              : t('dashboard:focusCase', 'TRỌNG TÂM ĐỀ XUẤT · HỒ SƠ CHUYÊN ÁN #001')}
          </span>
        </div>

        {/* Mode A: Case Investigation Focus (Default) */}
        {selectedIntent === 'case' && (
          <div className="dossier-card corner-brackets rounded-md border border-primary/45 bg-card shadow-sm transition-all">
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
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                          {t('dashboard:case001Badge', 'CHUYÊN ÁN #001 // MỨC ĐỘ: NHẬP MÔN HIỆN TRƯỜNG')}
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
                            'Chỉ thị hiện trường: Xác minh khoản chênh lệch <strong class="text-foreground">4.210 kg cà phê Robusta</strong> xuất kho trái phép tại Kho A, truy tìm mã đơn hàng vi phạm và người ký duyệt.'
                          ),
                        }}
                      />
                    </div>
                  </div>

                  {/* Real Forensic Status Stamp */}
                  <span className="detective-stamp text-primary border-primary/70 hidden sm:inline-block shrink-0">
                    {case001Telemetry.status === 'CASE_CLOSED'
                      ? t('dashboard:caseClosed', 'ĐÃ PHÁ ÁN')
                      : case001Telemetry.status !== 'OPEN'
                      ? t('dashboard:investigatingPhase', 'ĐANG ĐIỀU TRA • GĐ {{phase}}/2', { phase: case001Telemetry.currentPhaseNum })
                      : t('dashboard:newDossier', 'HỒ SƠ MỚI')}
                  </span>
                </div>

                {/* Real Evidence Verification Progress Bar */}
                <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                      {t('dashboard:actualProgress', 'TIẾN ĐỘ THỰC TẾ')}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-sm bg-muted border border-border">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${case001Telemetry.percent}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-primary shrink-0">
                      {case001Telemetry.percent}%
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {t('dashboard:evidenceOpened', 'TANG VẬT ĐÃ MỞ: 0{{viewed}}/0{{total}} HỒ SƠ', {
                      viewed: case001Telemetry.viewedCount,
                      total: case001Telemetry.totalSources,
                    })}
                  </span>
                </div>
              </div>

              {/* Right 4 Cols: Perforated Warrant Stub & Dominant Action */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-dashed border-primary/40 bg-muted/35 p-5 sm:p-6 flex flex-col justify-between gap-4">
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('dashboard:toolsRequired', 'CÔNG CỤ NGHIỆP VỤ:')}</span>
                    <span className="font-bold text-primary">{t('dashboard:basicExcel', 'EXCEL CƠ BẢN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('dashboard:estimatedDuration', 'THỜI LƯỢNG DỰ KIẾN:')}</span>
                    <span className="font-bold text-foreground">{t('dashboard:duration20Min', '~20 PHÚT')}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('dashboard:reward', 'PHẦN THƯỞNG:')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+250 XP</span>
                  </div>
                </div>

                <Link
                  to="/cases/case-001"
                  className="inline-flex w-full items-center justify-between gap-2.5 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
                  title="Xem Hồ Sơ Vụ Án & Giao Nhiệm Vụ"
                >
                  <div className="flex flex-col text-left">
                    <span className="leading-tight text-sm font-bold">
                      {case001Telemetry.status !== 'OPEN'
                        ? t('dashboard:continueCase001', 'Tiếp Tục Hồ Sơ Vụ Án #001')
                        : t('dashboard:startCase001', 'Đọc Hồ Sơ & Bắt Đầu Phá Án')}
                    </span>
                    <span className="font-mono text-[10px] opacity-85">
                      {t('dashboard:case001StubDesc', 'Xem tóm tắt hiện trường trước khi vào bàn khám nghiệm')}
                    </span>
                  </div>
                  <ArrowUpRight className="size-5 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mode B: Academy Foundation Focus */}
        {selectedIntent === 'academy' && (
          <div className="dossier-card corner-brackets rounded-md border border-primary/45 bg-card shadow-sm transition-all">
            <div className="grid lg:grid-cols-12">
              <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary/15 border border-primary/35 text-primary shadow-2xs">
                    <GraduationCap className="size-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                      {t('dashboard:academyBadge', 'HỌC TỪ CƠ BẢN // NỀN TẢNG NGHIỆP VỤ')}
                    </span>
                    <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {t('dashboard:academyFocusTitle', 'Học Viện Nghiệp Vụ Điều Tra Dữ Liệu (Excel & SQL)')}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {t(
                        'dashboard:academyFocusDesc',
                        'Nếu bạn chưa quen với công thức bảng tính hay câu lệnh truy vấn, hãy bắt đầu tại Học viện nghiệp vụ. Mỗi bài học đều có lý thuyết cô đọng, ví dụ minh họa trực quan và bài kiểm tra nhỏ trước khi bước vào vụ án thật.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/70 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
                  <span>{t('dashboard:academyStep1', '• Bước 1: Đọc cẩm nang nghiệp vụ')}</span>
                  <span>{t('dashboard:academyStep2', '• Bước 2: Thử nghiệm ví dụ mẫu')}</span>
                  <span>{t('dashboard:academyStep3', '• Bước 3: Thi sát hạch cấp chứng chỉ')}</span>
                </div>
              </div>

              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-dashed border-primary/40 bg-muted/35 p-5 sm:p-6 flex flex-col justify-between gap-3">
                <Link
                  to="/academy"
                  className="inline-flex w-full items-center justify-between gap-2.5 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95 transition-all"
                >
                  <div className="flex flex-col text-left">
                    <span className="leading-tight text-sm font-bold">{t('dashboard:enterAcademy', 'Vào Học Viện Nghiệp Vụ')}</span>
                    <span className="font-mono text-[10px] opacity-85">
                      {t('dashboard:enterAcademySub', 'Học bài đầu tiên theo lộ trình chuẩn')}
                    </span>
                  </div>
                  <ArrowUpRight className="size-5 shrink-0" />
                </Link>

                <Link
                  to="/knowledge"
                  className="inline-flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:border-primary/40 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    {t('dashboard:lookupKnowledge', 'Tra cứu Kho Tri Thức nhanh')}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mode C: Practice & Skill Drill Focus */}
        {selectedIntent === 'practice' && (
          <div className="dossier-card corner-brackets rounded-md border border-primary/45 bg-card shadow-sm transition-all">
            <div className="grid lg:grid-cols-12">
              <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary/15 border border-primary/35 text-primary shadow-2xs">
                    <Dumbbell className="size-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                      {t('dashboard:practiceBadge', 'RÈN KỸ NĂNG NHANH // THỰC HÀNH TRỰC TIẾP')}
                    </span>
                    <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {t('dashboard:practiceFocusTitle', 'Phòng Luyện Tập & Bản Đồ Nhiệm Vụ Ngắn')}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {t(
                        'dashboard:practiceFocusDesc',
                        'Thích hợp khi bạn có 5–10 phút rảnh và muốn rèn phản xạ viết công thức Excel hoặc truy vấn SQL trên dữ liệu mẫu mà không cần đọc cốt truyện dài.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/70 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
                  <span>{t('dashboard:practiceSandboxFeature', '• Sandbox Excel & SQL tự do')}</span>
                  <span>{t('dashboard:practiceAutoGrading', '• Chấm điểm tự động tức thì')}</span>
                  <span>{t('dashboard:completedMissionsStat', '• Đã hoàn thành: {{count}} nhiệm vụ', { count: dashboardStats.completedMissionsCount })}</span>
                </div>
              </div>

              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-dashed border-primary/40 bg-muted/35 p-5 sm:p-6 flex flex-col justify-between gap-3">
                <Link
                  to="/practice"
                  className="inline-flex w-full items-center justify-between gap-2.5 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95 transition-all"
                >
                  <div className="flex flex-col text-left">
                    <span className="leading-tight text-sm font-bold">{t('dashboard:enterPracticeLab', 'Vào Phòng Luyện Tập')}</span>
                    <span className="font-mono text-[10px] opacity-85">
                      {t('dashboard:enterPracticeLabSub', 'Chọn chủ đề Excel / SQL để thực hành')}
                    </span>
                  </div>
                  <ArrowUpRight className="size-5 shrink-0" />
                </Link>

                <Link
                  to="/map"
                  className="inline-flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:border-primary/40 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Map className="size-4 text-primary" />
                    {t('dashboard:openMissionMap', 'Mở Bản Đồ Nhiệm Vụ Theo Chương')}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          [KHỐI 4] TRẠM ĐIỀU HÀNH & KHO TÀI NGUYÊN (OPERATIONS HUB & REPOSITORIES)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
            <FolderOpen className="size-3.5" />
            {t('dashboard:operationsHubTitle', 'TRẠM TÁC NGHIỆP CHUYÊN SÂU // KHO TÀI NGUYÊN NGHIỆP VỤ')}
          </span>
        </div>

        {/* 3 Distinct Operations Stations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Station 1: Academy Curriculum */}
          <Link
            to="/academy"
            className="dossier-card group rounded-xl border border-border bg-card p-4 hover:border-primary/60 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                  {t('dashboard:station1Badge', 'TRẠM 01 // KIẾN THỨC CỐT LÕI')}
                </span>
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="size-4" />
                </span>
              </div>
              <h4 className="mt-2 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {t('dashboard:station1Title', '1. Học Viện Nghiệp Vụ')}
              </h4>
              <span className="inline-block mt-0.5 font-mono text-[10px] text-primary/90 font-medium">
                {t('dashboard:station1Sub', 'Giáo trình bài bản W3Schools')}
              </span>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {t('dashboard:station1Desc', 'Học bài bản các hàm Excel và câu lệnh SQL từ cơ bản đến nâng cao kèm bài thi cấp chứng chỉ.')}
              </p>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                {courses.data?.length || 2} chuyên đề
              </span>
              <span className="font-mono text-[11px] font-bold text-primary inline-flex items-center gap-1">
                {t('dashboard:station1Cta', 'Vào Học viện')} <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Station 2: Mission Map */}
          <Link
            to="/map"
            className="dossier-card group rounded-xl border border-border bg-card p-4 hover:border-primary/60 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                  {t('dashboard:station2Badge', 'TRẠM 02 // BÀI TẬP THEO CHƯƠNG')}
                </span>
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Map className="size-4" />
                </span>
              </div>
              <h4 className="mt-2 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {t('dashboard:station2Title', '2. Bản Đồ Nhiệm Vụ Ngắn')}
              </h4>
              <span className="inline-block mt-0.5 font-mono text-[10px] text-primary/90 font-medium">
                {t('dashboard:station2Sub', 'Thử thách ngắn 5–10 phút')}
              </span>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {t('dashboard:station2Desc', 'Rèn thao tác qua từng nhiệm vụ nhỏ 5–10 phút được sắp xếp tuần tự từ dễ đến khó.')}
              </p>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                Lộ trình 4 chương
              </span>
              <span className="font-mono text-[11px] font-bold text-primary inline-flex items-center gap-1">
                {t('dashboard:station2Cta', 'Mở Bản đồ nhiệm vụ')} <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Station 3: Case Investigations */}
          <Link
            to="/cases"
            className="dossier-card group rounded-xl border border-border bg-card p-4 hover:border-primary/60 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                  {t('dashboard:station3Badge', 'TRẠM 03 // THỰC CHIẾN TỔNG HỢP')}
                </span>
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="size-4" />
                </span>
              </div>
              <h4 className="mt-2 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {t('dashboard:station3Title', '3. Chuyên Án Điều Tra')}
              </h4>
              <span className="inline-block mt-0.5 font-mono text-[10px] text-amber-500 font-bold uppercase">
                {t('dashboard:station3Sub', 'Chuyên án trọng điểm')}
              </span>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {t('dashboard:station3Desc', 'Vào vai thám tử khám nghiệm tang vật, phân tích lời khai nhân chứng và gửi kết luận lên Sở Chỉ Huy.')}
              </p>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                Đại án đa giai đoạn
              </span>
              <span className="font-mono text-[11px] font-bold text-primary inline-flex items-center gap-1">
                {t('dashboard:station3Cta', 'Chọn Chuyên án')} <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Split Board: Left (Courses) | Right (Short Missions) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <section
          id="dashboard-active-courses"
          aria-busy={courses.loading ? 'true' : undefined}
          className="lg:col-span-5 flex flex-col"
        >
          <div className="flex items-end justify-between border-b border-border pb-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4 text-primary shrink-0" />
              <h3 className="text-base font-bold text-foreground tracking-tight">
                {t('dashboard:specializedDataInvestigation', 'Chuyên đề đào tạo & Nghiệp vụ')}
              </h3>
            </div>
            <Link
              to="/courses"
              className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
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
                <CaseDossierCard
                  key={course.id}
                  course={course}
                  index={idx + 1}
                  completedMissionsCount={dashboardStats.completedMissionsCount}
                />
              ))
            )}
          </div>
        </section>

        <section
          id="dashboard-recommended-missions"
          aria-busy={recommended.loading ? 'true' : undefined}
          className="lg:col-span-7 flex flex-col"
        >
          <div className="flex items-end justify-between border-b border-border pb-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-primary shrink-0" />
              <h3 className="text-base font-bold text-foreground tracking-tight">
                {t('dashboard:casesNeedCoordination', 'Nhiệm vụ ngắn rèn thao tác')}
              </h3>
            </div>
            <Link
              to="/map"
              className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Bản đồ nhiệm vụ <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="rounded-md border border-border bg-card overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 border-b border-border bg-muted/60 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="col-span-2">MÃ NV</span>
              <span className="col-span-6">BÀI TẬP THỰC HÀNH</span>
              <span className="col-span-2">CÔNG CỤ</span>
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

function CaseDossierCard({ course, index, completedMissionsCount = 0 }) {
  const { t } = useTranslation(['dashboard']);
  const isExcel = course.tool === 'excel';
  const total = course.totalMissions || 12;
  const progress = Math.min(100, Math.round((completedMissionsCount / total) * 100));

  return (
    <Link
      to={`/courses/${course.slug || course.id}`}
      className="dossier-card group rounded-md border border-border bg-card p-4 pl-5 transition-all hover:border-primary/60 hover:shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-primary">[0{index}]</span>
            <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 border border-primary/25 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              {isExcel ? <FileSpreadsheet className="size-3" /> : <Database className="size-3" />}
              {course.tool?.toUpperCase()}
            </span>
          </div>
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
            {t('dashboard:totalMissions', '{{count}} bài học', { count: total })}
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
        <span className="font-mono text-[11px] text-muted-foreground">
          {progress > 0 ? 'Tiến độ khóa học' : 'Sẵn sàng bắt đầu'}
        </span>
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
      <div className="sm:col-span-2 flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-primary">{serialCode}</span>
      </div>

      <div className="sm:col-span-6 min-w-0">
        <p className="truncate font-bold text-sm text-foreground group-hover:text-primary transition-colors">
          {mission.title}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
          Thời lượng dự kiến: {formatDuration(mission.estimatedDuration)}
        </p>
      </div>

      <div className="sm:col-span-2 flex items-center">
        <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-foreground">
          {isExcel ? (
            <FileSpreadsheet className="size-3 text-primary" />
          ) : (
            <Database className="size-3 text-primary" />
          )}
          {mission.tool}
        </span>
      </div>

      <div className="sm:col-span-2 flex items-center justify-end gap-2">
        <span className="font-mono text-xs font-bold text-primary">+{mission.rewardXp} XP</span>
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-transform" />
      </div>
    </Link>
  );
}
