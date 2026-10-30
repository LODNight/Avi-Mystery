import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Clock,
  Layers,
  ChevronRight,
  FolderOpen,
  FileSpreadsheet,
  Database,
  Crosshair,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync.js';
import { courseService } from '../../services/index.js';
import { formatDuration, difficultyLabel, toolLabel } from '../../utils/format.js';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export function CoursesPage() {
  const courses = useAsync();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const fetchCourses = () => {
    courses.execute(() => courseService.getCourses({ status: 'published' }));
  };

  useEffect(() => {
    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCourses = useMemo(() => {
    if (!courses.data) return [];
    return courses.data.filter((course) => {
      const matchSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTool = selectedTool === 'all' || course.tool === selectedTool;
      const matchDifficulty =
        selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;

      return matchSearch && matchTool && matchDifficulty;
    });
  }, [courses.data, searchTerm, selectedTool, selectedDifficulty]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-7 animate-fade-in pb-12">
      {/* ── Section 1: Archival Methodology Header ── */}
      <section className="dossier-card corner-brackets rounded-md border border-border bg-card p-6 shadow-sm sm:p-7">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary mb-2.5 border border-primary/35 uppercase tracking-widest">
            <FolderOpen className="size-3.5" /> Trung Tâm Đào Tạo Nghiệp Vụ Điều Tra
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Danh Sách Khóa Học
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Lựa chọn nghiệp vụ và công cụ điều tra phù hợp. Học bản chất công thức Excel, câu lệnh SQL và phương pháp tư duy để giải mã các hồ sơ vụ án thực chiến.
          </p>

          {/* Core Learning Principle Protocol */}
          <div className="mt-4 inline-flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground bg-background/80 border border-border px-3 py-1.5 rounded-sm">
            <span className="font-bold text-primary uppercase">QUY TRÌNH:</span>
            <span>Đọc hiểu bản chất</span>
            <ChevronRight className="size-3 opacity-50" />
            <span>Nắm chắc nghiệp vụ</span>
            <ChevronRight className="size-3 opacity-50" />
            <span>Thực hành giải quyết vụ án</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-5 pt-5 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, kỹ năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs font-medium text-foreground focus:border-primary focus:outline-none shrink-0 cursor-pointer"
              aria-label="Lọc theo công cụ"
            >
              <option value="all">Tất cả công cụ</option>
              <option value="excel">Excel</option>
              <option value="sql">SQL</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs font-medium text-foreground focus:border-primary focus:outline-none shrink-0 cursor-pointer"
              aria-label="Lọc theo độ khó"
            >
              <option value="all">Tất cả độ khó</option>
              <option value="beginner">Người mới</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Section 2: Archival Binder Grid ── */}
      <section aria-busy={courses.loading ? 'true' : undefined}>
        <div className="flex items-center justify-between border-b border-border pb-2.5 mb-5">
          <p className="font-mono text-xs text-muted-foreground">
            Hiển thị <span className="font-bold text-foreground">{filteredCourses.length}</span> khóa học
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/academy/excel-academy"
              className="font-mono text-xs font-bold text-primary hover:underline transition-colors"
            >
              Tra cứu Học viện Academy ❯
            </Link>
          </div>
        </div>

        {courses.loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : courses.error ? (
          <ErrorState message={courses.error} onRetry={fetchCourses} />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            type="search"
            title="Không tìm thấy khóa học phù hợp"
            description="Hãy thử đổi từ khóa tìm kiếm hoặc bỏ bộ lọc để xem các khóa học khác."
            action={{
              label: 'Xóa bộ lọc',
              onClick: () => {
                setSearchTerm('');
                setSelectedTool('all');
                setSelectedDifficulty('all');
              },
            }}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, idx) => (
              <CourseCardItem key={course.id} course={course} index={idx + 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Archival Binder Card Sub-component ── */
function CourseCardItem({ course, index }) {
  const isExcel = course.tool === 'excel';

  const badgeVariant =
    course.difficulty === 'beginner'
      ? 'success'
      : course.difficulty === 'intermediate'
      ? 'warning'
      : 'danger';

  const investigationUse =
    course.tool === 'excel'
      ? 'Phát hiện sai lệch sổ sách, kiểm tra biên độ lợi nhuận, khoanh vùng chi nhánh.'
      : 'Truy vết nhật ký hoạt động, lọc đối tượng đáng ngờ, đối chiếu dòng tiền chuyển khoản.';

  return (
    <div className="dossier-card group relative flex flex-col justify-between rounded-md border border-border bg-card p-5 pl-6 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
      <div>
        {/* Card Top Classification Meta */}
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-sm border border-primary/35 bg-primary/10 text-primary">
              {isExcel ? <FileSpreadsheet className="size-4" /> : <Database className="size-4" />}
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold text-primary block">
                ARCHIVE // 0{index}
              </span>
              <span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase">
                {toolLabel(course.tool)}
              </span>
            </div>
          </div>

          <Badge variant={badgeVariant} size="sm">
            {difficultyLabel(course.difficulty)}
          </Badge>
        </div>

        {/* Title & Description */}
        <h3 className="mt-4 text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        {/* Practical Investigation Application */}
        <div className="mt-4 rounded-sm border border-border bg-background/70 p-2.5 text-[11px] text-muted-foreground">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-1">
            <Crosshair className="size-3 text-primary" /> Ứng dụng điều tra:
          </span>
          <span className="line-clamp-2">{investigationUse}</span>
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="mt-5 pt-3.5 border-t border-border/80 flex flex-col gap-3.5">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-primary" />
            {course.totalChapters || 3} Chương · {course.totalMissions || 9} Vụ án
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            {formatDuration(course.estimatedDuration)}
          </span>
        </div>

        <Link
          to={`/courses/${course.slug || course.id}`}
          className="inline-flex items-center justify-between rounded-sm border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground cursor-pointer"
        >
          <span>Bắt đầu khóa học</span>
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
