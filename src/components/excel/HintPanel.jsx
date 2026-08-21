import React from 'react';
import { Lightbulb, Lock, Unlock, Award, AlertTriangle, X, Check } from 'lucide-react';

/**
 * HintPanel Component (LRN-EXCEL-002 / Step 3.3)
 * Bảng gợi ý từng bước giải bài tập Excel kèm trừ điểm XP
 */
export function HintPanel({
  hints = [],
  hintsUnlockedCount = 0,
  onUnlockNextHint,
  baseXp = 100,
  penaltyPerHint = 15,
  onClose,
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
        {/* ── Panel Header (Redesigned 2-row layout for full title visibility) ── */}
        <div className="border-b border-border pb-3 space-y-2.5">
          {/* Row 1: Title + Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Lightbulb className="size-4 text-amber-500 fill-amber-500/20 shrink-0" />
              <span>Hệ thống Gợi ý Trinh thám</span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="grid size-7 place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
                title="Đóng bảng gợi ý"
                aria-label="Đóng bảng gợi ý"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Row 2: XP Net Badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              <Award className="size-3.5" />
              <span>Thưởng Net: {netXp} XP</span>
              {currentPenalty > 0 && (
                <span className="text-[10px] text-rose-500">(-{currentPenalty} XP)</span>
              )}
            </div>

            {hintsUnlockedCount > 0 && (
              <span className="text-[11px] font-mono text-muted-foreground">
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

            return (
              <div
                key={index}
                className={`rounded-2xl border p-3.5 transition-all ${
                  isUnlocked
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-foreground shadow-xs'
                    : isNextAvailable
                    ? 'border-amber-500/60 bg-amber-500/10 text-foreground font-semibold shadow-xs ring-2 ring-amber-500/20'
                    : 'border-border/60 bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-6 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                        isUnlocked
                          ? 'bg-emerald-500 text-emerald-950'
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

                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Check className="size-3" /> Đã mở
                      </span>
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
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer Action & Alignment ── */}
      <div className="border-t border-border pt-3.5 mt-3 space-y-3">
        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
          <span>Mỗi lượt mở gợi ý sẽ trừ {penaltyPerHint} XP từ quỹ điểm.</span>
        </div>

        {!isAllUnlocked && (
          <button
            type="button"
            onClick={onUnlockNextHint}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-amber-950 hover:bg-amber-400 transition-all shadow-md cursor-pointer"
          >
            <Unlock className="size-3.5" />
            <span>Mở Gợi ý Cấp {hintsUnlockedCount + 1} (-{penaltyPerHint} XP)</span>
          </button>
        )}
      </div>
    </div>
  );
}
