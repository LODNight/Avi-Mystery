import React, { useState, useEffect } from 'react';
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
  Loader2,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Lock,
  MousePointerClick,
  Stamp,
  Sparkles,
  Crosshair,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VerificationResultPanel } from './VerificationResultPanel.jsx';

/**
 * HQCommunicationPanel — Centered Forensic Command & Verdict Dossier Dialog
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

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showVerificationResult = ['CASE_PROGRESS', 'REPORT_RETURNED'].includes(caseState?.status);
  const notes = investigationState?.notes || [];
  const pinnedEvidence = investigationState?.pinnedEvidence || [];

  const dialogContent = (
    <div
      className={`w-full bg-card border border-border rounded-md shadow-2xl flex flex-col overflow-hidden ${
        embedded ? 'h-full' : 'max-w-3xl max-h-[86vh] animate-in zoom-in-95 duration-150'
      }`}
    >
      {/* ── Top Dialog Header: HQ Radio Dispatch Terminal ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/40">
        <div className="flex items-center gap-2.5">
          {activeSection !== 'menu' && (
            <button
              type="button"
              onClick={() => onSetSection('menu')}
              className="size-7 rounded-xs border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={t('backToMenu')}
            >
              <ArrowLeft className="size-3.5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-primary animate-pulse" />
              <span className="font-mono text-xs font-black tracking-widest uppercase text-foreground">
                HQ Terminal
              </span>
              <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
                {caseData?.caseNumber || 'CASE-001'} // DIALOG
              </span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              ĐIỆN ĐÀM SỞ CHỈ HUY &amp; BIÊN BẢN KẾT LUẬN CHÍNH THỨC
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider"
          aria-label="Close HQ Communication"
          title={t('closePanel')}
        >
          <span>Đóng (ESC)</span>
          <X className="size-3.5" />
        </button>
      </div>

      {/* ── Navigation Quick Tabs (3 File Cabinet Tabs) ── */}
      <div className="grid grid-cols-3 border-b border-border bg-background px-3 py-1.5 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onSetSection('report')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xs font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeSection === 'report' || activeSection === 'verification_result'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Send className="size-3.5" />
          <span className="truncate">{t('reportTab')}</span>
          {showVerificationResult && <span className="size-1.5 rounded-full bg-amber-300" />}
        </button>
        <button
          type="button"
          onClick={() => onSetSection('notebook')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xs font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeSection === 'notebook'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <BookOpen className="size-3.5" />
          <span className="truncate">{t('notebookTab', { count: notes.length })}</span>
        </button>
        <button
          type="button"
          onClick={() => onSetSection('evidence_locker')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xs font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeSection === 'evidence_locker'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Archive className="size-3.5" />
          <span className="truncate">{t('evidenceTab', { count: pinnedEvidence.length })}</span>
        </button>
      </div>

      {/* ── Section Content Viewport ── */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
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
            notes={notes}
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
            onStartEdit={(note) => {
              setEditingNoteId(note.id);
              setEditingText(note.text);
            }}
            onSaveEdit={(noteId) => {
              onUpdateNote?.(noteId, editingText);
              setEditingNoteId(null);
            }}
            onCancelEdit={() => setEditingNoteId(null)}
            onEditTextChange={setEditingText}
            onDelete={onDeleteNote}
          />
        )}
        {activeSection === 'evidence_locker' && (
          <EvidenceLockerSection
            pinnedEvidence={pinnedEvidence}
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
            notes={notes}
            pinnedEvidence={pinnedEvidence}
            onUpdateField={onUpdateReportField}
            onSend={onSendReport}
            onOpenReport={onOpenReport}
            activeFieldId={activeFieldId}
            onSelectField={onSelectField}
            onPickFromTable={(fieldId) => {
              onSelectField?.(fieldId);
              onClose?.();
            }}
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
    return dialogContent;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-label="HQ Communication"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-3xl flex items-center justify-center">
        {dialogContent}
      </div>
    </div>
  );
}

// ── HQ Menu ──────────────────────────────────────────────────────────────────

function HQMenu({ showVerificationResult, onSetSection }) {
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
      description: showVerificationResult ? t('hqResponseDesc') : t('sendReportDesc'),
      highlight: true,
    },
  ];

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => !item.disabled && onSetSection(item.id)}
            disabled={item.disabled}
            className={`
              w-full text-left rounded-sm border p-4 transition-all cursor-pointer group
              ${
                item.highlight
                  ? 'border-primary/40 bg-primary/10 hover:bg-primary/15 hover:border-primary/60'
                  : 'border-border hover:border-border/80 hover:bg-muted/30'
              }
              ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                  size-9 rounded-xs flex items-center justify-center shrink-0
                  ${item.highlight ? 'bg-primary/20' : 'bg-muted/60'}
                `}
              >
                <Icon className={`size-4 ${item.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${item.highlight ? 'text-primary' : 'text-foreground'}`}>
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-muted text-muted-foreground uppercase tracking-wide">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
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
  notes,
  noteText,
  noteCategory,
  editingNoteId,
  editingText,
  onNoteTextChange,
  onNoteCategoryChange,
  onAddNote,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
  onDelete,
}) {
  const { t } = useTranslation('investigation');

  const CATEGORY_LABELS = {
    theory: { label: t('catTheory'), color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30' },
    observation: { label: t('catObservation'), color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30' },
    suspicious: { label: t('catSuspicious'), color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30' },
    to_verify: { label: t('catToVerify'), color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    custom: { label: t('catNote'), color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="font-mono text-[10px] font-black tracking-widest uppercase text-primary">
        {t('investigationNotebookTitle')} // FIELD NOTES
      </div>

      {/* Add note */}
      <div className="rounded-sm border border-border bg-muted/20 p-3">
        <select
          value={noteCategory}
          onChange={(e) => onNoteCategoryChange(e.target.value)}
          className="w-full font-mono text-[11px] font-bold uppercase bg-background border border-border rounded-xs px-2 py-1.5 text-foreground mb-2 focus:outline-none cursor-pointer"
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <textarea
          value={noteText}
          onChange={(e) => onNoteTextChange(e.target.value)}
          placeholder={t('recordNotePlaceholder')}
          className="w-full text-xs bg-background border border-border rounded-xs p-2.5 resize-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary leading-relaxed"
          rows={3}
          onKeyDown={(e) => {
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
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xs bg-primary hover:opacity-90 text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider py-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="size-3.5" />
          {t('addNoteButton')}
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">{t('noNotesYet')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {notes.map((note) => {
            const cat = CATEGORY_LABELS[note.category] || CATEGORY_LABELS.custom;
            return (
              <div key={note.id} className="dossier-card rounded-sm border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs border ${cat.color}`}>
                    {cat.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete?.(note.id)}
                    className="size-5 rounded-xs flex items-center justify-center text-muted-foreground/60 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
                {editingNoteId === note.id ? (
                  <div>
                    <textarea
                      value={editingText}
                      onChange={(e) => onEditTextChange(e.target.value)}
                      className="w-full text-xs bg-muted/30 rounded-xs p-2 resize-none text-foreground focus:outline-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => onSaveEdit(note.id)}
                        className="font-mono text-xs text-emerald-600 font-bold cursor-pointer hover:underline"
                      >
                        {t('save')}
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="font-mono text-xs text-muted-foreground cursor-pointer hover:underline"
                      >
                        {t('cancel')}
                      </button>
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
      <div className="font-mono text-[10px] font-black tracking-widest uppercase text-primary mb-3">
        {t('evidenceLockerTitleUpper', 'TỦ LƯU TRỮ VẬT CHỨNG')}
      </div>
      {pinnedEvidence.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border p-8 text-center">
          <Archive className="size-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs font-bold text-foreground">{t('noEvidence')}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{t('pinEvidenceHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {pinnedEvidence.map((ev) => (
            <div key={ev.id} className="dossier-card rounded-sm border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] font-bold text-primary uppercase tracking-wide">
                    {ev.sourceTitle}
                  </p>
                  <p className="text-xs text-foreground mt-1">{ev.excerpt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUnpin?.(ev.id)}
                  className="size-5 rounded-xs flex items-center justify-center text-muted-foreground/60 hover:text-rose-500 shrink-0 cursor-pointer"
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

// ── Report Section (Official Case Verdict Dossier Dialog Body) ────────────────

function ReportSection({
  reportDraft,
  reportDefinition,
  caseState,
  isVerifying,
  findings = [],
  notes = [],
  onUpdateField,
  onSend,
  onOpenReport,
  activeFieldId,
  onSelectField,
  onPickFromTable,
}) {
  const { t } = useTranslation('investigation');

  if (!reportDraft || reportDraft.status === undefined) {
    return (
      <div className="p-5 flex flex-col gap-4">
        <div className="font-mono text-[10px] font-black tracking-widest uppercase text-primary">
          {t('investigationReport')}
        </div>
        {reportDefinition && (
          <div className="dossier-card rounded-sm border border-border bg-muted/20 p-5 text-center">
            <Send className="size-6 text-primary mx-auto mb-2" />
            <p className="font-display text-sm font-bold text-foreground">{t('readyToReport')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('initReportDesc')}</p>
            <button
              type="button"
              onClick={() => onOpenReport?.(reportDefinition)}
              className="mt-3 w-full rounded-sm bg-primary hover:opacity-90 text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider py-2.5 transition-colors cursor-pointer"
            >
              {t('openReportNow')}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isVerifying || caseState?.status === 'VERIFYING') {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-60">
        <Loader2 className="size-8 text-primary animate-spin" />
        <div className="text-center">
          <p className="font-display text-base font-bold text-foreground">{t('reportReceived')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('verifyingFindings')}</p>
        </div>
        <div className="w-full max-w-md flex flex-col gap-1.5 mt-2 rounded-sm border border-dashed border-border p-3 bg-muted/20">
          {[t('stepReceive'), t('stepCrossCheck'), t('stepCheckTestimony'), t('stepApprove')].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <Loader2 className="size-3 text-primary animate-spin shrink-0" style={{ animationDelay: `${i * 200}ms` }} />
              <span className="font-mono text-[10px] text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const fields = reportDefinition?.fields || [];
  const requiredEditableFields = fields.filter((f) => f.required && f.editable);
  const filledCount = requiredEditableFields.filter((f) => {
    const val = reportDraft.fields?.[f.field_id]?.value;
    return val && String(val).trim().length > 0;
  }).length;
  const allRequiredFilled = filledCount === requiredEditableFields.length;

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4">
      {/* ── LEFT COLUMN: OFFICIAL VERDICT FORM SLOTS ── */}
      <div className="flex flex-col gap-3.5">
        {/* Official Verdict Dossier Header */}
        <div className="dossier-card rounded-sm border border-border p-3 bg-muted/20">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-[9px] font-black tracking-widest uppercase text-primary">
              {reportDefinition?.caseLabel || 'OFFICIAL VERDICT FORM'}
            </span>
            <span className="font-mono text-[10px] font-bold text-emerald-500 tabular-nums">
              {filledCount}/{requiredEditableFields.length} MỤC HOÀN TẤT
            </span>
          </div>
          <div className="font-display text-sm font-bold text-foreground">{reportDefinition?.title}</div>
          {reportDefinition?.instructions && (
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {reportDefinition.instructions}
            </p>
          )}
        </div>

        {/* Verdict Evidence Slots */}
        <div className="flex flex-col gap-3">
          {fields
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((field, idx) => {
              const fieldState = reportDraft.fields?.[field.field_id];
              const isLocked = fieldState?.isLocked || !field.editable;
              const verStatus = fieldState?.verificationStatus;
              const isCurrentActive = activeFieldId === field.field_id;
              const slotCode = `MỤC 0${idx + 1}`;

              const matchingFinding = field.prefill_from_finding
                ? findings.find((f) => {
                    const claim = f.claim?.toLowerCase() || '';
                    const key = field.prefill_from_finding.toLowerCase();
                    return claim.includes(key) || f.investigationContext?.toLowerCase().includes(key);
                  })
                : null;

              return (
                <div
                  key={field.field_id}
                  className={`rounded-sm border p-3 transition-all ${
                    isCurrentActive
                      ? 'border-primary bg-primary/5 shadow-2xs'
                      : 'border-border/80 bg-background/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-xs bg-muted text-muted-foreground">
                        {slotCode}
                      </span>
                      <span>{field.label}</span>
                      {field.required && !isLocked && <span className="text-rose-500 font-bold">*</span>}
                      {isLocked && <Lock className="size-3 text-muted-foreground/60" />}
                    </label>
                    <div className="flex items-center gap-1.5">
                      {!isLocked && onPickFromTable && (
                        <button
                          type="button"
                          onClick={() => onPickFromTable(field.field_id)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                          title="Đóng dialog và nhấp trực tiếp vào ô trên bảng chứng cứ để điền"
                        >
                          <MousePointerClick className="size-2.5" />
                          <span>Chấm từ bảng</span>
                        </button>
                      )}
                      {verStatus === 'correct' && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                      {verStatus === 'incorrect' && <XCircle className="size-3.5 text-rose-500" />}
                      {verStatus === 'prefilled' && <CheckCheck className="size-3.5 text-muted-foreground/60" />}
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="text-xs text-foreground/85 bg-muted/40 border border-border rounded-xs px-2.5 py-1.5 font-mono">
                      {fieldState?.value || field.prefilled_value || '-'}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={fieldState?.value || ''}
                        onChange={(e) => onUpdateField?.(field.field_id, e.target.value)}
                        onFocus={() => onSelectField?.(field.field_id)}
                        onClick={() => onSelectField?.(field.field_id)}
                        placeholder={field.placeholder || t('inputPlaceholder')}
                        disabled={isLocked || isVerifying}
                        className={`
                          w-full text-xs rounded-xs border px-2.5 py-2 bg-background text-foreground
                          placeholder:text-muted-foreground/50
                          focus:outline-none transition-all
                          ${isCurrentActive ? 'border-primary font-semibold' : ''}
                          ${verStatus === 'correct' ? 'border-emerald-500/60 bg-emerald-500/5' : ''}
                          ${verStatus === 'incorrect' ? 'border-rose-500/60 bg-rose-500/5' : ''}
                          ${!verStatus && !isCurrentActive ? 'border-border hover:border-primary/40' : ''}
                        `}
                      />
                      {matchingFinding && !fieldState?.value && !isVerifying && (
                        <div className="flex items-center gap-2 mt-1.5 px-1">
                          <span className="font-mono text-[10px] text-muted-foreground">{t('findingLabel')}</span>
                          <span className="text-[10px] font-mono text-emerald-500 flex-1 truncate">
                            {String(matchingFinding.value)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateField?.(field.field_id, String(matchingFinding.value))}
                            className="font-mono text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                          >
                            {t('useFinding')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {verStatus === 'incorrect' && fieldState?.errorMessage && (
                    <p className="font-mono text-[10px] text-rose-500 mt-1">{fieldState.errorMessage}</p>
                  )}
                  {field.hint && !fieldState?.value && !isLocked && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1 italic">{field.hint}</p>
                  )}
                </div>
              );
            })}
        </div>

        {/* Submit Verdict Button */}
        <div className="pt-2 border-t border-border">
          {reportDraft.status !== 'RETURNED' && reportDraft.status !== 'ACCEPTED' && (
            <button
              type="button"
              onClick={onSend}
              disabled={!allRequiredFilled || isVerifying}
              className="w-full flex items-center justify-center gap-2 rounded-sm bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider py-3 transition-colors cursor-pointer shadow-sm"
            >
              <Stamp className="size-4" />
              {t('sendToHQ')}
            </button>
          )}

          {reportDraft.status === 'RETURNED' && (
            <div className="text-center">
              <p className="font-mono text-xs text-rose-500 font-bold mb-2">{t('reportReturnedAlert')}</p>
              <button
                type="button"
                onClick={() => onUpdateField?.('__reset', '')}
                className="font-mono text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                {t('editReportAgain')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: QUICK FORENSIC REFERENCE (FINDINGS & NOTES) ── */}
      <div className="flex flex-col gap-3 rounded-sm border border-border bg-muted/15 p-3.5 h-fit">
        <div className="flex items-center gap-1.5 border-b border-border pb-2">
          <Sparkles className="size-3.5 text-emerald-500" />
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-foreground">
            Tư liệu tham chiếu nhanh
          </span>
        </div>

        <div className="flex items-start gap-2 px-2.5 py-2 bg-primary/10 border border-primary/30 rounded-xs text-[11px] text-primary">
          <MousePointerClick className="size-3.5 shrink-0 mt-0.5" />
          <span>
            Bạn có thể bấm <strong>Chấm từ bảng</strong> ở từng mục để nhấp chọn trực tiếp ô dữ liệu ngoài bàn khám nghiệm, hoặc chọn từ các manh mối đã ghi nhận bên dưới.
          </span>
        </div>

        {/* Captured Findings List */}
        <div>
          <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            MANH MỐI ĐÃ GHI NHẬN ({findings.length})
          </div>
          {findings.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic py-2">
              Chưa có manh mối nào được trích xuất từ Bàn Phân Tích / Xử Lý Dữ Liệu.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto scrollbar-thin">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xs border border-emerald-500/30 bg-emerald-500/5 p-2 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] text-foreground truncate">{f.claim}</p>
                    <p className="font-mono text-[10px] font-bold text-emerald-500 truncate">
                      Giá trị: {String(f.value)}
                    </p>
                  </div>
                  {activeFieldId && (
                    <button
                      type="button"
                      onClick={() => onUpdateField?.(activeFieldId, String(f.value))}
                      className="px-2 py-1 rounded-xs bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/25 font-mono text-[9px] font-bold uppercase shrink-0 cursor-pointer"
                    >
                      Điền ngay
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        {notes.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              GHI CHÚ SỔ TAY ({notes.length})
            </div>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
              {notes.slice(0, 4).map((n) => (
                <div key={n.id} className="rounded-xs border border-border bg-background/70 p-2 text-[11px] text-foreground/90">
                  {n.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Verification Result Section ───────────────────────────────────────────────

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
