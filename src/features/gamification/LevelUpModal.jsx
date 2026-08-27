import React, { useEffect } from 'react';
import { Award, Sparkles, X, ArrowRight, ShieldCheck, Trophy } from 'lucide-react';

/**
 * LevelUpModal Component
 * Modal chúc mừng thăng cấp dành cho học viên Avi-Mystery.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Trạng thái hiển thị modal
 * @param {Function} props.onClose - Handler đóng modal
 * @param {number} [props.previousLevel=1] - Cấp độ trước đó
 * @param {number} [props.newLevel=2] - Cấp độ mới vừa đạt được
 * @param {string} [props.newTitle="Nhà Điều Tra Cấp Cao"] - Danh hiệu thám tử mới
 * @param {number} [props.xpEarned=0] - Số điểm XP vừa nhận giúp thăng cấp
 */
export function LevelUpModal({
  isOpen,
  onClose,
  previousLevel = 1,
  newLevel = 2,
  newTitle = 'Nhà Điều Tra Cấp Cao',
  xpEarned = 0,
}) {
  // Đóng modal khi bấm phím Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/40 bg-card p-6 sm:p-8 shadow-2xl transition-all animate-scale-up">
        {/* Glow effect ở phía trên */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Nút X đóng modal */}
        <button
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Level Up Badge Header Icon */}
        <div className="relative z-10 text-center space-y-4">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 text-amber-950 animate-bounce">
            <Trophy className="size-10 stroke-[2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            <Sparkles className="size-3.5 fill-current" />
            <span>THĂNG CẤP DANH HIỆU!</span>
          </div>

          <h2 id="levelup-title" className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Chúc mừng Thám tử! 🎉
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {xpEarned > 0 ? (
              <>Bạn vừa tích lũy <strong className="text-amber-500 font-mono">+{xpEarned} XP</strong> và đạt mốc thăng cấp mới!</>
            ) : (
              <>Bạn đã nỗ lực phân tích dữ liệu xuất sắc và chinh phục mốc thử thách mới!</>
            )}
          </p>
        </div>

        {/* Badge chuyển đổi cấp độ: Level cũ -> Level mới */}
        <div className="my-6 rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 text-center">
            {/* Cấp độ cũ */}
            <div className="flex-1 rounded-xl border border-border bg-background p-3">
              <span className="block text-[10px] font-mono font-semibold uppercase text-muted-foreground">
                Cấp độ cũ
              </span>
              <span className="text-lg font-black text-muted-foreground font-mono">
                LV. {previousLevel}
              </span>
            </div>

            <ArrowRight className="size-5 text-amber-500 shrink-0" />

            {/* Cấp độ mới */}
            <div className="flex-1 rounded-xl border border-amber-500/50 bg-amber-500/15 p-3 shadow-sm">
              <span className="block text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                Cấp độ mới
              </span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                LV. {newLevel}
              </span>
            </div>
          </div>

          {/* Danh hiệu thám tử */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <ShieldCheck className="size-4 text-amber-500" />
            <span className="text-xs font-bold text-foreground">
              Danh hiệu mới: <span className="text-amber-600 dark:text-amber-400">{newTitle}</span>
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold py-3.5 px-4 text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
        >
          <span>Tiếp tục phá án</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
