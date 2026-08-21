import React from 'react';
import { Check, Sparkles, Lightbulb, X } from 'lucide-react';

/**
 * FormulaBar Component (LRN-EXCEL-002)
 * Thanh nhập công thức chuẩn Excel cho màn hình không gian làm bài Excel Mission Workspace
 *
 * @param {Object} props
 * @param {string} props.selectedCell - Tọa độ ô đang được chọn (ví dụ: 'E2')
 * @param {string} props.formula - Chuỗi công thức hiện tại của ô chọn (ví dụ: '=C2*D2')
 * @param {Function} props.onChange - Handler cập nhật công thức khi người dùng gõ
 * @param {Function} [props.onSubmit] - Handler khi nhấn Enter hoặc nút Áp dụng
 * @param {boolean} [props.isTargetCell] - Cờ xác định xem ô chọn có phải là ô mục tiêu của bài học hay không
 * @param {boolean} [props.disabled] - Khóa nhập công thức
 * @param {{valid: boolean, errorCode: string|null, message: string}|null} [props.diagnostic]
 * @param {string|null} [props.activeHint] - Gợi ý nội tuyến đã mở khóa hiển thị ngay dưới FormulaBar
 * @param {Function} [props.onClearActiveHint] - Callback ẩn gợi ý nội tuyến
 */
export function FormulaBar({
  selectedCell = 'A1',
  formula = '',
  onChange,
  onSubmit,
  isTargetCell = false,
  disabled = false,
  diagnostic = null,
  activeHint = null,
  onClearActiveHint,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit(formula);
    }
  };

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center rounded-2xl border border-border bg-card p-2.5 shadow-sm transition-all">
      <div className="flex items-center gap-2">
        {/* Cell Coordinate Name Box */}
        <div
          className={`flex items-center justify-center min-w-[3.5rem] px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors ${
            isTargetCell
              ? 'bg-amber-500 text-amber-950 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400'
              : 'bg-muted text-foreground'
          }`}
          title={isTargetCell ? 'Ô mục tiêu cần tính toán của vụ án' : `Ô ${selectedCell}`}
        >
          {isTargetCell && <Sparkles className="size-3 mr-1 fill-current shrink-0" />}
          {selectedCell}
        </div>

        {/* Function Icon Indicator */}
        <div className="flex items-center justify-center px-2 py-1 font-mono text-sm font-bold text-muted-foreground select-none">
          fx
        </div>

        <div className="h-5 w-px bg-border hidden sm:block" />
      </div>

      {/* Formula Input Field */}
      <div className="relative flex-1 mt-1 sm:mt-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formula}
            onChange={(e) => onChange && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              isTargetCell
                ? 'Nhập công thức bài làm (ví dụ: =C2*D2)...'
                : 'Nhập công thức hoặc giá trị (ví dụ: =SUM(B2:B5))...'
            }
            className={`w-full rounded-xl border bg-background px-3.5 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all disabled:opacity-50 ${
              diagnostic && !diagnostic.valid
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                : 'border-border focus:border-primary focus:ring-primary'
            }`}
            aria-label="Thanh nhập công thức Excel"
            aria-invalid={diagnostic ? !diagnostic.valid : undefined}
            aria-describedby={diagnostic ? 'formula-diagnostic' : undefined}
          />

          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled || !formula.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Áp dụng công thức (Enter)"
            >
              <Check className="size-3.5" />
              <span className="hidden sm:inline">Áp dụng</span>
            </button>
          )}
        </div>

        {diagnostic && (
          <p
            id="formula-diagnostic"
            role={diagnostic.valid ? 'status' : 'alert'}
            className={`mt-1.5 px-1 text-[11px] font-semibold ${
              diagnostic.valid
                ? 'text-emerald-600 dark:text-emerald-300 font-bold'
                : 'text-rose-600 dark:text-rose-300 font-bold'
            }`}
          >
            {diagnostic.message}
          </p>
        )}

        {/* Inline Active Unlocked Hint Helper (Solution 1) */}
        {activeHint && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-300 font-semibold animate-fade-in shadow-xs">
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
    </div>
  );
}
