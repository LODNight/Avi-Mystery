import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Calculator,
  Filter,
  FileText,
  GitCompare,
  CheckCircle2,
  FlaskConical,
  Circle,
} from 'lucide-react';

/**
 * ClueCard
 *
 * Displays an investigation lead — NOT an "Exercise N".
 * Clues are narrative micro-investigation prompts that direct the
 * investigator toward relevant evidence and analysis tools.
 *
 * Status states:
 *   'investigating'      — clue opened / being worked
 *   'finding_recorded'   — at least one finding exists for this clue's phase
 *   'confirmed'          — phase report was ACCEPTED by HQ
 *
 * UI principles:
 *   - Title format: "LEAD — [TOPIC]"
 *   - Show narrative text as written (do not add hints or formulas)
 *   - Show relevant source badges (clickable shortcut to open source)
 *   - Do NOT show expected answer or expected formula
 */

const TYPE_META = {
  excel_calculate: { icon: Calculator, labelKey: 'typeCalculate', color: 'text-emerald-400' },
  excel_filter:    { icon: Filter,     labelKey: 'typeFilter',    color: 'text-blue-400'    },
  read_document:   { icon: FileText,   labelKey: 'typeReview',    color: 'text-purple-400'  },
  cross_reference: { icon: GitCompare, labelKey: 'typeCompare',   color: 'text-amber-400'   },
};

const STATUS_META = {
  investigating:     { labelKey: 'statusInvestigating',    dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400'   },
  finding_recorded:  { labelKey: 'statusFindingRecorded', dot: 'bg-emerald-400',            text: 'text-emerald-400' },
  confirmed:         { labelKey: 'statusConfirmed',        dot: 'bg-emerald-500',            text: 'text-emerald-500' },
};

export function ClueCard({
  clue,
  status = 'investigating',
  sources = [],           // Full source objects for badge rendering
  onOpenSource,           // (sourceId) => void
  onInvestigateInSpreadsheet, // (sourceId) => void — shortcut to workbench
}) {
  const { t } = useTranslation('investigation');
  const [isExpanded, setIsExpanded] = useState(true);

  const typeMeta = TYPE_META[clue.type] || TYPE_META.excel_calculate;
  const TypeIcon = typeMeta.icon;
  const statusMeta = STATUS_META[status] || STATUS_META.investigating;

  const relevantSources = (clue.relevantSourceIds || [])
    .map(id => sources.find(s => s.id === id))
    .filter(Boolean);

  return (
    <div className={`
      rounded-xl border overflow-hidden transition-colors
      ${status === 'confirmed'
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : 'border-amber-500/20 bg-amber-500/5'
      }
    `}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left cursor-pointer hover:bg-white/5 transition-colors"
      >
        {/* Status dot */}
        <div className={`size-1.5 rounded-full shrink-0 ${statusMeta.dot}`} />

        {/* Title */}
        <span className="flex-1 text-xs font-bold text-foreground truncate">
          {clue.title}
        </span>

        {/* Type badge */}
        <div className={`flex items-center gap-1 shrink-0 ${typeMeta.color}`}>
          <TypeIcon className="size-3" />
          <span className="text-[10px] font-semibold hidden sm:inline">{t(typeMeta.labelKey)}</span>
        </div>

        {/* Expand chevron */}
        {isExpanded
          ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
          : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
        }
      </button>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Status line */}
          <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${statusMeta.text}`}>
            {status === 'confirmed'
              ? <CheckCircle2 className="size-3" />
              : <Circle className="size-3" />
            }
            {t(statusMeta.labelKey)}
          </div>

          {/* Narrative text */}
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {clue.narrative}
          </p>

          {/* Relevant source badges */}
          {relevantSources.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('evidenceSources')}
              </p>
              <div className="flex flex-col gap-1">
                {relevantSources.map(src => (
                  <div key={src.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenSource?.(src.id)}
                      className="flex items-center gap-1.5 text-[11px] text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="size-2.5 shrink-0" />
                      <span className="truncate">{src.title}</span>
                    </button>
                    {src.type === 'table' && (
                      <button
                        type="button"
                        onClick={() => onInvestigateInSpreadsheet?.(src.id)}
                        className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                        title={t('investigateWorkbenchTooltip')}
                      >
                        <FlaskConical className="size-2.5" />
                        <span>{t('workbenchShort')}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
