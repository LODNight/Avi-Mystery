import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Sparkles,
  Clock,
  FileSpreadsheet,
  ChevronDown,
  FileText,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { missionService, submissionService } from '../../services/index.js';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDuration } from '../../utils/format.js';
import { FormulaBar } from '../../components/excel/FormulaBar.jsx';
import { SpreadsheetGrid } from '../../components/excel/SpreadsheetGrid.jsx';
import { ActionToolbar } from '../../components/excel/ActionToolbar.jsx';
import { HintPanel } from '../../components/excel/HintPanel.jsx';
import { MissionResultModal } from '../../components/excel/MissionResultModal.jsx';
import { analyzeExcelFormula, validateGlobalExcelMission } from '../../utils/excelChecker.js';

function createClientAttemptId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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
  // activeUnlockedHint = nội dung đang hiển thị trên FormulaBar (ghim từ HintPanel)
  const [activeUnlockedHint, setActiveUnlockedHint] = useState(null);
  // pinnedHint = hint nào đang được chọn/ghim trong HintPanel (để highlight card)
  const [pinnedHint, setPinnedHint] = useState(null);

  // State quản lý phản hồi thông báo (Feedback Toast)
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const isMountedRef = useRef(true);
  const submitInFlightRef = useRef(false);
  const notificationTimerRef = useRef(null);
  const hintTriggerRef = useRef(null);
  const hintCloseButtonRef = useRef(null);

  // State quản lý Popup Kết quả nộp bài (Step 3.4)
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // State quản lý Bảng tính Excel Interactive (LRN-EXCEL-002)
  const [selectedCell, setSelectedCell] = useState('E2');
  const [formulaInput, setFormulaInput] = useState('');
  const [formulaDiagnostic, setFormulaDiagnostic] = useState(null);
  const [cellFormulas, setCellFormulas] = useState({});
  const [cellValues, setCellValues] = useState({});

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const closeHintPanel = useCallback(() => {
    setShowHintPanel(false);
    hintTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showHintPanel) return undefined;

    hintCloseButtonRef.current?.focus();
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeHintPanel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeHintPanel, showHintPanel]);

  useEffect(() => {
    let isMounted = true;

    setShowHintPanel(false);
    setHintsUnlockedCount(0);
    setActiveUnlockedHint(null);
    setPinnedHint(null);
    setFeedbackToast(null);
    setFormulaInput('');
    setFormulaDiagnostic(null);
    setCellFormulas({});
    setCellValues({});
    setSubmissionFeedback(null);
    setSubmissionError(null);
    setSubmissionResult(null);
    setShowResultModal(false);

    async function loadMissionAndDataset() {
      setLoading(true);
      setError(null);

      try {
        const missionRes = await missionService.getMission(missionId);
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
          const datasetRes = await missionService.getDataset(loadedMission.datasetId);
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
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setFeedbackToast(null);
    }, 4000);
  };

  // Xử lý khi chọn một ô tính trên bảng
  const handleCellSelect = (cellAddr) => {
    setSelectedCell(cellAddr);
    setFormulaInput(cellFormulas[cellAddr] || '');
    setFormulaDiagnostic(null);
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
    setSubmissionFeedback(null);
    setSubmissionError(null);

    setCellFormulas((prev) => ({
      ...prev,
      [selectedCell]: newFormula,
    }));

    if (!newFormula.trim()) {
      setFormulaDiagnostic(null);
      setCellValues((prev) => {
        const next = { ...prev };
        delete next[selectedCell];
        return next;
      });
      return;
    }

    setFormulaDiagnostic(null);
  };

  // Xử lý khi nhấn nút Áp dụng hoặc phím Enter
  const handleFormulaSubmit = (targetFormula) => {
    const formulaToUse =
      typeof targetFormula === 'string' && targetFormula.trim()
        ? targetFormula
        : formulaInput;
    const diagnostic = analyzeExcelFormula(formulaToUse, getSheetDataMap());
    setFormulaDiagnostic(diagnostic);
    setCellValues((prev) => {
      const next = { ...prev };
      if (diagnostic.valid) next[selectedCell] = diagnostic.value;
      else delete next[selectedCell];
      return next;
    });
    return diagnostic;
  };

  // ── Step 3.3 Action Toolbar Handlers ──

  // 1. Chạy thử công thức (Macro-action: Global Test Cases Pre-check Validator)
  const handleRunFormula = () => {
    setIsEvaluating(true);
    handleFormulaSubmit();

    const starterCell = mission?.starterContent?.targetCell || 'E2';
    const match = starterCell.match(/^([A-Z]+)([0-9]+)$/i);
    let requiredRange = [starterCell];
    if (match && dataset?.rows) {
      const colLetter = match[1].toUpperCase();
      const startRow = parseInt(match[2], 10);
      requiredRange = dataset.rows.map((_, idx) => `${colLetter}${startRow + idx}`);
    }

    const validation = validateGlobalExcelMission({
      cellFormulas,
      cellValues,
      starterCell,
      requiredRange,
      sheetData: getSheetDataMap(),
    });

    setTimeout(() => {
      setIsEvaluating(false);
      showNotification(validation.status, validation.message);
    }, 250);
  };

  // 2. Đặt lại bảng tính (Reset Grid)
  const handleResetGrid = () => {
    setCellFormulas({});
    setCellValues({});
    setFormulaInput('');
    setFormulaDiagnostic(null);
    setSubmissionFeedback(null);
    setSubmissionError(null);
    setSubmissionResult(null);
    setShowResultModal(false);
    setActiveUnlockedHint(null);
    setPinnedHint(null);
    const starterCell = mission?.starterContent?.targetCell || 'E2';
    setSelectedCell(starterCell);
    showNotification('info', 'Đã đặt lại toàn bộ bảng tính về trạng thái ban đầu.');
  };

  // 3. Mở gợi ý cấp tiếp theo (Progressive Hints & Solution 1: Inline Hint)
  const handleUnlockNextHint = () => {
    const nextCount = hintsUnlockedCount + 1;
    setHintsUnlockedCount(nextCount);

    const missionHints = mission?.hints || hintsData;
    const normalizedHints = Array.isArray(missionHints) && missionHints.length > 0
      ? missionHints
      : typeof missionHints === 'string' && missionHints.trim()
      ? [
          'Hãy xác định các ô chứa thông tin Số lượng và Đơn giá của mặt hàng.',
          'Sử dụng phép nhân (*) trong Excel giữa cột Số lượng (C) và Đơn giá (D).',
          missionHints,
        ]
      : [
          'Xác định thông tin dữ liệu đầu vào trong bảng tính.',
          'Sử dụng phép tính Excel phù hợp (phép cộng +, trừ -, nhân *, chia /).',
          'Cú pháp công thức Excel bắt đầu bằng dấu "=".',
        ];

    const newlyUnlockedHintText = normalizedHints[nextCount - 1] || normalizedHints[0];
    // Tự động ghim gợi ý mới nhất lên FormulaBar khi mở khóa
    setActiveUnlockedHint(newlyUnlockedHintText);
    setPinnedHint(newlyUnlockedHintText);
  };

  // onPinHint: Khi người dùng click vào một hint card đã mở khóa để ghim lên FormulaBar
  const handlePinHint = (hintText) => {
    if (pinnedHint === hintText) {
      // Toggle: bấm lại cùng gợi ý sẽ gỡ ghim
      setPinnedHint(null);
      setActiveUnlockedHint(null);
    } else {
      setPinnedHint(hintText);
      setActiveUnlockedHint(hintText);
    }
  };

  // 4. Nộp bài vụ án (Submit Answer - Step 3.4)
  const handleSubmitAnswer = async () => {
    if (submitInFlightRef.current) return;

    const starterCell = mission?.starterContent?.targetCell || 'E2';
    const userFormula = cellFormulas[starterCell] || formulaInput;

    const diagnostic = analyzeExcelFormula(userFormula, getSheetDataMap());
    if (!diagnostic.valid) {
      setFormulaDiagnostic(diagnostic);
      setSubmissionFeedback(null);
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);
    setSubmissionFeedback(null);
    setSubmissionError(null);
    handleFormulaSubmit(userFormula);

    try {
      const sheetData = getSheetDataMap();

      const res = await submissionService.submit({
        mode: 'submit',
        missionId,
        tool: mission?.tool || 'excel',
        answer: { formula: userFormula, sheetData },
        hintsUsed: hintsUnlockedCount,
        clientAttemptId: createClientAttemptId(),
      });

      if (!isMountedRef.current) return;

      if (res.error) {
        setSubmissionError(res.error);
        return;
      }

      if (res.data?.isCorrect && (res.data.stepCompleted || res.data.missionCompleted)) {
        setSubmissionResult(res.data);
        setShowResultModal(true);
      } else {
        setSubmissionFeedback({
          type: 'incorrect',
          message: res.data?.feedback || 'Câu trả lời chưa chính xác. Hãy kiểm tra và thử lại.',
        });
      }
    } catch (submitError) {
      if (!isMountedRef.current) return;
      setSubmissionError({
        code: 'SERVICE_UNAVAILABLE',
        message: submitError?.message || 'Không thể kết nối đến hệ thống nộp bài.',
        retryable: true,
      });
    } finally {
      submitInFlightRef.current = false;
      if (isMountedRef.current) setIsSubmitting(false);
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
  const potentialXp = Math.max(0, (mission.rewardXp || 100) - hintsUnlockedCount * 15);

  return (
    <div className={`flex flex-col min-h-[calc(100vh-5rem)] space-y-5 animate-fade-in pb-12 transition-all duration-300 ${
      showHintPanel ? 'xl:pr-[410px]' : ''
    }`}>
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

          {/* Potential XP preview */}
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            <Award className="size-4" />
            <span>Dự kiến +{potentialXp} XP</span>
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

      {/* ── Collapsible Mission Briefing Drawer (Nằm ngay dưới Tiêu đề chính, 100% width) ── */}
      {showBriefing && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="size-4 text-amber-500" />
              <span>Hồ sơ bối cảnh vụ án</span>
            </div>
            <button
              onClick={() => setShowBriefing(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Thu gọn ▲
            </button>
          </div>

          <div className="space-y-2">
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
        </div>
      )}

      {/* ── Nhóm 1: Mục tiêu vụ án & Thanh thao tác hành động ── */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-card p-3 space-y-3 shadow-xs">
        {/* 1. Compact Sticky Objective Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 font-mono text-xs font-bold text-amber-950 shadow-2xs shrink-0">
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

        {/* Action Toolbar Component */}
        <ActionToolbar
          onRun={handleRunFormula}
          onSubmit={handleSubmitAnswer}
          onReset={handleResetGrid}
          onToggleHint={() => setShowHintPanel(!showHintPanel)}
          hintButtonRef={hintTriggerRef}
          hintCount={3}
          hintsUnlockedCount={hintsUnlockedCount}
          isEvaluating={isEvaluating}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* ── Nhóm 2: Thông báo phản hồi & Thanh nhập công thức ── */}
      <div className="space-y-2.5">
        {/* Khu vực hiển thị thông báo (Luôn nằm phía trên Thanh nhập công thức) */}
        {(feedbackToast || submissionFeedback || submissionError) && (
          <div className="space-y-2 animate-fade-in" role="region" aria-label="Thông báo hệ thống">
            {feedbackToast && (
              <div
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-xs sm:text-sm font-semibold shadow-xs ${feedbackToast.type === 'success'
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

            {submissionFeedback && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold ${submissionFeedback.type === 'validation'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  }`}
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{submissionFeedback.message}</span>
              </div>
            )}

            {submissionError && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm font-semibold text-rose-700 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{submissionError.message}</span>
                </div>
                {submissionError.retryable && (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting}
                    className="shrink-0 rounded-lg border border-current px-3 py-1.5 text-xs font-bold hover:bg-rose-500/10 disabled:opacity-50"
                  >
                    Thử nộp lại
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Formula Bar Component (Thanh nhập công thức dính liền trực tiếp phía trên Bảng tính) */}
        <FormulaBar
          selectedCell={selectedCell}
          formula={formulaInput}
          onChange={handleFormulaChange}
          onSubmit={handleFormulaSubmit}
          isTargetCell={selectedCell === starterCell}
          diagnostic={formulaDiagnostic}
          activeHint={activeUnlockedHint}
          onClearActiveHint={() => {
            setActiveUnlockedHint(null);
            setPinnedHint(null);
          }}
          disabled={isSubmitting}
        />
      </div>

      {/* ── Progressive Hint Side Drawer (Non-modal / No dark backdrop overlay) ── */}
      {showHintPanel && (
        <aside
          aria-label="Khung gợi ý"
          className="fixed bottom-0 right-0 top-20 z-40 w-full sm:w-[400px] max-w-full bg-card border-l border-amber-500/30 shadow-2xl p-4 sm:p-5 overflow-y-auto animate-in slide-in-from-right duration-300"
        >
          <HintPanel
            hints={hintsData}
            hintsUnlockedCount={hintsUnlockedCount}
            onUnlockNextHint={handleUnlockNextHint}
            baseXp={mission.rewardXp || 100}
            penaltyPerHint={15}
            onClose={closeHintPanel}
            closeButtonRef={hintCloseButtonRef}
            pinnedHint={pinnedHint}
            onPinHint={handlePinHint}
          />
        </aside>
      )}

      {/* ── Full Width Spreadsheet Grid Component (Dính liền phía dưới FormulaBar) ── */}
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
        missionTitle={mission.title}
        onClose={() => setShowResultModal(false)}
        onNextMission={() => {
          setShowResultModal(false);
          navigate('/map');
        }}
      />
    </div>
  );
}
