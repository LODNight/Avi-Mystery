import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Target,
  FileSpreadsheet,
  Database,
  Clock,
  Play,
  Award,
  ArrowUpRight,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { missionService, courseService, knowledgeService } from '../../services/index.js';
import { AuthContext } from '../../hooks/useAuth.js';
import { PrerequisiteAlert } from '../../components/knowledge/PrerequisiteAlert.jsx';
import { formatDuration, difficultyLabel, toolLabel, formatXP } from '../../utils/format.js';
import { MissionIntroSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export function MissionIntroPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [readTopics, setReadTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authCtx = useContext(AuthContext);
  const user = authCtx?.user || null;

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

        // Fetch related topics and read progress
        if (user && isMounted && knowledgeService?.getTopicsByMission) {
          try {
            const [topicsRes, readRes] = await Promise.all([
              knowledgeService.getTopicsByMission(idToFetch),
              knowledgeService.getReadTopics(user.uid || user.id || ''),
            ]);
            if (topicsRes?.data) setTopics(topicsRes.data);
            if (readRes?.data) setReadTopics(readRes.data);
          } catch {
            // Non-critical, ignore
          }
        }

        // Fetch associated course info
        if (missionData.courseId) {
          const courseRes = await courseService.getCourse(missionData.courseId);
          if (courseRes.data && isMounted) {
            setCourse(courseRes.data);
          }
        }
      } catch {
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

  // Phím tắt Enter để tiến thẳng vào bàn làm việc (Speed & Affordance)
  useEffect(() => {
    if (!mission) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const targetPath = mission.tool === 'sql' ? `/missions/${mission.id}/sql` : `/missions/${mission.id}/workspace`;
        navigate(targetPath);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mission, navigate]);

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

  const isExcel = mission.tool === 'excel';
  const targetPath = isExcel ? `/missions/${mission.id}/workspace` : `/missions/${mission.id}/sql`;

  const badgeVariant =
    mission.difficulty === 'beginner' || mission.difficulty === 'easy'
      ? 'success'
      : mission.difficulty === 'intermediate' || mission.difficulty === 'medium'
      ? 'warning'
      : 'danger';

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 animate-fade-in pb-12">
      {/* ── Top Navigation & Case Context ── */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Quay lại danh sách vụ án
        </button>

        {course && (
          <span className="font-medium text-muted-foreground">
            Chuyên án: <strong className="text-foreground">{course.title}</strong>
          </span>
        )}
      </div>

      {/* ── SECTION 1: Case Dossier Briefing (P0 & P1: Why it matters) ── */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/25 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary uppercase">
              <Briefcase className="size-3.5" /> Hồ sơ vụ án #{mission.id}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground font-semibold">
              · {isExcel ? 'Bảng tính Excel' : 'Truy vấn SQL'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {mission.title}
          </h1>

          {/* Incident Call / Narrative Context */}
          <div className="rounded-xl border-l-4 border-primary bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Bối cảnh vụ án
            </p>
            <p className="italic">
              "{mission.story}"
            </p>
          </div>
        </div>
      </section>

      {/* ── Prerequisite Knowledge Check (Contextual, non-blocking) ── */}
      {topics.length > 0 && (
        <PrerequisiteAlert topics={topics} readTopics={readTopics} />
      )}

      {/* ── SECTION 2: Investigation Objective & Evidence Artifact ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Investigation Objective (What to solve) */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Target className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground">Mục tiêu điều tra</h2>
                <p className="text-[11px] text-muted-foreground">Kết quả cần chứng minh bằng số liệu</p>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold leading-relaxed text-foreground">
              {mission.objective}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Phần thưởng hoàn thành:</span>
            <span className="font-bold text-primary">+{formatXP(mission.rewardXp)}</span>
          </div>
        </section>

        {/* Evidence Artifact (Data to examine) */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                {isExcel ? <FileSpreadsheet className="size-4" /> : <Database className="size-4" />}
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground">Bằng chứng & Hồ sơ dữ liệu</h2>
                <p className="text-[11px] text-muted-foreground">Hiện trường số liệu được bàn giao</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                <span className="text-muted-foreground">Tập dữ liệu bàn giao:</span>
                <span className="font-mono font-bold text-foreground">{mission.datasetId || 'ds-001'}</span>
              </div>

              {mission.starterContent?.targetSheet && (
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <span className="text-muted-foreground">Bảng tính cần giám định:</span>
                  <span className="font-mono font-bold text-primary">
                    {mission.starterContent.targetSheet}
                  </span>
                </div>
              )}

              {mission.starterContent?.targetCell && (
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <span className="text-muted-foreground">Vị trí tính toán (Ô đích):</span>
                  <span className="font-mono font-bold text-primary">
                    {mission.starterContent.targetCell}
                  </span>
                </div>
              )}

              {mission.starterContent?.starterSql && (
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <span className="text-muted-foreground">Mẫu câu truy vấn:</span>
                  <span className="font-mono font-bold text-primary">Có sẵn mã khởi động</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <HelpCircle className="size-3.5 text-primary shrink-0" />
            <span>Gợi ý điều tra từng bước luôn có sẵn trong bàn làm việc</span>
          </div>
        </section>
      </div>

      {/* ── SECTION 3: Action Launch Bar (Clarity > Role-play, Single Primary CTA) ── */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-primary/40 bg-card p-5 sm:p-6 shadow-sm">
        <div>
          <h3 className="font-bold text-base text-foreground">
            Bắt đầu phân tích số liệu
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bàn làm việc sẽ mở toàn màn hình để bạn trực tiếp nhập công thức và kiểm chứng dữ liệu.
          </p>
        </div>

        <Link
          to={targetPath}
          aria-label="Tiến vào Bàn làm việc"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] transition-all shrink-0"
          title="Tiến vào bàn làm việc (Phím tắt: Enter)"
        >
          <Play className="size-4 fill-current" />
          <span>Tiến vào Bàn làm việc</span>
          <span className="hidden md:inline-flex rounded-md bg-black/15 dark:bg-white/20 px-1.5 py-0.2 font-mono text-[10px] font-bold uppercase">
            Enter ↵
          </span>
          <ArrowUpRight className="size-4" />
        </Link>
      </section>

      {/* ── SECTION 4: Demoted Supporting Metadata Strip (P4: Retained, not deleted) ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-xs text-muted-foreground border-t border-border">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-muted-foreground" />
            Thời gian ước tính: <strong className="text-foreground">{formatDuration(mission.estimatedDuration)}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            Độ khó: <Badge variant={badgeVariant} size="sm">{difficultyLabel(mission.difficulty)}</Badge>
          </span>
          <span className="flex items-center gap-1.5">
            Công cụ: <strong className="text-foreground">{toolLabel(mission.tool)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-primary font-bold">
          <Award className="size-3.5" /> Thưởng: +{formatXP(mission.rewardXp)}
        </div>
      </div>
    </div>
  );
}
