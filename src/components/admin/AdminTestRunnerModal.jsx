import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Database,
  Sparkles,
  Info,
  RotateCcw,
  Check,
} from 'lucide-react';
import { checkExcelAnswer } from '../../utils/excelChecker.js';
import { createSqlEngine } from '../../utils/sql/index.js';
import { evaluateSqlResult } from '../../utils/sql/sqlChecker.js';
import { datasetService } from '../../services/index.js';

export function AdminTestRunnerModal({ mission, onClose }) {
  const isExcel = mission.tool === 'excel';

  // Excel State
  const [userFormula, setUserFormula] = useState(
    mission.starterContent?.hint?.match(/=[A-Za-z0-9_*()+,: -]+/)?.[0] || '=C2*D2'
  );
  const [excelResult, setExcelResult] = useState(null);

  // SQL State
  const [userSql, setUserSql] = useState(
    mission.starterContent?.starterSql || 'SELECT * FROM sales;'
  );
  const [sqlResult, setSqlResult] = useState(null);
  const [isRunningSql, setIsRunningSql] = useState(false);

  // Engine Lifecycle refs to prevent Web Worker memory leaks
  const activeEngineRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (activeEngineRef.current) {
        activeEngineRef.current.dispose().catch(() => {});
        activeEngineRef.current = null;
      }
    };
  }, []);

  const handleClose = () => {
    if (activeEngineRef.current) {
      activeEngineRef.current.dispose().catch(() => {});
      activeEngineRef.current = null;
    }
    onClose();
  };

  // Run Excel Test
  const handleTestExcel = () => {
    const expectedFormula = mission.checkerConfig?.expectedFormula || [];
    const expectedValue = mission.checkerConfig?.expectedValue;

    const evalRes = checkExcelAnswer({
      userFormula: userFormula.trim(),
      expectedFormula,
      expectedValue,
    });

    setExcelResult(evalRes);
  };

  // Run SQL Test
  const handleTestSql = async () => {
    setIsRunningSql(true);
    setSqlResult(null);

    // Dispose any previous lingering engine
    if (activeEngineRef.current) {
      await activeEngineRef.current.dispose().catch(() => {});
      activeEngineRef.current = null;
    }

    try {
      // 1. Get dataset definition
      const dsRes = await datasetService.getDataset(mission.datasetId || 'sql-sales-v1');
      const dataset = dsRes.data;

      if (!isMountedRef.current) return;

      // 2. Execute SQL query on SQLite WASM via engine
      const engine = createSqlEngine();
      activeEngineRef.current = engine;
      await engine.initialize();
      if (!isMountedRef.current) return;

      await engine.loadDataset(dataset);
      if (!isMountedRef.current) return;

      const execRes = await engine.execute(userSql);
      if (!isMountedRef.current) return;

      if (execRes.errorCode) {
        setSqlResult({
          passed: false,
          error: execRes.message || 'Lỗi thực thi SQL.',
        });
        return;
      }

      // 3. Evaluate with expected checker config
      const expectedColumns = mission.checkerConfig?.expectedColumns || [];
      const expectedRows = mission.checkerConfig?.expectedRows || [];

      const evalResult = evaluateSqlResult({
        actualColumns: execRes.columns,
        actualRows: execRes.rows,
        expectedColumns,
        expectedRows,
      });

      setSqlResult({
        passed: evalResult.passed,
        actualColumns: execRes.columns,
        actualRowCount: execRes.rows?.length || 0,
        message: evalResult.message || (evalResult.passed ? 'Câu lệnh SQL trả về kết quả chính xác 100%!' : 'Kết quả chưa khớp với yêu cầu.'),
      });
    } catch (err) {
      if (isMountedRef.current) {
        setSqlResult({
          passed: false,
          error: err.message || 'Lỗi không xác định khi chạy thử SQL.',
        });
      }
    } finally {
      if (activeEngineRef.current) {
        await activeEngineRef.current.dispose().catch(() => {});
        activeEngineRef.current = null;
      }
      if (isMountedRef.current) {
        setIsRunningSql(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                Sandbox Test Runner
                <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                  ISOLATED
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Kiểm thử bài tập trực tiếp mà không ghi nhận XP hay làm thay đổi tiến trình học viên.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Mission Context Summary */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{mission.title || 'Vụ án chưa đặt tên'}</span>
              <span className="font-mono uppercase font-bold text-muted-foreground flex items-center gap-1">
                {isExcel ? <FileSpreadsheet className="size-3 text-emerald-500" /> : <Database className="size-3 text-blue-500" />}
                {mission.tool?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{mission.objective}</p>
          </div>

          {/* Test Runner Controls */}
          {isExcel ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Nhập công thức thử nghiệm:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-muted-foreground text-sm">
                      fx
                    </span>
                    <input
                      type="text"
                      value={userFormula}
                      onChange={(e) => setUserFormula(e.target.value)}
                      placeholder="Ví dụ: =SUM(C2:D2)"
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    onClick={handleTestExcel}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-sm text-white shadow-md hover:bg-emerald-500 transition-colors cursor-pointer"
                  >
                    <Play className="size-4" /> Kiểm tra
                  </button>
                </div>
              </div>

              {/* Expected Values Info */}
              <div className="text-xs space-y-1 text-muted-foreground bg-muted/40 p-3 rounded-xl">
                <p>
                  <strong>Công thức kỳ vọng:</strong>{' '}
                  <span className="font-mono text-foreground">
                    {Array.isArray(mission.checkerConfig?.expectedFormula)
                      ? mission.checkerConfig.expectedFormula.join(', ')
                      : mission.checkerConfig?.expectedFormula || '(Chưa cấu hình)'}
                  </span>
                </p>
                <p>
                  <strong>Giá trị kỳ vọng:</strong>{' '}
                  <span className="font-mono text-foreground">
                    {mission.checkerConfig?.expectedValue ?? '(Chưa cấu hình)'}
                  </span>
                </p>
              </div>

              {/* Excel Evaluation Result */}
              {excelResult && (
                <div
                  className={`p-4 rounded-2xl border ${
                    excelResult.correct
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {excelResult.correct ? <CheckCircle2 className="size-5 text-emerald-500" /> : <AlertCircle className="size-5 text-rose-500" />}
                    <span>{excelResult.correct ? 'Kết quả: CHÍNH XÁC (PASS)' : 'Kết quả: CHƯA ĐẠT (FAIL)'}</span>
                  </div>
                  <p className="mt-1 text-xs opacity-90">{excelResult.feedbackMessage}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Nhập câu lệnh SQL thử nghiệm:
                </label>
                <textarea
                  value={userSql}
                  onChange={(e) => setUserSql(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="SELECT * FROM sales WHERE ..."
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleTestSql}
                    disabled={isRunningSql}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-sm text-white shadow-md hover:bg-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Play className="size-4" /> {isRunningSql ? 'Đang thực thi...' : 'Chạy truy vấn & Chấm điểm'}
                  </button>
                </div>
              </div>

              {/* SQL Result */}
              {sqlResult && (
                <div
                  className={`p-4 rounded-2xl border ${
                    sqlResult.passed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {sqlResult.passed ? <CheckCircle2 className="size-5 text-emerald-500" /> : <AlertCircle className="size-5 text-rose-500" />}
                    <span>{sqlResult.passed ? 'Kết quả: CHÍNH XÁC (PASS)' : 'Kết quả: THẤT BẠI (FAIL)'}</span>
                  </div>
                  <p className="mt-1 text-xs opacity-90">{sqlResult.error || sqlResult.message}</p>
                  {sqlResult.actualColumns && (
                    <p className="mt-2 font-mono text-[11px] opacity-75">
                      Đã trả về: {sqlResult.actualRowCount} hàng · Cột: [{sqlResult.actualColumns.join(', ')}]
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border px-6 py-3.5 bg-muted/40 flex justify-end">
          <button
            onClick={handleClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Đóng Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
