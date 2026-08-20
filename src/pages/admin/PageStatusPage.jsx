import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wrench,
  Search,
  RefreshCw,
  Edit3,
  Eye,
  ShieldAlert,
  SlidersHorizontal,
  Clock,
  ExternalLink,
  Layers,
  X,
  Save,
  RotateCcw,
} from 'lucide-react';
import { usePageStatus } from '../../hooks/usePageStatus.js';
import { useAuth } from '../../hooks/useAuth.js';
import { UnderMaintenancePage } from '../learner/UnderMaintenancePage.jsx';

export function AdminPageStatusPage() {
  const { statuses, updatePageStatus, setBulkStatus, resetToDefaults } = usePageStatus();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'active',
    maintenanceTitle: '',
    maintenanceMessage: '',
    estimatedTime: '',
    noticeMessage: '',
  });

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState(null);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Metrics
  const totalPages = statuses.length;
  const activeCount = statuses.filter((s) => s.status === 'active').length;
  const maintenanceCount = statuses.filter((s) => s.status === 'maintenance').length;
  const noticeCount = statuses.filter((s) => s.status === 'notice').length;

  // Filtered List
  const filteredStatuses = statuses.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Quick Quick status change handler
  const handleQuickStatusChange = (id, newStatus) => {
    const updated = updatePageStatus(id, { status: newStatus }, user?.name || 'Admin');
    if (updated) {
      const labelMap = {
        active: 'Hoạt động',
        maintenance: 'Bảo trì',
        notice: 'Cảnh báo/Thông báo',
      };
      showToast(`Đã chuyển trạng thái trang "${updated.name}" sang ${labelMap[newStatus]}`);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      status: item.status,
      maintenanceTitle: item.maintenanceTitle || '',
      maintenanceMessage: item.maintenanceMessage || '',
      estimatedTime: item.estimatedTime || '',
      noticeMessage: item.noticeMessage || '',
    });
  };

  // Save Edit Form
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const updated = updatePageStatus(editingItem.id, editForm, user?.name || 'Admin');
    setEditingItem(null);
    if (updated) {
      showToast(`Đã cập nhật chi tiết bảo trì cho trang "${updated.name}"`);
    }
  };

  // Bulk Actions
  const handleBulkAction = (newStatus, label) => {
    if (window.confirm(`Bạn có chắc chắn muốn chuyển TOÀN BỘ ${totalPages} trang sang trạng thái [${label}]?`)) {
      setBulkStatus(newStatus, user?.name || 'Admin');
      showToast(`Đã cập nhật toàn bộ trang sang trạng thái ${label}`);
    }
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục cấu hình trạng thái tất cả các trang về mặc định ban đầu?')) {
      resetToDefaults();
      showToast('Đã khôi phục trạng thái trang về mặc định');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3 text-background shadow-2xl animate-bounce">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Globe className="size-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Quản lý Trạng thái Trang & Bảo trì
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Điều khiển hiển thị, bật/tắt chế độ bảo trì và cấu hình thông báo trực tiếp tác động lên giao diện Learner.
          </p>
        </div>

        {/* Quick Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleBulkAction('maintenance', 'BẢO TRÌ')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
            title="Bảo trì khẩn cấp toàn bộ các trang"
          >
            <ShieldAlert className="size-3.5" />
            Bảo trì tất cả
          </button>

          <button
            onClick={() => handleBulkAction('active', 'HOẠT ĐỘNG')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
            title="Kích hoạt lại toàn bộ các trang"
          >
            <CheckCircle2 className="size-3.5" />
            Kích hoạt tất cả
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            title="Khôi phục trạng thái mặc định ban đầu"
          >
            <RotateCcw className="size-3.5" />
            Khôi phục mặc định
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng số trang
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-foreground">{totalPages}</p>
          <p className="mt-1 text-xs text-muted-foreground">Đã được đăng ký trong hệ thống</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Hoạt động (Active)
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">User truy cập bình thường</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Đang bảo trì
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Wrench className="size-4 animate-spin" style={{ animationDuration: '8s' }} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-600 dark:text-amber-400">{maintenanceCount}</p>
          <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">Hiển thị màn hình bảo trì cho User</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Cảnh báo / Thông báo
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Info className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-blue-600 dark:text-blue-400">{noticeCount}</p>
          <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">Hiển thị banner thông báo phía trên</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm trang hay route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-card p-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `Tất cả (${totalPages})` },
            { id: 'active', label: `Hoạt động (${activeCount})` },
            { id: 'maintenance', label: `Bảo trì (${maintenanceCount})` },
            { id: 'notice', label: `Thông báo (${noticeCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Status List */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredStatuses.map((item) => {
          const isMaint = item.status === 'maintenance';
          const isNotic = item.status === 'notice';

          return (
            <div
              key={item.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-200 bg-card ${
                isMaint
                  ? 'border-amber-500/40 shadow-md shadow-amber-500/5'
                  : isNotic
                  ? 'border-blue-500/30'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{item.name}</h3>
                      <span className="rounded-lg bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs font-semibold text-primary">{item.path}</p>
                  </div>

                  {/* Status Selector Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => handleQuickStatusChange(item.id, e.target.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold border focus:outline-none transition-all cursor-pointer ${
                      isMaint
                        ? 'bg-amber-500/15 text-amber-600 border-amber-500/40 dark:text-amber-400'
                        : isNotic
                        ? 'bg-blue-500/15 text-blue-600 border-blue-500/40 dark:text-blue-400'
                        : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40 dark:text-emerald-400'
                    }`}
                  >
                    <option value="active">🟢 Hoạt động</option>
                    <option value="maintenance">🚧 Bảo trì</option>
                    <option value="notice">📢 Cảnh báo/Thông báo</option>
                  </select>
                </div>

                {/* Status Specific Details Card */}
                <div className="mt-4 rounded-2xl bg-muted/50 p-3.5 text-xs space-y-2 border border-border/50">
                  {isMaint && (
                    <>
                      <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Wrench className="size-3.5" />
                          {item.maintenanceTitle || 'Trang đang bảo trì'}
                        </span>
                        {item.estimatedTime && (
                          <span className="flex items-center gap-1 font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">
                            <Clock className="size-3" />
                            {item.estimatedTime}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.maintenanceMessage}
                      </p>
                    </>
                  )}

                  {isNotic && (
                    <>
                      <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Info className="size-3.5" />
                        Banner Thông báo đính kèm:
                      </p>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.noticeMessage || 'Chưa thiết lập câu thông báo.'}
                      </p>
                    </>
                  )}

                  {!isMaint && !isNotic && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      Trang hoạt động bình thường, không có hạn chế đối với học viên.
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="text-[11px] text-muted-foreground">
                  Cập nhật bởi <strong className="text-foreground">{item.updatedBy}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Xem trước giao diện Bảo trì của trang này"
                  >
                    <Eye className="size-3.5" />
                    Xem trước
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-2.5 py-1.5 font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Edit3 className="size-3.5" />
                    Cấu hình
                  </button>

                  <Link
                    to={item.path}
                    className="inline-flex items-center gap-1 rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Xem trực tiếp trang này"
                  >
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStatuses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Globe className="size-10 text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground">Không tìm thấy trang nào</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái.
          </p>
        </div>
      )}

      {/* ────────────────── Edit Modal ────────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Cấu hình Trang: {editingItem.name}
                </h3>
                <p className="font-mono text-xs text-primary">{editingItem.path}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Status selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Trạng thái hoạt động
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'active', label: '🟢 Hoạt động' },
                    { id: 'maintenance', label: '🚧 Bảo trì' },
                    { id: 'notice', label: '📢 Thông báo' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setEditForm((f) => ({ ...f, status: opt.id }))}
                      className={`rounded-2xl border px-3 py-2.5 text-xs font-bold transition-all ${
                        editForm.status === opt.id
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maintenance Details Inputs */}
              <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Nội dung màn hình Bảo trì (User View)
                </p>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tiêu đề Bảo trì
                  </label>
                  <input
                    type="text"
                    value={editForm.maintenanceTitle}
                    onChange={(e) => setEditForm((f) => ({ ...f, maintenanceTitle: e.target.value }))}
                    placeholder="VD: Bảo trì Hệ thống Khóa học"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Mô tả chi tiết nguyên nhân / thông điệp
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.maintenanceMessage}
                    onChange={(e) => setEditForm((f) => ({ ...f, maintenanceMessage: e.target.value }))}
                    placeholder="Mô tả lý do bảo trì và hướng dẫn học viên..."
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Thời gian dự kiến hoàn thành
                  </label>
                  <input
                    type="text"
                    value={editForm.estimatedTime}
                    onChange={(e) => setEditForm((f) => ({ ...f, estimatedTime: e.target.value }))}
                    placeholder="VD: 18:00 - 20/08/2026 hoặc 30 phút nữa"
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Notice Banner Input */}
              <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Nội dung Banner Cảnh báo/Thông báo
                </p>
                <textarea
                  rows={2}
                  value={editForm.noticeMessage}
                  onChange={(e) => setEditForm((f) => ({ ...f, noticeMessage: e.target.value }))}
                  placeholder="Nhập thông báo hiển thị phía trên trang..."
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 transition-all"
                >
                  <Save className="size-4" />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── Live Preview Modal ────────────────── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Eye className="size-5 text-amber-500" />
                <h3 className="text-base font-bold text-foreground">
                  Xem trước Giao diện Bảo trì: {previewItem.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Simulated Learner View */}
            <div className="rounded-2xl border border-border bg-card/60 p-2 sm:p-4">
              <UnderMaintenancePage pageConfig={previewItem} />
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
