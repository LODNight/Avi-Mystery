import React from 'react';
import { Sparkles, Edit3, Database } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/format.js';

/**
 * SpreadsheetGrid Component (LRN-EXCEL-002)
 * Bảng tính tương tác chuẩn giao diện Excel cho bài tập làm bài
 *
 * @param {Object} props
 * @param {Object} props.dataset - Bộ dữ liệu gồm columns [{ key, name, type }] và rows [{...}]
 * @param {string} props.selectedCell - Tọa độ ô đang được chọn (ví dụ: 'E2')
 * @param {Function} props.onCellSelect - Callback kích hoạt khi người học nhấp chọn một ô
 * @param {string} [props.targetCell] - Ô mục tiêu cần nhập công thức của bài học (ví dụ: 'E2')
 * @param {Object} [props.cellFormulas] - Bản đồ công thức do người học nhập { 'E2': '=C2*D2' }
 * @param {Object} [props.cellValues] - Bản đồ giá trị sau khi tính toán { 'E2': 450000 }
 * @param {Array<string>} [props.editableCells] - Danh sách dải các ô người học được phép sửa
 */
export const SpreadsheetGrid = React.memo(function SpreadsheetGrid({
  dataset,
  selectedCell = 'A1',
  onCellSelect,
  onCellDoubleClick,
  onFillDown,
  targetCell = 'E2',
  cellFormulas = {},
  cellValues = {},
  editableCells = ['E2'],
  containerRef,
  editorOverlay,
}) {
  // Render counter phục vụ Performance Verification Gate
  if (typeof window !== 'undefined') {
    window.__SPREADSHEET_GRID_RENDER_COUNT__ =
      (window.__SPREADSHEET_GRID_RENDER_COUNT__ || 0) + 1;
  }

  if (!dataset || !dataset.columns || dataset.columns.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-xs text-muted-foreground">
        Chưa có dữ liệu bảng tính Excel.
      </div>
    );
  }

  const columns = dataset.columns;
  const rows = dataset.rows || [];

  // Tạo nhãn tên cột Excel (A, B, C, D, E, F...)
  const colLetters = columns.map((_, i) => String.fromCharCode(65 + i));

  // Kiểm tra xem ô tính có cho phép người dùng nhập hay không
  const isCellEditable = (cellAddr) => {
    return editableCells.includes(cellAddr) || cellAddr === targetCell;
  };

  // Format hiển thị giá trị trong ô tính
  const renderCellValue = (column, rawValue, cellAddr, isGhost = false) => {
    const colType = column.dataType || column.type;
    const isCurrencyCol =
      colType === 'currency' ||
      ['unitPrice', 'total', 'spending', 'price'].includes(column.key);

    // 1. Kiểm tra xem ô có giá trị đã được tính toán từ công thức hay chưa
    if (cellValues[cellAddr] !== undefined && cellValues[cellAddr] !== null) {
      const computed = cellValues[cellAddr];
      if (isCurrencyCol) return formatCurrency(computed);
      if (colType === 'number') return formatNumber(computed);
      return String(computed);
    }

    // 2. Kiểm tra công thức đã nhập nhưng chưa tính được giá trị
    if (cellFormulas[cellAddr]) {
      return cellFormulas[cellAddr];
    }

    // 3. Hiển thị giá trị gốc trong dataset (nếu là ghost row thì để trống)
    if (isGhost) {
      return '';
    }

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return <span className="text-muted-foreground/50 italic">Chưa có</span>;
    }

    if (isCurrencyCol) return formatCurrency(rawValue);
    if (colType === 'number') return formatNumber(rawValue);

    return String(rawValue);
  };

  // Tính toán ghost rows để làm đầy không gian làm việc (tối thiểu 16 hàng như Excel thật)
  const minTotalRows = 16;
  const currentDataRowCount = rows.length;
  const ghostRowCount = Math.max(0, minTotalRows - currentDataRowCount - 1);
  const ghostRows = Array.from({ length: ghostRowCount }, (_, i) => currentDataRowCount + 2 + i);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      {/* Excel Sheet Info Bar */}
      {dataset.name && (
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3.5 py-2 text-xs font-semibold text-muted-foreground shrink-0 select-none">
          <div className="flex items-center gap-2">
            <Database className="size-3.5 text-foreground" />
            <span className="font-bold text-foreground">{dataset.name}</span>
          </div>
          <span className="text-[10px] font-mono bg-background px-2 py-0.5 rounded border border-border text-muted-foreground font-bold">
            {rows.length} hàng x {columns.length} cột
          </span>
        </div>
      )}

      {/* Spreadsheet Canvas Scroll Container */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 w-full overflow-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/40 pb-1 relative"
      >
        <table className="w-full min-w-[580px] border-collapse font-mono text-xs select-none">
          {/* Header hàng tên Cột Excel (A, B, C, D...) chuẩn giao diện Excel */}
          <thead className="sticky top-0 z-20">
            <tr className="bg-muted/90 dark:bg-card/95 backdrop-blur-xs text-foreground border-b border-border">
              {/* Corner # sticky cell */}
              <th className="w-11 sticky left-0 z-30 border-r border-b border-border p-1.5 text-center text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground shrink-0">
                #
              </th>
              {colLetters.map((letter) => (
                <th
                  key={letter}
                  className="border-r border-b border-border py-1.5 px-3 text-center font-extrabold text-foreground last:border-r-0 min-w-[130px] sm:min-w-[150px] text-xs bg-muted/80 dark:bg-card/90"
                >
                  <span className="inline-block rounded bg-background text-foreground border border-border px-2.5 py-0.5 text-xs font-mono font-black shadow-2xs">
                    {letter}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Hàng 1: Dòng Tiêu đề Tên Cột Trong Dataset (Header Row 1) */}
            <tr className="border-b border-border bg-background/80 text-foreground font-semibold">
              <td className="sticky left-0 z-10 w-11 border-r border-border p-1.5 text-center text-[10px] font-bold bg-muted/50 text-muted-foreground">
                1
              </td>
              {columns.map((col, cIdx) => {
                const cellAddr = `${colLetters[cIdx]}1`;
                const isSelected = selectedCell === cellAddr;
                const isNumeric = col.type === 'currency' || col.type === 'number' || col.dataType === 'currency' || col.dataType === 'number' || ['unitPrice', 'total', 'spending', 'price', 'quantity', 'amount'].includes(col.key);

                return (
                  <td
                    key={cellAddr}
                    onClick={() => onCellSelect && onCellSelect(cellAddr)}
                    className={`border-r border-border px-3 py-1.5 font-sans font-bold text-foreground transition-colors cursor-pointer min-w-[130px] sm:min-w-[150px] last:border-r-0 ${
                      isNumeric ? 'text-right' : 'text-left'
                    } ${
                      isSelected
                        ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    {col.label || col.name}
                  </td>
                );
              })}
            </tr>

            {/* Dòng 2 trở đi: Các dòng dữ liệu thực tế (Data Rows: Row 2, 3, 4...) */}
            {rows.map((row, rIdx) => {
              const excelRowNumber = rIdx + 2; // Row 2 = first data row

              return (
                <tr
                  key={excelRowNumber}
                  className="border-b border-border/70 hover:bg-muted/20 transition-colors"
                >
                  {/* Excel Row Index Label (2, 3, 4...) sticky left */}
                  <td className="sticky left-0 z-10 w-11 border-r border-border p-1.5 text-center text-[10px] font-bold bg-muted/50 text-muted-foreground">
                    {excelRowNumber}
                  </td>

                  {/* Cells in Row */}
                  {columns.map((col, cIdx) => {
                    const cellAddr = `${colLetters[cIdx]}${excelRowNumber}`;
                    const isSelected = selectedCell === cellAddr;
                    const isTarget = cellAddr === targetCell;
                    const editable = isCellEditable(cellAddr);
                    const rawVal = row[col.key];
                    const colType = col.dataType || col.type;
                    const isNumeric = colType === 'currency' || colType === 'number' || colType === 'integer' || colType === 'float' || ['unitPrice', 'total', 'spending', 'price', 'quantity', 'amount', 'count'].includes(col.key);

                    return (
                      <td
                        key={cellAddr}
                        data-cell-addr={cellAddr}
                        onClick={() => onCellSelect && onCellSelect(cellAddr)}
                        onDoubleClick={() => onCellDoubleClick && onCellDoubleClick(cellAddr)}
                        className={`relative border-r border-border/70 px-3 py-1.5 transition-all cursor-pointer min-w-[130px] sm:min-w-[150px] last:border-r-0 ${
                          isNumeric ? 'text-right' : 'text-left'
                        } ${
                          isTarget
                            ? isSelected
                              ? 'bg-amber-500/25 ring-2 ring-amber-500 ring-inset shadow-xs'
                              : 'bg-amber-500/15 ring-2 ring-amber-500/90 ring-inset'
                            : isSelected
                            ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                            : editable
                            ? 'bg-amber-500/5 hover:bg-amber-500/10'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        {/* Target Cell Subtle Corner Dot Marker (NO text badge covering cell) */}
                        {isTarget && (
                          <div
                            className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500 pointer-events-none"
                            title="Ô mục tiêu phá án"
                            data-testid="target-cell-marker"
                          />
                        )}

                        {/* Editable Indicator Icon */}
                        {editable && !isTarget && (
                          <Edit3 className="absolute right-1 top-1 size-2.5 text-amber-500/60 pointer-events-none" />
                        )}

                        {/* Interactive Excel Fill Handle Square */}
                        {isSelected && editable && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onFillDown) onFillDown(cellAddr);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (onFillDown) onFillDown(cellAddr);
                            }}
                            title="Kéo (Fill down) công thức xuống các hàng bên dưới"
                            className="absolute -bottom-1.5 -right-1.5 z-30 size-2.5 rounded-[1px] bg-amber-500 hover:bg-amber-400 border-2 border-background shadow-xs cursor-pointer transition-transform hover:scale-125 flex items-center justify-center"
                          >
                            <span className="sr-only">Fill down</span>
                          </div>
                        )}

                        <span
                          className={`${
                            isTarget ? 'font-black text-amber-700 dark:text-amber-400' : 'text-foreground'
                          } ${isNumeric ? 'tabular-nums font-mono' : 'font-sans'}`}
                        >
                          {renderCellValue(col, rawVal, cellAddr)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* ── Realistic Empty Ghost Rows (Làm đầy bảng tính chuẩn Excel) ── */}
            {ghostRows.map((ghostRowNumber) => (
              <tr
                key={`ghost-row-${ghostRowNumber}`}
                className="border-b border-border/40 hover:bg-muted/10 transition-colors"
              >
                <td className="sticky left-0 z-10 w-11 border-r border-border/60 p-1.5 text-center text-[10px] font-medium bg-muted/30 text-muted-foreground/60">
                  {ghostRowNumber}
                </td>
                {columns.map((col, cIdx) => {
                  const cellAddr = `${colLetters[cIdx]}${ghostRowNumber}`;
                  const isSelected = selectedCell === cellAddr;
                  const isTarget = cellAddr === targetCell;
                  const editable = isCellEditable(cellAddr);
                  const colType = col.dataType || col.type;
                  const isNumeric =
                    colType === 'currency' ||
                    colType === 'number' ||
                    colType === 'integer' ||
                    colType === 'float' ||
                    ['unitPrice', 'total', 'spending', 'price', 'quantity', 'amount', 'count'].includes(col.key);
                  const displayContent = renderCellValue(col, '', cellAddr, true);

                  return (
                    <td
                      key={cellAddr}
                      data-cell-addr={cellAddr}
                      onClick={() => onCellSelect && onCellSelect(cellAddr)}
                      onDoubleClick={() => onCellDoubleClick && onCellDoubleClick(cellAddr)}
                      className={`relative border-r border-border/40 px-3 py-1.5 h-7 transition-all cursor-pointer min-w-[130px] sm:min-w-[150px] last:border-r-0 ${
                        isNumeric ? 'text-right' : 'text-left'
                      } ${
                        isTarget
                          ? isSelected
                            ? 'bg-amber-500/25 ring-2 ring-amber-500 ring-inset shadow-xs'
                            : 'bg-amber-500/15 ring-2 ring-amber-500/90 ring-inset'
                          : isSelected
                          ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                          : editable
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : 'hover:bg-muted/20'
                      }`}
                    >
                      <span
                        className={`${
                          isTarget ? 'font-black text-amber-700 dark:text-amber-400' : 'text-foreground'
                        } ${isNumeric ? 'tabular-nums font-mono' : 'font-sans'}`}
                      >
                        {displayContent || '\u00A0'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Render overlay bên trong scroll container để cuộn mượt mà */}
        {editorOverlay}
      </div>
    </div>
  );
});
