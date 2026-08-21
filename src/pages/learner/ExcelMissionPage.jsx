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
  ChevronDown,
  FileText,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { mockMissionService } from '../../services/mock/mockMissionService.js';
import { mockAuthService } from '../../services/mock/mockAuthService.js';
import { mockSubmissionService } from '../../services/mock/mockSubmissionService.js';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDuration } from '../../utils/format.js';
import { FormulaBar } from '../../components/excel/FormulaBar.jsx';
import { SpreadsheetGrid } from '../../components/excel/SpreadsheetGrid.jsx';
import { ActionToolbar } from '../../components/excel/ActionToolbar.jsx';
import { HintPanel } from '../../components/excel/HintPanel.jsx';
import { MissionResultModal } from '../../components/excel/MissionResultModal.jsx';
import { evaluateFormulaValue } from '../../utils/excelChecker.js';

export function ExcelMissionPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mission, setMission] = useState(null);
  const [dataset, setDataset] = useState(null);

  // State quản lý việc ẩn/hiện Hồ sơ bối cảnh vụ án & Bảng gợi ý (Step 3.3)
  const [showBriefing, setShowBriefing] = useState(false);
  const [showHintPanel, setShowHintPanel] = useState(false);
  const [hintsUnlockedCount, setHintsUnlockedCount] = useState(0);

  // State quản lý phản hồi thông báo (Feedback Toast)
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State quản lý Popup Kết quả nộp bài (Step 3.4)
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

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

  // Xử lý thông báo tạm thời (Toast Notification)
  const showNotification = (type, message) => {
    setFeedbackToast({ type, message });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

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
    if (!formulaToUse || !formulaToUse.trim()) return null;

    const sheetData = getSheetDataMap();
    const computed = evaluateFormulaValue(formulaToUse, sheetData);

    if (computed !== null) {
      setCellValues((prev) => ({
        ...prev,
        [selectedCell]: computed,
      }));
    }
    return computed;
  };

  // ── Step 3.3 Action Toolbar Handlers ──

  // 1. Chạy thử công thức (Run / Evaluate)
  const handleRunFormula = () => {
    setIsEvaluating(true);
    const computed = handleFormulaSubmit();
    setTimeout(() => {
      setIsEvaluating(false);
      if (computed !== null && computed !== undefined) {
        showNotification('success', `Đã chạy thử công thức thành công trên ô ${selectedCell}! Kết quả: ${computed}`);
      } else if (!formulaInput || !formulaInput.startsWith('=')) {
        showNotification('warning', `Vui lòng nhập công thức bắt đầu bằng dấu "=" vào ô ${selectedCell}.`);
      } else {
        showNotification('error', `Công thức "${formulaInput}" tại ô ${selectedCell} không hợp lệ.`);
      }
    }, 200);
  };

  // 2. Đặt lại bảng tính (Reset Grid)
  const handleResetGrid = () => {
    setCellFormulas({});
    setCellValues({});
    setFormulaInput('');
    const starterCell = mission?.starterContent?.targetCell || 'E2';
    setSelectedCell(starterCell);
    showNotification('info', 'Đã đặt lại toàn bộ bảng tính về trạng thái ban đầu.');
  };

  // 3. Mở gợi ý cấp tiếp theo (Progressive Hints)
  const handleUnlockNextHint = () => {
    setHintsUnlockedCount((prev) => prev + 1);
  };

  // 4. Nộp bài vụ án (Submit Answer - Step 3.4)
  const handleSubmitAnswer = async () => {
    const starterCell = mission?.starterContent?.targetCell || 'E2';
    const userFormula = cellFormulas[starterCell] || formulaInput;

    if (!userFormula || !userFormula.trim()) {
      showNotification('warning', `Bạn chưa nhập công thức tính cho ô mục tiêu ${starterCell}.`);
      return;
    }

    setIsSubmitting(true);
    handleFormulaSubmit();

    try {
      const currentUser = await mockAuthService.getCurrentUser();
      const sheetData = getSheetDataMap();

      const res = await mockSubmissionService.submitExcelMission({
        userId: currentUser?.data?.id || 'guest',
        missionId,
        userFormula,
        sheetData,
        hintsUnlockedCount,
      });

      setIsSubmitting(false);

      if (res.data) {
        setSubmissionResult(res.data);
        setShowResultModal(true);
      } else {
        showNotification('error', res.error || 'Có lỗi xảy ra khi nộp bài.');
      }
    } catch (_err) {
      console.error('[ERROR handleSubmitAnswer]', _err);
      setIsSubmitting(false);
      showNotification('error', 'Không thể kết nối đến hệ thống nộp bài.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-4 sm:p-6" aria-busy="true" aria-label="Đang tải dữ liệu bài học">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-[420px] w-full rounded-2xl" />
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
  const hintsData = mission.starterContent?.hints || mission.starterContent?.hint;
  const netXp = Math.max(0, (mission.rewardXp || 100) - hintsUnlockedCount * 15);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] space-y-5 animate-fade-in pb-12">
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

        {/* Action Controls & Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Briefing Button */}
          <button
            onClick={() => setShowBriefing(!showBriefing)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-sm cursor-pointer"
          >
            <FileText className="size-4" />
            <span>{showBriefing ? 'Ẩn hồ sơ vụ án' : 'Xem hồ sơ vụ án & bối cảnh'}</span>
            <ChevronDown className={`size-4 transition-transform duration-200 ${showBriefing ? 'rotate-180' : ''}`} />
          </button>

          {/* XP Badge */}
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            <Award className="size-4" />
            <span>+{netXp} XP</span>
            {hintsUnlockedCount > 0 && (
              <span className="text-[10px] text-rose-500 font-semibold">(-{hintsUnlockedCount * 15})</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
            <Clock className="size-3.5" />
            <span>{formatDuration(mission.estimatedDuration)}</span>
          </div>
        </div>
      </div>

      {/* ── Feedback Toast Notification ── */}
      {feedbackToast && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs sm:text-sm font-semibold shadow-md animate-fade-in ${
            feedbackToast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : feedbackToast.type === 'warning'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : feedbackToast.type === 'error'
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
              : 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{feedbackToast.message}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ── Compact Sticky Objective Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 font-mono text-xs font-bold text-amber-950 shadow-xs shrink-0">
            <Sparkles className="size-3.5 fill-current" /> Ô mục tiêu: {starterCell}
          </span>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {mission.objective}
          </p>
        </div>

        <button
          onClick={() => setShowBriefing(!showBriefing)}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto cursor-pointer"
        >
          <HelpCircle className="size-3.5" />
          <span>{showBriefing ? 'Thu gọn hồ sơ' : 'Chi tiết vụ án'}</span>
        </button>
      </div>

      {/* ── Primary Interactive Controls: Action Toolbar & Formula Bar (Ngay phía dưới Mục tiêu) ── */}
      <div className="space-y-3">
        {/* Action Toolbar Component (Thanh thao tác Nộp bài, Chạy thử công thức nằm trên) */}
        <ActionToolbar
          onRun={handleRunFormula}
          onSubmit={handleSubmitAnswer}
          onReset={handleResetGrid}
          onToggleHint={() => setShowHintPanel(!showHintPanel)}
          hintCount={3}
          hintsUnlockedCount={hintsUnlockedCount}
          isEvaluating={isEvaluating}
          isSubmitting={isSubmitting}
        />

        {/* Formula Bar Component (Thanh nhập công thức kết nối liền kề với Bảng tính phía dưới) */}
        <FormulaBar
          selectedCell={selectedCell}
          formula={formulaInput}
          onChange={handleFormulaChange}
          onSubmit={handleFormulaSubmit}
          isTargetCell={selectedCell === starterCell}
        />
      </div>

      {/* ── Collapsible Mission Briefing Drawer (Phần phụ) ── */}
      {showBriefing && (
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-md space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-4 text-amber-500" />
              <span>Hồ sơ bối cảnh & Yêu cầu điều tra</span>
            </div>
            <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              Mục tiêu: {starterCell}
            </span>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-start">
            {/* Story & Narrative */}
            <div className="md:col-span-8 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Câu chuyện trinh thám
              </h3>
              <p className="text-sm leading-relaxed text-foreground italic border-l-2 border-primary/50 pl-3.5 py-1 bg-muted/30 rounded-r-xl">
                "{mission.story}"
              </p>
              <p className="text-xs text-muted-foreground">
                Hãy chọn ô <strong className="text-foreground font-mono">{starterCell}</strong> trên bảng tính phía dưới và nhập công thức thích hợp để giải quyết nghi vấn.
              </p>
            </div>

            {/* Dataset Metadata */}
            {dataset && (
              <div className="md:col-span-4 rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    <Database className="size-4 text-primary" />
                    <span>Dữ liệu điều tra</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">v{dataset.version}</span>
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
        </div>
      )}

      {/* ── Progressive Hint Drawer (Step 3.3) ── */}
      {showHintPanel && (
        <HintPanel
          hints={hintsData}
          hintsUnlockedCount={hintsUnlockedCount}
          onUnlockNextHint={handleUnlockNextHint}
          baseXp={mission.rewardXp || 100}
          penaltyPerHint={15}
          onClose={() => setShowHintPanel(false)}
        />
      )}

      {/* ── Full Width Spreadsheet Grid Component ── */}
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

      {/* ── Mission Result Modal Popup (Step 3.4) ── */}
      <MissionResultModal
        isOpen={showResultModal}
        result={submissionResult}
        onClose={() => setShowResultModal(false)}
        onNextMission={() => {
          setShowResultModal(false);
          navigate('/map');
        }}
        onRetry={() => {
          setShowResultModal(false);
        }}
      />
    </div>
  );
}
