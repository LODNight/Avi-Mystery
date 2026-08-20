import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Layers,
  Award,
  Play,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { courseService, missionService } from '../../services/index.js';
import { formatDuration, difficultyLabel, toolLabel, formatXP } from '../../utils/format.js';
import { Skeleton, PageSkeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export function CourseDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [missionsByChapter, setMissionsByChapter] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    async function loadCourseDetail() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch course details
        const courseRes = await courseService.getCourse(slug);
        if (courseRes.error || !courseRes.data) {
          setError(courseRes.error || `Không tìm thấy khóa học "${slug}".`);
          setLoading(false);
          return;
        }

        const currentCourse = courseRes.data;
        setCourse(currentCourse);

        // 2. Fetch chapters for the course
        const chaptersRes = await courseService.getChaptersByCourse(currentCourse.id);
        if (chaptersRes.error) {
          setError(chaptersRes.error);
          setLoading(false);
          return;
        }

        const chapterList = chaptersRes.data || [];
        setChapters(chapterList);

        // Initialize accordion expanded state (expand first chapter by default)
        const initialExpanded = {};
        chapterList.forEach((ch, index) => {
          initialExpanded[ch.id] = index === 0;
        });
        setExpandedChapters(initialExpanded);

        // 3. Fetch missions for each chapter
        const missionsMap = {};
        for (const chapter of chapterList) {
          const missionRes = await missionService.getMissionsByChapter(chapter.id);
          missionsMap[chapter.id] = missionRes.data || [];
        }
        setMissionsByChapter(missionsMap);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi không xác định.');
      } finally {
        setLoading(false);
      }
    }

    loadCourseDetail();
  }, [slug]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl flex flex-col gap-6 animate-fade-in" aria-busy="true">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-64 rounded-3xl bg-muted/60 animate-pulse" />
        <PageSkeleton />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-7xl flex flex-col gap-6 animate-fade-in">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách khóa học
        </Link>
        <ErrorState
          message={error || 'Không tìm thấy khóa học yêu cầu.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const toolIcon = course.tool === 'excel' ? '📊' : '🔍';
  const badgeVariant =
    course.difficulty === 'beginner'
      ? 'success'
      : course.difficulty === 'intermediate'
      ? 'warning'
      : 'danger';

  // Calculate total XP available in course and get first mission ID
  const allMissions = Object.values(missionsByChapter).flat();
  const totalXp = allMissions.reduce((sum, m) => sum + (m.rewardXp || 0), 0);
  const firstMissionId = allMissions[0]?.id || 'mission-001';

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in">
      {/* ── Back Navigation ── */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-4" /> Danh sách khóa học
      </Link>

      {/* ── Section 1: Hero Course Header ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-12 size-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/15 font-mono text-2xl text-amber-600 dark:text-amber-400">
                {toolIcon}
              </div>
              <Badge variant={badgeVariant} size="md">
                {difficultyLabel(course.difficulty)}
              </Badge>
              <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs font-bold text-muted-foreground uppercase">
                {toolLabel(course.tool)}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {course.title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>

            {/* Course Meta Stats Strip */}
            <div className="mt-2 flex items-center gap-6 flex-wrap text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="size-4 text-amber-500" />
                {chapters.length} Chương
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4 text-emerald-500" />
                {course.totalMissions || 9} Nhiệm vụ vụ án
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-cyan-500" />
                {formatDuration(course.estimatedDuration)}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-4 text-amber-500" />
                +{formatXP(totalXp || 1200)}
              </span>
            </div>
          </div>

          {/* Action Card Box */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-5 shrink-0 lg:w-72">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tiến độ cá nhân
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">0%</span>
              <span className="text-xs text-muted-foreground">0 / {course.totalMissions || 9} bài</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-0 rounded-full bg-primary" />
            </div>
            <Link
              to={`/missions/${firstMissionId}`}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <Play className="size-4 fill-current" /> Bắt đầu khóa học
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 2: Chapter & Mission List ── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">Cấu Trúc Chương Học & Vụ Án</h2>
          <span className="text-xs text-muted-foreground">
            {chapters.length} Chương · {Object.values(missionsByChapter).flat().length} Bài học
          </span>
        </div>

        {chapters.length === 0 ? (
          <EmptyState
            type="empty"
            title="Chưa có chương học nào"
            description="Khóa học này đang cập nhật nội dung. Vui lòng quay lại sau."
          />
        ) : (
          chapters.map((chapter, index) => {
            const isExpanded = expandedChapters[chapter.id];
            const missions = missionsByChapter[chapter.id] || [];

            return (
              <div
                key={chapter.id}
                className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden transition-all"
              >
                {/* Chapter Accordion Header */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 font-mono text-sm font-bold text-primary">
                      0{index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-foreground truncate">
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {chapter.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="hidden sm:inline-block font-mono text-xs text-muted-foreground">
                      {missions.length} bài học
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Mission List Content */}
                {isExpanded && (
                  <div className="border-t border-border/70 bg-muted/20 p-4 sm:p-5 flex flex-col gap-3">
                    {missions.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2 text-center">
                        Chưa có nhiệm vụ trong chương này.
                      </p>
                    ) : (
                      missions.map((mission, mIdx) => (
                        <MissionListItem
                          key={mission.id}
                          mission={mission}
                          index={mIdx + 1}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

/* ── Mission List Item Sub-component ── */
function MissionListItem({ mission, index }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-muted font-mono text-xs font-bold text-muted-foreground">
          {index}
        </div>
        <div className="min-w-0">
          <Link
            to={`/missions/${mission.id}`}
            className="truncate font-bold text-sm text-foreground hover:text-primary transition-colors block"
          >
            {mission.title}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {mission.objective}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:inline-block font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
          +{mission.rewardXp} XP
        </span>
        <span className="hidden md:inline-block text-xs text-muted-foreground">
          {formatDuration(mission.estimatedDuration)}
        </span>

        <Link
          to={`/missions/${mission.id}`}
          className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          title="Xem hồ sơ vụ án & bắt đầu làm bài"
        >
          <Play className="size-4 fill-current" />
        </Link>
      </div>
    </div>
  );
}
