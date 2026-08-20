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
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      {/* Excel Sheet Title Bar */}
      {dataset.name && (
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <Database className="size-3.5 text-primary" />
            <span className="font-bold text-foreground">{dataset.name}</span>
          </div>
          <span className="text-[10px] font-mono bg-background px-2 py-0.5 rounded border border-border">
            {rows.length} hàng x {columns.length} cột
          </span>
        </div>
      )}
      <table className="w-full border-collapse font-mono text-xs select-none">
        {/* Header hàng tên Cột Excel (Corner Cell + A, B, C, D...) */}
        <thead>
          <tr className="bg-muted/80 text-muted-foreground border-b border-border">
            <th className="w-10 border-r border-border p-2 text-center text-[10px] font-bold uppercase tracking-wider">
              #
            </th>
            {colLetters.map((letter, idx) => (
              <th
                key={letter}
                className="border-r border-border p-2.5 text-center font-bold text-foreground last:border-r-0 min-w-[110px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                    {letter}
                  </span>
                  <span className="truncate font-sans font-medium text-xs text-muted-foreground">
                    {columns[idx]?.label || columns[idx]?.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Hàng 1: Dòng Tiêu đề Tên Cột Trong Dataset (Header Row 1) */}
          <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
            <td className="border-r border-border p-2 text-center text-[10px] font-bold bg-muted/60 text-muted-foreground">
              1
            </td>
            {columns.map((col, cIdx) => {
              const cellAddr = `${colLetters[cIdx]}1`;
              const isSelected = selectedCell === cellAddr;

              return (
                <td
                  key={cellAddr}
                  onClick={() => onCellSelect && onCellSelect(cellAddr)}
                  className={`border-r border-border p-2.5 text-center font-sans font-bold text-foreground transition-all cursor-pointer last:border-r-0 ${
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

                  return (
                    <td
                      key={cellAddr}
                      onClick={() => onCellSelect && onCellSelect(cellAddr)}
                      className={`relative border-r border-border/80 p-2.5 transition-all cursor-pointer last:border-r-0 ${
                        col.type === 'currency' || col.type === 'number'
                          ? 'text-right'
                          : 'text-left'
                      } ${
                        isTarget
                          ? isSelected
                            ? 'bg-amber-500/20 ring-2 ring-amber-500 shadow-sm'
                            : 'bg-amber-500/10 border-amber-400/80 ring-1 ring-amber-400/40'
                          : isSelected
                          ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                          : editable
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      {/* Target Cell Badge Indicator */}
                      {isTarget && (
                        <div className="absolute -top-1.5 -right-1.5 z-10 flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-amber-950 shadow-sm">
                          <Sparkles className="size-2.5 fill-current" />
                          <span>Mục tiêu</span>
                        </div>
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
  );
}
