import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync.js';
import { courseService } from '../../services/index.js';
import { formatDuration, difficultyLabel, toolLabel } from '../../utils/format.js';
import { SkeletonCard, CoursesSkeleton } from '../../components/ui/Skeleton.jsx';
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

  // Filter courses based on search, tool, and difficulty
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
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in pb-12">
      {/* ── Section 1: Hero Header (Investigation Methodology Archives) ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-3 border border-amber-500/20 uppercase tracking-wider">
            <Sparkles className="size-3.5" /> Trung Tâm Đào Tạo Nghiệp Vụ Điều Tra
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Danh Sách Khóa Học
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Lựa chọn nghiệp vụ và công cụ điều tra phù hợp. Học bản chất công thức Excel, câu lệnh SQL và phương pháp tư duy để giải mã các hồ sơ vụ án thực chiến.
          </p>

          {/* Core Learning Principle Badge */}
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border/60 px-3 py-1.5 rounded-xl">
            <span className="font-bold text-foreground">Nguyên tắc học tập:</span>
            <span>Đọc hiểu bản chất</span>
            <ChevronRight className="size-3 opacity-50" />
            <span>Nắm chắc nghiệp vụ</span>
            <ChevronRight className="size-3 opacity-50" />
            <span>Thực hành giải quyết vụ án</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, kỹ năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Tool Filter */}
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none shrink-0 cursor-pointer"
              aria-label="Lọc theo công cụ"
            >
              <option value="all">Tất cả công cụ</option>
              <option value="excel">Excel</option>
              <option value="sql">SQL</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none shrink-0 cursor-pointer"
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

      {/* ── Section 2: Course List Grid ── */}
      <section aria-busy={courses.loading ? 'true' : undefined}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground font-medium">
            Hiển thị <span className="font-bold text-foreground">{filteredCourses.length}</span> khóa học
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/academy/excel-academy"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Tra cứu Học viện Academy ❯
            </Link>
          </div>
        </div>

        {courses.loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCardItem key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Course Card Sub-component ── */
function CourseCardItem({ course }) {
  const toolIcon = course.tool === 'excel' ? '📊' : '🔍';

  const badgeVariant =
    course.difficulty === 'beginner'
      ? 'success'
      : course.difficulty === 'intermediate'
      ? 'warning'
      : 'danger';

  // Investigation application highlights based on tool/content
  const investigationUse =
    course.tool === 'excel'
      ? 'Phát hiện sai lệch sổ sách, kiểm tra biên độ lợi nhuận, khoanh vùng chi nhánh.'
      : 'Truy vết nhật ký hoạt động, lọc đối tượng đáng ngờ, đối chiếu dòng tiền chuyển khoản.';

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div>
        {/* Card Top Meta */}
        <div className="flex items-center justify-between">
          <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/15 font-mono text-2xl text-amber-600 dark:text-amber-400">
            {toolIcon}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant} size="sm">
              {difficultyLabel(course.difficulty)}
            </Badge>
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground uppercase">
              {toolLabel(course.tool)}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="mt-5 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        {/* Practical Investigation Application */}
        <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
          <span className="font-bold text-foreground block mb-0.5">🎯 Ứng dụng điều tra:</span>
          <span className="line-clamp-2">{investigationUse}</span>
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="mt-6 pt-4 border-t border-border/80 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-amber-500" />
            {course.totalChapters || 3} Chương · {course.totalMissions || 9} Vụ án
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-cyan-500" />
            {formatDuration(course.estimatedDuration)}
          </span>
        </div>

        <Link
          to={`/courses/${course.slug || course.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground cursor-pointer"
        >
          Bắt đầu khóa học <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
