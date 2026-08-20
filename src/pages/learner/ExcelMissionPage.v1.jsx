import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Sparkles,
  Clock,
  Database,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { mockMissionService } from '../../services/mock/mockMissionService.js';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDuration } from '../../utils/format.js';
import { FormulaBar } from '../../components/excel/FormulaBar.jsx';
import { SpreadsheetGrid } from '../../components/excel/SpreadsheetGrid.jsx';
import { evaluateFormulaValue } from '../../utils/excelChecker.js';

export function ExcelMissionPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mission, setMission] = useState(null);
  const [dataset, setDataset] = useState(null);

  // State quản lý Bảng tính Excel Interactive (LRN-EXCEL-002)
  const [selectedCell, setSelectedCell] = useState('E2');
  const [formulaInput, setFormulaInput] = useState('');
  const [cellFormulas, setCellFormulas] = useState({});
  const [cellValues, setCellValues] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadMissionAndDataset() {
      setLoading(true);
      setError(null);

      try {
        const missionRes = await mockMissionService.getMission(missionId);
        if (!isMounted) return;

        if (missionRes.error || !missionRes.data) {
          setError(missionRes.error || `Không tìm thấy bài học với mã "${missionId}".`);
          setLoading(false);
          return;
        }

        const loadedMission = missionRes.data;
        setMission(loadedMission);
        if (loadedMission.starterContent?.targetCell) {
          setSelectedCell(loadedMission.starterContent.targetCell);
        }

        // Load Dataset
        if (loadedMission.datasetId) {
          const datasetRes = await mockMissionService.getDataset(loadedMission.datasetId);
          if (!isMounted) return;

          if (datasetRes.error || !datasetRes.data) {
            setError(datasetRes.error || `Không thể tải bảng dữ liệu "${loadedMission.datasetId}".`);
            setLoading(false);
            return;
          }
          setDataset(datasetRes.data);
        }

        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Có lỗi hệ thống khi tải dữ liệu bài học.');
          setLoading(false);
        }
      }
    }

    loadMissionAndDataset();

    return () => {
      isMounted = false;
    };
  }, [missionId]);

  // Xử lý khi chọn một ô tính trên bảng
  const handleCellSelect = (cellAddr) => {
    setSelectedCell(cellAddr);
    setFormulaInput(cellFormulas[cellAddr] || '');
  };

  // Trích xuất dữ liệu gốc của sheet để phục vụ tính toán công thức
  const getSheetDataMap = () => {
    if (!dataset || !dataset.columns || !dataset.rows) return {};
    const map = {};
    const colLetters = dataset.columns.map((_, i) => String.fromCharCode(65 + i));

    dataset.rows.forEach((row, rIdx) => {
      const excelRow = rIdx + 2;
      dataset.columns.forEach((col, cIdx) => {
        const addr = `${colLetters[cIdx]}${excelRow}`;
        map[addr] = row[col.key];
      });
    });

    // Thêm các giá trị đã tính toán trước đó
    return { ...map, ...cellValues };
  };

  // Xử lý khi gõ công thức vào FormulaBar
  const handleFormulaChange = (newFormula) => {
    setFormulaInput(newFormula);

    setCellFormulas((prev) => ({
      ...prev,
      [selectedCell]: newFormula,
    }));

    // Tự động tính toán giá trị nếu công thức bắt đầu bằng '='
    if (newFormula.trim().startsWith('=')) {
      const sheetData = getSheetDataMap();
      const computed = evaluateFormulaValue(newFormula, sheetData);
      if (computed !== null) {
        setCellValues((prev) => ({
          ...prev,
          [selectedCell]: computed,
        }));
      }
    }
  };

  // Xử lý khi nhấn nút Áp dụng hoặc phím Enter
  const handleFormulaSubmit = (targetFormula) => {
    const formulaToUse =
      typeof targetFormula === 'string' && targetFormula.trim()
        ? targetFormula
        : formulaInput;
    if (!formulaToUse || !formulaToUse.trim()) return;

    const sheetData = getSheetDataMap();
    const computed = evaluateFormulaValue(formulaToUse, sheetData);

    if (computed !== null) {
      setCellValues((prev) => ({
        ...prev,
        [selectedCell]: computed,
      }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-4 sm:p-6" aria-busy="true" aria-label="Đang tải dữ liệu bài học">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="p-4 sm:p-8">
        <ErrorState
          message={error || 'Vụ án này không tồn tại hoặc đã bị gỡ bỏ.'}
          onRetry={() => navigate('/map')}
        />
      </div>
    );
  }

  const starterCell = mission.starterContent?.targetCell || 'E2';

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] space-y-6 animate-fade-in pb-12">
      {/* ── Top Bar Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/map"
            className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-sm"
            title="Quay lại Bản đồ học tập"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary uppercase">
                <FileSpreadsheet className="size-3" /> Excel Mission
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Mã vụ án: {mission.id}
              </span>
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {mission.title}
            </h1>
          </div>
        </div>

        {/* Header Metadata Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            <Award className="size-4" />
            <span>+{mission.rewardXp || 100} XP</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <Clock className="size-3.5" />
            <span>{formatDuration(mission.estimatedDuration)}</span>
          </div>
        </div>
      </div>

      {/* ── Main Workspace Grid (Left Briefing Panel + Right Interactive Spreadsheet) ── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT PANEL: Mission Briefing & Story ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mission Story Box */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-4 text-amber-500" />
              <span>Hồ sơ bối cảnh vụ án</span>
            </div>

            <p className="text-sm leading-relaxed text-foreground italic border-l-2 border-primary/50 pl-3 py-1 bg-muted/30 rounded-r-xl">
              "{mission.story}"
            </p>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <CheckCircle2 className="size-4" />
                <span>Mục tiêu nhiệm vụ</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                {mission.objective}
              </p>
            </div>
          </div>

          {/* Target Cell & Instruction Box */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Ô mục tiêu cần nhập
              </span>
              <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                {starterCell}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Hãy chọn ô <strong className="text-foreground font-mono">{starterCell}</strong> trong bảng tính bên phải và nhập công thức phù hợp để hoàn thành yêu cầu.
            </p>
          </div>

          {/* Dataset Info Card */}
          {dataset && (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  <Database className="size-4 text-primary" />
                  <span>Tệp dữ liệu điều tra</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  v{dataset.version}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{dataset.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gồm {dataset.columns?.length || 0} cột & {dataset.rows?.length || 0} hàng dữ liệu
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Interactive Spreadsheet Workspace Container (LRN-EXCEL-002) ── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Formula Bar Component */}
          <FormulaBar
            selectedCell={selectedCell}
            formula={formulaInput}
            onChange={handleFormulaChange}
            onSubmit={handleFormulaSubmit}
            isTargetCell={selectedCell === starterCell}
          />

          {/* Interactive Spreadsheet Grid Component */}
          {dataset ? (
            <SpreadsheetGrid
              dataset={dataset}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              targetCell={starterCell}
              cellFormulas={cellFormulas}
              cellValues={cellValues}
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-border bg-card p-6">
              <p className="text-xs text-muted-foreground">Không có dữ liệu bảng tính.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
