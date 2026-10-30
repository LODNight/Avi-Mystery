import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Target,
} from 'lucide-react';
import { adminContentService } from '../../services/index.js';

export function AdminChaptersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCourseId = searchParams.get('courseId') || 'course-001';

  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'published',
    orderIndex: 1,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, chaptersRes] = await Promise.all([
        adminContentService.getCourses(),
        adminContentService.getChapters(selectedCourseId),
      ]);

      if (coursesRes.data) setCourses(coursesRes.data);
      if (chaptersRes.data) setChapters(chaptersRes.data);
    } catch (err) {
      showToast('Lỗi khi tải danh sách: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setSearchParams({ courseId: newCourseId });
  };

  const openCreateModal = () => {
    setEditingChapter(null);
    setFormData({
      title: '',
      description: '',
      status: 'published',
      orderIndex: chapters.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title || '',
      description: chapter.description || '',
      status: chapter.status || 'published',
      orderIndex: chapter.orderIndex || 1,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tên chương!', 'error');
      return;
    }

    const payload = {
      ...(editingChapter ? { id: editingChapter.id } : {}),
      courseId: selectedCourseId,
      ...formData,
      orderIndex: Number(formData.orderIndex) || 1,
    };

    const res = await adminContentService.saveChapter(payload);
    if (res.data) {
      showToast(editingChapter ? 'Đã cập nhật chương học!' : 'Đã tạo chương mới!');
      setModalOpen(false);
      loadData();
    } else {
      showToast(res.error || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (chapter) => {
    if (window.confirm(`Bạn có chắc muốn xóa chương "${chapter.title}"?`)) {
      const res = await adminContentService.deleteChapter(chapter.id);
      if (res.data?.success) {
        showToast('Đã xóa chương học thành công!');
        loadData();
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
              SECTION INDEX // CHAPTERS
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Cấu trúc nội dung
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <Layers className="size-7 text-primary" />
            Quản lý Chương học
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Phân bổ và sắp xếp các chương học cùng các vụ án theo từng giai đoạn của khóa học.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="size-4" /> Thêm Chương Mới
          </button>
        </div>
      </section>

      {/* Course Binder Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card/80 p-4 shadow-2xs">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
          [BINDER FILTER]
        </span>
        <label className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Chọn Khóa học:
        </label>
        <select
          value={selectedCourseId}
          onChange={handleCourseChange}
          className="rounded-sm border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary cursor-pointer flex-1 max-w-md"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.tool?.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Sequential Dossier Folders List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <p className="py-12 text-center font-mono text-xs text-muted-foreground">
            Đang tải danh sách chương...
          </p>
        ) : chapters.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-12 text-center font-mono text-xs text-muted-foreground">
            Khóa học này chưa có chương học nào. Hãy bấm &ldquo;Thêm Chương Mới&rdquo;.
          </div>
        ) : (
          chapters.map((ch, idx) => {
            const seq = String(ch.orderIndex || idx + 1).padStart(2, '0');
            return (
              <div
                key={ch.id}
                className="dossier-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-border bg-card p-5 shadow-2xs hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-primary/40 bg-primary/10 font-mono text-xs font-bold text-primary tabular-nums">
                    CH-{seq}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{ch.title}</h3>
                      <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-xs border border-border">
                        {ch.id}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-xs">
                        {ch.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {ch.description || 'Chưa có mô tả cho chương này.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    to={`/admin/missions?courseId=${selectedCourseId}&chapterId=${ch.id}`}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Target className="size-3.5" /> Xem vụ án
                  </Link>
                  <button
                    onClick={() => openEditModal(ch)}
                    className="p-2 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Sửa chương"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ch)}
                    className="p-2 rounded-sm border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Xóa chương"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chapter Edit/Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="dossier-card corner-brackets w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="border-b border-border pb-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                [ARCHIVE FORM // CHAPTER FOLDER]
              </span>
              <h3 className="font-display text-xl font-bold text-foreground mt-0.5">
                {editingChapter ? 'Chỉnh sửa Chương học' : 'Thêm Chương học mới'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Tên chương *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Chương 1: Khởi đầu điều tra"
                  className="w-full rounded-sm border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })}
                  className="w-28 rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Mô tả chương
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tóm tắt nội dung chương..."
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
                  Lưu Chương
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
