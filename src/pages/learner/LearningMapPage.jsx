import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Zap,
  BookOpen,
  Award,
  Layers,
} from 'lucide-react';
import { courseService, missionService } from '../../services/index.js';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export function LearningMapPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [missionsByChapter, setMissionsByChapter] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMapData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Load course list if not present
        let currentCourses = courses;
        if (currentCourses.length === 0) {
          const res = await courseService.getCourses({ status: 'published' });
          if (res?.error || !res?.data || res.data.length === 0) {
            if (isMounted) {
              setError(res?.error || 'Không tìm thấy khóa học nào.');
              setLoading(false);
            }
            return;
          }
          currentCourses = res.data;
          if (isMounted) setCourses(currentCourses);
        }

        const activeCourseId = selectedCourseId || currentCourses[0].id;

        // 2. Fetch chapters for active course
        const chaptersRes = await courseService.getChaptersByCourse(activeCourseId);
        if (chaptersRes?.error) {
          if (isMounted) {
            setError(chaptersRes.error);
            setLoading(false);
          }
          return;
        }

        const chapterList = chaptersRes?.data || [];
        if (isMounted) setChapters(chapterList);

        // 3. Fetch missions for each chapter safely
        const missionsMap = {};
        for (const ch of chapterList) {
          try {
            const mRes = await missionService.getMissionsByChapter(ch.id);
            missionsMap[ch.id] = mRes?.data || [];
          } catch (_e) {
            missionsMap[ch.id] = [];
          }
        }

        if (isMounted) {
          setMissionsByChapter(missionsMap);
        }
      } catch (err) {
        if (isMounted) setError('Không thể tải dữ liệu bản đồ học tập.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMapData();

    return () => {
      isMounted = false;
    };
  }, [selectedCourseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeId = selectedCourseId || (courses[0] && courses[0].id) || '';
  const selectedCourse = courses.find((c) => c.id === activeId);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 animate-fade-in">
      {/* ── Section 1: Map Header & Selector ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3">
              <Sparkles className="size-3.5" /> Bản đồ nhiệm vụ vụ án
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Bản Đồ Học Tập
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Theo dõi tiến độ thám tử dữ liệu của bạn thông qua cây lộ trình nhiệm vụ tương tác.
            </p>
          </div>

          {/* Course Selector Dropdown */}
          <div className="flex flex-col gap-1.5 shrink-0 sm:w-64">
            <label htmlFor="course-selector" className="text-xs font-semibold text-muted-foreground">
              Chọn lộ trình vụ án:
            </label>
            <select
              id="course-selector"
              value={activeId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none shadow-sm"
              aria-label="Chọn khóa học"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tool === 'excel' ? '📊' : '🔍'} {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gamification Stats Summary Strip */}
        {selectedCourse && (
          <div className="mt-6 pt-6 border-t border-border/80 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Layers className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Số chương</p>
                <p className="text-sm font-bold text-foreground">{chapters.length} Chương</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <BookOpen className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Tổng bài học</p>
                <p className="text-sm font-bold text-foreground">
                  {Object.values(missionsByChapter).flat().length} Vụ án
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">XP Thưởng</p>
                <p className="text-sm font-bold text-foreground">
                  +{Object.values(missionsByChapter).flat().reduce((s, m) => s + (m.rewardXp || 0), 0)} XP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-purple-500/10 text-purple-500">
                <Award className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Tiến độ</p>
                <p className="text-sm font-bold text-foreground">0% Hoàn thành</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 2: Gamified Node Tree Map ── */}
      <section className="flex flex-col gap-8" aria-busy={loading ? 'true' : undefined}>
        {loading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => setSelectedCourseId(activeId)} />
        ) : chapters.length === 0 ? (
          <EmptyState
            type="empty"
            title="Chưa có dữ liệu bản đồ"
            description="Lộ trình học tập này đang được cập nhật thêm các nút vụ án mới."
          />
        ) : (
          <div className="relative flex flex-col gap-10">
            {/* Map Connecting Timeline Line */}
            <div className="absolute left-6 top-10 bottom-10 w-1 bg-gradient-to-b from-amber-500/80 via-primary/40 to-muted rounded-full hidden sm:block" />

            {chapters.map((chapter, chIdx) => {
              const missions = missionsByChapter[chapter.id] || [];

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
                      <h2 className="text-base font-bold text-foreground">{chapter.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{chapter.description}</p>
                    </div>
                  </div>

                  {/* Mission Node List */}
                  <div className="pl-4 sm:pl-16 flex flex-col gap-4">
                    {missions.map((mission, mIdx) => {
                      const isCompleted = false;
                      const isCurrent = chIdx === 0 && mIdx === 0;
                      const isLocked = chapter.unlockRule === 'complete_previous' && chIdx > 1;

                      return (
                        <MissionNodeCard
                          key={mission.id}
                          mission={mission}
                          chapterIndex={chIdx + 1}
                          missionIndex={mIdx + 1}
                          isCompleted={isCompleted}
                          isCurrent={isCurrent}
                          isLocked={isLocked}
                        />
                      );
                    })}
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
          <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {mission.title}
          </h3>
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
            to={
              isCurrent
                ? mission.tool === 'sql'
                  ? `/missions/${mission.id}/sql`
                  : `/missions/${mission.id}/workspace`
                : `/missions/${mission.id}`
            }
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
