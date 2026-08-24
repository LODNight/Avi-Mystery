import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle,
  Send,
} from 'lucide-react';

const PAGE_SIZE = 50;

/**
 * Ánh xạ mã lỗi SQL chuẩn sang thông điệp hiển thị tiếng Việt
 */
export function mapSqlErrorMessage(code, defaultMessage) {
  switch (code) {
    case 'SQL_SYNTAX_ERROR':
      return 'Cú pháp câu lệnh SQL chưa chính xác. Vui lòng kiểm tra lại các từ khóa, dấu phẩy hoặc tên bảng/cột.';
    case 'SQL_READ_ONLY_VIOLATION':
      return 'Thao tác bị từ chối: Môi trường học tập chỉ hỗ trợ câu lệnh đọc dữ liệu (SELECT / WITH).';
    case 'SQL_MULTIPLE_STATEMENTS':
      return 'Vui lòng chỉ nhập và thực thi một câu lệnh SQL duy nhất tại một thời điểm.';
    case 'SQL_TIMEOUT':
      return 'Thời gian thực thi quá 2000ms. Truy vấn đã bị hệ thống ngắt để bảo vệ bộ nhớ.';
    case 'SQL_QUERY_REQUIRED':
      return 'Vui lòng nhập câu lệnh SQL vào khung soạn thảo trước khi nhấn thực thi.';
    case 'SQL_RESULT_LIMIT_EXCEEDED':
      return 'Kết quả vượt quá giới hạn 500 dòng tối đa và đã được cắt bớt.';
    case 'SQL_RUNTIME_ERROR':
      return defaultMessage || 'Lỗi phát sinh khi cơ sở dữ liệu thực thi câu lệnh SQL.';
    default:
      return defaultMessage || 'Đã xảy ra lỗi không xác định khi chạy câu lệnh SQL.';
  }
}

/**
 * Kiểm tra xem một cột có chứa dữ liệu kiểu số hoàn toàn hay không (dùng để căn lề text-right)
 */
function isNumericColumn(rows, cIdx) {
  if (!rows || rows.length === 0) return false;
  return rows.every((row) => {
    const val = row[cIdx];
    return val === null || val === undefined || typeof val === 'number';
  });
}

/**
 * Format ô dữ liệu: hiển thị NULL, Boolean, hoặc Số có phân cách hàng nghìn (12,500,000)
 */
function formatCellValue(val) {
  if (val === null || val === undefined) {
    return (
      <span className="italic text-muted-foreground/70 font-mono text-[10px] select-none bg-muted/50 px-1 py-0.5 rounded">
        NULL
      </span>
    );
  }
  if (typeof val === 'boolean') {
    return (
      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
        {val ? 'TRUE' : 'FALSE'}
      </span>
    );
  }
  if (typeof val === 'number') {
    return (
      <span className="font-mono text-foreground font-medium">
        {val.toLocaleString('en-US')}
      </span>
    );
  }
  return String(val);
}

/**
 * ResultViewer Component
 *
 * @param {Object} props
 * @param {Object|null} props.result - Kết quả trả về từ sqlEngineAdapter.execute
 * @param {boolean} props.isExecuting - Trạng thái Worker đang thực thi
 * @param {Function} [props.onSubmit] - Callback khi bấm nút "Nộp bài vụ án"
 */
export function ResultViewer({ result, isExecuting, onSubmit }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset trang về 1 khi có kết quả mới
  useEffect(() => {
    setCurrentPage(1);
  }, [result]);

  // 1. Loading State
  if (isExecuting) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[220px] rounded-2xl border border-border bg-card p-8 text-center animate-fade-in"
        aria-busy="true"
        aria-label="Đang thực thi câu lệnh SQL"
      >
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-sm font-semibold text-foreground">Đang thực thi truy vấn SQL...</p>
        <p className="mt-1 text-xs text-muted-foreground">Vui lòng chờ Worker xử lý dữ liệu in-memory.</p>
      </div>
    );
  }

  // 2. Idle State (Chưa chạy truy vấn nào)
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center animate-fade-in">
        <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Database className="size-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">Chưa có kết quả truy vấn</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Nhấn nút <span className="font-semibold text-primary">"Chạy truy vấn"</span> hoặc sử dụng phím tắt{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground border border-border">Ctrl + Enter</kbd>{' '}
          để xem bảng dữ liệu.
        </p>
      </div>
    );
  }

  // 3. Error State
  if (result.errorCode) {
    const friendlyMessage = mapSqlErrorMessage(result.errorCode, result.message);

    return (
      <div
        className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-destructive animate-fade-in"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-destructive">Lỗi truy vấn SQL</span>
              <span className="rounded bg-destructive/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-destructive">
                {result.errorCode}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/90 font-medium">
              {friendlyMessage}
            </p>
            {result.message && result.message !== friendlyMessage && (
              <p className="mt-2 text-[11px] font-mono text-muted-foreground bg-background/50 p-2 rounded border border-border/50 overflow-x-auto">
                Chi tiết: {result.message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Success State
  const { columns = [], rows = [], rowCount = 0, truncated = false, executionMs = 0 } = result;

  // Xử lý phân trang
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {/* Execution Summary Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" /> Thành công
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="font-medium text-foreground">
            Trả về <strong className="font-bold">{rowCount}</strong> dòng
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1 font-mono text-muted-foreground">
            <Clock className="size-3.5" /> {executionMs} ms
          </span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {truncated && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3" /> Đã giới hạn 500 dòng
            </span>
          )}
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Send className="size-3.5" /> Nộp bài vụ án
            </button>
          )}
        </div>
      </div>

      {/* Empty Rows State */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[160px] rounded-2xl border border-border bg-card p-6 text-center">
          <FileSpreadsheet className="size-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-semibold text-foreground">Không có dữ liệu trả về</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Truy vấn thực thi thành công nhưng không có bản ghi nào khớp với điều kiện.
          </p>
        </div>
      ) : (
        /* Data Table */
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto max-h-[360px] overflow-y-auto relative">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-md border-b border-border font-mono text-[11px] font-bold text-muted-foreground">
                <tr>
                  <th className="w-12 border-r border-border/60 px-3 py-2.5 text-center text-[10px] text-muted-foreground/60 shrink-0">
                    #
                  </th>
                  {columns.map((col, idx) => {
                    const isNum = isNumericColumn(rows, idx);
                    const isCompact = isNum || /id$|_id$|^code$|^status$|^date$/i.test(col);
                    return (
                      <th
                        key={idx}
                        className={`px-4 py-2.5 border-r border-border/40 last:border-r-0 whitespace-nowrap ${
                          isNum ? 'text-right' : 'text-left'
                        } ${isCompact ? 'w-1' : 'w-auto'}`}
                      >
                        {col}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-sans text-foreground">
                {paginatedRows.map((row, rIdx) => {
                  const actualRowNumber = startIndex + rIdx + 1;
                  return (
                    <tr
                      key={rIdx}
                      className="hover:bg-muted/40 transition-colors odd:bg-background/40 even:bg-card"
                    >
                      <td className="border-r border-border/40 px-3 py-2 text-center font-mono text-[10px] text-muted-foreground/60 select-none">
                        {actualRowNumber}
                      </td>
                      {row.map((cell, cIdx) => {
                        const isNum = typeof cell === 'number';
                        const isNullOrBool = cell === null || cell === undefined || typeof cell === 'boolean';
                        return (
                          <td
                            key={cIdx}
                            className={`px-4 py-2 border-r border-border/30 last:border-r-0 whitespace-nowrap max-w-[300px] truncate ${
                              isNum ? 'text-right' : isNullOrBool ? 'text-center' : 'text-left'
                            }`}
                          >
                            {formatCellValue(cell)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-muted/30 text-xs">
              <span className="text-muted-foreground">
                Hiển thị <strong className="text-foreground">{startIndex + 1}</strong> -{' '}
                <strong className="text-foreground">{Math.min(rows.length, startIndex + PAGE_SIZE)}</strong> trong{' '}
                <strong className="text-foreground">{rows.length}</strong> dòng
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="size-3.5" /> Trước
                </button>
                <span className="font-mono font-bold text-xs text-foreground px-2">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Sau <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

