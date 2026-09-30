import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Database,
  Search,
  ChevronDown,
  ChevronRight,
  Key,
  Copy,
  Check,
  Plus,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';

/**
 * DataExplorer
 *
 * Left panel of the Data Processing Workspace.
 * Explores tables, columns, data types, and sample rows for loaded data sources.
 */
export function DataExplorer({
  tables = [],
  activeTableName = null,
  onSelectTable = null,
  onInsertText = null,
  isLoading = false,
  className = '',
}) {
  const { t } = useTranslation('investigation');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState({});
  const [previewTable, setPreviewTable] = useState(null);
  const [copiedIdentifier, setCopiedIdentifier] = useState(null);

  // Filter tables and columns based on search
  const filteredTables = useMemo(() => {
    if (!tables || tables.length === 0) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return tables;

    return tables
      .filter((table) => !table.name?.startsWith('sqlite_'))
      .filter((table) => {
        const nameMatch = table.name?.toLowerCase().includes(term);
        const titleMatch = table.title?.toLowerCase().includes(term);
        const columnMatch = table.columns?.some((c) =>
          c.name?.toLowerCase().includes(term) || String(c.type)?.toLowerCase().includes(term)
        );
        return nameMatch || titleMatch || columnMatch;
      });
  }, [tables, searchTerm]);

  const toggleExpand = (tableName) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !(prev[tableName] ?? true),
    }));
  };

  const handleCopy = (identifier) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(identifier).catch(() => {});
    }
    setCopiedIdentifier(identifier);
    setTimeout(() => {
      setCopiedIdentifier((cur) => (cur === identifier ? null : cur));
    }, 1500);
  };

  const handleInsert = (text) => {
    if (onInsertText) {
      onInsertText(text);
    } else {
      handleCopy(text);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-card/60 rounded-2xl border border-border/80 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-3.5 border-b border-border/70 bg-card/90">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Database className="size-3.5" />
            </div>
            <span className="text-xs font-bold text-foreground tracking-wide">
              {t('dataProcessing.dataExplorer')}
            </span>
          </div>
          {tables.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-muted border border-border/70 text-muted-foreground">
              {tables.length} {t('dataProcessing.tables').toLowerCase()}
            </span>
          )}
        </div>

        {/* Search input */}
        <div className="relative mt-2.5">
          <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('dataProcessing.searchTables')}
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-background/80 border border-border/80 placeholder:text-muted-foreground/60 text-foreground focus:outline-hidden focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tables list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">
            <Database className="size-6 text-amber-500/40 mx-auto mb-2 animate-spin" />
            <p>{t('dataProcessing.running')}</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            <Database className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="font-semibold text-foreground/80">{t('dataProcessing.noTablesFound')}</p>
          </div>
        ) : (
          filteredTables.map((table) => {
            const isExpanded = expandedTables[table.name] ?? true;
            const isSelected = activeTableName === table.name;
            const rowCount = table.rowCount ?? (Array.isArray(table.rows) ? table.rows.length : null);

            return (
              <div
                key={table.name}
                className={`rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-500/40 bg-amber-500/5 shadow-xs'
                    : 'border-border/60 bg-card/70 hover:border-border'
                }`}
              >
                {/* Table Header Row */}
                <div className="flex items-center justify-between p-2.5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(table.name)}
                    className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer group"
                  >
                    <span className="text-muted-foreground/70 group-hover:text-foreground transition-colors shrink-0">
                      {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground truncate group-hover:text-amber-500 transition-colors">
                      {table.name}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {rowCount !== null && (
                      <span className="text-[10px] font-mono text-muted-foreground/80 bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                        {t('dataProcessing.rowCount', { count: rowCount })}
                      </span>
                    )}

                    {/* Quick insert / copy table name */}
                    <button
                      type="button"
                      onClick={() => handleInsert(table.name)}
                      className="size-6 rounded-md hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
                      title={t('dataProcessing.insertIdentifier')}
                    >
                      {copiedIdentifier === table.name ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Plus className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Table Description if any */}
                {table.title && table.title !== table.name && (
                  <p className="px-3 pb-1 text-[11px] text-muted-foreground line-clamp-1 italic">
                    {table.title}
                  </p>
                )}

                {/* Expanded Columns List */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-2.5 py-2 bg-background/30 space-y-1">
                    {table.columns && table.columns.length > 0 ? (
                      table.columns.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center justify-between gap-1.5 py-1 px-1.5 rounded-md hover:bg-muted/50 group text-[11px] font-mono transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => handleInsert(col.name)}
                            className="flex items-center gap-1.5 text-left text-muted-foreground group-hover:text-foreground truncate cursor-pointer flex-1"
                            title={`${t('dataProcessing.insertIdentifier')}: ${col.name}`}
                          >
                            {col.isPrimaryKey ? (
                              <Key className="size-2.5 text-amber-500 shrink-0" />
                            ) : (
                              <span className="size-1 rounded-full bg-muted-foreground/50 shrink-0" />
                            )}
                            <span className="truncate">{col.name}</span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-1 py-0.2 rounded bg-muted/70 text-muted-foreground/90 border border-border/40">
                              {col.type || 'TEXT'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleInsert(col.name)}
                              className="size-4 opacity-0 group-hover:opacity-100 flex items-center justify-center text-muted-foreground hover:text-amber-500 transition-all cursor-pointer"
                              title={t('dataProcessing.insertIdentifier')}
                            >
                              <Plus className="size-2.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic px-2 py-1">
                        {t('dataProcessing.columns')} (chưa xác định)
                      </p>
                    )}

                    {/* Sample Preview Button */}
                    {table.sampleRows && table.sampleRows.length > 0 && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewTable(previewTable === table.name ? null : table.name)}
                          className="w-full flex items-center justify-center gap-1 py-1 rounded-md bg-muted/40 hover:bg-muted text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Eye className="size-3 text-amber-500" />
                          <span>{t('dataProcessing.sampleRows')} ({table.sampleRows.length})</span>
                        </button>

                        {previewTable === table.name && (
                          <div className="mt-1.5 p-2 rounded-lg bg-background border border-border/80 overflow-x-auto text-[10px] font-mono">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b border-border/60 text-muted-foreground">
                                  {table.columns?.map((c) => (
                                    <th key={c.name} className="py-0.5 px-1.5 text-left font-bold truncate">
                                      {c.name}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.sampleRows.slice(0, 3).map((row, rIdx) => (
                                  <tr key={rIdx} className="border-b border-border/30 hover:bg-muted/30">
                                    {(Array.isArray(row)
                                      ? row
                                      : table.columns?.map((c) => row[c.name]) || []
                                    ).map((val, cIdx) => (
                                      <td key={cIdx} className="py-0.5 px-1.5 text-foreground truncate max-w-[120px]">
                                        {String(val ?? 'NULL')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
