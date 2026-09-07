import React, { useState, useEffect } from 'react';
import {
  Database,
  FileSpreadsheet,
  Plus,
  Upload,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Code,
  Table,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { adminContentService } from '../../services/index.js';

/**
 * Helper to auto-detect data type of a value.
 */
function detectType(val) {
  if (val === null || val === undefined || val === '') return 'TEXT';
  const trimmed = String(val).trim();
  if (/^-?\d+$/.test(trimmed)) return 'INTEGER';
  if (/^-?\d*\.\d+$/.test(trimmed)) return 'REAL';
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return 'DATE';
  return 'TEXT';
}

/**
 * Simple CSV parser handling quotes and commas.
 */
function parseCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export function AdminDatasetsPage() {
  const [datasets, setDatasets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // View Modal State
  const [viewingDataset, setViewingDataset] = useState(null);

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState('sql'); // 'sql' | 'excel'
  const [datasetName, setDatasetName] = useState('');
  const [tableName, setTableName] = useState('new_table');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [rawCsv, setRawCsv] = useState(
    'id,order_id,product_name,quantity,price,order_date\n1,ORD-101,Laptop Dell,2,15000000,2026-03-01\n2,ORD-102,Chuột không dây,5,350000,2026-03-02\n3,ORD-103,Bàn phím cơ,1,1200000,2026-03-03'
  );
  const [parsedPreview, setParsedPreview] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const res = await adminContentService.getDatasets();
      if (res.data) setDatasets(res.data);
    } catch (err) {
      showToast('Lỗi khi tải datasets: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  // Update preview when rawCsv changes
  useEffect(() => {
    if (!rawCsv.trim()) {
      setParsedPreview(null);
      return;
    }
    const { headers, rows } = parseCsv(rawCsv);
    if (headers.length === 0) {
      setParsedPreview(null);
      return;
    }

    // Infer column types based on first few rows
    const columnTypes = headers.map((col, colIdx) => {
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const val = rows[r][colIdx];
        if (val !== undefined && val !== '') {
          return detectType(val);
        }
      }
      return 'TEXT';
    });

    setParsedPreview({ headers, rows, columnTypes });
  }, [rawCsv]);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDatasetName(file.name.replace(/\.[^/.]+$/, ''));
    setTableName(file.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase().replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawCsv(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  // Save new dataset
  const handleSaveImport = async () => {
    if (!datasetName.trim()) {
      showToast('Vui lòng nhập tên Dataset!', 'error');
      return;
    }
    if (!parsedPreview || parsedPreview.headers.length === 0) {
      showToast('Dữ liệu CSV không hợp lệ!', 'error');
      return;
    }

    const { headers, rows, columnTypes } = parsedPreview;

    // Build SQLite DDL if SQL type
    const safeTable = tableName.trim() || 'table_1';
    const createTableSql = `CREATE TABLE ${safeTable} (\n  ${headers
      .map((h, i) => `${h} ${columnTypes[i]}`)
      .join(',\n  ')}\n);`;

    const insertSql = rows
      .map((r) => {
        const vals = r.map((val, i) => {
          if (columnTypes[i] === 'INTEGER' || columnTypes[i] === 'REAL') {
            return isNaN(Number(val)) ? 'NULL' : Number(val);
          }
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        return `INSERT INTO ${safeTable} VALUES (${vals.join(', ')});`;
      })
      .join('\n');

    const schemaDefinition = {
      tables: [
        {
          name: safeTable,
          columns: headers.map((h, i) => ({ name: h, type: columnTypes[i] })),
          sampleRows: rows.slice(0, 3),
        },
      ],
      ddl: `${createTableSql}\n\n${insertSql}`,
      rawPreview: rows.slice(0, 50),
    };

    const newDatasetPayload = {
      name: datasetName.trim(),
      type: importType,
      description: datasetDescription.trim() || `Tập dữ liệu bảng ${safeTable}`,
      schema: schemaDefinition,
    };

    const res = await adminContentService.saveDataset(newDatasetPayload);
    if (res.data) {
      showToast(`Đã tạo thành công Dataset: ${res.data.name}!`);
      setImportModalOpen(false);
      loadDatasets();
    } else {
      showToast(res.error || 'Có lỗi khi lưu dataset', 'error');
    }
  };

  const handleDelete = async (dataset) => {
    if (window.confirm(`Bạn có chắc muốn xóa dataset "${dataset.name || dataset.id}"?`)) {
      const res = await adminContentService.deleteDataset(dataset.id);
      if (res.data?.success) {
        showToast('Đã xóa dataset thành công!');
        loadDatasets();
      } else {
        showToast(res.error || 'Có lỗi khi xóa', 'error');
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-fade-in pb-16">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl border ${
            toast.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Kho Dữ Liệu
            </span>
            <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              Step 8.2
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <Database className="size-8 text-primary" />
            Quản lý Dataset & Schema Generator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý kho dữ liệu điều tra, xem cấu trúc Schema và tự động tạo bảng SQLite từ file CSV.
          </p>
        </div>

        <button
          onClick={() => {
            setDatasetName('');
            setTableName('orders_data');
            setDatasetDescription('');
            setImportModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 hover:opacity-90 transition-all cursor-pointer shrink-0"
        >
          <Upload className="size-4" /> Nhập Dataset Từ CSV
        </button>
      </section>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="col-span-full py-12 text-center text-muted-foreground">Đang tải danh sách dataset...</p>
        ) : datasets.length === 0 ? (
          <p className="col-span-full py-12 text-center text-muted-foreground">Chưa có dataset nào trong kho.</p>
        ) : (
          datasets.map((ds) => {
            const isExcel = ds.type === 'excel';
            return (
              <div
                key={ds.id}
                className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isExcel
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isExcel ? <FileSpreadsheet className="size-3" /> : <Database className="size-3" />}
                      {ds.type?.toUpperCase()}
                    </span>

                    <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {ds.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                    {ds.name || ds.id}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {ds.description || 'Tập dữ liệu bảng phục vụ các vụ án điều tra.'}
                  </p>

                  <div className="mt-4 rounded-2xl border border-border/80 bg-muted/20 p-3 text-xs space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Phiên bản:</span>
                      <span className="font-mono font-bold text-foreground">v{ds.version || 1}</span>
                    </div>
                    {ds.schema?.tables && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Bảng dữ liệu:</span>
                        <span className="font-mono font-bold text-foreground">
                          {ds.schema.tables.map((t) => t.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => setViewingDataset(ds)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Eye className="size-3.5" /> Xem Schema
                  </button>
                  <button
                    onClick={() => handleDelete(ds)}
                    className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Xóa dataset"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Schema Modal */}
      {viewingDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Database className="size-5 text-primary" /> {viewingDataset.name || viewingDataset.id}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{viewingDataset.description}</p>
              </div>
              <button
                onClick={() => setViewingDataset(null)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Tables & Columns */}
            {viewingDataset.schema?.tables ? (
              <div className="space-y-4">
                {viewingDataset.schema.tables.map((table) => (
                  <div key={table.name} className="rounded-2xl border border-border bg-muted/20 p-4">
                    <h4 className="font-mono text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                      <Table className="size-4 text-blue-500" /> Bảng: {table.name}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground font-bold">
                            <th className="py-2 pr-4">Tên cột</th>
                            <th className="py-2 px-4">Kiểu dữ liệu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {table.columns?.map((col) => (
                            <tr key={col.name}>
                              <td className="py-2 pr-4 font-mono font-bold text-foreground">{col.name}</td>
                              <td className="py-2 px-4 font-mono text-muted-foreground">{col.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">
                  Dataset dạng Excel table hoặc chưa có schema chi tiết lưu trữ.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setViewingDataset(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Importer & Schema Generator Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-500" /> Nhập CSV & Tự Động Tạo SQLite Schema
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tải lên tệp CSV hoặc dán nội dung bảng để hệ thống tự động nhận diện kiểu dữ liệu và tạo bảng SQL.
                </p>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload Box */}
              <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm font-bold text-primary hover:underline">
                    Chọn tệp .csv từ máy tính
                  </span>
                  <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <p className="text-xs text-muted-foreground mt-1">hoặc chỉnh sửa nội dung CSV bên dưới</p>
              </div>

              {/* Dataset Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Tên Dataset *</label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="Ví dụ: sales_q2_2026.csv"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Tên bảng SQL (Table) *</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Ví dụ: sales"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Loại công cụ</label>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="sql">SQL (SQLite Table)</option>
                    <option value="excel">Excel Table</option>
                  </select>
                </div>
              </div>

              {/* Raw CSV Textarea */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Nội dung CSV (dòng 1 là tên cột):
                </label>
                <textarea
                  rows={4}
                  value={rawCsv}
                  onChange={(e) => setRawCsv(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground outline-none resize-y focus:border-primary"
                  placeholder="id,name,amount,date..."
                />
              </div>

              {/* Schema & Data Preview */}
              {parsedPreview && parsedPreview.headers.length > 0 && (
                <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Table className="size-4 text-emerald-500" /> Tự động nhận diện Schema & Dữ liệu mẫu (
                      {parsedPreview.rows.length} hàng)
                    </h4>
                    <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {parsedPreview.headers.length} Cột
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-48 border border-border rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted border-b border-border">
                          {parsedPreview.headers.map((h, idx) => (
                            <th key={idx} className="p-2 font-mono font-bold text-foreground whitespace-nowrap">
                              {h}
                              <span className="block font-normal text-[10px] text-amber-600 dark:text-amber-400 font-sans">
                                {parsedPreview.columnTypes[idx]}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parsedPreview.rows.slice(0, 5).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-muted/40">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 font-mono text-muted-foreground whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveImport}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <Check className="size-4" /> Lưu & Tạo Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
