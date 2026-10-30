import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Database,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { adminContentService } from '../../services/index.js';

export function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    tool: 'excel',
    difficulty: 'beginner',
    description: '',
    status: 'draft',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const res = await adminContentService.getCourses();
      if (res.data) setCourses(res.data);
    } catch (err) {
      showToast('Lỗi khi tải danh sách khóa học: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      slug: '',
      tool: 'excel',
      difficulty: 'beginner',
      description: '',
      status: 'draft',
    });
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      slug: course.slug || '',
      tool: course.tool || 'excel',
      difficulty: course.difficulty || 'beginner',
      description: course.description || '',
      status: course.status || 'draft',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tên khóa học!', 'error');
      return;
    }

    const payload = {
      ...(editingCourse ? { id: editingCourse.id } : {}),
      ...formData,
      slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    const res = await adminContentService.saveCourse(payload);
    if (res.data) {
      showToast(editingCourse ? 'Đã cập nhật khóa học!' : 'Đã tạo khóa học mới!');
      setModalOpen(false);
      loadCourses();
    } else {
      showToast(res.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handlePublishSync = async (course) => {
    const res = await adminContentService.publishCourse(course.id);
    if (res.data) {
      showToast(
        `Đã xuất bản "${course.title}" và đồng bộ lại Bản đồ Học tập (Version ${res.data.course.version})!`
      );
      loadCourses();
    } else {
      showToast(res.error || 'Lỗi khi xuất bản', 'error');
    }
  };

  const handleDelete = async (course) => {
    if (window.confirm(`Bạn có chắc muốn xóa khóa học "${course.title}"?`)) {
      const res = await adminContentService.deleteCourse(course.id);
      if (res.data?.success) {
        showToast('Đã xóa khóa học thành công!');
        loadCourses();
      } else {
        showToast(res.error || 'Lỗi khi xóa', 'error');
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-7 animate-fade-in pb-16">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-sm px-4 py-3 font-mono text-xs font-bold shadow-xl border ${
            toast.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
          {toast.message}
        </div>
      )}

      {/* Archival Masthead */}
      <section className="flex flex-col justify-between gap-4 border-b-2 border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
              CURRICULUM ARCHIVE // BINDERS
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Lộ trình học tập
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <BookOpen className="size-7 text-primary" />
            Quản lý Khóa học
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Quản lý các khóa học điều tra dữ liệu, thiết lập cấu trúc và đồng bộ tự động lên Bản đồ Học tập.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:opacity-90 transition-all cursor-pointer shrink-0"
        >
          <Plus className="size-4" /> Tạo Khóa Học Mới
        </button>
      </section>

      {/* Master Case Binders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="col-span-full py-12 text-center font-mono text-xs text-muted-foreground">
            Đang tải danh sách khóa học...
          </p>
        ) : courses.length === 0 ? (
          <p className="col-span-full py-12 text-center font-mono text-xs text-muted-foreground">
            Chưa có khóa học nào.
          </p>
        ) : (
          courses.map((course, idx) => {
            const isExcel = course.tool === 'excel';
            return (
              <div
                key={course.id}
                className="dossier-card corner-brackets flex flex-col justify-between rounded-md border border-border bg-card p-6 shadow-2xs hover:border-primary/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4 pb-2.5 border-b border-border/80">
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border ${
                        isExcel
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                      }`}
                    >
                      {isExcel ? <FileSpreadsheet className="size-3" /> : <Database className="size-3" />}
                      {course.tool?.toUpperCase()}
                    </span>

                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border ${
                        course.status === 'published'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {course.status === 'published' ? 'ĐÃ XUẤT BẢN' : 'BẢN NHÁP'}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                    DOSSIER BINDER // {course.id || `CRS-0${idx + 1}`}
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {course.description || 'Chưa có mô tả cho khóa học này.'}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs border-y border-dashed border-border py-3 text-muted-foreground bg-muted/20 px-3 rounded-xs">
                    <div>
                      <span className="block font-mono font-bold text-foreground text-base tabular-nums">
                        {course.totalChapters || 0}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider">Chương học</span>
                    </div>
                    <div className="border-l border-dashed border-border pl-3">
                      <span className="block font-mono font-bold text-foreground text-base tabular-nums">
                        {course.totalMissions || 0}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider">Vụ án thực hành</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePublishSync(course)}
                      title="Tạo lại Learning Map View cho học viên"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="size-3.5" /> Xuất bản & Sync Map
                    </button>
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-2 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Chỉnh sửa khóa học"
                    >
                      <Edit3 className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      className="p-2 rounded-sm border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Xóa khóa học"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <Link
                    to={`/admin/chapters?courseId=${course.id}`}
                    className="inline-flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary hover:underline pt-1"
                  >
                    Xem danh sách các chương <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Course Edit/Create Dossier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="dossier-card corner-brackets w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="border-b border-border pb-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                [ARCHIVE FORM // COURSE BINDER]
              </span>
              <h3 className="font-display text-xl font-bold text-foreground mt-0.5">
                {editingCourse ? 'Chỉnh sửa Khóa học' : 'Tạo Khóa học mới'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Tên khóa học *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Phân Tích Dữ Liệu Với SQL"
                  className="w-full rounded-sm border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Công cụ
                  </label>
                  <select
                    value={formData.tool}
                    onChange={(e) => setFormData({ ...formData, tool: e.target.value })}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="excel">Excel</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Độ khó
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Mô tả khóa học
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tóm tắt nội dung và kỹ năng đạt được..."
                  className="w-full rounded-sm border border-border bg-background p-3 text-sm text-foreground outline-none resize-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-sm border border-border px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Lưu Khóa Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
