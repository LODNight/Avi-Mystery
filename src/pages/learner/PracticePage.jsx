import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Database,
  Search,
  Award,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowUpDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  SlidersHorizontal,
  Check,
  RotateCcw,
  X,
  Layers,
  Shuffle,
} from 'lucide-react';
import { contentService } from '../../services/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useProgress } from '../../hooks/useProgress.js';
import { Skeleton, PracticePageSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';

export function PracticePage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state (LeetCode style)
  const [filterTool, setFilterTool] = useState('all'); // all, excel, sql
  const [filterStatus, setFilterStatus] = useState('all'); // all, uncompleted, completed
  const [filterDifficulty, setFilterDifficulty] = useState('all'); // all, easy, medium, hard
  const [searchQuery, setSearchQuery] = useState('');

  // LeetCode style sort state: sortKey + sortOrder
  const [sortKey, setSortKey] = useState('default'); // 'default' | 'xp' | 'difficulty'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  // Popovers open states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const { progressList } = useProgress(user?.id);

  useEffect(() => {
    async function loadPracticeData() {
      setLoading(true);
      setError(null);
      try {
        const res = await contentService.getPracticeQuestions();
        if (res.error) {
          setError(res.error);
        } else {
          // Adjust gamification logic (Difficulty -> XP & Time mapping)
          const adjustedQuestions = (res.data || []).map((q) => {
            const diff = q.difficulty || 'easy';
            let xp = 100;
            let time = '15-20p';
            if (diff === 'easy' || diff === 'beginner') {
              xp = 50;
              time = '5-10p';
              q.difficulty = 'easy';
            } else if (diff === 'medium' || diff === 'intermediate') {
              xp = 100;
              time = '15-20p';
              q.difficulty = 'medium';
            } else if (diff === 'hard' || diff === 'advanced') {
              xp = 200;
              time = '30-45p';
              q.difficulty = 'hard';
            }
            return { ...q, rewards: { ...q.rewards, baseXp: xp }, timeEstimate: time };
          });
          setQuestions(adjustedQuestions);
        }
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra khi tải danh sách bài tập.');
      } finally {
        setLoading(false);
      }
    }
    loadPracticeData();
  }, []);

  // Handle click outside popovers
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isQuestionCompleted = (question) => {
    if (!question) return false;
    const qId = typeof question === 'object' ? (question.id || question.questionId) : question;
    const legacyId = typeof question === 'object' ? question.legacyMissionId : null;
    const invId = typeof question === 'object' ? question.investigationId : null;

    return progressList?.some(
      (p) =>
        (p.contentId === qId || (legacyId && p.contentId === legacyId) || (invId && p.contentId === invId)) &&
        p.status === 'completed'
    );
  };

  const completedCount = useMemo(() => {
    return questions.filter((q) => isQuestionCompleted(q)).length;
  }, [questions, progressList]);

  const handleStartPractice = (question) => {
    const route =
      question.tool === 'sql'
        ? `/missions/${question.legacyMissionId}/sql`
        : `/missions/${question.legacyMissionId}/workspace`;
    navigate(route, { state: { mode: 'practice' } });
  };

  const handleRandomPick = () => {
    const uncompleted = questions.filter((q) => !isQuestionCompleted(q));
    const pool = uncompleted.length > 0 ? uncompleted : questions;
    if (pool.length === 0) return;
    const randomQ = pool[Math.floor(Math.random() * pool.length)];
    handleStartPractice(randomQ);
  };

  // Toggle sort key and order (LeetCode style)
  const handleSortSelect = (key) => {
    if (key === 'default') {
      setSortKey('default');
      setSortOrder('desc');
      setIsSortOpen(false);
    } else if (sortKey === key) {
      // Toggle direction when clicking active key
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // LeetCode Filter & Sort Logic
  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        // Tool filter
        if (filterTool !== 'all' && q.tool !== filterTool) return false;

        // Status filter
        if (filterStatus !== 'all') {
          const completed = isQuestionCompleted(q);
          if (filterStatus === 'completed' && !completed) return false;
          if (filterStatus === 'uncompleted' && completed) return false;
        }

        // Difficulty filter
        if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;

        // Search query
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchPrompt = q.prompt?.toLowerCase().includes(query);
          const matchTool = q.tool?.toLowerCase().includes(query);
          return matchPrompt || matchTool;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortKey === 'xp') {
          const xpA = a.rewards?.baseXp || 0;
          const xpB = b.rewards?.baseXp || 0;
          return sortOrder === 'desc' ? xpB - xpA : xpA - xpB;
        }

        if (sortKey === 'difficulty') {
          const diffWeight = { easy: 1, medium: 2, hard: 3 };
          const weightA = diffWeight[a.difficulty] || 0;
          const weightB = diffWeight[b.difficulty] || 0;
          return sortOrder === 'desc' ? weightB - weightA : weightA - weightB;
        }

        return 0;
      });
  }, [questions, filterTool, filterStatus, filterDifficulty, searchQuery, sortKey, sortOrder, progressList]);

  const hasActiveFilters = filterStatus !== 'all' || filterDifficulty !== 'all';

  const sortFields = [
    { id: 'default', label: 'Mặc định' },
    { id: 'xp', label: 'Mức thưởng XP', descHint: 'Cao → Thấp', ascHint: 'Thấp → Cao' },
    { id: 'difficulty', label: 'Độ khó', descHint: 'Khó → Dễ', ascHint: 'Dễ → Khó' },
  ];

  const getSortButtonLabel = () => {
    if (sortKey === 'xp') return 'XP';
    if (sortKey === 'difficulty') return 'Độ khó';
    return 'Sắp xếp';
  };

  if (loading) {
    return <PracticePageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8">
        <ErrorState
          message={error || 'Không thể kết nối với ngân hàng câu hỏi.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between gap-6 md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="size-4" />
            Workspace
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Luyện tập kỹ năng
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Khu vực rèn luyện tự do ngoài cốt truyện chính. Chọn một bài tập để nâng cao trình độ
            trinh thám dữ liệu của bạn bằng Excel hoặc SQL.
          </p>
        </div>
      </div>

      {/* LeetCode Style Toolbar */}
      <div className="space-y-4">
        {/* Top Row: Prominent Category / Skill Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterTool('all')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              filterTool === 'all'
                ? 'bg-foreground text-background border-foreground shadow-md'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-accent'
            }`}
          >
            <Layers className="size-3.5" /> Tất cả kỹ năng
          </button>
          <button
            onClick={() => setFilterTool('excel')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              filterTool === 'excel'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-card border-border text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/10'
            }`}
          >
            <FileSpreadsheet className={`size-3.5 ${filterTool === 'excel' ? 'text-white' : 'text-emerald-500'}`} /> Excel Spreadsheet
          </button>
          <button
            onClick={() => setFilterTool('sql')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              filterTool === 'sql'
                ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-card border-border text-muted-foreground hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/10'
            }`}
          >
            <Database className={`size-3.5 ${filterTool === 'sql' ? 'text-white' : 'text-blue-500'}`} /> SQL Database
          </button>
        </div>

        {/* Bottom Row: Compact Search + Sort + Filter + Solved Stats + Shuffle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
          <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Compact Search Box */}
            <div className="relative w-48 sm:w-60 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-full border border-border bg-card pl-8 pr-8 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* LeetCode Style Sort Icon Button */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className={`h-9 px-3.5 rounded-full border flex items-center gap-1.5 text-xs font-semibold transition-all shadow-xs ${
                  sortKey !== 'default'
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
                title="Sắp xếp danh sách"
              >
                {sortKey === 'default' ? (
                  <ArrowUpDown className="size-3.5" />
                ) : sortOrder === 'desc' ? (
                  <ArrowDownWideNarrow className="size-3.5 text-amber-500" />
                ) : (
                  <ArrowUpNarrowWide className="size-3.5 text-amber-500" />
                )}
                <span>{getSortButtonLabel()}</span>
              </button>

              {/* Sort Popover Menu (LeetCode Exact Pattern) */}
              {isSortOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-11 z-50 w-64 rounded-2xl border border-border bg-card p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1.5">
                    Sắp xếp danh sách
                  </div>
                  <div className="space-y-0.5">
                    {sortFields.map((field) => {
                      const isActive = sortKey === field.id;
                      return (
                        <button
                          key={field.id}
                          onClick={() => handleSortSelect(field.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{field.label}</span>
                            {isActive && field.id !== 'default' && (
                              <span className="text-[10px] opacity-75 font-mono">
                                ({sortOrder === 'desc' ? field.descHint : field.ascHint})
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <div className="flex items-center gap-1 text-amber-500">
                              {field.id === 'default' ? (
                                <Check className="size-3.5" />
                              ) : sortOrder === 'desc' ? (
                                <ArrowDownWideNarrow className="size-4" />
                              ) : (
                                <ArrowUpNarrowWide className="size-4" />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* LeetCode Style Filter Popover Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className={`h-9 px-2.5 rounded-full border flex items-center justify-center text-xs font-semibold transition-all shadow-xs ${
                  hasActiveFilters
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
                title="Bộ lọc nâng cao"
              >
                <SlidersHorizontal className="size-3.5" />
                {hasActiveFilters && <span className="size-1.5 rounded-full bg-primary" />}
              </button>

              {/* Filter Popover Menu */}
              {isFilterOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-11 z-50 w-72 sm:w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <SlidersHorizontal className="size-3.5 text-primary" /> Bộ lọc nâng cao
                    </h4>
                    {hasActiveFilters && (
                      <button
                        onClick={() => {
                          setFilterStatus('all');
                          setFilterDifficulty('all');
                        }}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="size-3" /> Đặt lại
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Trạng thái
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-xl">
                      {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'uncompleted', label: 'Chưa làm' },
                        { id: 'completed', label: 'Đã làm' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFilterStatus(item.id)}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            filterStatus === item.id
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Độ khó
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted rounded-xl">
                      {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'easy', label: 'Dễ' },
                        { id: 'medium', label: 'Vừa' },
                        { id: 'hard', label: 'Khó' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFilterDifficulty(item.id)}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            filterDifficulty === item.id
                              ? 'bg-background text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side stats & Shuffle button (LeetCode Style) */}
          <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong className="text-foreground">{completedCount}</strong>/{questions.length} Solved
              </span>
            </div>

            <button
              onClick={handleRandomPick}
              className="h-9 px-3 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/10 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs"
              title="Thử thách ngẫu nhiên một bài tập"
            >
              <Shuffle className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Ngẫu nhiên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      {filteredQuestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuestions.map((q) => {
            const completed = isQuestionCompleted(q);
            return (
            <div
              key={q.id}
              className={`group relative flex flex-col rounded-3xl border ${completed ? 'border-border/50 bg-muted/40 opacity-70 hover:opacity-100' : 'border-border bg-card'} p-6 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer`}
              onClick={() => handleStartPractice(q)}
            >
              {completed && (
                <div className="absolute -top-3 -right-3 size-7 bg-emerald-500 rounded-full border-[3px] border-background flex items-center justify-center shadow-sm z-10" title="Đã hoàn thành">
                  <Check className="size-3.5 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`grid size-12 place-items-center rounded-2xl ${
                    q.tool === 'sql'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {q.tool === 'sql' ? (
                    <Database className="size-6" />
                  ) : (
                    <FileSpreadsheet className="size-6" />
                  )}
                </div>
                <div
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    q.difficulty === 'hard'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : q.difficulty === 'medium'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {q.difficulty === 'hard'
                    ? 'Khó'
                    : q.difficulty === 'medium'
                    ? 'Trung bình'
                    : 'Dễ'}
                </div>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                {q.prompt}
              </h3>

              <div className="mt-auto pt-6 flex items-center justify-between border-t border-border">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Clock className="size-4" /> {q.timeEstimate || '15-20p'}
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Award className="size-3.5" /> +{q.rewards.baseXp} XP
                </div>
              </div>
            </div>
          )})}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 rounded-3xl border border-dashed border-border bg-card p-6 text-center">
          <div className="relative mb-4">
            <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="size-8 text-primary/60" />
            </div>
            <div className="absolute -bottom-1 -right-1 size-6 bg-background rounded-full flex items-center justify-center">
              <AlertCircle className="size-4 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground">Không tìm thấy bài tập</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Không tìm thấy hồ sơ luyện tập nào khớp với từ khóa. Hãy thử lại nhé!
          </p>
        </div>
      )}
    </div>
  );
}
