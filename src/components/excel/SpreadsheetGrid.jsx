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
export function SpreadsheetGrid({
  dataset,
  selectedCell = 'A1',
  onCellSelect,
  targetCell = 'E2',
  cellFormulas = {},
  cellValues = {},
  editableCells = ['E2'],
}) {
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
  const renderCellValue = (column, rawValue, cellAddr) => {
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

    // 3. Hiển thị giá trị gốc trong dataset
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return <span className="text-muted-foreground/50 italic">Chưa có</span>;
    }

    if (isCurrencyCol) return formatCurrency(rawValue);
    if (colType === 'number') return formatNumber(rawValue);

    return String(rawValue);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-card shadow-md">
      {/* Excel Sheet Title Bar */}
      {dataset.name && (
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80 px-4 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="size-3.5 text-stone-600 dark:text-stone-300" />
            <span className="font-bold text-stone-900 dark:text-stone-100">{dataset.name}</span>
          </div>
          <span className="text-[10px] font-mono bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold">
            {rows.length} hàng x {columns.length} cột
          </span>
        </div>
      )}

      {/* Responsive Horizontal Scroll Container with Min-Width Protection */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700 pb-1">
        <table className="w-full min-w-[580px] border-collapse font-mono text-xs select-none">
          {/* Header hàng tên Cột Excel (A, B, C, D...) chuẩn giao diện Excel */}
          <thead>
            <tr className="bg-stone-200/90 dark:bg-stone-900 text-foreground border-b-2 border-stone-300 dark:border-stone-700">
              <th className="w-10 border-r border-stone-300 dark:border-stone-700 p-2 text-center text-[10px] font-extrabold uppercase tracking-wider bg-stone-300/80 dark:bg-stone-950 text-stone-700 dark:text-stone-300 shrink-0">
                #
              </th>
              {colLetters.map((letter) => (
                <th
                  key={letter}
                  className="border-r border-stone-300 dark:border-stone-700 py-2 px-3 text-center font-extrabold text-stone-800 dark:text-stone-200 last:border-r-0 min-w-[130px] sm:min-w-[150px] text-xs bg-stone-200/90 dark:bg-stone-900"
                >
                  <span className="rounded-md bg-stone-300/90 text-stone-900 border border-stone-400/60 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 px-2.5 py-0.5 text-xs font-mono font-extrabold shadow-2xs">
                    {letter}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Hàng 1: Dòng Tiêu đề Tên Cột Trong Dataset (Header Row 1) */}
            <tr className="border-b border-border bg-background dark:bg-card/30 text-foreground font-semibold">
              <td className="border-r border-border p-2 text-center text-[10px] font-bold bg-muted/50 text-muted-foreground">
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
                    className={`border-r border-border px-3 py-2 font-sans font-bold text-foreground transition-all cursor-pointer min-w-[130px] sm:min-w-[150px] last:border-r-0 ${
                      isNumeric ? 'text-right' : 'text-left'
                    } ${
                      isSelected
                        ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                        : 'hover:bg-muted/60'
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
                  className="border-b border-border/70 hover:bg-muted/20 transition-colors last:border-b-0"
                >
                  {/* Excel Row Index Label (2, 3, 4...) */}
                  <td className="border-r border-border p-2 text-center text-[10px] font-bold bg-muted/40 text-muted-foreground">
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

                    const hasCellData =
                      (cellValues[cellAddr] !== undefined && cellValues[cellAddr] !== null) ||
                      Boolean(cellFormulas[cellAddr] && cellFormulas[cellAddr].trim()) ||
                      (rawVal !== null && rawVal !== undefined && rawVal !== '');

                    return (
                      <td
                        key={cellAddr}
                        onClick={() => onCellSelect && onCellSelect(cellAddr)}
                        className={`relative border-r border-border/80 px-3 py-2 transition-all cursor-pointer min-w-[130px] sm:min-w-[150px] last:border-r-0 ${
                          isNumeric ? 'text-right' : 'text-left'
                        } ${
                          isTarget
                            ? isSelected
                              ? 'bg-amber-500/20 ring-2 ring-amber-500 shadow-xs'
                              : 'bg-amber-500/10 border-amber-400/80 ring-1 ring-amber-400/40'
                            : isSelected
                            ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                            : editable
                            ? 'bg-amber-500/5 hover:bg-amber-500/10'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        {/* Smart Visibility Target Cell Badge Indicator */}
                        {isTarget && (
                          !hasCellData ? (
                            /* Trạng thái 1 (Ô trống): Hiển thị đầy đủ badge "✦ Mục tiêu" */
                            <div className="absolute top-1 right-1 z-10 flex items-center gap-0.5 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-950 shadow-xs pointer-events-none">
                              <Sparkles className="size-2.5 fill-current" />
                              <span>Mục tiêu</span>
                            </div>
                          ) : (
                            /* Trạng thái 2 (Đã có dữ liệu): Ẩn chữ "Mục tiêu", giữ icon ✦ nhỏ góc trái để trả không gian hiển thị con số */
                            <div className="absolute top-1 left-1.5 z-10 flex items-center text-amber-600 dark:text-amber-400 pointer-events-none" title="Ô mục tiêu vụ án">
                              <Sparkles className="size-2.5 fill-amber-500/40" />
                            </div>
                          )
                        )}

                        {/* Editable Indicator Icon */}
                        {editable && !isTarget && (
                          <Edit3 className="absolute right-1.5 top-1.5 size-3 text-amber-500/60 pointer-events-none" />
                        )}

                        <span
                          className={`${
                            isTarget ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-foreground'
                          }`}
                        >
                          {renderCellValue(col, rawVal, cellAddr)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
