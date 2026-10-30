import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import {
  MapPin,
  CheckCircle2,
  Lock,
  Play,
  Zap,
  BookOpen,
  Layers,
  Compass,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  FolderKanban,
} from 'lucide-react';
import {
  learningMapService,
  learningMapAdapter,
} from '../../services/index.js';
import { useProgress } from '../../hooks/useProgress.js';
import { Skeleton, LearningMapSkeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { getSkillMasteryLevel } from '../../domain/mastery/masteryEvaluator.js';
import { useTranslation } from 'react-i18next';

export function LearningMapPage() {
  const { user } = useAuth();
  const { t } = useTranslation(['map', 'common']);
  const { progressList, masteryList, overallMastery, loading: progressLoading } = useProgress(user?.id);

  const [mapRawData, setMapRawData] = useState(null);
  const [activePhaseId, setActivePhaseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMapData() {
      const fetchStart = performance.now();
      console.log('[Map Benchmark] Navigated -> Fetch Started');
      setLoading(true);
      setError(null);
      try {
        const res = await learningMapService.getLearningMapTree();
        if (res?.error || !res?.data || res.data.length === 0) {
          if (isMounted) {
            setError(res?.error || t('map:notFound', 'Không tìm thấy dữ liệu lộ trình học tập.'));
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setMapRawData(res.data);
        }
      } catch (err) {
        if (isMounted) setError(t('map:fetchError', 'Không thể tải dữ liệu bản đồ lộ trình học tập.'));
      } finally {
        if (isMounted) setLoading(false);
        const fetchEnd = performance.now();
        console.log(`[Map Benchmark] Data Fetch Complete in ${(fetchEnd - fetchStart).toFixed(0)} ms`);
      }
    }

    loadMapData();

    return () => {
      isMounted = false;
    };
  }, []);

  const journeyMap = useMemo(() => {
    if (!mapRawData) return null;
    return learningMapAdapter.buildJourneyMapFromReadModel({
      courseViews: mapRawData,
      progressList,
    });
  }, [mapRawData, progressList]);

  useEffect(() => {
    if (journeyMap?.phases && journeyMap.phases.length > 0 && !activePhaseId) {
      const activeP = journeyMap.phases.find((p) => p.status === 'in_progress') || journeyMap.phases[0];
      setActivePhaseId(activeP.id);
    }
  }, [journeyMap, activePhaseId]);

  const phases = journeyMap?.phases || [];
  const activePhase = phases.find((p) => p.id === activePhaseId) || phases[0];
  const summary = journeyMap?.journeySummary || {
    totalPhases: 0,
    totalChapters: 0,
    totalInvestigations: 0,
    totalXp: 0,
    overallProgress: 0,
  };

  const isInitialLoading = loading || progressLoading;

  useEffect(() => {
    if (!isInitialLoading) {
      console.log('[Map Benchmark] Data Rendered / Page Usable');
    } else {
      console.log('[Map Benchmark] Skeleton Rendered');
    }
  }, [isInitialLoading]);

  if (isInitialLoading) return <LearningMapSkeleton />;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-7 animate-fade-in pb-12">
      {/* ── Section 1: Bureau Investigation Master Board Header ── */}
      <section className="dossier-card corner-brackets rounded-md border border-border bg-card p-6 shadow-sm sm:p-7 bg-forensic-grid">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm border border-primary/35 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary mb-2.5">
              <Compass className="size-3.5" /> {t('map:investigationJourney', 'Lộ Trình Hành Trình Điều Tra')}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t('map:title', 'Bản Đồ Học Tập')}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('map:subtitle', 'Theo dõi tiến trình thám tử dữ liệu của bạn trên toàn bộ các Giai đoạn (Phase) học tập.')}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 rounded-sm border border-primary/40 bg-background/90 px-4 py-3">
            <FolderKanban className="size-5 text-primary" />
            <div>
              <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t('map:overallProgressTitle', 'Tổng tiến độ')}
              </p>
              <p className="font-mono text-base font-bold text-primary">
                {t('map:overallProgress', '{{percent}}% Hoàn thành', { percent: summary.overallProgress })}
              </p>
            </div>
          </div>
        </div>

        {/* Bureau Telemetry Ledger Strip */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-border">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary shrink-0">
              <Compass className="size-4" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase">{t('map:phaseTitle', 'Giai đoạn (Phase)')}</p>
              <p className="font-mono text-sm font-bold text-foreground">{t('map:phases', '{{count}} Phase', { count: summary.totalPhases })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:pl-4">
            <div className="grid size-9 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary shrink-0">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase">{t('map:chapterTitle', 'Số chương')}</p>
              <p className="font-mono text-sm font-bold text-foreground">{t('map:chapters', '{{count}} Chương', { count: summary.totalChapters })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:pl-4">
            <div className="grid size-9 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary shrink-0">
              <BookOpen className="size-4" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase">{t('map:investigationTitle', 'Tổng vụ án')}</p>
              <p className="font-mono text-sm font-bold text-foreground">{t('map:investigations', '{{count}} Vụ án', { count: summary.totalInvestigations })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:pl-4">
            <div className="grid size-9 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary shrink-0">
              <Zap className="size-4" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase">{t('map:xpTitle', 'Tổng XP')}</p>
              <p className="font-mono text-sm font-bold text-primary">{t('map:xp', '+{{amount}} XP', { amount: summary.totalXp })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Forensic Skill Mastery Calibration Panel ── */}
      {masteryList.length > 0 && (
        <section className="rounded-md border border-border bg-card p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground tracking-tight">
                {t('map:skillMastery', 'Độ Thành Thạo Kỹ Năng (Skill Mastery)')}
              </h3>
            </div>
            <Badge
              variant="primary"
              size="sm"
            >
              {t('map:level', 'Cấp độ:')} {overallMastery.overallLevel.name}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {masteryList.map((skill) => {
              const skillNameMap = {
                excel_formula: 'Công thức Excel',
                sql_query: 'Truy vấn SQL Engine',
                data_analysis: 'Phân tích dữ liệu',
              };
              const title = skillNameMap[skill.skillId] || skill.skillId;
              const skillLevel = getSkillMasteryLevel(skill.masteryScore);

              return (
                <div key={skill.skillId} className="rounded-sm border border-border bg-background/70 p-3.5">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-foreground">{title}</span>
                    <span className="font-mono text-primary">{skill.masteryScore}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(100, skill.masteryScore)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>{t('map:correctAttempts', '{{success}}/{{total}} lượt đúng', { success: skill.successfulAttempts, total: skill.totalAttempts })}</span>
                    <span className="font-bold text-foreground">
                      {t('map:rank', 'Cấp:')} {skillLevel.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Section 3: File Cabinet Folder Index Tabs ── */}
      {phases.length > 0 && (
        <nav
          aria-label="Danh sách giai đoạn học tập"
          className="flex items-end gap-2 overflow-x-auto border-b-2 border-border pt-1 scrollbar-none"
        >
          {phases.map((phase, pIdx) => {
            const isActive = phase.id === activePhaseId;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhaseId(phase.id)}
                className={`flex items-center gap-2.5 rounded-t-md border-t-2 border-x-2 px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-primary bg-card text-foreground -mb-[2px] shadow-2xs'
                    : 'border-border/70 bg-muted/50 text-muted-foreground hover:bg-card/70 hover:text-foreground'
                }`}
              >
                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'
                }`}>
                  0{pIdx + 1}
                </span>
                <span className="truncate max-w-[180px]">{phase.title}</span>
                {phase.completionPercentage > 0 && (
                  <Badge variant={isActive ? 'primary' : 'success'} size="sm">
                    {phase.completionPercentage}%
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Section 4: Pinboard Evidence Chain per Phase ── */}
      <section className="flex flex-col gap-6" aria-busy={isInitialLoading ? 'true' : undefined}>
        {isInitialLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-20 rounded-md" />
            <Skeleton className="h-32 rounded-md" />
            <Skeleton className="h-32 rounded-md" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : !activePhase || activePhase.chapters.length === 0 ? (
          <EmptyState
            type="empty"
            title={t('map:noDataTitle', 'Chưa có dữ liệu giai đoạn')}
            description={t('map:noDataDesc', 'Giai đoạn này đang được cập nhật thêm các chương vụ án mới.')}
          />
        ) : (
          <div className="relative flex flex-col gap-8">
            {/* Phase Dossier Banner Header */}
            <div className="dossier-card rounded-md border border-border bg-card p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">
                    {t('map:currentPhase', 'Giai đoạn hiện tại')} // ARCHIVE
                  </span>
                </div>
                <Link to={`/courses/${activePhase.courseId || activePhase.id.replace('phase-', '')}`} className="block">
                  <h2 className="font-display text-xl font-bold text-foreground hover:text-primary transition-colors">{activePhase.title}</h2>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">{activePhase.description}</p>
              </div>
              <div className="shrink-0">
                <Badge variant={activePhase.tool === 'sql' ? 'warning' : 'primary'} size="md">
                  {activePhase.tool === 'sql' ? (
                    <>
                      <Database className="size-3" /> SQL Engine
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="size-3" /> Excel Worksheet
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Dashed Investigation Thread Line */}
            <div className="absolute left-5 top-[120px] bottom-8 border-l-2 border-dashed border-primary/50 hidden sm:block" />

            {activePhase.chapters.map((chapter, chIdx) => {
              const investigations = chapter.investigations || [];
              const cleanTitle = chapter.title ? chapter.title.replace(/^Chương \d+:\s*/i, '') : '';

              return (
                <div key={chapter.id} className="relative flex flex-col gap-3.5">
                  {/* Chapter Milestone Pin Header */}
                  <div className="flex items-start gap-3.5 z-10">
                    <div className="grid size-10 shrink-0 place-items-center rounded-sm border border-primary bg-primary font-mono text-xs font-bold text-primary-foreground shadow-2xs mt-1">
                      <MapPin className="size-4" />
                    </div>
                    <div className="rounded-md border border-border bg-card p-4 shadow-2xs flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">
                          {t('map:chapter', 'Chương {{index}}', { index: chIdx + 1 })}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {investigations.length} HỒ SƠ
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-0.5">{cleanTitle || chapter.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{chapter.description}</p>
                    </div>
                  </div>

                  {/* Investigation Evidence Node List */}
                  <div className="pl-3 sm:pl-14 flex flex-col gap-3">
                    {investigations.map((node, mIdx) => (
                      <MissionNodeCard
                        key={node.id}
                        mission={node}
                        chapterIndex={chIdx + 1}
                        missionIndex={mIdx + 1}
                        isCompleted={node.isCompleted}
                        isCurrent={node.isCurrent}
                        isLocked={node.isLocked}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Evidence Node Card Sub-component ── */
function MissionNodeCard({
  mission,
  chapterIndex,
  missionIndex,
  isCompleted,
  isCurrent,
  isLocked,
  t,
}) {
  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border p-4 transition-all duration-200 ${
        isCurrent
          ? 'dossier-card border-primary bg-card shadow-sm'
          : isLocked
          ? 'border-border bg-muted/40 opacity-75'
          : 'border-border bg-card hover:border-primary/50 hover:shadow-2xs'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`grid size-9 shrink-0 place-items-center rounded-sm border font-mono text-xs font-bold transition-all ${
            isCompleted
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : isCurrent
              ? 'border-primary bg-primary text-primary-foreground'
              : isLocked
              ? 'border-border bg-muted text-muted-foreground'
              : 'border-primary/30 bg-primary/10 text-primary'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="size-4" />
          ) : isLocked ? (
            <Lock className="size-3.5" />
          ) : (
            `${chapterIndex}.${missionIndex}`
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
              EVID-{chapterIndex}.{missionIndex} // {t('map:case', 'Vụ án {{index}}', { index: missionIndex })}
            </span>
            {isCurrent && (
              <Badge variant="warning" size="sm">
                {t('map:nextLesson', 'Bài tiếp theo')}
              </Badge>
            )}
            {isCompleted && (
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                [ĐÃ XÁC MINH]
              </span>
            )}
          </div>
          <Link to={mission.targetUrl || `/missions/${mission.id}`} className="block mt-1">
            <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {mission.title}
            </h4>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {mission.objective}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60 shrink-0">
        <span className="font-mono text-xs font-bold text-primary">
          +{mission.rewardXp} XP
        </span>

        {isLocked ? (
          <button
            disabled
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted px-3 py-1.5 font-mono text-[11px] font-bold text-muted-foreground cursor-not-allowed"
          >
            <Lock className="size-3" /> {t('map:locked', 'Chưa mở khóa')}
          </button>
        ) : (
          <Link
            to={mission.targetUrl || `/missions/${mission.id}`}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 font-mono text-xs font-bold transition-all ${
              isCurrent
                ? 'bg-primary text-primary-foreground shadow-2xs hover:opacity-90'
                : 'border border-primary/35 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            <Play className="size-3 fill-current" /> {isCurrent ? t('map:startNow', 'Làm bài ngay') : t('map:practice', 'Luyện tập')}
          </Link>
        )}
      </div>
    </div>
  );
}
