import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  FileSpreadsheet,
  Database,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  Clock,
  Award,
  BookOpen,
} from 'lucide-react';
import { adminContentService } from '../../services/index.js';
import { AdminTestRunnerModal } from '../../components/admin/AdminTestRunnerModal.jsx';

export function AdminMissionEditorPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const isNew = !missionId || missionId === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [activeTab, setActiveTab] = useState('narrative'); // 'narrative' | 'workspace' | 'checker' | 'hints'

  // Reference lists
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [datasets, setDatasets] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    courseId: 'course-001',
    chapterId: 'ch-001',
    title: '',
    story: '',
    objective: '',
    tool: 'excel', // 'excel' | 'sql'
    difficulty: 'easy',
    estimatedDuration: 15,
    rewardXp: 100,
    datasetId: 'ds-001',
    status: 'draft',
    starterContent: {
      targetSheet: 'Sales',
      targetCell: 'E2',
      starterSql: 'SELECT * FROM sales;',
      hint: '',
    },
    checkerConfig: {
      expectedFormulaText: '=C2*D2, =D2*C2',
      expectedValue: '450000',
      expectedColumnsText: 'id, order_id, product_name, revenue',
      expectedRowsText: '',
    },
    hints: [
      { id: 'h-1', text: '', penaltyXp: 10 },
    ],
  });

  // Modal State
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load initial references
  useEffect(() => {
    async function loadRefs() {
      try {
        const [coursesRes, chaptersRes, datasetsRes] = await Promise.all([
          adminContentService.getCourses(),
          adminContentService.getChapters(),
          adminContentService.getDatasets(),
        ]);

        if (coursesRes.data) setCourses(coursesRes.data);
        if (chaptersRes.data) setChapters(chaptersRes.data);
        if (datasetsRes.data) setDatasets(datasetsRes.data);

        // Load existing mission if edit mode
        if (!isNew) {
          const missionRes = await adminContentService.getMission(missionId);
          if (missionRes.data) {
            const m = missionRes.data;
            setFormData({
              id: m.id,
              courseId: m.courseId || 'course-001',
              chapterId: m.chapterId || 'ch-001',
              title: m.title || '',
              story: m.story || '',
              objective: m.objective || '',
              tool: m.tool || 'excel',
              difficulty: m.difficulty || 'easy',
              estimatedDuration: m.estimatedDuration || 15,
              rewardXp: m.rewardXp || 100,
              datasetId: m.datasetId || 'ds-001',
              status: m.status || 'draft',
              starterContent: {
                targetSheet: m.starterContent?.targetSheet || 'Sales',
                targetCell: m.starterContent?.targetCell || 'E2',
                starterSql: m.starterContent?.starterSql || 'SELECT * FROM sales;',
                hint: m.starterContent?.hint || '',
              },
              checkerConfig: {
                expectedFormulaText: Array.isArray(m.checkerConfig?.expectedFormula)
                  ? m.checkerConfig.expectedFormula.join(', ')
                  : m.checkerConfig?.expectedFormula || '',
                expectedValue: m.checkerConfig?.expectedValue !== undefined ? String(m.checkerConfig.expectedValue) : '',
                expectedColumnsText: Array.isArray(m.checkerConfig?.expectedColumns)
                  ? m.checkerConfig.expectedColumns.join(', ')
                  : '',
                expectedRowsText: m.checkerConfig?.expectedRows
                  ? JSON.stringify(m.checkerConfig.expectedRows, null, 2)
                  : '',
              },
              hints: m.hints && m.hints.length > 0 ? m.hints : [{ id: 'h-1', text: '', penaltyXp: 10 }],
            });
          } else {
            showToast('Không tìm thấy nhiệm vụ!', 'error');
          }
        }
      } catch (err) {
        showToast('Lỗi khi tải dữ liệu: ' + err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadRefs();
  }, [missionId, isNew]);

  // Filter chapters by selected course
  const availableChapters = chapters.filter((ch) => ch.courseId === formData.courseId);

  // Validate form
  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Vui lòng nhập tiêu đề vụ án';
    if (!formData.story.trim()) errs.story = 'Vui lòng nhập cốt truyện điều tra';
    if (!formData.objective.trim()) errs.objective = 'Vui lòng nhập mục tiêu vụ án';
    if (!formData.courseId) errs.courseId = 'Vui lòng chọn khóa học';
    if (!formData.chapterId) errs.chapterId = 'Vui lòng chọn chương học';

    if (formData.tool === 'excel') {
      if (!formData.starterContent.targetCell.trim()) {
        errs.targetCell = 'Vui lòng nhập ô mục tiêu (ví dụ: E2)';
      }
      if (!formData.checkerConfig.expectedFormulaText.trim() && !formData.checkerConfig.expectedValue.trim()) {
        errs.checkerConfig = 'Vui lòng nhập ít nhất công thức hoặc giá trị kỳ vọng cho Excel';
      }
    } else {
      if (!formData.starterContent.starterSql.trim()) {
        errs.starterSql = 'Vui lòng nhập câu lệnh SQL khởi tạo';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Prepare mission payload
  const preparePayload = (statusOverride) => {
    // Parse Excel formulas
    const expectedFormula = formData.checkerConfig.expectedFormulaText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    // Parse Expected Value (number if numeric string)
    let expectedValue = formData.checkerConfig.expectedValue.trim();
    if (expectedValue !== '' && !isNaN(Number(expectedValue))) {
      expectedValue = Number(expectedValue);
    }

    // Parse SQL columns
    const expectedColumns = formData.checkerConfig.expectedColumnsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    // Parse SQL rows
    let expectedRows = [];
    if (formData.checkerConfig.expectedRowsText.trim()) {
      try {
        expectedRows = JSON.parse(formData.checkerConfig.expectedRowsText);
      } catch {
        expectedRows = [];
      }
    }

    return {
      ...(formData.id ? { id: formData.id } : {}),
      courseId: formData.courseId,
      chapterId: formData.chapterId,
      title: formData.title.trim(),
      story: formData.story.trim(),
      objective: formData.objective.trim(),
      tool: formData.tool,
      difficulty: formData.difficulty,
      estimatedDuration: Number(formData.estimatedDuration) || 15,
      rewardXp: Number(formData.rewardXp) || 100,
      datasetId: formData.datasetId,
      status: statusOverride || formData.status,
      starterContent: {
        ...(formData.tool === 'excel'
          ? {
              targetSheet: formData.starterContent.targetSheet.trim(),
              targetCell: formData.starterContent.targetCell.trim(),
              hint: formData.starterContent.hint.trim(),
            }
          : {
              starterSql: formData.starterContent.starterSql.trim(),
              hint: formData.starterContent.hint.trim(),
            }),
      },
      checkerConfig: {
        ...(formData.tool === 'excel'
          ? { expectedFormula, expectedValue }
          : { expectedColumns, expectedRows }),
      },
      hints: formData.hints.filter((h) => h.text.trim()),
    };
  };

  // Save Handler
  const handleSave = async (statusOverride) => {
    if (!validate()) {
      showToast('Vui lòng kiểm tra lại các trường bắt buộc!', 'error');
      return;
    }

    const payload = preparePayload(statusOverride);
    const res = await adminContentService.saveMission(payload);

    if (res.data) {
      showToast(
        statusOverride === 'published'
          ? 'Đã xuất bản vụ án thành công!'
          : 'Đã lưu bản nháp vụ án thành công!'
      );
      setTimeout(() => navigate('/admin/missions'), 1200);
    } else {
      showToast(res.error || 'Lỗi khi lưu vụ án', 'error');
    }
  };

  // Add hint row
  const addHintRow = () => {
    setFormData((prev) => ({
      ...prev,
      hints: [...prev.hints, { id: `h-${prev.hints.length + 1}`, text: '', penaltyXp: 10 }],
    }));
  };

  // Remove hint row
  const removeHintRow = (idx) => {
    setFormData((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== idx),
    }));
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center py-20 text-muted-foreground font-medium">
        Đang tải thông tin vụ án...
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 animate-fade-in pb-16">
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

      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/missions"
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {isNew ? 'Tạo mới' : formData.id}
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  formData.status === 'published'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {formData.status === 'published' ? 'ĐÃ XUẤT BẢN' : 'BẢN NHÁP'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl mt-1">
              {isNew ? 'Soạn thảo Vụ án mới' : formData.title || 'Chỉnh sửa vụ án'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowTestRunner(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="size-4" /> Chạy thử Sandbox
          </button>
          <button
            onClick={() => handleSave('draft')}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Save className="size-4" /> Lưu bản nháp
          </button>
          <button
            onClick={() => handleSave('published')}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Send className="size-4" /> Xuất bản ngay
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {[
          { key: 'narrative', label: '1. Hồ sơ & Bối cảnh', icon: BookOpen },
          { key: 'workspace', label: '2. Cấu hình Workspace', icon: Layers },
          { key: 'checker', label: '3. Bộ chấm điểm (Checker)', icon: Award },
          { key: 'hints', label: '4. Hệ thống gợi ý', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Narrative & Briefing */}
      {activeTab === 'narrative' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="size-4 text-primary" /> Thông tin cơ bản & Bối cảnh trinh thám
            </h3>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Tiêu đề vụ án <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ví dụ: Vì sao doanh thu tháng 3 giảm?"
                className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all ${
                  errors.title ? 'border-rose-500' : 'border-border focus:border-primary'
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Khóa học</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Chương học</label>
                <select
                  value={formData.chapterId}
                  onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {availableChapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Công cụ thực hành</label>
                <select
                  value={formData.tool}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tool: e.target.value,
                      datasetId: e.target.value === 'excel' ? 'ds-001' : 'sql-sales-v1',
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="excel">📊 Excel</option>
                  <option value="sql">🔍 SQL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Độ khó</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="easy">Dễ (Easy)</option>
                  <option value="medium">Trung bình (Medium)</option>
                  <option value="hard">Khó (Hard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Thời lượng (phút)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Phần thưởng XP</label>
                <input
                  type="number"
                  value={formData.rewardXp}
                  onChange={(e) => setFormData({ ...formData, rewardXp: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Dataset liên kết</label>
              <select
                value={formData.datasetId}
                onChange={(e) => setFormData({ ...formData, datasetId: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary cursor-pointer"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name || d.id} ({d.type?.toUpperCase() || 'DATA'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Cốt truyện trinh thám (Story Narrative) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                placeholder="Ví dụ: Giám đốc tài chính gọi điện lúc 8 giờ sáng báo cáo doanh thu tháng 3 giảm sút nghiêm trọng. Hãy vào vai thám tử dữ liệu mở file..."
                className={`w-full rounded-xl border bg-background p-3 text-sm text-foreground outline-none transition-all resize-y ${
                  errors.story ? 'border-rose-500' : 'border-border focus:border-primary'
                }`}
              />
              {errors.story && <p className="mt-1 text-xs text-rose-500">{errors.story}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Mục tiêu phá án (Objective) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="Ví dụ: Tính tổng doanh thu tháng 3 và so sánh với tháng 2 bằng công thức SUM."
                className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all ${
                  errors.objective ? 'border-rose-500' : 'border-border focus:border-primary'
                }`}
              />
              {errors.objective && <p className="mt-1 text-xs text-rose-500">{errors.objective}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Workspace Setup */}
      {activeTab === 'workspace' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Thiết lập Không gian làm việc ({formData.tool?.toUpperCase()})
            </h3>

            {formData.tool === 'excel' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Sheet mục tiêu</label>
                    <input
                      type="text"
                      value={formData.starterContent.targetSheet}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          starterContent: { ...formData.starterContent, targetSheet: e.target.value },
                        })
                      }
                      placeholder="Ví dụ: Sales"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Ô mục tiêu cần giải (Target Cell) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.starterContent.targetCell}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          starterContent: { ...formData.starterContent, targetCell: e.target.value },
                        })
                      }
                      placeholder="Ví dụ: E2"
                      className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm font-mono text-foreground outline-none ${
                        errors.targetCell ? 'border-rose-500' : 'border-border focus:border-primary'
                      }`}
                    />
                    {errors.targetCell && <p className="mt-1 text-xs text-rose-500">{errors.targetCell}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Gợi ý ban đầu trong Formula Bar</label>
                  <input
                    type="text"
                    value={formData.starterContent.hint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        starterContent: { ...formData.starterContent, hint: e.target.value },
                      })
                    }
                    placeholder="Ví dụ: Gõ công thức =C2*D2 để tính Thành tiền"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Câu lệnh SQL khởi tạo (Starter SQL) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={formData.starterContent.starterSql}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        starterContent: { ...formData.starterContent, starterSql: e.target.value },
                      })
                    }
                    placeholder="-- Viết câu lệnh SQL mẫu cho học viên bắt đầu&#10;SELECT * FROM sales;"
                    className={`w-full rounded-xl border bg-background p-3 font-mono text-xs text-foreground outline-none resize-y ${
                      errors.starterSql ? 'border-rose-500' : 'border-border focus:border-primary'
                    }`}
                  />
                  {errors.starterSql && <p className="mt-1 text-xs text-rose-500">{errors.starterSql}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Gợi ý ban đầu</label>
                  <input
                    type="text"
                    value={formData.starterContent.hint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        starterContent: { ...formData.starterContent, hint: e.target.value },
                      })
                    }
                    placeholder="Ví dụ: Gõ SELECT * FROM sales; để xem toàn bộ bảng sales."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Checker Configuration */}
      {activeTab === 'checker' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Award className="size-4 text-primary" /> Cấu hình Bộ Chấm Điểm (Answer Keys & Rules)
            </h3>

            {formData.tool === 'excel' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Các công thức hợp lệ được chấp nhận (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.checkerConfig.expectedFormulaText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checkerConfig: { ...formData.checkerConfig, expectedFormulaText: e.target.value },
                      })
                    }
                    placeholder="Ví dụ: =C2*D2, =D2*C2, =PRODUCT(C2,D2)"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Có thể nhập nhiều biến thể công thức tương đương để người học giải theo nhiều cách.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Giá trị kết quả kỳ vọng (Expected Value)
                  </label>
                  <input
                    type="text"
                    value={formData.checkerConfig.expectedValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checkerConfig: { ...formData.checkerConfig, expectedValue: e.target.value },
                      })
                    }
                    placeholder="Ví dụ: 450000 hoặc VIP hoặc true"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bộ chấm sẽ đánh giá cả công thức và giá trị ô tính toán.
                  </p>
                </div>

                {errors.checkerConfig && (
                  <p className="text-xs text-rose-500 font-semibold">{errors.checkerConfig}</p>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Danh sách tên cột kỳ vọng (Expected Columns)
                  </label>
                  <input
                    type="text"
                    value={formData.checkerConfig.expectedColumnsText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checkerConfig: { ...formData.checkerConfig, expectedColumnsText: e.target.value },
                      })
                    }
                    placeholder="Ví dụ: id, order_id, product_name, branch, revenue"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Các cột bắt buộc phải có trong kết quả trả về của câu lệnh SQL.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Dữ liệu các hàng kỳ vọng (JSON Array of Arrays) - Tùy chọn
                  </label>
                  <textarea
                    rows={5}
                    value={formData.checkerConfig.expectedRowsText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checkerConfig: { ...formData.checkerConfig, expectedRowsText: e.target.value },
                      })
                    }
                    placeholder='[[1, "ORD-1001", "Laptop", 12500000], [2, "ORD-1002", "Chuột", 850000]]'
                    className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground outline-none resize-y"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Step-by-step Hints */}
      {activeTab === 'hints' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="size-4 text-primary" /> Hệ thống gợi ý nhiều cấp độ
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Người học có thể mở khóa các gợi ý này nếu bị kẹt, kèm mức giảm điểm XP tương ứng.
                </p>
              </div>
              <button
                onClick={addHintRow}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Plus className="size-3.5" /> Thêm gợi ý
              </button>
            </div>

            <div className="space-y-3">
              {formData.hints.map((hint, idx) => (
                <div key={hint.id || idx} className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-muted font-mono text-xs font-bold text-muted-foreground mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={hint.text}
                      onChange={(e) => {
                        const updated = [...formData.hints];
                        updated[idx].text = e.target.value;
                        setFormData({ ...formData, hints: updated });
                      }}
                      placeholder={`Nội dung gợi ý bước ${idx + 1}...`}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Giảm XP dự kiến:</span>
                      <input
                        type="number"
                        value={hint.penaltyXp || 10}
                        onChange={(e) => {
                          const updated = [...formData.hints];
                          updated[idx].penaltyXp = Number(e.target.value) || 0;
                          setFormData({ ...formData, hints: updated });
                        }}
                        className="w-20 rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs text-foreground outline-none"
                      />
                      <span className="text-muted-foreground">XP</span>
                    </div>
                  </div>
                  {formData.hints.length > 1 && (
                    <button
                      onClick={() => removeHintRow(idx)}
                      type="button"
                      className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sandbox Test Runner Modal */}
      {showTestRunner && (
        <AdminTestRunnerModal
          mission={preparePayload()}
          onClose={() => setShowTestRunner(false)}
        />
      )}
    </div>
  );
}
