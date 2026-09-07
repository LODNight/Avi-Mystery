import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Search,
  Filter,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Database,
  Eye,
  ArrowUpDown,
  Sparkles,
  Layers,
  Check,
  X,
} from 'lucide-react';
import { adminContentService } from '../../services/index.js';

export function AdminMissionsPage() {
  const navigate = useNavigate();

  const [missions, setMissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [toolFilter, setToolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [missionsRes, coursesRes, chaptersRes] = await Promise.all([
        adminContentService.getMissions(),
        adminContentService.getCourses(),
        adminContentService.getChapters(),
      ]);

      if (missionsRes.data) setMissions(missionsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (chaptersRes.data) setChapters(chaptersRes.data);
    } catch (err) {
      showToast('Lỗi khi tải danh sách vụ án: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Missions
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      if (courseFilter !== 'all' && m.courseId !== courseFilter) return false;
      if (toolFilter !== 'all' && m.tool !== toolFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (difficultyFilter !== 'all' && m.difficulty !== difficultyFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = m.title?.toLowerCase().includes(q);
        const matchId = m.id?.toLowerCase().includes(q);
        const matchObjective = m.objective?.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchObjective) return false;
      }
      return true;
    });
  }, [missions, courseFilter, toolFilter, statusFilter, difficultyFilter, search]);

  // Metrics
  const stats = useMemo(() => {
    const total = missions.length;
    const published = missions.filter((m) => m.status === 'published').length;
    const draft = missions.filter((m) => m.status === 'draft').length;
    const excelCount = missions.filter((m) => m.tool === 'excel').length;
    const sqlCount = missions.filter((m) => m.tool === 'sql').length;
    return { total, published, draft, excelCount, sqlCount };
  }, [missions]);

  // Actions
  const handleToggleStatus = async (mission) => {
    const res = await adminContentService.toggleMissionStatus(mission.id);
    if (res.data) {
      showToast(
        `Đã chuyển vụ án "${mission.title}" sang trạng thái ${
          res.data.status === 'published' ? 'XUẤT BẢN' : 'BẢN NHÁP'
        }`
      );
      loadData();
    } else {
      showToast(res.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDuplicate = async (mission) => {
    const res = await adminContentService.duplicateMission(mission.id);
    if (res.data) {
      showToast(`Đã nhân bản vụ án: ${res.data.title}`);
      loadData();
    } else {
      showToast(res.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (mission) => {
    if (window.confirm(`Bạn có chắc muốn xóa vụ án "${mission.title}" (${mission.id})?`)) {
      const res = await adminContentService.deleteMission(mission.id);
      if (res.data?.success) {
        showToast(`Đã xóa vụ án: ${mission.title}`);
        loadData();
      } else {
        showToast(res.error || 'Có lỗi xảy ra', 'error');
      }
    }
  };

  const getCourseTitle = (courseId) => {
    const c = courses.find((item) => item.id === courseId);
    return c ? c.title : courseId;
  };

  const getChapterTitle = (chapterId) => {
    const ch = chapters.find((item) => item.id === chapterId);
    return ch ? ch.title : chapterId;
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl transition-all border ${
            toast.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              Admin Content Studio
            </span>
            <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
              Sprint 8
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <Target className="size-8 text-primary" />
            Quản lý Vụ án & Nhiệm vụ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Soạn thảo bối cảnh trinh thám, cấu hình câu hỏi thực hành Excel & SQL, bộ chấm điểm và đồng bộ bản đồ học tập.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/admin/missions/new')}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="size-4" /> Tạo Vụ Án Mới
          </button>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Tổng vụ án</p>
          <p className="mt-1 text-2xl font-black text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Đã xuất bản</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Bản nháp</p>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{stats.draft}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">Excel Missions</p>
          <p className="mt-1 text-2xl font-black text-emerald-500 flex items-center gap-1.5">
            <FileSpreadsheet className="size-4" /> {stats.excelCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs text-muted-foreground font-medium">SQL Missions</p>
          <p className="mt-1 text-2xl font-black text-blue-500 flex items-center gap-1.5">
            <Database className="size-4" /> {stats.sqlCount}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm vụ án theo tiêu đề, ID, mục tiêu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-muted/60 pl-9 pr-4 py-2 text-sm text-foreground outline-none border border-transparent focus:border-primary/50 focus:bg-background transition-all"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="all">Tất cả Khóa học</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="all">Tất cả Công cụ</option>
          <option value="excel">Excel</option>
          <option value="sql">SQL</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="all">Tất cả Trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="all">Tất cả Độ khó</option>
          <option value="easy">Dễ (Easy)</option>
          <option value="medium">Trung bình (Medium)</option>
          <option value="hard">Khó (Hard)</option>
        </select>

        {(search || courseFilter !== 'all' || toolFilter !== 'all' || statusFilter !== 'all' || difficultyFilter !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setCourseFilter('all');
              setToolFilter('all');
              setStatusFilter('all');
              setDifficultyFilter('all');
            }}
            className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Missions Table */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 pl-6 pr-3">Mã & Tiêu đề vụ án</th>
                <th className="px-3 py-3.5">Khóa học / Chương</th>
                <th className="px-3 py-3.5 text-center">Công cụ</th>
                <th className="px-3 py-3.5 text-center">Độ khó</th>
                <th className="px-3 py-3.5 text-center">Thưởng XP</th>
                <th className="px-3 py-3.5 text-center">Trạng thái</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium">
                    Đang tải danh sách vụ án...
                  </td>
                </tr>
              ) : filteredMissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Không tìm thấy vụ án nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredMissions.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {m.id}
                        </span>
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {m.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md">
                        {m.objective || m.story}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <p className="text-xs font-semibold text-foreground">{getCourseTitle(m.courseId)}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{getChapterTitle(m.chapterId)}</p>
                    </td>

                    <td className="px-3 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.tool === 'excel'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {m.tool === 'excel' ? <FileSpreadsheet className="size-3" /> : <Database className="size-3" />}
                        {m.tool?.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-center">
                      <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground">
                        {m.difficulty}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-center">
                      <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        +{m.rewardXp} XP
                      </span>
                    </td>

                    <td className="px-3 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(m)}
                        title="Bấm để đổi trạng thái Xuất bản / Bản nháp"
                        className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all hover:scale-105 ${
                          m.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {m.status === 'published' ? (
                          <>
                            <Check className="size-3" /> Xuất bản
                          </>
                        ) : (
                          <>
                            <X className="size-3" /> Bản nháp
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 pl-3 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/missions/${m.id}/edit`)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                          title="Chỉnh sửa vụ án"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(m)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Nhân bản vụ án"
                        >
                          <Copy className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Xóa vụ án"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
