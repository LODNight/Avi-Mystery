import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Database,
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Layers,
  Code2,
  Info,
} from 'lucide-react';
import { WorkspaceSplitPane } from '../../components/workspace/WorkspaceSplitPane.jsx';
import { KnowledgeViewer } from '../../components/knowledge/KnowledgeViewer.jsx';
import { FormulaBar } from '../../components/excel/FormulaBar.jsx';
import { SpreadsheetGrid } from '../../components/excel/SpreadsheetGrid.jsx';
import { CellEditorOverlay } from '../../components/excel/CellEditorOverlay.jsx';
import { SqlEditor } from '../../components/sql/SqlEditor.jsx';
import { ResultViewer } from '../../components/sql/ResultViewer.jsx';
import { knowledgeService, datasetService } from '../../services/index.js';
import { analyzeExcelFormula } from '../../utils/excelChecker.js';
import { useEditingSession } from '../../hooks/useEditingSession.js';
import { createSqlEngine } from '../../utils/sql/index.js';
import { useFocusMode } from '../../app/layouts/FocusLayout.jsx';
import {
  DEFAULT_EXCEL_SANDBOX_DATASET,
  getInitialExcelSandboxCells,
  TOPIC_SANDBOX_PRESETS,
  DEFAULT_EXCEL_GENERIC_PRESETS,
  DEFAULT_SQL_GENERIC_PRESETS,
} from '../../mocks/data/sandbox/defaultSandboxDatasets.js';

export function PracticeSandboxPage() {
  const { isFocusMode, toggleFocusMode, setIsFocusMode } = useFocusMode();
  const { tool: routeTool, topicId: routeTopicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Tool: 'excel' | 'sql'
  const initialTool = routeTool || searchParams.get('tool') || 'excel';
  const [activeTool, setActiveTool] = useState(initialTool === 'sql' ? 'sql' : 'excel');

  // Topics & Active Topic
  const [topics, setTopics] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState(
    routeTopicId || searchParams.get('topicId') || ''
  );
  const [loadingTopics, setLoadingTopics] = useState(true);

  // ── Excel Sandbox State ──
  const { cellValues: initialValues, cellFormulas: initialFormulas } = useMemo(
    () => getInitialExcelSandboxCells(),
    []
  );
  const [cellValues, setCellValues] = useState(initialValues);
  const [cellFormulas, setCellFormulas] = useState(initialFormulas);
  const [selectedCell, setSelectedCell] = useState('D10');
  
  const gridContainerRef = useRef(null);
  const {
    session,
    startEditing,
    updateDraft,
    cancelEditing,
    endSession,
    setValidationState,
  } = useEditingSession();

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const cellValuesRef = useRef(cellValues);
  cellValuesRef.current = cellValues;
  const cellFormulasRef = useRef(cellFormulas);
  cellFormulasRef.current = cellFormulas;
  const selectedCellRef = useRef(selectedCell);
  selectedCellRef.current = selectedCell;

  const [excelFeedback, setExcelFeedback] = useState({
    type: 'info',
    message: 'Chọn ô bất kỳ trên bảng tính, nhập công thức vào thanh fx và nhấn Enter để tính toán.',
  });
  const [isEvaluatingExcel, setIsEvaluatingExcel] = useState(false);

  // ── SQL Sandbox State ──
  const [userSql, setUserSql] = useState('SELECT * FROM sales LIMIT 5;');
  const [sqlResult, setSqlResult] = useState(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [sqlSchema, setSqlSchema] = useState(null);
  const activeEngineRef = useRef(null);
  const isMountedRef = useRef(true);

  // Sync tool from URL params if changed
  useEffect(() => {
    setIsFocusMode(false); // Mặc định hiển thị đầy đủ cả 2 cột: Đề bài / Lý thuyết & Không gian thực hành
  }, [setIsFocusMode]);

  useEffect(() => {
    if (routeTool && (routeTool === 'excel' || routeTool === 'sql')) {
      setActiveTool(routeTool);
    }
  }, [routeTool]);

  // Load Topics from Knowledge Service
  useEffect(() => {
    let isMounted = true;
    async function loadTopics() {
      setLoadingTopics(true);
      try {
        const res = await knowledgeService.getPublishedTopics();
        if (!isMounted) return;
        if (res.data && res.data.length > 0) {
          setTopics(res.data);
          setActiveTopicId((prev) => {
            if (prev) return prev;
            // Find first topic matching active tool
            const match = res.data.find((t) => t.tool === activeTool) || res.data[0];
            return match ? match.id : '';
          });
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách bài học:', err);
      } finally {
        if (isMounted) setLoadingTopics(false);
      }
    }
    loadTopics();
    return () => {
      isMounted = false;
    };
  }, [activeTool]);

  // Pre-populate code if passed via searchParams (e.g. from "Try it" button on code blocks)
  useEffect(() => {
    const codeParam = searchParams.get('code');
    const targetCellParam = searchParams.get('targetCell');
    if (codeParam) {
      if (activeTool === 'excel') {
        if (session.status === 'IDLE') {
           startEditing(selectedCell, getCellValueForInput(selectedCell), codeParam);
        } else {
           updateDraft(codeParam);
        }
        if (targetCellParam) setSelectedCell(targetCellParam);
      } else {
        setUserSql(codeParam);
      }
    }
  }, [searchParams, activeTool]);

  // ── Cleanup SQL Engine on unmount ──
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

  // Load SQL Engine when SQL tool is selected
  const initSqlEngine = useCallback(async () => {
    if (activeEngineRef.current) return activeEngineRef.current;
    try {
      const engine = createSqlEngine();
      activeEngineRef.current = engine;
      await engine.initialize();
      const dsRes = await datasetService.getDataset('sql-sales-v1');
      if (dsRes.data && isMountedRef.current) {
        const loadRes = await engine.loadDataset(dsRes.data);
        if (loadRes.schema) setSqlSchema(loadRes.schema);
      }
      return engine;
    } catch (err) {
      console.error('Lỗi khởi tạo SQL Engine:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (activeTool === 'sql') {
      initSqlEngine();
    }
  }, [activeTool, initSqlEngine]);

  // Active topic object
  const activeTopic = useMemo(() => {
    return topics.find((t) => t.id === activeTopicId) || topics[0] || null;
  }, [topics, activeTopicId]);

  // Presets list based on topic or generic fallback
  const currentPresets = useMemo(() => {
    if (activeTopicId && TOPIC_SANDBOX_PRESETS[activeTopicId]) {
      return TOPIC_SANDBOX_PRESETS[activeTopicId].examples;
    }
    return activeTool === 'excel' ? DEFAULT_EXCEL_GENERIC_PRESETS : DEFAULT_SQL_GENERIC_PRESETS;
  }, [activeTopicId, activeTool]);

  // ── Switch Tool Handler ──
  const handleSwitchTool = (newTool) => {
    setActiveTool(newTool);
    // Find matching topic for tool
    const matchingTopic = topics.find((t) => t.tool === newTool);
    if (matchingTopic) {
      setActiveTopicId(matchingTopic.id);
    }
    setSearchParams({ tool: newTool });
  };

  // ── Select Topic Handler ──
  const handleSelectTopic = (id) => {
    setActiveTopicId(id);
    const selected = topics.find((t) => t.id === id);
    if (selected && selected.tool !== activeTool) {
      setActiveTool(selected.tool);
    }
    // Load default preset if available
    const presetConfig = TOPIC_SANDBOX_PRESETS[id];
    if (presetConfig) {
      if (presetConfig.tool === 'excel' && presetConfig.defaultFormula) {
        if (session.status === 'IDLE') {
          startEditing(presetConfig.defaultTargetCell || selectedCell, '', presetConfig.defaultFormula);
        } else {
          updateDraft(presetConfig.defaultFormula);
        }
        if (presetConfig.defaultTargetCell) setSelectedCell(presetConfig.defaultTargetCell);
      } else if (presetConfig.tool === 'sql' && presetConfig.defaultSql) {
        setUserSql(presetConfig.defaultSql);
      }
    }
  };

  // ── Excel Execution: Run Formula ──
  const handleRunExcelFormula = useCallback((customFormula, targetCellAddr) => {
    const currentSelectedCell = selectedCellRef.current;
    const cellAddr = targetCellAddr || currentSelectedCell;
    const formulaToRun = (
      customFormula !== undefined ? customFormula : sessionRef.current.draftValue
    ).trim();

    if (!formulaToRun) {
      setExcelFeedback({
        type: 'warning',
        message: 'Vui lòng nhập công thức vào ô tính (bắt đầu bằng dấu =).',
      });
      return false;
    }

    setIsEvaluatingExcel(true);

    // Build current sheetData mapping from columns & rows
    const colLetters = DEFAULT_EXCEL_SANDBOX_DATASET.columns.map((_, i) =>
      String.fromCharCode(65 + i)
    );
    const sheetData = { ...cellValuesRef.current };

    // Fill raw dataset row values if not already present
    DEFAULT_EXCEL_SANDBOX_DATASET.rows.forEach((row, rIdx) => {
      const rowNum = rIdx + 2;
      DEFAULT_EXCEL_SANDBOX_DATASET.columns.forEach((col, cIdx) => {
        const addr = `${colLetters[cIdx]}${rowNum}`;
        if (sheetData[addr] === undefined) {
          sheetData[addr] = row[col.key];
        }
      });
    });

    const diagnostic = analyzeExcelFormula(formulaToRun, sheetData);
    setValidationState(diagnostic);

    if (diagnostic.valid) {
      setCellValues((prev) => ({
        ...prev,
        [cellAddr]: diagnostic.value,
      }));
      setCellFormulas((prev) => ({
        ...prev,
        [cellAddr]: formulaToRun,
      }));
      setExcelFeedback({
        type: 'success',
        message: `Công thức hợp lệ! Kết quả tại ô [${cellAddr}]: ${
          typeof diagnostic.value === 'number'
            ? diagnostic.value.toLocaleString('en-US')
            : diagnostic.value
        }`,
      });
      endSession();
      setIsEvaluatingExcel(false);
      return true;
    } else {
      setExcelFeedback({
        type: 'error',
        message: `Lỗi công thức: ${diagnostic.message}`,
      });
      setIsEvaluatingExcel(false);
      return false;
    }
  }, [endSession, setValidationState]);

  // ── Excel Cell Selection & Editing ──
  const getCellValueForInput = useCallback((cellAddr) => {
    if (cellFormulasRef.current[cellAddr]) return cellFormulasRef.current[cellAddr];
    if (cellValuesRef.current[cellAddr] !== undefined) return String(cellValuesRef.current[cellAddr]);
    
    const colLetter = cellAddr.charAt(0);
    const rowNum = parseInt(cellAddr.slice(1), 10);
    const cIdx = colLetter.charCodeAt(0) - 65;
    const rIdx = rowNum - 2;
    const row = DEFAULT_EXCEL_SANDBOX_DATASET.rows[rIdx];
    const col = DEFAULT_EXCEL_SANDBOX_DATASET.columns[cIdx];
    if (row && col && row[col.key] !== undefined) {
       return String(row[col.key]);
    }
    return '';
  }, []);

  const handleCellSelect = useCallback((cellAddr) => {
    if (cellAddr === selectedCellRef.current) return;
    
    // Nếu đang chỉnh sửa ô khác, commit thay đổi trước khi chuyển
    if (sessionRef.current.status === 'EDITING') {
      const isValid = handleRunExcelFormula(undefined, selectedCellRef.current);
      if (!isValid) return; // Không cho phép chuyển ô nếu công thức hiện tại bị lỗi
    }
    
    setSelectedCell(cellAddr);
  }, [handleRunExcelFormula]);

  const handleCellDoubleClick = useCallback((cellAddr) => {
    if (sessionRef.current.status === 'EDITING') {
      const isValid = handleRunExcelFormula(undefined, selectedCellRef.current);
      if (!isValid) return;
    }
    if (cellAddr !== selectedCellRef.current) {
      setSelectedCell(cellAddr);
    }
    startEditing(cellAddr, getCellValueForInput(cellAddr));
  }, [handleRunExcelFormula, startEditing, getCellValueForInput]);

  const handleFormulaCommitAction = useCallback((actionType) => {
    const currentCell = selectedCellRef.current;
    const isValid = handleRunExcelFormula(undefined, currentCell);
    if (!isValid) return false;

    if (actionType === 'enter') {
      const colLetter = currentCell.charAt(0);
      const rowNum = parseInt(currentCell.slice(1), 10);
      if (!isNaN(rowNum)) {
        const nextRow = Math.min(rowNum + 1, 16);
        setSelectedCell(`${colLetter}${nextRow}`);
      }
    } else if (actionType === 'tab') {
      const colLetter = currentCell.charAt(0);
      const rowNum = parseInt(currentCell.slice(1), 10);
      const colIndex = colLetter.charCodeAt(0) - 65;
      const maxColIndex = DEFAULT_EXCEL_SANDBOX_DATASET.columns.length - 1;
      if (colIndex < maxColIndex) {
        const nextColLetter = String.fromCharCode(colLetter.charCodeAt(0) + 1);
        setSelectedCell(`${nextColLetter}${rowNum}`);
      }
    }
    return true;
  }, [handleRunExcelFormula]);

  // ── Reset Excel Grid ──
  const handleResetExcel = () => {
    const fresh = getInitialExcelSandboxCells();
    setCellValues(fresh.cellValues);
    setCellFormulas(fresh.cellFormulas);
    setSelectedCell('D10');
    endSession();
    updateDraft('');
    setValidationState(null);
    setExcelFeedback({
      type: 'info',
      message: 'Đã hoàn tác bảng tính về trạng thái mẫu ban đầu.',
    });
  };

  // ── SQL Execution: Run Query ──
  const handleRunSqlQuery = async (customSql) => {
    const sqlToRun = (customSql !== undefined ? customSql : userSql).trim();
    if (!sqlToRun) return;

    setIsExecutingSql(true);
    setSqlResult(null);

    try {
      const engine = await initSqlEngine();
      if (!engine) {
        setSqlResult({
          errorCode: 'ENGINE_NOT_READY',
          message: 'Không thể khởi chạy SQLite Engine.',
        });
        return;
      }

      const res = await engine.execute(sqlToRun);
      if (isMountedRef.current) {
        setSqlResult(res);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setSqlResult({
          errorCode: 'SQL_RUNTIME_ERROR',
          message: err.message || 'Lỗi xảy ra khi thực thi câu lệnh SQL.',
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsExecutingSql(false);
      }
    }
  };

  // ── Reset SQL Editor ──
  const handleResetSql = () => {
    setUserSql('SELECT * FROM sales LIMIT 5;');
    setSqlResult(null);
  };

  // ── Apply Preset ("Thử ngay") ──
  const handleApplyPreset = (preset) => {
    if (activeTool === 'excel') {
      const target = preset.targetCell || selectedCell || 'D10';
      setSelectedCell(target);
      if (session.status === 'IDLE') {
         startEditing(target, '', preset.code);
      } else {
         updateDraft(preset.code);
      }
      handleRunExcelFormula(preset.code);
    } else {
      setUserSql(preset.code);
      handleRunSqlQuery(preset.code);
    }
  };

  // Previous and Next topics navigation
  const currentTopicIndex = topics.findIndex((t) => t.id === activeTopicId);
  const prevTopic = currentTopicIndex > 0 ? topics[currentTopicIndex - 1] : null;
  const nextTopic =
    currentTopicIndex >= 0 && currentTopicIndex < topics.length - 1
      ? topics[currentTopicIndex + 1]
      : null;

  // List of all editable cells for Excel grid (all row cells + summary rows)
  const allGridCells = useMemo(() => {
    const list = [];
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let r = 2; r <= 16; r++) {
      cols.forEach((c) => list.push(`${c}${r}`));
    }
    return list;
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0 gap-3">
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            to="/knowledge"
            className="p-1.5 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Quay lại Thư viện kiến thức"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              <h1 className="text-sm font-bold text-foreground tracking-tight">
                Practice Sandbox
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                Try it Yourself
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden md:block">
              Không gian thực hành tự do, không trừ XP, thử nghiệm công thức và truy vấn thời gian thực
            </p>
          </div>
        </div>

        {/* Center: Tool Switcher */}
        <div className="flex items-center rounded-xl bg-muted p-1 border border-border">
          <button
            type="button"
            onClick={() => handleSwitchTool('excel')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTool === 'excel'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileSpreadsheet className="size-3.5 text-emerald-500" />
            <span>Excel Formula</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTool('sql')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTool === 'sql'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="size-3.5 text-blue-500" />
            <span>SQL Query</span>
          </button>
        </div>

        {/* Right: Topic Selector & Reset */}
        <div className="flex items-center gap-2">
          {topics.length > 0 && (
            <div className="relative hidden lg:block">
              <select
                value={activeTopicId}
                onChange={(e) => handleSelectTopic(e.target.value)}
                className="appearance-none rounded-xl border border-border bg-background px-3 py-1.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tool.toUpperCase()}: {t.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            </div>
          )}

          <button
            type="button"
            onClick={activeTool === 'excel' ? handleResetExcel : handleResetSql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
            title="Tải lại dữ liệu mẫu ban đầu"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Đặt lại mẫu</span>
          </button>
        </div>
      </header>

      {/* ── Split-Pane IDE Body ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <WorkspaceSplitPane
          leftTitle="Lý thuyết & Ví dụ"
          rightTitle={activeTool === 'excel' ? 'Bảng tính Excel' : 'Trình soạn thảo SQL'}
          defaultLeftSize="38%"
          minLeftSize="28%"
          maxLeftSize="48%"
          className="h-full"
          isFocusMode={isFocusMode}
          onToggleFocusMode={toggleFocusMode}
          leftContent={
            <div className="space-y-6 pb-12">
              {/* Topic Header */}
              {activeTopic ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {activeTopic.tool}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {activeTopic.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    {activeTopic.title}
                  </h2>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Đang tải bài học...</div>
              )}

              {/* Quick Presets / Try It Examples Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-500" />
                    Ví dụ thực hành nhanh
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Bấm để chạy thử</span>
                </div>

                <div className="space-y-2.5">
                  {currentPresets.map((preset, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-card/80 p-3 hover:border-amber-500/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          {preset.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                        >
                          <Play className="size-2.5 fill-current" />
                          <span>Thử ngay</span>
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-950 font-mono text-xs text-amber-400 overflow-x-auto border border-white/5 mb-1.5">
                        <code>{preset.code}</code>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {preset.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Lesson Markdown Viewer */}
              {activeTopic && (
                <div className="pt-4 border-t border-border/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-blue-500" />
                    Lý thuyết chi tiết
                  </h3>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <KnowledgeViewer markdown={activeTopic.contentMarkdown} />
                  </div>
                </div>
              )}

              {/* Sequential Progression Buttons (W3Schools Style) */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                {prevTopic ? (
                  <button
                    type="button"
                    onClick={() => handleSelectTopic(prevTopic.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span className="truncate max-w-[120px]">Bài trước</span>
                  </button>
                ) : (
                  <div />
                )}

                {nextTopic && (
                  <button
                    type="button"
                    onClick={() => handleSelectTopic(nextTopic.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold transition-opacity ml-auto"
                  >
                    <span>Bài tiếp theo</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          }
          rightContent={
            activeTool === 'excel' ? (
              // ── EXCEL WORKSPACE ──
              <div className="flex flex-col h-full overflow-hidden bg-background">
                {/* Status / Feedback Banner */}
                {excelFeedback && (
                  <div
                    className={`px-4 py-2 text-xs flex items-center gap-2 border-b ${
                      excelFeedback.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : excelFeedback.type === 'error'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                        : excelFeedback.type === 'warning'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-muted/60 text-muted-foreground border-border'
                    }`}
                  >
                    {excelFeedback.type === 'success' && <CheckCircle2 className="size-3.5 shrink-0" />}
                    {excelFeedback.type === 'error' && <AlertCircle className="size-3.5 shrink-0" />}
                    {excelFeedback.type === 'warning' && <AlertCircle className="size-3.5 shrink-0" />}
                    {excelFeedback.type === 'info' && <Info className="size-3.5 shrink-0" />}
                    <span className="flex-1 truncate">{excelFeedback.message}</span>
                  </div>
                )}

                {/* Formula Bar */}
                <div className="p-2 border-b border-border bg-card shrink-0">
                  <FormulaBar
                    selectedCell={selectedCell}
                    formula={session.status === 'EDITING' ? session.draftValue : getCellValueForInput(selectedCell)}
                    onChange={(val) => {
                      if (session.status === 'IDLE') {
                        startEditing(selectedCell, getCellValueForInput(selectedCell), val);
                      } else {
                        updateDraft(val);
                      }
                    }}
                    onRun={(formula, actionType) => handleFormulaCommitAction(actionType)}
                    onSubmit={(formula, actionType) => handleFormulaCommitAction(actionType)}
                    onCancel={cancelEditing}
                    onReset={handleResetExcel}
                    diagnostic={session.validationState}
                    isEvaluating={isEvaluatingExcel}
                    showActions={true}
                  />
                </div>

                {/* Spreadsheet Canvas */}
                <div className="flex-1 min-h-0 overflow-hidden p-2 relative">
                  <SpreadsheetGrid
                    containerRef={gridContainerRef}
                    dataset={DEFAULT_EXCEL_SANDBOX_DATASET}
                    selectedCell={selectedCell}
                    onCellSelect={handleCellSelect}
                    onCellDoubleClick={handleCellDoubleClick}
                    targetCell={selectedCell}
                    cellFormulas={cellFormulas}
                    cellValues={cellValues}
                    editableCells={allGridCells}
                  />
                  {session.status === 'EDITING' && (
                    <CellEditorOverlay
                      activeCell={session.activeCell}
                      draftValue={session.draftValue}
                      onChange={updateDraft}
                      onCommit={handleFormulaCommitAction}
                      onCancel={cancelEditing}
                      gridContainerRef={gridContainerRef}
                      validationState={session.validationState}
                    />
                  )}
                </div>
              </div>
            ) : (
              // ── SQL WORKSPACE ──
              <div className="flex flex-col h-full overflow-hidden bg-background">
                {/* Schema Tags Bar */}
                {sqlSchema && sqlSchema.tables && (
                  <div className="px-3 py-1.5 border-b border-border bg-card/60 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
                    <span className="font-semibold text-muted-foreground flex items-center gap-1">
                      <Database className="size-3" />
                      Bảng khả dụng:
                    </span>
                    {sqlSchema.tables.map((tbl) => (
                      <span
                        key={tbl.name}
                        className="px-2 py-0.5 rounded-md bg-muted font-mono font-medium text-foreground border border-border"
                      >
                        {tbl.name} ({tbl.columns?.length || 0} cột)
                      </span>
                    ))}
                    <span className="text-muted-foreground ml-auto text-[10px] hidden sm:inline">
                      Phím tắt: Ctrl + Enter để thực thi
                    </span>
                  </div>
                )}

                {/* SQL Editor */}
                <div className="h-56 shrink-0 border-b border-border">
                  <SqlEditor
                    value={userSql}
                    onChange={(val) => setUserSql(val)}
                    onRun={() => handleRunSqlQuery()}
                    onReset={handleResetSql}
                    isRunning={isExecutingSql}
                  />
                </div>

                {/* Results Viewer */}
                <div className="flex-1 min-h-0 overflow-hidden p-3 bg-muted/10">
                  <ResultViewer
                    result={sqlResult}
                    isExecuting={isExecutingSql}
                    isCompleted={false}
                  />
                </div>
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
