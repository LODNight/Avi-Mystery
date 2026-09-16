import React from 'react';
import { Lock, FileCheck, Search, Key } from 'lucide-react';
import InvestigationStamp from './InvestigationStamp';

/**
 * EvidenceCard - Displays an investigation clue/artifact item.
 * Designed with detective dossier aesthetics, tactile borders, and reveal animations.
 */
export default function EvidenceCard({
  title,
  clueId = 'CLUE-01',
  description,
  status = 'verified', // 'verified' | 'locked'
  tags = [],
  dataSnippet,
  animated = true,
  className = '',
  testId = 'evidence-card',
}) {
  const isUnlocked = status === 'verified' || status === 'unlocked';

  if (!isUnlocked) {
    return (
      <div
        data-testid={testId}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed border-border/80 bg-surface/60 p-4 transition-all duration-200 opacity-70 ${className}`}
      >
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            {clueId} • NIÊM PHONG
          </span>
          <span className="text-[11px] font-medium bg-muted px-2 py-0.5 rounded">
            Chưa giải mật
          </span>
        </div>
        <p className="text-sm text-muted-foreground italic line-clamp-2">
          {description || 'Manh mối quan trọng của vụ án. Hãy vượt qua thử thách này để giải mật dữ liệu điều tra.'}
        </p>
      </div>
    );
  }

  const animClass = animated ? 'animate-reveal motion-reduce:animate-none' : '';

  return (
    <div
      data-testid={testId}
      className={`relative overflow-hidden rounded-xl border border-primary/30 bg-card/95 p-4.5 shadow-sm transition-all duration-200 hover:border-primary/60 hover:shadow-md ${animClass} ${className}`}
      style={{
        backgroundImage: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.04), transparent 70%)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-wider">
              {clueId} • VẬT CHỨNG
            </span>
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              {title || 'Manh mối đã thu thập'}
            </h4>
          </div>
        </div>

        {/* Small Stamp */}
        <InvestigationStamp
          variant="verified"
          size="sm"
          rotate="rotate-3"
          animated={animated}
        />
      </div>

      {/* Description Content */}
      <div className="text-xs text-muted-foreground leading-relaxed mb-3">
        {description}
      </div>

      {/* Data Snippet (if available) */}
      {dataSnippet && (
        <div className="mb-3 rounded-lg bg-muted/60 p-2 font-mono text-[11px] text-foreground/90 border border-border/50 overflow-x-auto">
          <code>{dataSnippet}</code>
        </div>
      )}

      {/* Tags Footer */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/5 text-primary border border-primary/20"
            >
              <Key className="w-2.5 h-2.5 opacity-70" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
