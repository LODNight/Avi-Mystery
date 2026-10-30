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
  Terminal,
  FileSpreadsheet,
  Database,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync.js';
import { courseService } from '../../services/index.js';
import { AdminCourseCardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDate, difficultyLabel } from '../../utils/format.js';

const MOCK_ANALYTICS = {
  totalLearners: 128,
  activeLearners: 47,
  publishedMissions: 18,
  avgCompletionRate: 68,
};

const MOCK_RECENT_CHANGES = [
  { id: 1, code: 'LOG-891', type: 'mission', label: 'Vì sao doanh thu tháng 3 giảm?', action: 'cập nhật', at: '2026-08-17T09:00:00Z' },
  { id: 2, code: 'LOG-890', type: 'course',  label: 'SQL Investigation',               action: 'xuất bản', at: '2026-08-16T15:00:00Z' },
  { id: 3, code: 'LOG-889', type: 'dataset', label: 'sales_q1_2026.csv',               action: 'tải lên',  at: '2026-08-15T11:00:00Z' },
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
    <div className="mx-auto flex max-w-7xl flex-col gap-7 animate-fade-in">
      {/* Archival Masthead */}
      <section className="flex flex-col justify-between gap-5 border-b-2 border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
              HQ COMMAND // OVERSEER DESK
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Bảng điều khiển quản trị
            </span>
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tổng quan nền tảng
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Theo dõi tiến trình học viên, chất lượng bài học và sức khỏe nội dung điều tra.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/admin/settings?tab=system"
            className="inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-all cursor-pointer"
          >
            <Terminal className="size-3.5 text-primary" /> Test Onboarding Mode
          </Link>
          <Link
            to="/admin/datasets"
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:border-primary/40 hover:bg-muted transition-colors cursor-pointer"
          >
            <Upload className="size-3.5" /> Upload Dataset
          </Link>
          <Link
            to="/admin/missions/new"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="size-3.5" /> Tạo Mission
          </Link>
        </div>
      </section>

      {/* Open Bureau Telemetry Ledger Strip (Replaces 4-Card SaaS Wall) */}
      <section className="rounded-md border border-border bg-card/70 bg-ruled-ledger px-5 py-4 shadow-2xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
          <TelemetryMetric
            code="TEL-01"
            icon={Users}
            label="Tổng học viên"
            value={MOCK_ANALYTICS.totalLearners}
            detail={`${MOCK_ANALYTICS.activeLearners} đang hoạt động`}
            tone="text-foreground"
          />
          <TelemetryMetric
            code="TEL-02"
            icon={CheckCircle2}
            label="Tỷ lệ hoàn thành"
            value={`${MOCK_ANALYTICS.avgCompletionRate}%`}
            detail="Trung bình toàn bộ khóa"
            tone="text-emerald-500"
            className="lg:pl-6"
          />
          <TelemetryMetric
            code="TEL-03"
            icon={Target}
            label="Nhiệm vụ đã xuất bản"
            value={MOCK_ANALYTICS.publishedMissions}
            detail="Trong 2 khóa học chính"
            tone="text-primary"
            className="lg:pl-6"
          />
          <TelemetryMetric
            code="TEL-04"
            icon={AlertTriangle}
            label="Nhiệm vụ tỉ lệ sai cao"
            value={MOCK_HIGH_FAIL.length}
            detail="Cần kiểm tra lại dữ liệu"
            tone="text-rose-500"
            className="lg:pl-6"
          />
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Course List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4" aria-busy={courses.loading ? "true" : undefined}>
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                [ARCHIVE // BINDERS]
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">Khóa học hiện có</h3>
            </div>
            <Link
              to="/admin/courses"
              className="flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Xem tất cả <ArrowRight className="size-3.5" />
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
              {(courses.data || []).map((course, idx) => (
                <AdminCourseCard key={course.id} course={course} index={idx} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* High Fail Rate Missions: Anomaly Dispatch */}
          <div className="dossier-card corner-brackets rounded-md border border-rose-500/30 bg-card p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <AlertTriangle className="size-4 text-rose-500" />
                Nhiệm vụ có tỷ lệ sai cao
              </h3>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-xs border border-rose-500/30">
                ANOMALY
              </span>
            </div>
            <div className="space-y-2.5">
              {MOCK_HIGH_FAIL.map((m) => (
                <div
                  key={m.id}
                  className="rounded-sm border border-dashed border-border bg-muted/30 p-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                        [{m.id.toUpperCase()}]
                      </span>
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded-xs bg-muted text-foreground font-bold">
                        {m.tool}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate mt-1">{m.title}</p>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-rose-500 shrink-0 border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 rounded-xs">
                    {m.failRate}% sai
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Changes: Chain-of-Custody Audit Log */}
          <div className="dossier-card rounded-md border border-border bg-card p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Thay đổi gần đây
              </h3>
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                AUDIT LOG
              </span>
            </div>
            <div className="relative ml-2 border-l border-dashed border-border pl-4 space-y-3.5 py-1">
              {MOCK_RECENT_CHANGES.map((item) => (
                <div key={item.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-xs bg-primary ring-2 ring-card" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
                      {item.code} // {item.type.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                      {formatDate(item.at)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground truncate mt-0.5">{item.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mt-0.5">
                    Thao tác: {item.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TelemetryMetric({ code, icon: Icon, label, value, detail, tone, className = '' }) {
  return (
    <div className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            [{code}]
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
        <Icon className={`size-4 ${tone}`} />
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <p className={`font-mono text-2xl font-bold tracking-tight tabular-nums ${tone}`}>{value}</p>
        <p className="font-mono text-[10px] text-muted-foreground truncate">{detail}</p>
      </div>
    </div>
  );
}

function AdminCourseCard({ course, index }) {
  const isExcel = course.tool === 'excel';
  const ToolIcon = isExcel ? FileSpreadsheet : Database;
  return (
    <Link
      to={`/admin/chapters?courseId=${course.id}`}
      className="dossier-card group rounded-md border border-border bg-card p-4 transition-all hover:border-primary/50 flex items-center justify-between cursor-pointer"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-sm border font-mono text-sm ${
            isExcel
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
              : 'border-sky-500/40 bg-sky-500/10 text-sky-500'
          }`}
        >
          <ToolIcon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              [BINDER-0{index + 1}]
            </span>
            <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
              {course.title}
            </h4>
            <span className="rounded-xs border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {course.status}
            </span>
          </div>
          <p className="font-mono text-xs text-muted-foreground mt-1 tabular-nums">
            {course.totalChapters} chương · {course.totalMissions} nhiệm vụ · {difficultyLabel(course.difficulty)}
          </p>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0" />
    </Link>
  );
}
