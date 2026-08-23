import React from 'react';
import { Lightbulb, Lock, Unlock, Award, AlertTriangle, X, Check, Pin, ArrowUpRight } from 'lucide-react';

/**
 * HintPanel Component (LRN-EXCEL-002 / Step 3.3)
 * Bảng gợi ý từng bước giải bài tập Excel kèm trừ điểm XP
 *
 * @param {Array|string} hints - Danh sách gợi ý từ nhiệm vụ
 * @param {number} hintsUnlockedCount - Số gợi ý đã mở khóa
 * @param {Function} onUnlockNextHint - Callback mở gợi ý tiếp theo
 * @param {number} baseXp - XP gốc của bài tập
 * @param {number} penaltyPerHint - XP bị trừ mỗi khi mở 1 gợi ý
 * @param {Function} onClose - Callback đóng panel
 * @param {React.RefObject} closeButtonRef - Ref cho nút đóng panel (accessibility)
 * @param {string|null} pinnedHint - Nội dung gợi ý đang được ghim lên FormulaBar
 * @param {Function} onPinHint - Callback khi click vào hint card để ghim/gỡ ghim lên FormulaBar
 */
export function HintPanel({
  hints = [],
  hintsUnlockedCount = 0,
  onUnlockNextHint,
  baseXp = 100,
  penaltyPerHint = 15,
  onClose,
  closeButtonRef,
  pinnedHint = null,
  onPinHint,
}) {
  // Chuẩn hóa mảng gợi ý (nếu nhận vào là chuỗi đơn thì tách/tạo 3 cấp độ gợi ý)
  const normalizedHints = Array.isArray(hints) && hints.length > 0
    ? hints
    : typeof hints === 'string' && hints.trim()
    ? [
        'Hãy xác định các ô chứa thông tin Số lượng và Đơn giá của mặt hàng.',
        'Sử dụng phép nhân (*) trong Excel giữa cột Số lượng (C) và Đơn giá (D).',
        hints,
      ]
    : [
        'Xác định thông tin dữ liệu đầu vào trong bảng tính.',
        'Sử dụng phép tính Excel phù hợp (phép cộng +, trừ -, nhân *, chia /).',
        'Cú pháp công thức Excel bắt đầu bằng dấu "=".',
      ];

  const totalHints = normalizedHints.length;
  const currentPenalty = hintsUnlockedCount * penaltyPerHint;
  const netXp = Math.max(0, baseXp - currentPenalty);
  const isAllUnlocked = hintsUnlockedCount >= totalHints;

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-card p-5 sm:p-6 shadow-xl space-y-5 animate-fade-in relative flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* ── Panel Header ── */}
        <div className="border-b border-border pb-3.5 space-y-3">
          {/* Row 1: Title + Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Lightbulb className="size-4 text-amber-500 fill-amber-500/20 shrink-0" />
              <span>Hệ thống Gợi ý Trinh thám</span>
            </div>

            {onClose && (
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="grid size-7 place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
                title="Đóng bảng gợi ý"
                aria-label="Đóng bảng gợi ý"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Row 2: XP Net Badge — Hoàn toàn thẳng hàng & không bao giờ bị rớt dòng chữ XP */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap shadow-xs">
              <Award className="size-3.5 shrink-0 text-amber-500" />
              <span>Phần thưởng dự kiến: {netXp} XP</span>
              {currentPenalty > 0 && (
                <span className="text-[11px] text-rose-500 font-extrabold whitespace-nowrap">(-{currentPenalty} XP)</span>
              )}
            </div>

            {hintsUnlockedCount > 0 && (
              <span className="text-[11px] font-mono text-muted-foreground font-semibold whitespace-nowrap">
                Đã mở {hintsUnlockedCount}/{totalHints}
              </span>
            )}
          </div>
        </div>

        {/* ── List of Progressive Hint Cards ── */}
        <div className="space-y-3">
          {normalizedHints.map((hintText, index) => {
            const levelNumber = index + 1;
            const isUnlocked = levelNumber <= hintsUnlockedCount;
            const isNextAvailable = index === hintsUnlockedCount;
            const isPinned = pinnedHint === hintText;

            return (
              <div
                key={index}
                role={isUnlocked ? 'button' : undefined}
                tabIndex={isUnlocked ? 0 : undefined}
                title={isUnlocked ? (isPinned ? 'Nhấn để bỏ ghim gợi ý khỏi thanh fx' : 'Nhấn để ghim gợi ý này lên thanh fx') : undefined}
                onClick={() => isUnlocked && onPinHint && onPinHint(hintText)}
                onKeyDown={(e) => {
                  if (isUnlocked && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onPinHint && onPinHint(hintText);
                  }
                }}
                className={`group relative rounded-2xl border p-4 transition-all duration-200 ${
                  isUnlocked
                    ? isPinned
                      ? 'border-amber-500 bg-amber-500/15 text-foreground shadow-md ring-2 ring-amber-400/60 dark:ring-amber-400/80 cursor-pointer'
                      : 'border-emerald-500/40 bg-emerald-500/5 text-foreground shadow-xs cursor-pointer hover:border-amber-400 hover:bg-amber-500/10 hover:shadow-sm'
                    : isNextAvailable
                    ? 'border-amber-500/60 bg-amber-500/10 text-foreground font-semibold shadow-xs ring-2 ring-amber-500/20'
                    : 'border-border/60 bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Header hàng gợi ý */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-6 items-center justify-center rounded-lg font-mono text-xs font-black shrink-0 ${
                        isUnlocked
                          ? isPinned
                            ? 'bg-amber-500 text-amber-950 shadow-xs'
                            : 'bg-emerald-500 text-emerald-950'
                          : isNextAvailable
                          ? 'bg-amber-500 text-amber-950'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {levelNumber}
                    </span>
                    <span className="text-xs font-bold tracking-tight">
                      Gợi ý Cấp độ {levelNumber}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    {isUnlocked ? (
                      isPinned ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/25 dark:bg-amber-400/25 px-2 py-0.5 text-amber-800 dark:text-amber-200 font-extrabold border border-amber-500/50 shadow-2xs">
                          <Pin className="size-3 text-amber-600 dark:text-amber-300 fill-amber-500/40 animate-pulse" /> Đang ghim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="size-3" /> Đã mở
                        </span>
                      )
                    ) : isNextAvailable ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <Unlock className="size-3" /> Sẵn sàng mở
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
                        <Lock className="size-3" /> Khóa
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Text */}
                {isUnlocked ? (
                  <p className="text-xs sm:text-sm leading-relaxed font-medium pl-8">
                    {hintText}
                  </p>
                ) : isNextAvailable ? (
                  <p className="text-xs italic text-amber-700 dark:text-amber-300 pl-8">
                    Bấm nút bên dưới để mở gợi ý này.
                  </p>
                ) : (
                  <p className="text-xs italic text-muted-foreground pl-8">
                    Cần mở khóa Gợi ý Cấp độ {index} trước.
                  </p>
                )}

                {/* Clickable Call-to-Action Affordance cho Gợi ý đã mở */}
                {isUnlocked && (
                  <div className="mt-2.5 pt-2 border-t border-border/40 pl-8 flex items-center justify-between text-xs">
                    {isPinned ? (
                      <span className="font-bold text-amber-700 dark:text-amber-300 inline-flex items-center gap-1 group-hover:underline">
                        <Pin className="size-3" /> Bấm để bỏ ghim khỏi thanh fx
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 group-hover:underline">
                        <ArrowUpRight className="size-3.5" /> Ghim nội dung này lên thanh fx ⇡
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer Action & Precise Left Alignment ── */}
      <div className="border-t border-border pt-4 mt-3 space-y-3">
        {/* Warning text aligned exactly with button padding */}
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
          <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span className="leading-tight">Mỗi lượt mở gợi ý sẽ trừ {penaltyPerHint} XP từ quỹ điểm.</span>
        </div>

        {!isAllUnlocked && (
          <button
            type="button"
            onClick={onUnlockNextHint}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-amber-950 hover:bg-amber-400 transition-all shadow-md cursor-pointer active:scale-[0.99]"
          >
            <Unlock className="size-3.5" />
            <span>Mở Gợi ý Cấp {hintsUnlockedCount + 1} (-{penaltyPerHint} XP)</span>
          </button>
        )}
      </div>
    </div>
  );
}
