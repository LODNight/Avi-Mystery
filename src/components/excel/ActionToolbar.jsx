import React from 'react';
import { Play, Send, RotateCcw, Lightbulb, CheckCircle2 } from 'lucide-react';

/**
 * ActionToolbar Component (LRN-EXCEL-002 / Step 3.3)
 * Thanh công cụ thao tác điều khiển cho bài tập Excel
 *
 * @param {Object} props
 * @param {Function} props.onRun - Handler tính toán công thức tại ô hiện tại
 * @param {Function} props.onSubmit - Handler nộp bài kiểm tra đáp án
 * @param {Function} props.onReset - Handler đặt lại bảng tính ban đầu
 * @param {Function} props.onToggleHint - Handler bật/tắt bảng gợi ý
 * @param {number} [props.hintCount=3] - Tổng số gợi ý có sẵn
 * @param {number} [props.hintsUnlockedCount=0] - Số gợi ý đã mở khóa
 * @param {boolean} [props.isSubmitting=false] - Trạng thái đang nộp bài
 * @param {boolean} [props.isEvaluating=false] - Trạng thái đang chạy tính toán
 */
export function ActionToolbar({
  onRun,
  onSubmit,
  onReset,
  onToggleHint,
  hintCount = 3,
  hintsUnlockedCount = 0,
  isSubmitting = false,
  isEvaluating = false,
}) {
  return (
    <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-sm">
      {/* ── Group 1: Core Action Buttons (Chạy thử & Nộp bài - Ưu tiên hàng đầu trên mobile) ── */}
      <div className="contents sm:flex sm:items-center gap-2">
        {/* Nút Chạy thử công thức (Run / Evaluate) */}
        <button
          type="button"
          onClick={onRun}
          disabled={isEvaluating || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          title="Chạy thử công thức trên ô tính hiện tại"
        >
          <Play className={`size-3.5 ${isEvaluating ? 'animate-spin' : 'fill-current'}`} />
          <span>{isEvaluating ? 'Đang tính...' : 'Chạy thử công thức'}</span>
        </button>

        {/* Nút Nộp bài (Submit Answer) */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          title="Nộp kết quả bài làm để chấm điểm và xem phần thưởng dự kiến"
        >
          {isSubmitting ? (
            <>
              <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Đang chấm điểm...</span>
            </>
          ) : (
            <>
              <Send className="size-3.5" />
              <span>Nộp bài vụ án</span>
            </>
          )}
        </button>
      </div>

      {/* ── Group 2: Auxiliary Buttons (Gợi ý & Đặt lại) ── */}
      <div className="contents sm:flex sm:items-center gap-2">
        {/* Nút Gợi ý từng bước (Progressive Hints) */}
        <button
          type="button"
          onClick={onToggleHint}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto relative"
          title="Xem gợi ý từng bước giải quyết vụ án"
        >
          <Lightbulb className="size-3.5 fill-amber-500/20" />
          <span>Gợi ý</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
            {hintsUnlockedCount}/{hintCount}
          </span>
        </button>

        {/* Nút Đặt lại bảng tính (Reset Grid) */}
        <button
          type="button"
          onClick={onReset}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          title="Xóa toàn bộ công thức đã nhập và đặt lại bảng về trạng thái ban đầu"
        >
          <RotateCcw className="size-3.5 text-muted-foreground" />
          <span>Đặt lại</span>
        </button>
      </div>
    </div>
  );
}
