import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';
import { onboardingService, ONBOARDING_STATUS, progressService } from '../../services/index.js';
import {
  TUTORIAL_CASE_0,
  TUTORIAL_XP,
  checkTutorialAnswer,
} from './tutorialCase0Content.js';
import { FormulaBar } from '../../components/excel/FormulaBar.jsx';
import { SpreadsheetGrid } from '../../components/excel/SpreadsheetGrid.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { analyzeExcelFormula } from '../../utils/excelChecker.js';
import { OnboardingSpotlight } from './OnboardingSpotlight.jsx';

/**
 * TutorialCase0Page — Focused Minimal Workspace for Tutorial Case 0 (Step 6.5.4)
 *
 * Giao diện thực hành hướng dẫn tối giản:
 *  - Không có sidebar nav phức tạp
 *  - Gắn đúng các ID phục vụ Spotlight (Step 6.5.5):
 *    - #tutorial-briefing-panel
 *    - #tutorial-dataset-grid
 *    - #tutorial-formula-bar
 *    - #tutorial-submit-btn
 */
export function TutorialCase0Page() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [selectedCell, setSelectedCell] = useState('E2');
  const [formulaInput, setFormulaInput] = useState('');
  const [cellFormulas, setCellFormulas] = useState({});
  const [cellValues, setCellValues] = useState({});
  const [formulaDiagnostic, setFormulaDiagnostic] = useState(null);

  const [feedback, setFeedback] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(true);

  // ── Route Guards ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu user đã COMPLETED hoặc SKIPPED từ trước (và không ở màn hình kết quả hiện tại) → redirect về dashboard
  if (onboardingService.isTerminal(user.id) && !isCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Grid & Formula Handlers ───────────────────────────────────────────────

  const getSheetDataMap = () => {
    const { dataset } = TUTORIAL_CASE_0;
    const map = {};
    const colLetters = dataset.columns.map((_, i) => String.fromCharCode(65 + i));

    dataset.rows.forEach((row, rIdx) => {
      const excelRow = rIdx + 2;
      dataset.columns.forEach((col, cIdx) => {
        const addr = `${colLetters[cIdx]}${excelRow}`;
        map[addr] = row[col.key];
      });
    });

    return { ...map, ...cellValues };
  };

  const handleCellSelect = (cellAddr) => {
    setSelectedCell(cellAddr);
    setFormulaInput(cellFormulas[cellAddr] || '');
    setFormulaDiagnostic(null);
  };

  const handleFormulaChange = (newFormula) => {
    setFormulaInput(newFormula);
    setFeedback(null);
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
  };

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

  // ── Submission Handler ────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const userAnswer = cellFormulas['E2'] || formulaInput;
    const evaluation = checkTutorialAnswer(userAnswer);

    handleFormulaSubmit(userAnswer);

    if (evaluation.isCorrect) {
      // Trao thưởng XP qua progressService (idempotent ledger transaction)
      await progressService.awardXp({
        learnerId: user.id,
        contentId: TUTORIAL_CASE_0.id,
        contentType: 'tutorial',
        mode: 'onboarding',
        submissionResult: {
          isCorrect: true,
          score: 100,
        },
        question: {
          xp: TUTORIAL_XP,
        },
      });

      setFeedback({ type: 'success', message: evaluation.feedback });
      setIsCompleted(true);
      // Đánh dấu trạng thái COMPLETED
      onboardingService.setStatus(user.id, ONBOARDING_STATUS.COMPLETED);
    } else {
      setFeedback({ type: 'error', message: evaluation.feedback });
    }
  };

  const handleSkip = () => {
    onboardingService.setStatus(user.id, ONBOARDING_STATUS.SKIPPED);
    navigate('/dashboard', { replace: true });
  };

  const handleFinish = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleReset = () => {
    setFormulaInput('');
    setCellFormulas({});
    setCellValues({});
    setFormulaDiagnostic(null);
    setFeedback(null);
    setIsCompleted(false);
    setSelectedCell('E2');
  };

  const { briefing, dataset, workspace } = TUTORIAL_CASE_0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* ── Focused Top Header ── */}
      <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap className="size-4 fill-current" />
          </span>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Vụ án #00 · Hướng dẫn nhập môn
            </p>
            <h1 className="text-sm font-bold text-foreground">
              {briefing.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSpotlight(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Xem lại các bước hướng dẫn"
          >
            <Sparkles className="size-3.5" />
            <span>Hướng dẫn</span>
          </button>

          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            +{TUTORIAL_XP} XP
          </span>

          <button
            onClick={toggleTheme}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
          </button>

          {!isCompleted && (
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-all px-2 py-1"
            >
              Bỏ qua tutorial
            </button>
          )}
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* 1. Briefing Banner (#tutorial-briefing-panel) */}
        <div
          id="tutorial-briefing-panel"
          className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 shadow-xs space-y-2.5 relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="size-4 text-amber-500" />
              <span>Nhiệm vụ: {briefing.objective}</span>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="size-3.5" />
              <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý đáp án'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-foreground italic border-l-2 border-primary/50 pl-3 py-1 bg-muted/30 rounded-r-lg">
            "{briefing.story}"
          </p>

          {showHint && (
            <div className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-center gap-2">
              <Sparkles className="size-3.5 shrink-0" />
              <span>{briefing.hint}</span>
            </div>
          )}
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-xs sm:text-sm font-semibold animate-fade-in ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="size-4 shrink-0 text-rose-500" />
              )}
              <span>{feedback.message}</span>
            </div>

            {isCompleted && (
              <Button
                size="sm"
                onClick={handleFinish}
                className="gap-1.5 shadow-sm shrink-0"
              >
                Vào Dashboard
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* 2. Formula Bar (#tutorial-formula-bar) */}
        <div id="tutorial-formula-bar">
          <FormulaBar
            selectedCell={selectedCell}
            formula={formulaInput}
            onChange={handleFormulaChange}
            onSubmit={handleFormulaSubmit}
            isTargetCell={selectedCell === workspace.targetCell}
            diagnostic={formulaDiagnostic}
            disabled={isCompleted}
          />
        </div>

        {/* 3. Dataset Grid (#tutorial-dataset-grid) */}
        <div id="tutorial-dataset-grid" className="flex-1 border border-border rounded-2xl overflow-hidden bg-card">
          <SpreadsheetGrid
            dataset={dataset}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
            targetCell={workspace.targetCell}
            cellFormulas={cellFormulas}
            cellValues={cellValues}
            editableCells={['E2']}
          />
        </div>

        {/* 4. Action Bar Footer (#tutorial-submit-btn) */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={handleReset}
            disabled={isCompleted}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Làm lại
          </button>

          {!isCompleted ? (
            <Button
              id="tutorial-submit-btn"
              onClick={handleSubmit}
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20"
            >
              Nộp bài kiểm tra
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              size="lg"
              className="gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Hoàn thành & Vào Dashboard
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </main>

      {/* ── Guided Spotlight Tour (Step 6.5.5) ── */}
      <OnboardingSpotlight
        steps={TUTORIAL_CASE_0.spotlightSteps}
        isOpen={showSpotlight}
        onComplete={() => setShowSpotlight(false)}
        onSkip={() => setShowSpotlight(false)}
      />
    </div>
  );
}
