import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Sparkles,
  Clock,
  FileSpreadsheet,
  ChevronDown,
  FileText,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { missionService, submissionService } from '../../services/index.js';
import { Skeleton, ExcelMissionSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { formatDuration } from '../../utils/format.js';
import { FormulaBar } from '../../components/excel/FormulaBar.jsx';
import { SpreadsheetGrid } from '../../components/excel/SpreadsheetGrid.jsx';
import { HintPanel } from '../../components/excel/HintPanel.jsx';
import { MissionResultModal } from '../../components/excel/MissionResultModal.jsx';
import { WorkspaceSplitPane } from '../../components/workspace/WorkspaceSplitPane.jsx';
import { ProblemPane } from '../../components/workspace/ProblemPane.jsx';
import { MissionActionBar } from '../../components/workspace/MissionActionBar.jsx';
import { analyzeExcelFormula, validateGlobalExcelMission, shiftFormulaRows, EXCEL_MISSION_SOLUTIONS } from '../../utils/excelChecker.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useProgress } from '../../hooks/useProgress.js';
import { useFocusMode } from '../../app/layouts/FocusLayout.jsx';
function createClientAttemptId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ExcelMissionPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPractice = location.state?.mode === 'practice';
  
  const { user } = useAuth();
  const { progressList, awardXp } = useProgress(user?.id);
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mission, setMission] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [adjacentMissions, setAdjacentMissions] = useState({ prev: null, next: null });

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
  const formulaInputRef = useRef(null);

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

        // Tải danh sách nhiệm vụ trong cùng chương để hỗ trợ điều hướng trước/sau
        if (loadedMission.chapterId) {
          try {
            const chapRes = await missionService.getMissionsByChapter(loadedMission.chapterId);
            if (chapRes?.data && chapRes.data.length > 0) {
              const list = chapRes.data;
              const idx = list.findIndex((m) => m.id === loadedMission.id);
              const prevM = idx > 0 ? list[idx - 1] : null;
              const nextM = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
              if (isMounted) {
                setAdjacentMissions({ prev: prevM, next: nextM });
              }
            }
          } catch {
            // Không chặn việc học nếu lỗi lấy danh sách phụ
          }
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

  // Auto-populate completed solution grid data if mission is completed & grid is empty
  useEffect(() => {
    if (!dataset || !dataset.rows || !dataset.columns || Object.keys(cellFormulas).length > 0) return;

    const isCompleted = Boolean(
      progressList?.some((p) => p.contentId === missionId && p.status === 'completed')
    );

    if (isCompleted) {
      const solutionInfo = EXCEL_MISSION_SOLUTIONS[missionId];
      if (solutionInfo) {
        const targetCell = solutionInfo.targetCell || mission?.starterContent?.targetCell || 'E2';
        const sourceFormula = solutionInfo.formula;
        const match = targetCell.match(/^([A-Z]+)([0-9]+)$/i);

        const colLetters = dataset.columns.map((_, i) => String.fromCharCode(65 + i));
        const map = {};
        dataset.rows.forEach((row, rIdx) => {
          const excelRow = rIdx + 2;
          dataset.columns.forEach((col, cIdx) => {
            const addr = `${colLetters[cIdx]}${excelRow}`;
            map[addr] = row[col.key];
          });
        });

        const newFormulas = { [targetCell]: sourceFormula };
        const newValues = {};
        const diag = analyzeExcelFormula(sourceFormula, map);
        if (diag.valid) newValues[targetCell] = diag.value;

        if (match) {
          const colLetter = match[1].toUpperCase();
          const sourceRow = parseInt(match[2], 10);
          dataset.rows.forEach((_, idx) => {
            const targetRow = idx + 2;
            if (targetRow === sourceRow) return;
            const cellAddr = `${colLetter}${targetRow}`;
            const shifted = shiftFormulaRows(sourceFormula, sourceRow, targetRow);
            newFormulas[cellAddr] = shifted;
            const shiftedDiag = analyzeExcelFormula(shifted, { ...map, ...newValues });
            if (shiftedDiag.valid) newValues[cellAddr] = shiftedDiag.value;
          });
        }

        setCellFormulas(newFormulas);
        setCellValues(newValues);
        setSelectedCell(targetCell);
        setFormulaInput(sourceFormula);
      }
    }
  }, [dataset, progressList, missionId, mission, cellFormulas]);

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
    setTimeout(() => formulaInputRef.current?.focus(), 0);
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

    const targetStarterCell = mission?.starterContent?.targetCell || 'E2';
    const match = targetStarterCell.match(/^([A-Z]+)([0-9]+)$/i);
    let currentRequiredRange = [targetStarterCell];
    if (match && dataset?.rows) {
      const colLetter = match[1].toUpperCase();
      const startRow = parseInt(match[2], 10);
      currentRequiredRange = dataset.rows.map((_, idx) => `${colLetter}${startRow + idx}`);
    }

    const validation = validateGlobalExcelMission({
      cellFormulas,
      cellValues,
      starterCell: targetStarterCell,
      requiredRange: currentRequiredRange,
      sheetData: getSheetDataMap(),
    });

    setTimeout(() => {
      setIsEvaluating(false);
      showNotification(validation.status, validation.message);
    }, 250);
  };

  // 1.5. Thao tác Kéo công thức xuống (Fill Down / Auto-fill across required data rows)
  const handleFillDown = (fromCell) => {
    const sourceCell = typeof fromCell === 'string' ? fromCell : selectedCell || mission?.starterContent?.targetCell || 'E2';
    const sourceFormula = cellFormulas[sourceCell] || (sourceCell === selectedCell ? formulaInput : '');

    if (!sourceFormula || !sourceFormula.trim()) {
      showNotification('warning', `Vui lòng nhập công thức tại ô ${sourceCell} trước khi kéo Fill down.`);
      return;
    }

    const cellMatch = sourceCell.match(/^([A-Z]+)([0-9]+)$/i);
    if (!cellMatch || !dataset?.rows) return;

    const colLetter = cellMatch[1].toUpperCase();
    const sourceRow = parseInt(cellMatch[2], 10);

    const newFormulas = { ...cellFormulas };
    const newValues = { ...cellValues };
    const currentSheetData = getSheetDataMap();

    let filledCount = 0;
    dataset.rows.forEach((_, idx) => {
      const targetRow = idx + 2; // Data row starts at row 2
      if (targetRow === sourceRow) return;

      const targetCellAddr = `${colLetter}${targetRow}`;
      const shiftedFormula = shiftFormulaRows(sourceFormula, sourceRow, targetRow);

      newFormulas[targetCellAddr] = shiftedFormula;
      const diagnostic = analyzeExcelFormula(shiftedFormula, { ...currentSheetData, ...newValues });
      if (diagnostic.valid) {
        newValues[targetCellAddr] = diagnostic.value;
      }
      filledCount += 1;
    });

    setCellFormulas(newFormulas);
    setCellValues(newValues);
    showNotification(
      'success',
      `Đã áp dụng (Fill down) công thức cho ${filledCount} ô còn lại (từ hàng ${sourceRow + 1} đến ${sourceRow + filledCount})!`
    );
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
        mode: isPractice ? 'practice' : 'submit',
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

      // --- Progress & XP Integration Boundary (Optimistic) ---
      if (res.data) {
        if (res.data?.isCorrect && (res.data.stepCompleted || res.data.missionCompleted)) {
          const isAlreadyCompleted = progressList.some(p => p.contentId === missionId && p.status === 'completed');
          const optimisticXpAwarded = isAlreadyCompleted ? 0 : (res.data.potentialXp || 50);
          const optimisticIsFirstCompletion = !isAlreadyCompleted;

          const initialSubmissionResult = {
            ...res.data,
            optimisticXp: optimisticXpAwarded,
            isFirstCompletion: optimisticIsFirstCompletion,
            persistenceStatus: 'pending',
          };

          setSubmissionResult(initialSubmissionResult);
          setShowResultModal(true);

          // Background Persistence
          awardXp({
            contentId: missionId,
            contentType: 'question',
            mode: isPractice ? 'practice' : 'main_quest',
            submissionResult: res.data,
            hintsUsed: hintsUnlockedCount,
          }).then(progressRes => {
            if (!isMountedRef.current) return;
            if (progressRes?.error) {
              setSubmissionResult(prev => prev ? { ...prev, persistenceStatus: 'failed' } : prev);
            } else if (progressRes?.data) {
              setSubmissionResult(prev => prev ? {
                ...prev,
                xpAwarded: progressRes.data.xpAwarded,
                isFirstCompletion: progressRes.data.isFirstCompletion,
                persistenceStatus: 'saved',
              } : prev);
            }
          }).catch(() => {
            if (!isMountedRef.current) return;
            setSubmissionResult(prev => prev ? { ...prev, persistenceStatus: 'failed' } : prev);
          });
        } else {
          setSubmissionFeedback({
            type: 'incorrect',
            message: res.data?.feedback || 'Câu trả lời chưa chính xác. Hãy kiểm tra và thử lại.',
          });
        }
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
    return <ExcelMissionSkeleton />;
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

  const isMissionCompleted = Boolean(
    progressList?.some((p) => p.contentId === missionId && p.status === 'completed') ||
    (submissionResult?.isCorrect && (submissionResult?.stepCompleted || submissionResult?.missionCompleted))
  );

  const activeCellFormula = cellFormulas[selectedCell] || (selectedCell === starterCell && formulaInput.trim().startsWith('=') ? formulaInput : '');
  const canFillDown = Boolean(activeCellFormula && activeCellFormula.trim());

  const matchStarter = starterCell.match(/^([A-Z]+)([0-9]+)$/i);
  let requiredRange = [starterCell];
  if (matchStarter && dataset?.rows) {
    const colLetter = matchStarter[1].toUpperCase();
    const startRow = parseInt(matchStarter[2], 10);
    requiredRange = dataset.rows.map((_, idx) => `${colLetter}${startRow + idx}`);
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-background text-foreground animate-fade-in">
      {/* ── Khu vực thông báo phản hồi (nếu có lỗi hoặc feedback) ── */}
      {(feedbackToast || submissionFeedback || submissionError) && (
        <div className="shrink-0 space-y-1.5 pb-1.5 px-1" role="region" aria-label="Thông báo hệ thống">
          {feedbackToast && (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl border p-2 text-xs sm:text-sm font-semibold shadow-xs ${
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

          {submissionFeedback && (
            <div
              role="status"
              className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold ${
                submissionFeedback.type === 'validation'
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
              className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between"
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
                  className="shrink-0 rounded-lg border border-current px-2.5 py-1 text-xs font-bold hover:bg-rose-500/10 disabled:opacity-50 cursor-pointer"
                >
                  Thử nộp lại
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Split-Pane IDE Architecture (Sprint 9) ── */}
      <WorkspaceSplitPane
        className="flex-1 min-h-0"
        leftTitle="Hồ sơ vụ án"
        rightTitle="Bảng tính Excel"
        isFocusMode={isFocusMode}
        onToggleFocusMode={toggleFocusMode}
        leftContent={
          <ProblemPane
            title={mission.title}
            tool="excel"
            isPractice={isPractice}
            missionId={mission.id}
            story={mission.story}
            objective={mission.objective}
            targetCell={starterCell}
            isCompleted={isMissionCompleted}
            rewardXp={mission.rewardXp || 100}
            hintsUnlockedCount={hintsUnlockedCount}
            estimatedDuration={mission.estimatedDuration}
            adjacentMissions={adjacentMissions}
            hints={hintsData}
            onUnlockNextHint={handleUnlockNextHint}
            pinnedHint={pinnedHint}
            onPinHint={handlePinHint}
          />
        }
        rightContent={
          <div className="flex flex-col h-full overflow-hidden bg-background">
            {/* Top: Formula Bar (Thanh nhập fx chuẩn bảng tính) */}
            <div className="p-2 border-b border-border bg-card shrink-0">
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
                inputRef={formulaInputRef}
                onRun={handleRunFormula}
                onSubmitAnswer={handleSubmitAnswer}
                onReset={handleResetGrid}
                onFillDown={() => handleFillDown(selectedCell)}
                canFillDown={canFillDown}
                isEvaluating={isEvaluating}
                isSubmitting={isSubmitting}
                isCompleted={isMissionCompleted}
                showActions={true}
              />
            </div>

            {/* Middle: Spreadsheet Grid (Canvas lấp đầy không gian làm việc) */}
            <div className="flex-1 min-h-0 overflow-hidden p-2">
              {dataset ? (
                <SpreadsheetGrid
                  dataset={dataset}
                  selectedCell={selectedCell}
                  onCellSelect={handleCellSelect}
                  onFillDown={handleFillDown}
                  targetCell={starterCell}
                  cellFormulas={cellFormulas}
                  cellValues={cellValues}
                  editableCells={requiredRange}
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card p-6">
                  <p className="text-xs text-muted-foreground">Không có dữ liệu bảng tính.</p>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* ── LeetCode-style Isolated Action Footer ── */}
      <MissionActionBar
        onSubmit={handleSubmitAnswer}
        isSubmitting={isSubmitting}
        isCompleted={isMissionCompleted}
        adjacentMissions={adjacentMissions}
        isPractice={isPractice}
        missionProgress={mission?.id ? `Vụ án: ${mission.id}` : null}
        submitIcon="zap"
      />

      {/* ── Mission Result Modal Popup (Step 3.4) ── */}
      <MissionResultModal
        isOpen={showResultModal}
        result={submissionResult}
        missionTitle={mission.title}
        onClose={() => setShowResultModal(false)}
        hasNextMission={Boolean(adjacentMissions.next)}
        onNextMission={() => {
          setShowResultModal(false);
          if (adjacentMissions.next) {
            const nextPath = adjacentMissions.next.tool === 'sql'
              ? `/missions/${adjacentMissions.next.id}/sql`
              : `/missions/${adjacentMissions.next.id}/workspace`;
            navigate(isPractice ? `/practice?mission=${adjacentMissions.next.id}` : nextPath);
          } else {
            navigate(isPractice ? '/practice' : '/map');
          }
        }}
      />
    </div>
  );
}
