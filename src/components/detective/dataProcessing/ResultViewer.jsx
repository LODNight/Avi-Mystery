import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Database,
  Clock,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  FileSpreadsheet,
  CheckCircle2,
  BookmarkPlus,
  Loader2,
} from 'lucide-react';
import { mapSqlErrorMessage } from '../../sql/ResultViewer.jsx';

/**
 * ResultViewer
 *
 * Bottom panel of the Data Processing Workspace.
 * Displays raw execution results as evidence material for the investigator.
 *
 * NOTE: The result is evidence, NOT an answer.
 * We do not grade or display Correct/Incorrect.
 */
export function ResultViewer({
  result = null,
  isExecuting = false,
  selectedRowIndex = null,
  onSelectRow = null,
  onUseAsFinding = null,
  onReferenceEvidence = null,
  className = '',
}) {
  const { t } = useTranslation('investigation');
  const [copiedCell, setCopiedCell] = useState(null);

  const handleCopyCell = (text, cellKey) => {
    if (text === null || text === undefined) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(text)).catch(() => {});
    }
    setCopiedCell(cellKey);
    setTimeout(() => {
      setCopiedCell((cur) => (cur === cellKey ? null : cur));
    }, 1500);
  };

  const handleCopyRow = (row, columns, rowIndex) => {
    if (!row) return;
    const formatted = columns.map((c, i) => `${c}: ${row[i] ?? 'NULL'}`).join(', ');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted).catch(() => {});
    }
    setCopiedCell(`row-${rowIndex}`);
    setTimeout(() => {
      setCopiedCell((cur) => (cur === `row-${rowIndex}` ? null : cur));
    }, 1500);
  };

  // 1. Loading state
  if (isExecuting) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 rounded-2xl border border-border/80 bg-card/60 text-center min-h-[220px] ${className}`}
        aria-busy="true"
        aria-label="Executing query"
      >
        <Loader2 className="size-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-bold text-foreground">{t('dataProcessing.running')}</p>
        <p className="text-xs text-muted-foreground mt-1">Đang xử lý truy vấn dữ liệu...</p>
      </div>
    );
  }

  // 2. Idle state (no query executed yet)
  if (!result) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/80 bg-card/40 text-center min-h-[200px] ${className}`}
      >
        <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
          <Database className="size-5" />
        </div>
        <p className="text-xs font-bold text-foreground">{t('dataProcessing.resultViewer')}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {t('dataProcessing.noResultsYet')}
        </p>
      </div>
    );
  }

  // 3. Error state
  if (result.errorCode || result.error) {
    const errorCode = result.errorCode || result.error?.code || 'SQL_ERROR';
    const message = result.message || result.error?.message || 'Lỗi phát sinh khi thực thi truy vấn.';
    const friendlyMessage = mapSqlErrorMessage(errorCode, message);

    return (
      <div
        className={`rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive ${className}`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs">Lỗi thực thi truy vấn</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-bold uppercase">
                {errorCode}
              </span>
            </div>
            <p className="text-xs text-foreground/90 mt-1.5 leading-relaxed font-medium">
              {friendlyMessage}
            </p>
            {message && message !== friendlyMessage && (
              <p className="mt-2 text-[11px] font-mono text-muted-foreground bg-background/50 p-2 rounded border border-border/40 overflow-x-auto">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Success result state
  const {
    columns = [],
    rows = [],
    rowCount = rows.length,
    executionTimeMs = result.executionMs || 0,
    truncated = false,
  } = result;

  const isRowArray = rows.length > 0 && Array.isArray(rows[0]);

  return (
    <div className={`flex flex-col h-full bg-card/60 rounded-2xl border border-border/80 overflow-hidden ${className}`}>
      {/* Execution Summary Bar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 border-b border-border/70 bg-card/90 flex-wrap text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>{t('dataProcessing.resultsReturned', { count: rowCount, ms: executionTimeMs })}</span>
          </span>
          <span className="h-3 w-px bg-border/80" />
          <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
            <Clock className="size-3" /> {executionTimeMs} ms
          </span>
        </div>

        <div className="flex items-center gap-2">
          {truncated && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <AlertTriangle className="size-3" />
              <span>Đã giới hạn 500 dòng</span>
            </span>
          )}

          {selectedRowIndex !== null && rows[selectedRowIndex] && (
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {t('dataProcessing.selectedRow', { index: selectedRowIndex + 1 })}
            </span>
          )}
        </div>
      </div>

      {/* Rows Table */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[140px]">
          <FileSpreadsheet className="size-7 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-semibold text-foreground">Không có dòng dữ liệu nào khớp với truy vấn</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Hãy kiểm tra lại điều kiện WHERE, JOIN hoặc cú pháp câu lệnh.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto max-h-[360px] text-xs font-mono">
          <table className="w-full border-collapse text-left">
            {/* Header */}
            <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-xs border-b border-border text-[11px] font-bold text-foreground">
              <tr>
                <th className="py-2 px-2.5 w-10 text-center text-muted-foreground font-normal border-r border-border/50">
                  #
                </th>
                {columns.map((col, idx) => (
                  <th key={idx} className="py-2 px-3 text-foreground tracking-wide whitespace-nowrap border-r border-border/40 last:border-r-0">
                    {col}
                  </th>
                ))}
                <th className="py-2 px-2 w-16 text-center text-muted-foreground font-normal">
                  Thao tác
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-border/40">
              {rows.map((row, rIdx) => {
                const isSelected = selectedRowIndex === rIdx;
                const cellValues = isRowArray
                  ? row
                  : columns.map((c) => row[c]);

                return (
                  <tr
                    key={rIdx}
                    onClick={() => onSelectRow && onSelectRow(rIdx, row)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 hover:bg-amber-500/20 text-foreground font-semibold'
                        : rIdx % 2 === 0
                        ? 'bg-card/30 hover:bg-muted/40'
                        : 'bg-card/70 hover:bg-muted/40'
                    }`}
                  >
                    {/* Row Index */}
                    <td className="py-1.5 px-2 text-center text-[10px] text-muted-foreground border-r border-border/40 select-none">
                      {rIdx + 1}
                    </td>

                    {/* Cells */}
                    {cellValues.map((val, cIdx) => {
                      const cellKey = `${rIdx}-${cIdx}`;
                      const isNull = val === null || val === undefined;
                      const isCopied = copiedCell === cellKey;

                      return (
                        <td
                          key={cIdx}
                          onClick={(e) => {
                            // Don't stop propagation so row select also fires
                            if (e.altKey || e.metaKey) {
                              e.stopPropagation();
                              handleCopyCell(val, cellKey);
                            }
                          }}
                          className="py-1.5 px-3 whitespace-nowrap border-r border-border/30 last:border-r-0 text-foreground truncate max-w-[200px] group relative"
                          title={String(val ?? 'NULL')}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={isNull ? 'italic text-muted-foreground/60 text-[10px]' : ''}>
                              {isNull ? 'NULL' : typeof val === 'number' ? val.toLocaleString('en-US') : String(val)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCell(val, cellKey);
                              }}
                              className="size-4 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded text-muted-foreground hover:text-amber-500 transition-opacity"
                              title={t('dataProcessing.copyValue')}
                            >
                              {isCopied ? <Check className="size-2.5 text-emerald-500" /> : <Copy className="size-2.5" />}
                            </button>
                          </div>
                        </td>
                      );
                    })}

                    {/* Actions column */}
                    <td className="py-1 px-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyRow(cellValues, columns, rIdx);
                          }}
                          className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title={t('dataProcessing.copyRow')}
                        >
                          {copiedCell === `row-${rIdx}` ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                        {(onReferenceEvidence || onUseAsFinding) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const handler = onReferenceEvidence || onUseAsFinding;
                              handler(row, cellValues);
                            }}
                            className="size-5 rounded flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            title={t('dataProcessing.referenceEvidence', t('dataProcessing.useAsFinding'))}
                          >
                            <BookmarkPlus className="size-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
