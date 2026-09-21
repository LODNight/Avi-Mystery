import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Archive,
  Radio,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Stamp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VerificationResultPanel } from './VerificationResultPanel.jsx';

/**
 * HQCommunicationPanel
 * The investigator's communication terminal to HQ.
 * Sections: menu, notebook, hint, evidence_locker, report, verification_result.
 */
export function HQCommunicationPanel({
  isOpen,
  activeSection,
  caseData,
  caseState,
  investigationState,
  reportDraft,
  reportDefinition,
  findings = [],
  isVerifying,
  onClose,
  onSetSection,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onUnpinEvidence,
  onUpdateReportField,
  onSendReport,
  onResumeInvestigation,
  onOpenReport,
  embedded = false,
  activeFieldId = null,
  onSelectField = null,
}) {
  const { t } = useTranslation('investigation');
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState('observation');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const verResult = reportDraft?.verificationResult;
  const showVerificationResult = ['CASE_PROGRESS', 'REPORT_RETURNED'].includes(caseState?.status);

  // Auto-navigate to result after verification
  if (showVerificationResult && activeSection !== 'verification_result' && activeSection !== 'menu') {
    // Let parent handle this
  }

  const panelContent = (
    <div className={`h-full w-full bg-card flex flex-col ${embedded ? '' : 'max-w-sm border-l border-border shadow-2xl animate-in slide-in-from-right duration-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-card/95">
        <div className="flex items-center gap-2">
          {activeSection !== 'menu' && (
            <button
              type="button"
              onClick={() => onSetSection('menu')}
              className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title={t('backToMenu')}
            >
              <ArrowLeft className="size-3.5" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <Radio className="size-3.5 text-amber-500 animate-pulse" />
            <span className="text-xs font-black tracking-widest uppercase text-foreground">
              HQ Terminal
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          aria-label="Close HQ Communication"
          title={t('closePanel')}
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Navigation Quick Tabs */}
      <div className="flex items-center border-b border-border/60 bg-muted/15 px-2 shrink-0 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => onSetSection('report')}
          className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeSection === 'report' || activeSection === 'verification_result'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-background/60'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Send className="size-3" />
          <span>{t('reportTab')}</span>
          {showVerificationResult && <span className="size-1.5 rounded-full bg-amber-500" />}
        </button>
        <button
          type="button"
          onClick={() => onSetSection('notebook')}
          className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeSection === 'notebook'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-background/60'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="size-3" />
          <span>{t('notebookTab', { count: investigationState?.notes?.length || 0 })}</span>
        </button>
        <button
          type="button"
          onClick={() => onSetSection('evidence_locker')}
          className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeSection === 'evidence_locker'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-background/60'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Archive className="size-3" />
          <span>{t('evidenceTab', { count: investigationState?.pinnedEvidence?.length || 0 })}</span>
        </button>
      </div>

      {/* Case info bar */}
      <div className="px-4 py-2 border-b border-border/60 bg-muted/20 shrink-0 flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground truncate max-w-[240px]">
          {caseData?.caseNumber} — {caseData?.title}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-medium">{t('phase', { phase: caseState?.currentPhaseId?.replace('phase-', '') || '1' })}</span>
        </div>
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeSection === 'menu' && (
          <HQMenu
            caseState={caseState}
            reportDraft={reportDraft}
            showVerificationResult={showVerificationResult}
            onSetSection={onSetSection}
          />
        )}
          {activeSection === 'notebook' && (
            <NotebookSection
              notes={investigationState?.notes || []}
              noteText={noteText}
              noteCategory={noteCategory}
              editingNoteId={editingNoteId}
              editingText={editingText}
              onNoteTextChange={setNoteText}
              onNoteCategoryChange={setNoteCategory}
              onAddNote={() => {
                if (!noteText.trim()) return;
                onAddNote?.({ text: noteText, category: noteCategory });
                setNoteText('');
              }}
              onStartEdit={(note) => { setEditingNoteId(note.id); setEditingText(note.text); }}
              onSaveEdit={(noteId) => { onUpdateNote?.(noteId, editingText); setEditingNoteId(null); }}
              onCancelEdit={() => setEditingNoteId(null)}
              onEditTextChange={setEditingText}
              onDelete={onDeleteNote}
            />
          )}
          {activeSection === 'evidence_locker' && (
            <EvidenceLockerSection
              pinnedEvidence={investigationState?.pinnedEvidence || []}
              onUnpin={onUnpinEvidence}
            />
          )}
          {activeSection === 'report' && (
            <ReportSection
              reportDraft={reportDraft}
              reportDefinition={reportDefinition}
              caseState={caseState}
              isVerifying={isVerifying}
              findings={findings}
              onUpdateField={onUpdateReportField}
              onSend={onSendReport}
              onOpenReport={onOpenReport}
              activeFieldId={activeFieldId}
              onSelectField={onSelectField}
            />
          )}
          {activeSection === 'verification_result' && (
            <VerificationResultSection
              result={reportDraft?.verificationResult}
              reportDefinition={reportDefinition}
              caseData={caseData}
              caseState={caseState}
              onResumeInvestigation={onResumeInvestigation}
              onContinueToNextPhase={onResumeInvestigation}
            />
          )}
        </div>
      </div>
  );

  if (embedded) {
    return panelContent;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      role="dialog"
      aria-label="HQ Communication"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 h-full">
        {panelContent}
      </div>
    </div>
  );
}

// ── HQ Menu ──────────────────────────────────────────────────────────────────

function HQMenu({ caseState, reportDraft, showVerificationResult, onSetSection }) {
  const { t } = useTranslation('investigation');
  const menuItems = [
    {
      id: 'notebook',
      icon: BookOpen,
      title: t('notebookTitle'),
      description: t('notebookDesc'),
    },
    {
      id: 'hint',
      icon: Lightbulb,
      title: t('requestHintTitle'),
      description: t('requestHintDesc'),
      disabled: true,
      badge: t('soonBadge'),
    },
    {
      id: 'evidence_locker',
      icon: Archive,
      title: t('evidenceLockerTitle'),
      description: t('evidenceLockerDesc'),
    },
    {
      id: showVerificationResult ? 'verification_result' : 'report',
      icon: Send,
      title: showVerificationResult ? t('hqResponseTitle') : t('sendReportTitle'),
      description: showVerificationResult
        ? t('hqResponseDesc')
        : t('sendReportDesc'),
      highlight: true,
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-2">
      {menuItems.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => !item.disabled && onSetSection(item.id)}
            disabled={item.disabled}
            className={`
              w-full text-left rounded-xl border px-4 py-3.5 transition-all cursor-pointer group
              ${item.highlight
                ? 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15 hover:border-amber-500/60'
                : 'border-border hover:border-border/80 hover:bg-muted/30'
              }
              ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                size-8 rounded-lg flex items-center justify-center shrink-0
                ${item.highlight ? 'bg-amber-500/20' : 'bg-muted/60'}
              `}>
                <Icon className={`size-4 ${item.highlight ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${item.highlight ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'}`}>
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Notebook Section ──────────────────────────────────────────────────────────

function NotebookSection({
  notes, noteText, noteCategory, editingNoteId, editingText,
  onNoteTextChange, onNoteCategoryChange, onAddNote,
  onStartEdit, onSaveEdit, onCancelEdit, onEditTextChange, onDelete,
}) {
  const { t } = useTranslation('investigation');

  const CATEGORY_LABELS = {
    theory:      { label: t('catTheory'),      color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10' },
    observation: { label: t('catObservation'), color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
    suspicious:  { label: t('catSuspicious'),  color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
    to_verify:   { label: t('catToVerify'),   color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
    custom:      { label: t('catNote'),        color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-500/10' },
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
        {t('investigationNotebookTitle')}
      </div>

      {/* Add note */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
        <select
          value={noteCategory}
          onChange={e => onNoteCategoryChange(e.target.value)}
          className="w-full text-xs bg-transparent border-0 text-muted-foreground mb-2 focus:outline-none cursor-pointer"
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <textarea
          value={noteText}
          onChange={e => onNoteTextChange(e.target.value)}
          placeholder={t('recordNotePlaceholder')}
          className="w-full text-xs bg-transparent resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none leading-relaxed"
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onAddNote();
            }
          }}
        />
        <button
          type="button"
          onClick={onAddNote}
          disabled={!noteText.trim()}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold py-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="size-3" />
          {t('addNoteButton')}
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          {t('noNotesYet')}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map(note => {
            const cat = CATEGORY_LABELS[note.category] || CATEGORY_LABELS.custom;
            return (
              <div key={note.id} className="rounded-xl border border-border/60 bg-card/60 p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cat.color}`}>
                    {cat.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDelete?.(note.id)}
                      className="size-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                {editingNoteId === note.id ? (
                  <div>
                    <textarea
                      value={editingText}
                      onChange={e => onEditTextChange(e.target.value)}
                      className="w-full text-xs bg-muted/30 rounded-lg p-2 resize-none text-foreground focus:outline-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => onSaveEdit(note.id)} className="text-xs text-emerald-600 font-semibold cursor-pointer hover:underline">{t('save')}</button>
                      <button onClick={onCancelEdit} className="text-xs text-muted-foreground cursor-pointer hover:underline">{t('cancel')}</button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-xs text-foreground/90 leading-relaxed cursor-pointer hover:text-foreground"
                    onClick={() => onStartEdit(note)}
                  >
                    {note.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Evidence Locker Section ───────────────────────────────────────────────────

function EvidenceLockerSection({ pinnedEvidence, onUnpin }) {
  const { t } = useTranslation('investigation');

  return (
    <div className="p-4">
      <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-3">
        {t('evidenceLockerTitleUpper')}
      </div>
      {pinnedEvidence.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
          <Archive className="size-5 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">{t('noEvidence')}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {t('pinEvidenceHint')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pinnedEvidence.map(ev => (
            <div key={ev.id} className="rounded-xl border border-border/60 bg-card/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    {ev.sourceTitle}
                  </p>
                  <p className="text-xs text-foreground mt-1">{ev.excerpt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUnpin?.(ev.id)}
                  className="size-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-rose-500 shrink-0 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Report Section ────────────────────────────────────────────────────────────

function ReportSection({
  reportDraft,
  reportDefinition,
  caseState,
  isVerifying,
  findings = [],
  onUpdateField,
  onSend,
  onOpenReport,
  activeFieldId,
  onSelectField,
}) {
  const { t } = useTranslation('investigation');

  // If no draft yet, offer to open report
  if (!reportDraft || reportDraft.status === undefined) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
          {t('investigationReport')}
        </div>
        {reportDefinition && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
            <Send className="size-5 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">{t('readyToReport')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('initReportDesc')}
            </p>
            <button
              type="button"
              onClick={() => onOpenReport?.(reportDefinition)}
              className="mt-3 w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold py-2 transition-colors cursor-pointer"
            >
              {t('openReportNow')}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show verifying state
  if (isVerifying || caseState?.status === 'VERIFYING') {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-48">
        <Loader2 className="size-8 text-amber-500 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{t('reportReceived')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('verifyingFindings')}</p>
        </div>
        <div className="w-full flex flex-col gap-1.5 mt-2">
          {[t('stepReceive'), t('stepCrossCheck'), t('stepCheckTestimony'), t('stepApprove')].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <Loader2 className="size-3 text-amber-500 animate-spin shrink-0" style={{ animationDelay: `${i * 200}ms` }} />
              <span className="text-[10px] text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const fields = reportDefinition?.fields || [];
  const allRequiredFilled = fields
    .filter(f => f.required && f.editable)
    .every(f => {
      const val = reportDraft.fields?.[f.field_id]?.value;
      return val && String(val).trim().length > 0;
    });

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="border border-border/60 rounded-xl p-3 bg-muted/20">
        <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-0.5">
          {reportDefinition?.caseLabel}
        </div>
        <div className="text-sm font-bold text-foreground">{reportDefinition?.title}</div>
        {reportDefinition?.instructions && (
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
            {reportDefinition.instructions}
          </p>
        )}
      </div>

      {/* Helper banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-700 dark:text-amber-300">
        <span className="text-xs">⚡</span>
        <span>
          <strong>{t('quickAction')}</strong> {t('quickActionDesc')}
        </span>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3">
        {fields.sort((a, b) => a.order - b.order).map(field => {
          const fieldState = reportDraft.fields?.[field.field_id];
          const isLocked = fieldState?.isLocked || !field.editable;
          const verStatus = fieldState?.verificationStatus;
          const isCurrentActive = activeFieldId === field.field_id;

          // Find a matching finding for this field (if prefill_from_finding is set)
          const matchingFinding = field.prefill_from_finding
            ? findings.find(f => {
                const claim = f.claim?.toLowerCase() || '';
                const key = field.prefill_from_finding.toLowerCase();
                return claim.includes(key) || f.investigationContext?.toLowerCase().includes(key);
              })
            : null;

          return (
            <div key={field.field_id}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !isLocked && (
                    <span className="text-rose-500 font-bold">*</span>
                  )}
                  {isLocked && (
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide">
                      🔒
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-1">
                  {verStatus === 'correct' && <CheckCircle2 className="size-3 text-emerald-500" />}
                  {verStatus === 'incorrect' && <XCircle className="size-3 text-rose-500" />}
                  {verStatus === 'prefilled' && <CheckCheck className="size-3 text-muted-foreground/60" />}
                </div>
              </div>

              {isLocked ? (
                <div className="text-xs text-foreground/80 bg-muted/30 border border-border/50 rounded-lg px-3 py-2 font-mono">
                  {fieldState?.value || field.prefilled_value || '—'}
                </div>
              ) : (
                <div
                  className={`transition-all rounded-lg ${
                    isCurrentActive ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/5' : ''
                  }`}
                >
                  <input
                    type="text"
                    value={fieldState?.value || ''}
                    onChange={e => onUpdateField?.(field.field_id, e.target.value)}
                    onFocus={() => onSelectField?.(field.field_id)}
                    onClick={() => onSelectField?.(field.field_id)}
                    placeholder={field.placeholder || t('inputPlaceholder')}
                    disabled={isLocked || isVerifying}
                    className={`
                      w-full text-xs rounded-lg border px-3 py-2 bg-background text-foreground
                      placeholder:text-muted-foreground/40
                      focus:outline-none transition-all
                      ${isCurrentActive ? 'border-amber-500 font-medium' : ''}
                      ${verStatus === 'correct' ? 'border-emerald-500/60 bg-emerald-500/5' : ''}
                      ${verStatus === 'incorrect' ? 'border-rose-500/60 bg-rose-500/5' : ''}
                      ${!verStatus && !isCurrentActive ? 'border-border/60 hover:border-border' : ''}
                    `}
                  />
                  {/* Use finding suggestion — requires explicit investigator action */}
                  {matchingFinding && !fieldState?.value && !isVerifying && (
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                      <span className="text-[10px] text-muted-foreground">{t('findingLabel')}</span>
                      <span className="text-[10px] font-mono text-emerald-400 flex-1 truncate">
                        {String(matchingFinding.value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateField?.(field.field_id, String(matchingFinding.value))}
                        className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 cursor-pointer shrink-0"
                      >
                        {t('useFinding')}
                      </button>
                    </div>
                  )}
                  {isCurrentActive && !isVerifying && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 mt-1 px-1 py-0.5 animate-fadeIn">
                      <span className="size-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <span>{t('selectingFieldHint')}</span>
                    </div>
                  )}
                </div>
              )}
              {verStatus === 'incorrect' && fieldState?.errorMessage && (
                <p className="text-[10px] text-rose-500 mt-0.5">{fieldState.errorMessage}</p>
              )}
              {field.hint && !fieldState?.value && !isLocked && (
                <p className="text-[10px] text-muted-foreground/50 mt-0.5 italic">{field.hint}</p>
              )}
            </div>
          );
        })}
      </div>


      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* Send button */}
      {reportDraft.status !== 'RETURNED' && reportDraft.status !== 'ACCEPTED' && (
        <button
          type="button"
          onClick={onSend}
          disabled={!allRequiredFilled || isVerifying}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-amber-950 text-sm font-bold py-3 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Send className="size-4" />
          {t('sendToHQ')}
        </button>
      )}

      {reportDraft.status === 'RETURNED' && (
        <div className="text-center">
          <p className="text-xs text-rose-500 font-semibold mb-2">{t('reportReturnedAlert')}</p>
          <button
            type="button"
            onClick={() => onUpdateField?.('__reset', '')}
            className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            {t('editReportAgain')}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Verification Result Section — uses VerificationResultPanel ───────────────

function VerificationResultSection({
  result,
  reportDefinition,
  caseData,
  caseState,
  onResumeInvestigation,
  onContinueToNextPhase,
}) {
  if (!result) return null;
  return (
    <VerificationResultPanel
      verificationResult={result}
      reportDefinition={reportDefinition}
      caseData={caseData}
      caseState={caseState}
      onResumeInvestigation={onResumeInvestigation}
      onContinueToNextPhase={onContinueToNextPhase}
    />
  );
}
