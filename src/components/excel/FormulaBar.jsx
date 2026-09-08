import React from 'react';
import { Sparkles, Lightbulb, X, Play, RotateCcw, ArrowDownCircle } from 'lucide-react';

/**
 * FormulaBar Component (LRN-EXCEL-002 / Action & Formula Bar)
 * Hợp nhất Thanh nhập công thức (fx) và Cụm công cụ hành động (Chạy thử, Nộp bài, Gợi ý, Đặt lại)
 * vào một hàng duy nhất đặt liền kề phía trên bảng tính.
 */
export function FormulaBar({
  selectedCell = 'A1',
  formula = '',
  onChange,
  onRun,
  onSubmit,
  onSubmitAnswer,
  onFillDown,
  canFillDown = false,
  onReset,
  onCancel,
  onToggleHint,
  hintButtonRef,
  inputRef,
  hintsUnlockedCount = 0,
  hintCount = 3,
  isEvaluating = false,
  isSubmitting = false,
  isCompleted = false,
  isTargetCell = false,
  disabled = false,
  diagnostic = null,
  activeHint = null,
  onClearActiveHint,
  showActions = true,
}) {
  // onSubmitAnswer & onSubmit still accepted for backward-compat but Submit button
  // has been moved to MissionActionBar (LeetCode-style isolated footer).
  // Handler khi submit câu trả lời (ưu tiên onSubmitAnswer, fallback onSubmit)
  const handleSubmitAction = onSubmitAnswer || onSubmit;
  // Handler khi chạy thử công thức (ưu tiên onRun, fallback onSubmit)
  const handleRunAction = onRun || onSubmit;

  const handleKeyDown = (e) => {
    // 1. Tổ hợp phím Ctrl + Enter (hoặc Cmd + Enter trên Mac): Nộp bài vụ án
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (handleSubmitAction && !isSubmitting && !disabled) {
        handleSubmitAction();
      }
      return;
    }

    // 2. Phím Enter: Tự động chạy thử công thức
    if (e.key === 'Enter') {
      e.preventDefault();
      if (handleRunAction && !isEvaluating && !isSubmitting && !disabled) {
        handleRunAction(formula, 'enter');
      }
      return;
    }

    // 3. Phím Escape: Hủy chỉnh sửa và hoàn tác giá trị gốc
    if (e.key === 'Escape') {
      e.preventDefault();
      if (onCancel) {
        onCancel();
      }
      return;
    }
  };

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-2xs transition-all">
      {/* ── Cấu trúc hàng Formula Bar chuẩn bảng tính ── */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
        {/* Name Box (Ô đang chọn, ví dụ: E5) */}
        <div
          className="flex items-center shrink-0"
          title={isTargetCell ? `Ô mục tiêu phá án: ${selectedCell}` : `Ô đang chọn: ${selectedCell}`}
        >
          <span
            className={`inline-flex items-center justify-center min-w-[3.25rem] px-2 py-1 rounded-md font-mono text-xs font-black tracking-wide border transition-all ${
              isTargetCell
                ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-2xs ring-1 ring-amber-500/50'
                : 'bg-muted/70 text-foreground border-border'
            }`}
          >
            {isTargetCell && <Sparkles className="size-3 mr-1 text-amber-950 fill-current shrink-0" />}
            {selectedCell}
          </span>
        </div>

        {/* Fx Symbol */}
        <div className="flex items-center justify-center px-1 font-serif italic text-xs font-black text-muted-foreground select-none shrink-0">
          fx
        </div>

        <div className="h-4 w-px bg-border hidden sm:block shrink-0" />

        {/* Formula Input Field (Chiếm flex-1) */}
        <div className="relative flex-1 min-w-[180px] w-full lg:w-auto">
          <input
            ref={inputRef}
            type="text"
            value={formula}
            onChange={(e) => onChange && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              isTargetCell
                ? `Nhập công thức cho ô ${selectedCell} (bắt đầu bằng dấu =, ví dụ: =C${selectedCell.replace(/\D/g, '') || '2'}*D${selectedCell.replace(/\D/g, '') || '2'})...`
                : 'Nhập công thức bắt đầu bằng dấu = (ví dụ: =SUM(B2:B5))...'
            }
            className={`w-full rounded-md border bg-background px-3 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
              diagnostic && !diagnostic.valid
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-border focus:border-amber-500 focus:ring-amber-500/20 dark:focus:border-primary dark:focus:ring-primary/20'
            }`}
            aria-label="Thanh nhập công thức Excel"
            aria-invalid={diagnostic ? !diagnostic.valid : undefined}
            aria-describedby={diagnostic ? 'formula-diagnostic' : 'formula-shortcut-hint'}
          />
        </div>

        {/* ── Action Buttons: Đặt liền kề bên phải ô input (tuỳ chọn khi showActions = true) ── */}
        {showActions && (
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
            {/* Nút [↺ Đặt lại] */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                disabled={isEvaluating || isSubmitting || disabled}
                className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground px-2 py-1 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                title="Đặt lại bảng tính về trạng thái ban đầu"
                aria-label="Đặt lại"
              >
                <RotateCcw className="size-3" />
                <span className="hidden xl:inline">Đặt lại</span>
              </button>
            )}

            {/* Nút [Fill Down] (nếu ô hợp lệ để kéo công thức) */}
            {onFillDown && canFillDown && (
              <button
                type="button"
                onClick={onFillDown}
                disabled={isEvaluating || isSubmitting || disabled}
                className="inline-flex items-center justify-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 px-2 py-1 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                title="Tự động kéo công thức xuống các ô còn lại"
              >
                <ArrowDownCircle className="size-3 text-amber-600 dark:text-amber-400" />
                <span className="hidden xl:inline">Fill down</span>
              </button>
            )}

            {/* Nút [▶ Chạy thử] (Enter trigger) */}
            <button
              type="button"
              onClick={() => handleRunAction && handleRunAction(formula)}
              disabled={isEvaluating || isSubmitting || disabled}
              aria-label="Chạy thử công thức (Áp dụng)"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted/80 hover:bg-muted text-foreground px-3 py-1 text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
              title="Kiểm duyệt cú pháp & chạy thử công thức (Enter)"
            >
              <Play className={`size-3 ${isEvaluating ? 'animate-spin' : 'fill-current text-amber-600 dark:text-amber-400'}`} />
              <span>{isEvaluating ? 'Đang tính...' : 'Chạy thử'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Sub-bar: Gợi ý phím tắt & Thông báo chuẩn đoán cú pháp ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
        <p id="formula-shortcut-hint" className="text-[10px] text-muted-foreground">
          💡 Mẹo: Bấm <kbd className="font-mono font-bold bg-muted px-1 py-0.5 rounded border border-border">Enter</kbd> để chạy thử &bull; Dùng nút <span className="font-bold text-emerald-600 dark:text-emerald-400">Nộp bài</span> ở thanh dưới để chấm điểm
        </p>

        {diagnostic && (
          <p
            id="formula-diagnostic"
            role={diagnostic.valid ? 'status' : 'alert'}
            className={`text-[11px] font-semibold ${
              diagnostic.valid
                ? 'text-emerald-600 dark:text-emerald-300 font-bold'
                : 'text-rose-600 dark:text-rose-300 font-bold'
            }`}
          >
            {diagnostic.message}
          </p>
        )}
      </div>

      {/* Inline Active Unlocked Hint Helper */}
      {activeHint && (
        <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300 font-semibold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Lightbulb className="size-4 text-amber-500 fill-amber-500/20 shrink-0" />
            <span className="truncate"><strong>Gợi ý:</strong> {activeHint}</span>
          </div>
          {onClearActiveHint && (
            <button
              type="button"
              onClick={onClearActiveHint}
              className="grid size-5 place-items-center rounded hover:bg-amber-500/20 opacity-70 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
              title="Ẩn gợi ý nội tuyến"
              aria-label="Ẩn gợi ý nội tuyến"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
