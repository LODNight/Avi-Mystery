import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Target,
  AlertTriangle,
  Upload,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync.js';
import { courseService } from '../../services/index.js';
import { AdminCourseCardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDate, difficultyLabel, toolLabel } from '../../utils/format.js';

const MOCK_ANALYTICS = {
  totalLearners: 128,
  activeLearners: 47,
  publishedMissions: 18,
  avgCompletionRate: 68,
};

const MOCK_RECENT_CHANGES = [
  { id: 1, type: 'mission', label: 'Vì sao doanh thu tháng 3 giảm?', action: 'cập nhật', at: '2026-08-17T09:00:00Z' },
  { id: 2, type: 'course',  label: 'SQL Investigation',               action: 'xuất bản', at: '2026-08-16T15:00:00Z' },
  { id: 3, type: 'dataset', label: 'sales_q1_2026.csv',               action: 'tải lên',  at: '2026-08-15T11:00:00Z' },
];

const MOCK_HIGH_FAIL = [
  { id: 'm-8', title: 'Hàng tồn kho nào cần nhập thêm?', failRate: 78, tool: 'excel' },
  { id: 'm-7', title: 'Tìm thông tin khách hàng từ mã đơn hàng', failRate: 65, tool: 'excel' },
  { id: 'm-18', title: 'Báo cáo điều tra tổng thể', failRate: 61, tool: 'sql' },
];

export function AdminOverviewPage() {
  const courses = useAsync();

  useEffect(() => {
    courses.execute(() => courseService.getCourses());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Bảng điều khiển quản trị
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tổng quan nền tảng
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi tiến trình học viên, chất lượng bài học và sức khỏe nội dung điều tra.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/admin/settings?tab=system"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="size-4 text-amber-500" /> 🧪 Test Onboarding Mode
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            <Upload className="size-4" /> Upload Dataset
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
            <Plus className="size-4" /> Tạo Mission
          </button>
        </div>
      </section>

      {/* 4 Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Tổng học viên"
          value={MOCK_ANALYTICS.totalLearners}
          detail={`${MOCK_ANALYTICS.activeLearners} đang hoạt động`}
          accent="text-violet-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Tỷ lệ hoàn thành"
          value={`${MOCK_ANALYTICS.avgCompletionRate}%`}
          detail="Trung bình toàn bộ khóa"
          accent="text-emerald-500"
        />
        <StatCard
          icon={Target}
          label="Nhiệm vụ đã xuất bản"
          value={MOCK_ANALYTICS.publishedMissions}
          detail="Trong 2 khóa học chính"
          accent="text-amber-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Nhiệm vụ tỉ lệ sai cao"
          value={MOCK_HIGH_FAIL.length}
          detail="Cần kiểm tra lại dữ liệu"
          accent="text-rose-500"
        />
      </section>

      {/* Main Grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Course List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4" aria-busy={courses.loading ? "true" : undefined}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Khóa học hiện có</h3>
            <Link to="/admin/courses" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          </div>

          {courses.loading ? (
            <div className="space-y-3" aria-busy="true">
              <AdminCourseCardSkeleton />
              <AdminCourseCardSkeleton />
            </div>
          ) : courses.error ? (
            <ErrorState message={courses.error} onRetry={() => courses.execute(() => courseService.getCourses())} />
          ) : (
            <div className="space-y-3">
              {(courses.data || []).map((course) => (
                <AdminCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* High Fail Rate Missions */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <AlertTriangle className="size-4 text-rose-500" />
              Nhiệm vụ có tỷ lệ sai cao
            </h3>
            <div className="space-y-3">
              {MOCK_HIGH_FAIL.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-muted/40 p-3.5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-foreground truncate">{m.title}</p>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase mt-0.5 inline-block">
                      {m.tool}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-rose-500 shrink-0">
                    {m.failRate}% sai
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Changes */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Clock className="size-4 text-muted-foreground" />
              Thay đổi gần đây
            </h3>
            <div className="space-y-3">
              {MOCK_RECENT_CHANGES.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.action} · {formatDate(item.at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <Icon className={`size-4 ${accent}`} />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function AdminCourseCard({ course }) {
  const icon = course.tool === 'excel' ? '📊' : '🔍';
  return (
    <div className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md flex items-center justify-between cursor-pointer">
      <div className="flex items-center gap-4 min-w-0">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/15 font-mono text-xl text-amber-600 dark:text-amber-400">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {course.title}
            </h4>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {course.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {course.totalChapters} chương · {course.totalMissions} nhiệm vụ · {difficultyLabel(course.difficulty)}
          </p>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
    </div>
  );
}
