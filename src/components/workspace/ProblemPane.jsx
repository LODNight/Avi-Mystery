import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Database,
  Lightbulb,
  Lock,
  Unlock,
  Pin,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { formatDuration } from '../../utils/format.js';

/**
 * ProblemPane Component (Sprint 9 / Split-Pane Architecture)
 * Cột Trái (Reading / Problem Statement Space):
 * - Tiêu đề & Thông tin vụ án
 * - Cốt truyện trinh thám & Bối cảnh
 * - Mục tiêu & Ô đích cần giải
 * - Lược đồ CSDL (nếu là SQL qua schemaSlot)
 * - Hệ thống Gợi ý từng bước tích hợp ngay trong luồng đọc
 */
export function ProblemPane({
  title = '',
  tool = 'excel', // 'excel' | 'sql'
  isPractice = false,
  missionId = '',
  story = '',
  objective = '',
  targetCell = '',
  isCompleted = false,
  rewardXp = 100,
  hintsUnlockedCount = 0,
  estimatedDuration = 5,
  backUrl,
  adjacentMissions = { prev: null, next: null },
  hints = [],
  onUnlockNextHint,
  pinnedHint = null,
  onPinHint,
  schemaSlot = null,
  extraSlot = null,
}) {
  const [showHintsAccordion, setShowHintsAccordion] = useState(true);

  // Chuẩn hóa mảng gợi ý
  const normalizedHints = Array.isArray(hints) && hints.length > 0
    ? hints
    : typeof hints === 'string' && hints.trim()
    ? [
        tool === 'sql' ? 'Xác định bảng và các cột dữ liệu cần truy vấn.' : 'Hãy xác định các ô chứa thông tin Số lượng và Đơn giá của mặt hàng.',
        tool === 'sql' ? 'Sử dụng mệnh đề WHERE hoặc GROUP BY phù hợp.' : 'Sử dụng phép tính hoặc hàm Excel phù hợp.',
        hints,
      ]
    : [
        'Xác định thông tin dữ liệu đầu vào trong bảng tính.',
        'Sử dụng công thức hoặc truy vấn phù hợp.',
        'Kiểm tra lại cú pháp trước khi chạy thử.',
      ];

  const totalHints = normalizedHints.length;
  const penaltyPerHint = 15;
  const currentPenalty = hintsUnlockedCount * penaltyPerHint;
  const netXp = Math.max(0, rewardXp - currentPenalty);
  const isAllUnlocked = hintsUnlockedCount >= totalHints;

  const defaultBack = backUrl || (isPractice ? '/practice' : '/map');

  return (
    <div className="flex flex-col space-y-4 pb-4 text-foreground animate-fade-in select-text">
      {/* ── LEVEL 1: MISSION IDENTITY ── */}
      <div className="space-y-2 border-b border-border pb-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400">
              {isPractice ? 'PRACTICE MODE' : tool === 'sql' ? 'SQL INVESTIGATION' : 'EXCEL MISSION'}
            </span>

            <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded border border-border text-muted-foreground font-semibold">
              {isPractice ? 'Mã bài tập:' : 'Mã vụ án:'} {missionId}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="size-3" />
            <span>+{netXp} XP</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-foreground flex items-center gap-2">
          <span>{title}</span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="size-3" /> Đã phá án
            </span>
          )}
        </h1>
      </div>

      {/* ── Completed Navigation Banner (Nếu đã giải xong) ── */}
      {isCompleted && (
        <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Vụ án đã phá thành công! Bạn có thể làm lại để tối ưu hóa công thức.</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            {adjacentMissions?.prev && (
              <Link
                to={
                  isPractice
                    ? `/practice?mission=${adjacentMissions.prev.id}`
                    : adjacentMissions.prev.tool === 'sql'
                    ? `/missions/${adjacentMissions.prev.id}/sql`
                    : `/missions/${adjacentMissions.prev.id}/workspace`
                }
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-bold text-foreground shadow-2xs hover:bg-muted transition-all"
              >
                <ArrowLeft className="size-3" /> Bài trước
              </Link>
            )}
            {adjacentMissions?.next && (
              <Link
                to={
                  isPractice
                    ? `/practice?mission=${adjacentMissions.next.id}`
                    : adjacentMissions.next.tool === 'sql'
                    ? `/missions/${adjacentMissions.next.id}/sql`
                    : `/missions/${adjacentMissions.next.id}/workspace`
                }
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-2xs hover:opacity-90 transition-all"
              >
                Bài kế tiếp <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── LEVEL 2: CASE FILE (Bối cảnh vụ án - Subtle elevated surface) ── */}
      {story && (
        <div className="rounded-xl border border-border bg-card/60 dark:bg-card/40 p-3.5 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3 text-amber-500" />
            <span>Hồ sơ vụ án (Case File)</span>
          </div>
          <p className="text-xs italic leading-relaxed text-muted-foreground border-l-2 border-amber-500/40 pl-2.5 py-0.5">
            "{story}"
          </p>
        </div>
      )}

      {/* ── LEVEL 3: OBJECTIVE (Strongest element in sidebar) ── */}
      <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/15 p-4 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🎯</span>
            <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
              MỤC TIÊU PHÁ ÁN (OBJECTIVE)
            </span>
          </div>
          {targetCell && (
            <div className="flex items-center gap-1 rounded-md bg-amber-500 text-amber-950 px-2 py-0.5 font-mono text-xs font-black shadow-2xs">
              <Sparkles className="size-3 fill-current" />
              <span>Ô đích: {targetCell}</span>
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">
          {objective}
        </p>
        {targetCell && (
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono font-semibold flex items-center gap-1">
            <span>&bull; Nhập công thức hợp lệ vào ô:</span>
            <span className="font-bold underline underline-offset-2">{targetCell}</span>
          </div>
        )}
      </div>

      {/* ── Schema Slot (SQL only) ── */}
      {schemaSlot && (
        <div className="space-y-2">
          {schemaSlot}
        </div>
      )}

      {/* ── Extra Slot ── */}
      {extraSlot}

      {/* ── LEVEL 4: COMPACT PROGRESSIVE HINTS ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setShowHintsAccordion(!showHintsAccordion)}
          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/60 transition-colors text-left cursor-pointer"
          aria-expanded={showHintsAccordion}
          aria-label="Gợi ý trinh thám"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="size-3.5 text-amber-500 fill-amber-500/20" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Gợi ý trinh thám
            </span>
            <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              {hintsUnlockedCount}/{totalHints}
            </span>
          </div>
          <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${showHintsAccordion ? 'rotate-180' : ''}`} />
        </button>

        {/* Accordion Content */}
        {showHintsAccordion && (
          <div className="p-3 space-y-2 border-t border-border animate-fade-in">
            {/* Warning / XP Deduction Info */}
            <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span>Mỗi lần mở gợi ý sẽ trừ {penaltyPerHint} XP</span>
              {currentPenalty > 0 && (
                <span className="font-mono font-bold text-rose-500">(-{currentPenalty} XP)</span>
              )}
            </div>

            {/* List of Progressive Hints */}
            <div className="space-y-1.5">
              {normalizedHints.map((hintText, index) => {
                const levelNumber = index + 1;
                const isUnlocked = levelNumber <= hintsUnlockedCount;
                const isNextAvailable = index === hintsUnlockedCount;
                const isPinned = pinnedHint === hintText;

                return (
                  <div
                    key={`hint-card-${levelNumber}`}
                    className={`rounded-lg border p-2.5 transition-all ${
                      isUnlocked
                        ? isPinned
                          ? 'border-amber-500 bg-amber-500/10 shadow-2xs'
                          : 'border-border bg-background'
                        : isNextAvailable
                        ? 'border-dashed border-amber-500/50 bg-amber-500/5'
                        : 'border-dashed border-border/60 opacity-60 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                        {isUnlocked ? (
                          <Unlock className="size-3 text-emerald-500" />
                        ) : (
                          <Lock className="size-3 text-muted-foreground" />
                        )}
                        <span className={isUnlocked ? 'text-foreground' : 'text-muted-foreground'}>
                          Manh mối #{levelNumber}
                        </span>
                      </div>

                      {isUnlocked && onPinHint && (
                        <button
                          type="button"
                          onClick={() => onPinHint(isPinned ? null : hintText)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                            isPinned
                              ? 'bg-amber-500 text-amber-950 font-extrabold shadow-2xs'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                          }`}
                          title={isPinned ? 'Gỡ gợi ý khỏi thanh công thức' : 'Ghim gợi ý lên thanh công thức'}
                        >
                          <Pin className="size-2.5" />
                          <span>{isPinned ? 'Đang ghim' : 'Ghim'}</span>
                        </button>
                      )}

                      {!isUnlocked && isNextAvailable && onUnlockNextHint && (
                        <button
                          type="button"
                          onClick={onUnlockNextHint}
                          aria-label={`Mở Gợi ý Cấp ${levelNumber}`}
                          className="inline-flex items-center gap-1 rounded bg-amber-500 hover:bg-amber-600 text-amber-950 px-2 py-0.5 text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Unlock className="size-2.5" />
                          <span>Mở khóa (-{penaltyPerHint} XP)</span>
                        </button>
                      )}

                      {!isUnlocked && !isNextAvailable && (
                        <span className="text-[10px] text-muted-foreground font-mono italic">
                          Khóa
                        </span>
                      )}
                    </div>

                    {isUnlocked && (
                      <p className="mt-1.5 text-xs leading-relaxed text-foreground font-medium">
                        {hintText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
