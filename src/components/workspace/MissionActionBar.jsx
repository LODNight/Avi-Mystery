import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Zap, Send } from 'lucide-react';

/**
 * MissionActionBar Component
 *
 * Thanh hành động độc lập, tách biệt khỏi Split-Pane workspace.
 * Mô phỏng phong cách LeetCode: fixed bottom bar chứa Submit + Navigation.
 *
 * - Vị trí: Bên dưới WorkspaceSplitPane (ngoài vùng split-pane)
 * - Left: Điều hướng bài trước / kế tiếp
 * - Right: Nút nộp bài (primary CTA)
 */
export function MissionActionBar({
  // Submission
  onSubmit,
  isSubmitting = false,
  isCompleted = false,
  submitLabel,
  submitIcon = 'zap', // 'zap' | 'send'

  // Adjacent navigation
  adjacentMissions = { prev: null, next: null },
  isPractice = false,
  missionProgress = null, // e.g. "Vụ án 2 / 8"

  // Extra slot (e.g. Run button for SQL passed from parent)
  extraLeftSlot = null,

  className = '',
}) {
  const IconComp = submitIcon === 'send' ? Send : Zap;

  const resolvedSubmitLabel = submitLabel
    ? submitLabel
    : isSubmitting
    ? 'Đang chấm...'
    : isCompleted
    ? 'Nộp lại bài làm'
    : 'Nộp bài vụ án';

  const buildMissionPath = (mission) => {
    if (!mission) return null;
    if (isPractice) return `/practice?mission=${mission.id}`;
    return mission.tool === 'sql'
      ? `/missions/${mission.id}/sql`
      : `/missions/${mission.id}/workspace`;
  };

  const prevPath = buildMissionPath(adjacentMissions?.prev);
  const nextPath = buildMissionPath(adjacentMissions?.next);

  return (
    <div
      className={`shrink-0 flex items-center justify-between gap-3 px-3 sm:px-4 py-2 border-t border-border bg-card select-none ${className}`}
      role="toolbar"
      aria-label="Thanh hành động vụ án"
    >
      {/* Left Zone: Navigation + extra slot */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {extraLeftSlot}

        {/* Bài trước */}
        {prevPath ? (
          <Link
            to={prevPath}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title={`Bài trước: ${adjacentMissions.prev?.title || ''}`}
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Bài trước</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-muted-foreground/40 cursor-not-allowed opacity-40">
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Bài trước</span>
          </span>
        )}

        {/* Bài kế tiếp */}
        {nextPath ? (
          <Link
            to={nextPath}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title={`Bài kế tiếp: ${adjacentMissions.next?.title || ''}`}
          >
            <span className="hidden sm:inline">Bài kế tiếp</span>
            <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-muted-foreground/40 cursor-not-allowed opacity-40">
            <span className="hidden sm:inline">Bài kế tiếp</span>
            <ArrowRight className="size-3.5" />
          </span>
        )}
      </div>

      {/* Center Zone: Progress Indicator */}
      <div className="hidden md:flex items-center gap-2">
        {missionProgress && (
          <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
            {missionProgress}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground/70 font-mono">
          <kbd className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded border border-border">
            {submitIcon === 'send' ? 'Shift + Enter' : 'Ctrl + Enter'}
          </kbd>{' '}
          để nộp bài
        </span>
      </div>

      {/* Right Zone: Submit CTA */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          aria-label={resolvedSubmitLabel}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shrink-0 min-w-[8.5rem]"
          title={isCompleted ? 'Nộp lại bài làm vụ án' : 'Nộp bài để chấm điểm (Ctrl+Enter)'}
        >
          {isSubmitting ? (
            <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <IconComp
              className={`size-3.5 ${submitIcon === 'zap' ? 'fill-amber-300 text-amber-300' : ''}`}
            />
          )}
          <span>{resolvedSubmitLabel}</span>
        </button>
      </div>
    </div>
  );
}
