import React from 'react';
import {
  Trophy,
  AlertTriangle,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Map,
  X,
  CheckCircle2,
} from 'lucide-react';

/**
 * MissionResultModal Component (Step 3.4)
 * Modal popup thông báo kết quả Đúng/Sai cho vụ án Excel Mission
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Trạng thái bật/tắt modal
 * @param {Object} props.result - Kết quả chấm điểm bài nộp { isCorrect, netXp, baseXp, hintPenalty, userLevelUp, updatedUser, feedback, missionTitle }
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Function} [props.onNextMission] - Callback chuyển sang nhiệm vụ tiếp theo
 * @param {Function} [props.onRetry] - Callback thử lại công thức
 */
export function MissionResultModal({
  isOpen,
  result,
  onClose,
  onNextMission,
  onRetry,
}) {
  if (!isOpen || !result) return null;

  const {
    isCorrect,
    netXp = 0,
    baseXp = 100,
    hintPenalty = 0,
    userLevelUp = false,
    updatedUser,
    feedback,
    missionTitle = 'Vụ án trinh thám Excel',
  } = result;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-result-title"
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl transition-all animate-scale-up ${
          isCorrect
            ? 'border-emerald-500/40 dark:border-emerald-500/30 shadow-emerald-500/10'
            : 'border-rose-500/40 dark:border-rose-500/30 shadow-rose-500/10'
        }`}
      >
        {/* Nút Đóng Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          title="Đóng cửa sổ"
        >
          <X className="size-5" />
        </button>

        {/* ── Modal Header: Animated Result Badge ── */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className={`grid size-20 place-items-center rounded-3xl p-4 shadow-lg transition-transform ${
              isCorrect
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/5'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 ring-8 ring-rose-500/5'
            }`}
          >
            {isCorrect ? (
              <Trophy className="size-10 fill-current animate-bounce-subtle" />
            ) : (
              <AlertTriangle className="size-10 fill-current" />
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              {isCorrect ? (
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Phá Án Thành Công
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                  Chưa Đúng Yêu Cầu
                </span>
              )}
            </div>

            <h2
              id="modal-result-title"
              className="text-2xl font-extrabold tracking-tight text-foreground"
            >
              {isCorrect ? 'Chúc Mừng Trinh Thám!' : 'Chưa Thể Phá Án'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              Vụ án: <strong className="text-foreground">{missionTitle}</strong>
            </p>
          </div>
        </div>

        {/* ── XP & Level Up Rewards Section ── */}
        {isCorrect && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="size-5 text-amber-500 fill-amber-500" />
              <span className="font-mono text-xl font-black text-emerald-700 dark:text-emerald-300">
                +{netXp} XP
              </span>
            </div>

            {hintPenalty > 0 && (
              <p className="text-[11px] text-muted-foreground font-mono">
                XP Gốc: {baseXp} XP • Phạt dùng gợi ý: -{hintPenalty} XP
              </p>
            )}

            {userLevelUp && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 animate-pulse">
                <Award className="size-4 text-amber-500 fill-amber-500" />
                <span>🎉 THĂNG CẤP MỚI! Bạn đã đạt Cấp {updatedUser?.level || 2}!</span>
              </div>
            )}
          </div>
        )}

        {/* ── Feedback Message ── */}
        <div
          className={`mt-5 rounded-2xl border p-4 text-xs sm:text-sm font-medium ${
            isCorrect
              ? 'border-emerald-500/20 bg-muted/40 text-foreground'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isCorrect ? (
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{feedback}</p>
          </div>
        </div>

        {/* ── Action Buttons Footer ── */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border pt-5">
          {isCorrect ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer w-full sm:w-auto"
              >
                <Map className="size-4 text-muted-foreground" />
                <span>Xem bản đồ vụ án</span>
              </button>

              <button
                type="button"
                onClick={onNextMission || onClose}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-md cursor-pointer w-full sm:w-auto"
              >
                <span>Bài học tiếp theo</span>
                <ArrowRight className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer w-full sm:w-auto"
              >
                <span>Xem lại bài làm</span>
              </button>

              <button
                type="button"
                onClick={onRetry || onClose}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md cursor-pointer w-full sm:w-auto"
              >
                <RotateCcw className="size-4" />
                <span>Thử lại công thức</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
