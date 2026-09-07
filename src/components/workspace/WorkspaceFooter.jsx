import React from 'react';
import { Play, Zap, RotateCcw, ArrowDownCircle, CheckCircle2 } from 'lucide-react';

/**
 * WorkspaceFooter Component (Sprint 9 / Sticky Action Footer)
 * Thanh công cụ hành động cố định ở đáy Cột Phải (Workspace Pane):
 * - Neo chặt các nút hành động cốt lõi: Chạy thử, Nộp bài vụ án, Đặt lại, Kéo công thức.
 * - Hiển thị hướng dẫn phím tắt & trạng thái chẩn đoán.
 */
export function WorkspaceFooter({
  onRun,
  onSubmit,
  onReset,
  onFillDown,
  canFillDown = false,
  isEvaluating = false,
  isSubmitting = false,
  isCompleted = false,
  disabled = false,
  diagnostic = null,
  tool = 'excel', // 'excel' | 'sql'
}) {
  return (
    <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-card/95 p-3 backdrop-blur shadow-xs">
      {/* ── Bên Trái: Phím tắt & Trạng thái chẩn đoán ── */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {diagnostic ? (
          <p
            role={diagnostic.valid ? 'status' : 'alert'}
            className={`text-xs font-semibold truncate ${
              diagnostic.valid
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-rose-600 dark:text-rose-400 font-bold'
            }`}
          >
            {diagnostic.message}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground hidden sm:block truncate">
            💡 <kbd className="font-mono font-bold bg-muted px-1 py-0.5 rounded border border-border">Enter</kbd> để {tool === 'sql' ? 'thực thi' : 'chạy thử'}, <kbd className="font-mono font-bold bg-muted px-1 py-0.5 rounded border border-border">Ctrl + Enter</kbd> để nộp bài
          </p>
        )}
      </div>

      {/* ── Bên Phải: Cụm nút hành động ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Nút Đặt lại */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={isEvaluating || isSubmitting || disabled}
            aria-label="Đặt lại"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-card hover:bg-stone-100 dark:hover:bg-muted text-muted-foreground hover:text-foreground px-3 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title={tool === 'sql' ? 'Đặt lại câu lệnh SQL ban đầu' : 'Đặt lại bảng tính về trạng thái ban đầu'}
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        )}

        {/* Nút Fill Down (dành cho Excel khi cần) */}
        {onFillDown && canFillDown && (
          <button
            type="button"
            onClick={onFillDown}
            disabled={isEvaluating || isSubmitting || disabled}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 px-3 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Tự động áp dụng công thức cho các hàng còn lại"
          >
            <ArrowDownCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>Fill down</span>
          </button>
        )}

        {/* Nút Chạy thử */}
        {onRun && (
          <button
            type="button"
            onClick={onRun}
            disabled={isEvaluating || isSubmitting || disabled}
            aria-label={tool === 'sql' ? 'Thực thi SQL' : 'Chạy thử công thức (Áp dụng)'}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 px-3.5 py-2 text-xs font-bold text-stone-800 dark:text-stone-100 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title={tool === 'sql' ? 'Chạy thử truy vấn SQL (Ctrl + Enter)' : 'Kiểm duyệt cú pháp & chạy thử công thức (Enter)'}
          >
            <Play className={`size-3.5 ${isEvaluating ? 'animate-spin' : 'fill-stone-600 dark:fill-stone-300 text-stone-600 dark:text-stone-300'}`} />
            <span>{isEvaluating ? (tool === 'sql' ? 'Đang chạy...' : 'Đang tính...') : (tool === 'sql' ? 'Thực thi SQL' : 'Chạy thử công thức')}</span>
          </button>
        )}

        {/* Nút Nộp bài vụ án */}
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || disabled}
            aria-label={isSubmitting ? 'Đang chấm điểm' : isCompleted ? 'Nộp lại bài làm' : 'Nộp bài vụ án'}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
            title={isCompleted ? 'Nộp lại bài làm vụ án' : 'Nộp bài vụ án để chấm điểm (Ctrl + Enter)'}
          >
            {isSubmitting ? (
              <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isCompleted ? (
              <CheckCircle2 className="size-3.5 text-emerald-200" />
            ) : (
              <Zap className="size-3.5 fill-amber-300 text-amber-300" />
            )}
            <span>{isSubmitting ? 'Đang chấm...' : isCompleted ? 'Nộp lại bài làm' : 'Nộp bài vụ án'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
