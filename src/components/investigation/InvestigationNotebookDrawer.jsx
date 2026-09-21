import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bookmark,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  ExternalLink,
  Sparkles,
  FileSpreadsheet,
  Database,
  Search,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { investigationNotebookService } from '../../services/index.js';

export function InvestigationNotebookDrawer({
  isOpen = true,
  onClose,
  onApplyCode = null,
  embedded = false,
  activeTool = null,
}) {
  const { t } = useTranslation('investigation');
  const [notes, setNotes] = useState(() => investigationNotebookService.getNotes());
  const [newText, setNewText] = useState('');
  const [selectedTool, setSelectedTool] = useState(activeTool || 'all');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    return investigationNotebookService.subscribe((updatedNotes) => {
      setNotes(updatedNotes);
    });
  }, []);

  useEffect(() => {
    if (activeTool && selectedTool !== 'all') {
      setSelectedTool(activeTool);
    }
  }, [activeTool]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    investigationNotebookService.addCustomNote({
      text: newText,
      tool: selectedTool === 'sql' ? 'sql' : 'excel',
    });
    setNewText('');
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const handleSaveEdit = (noteId) => {
    if (!editingNoteText.trim()) return;
    investigationNotebookService.updateCustomNote(noteId, editingNoteText);
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleCopy = (id, textToCopy) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredNotes = notes.filter((note) => {
    if (selectedTool !== 'all' && note.tool !== selectedTool) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = note.title ? note.title.toLowerCase().includes(q) : false;
    const excerptMatch = note.excerpt ? note.excerpt.toLowerCase().includes(q) : false;
    const textMatch = note.text ? note.text.toLowerCase().includes(q) : false;
    return titleMatch || excerptMatch || textMatch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.type !== 'custom');
  const customNotes = filteredNotes.filter((n) => n.type === 'custom');

  const content = (
    <div className="flex flex-col h-full bg-card text-foreground">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-card/80 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Bookmark className="size-4 fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>{t('caseNotebook')}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {notes.length}
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground">{t('drawerNotebookSubtitle')}</p>
          </div>
        </div>

        {!embedded && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={t('closeNotebook')}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 border-b border-border/70 space-y-2 bg-muted/20">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchNotebook')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-8 pr-7 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Tool Filter Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedTool('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              selectedTool === 'all'
                ? 'bg-amber-500 text-amber-950 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {t('all')} ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool('excel')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              selectedTool === 'excel'
                ? 'bg-amber-500 text-amber-950 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <FileSpreadsheet className="size-3" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTool('sql')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              selectedTool === 'sql'
                ? 'bg-amber-500 text-amber-950 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Database className="size-3" />
            <span>SQL</span>
          </button>
        </div>
      </div>

      {/* Add Custom Note Form */}
      <div className="p-3 border-b border-border bg-card">
        <form onSubmit={handleAddNote} className="space-y-2">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={t('addNotePlaceholder')}
            rows={2}
            className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {t('autoSaveDesc')}
            </span>
            <button
              type="submit"
              disabled={!newText.trim()}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-amber-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>{t('note')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Custom Notes Section */}
        {customNotes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b border-border/50 pb-1">
              <span>{t('yourNotes')}</span>
              <span className="font-mono text-[9px]">{customNotes.length}</span>
            </h4>
            <div className="space-y-2">
              {customNotes.map((note) => (
                <div
                  key={note.id}
                  className="group bg-muted/40 hover:bg-muted/70 rounded-xl p-2.5 border border-border/70 hover:border-amber-500/30 transition-all"
                >
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        rows={2}
                        className="w-full bg-background border border-amber-500/60 rounded-md p-2 text-xs text-foreground focus:outline-none resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(note.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-amber-950 font-bold text-xs hover:bg-amber-600 transition-colors cursor-pointer"
                        >
                          <Check className="size-3" />
                          <span>{t('save')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium text-xs hover:text-foreground transition-colors cursor-pointer"
                        >
                          <X className="size-3" />
                          <span>{t('cancel')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {note.tool || 'note'}
                          </span>
                          {note.updatedAt && (
                            <span className="text-[10px] text-muted-foreground italic">{t('edited')}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleCopy(note.id, note.text)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                            title={t('copyContent')}
                          >
                            {copiedId === note.id ? (
                              <Check className="size-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(note)}
                            className="p-1 text-muted-foreground hover:text-amber-500 rounded transition-colors"
                            title={t('editNote')}
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => investigationNotebookService.deleteCustomNote(note.id)}
                            className="p-1 text-muted-foreground hover:text-rose-500 rounded transition-colors"
                            title={t('deleteNote')}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                        {note.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned Formulas Section */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b border-border/50 pb-1">
              <span>{t('pinnedFormulas')}</span>
              <span className="font-mono text-[9px]">{pinnedNotes.length}</span>
            </h4>
            <div className="space-y-2.5">
              {pinnedNotes.map((note) => (
                <div
                  key={note.id}
                  className="relative group rounded-xl border border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-3 space-y-2 shadow-xs transition-all hover:shadow-sm"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/70 rounded-l-xl" />

                  <div className="flex items-start justify-between gap-2 pl-1">
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-xs leading-snug">
                      {note.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => investigationNotebookService.unpinNote(note.topicId)}
                      className="text-amber-700/60 hover:text-rose-500 p-0.5 rounded transition-colors opacity-70 group-hover:opacity-100"
                      title={t('unpin')}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {note.excerpt && (
                    <div className="ml-1 rounded-lg border border-amber-500/20 bg-white/70 dark:bg-black/50 p-2 font-mono text-[11px] text-amber-900 dark:text-amber-300 select-all overflow-x-auto whitespace-pre">
                      {note.excerpt}
                    </div>
                  )}

                  <div className="ml-1 pt-1 flex items-center justify-between gap-2 text-[10px]">
                    <span className="uppercase font-mono font-bold tracking-wider text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      {note.tool}
                    </span>

                    <div className="flex items-center gap-2">
                      {onApplyCode && note.excerpt && (
                        <button
                          type="button"
                          onClick={() => onApplyCode(note.excerpt, note.tool)}
                          className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
                          title={t('applyCodeTooltip')}
                        >
                          <Sparkles className="size-3" />
                          <span>{t('apply')}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopy(note.id, note.excerpt || note.title)}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title={t('copy')}
                      >
                        {copiedId === note.id ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        <span>{copiedId === note.id ? t('copied') : t('copyShort')}</span>
                      </button>

                      {note.topicId && (
                        <Link
                          to={`/knowledge/${note.topicId}`}
                          className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 hover:underline font-medium"
                        >
                          <span>{t('documentation')}</span>
                          <ExternalLink className="size-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-10 px-4 text-muted-foreground">
            <BookOpen className="size-8 mx-auto mb-2 opacity-30 text-amber-500" />
            <p className="text-xs font-semibold text-foreground">{t('notebookEmpty')}</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {t('notebookEmptyDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      {/* Drawer Panel */}
      <aside className="relative z-10 w-full max-w-md h-full shadow-2xl border-l border-border bg-card flex flex-col animate-in slide-in-from-right duration-200">
        {content}
      </aside>
    </div>
  );
}
