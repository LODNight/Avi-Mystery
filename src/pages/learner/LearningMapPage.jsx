import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import {
  MapPin,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Zap,
  BookOpen,
  Layers,
  Compass,
  ShieldCheck,
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

export function LearningMapPage() {
  const { user } = useAuth();
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
        // Fetch the materialized Read Model
        const res = await learningMapService.getLearningMapTree();
        if (res?.error || !res?.data || res.data.length === 0) {
          if (isMounted) {
            setError(res?.error || 'Không tìm thấy dữ liệu lộ trình học tập.');
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setMapRawData(res.data);
        }
      } catch (err) {
        if (isMounted) setError('Không thể tải dữ liệu bản đồ lộ trình học tập.');
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

  // Synchronously calculate journeyMap from raw map data and dynamic progressList
  const journeyMap = useMemo(() => {
    if (!mapRawData) return null;
    return learningMapAdapter.buildJourneyMapFromReadModel({
      courseViews: mapRawData,
      progressList,
    });
  }, [mapRawData, progressList]);

  // Set initial active phase if not set
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
    <div className="mx-auto flex max-w-5xl flex-col gap-8 animate-fade-in">
      {/* ── Section 1: Journey Progression Header ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3">
              <Compass className="size-3.5" /> Lộ Trình Hành Trình Điều Tra
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Bản Đồ Học Tập
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Theo dõi tiến trình thám tử dữ liệu của bạn trên toàn bộ các Giai đoạn (Phase) học tập.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <Sparkles className="size-6 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Tổng tiến độ</p>
              <p className="text-lg font-bold text-foreground">{summary.overallProgress}% Hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Gamification Journey Stats Strip */}
        <div className="mt-6 pt-6 border-t border-border/80 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Compass className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Giai đoạn (Phase)</p>
              <p className="text-sm font-bold text-foreground">{summary.totalPhases} Phase</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Số chương</p>
              <p className="text-sm font-bold text-foreground">{summary.totalChapters} Chương</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Tổng vụ án</p>
              <p className="text-sm font-bold text-foreground">{summary.totalInvestigations} Vụ án</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-500">
              <Zap className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Tổng XP</p>
              <p className="text-sm font-bold text-foreground">+{summary.totalXp} XP</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Skill Mastery Summary Panel ── */}
      {masteryList.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-amber-500" />
              <h3 className="font-bold text-base text-foreground">Độ Thành Thạo Kỹ Năng (Skill Mastery)</h3>
            </div>
            <Badge
              variant="outline"
              size="sm"
              className={`font-semibold ${overallMastery.overallLevel.border || 'border-amber-500/30'} ${overallMastery.overallLevel.bg || 'bg-amber-500/10'} ${overallMastery.overallLevel.color || 'text-amber-600 dark:text-amber-400'}`}
            >
              Cấp độ: {overallMastery.overallLevel.badge} {overallMastery.overallLevel.name}
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
                <div key={skill.skillId} className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-foreground">{title}</span>
                    <span className="text-amber-600 dark:text-amber-400">{skill.masteryScore}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, skill.masteryScore)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{skill.successfulAttempts}/{skill.totalAttempts} lượt đúng</span>
                    <span className={`font-semibold ${skillLevel.color}`}>
                      Cấp: {skillLevel.badge} {skillLevel.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Section 3: Phase Navigation Tabs ── */}
      {phases.length > 0 && (
        <nav aria-label="Danh sách giai đoạn học tập" className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {phases.map((phase, pIdx) => {
            const isActive = phase.id === activePhaseId;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhaseId(phase.id)}
                className={`flex items-center gap-3 rounded-2xl border px-5 py-3 text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span className={`grid size-6 place-items-center rounded-full font-mono text-[10px] font-bold ${
                  isActive ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {pIdx + 1}
                </span>
                <span className="truncate max-w-[180px]">{phase.title}</span>
                {phase.completionPercentage > 0 && (
                  <Badge variant={isActive ? 'outline' : 'success'} size="sm">
                    {phase.completionPercentage}%
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Section 4: Gamified Node Tree Map per Phase ── */}
      <section className="flex flex-col gap-8" aria-busy={isInitialLoading ? 'true' : undefined}>
        {isInitialLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : !activePhase || activePhase.chapters.length === 0 ? (
          <EmptyState
            type="empty"
            title="Chưa có dữ liệu giai đoạn"
            description="Giai đoạn này đang được cập nhật thêm các chương vụ án mới."
          />
        ) : (
          <div className="relative flex flex-col gap-10">
            {/* Phase Banner Header */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="mb-1">
                  <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    Giai đoạn hiện tại
                  </span>
                </div>
                <Link to={`/courses/${activePhase.courseId || activePhase.id.replace('phase-', '')}`} className="block">
                  <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors">{activePhase.title}</h2>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{activePhase.description}</p>
              </div>
              <div className="text-right">
                <Badge variant={activePhase.tool === 'sql' ? 'warning' : 'primary'} size="default">
                  {activePhase.tool === 'sql' ? '🔍 SQL Engine' : '📊 Excel Worksheet'}
                </Badge>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="absolute left-6 top-[135px] bottom-10 w-1 bg-gradient-to-b from-amber-500/80 via-primary/40 to-muted rounded-full hidden sm:block" />

            {activePhase.chapters.map((chapter, chIdx) => {
              const investigations = chapter.investigations || [];
              const cleanTitle = chapter.title ? chapter.title.replace(/^Chương \d+:\s*/i, '') : '';

              return (
                <div key={chapter.id} className="relative flex flex-col gap-4">
                  {/* Chapter Milestone Banner Header */}
                  <div className="flex items-center gap-4 z-10">
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500 font-bold text-amber-950 shadow-lg shadow-amber-500/20">
                      <MapPin className="size-6" />
                    </div>
                    <div className="rounded-2xl border border-amber-500/30 bg-card p-4 shadow-sm flex-1">
                      <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                        Chương {chIdx + 1}
                      </span>
                      <h3 className="text-base font-bold text-foreground">{cleanTitle || chapter.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{chapter.description}</p>
                    </div>
                  </div>

                  {/* Investigation Node List */}
                  <div className="pl-4 sm:pl-16 flex flex-col gap-4">
                    {investigations.map((node, mIdx) => (
                      <MissionNodeCard
                        key={node.id}
                        mission={node}
                        chapterIndex={chIdx + 1}
                        missionIndex={mIdx + 1}
                        isCompleted={node.isCompleted}
                        isCurrent={node.isCurrent}
                        isLocked={node.isLocked}
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

/* ── Node Card Sub-component ── */
function MissionNodeCard({
  mission,
  chapterIndex,
  missionIndex,
  isCompleted,
  isCurrent,
  isLocked,
}) {
  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-200 ${
        isCurrent
          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary'
          : isLocked
          ? 'border-border bg-muted/40 opacity-70'
          : 'border-border bg-card hover:border-primary/40 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-emerald-500 text-white'
              : isCurrent
              ? 'bg-primary text-primary-foreground animate-pulse'
              : isLocked
              ? 'bg-muted text-muted-foreground'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="size-5" />
          ) : isLocked ? (
            <Lock className="size-4" />
          ) : (
            `${chapterIndex}.${missionIndex}`
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
              Vụ án {missionIndex}
            </span>
            {isCurrent && (
              <Badge variant="warning" size="sm">
                Bài tiếp theo
              </Badge>
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

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
          +{mission.rewardXp} XP
        </span>

        {isLocked ? (
          <button
            disabled
            className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3.5 py-2 text-xs font-bold text-muted-foreground cursor-not-allowed"
          >
            <Lock className="size-3.5" /> Chưa mở khóa
          </button>
        ) : (
          <Link
            to={mission.targetUrl || `/missions/${mission.id}`}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              isCurrent
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            <Play className="size-3.5 fill-current" /> {isCurrent ? 'Làm bài ngay' : 'Luyện tập'}
          </Link>
        )}
      </div>
    </div>
  );
}
