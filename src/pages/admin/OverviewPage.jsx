import React, { useEffect } from 'react';
import {
  Users, BookOpen, Target, AlertTriangle,
  TrendingUp, PlusCircle, Upload, ArrowRight,
  CheckCircle2, Clock,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync.js';
import { courseService } from '../../services/index.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDate, difficultyLabel, toolLabel } from '../../utils/format.js';

// Mock analytics data — sẽ đến từ progressService trong sprint sau
const MOCK_ANALYTICS = {
  totalLearners: 128,
  activeLearners: 47,
  publishedMissions: 18,
  avgCompletionRate: 68,
};

const MOCK_RECENT_CHANGES = [
  { id: 1, type: 'mission', label: 'Vì sao doanh thu tháng 3 giảm?', action: 'updated', at: '2026-08-17T09:00:00Z' },
  { id: 2, type: 'course',  label: 'SQL Investigation',               action: 'published', at: '2026-08-16T15:00:00Z' },
  { id: 3, type: 'dataset', label: 'sales_q1_2026.csv',               action: 'uploaded',  at: '2026-08-15T11:00:00Z' },
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
    <div className="page-container space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Thống kê và hoạt động gần đây của nền tảng
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Upload size={14} />}>
            Upload dataset
          </Button>
          <Button size="sm" icon={<PlusCircle size={14} />}>
            Tạo mission
          </Button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          Icon={Users}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          label="Tổng học viên"
          value={MOCK_ANALYTICS.totalLearners}
          sub={`${MOCK_ANALYTICS.activeLearners} đang hoạt động`}
        />
        <StatCard
          Icon={CheckCircle2}
          iconBg="bg-success-50"
          iconColor="text-success-600"
          label="Tỷ lệ hoàn thành"
          value={`${MOCK_ANALYTICS.avgCompletionRate}%`}
          sub="Trung bình các khóa"
        />
        <StatCard
          Icon={Target}
          iconBg="bg-secondary-50"
          iconColor="text-secondary-600"
          label="Mission đã đăng"
          value={MOCK_ANALYTICS.publishedMissions}
          sub="Trong 2 khóa học"
        />
        <StatCard
          Icon={AlertTriangle}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
          label="Mission tỉ lệ sai cao"
          value={MOCK_HIGH_FAIL.length}
          sub="Cần xem lại"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Course list ── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen size={15} className="text-slate-400" />
              Danh sách khóa học
            </h2>
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={13} />}>
              Xem tất cả
            </Button>
          </div>

          {courses.loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : courses.error ? (
            <ErrorState message={courses.error} onRetry={() => courses.execute(() => courseService.getCourses())} />
          ) : (
            <div className="space-y-3">
              {(courses.data ?? []).map((course) => (
                <AdminCourseRow key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* High fail rate */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-warning-500" />
              Mission tỷ lệ sai cao
            </h2>
            <div className="space-y-2">
              {MOCK_HIGH_FAIL.map((m) => (
                <Card key={m.id} padding="sm">
                  <p className="text-xs font-medium text-slate-800 truncate mb-1">{m.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="default">{toolLabel(m.tool)}</Badge>
                    <span className="text-xs font-bold text-danger-600">{m.failRate}% sai</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent changes */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              Thay đổi gần đây
            </h2>
            <div className="space-y-2">
              {MOCK_RECENT_CHANGES.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{item.label}</p>
                    <p className="text-xs text-slate-400">
                      {item.action} · {formatDate(item.at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <Card padding="md">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={17} className={iconColor} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

function AdminCourseRow({ course }) {
  return (
    <Card padding="md" hover className="group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
          {course.tool === 'excel' ? '📊' : '🔍'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-900">{course.title}</p>
            <StatusBadge status={course.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {course.totalChapters} chương · {course.totalMissions} nhiệm vụ · {difficultyLabel(course.difficulty)}
          </p>
        </div>
        <ArrowRight
          size={14}
          className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0"
        />
      </div>
    </Card>
  );
}
