import React, { useEffect } from 'react';
import { Flame, X, Check, Calendar, Sparkles, ArrowRight } from 'lucide-react';

const DEFAULT_WEEKDAYS = [
  { label: 'T2', short: 'Mon' },
  { label: 'T3', short: 'Tue' },
  { label: 'T4', short: 'Wed' },
  { label: 'T5', short: 'Thu' },
  { label: 'T6', short: 'Fri' },
  { label: 'T7', short: 'Sat' },
  { label: 'CN', short: 'Sun' },
];

/**
 * StreakDetailModal Component
 * Popup chi tiết chuỗi ngày học liên tục (Streak Counter) của thám tử.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Trạng thái mở modal
 * @param {Function} props.onClose - Handler đóng modal
 * @param {number} [props.streakCount=1] - Số ngày streak hiện tại
 * @param {Array<{day: string, active: boolean, isToday?: boolean}>} [props.weeklyHistory] - Lịch sử 7 ngày trong tuần
 */
export function StreakDetailModal({
  isOpen,
  onClose,
  streakCount = 1,
  weeklyHistory,
}) {
  // Đóng modal khi bấm Escape
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

  // Lịch sử mặc định nếu không truyền prop
  const days = weeklyHistory || DEFAULT_WEEKDAYS.map((d, index) => ({
    day: d.label,
    active: index <= (streakCount > 0 ? (streakCount - 1) % 7 : 0),
    isToday: index === (streakCount > 0 ? (streakCount - 1) % 7 : 0),
  }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/40 bg-card p-6 sm:p-8 shadow-2xl transition-all animate-scale-up">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Nút X đóng */}
        <button
          onClick={onClose}
          aria-label="Đóng bảng streak"
          className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Header Icon Flame */}
        <div className="relative z-10 text-center space-y-4">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-lg shadow-amber-500/10 animate-pulse">
            <Flame className="size-11 fill-current" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            <Sparkles className="size-3.5 fill-current" />
            <span>CHUỖI PHÁ ÁN LIÊN TỤC</span>
          </div>

          <h2 id="streak-title" className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {streakCount} Ngày Liên Tiếp! 🔥
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Duy trì thói quen học phân tích dữ liệu mỗi ngày để giữ vững phong độ thám tử.
          </p>
        </div>

        {/* Weekly Streak Tracker Grid */}
        <div className="my-6 rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-amber-500" />
              Tiến trình tuần này
            </span>
            <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold">
              {days.filter((d) => d.active).length} / 7 ngày
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((item, idx) => (
              <div
                key={item.day || idx}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all ${
                  item.active
                    ? 'border border-amber-500/50 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                    : 'border border-border/60 bg-background/50 text-muted-foreground'
                } ${item.isToday ? 'ring-2 ring-amber-500' : ''}`}
              >
                <span className="text-[10px] font-mono uppercase">{item.day}</span>
                <div
                  className={`grid size-6 place-items-center rounded-full ${
                    item.active
                      ? 'bg-amber-500 text-amber-950 shadow-xs'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.active ? (
                    <Flame className="size-3.5 fill-current" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold py-3.5 px-4 text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
        >
          <span>Đã hiểu & Giữ vững Streak</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
