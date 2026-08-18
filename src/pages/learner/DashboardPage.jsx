import React, { useEffect } from 'react';
import {
  Zap, Flame, BookOpen, CheckCircle2, Clock,
  TrendingUp, ArrowRight, Target, BarChart2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useAsync } from '../../hooks/useAsync.js';
import { missionService, courseService } from '../../services/index.js';
import { Card } from '../../components/ui/Card.jsx';
import { ProgressBar } from '../../components/ui/EmptyState.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { SkeletonCard, Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatXP, formatDuration, difficultyLabel, toolLabel } from '../../utils/format.js';

export function DashboardPage() {
  const { user } = useAuth();

  const courses = useAsync();
  const recommended = useAsync();

  useEffect(() => {
    courses.execute(() => courseService.getCourses({ status: 'published' }));
    recommended.execute(() => missionService.getRecommendedMissions(user?.id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const xpPercent = user
    ? Math.round((user.xp / user.xpToNextLevel) * 100)
    : 0;

  return (
    <div className="page-container space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Chào mừng, {user?.name?.split(' ').pop()} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tiếp tục cuộc điều tra dữ liệu của bạn
          </p>
        </div>
        <Button size="sm" icon={<ArrowRight size={14} />}>
          Tiếp tục học
        </Button>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Level + XP */}
        <Card padding="md" className="col-span-2">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user?.level ?? '—'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">Level hiện tại</p>
              <p className="text-sm font-semibold text-slate-900">Investigator</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-500">XP</p>
              <p className="text-sm font-bold text-primary-600">
                {formatXP(user?.xp)}
              </p>
            </div>
          </div>
          <ProgressBar value={xpPercent} color="primary" showLabel />
          <p className="text-xs text-slate-400 mt-1">
            {formatXP(user?.xpToNextLevel - user?.xp)} đến level tiếp theo
          </p>
        </Card>

        {/* Streak */}
        <Card padding="md">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Flame size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{user?.streak ?? 0}</p>
              <p className="text-xs text-slate-500">ngày streak</p>
            </div>
          </div>
        </Card>

        {/* Completed missions (mock) */}
        <Card padding="md">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">7</p>
              <p className="text-xs text-slate-500">nhiệm vụ xong</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Continue Learning ── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen size={15} className="text-primary-500" />
          Khóa học đang học
        </h2>
        {courses.loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : courses.error ? (
          <ErrorState message={courses.error} onRetry={() => courses.execute(() => courseService.getCourses({ status: 'published' }))} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(courses.data ?? []).filter(c => c.status === 'published').map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* ── Recommended Missions ── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Target size={15} className="text-secondary-500" />
          Nhiệm vụ đề xuất
        </h2>
        {recommended.loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-xl" count={3} />
          </div>
        ) : recommended.error ? (
          <ErrorState message={recommended.error} />
        ) : (
          <div className="space-y-2">
            {(recommended.data ?? []).map((mission) => (
              <MissionRow key={mission.id} mission={mission} />
            ))}
          </div>
        )}
      </div>

      {/* ── Skill progress (mock) ── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <BarChart2 size={15} className="text-slate-500" />
          Tiến độ kỹ năng
        </h2>
        <Card padding="md">
          <div className="space-y-4">
            <SkillBar label="Excel Formula" value={65} color="primary" icon="📊" />
            <SkillBar label="SQL Query"     value={35} color="secondary" icon="🔍" />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function CourseCard({ course }) {
  const toolIcon = course.tool === 'excel' ? '📊' : '🔍';
  // Mock progress
  const progress = course.id === 'course-001' ? 42 : 10;

  return (
    <Card padding="md" hover className="cursor-pointer group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
          {toolIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{course.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {course.totalChapters} chương · {course.totalMissions} nhiệm vụ
          </p>
        </div>
        <ArrowRight
          size={14}
          className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
        />
      </div>
      <ProgressBar value={progress} size="sm" />
      <p className="text-xs text-slate-400 mt-1.5">{progress}% hoàn thành</p>
    </Card>
  );
}

function MissionRow({ mission }) {
  const toolColor = mission.tool === 'excel' ? 'bg-success-50 text-success-700' : 'bg-secondary-50 text-secondary-700';
  const toolText = toolLabel(mission.tool);

  return (
    <Card padding="sm" hover className="flex items-center gap-4 cursor-pointer group">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-base group-hover:bg-primary-50 transition-colors">
        {mission.tool === 'excel' ? '📊' : '🔍'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{mission.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${toolColor}`}>
            {toolText}
          </span>
          <StatusBadge status={mission.difficulty} />
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={11} />
            {formatDuration(mission.estimatedDuration)}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="flex items-center gap-1 text-primary-600">
          <Zap size={12} />
          <span className="text-xs font-semibold">{mission.rewardXp} XP</span>
        </div>
      </div>
    </Card>
  );
}

function SkillBar({ label, value, color, icon }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-700 flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        <span className="text-xs font-semibold text-slate-900">{value}%</span>
      </div>
      <ProgressBar value={value} color={color} size="md" />
    </div>
  );
}
