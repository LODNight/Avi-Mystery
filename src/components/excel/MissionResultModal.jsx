import React, { useEffect, useRef } from 'react';
import {
  Trophy,
  ArrowRight,
  Sparkles,
  Map,
  X,
  CheckCircle2,
} from 'lucide-react';

/**
 * MissionResultModal Component (Step 3.4)
 * Success-only modal for a completed Excel step/mission. Incorrect answers and
 * service errors stay inline in the workspace.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Trạng thái bật/tắt modal
 * @param {Object} props.result - SubmissionResult contract
 * @param {string} props.missionTitle - Tên vụ án đang hoàn thành
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Function} [props.onNextMission] - Callback chuyển sang nhiệm vụ tiếp theo
 */
export function MissionResultModal({
  isOpen,
  result,
  missionTitle = 'Vụ án trinh thám Excel',
  onClose,
  onNextMission,
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const shouldRender = Boolean(
    isOpen &&
    result?.isCorrect &&
    (result?.stepCompleted || result?.missionCompleted)
  );

  useEffect(() => {
    if (!shouldRender) return undefined;

    previousFocusRef.current = document.activeElement;
    const focusTimer = setTimeout(() => dialogRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [onClose, shouldRender]);

  if (!shouldRender) return null;

  const {
    potentialXp = 0,
    optimisticXp,
    xpAwarded,
    isFirstCompletion,
    feedback,
    persistenceStatus = 'saved', // backward compatible
  } = result || {};

  const isFinal = persistenceStatus === 'saved' || persistenceStatus === 'failed';
  const displayXp = isFinal && typeof xpAwarded === 'number' 
    ? xpAwarded 
    : (typeof optimisticXp === 'number' ? optimisticXp : potentialXp);

  const isResubmission = isFinal ? (isFirstCompletion === false || xpAwarded === 0) : (displayXp === 0);

  const statusConfig = {
    pending: {
      text: 'Đang lưu tiến trình...',
      iconClass: 'animate-spin border-amber-500 border-t-transparent',
      textColor: 'text-amber-500',
    },
    retrying: {
      text: 'Đang đồng bộ lại...',
      iconClass: 'animate-spin border-amber-500 border-t-transparent',
      textColor: 'text-amber-500',
    },
    saved: {
      text: isResubmission 
        ? 'Bạn đã nộp bài và nhận XP cho vụ án này trước đó (+0 XP).'
        : '✓ Tiến trình đã được lưu',
      iconClass: 'border-emerald-500 bg-emerald-500',
      textColor: 'text-emerald-500',
    },
    failed: {
      text: '⚠️ Chưa thể đồng bộ tiến trình',
      iconClass: 'border-red-500 bg-red-500',
      textColor: 'text-red-500',
    }
  };

  const currentStatus = statusConfig[persistenceStatus] || statusConfig.saved;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-result-title"
        aria-describedby="modal-result-feedback"
        tabIndex={-1}
        className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-card p-6 shadow-2xl shadow-emerald-500/10 outline-none transition-all animate-scale-up dark:border-emerald-500/30 sm:p-8"
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
          <div className="grid size-20 place-items-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 shadow-lg ring-8 ring-emerald-500/5 transition-transform dark:text-emerald-400">
            <Trophy className="size-10 fill-current animate-bounce-subtle" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-600 dark:text-emerald-400">
                Phá Án Thành Công
              </span>
            </div>

            <h2
              id="modal-result-title"
              className="text-2xl font-extrabold tracking-tight text-foreground"
            >
              Chúc Mừng Trinh Thám!
            </h2>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              Vụ án: <strong className="text-foreground">{missionTitle}</strong>
            </p>
          </div>
        </div>

        {/* Reward Card: Displays +XP for first completion, +0 XP for re-submissions */}
        <div
          className={`mt-6 space-y-2 rounded-2xl border p-4 text-center animate-fade-in transition-colors duration-500 ${
            isResubmission
              ? 'border-amber-500/20 bg-muted/40'
              : 'border-emerald-500/30 bg-emerald-500/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className={`size-5 ${isResubmission ? 'text-amber-500/70' : 'fill-amber-500 text-amber-500'}`} />
            <span className={`font-mono text-xl font-black ${isResubmission ? 'text-muted-foreground' : 'text-emerald-700 dark:text-emerald-300'}`}>
              Phần thưởng: +{displayXp} XP {!isFinal && 'dự kiến'}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 mt-1">
             {(!isFinal) && (
               <div className={`size-3 rounded-full border-2 ${currentStatus.iconClass}`} />
             )}
             <p className={`text-[11px] ${isFinal ? 'text-muted-foreground' : currentStatus.textColor}`}>
               {currentStatus.text}
             </p>
          </div>
        </div>

        {/* ── Feedback Message ── */}
        <div
          id="modal-result-feedback"
          className="mt-5 rounded-2xl border border-emerald-500/20 bg-muted/40 p-4 text-xs font-medium text-foreground sm:text-sm"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <p className="leading-relaxed">{feedback}</p>
          </div>
        </div>

        {/* ── Action Buttons Footer ── */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-muted sm:w-auto"
          >
            <Map className="size-4 text-muted-foreground" />
            <span>Đóng kết quả</span>
          </button>

          <button
            type="button"
            onClick={onNextMission || onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-700 sm:w-auto"
          >
            <span>Về bản đồ học tập</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
