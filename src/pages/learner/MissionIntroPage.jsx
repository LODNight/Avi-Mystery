import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Target,
  FileSpreadsheet,
  Database,
  Zap,
  Clock,
  HelpCircle,
  Play,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { missionService, courseService } from '../../services/index.js';
import { formatDuration, difficultyLabel, toolLabel, formatXP } from '../../utils/format.js';
import { Skeleton, MissionIntroSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export function MissionIntroPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMissionDetail() {
      setLoading(true);
      setError(null);

      try {
        const idToFetch = missionId || 'mission-001';
        const res = await missionService.getMission(idToFetch);

        if (res.error || !res.data) {
          if (isMounted) {
            setError(res.error || `Không tìm thấy vụ án mã "${idToFetch}".`);
            setLoading(false);
          }
          return;
        }

        const missionData = res.data;
        if (isMounted) setMission(missionData);

        // Optional: fetch associated course info
        if (missionData.courseId) {
          const courseRes = await courseService.getCourse(missionData.courseId);
          if (courseRes.data && isMounted) {
            setCourse(courseRes.data);
          }
        }
      } catch (err) {
        if (isMounted) setError('Không thể tải thông tin giới thiệu vụ án.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMissionDetail();

    return () => {
      isMounted = false;
    };
  }, [missionId]);

  if (loading) {
    return <MissionIntroSkeleton />;
  }

  if (error || !mission) {
    return (
      <div className="mx-auto max-w-4xl flex flex-col gap-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" /> Quay lại
        </button>
        <ErrorState
          message={error || 'Không tìm thấy chi tiết vụ án này.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const toolIcon = mission.tool === 'excel' ? <FileSpreadsheet className="size-5 text-emerald-500" /> : <Database className="size-5 text-cyan-500" />;
  const badgeVariant =
    mission.difficulty === 'beginner' || mission.difficulty === 'easy'
      ? 'success'
      : mission.difficulty === 'intermediate' || mission.difficulty === 'medium'
      ? 'warning'
      : 'danger';

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 animate-fade-in">
      {/* ── Top Back Navigation Bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Bản đồ nhiệm vụ
        </button>

        {course && (
          <span className="text-xs font-medium text-muted-foreground">
            Khóa học: <strong className="text-foreground">{course.title}</strong>
          </span>
        )}
      </div>

      {/* ── Section 1: Hero Detective Briefing Header ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-12 size-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Briefcase className="size-3.5" /> Hồ sơ vụ án #{mission.id}
            </div>
            <Badge variant={badgeVariant} size="md">
              {difficultyLabel(mission.difficulty)}
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-mono text-xs font-bold text-muted-foreground uppercase">
              {toolIcon} {toolLabel(mission.tool)}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {mission.title}
          </h1>

          {/* Quick Info Badges */}
          <div className="flex items-center gap-6 flex-wrap pt-2 text-xs font-medium text-muted-foreground border-t border-border/60">
            <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <Zap className="size-4" /> +{formatXP(mission.rewardXp)} Thưởng
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-cyan-500" /> Thời gian ước tính: {formatDuration(mission.estimatedDuration)}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" /> Trạng thái: Sẵn sàng nhận vụ án
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Case Story & Context (Detective Briefing) ── */}
      <section className="rounded-3xl border border-amber-500/30 bg-card p-6 shadow-sm sm:p-8 relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid size-10 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Bối Cảnh Vụ Án (Detective Briefing)</h2>
            <p className="text-xs text-muted-foreground">Thông tin hiện trường & cuộc gọi từ khách hàng</p>
          </div>
        </div>

        <blockquote className="rounded-2xl border-l-4 border-amber-500 bg-muted/40 p-4 italic text-sm leading-relaxed text-foreground">
          "{mission.story}"
        </blockquote>
      </section>

      {/* ── Section 3: Objectives & Technical Details Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objective Box */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                <Target className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Nhiệm Vụ Cần Giải Quyết</h3>
                <p className="text-xs text-muted-foreground">Mục tiêu kiểm tra chính</p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 sm:p-5 flex items-start gap-3 shadow-sm">
              <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white font-bold text-xs">
                ✓
              </div>
              <p className="text-sm font-semibold leading-relaxed text-foreground">
                {mission.objective}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
            <Award className="size-4 text-amber-500" /> Hoàn thành mục tiêu để nhận ngay +{mission.rewardXp} XP
          </div>
        </section>

        {/* Dataset & Target Details Box */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-500">
                <Database className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Thông Tin Dataset</h3>
                <p className="text-xs text-muted-foreground">Dữ liệu & vị trí làm bài</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground">Mã Dataset:</span>
                <span className="font-mono font-bold text-foreground">{mission.datasetId || 'ds-001'}</span>
              </div>

              {mission.starterContent?.targetSheet && (
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Sheet mục tiêu:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {mission.starterContent.targetSheet}
                  </span>
                </div>
              )}

              {mission.starterContent?.targetCell && (
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Ô nhập công thức:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {mission.starterContent.targetCell}
                  </span>
                </div>
              )}

              {mission.starterContent?.starterSql && (
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Mẫu truy vấn SQL:</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">Có sẵn starter code</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
            <HelpCircle className="size-4 text-cyan-500" /> Hệ thống gợi ý luôn có sẵn nếu bạn gặp khó khăn
          </div>
        </section>
      </div>

      {/* ── Section 4: Action Launch Bar ── */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10 p-6 shadow-xs">
        <div>
          <h3 className="font-bold text-base text-foreground">Bạn đã sẵn sàng phá án?</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bấm nút bên dưới để mở không gian làm bài interactive và bắt đầu thực thi.
          </p>
        </div>

        <Link
          to={mission.tool === 'sql' ? `/missions/${mission.id}/sql` : `/missions/${mission.id}/workspace`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 text-sm font-bold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/35 transition-all transform hover:-translate-y-0.5 shrink-0 active:translate-y-0"
        >
          <Play className="size-4 fill-current" /> Bắt đầu điều tra ngay
        </Link>
      </section>
    </div>
  );
}
