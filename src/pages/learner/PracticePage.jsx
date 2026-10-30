import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Database,
  Search,
  Award,
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
  Terminal,
} from 'lucide-react';
import { contentService } from '../../services/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useProgress } from '../../hooks/useProgress.js';
import { PracticePageSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';
import { useTranslation } from 'react-i18next';

export function PracticePage() {
  const { user } = useAuth();
  const { t } = useTranslation(['practice', 'common']);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterTool, setFilterTool] = useState('all'); // all, excel, sql
  const [filterStatus, setFilterStatus] = useState('all'); // all, uncompleted, completed
  const [filterDifficulty, setFilterDifficulty] = useState('all'); // all, easy, medium, hard
  const [searchQuery, setSearchQuery] = useState('');

  const [sortKey, setSortKey] = useState('default'); // 'default' | 'xp' | 'difficulty'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

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
        setError(err.message || t('practice:fetchError', 'Có lỗi xảy ra khi tải danh sách bài tập.'));
      } finally {
        setLoading(false);
      }
    }
    loadPracticeData();
  }, []);

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

  const handleSortSelect = (key) => {
    if (key === 'default') {
      setSortKey('default');
      setSortOrder('desc');
      setIsSortOpen(false);
    } else if (sortKey === key) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        if (filterTool !== 'all' && q.tool !== filterTool) return false;

        if (filterStatus !== 'all') {
          const completed = isQuestionCompleted(q);
          if (filterStatus === 'completed' && !completed) return false;
          if (filterStatus === 'uncompleted' && completed) return false;
        }

        if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;

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
    { id: 'default', label: t('practice:sortDefault', 'Mặc định') },
    { id: 'xp', label: t('practice:sortXp', 'Mức thưởng XP'), descHint: t('practice:sortDesc', 'Cao → Thấp'), ascHint: t('practice:sortAsc', 'Thấp → Cao') },
    { id: 'difficulty', label: t('practice:sortDiff', 'Độ khó'), descHint: t('practice:diffHardToEasy', 'Khó → Dễ'), ascHint: t('practice:diffEasyToHard', 'Dễ → Khó') },
  ];

  const getSortButtonLabel = () => {
    if (sortKey === 'xp') return t('practice:sortXp', 'Mức thưởng XP');
    if (sortKey === 'difficulty') return t('practice:sortDiff', 'Độ khó');
    return t('practice:sortTitle', 'Sắp xếp');
  };

  if (loading) {
    return <PracticePageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8">
        <ErrorState
          message={error || t('practice:fetchErrorServer', 'Không thể kết nối với ngân hàng câu hỏi.')}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* Header Section: Forensic Decryption Lab */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-end border-b-2 border-border pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-sm border border-primary/35 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            <Terminal className="size-3.5" />
            FORENSIC LAB // WORKSPACE
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('practice:title', 'Luyện tập kỹ năng')}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t('practice:subtitle', 'Khu vực rèn luyện tự do ngoài cốt truyện chính. Chọn một bài tập để nâng cao trình độ trinh thám dữ liệu của bạn bằng Excel hoặc SQL.')}
          </p>
        </div>
      </div>

      {/* Forensic Filter & Calibration Toolbar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterTool('all')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-sm font-mono text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
              filterTool === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            <Layers className="size-3.5" /> {t('practice:allSkills', 'Tất cả kỹ năng')}
          </button>
          <button
            onClick={() => setFilterTool('excel')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-sm font-mono text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
              filterTool === 'excel'
                ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            <FileSpreadsheet className={`size-3.5 ${filterTool === 'excel' ? 'text-primary-foreground' : 'text-primary'}`} /> Excel Spreadsheet
          </button>
          <button
            onClick={() => setFilterTool('sql')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-sm font-mono text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
              filterTool === 'sql'
                ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            <Database className={`size-3.5 ${filterTool === 'sql' ? 'text-primary-foreground' : 'text-primary'}`} /> SQL Database
          </button>
        </div>

        {/* Bottom Row: Compact Search + Sort + Filter + Solved Stats + Shuffle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="relative w-48 sm:w-60 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('practice:searchPlaceholder', 'Tìm kiếm câu hỏi...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-sm border border-border bg-card pl-8 pr-8 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
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

            {/* Sort Button */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className={`h-9 px-3 rounded-sm border flex items-center gap-1.5 font-mono text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                  sortKey !== 'default'
                    ? 'border-primary/60 bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
                title={t('practice:sortList', 'Sắp xếp danh sách')}
              >
                {sortKey === 'default' ? (
                  <ArrowUpDown className="size-3.5" />
                ) : sortOrder === 'desc' ? (
                  <ArrowDownWideNarrow className="size-3.5 text-primary" />
                ) : (
                  <ArrowUpNarrowWide className="size-3.5 text-primary" />
                )}
                <span>{getSortButtonLabel()}</span>
              </button>

              {isSortOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-11 z-50 w-64 rounded-md border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1.5">
                    {t('practice:sortList', 'Sắp xếp danh sách')}
                  </div>
                  <div className="space-y-0.5">
                    {sortFields.map((field) => {
                      const isActive = sortKey === field.id;
                      return (
                        <button
                          key={field.id}
                          onClick={() => handleSortSelect(field.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-primary/10 text-primary font-bold'
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
                            <div className="flex items-center gap-1 text-primary">
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

            {/* Filter Popover Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className={`h-9 px-2.5 rounded-sm border flex items-center justify-center text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                  hasActiveFilters
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
                title={t('practice:filterTitle', 'Bộ lọc nâng cao')}
              >
                <SlidersHorizontal className="size-3.5" />
                {hasActiveFilters && <span className="size-1.5 rounded-full bg-primary ml-1" />}
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-11 z-50 w-72 sm:w-80 rounded-md border border-border bg-card p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <h4 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <SlidersHorizontal className="size-3.5 text-primary" /> {t('practice:filterTitle', 'Bộ lọc nâng cao')}
                    </h4>
                    {hasActiveFilters && (
                      <button
                        onClick={() => {
                          setFilterStatus('all');
                          setFilterDifficulty('all');
                        }}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="size-3" /> {t('practice:reset', 'Đặt lại')}
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Trạng thái
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-sm">
                      {[
                        { id: 'all', label: t('practice:statusAll', 'Tất cả') },
                        { id: 'uncompleted', label: t('practice:statusUncompleted', 'Chưa làm') },
                        { id: 'completed', label: t('practice:statusCompleted', 'Đã làm') },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFilterStatus(item.id)}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                            filterStatus === item.id
                              ? 'bg-background text-foreground shadow-2xs'
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
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted rounded-sm">
                      {[
                        { id: 'all', label: t('practice:diffAll', 'Tất cả') },
                        { id: 'easy', label: t('practice:diffEasy', 'Dễ') },
                        { id: 'medium', label: t('practice:diffMedium', 'Vừa') },
                        { id: 'hard', label: t('practice:diffHard', 'Khó') },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFilterDifficulty(item.id)}
                          className={`py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                            filterDifficulty === item.id
                              ? 'bg-background text-foreground shadow-2xs'
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

          {/* Right side stats & Shuffle button */}
          <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong className="text-foreground">{completedCount}</strong>/{questions.length} {t('practice:solved', 'Đã giải')}
              </span>
            </div>

            <button
              onClick={handleRandomPick}
              className="h-9 px-3 rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/10 transition-all flex items-center gap-1.5 font-mono text-xs font-semibold shadow-2xs cursor-pointer"
              title={t('practice:randomTitle', 'Thử thách ngẫu nhiên một bài tập')}
            >
              <Shuffle className="size-3.5 text-primary" />
              <span className="hidden sm:inline">{t('practice:random', 'Ngẫu nhiên')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Envelope Questions Grid */}
      {filteredQuestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredQuestions.map((q, idx) => {
            const completed = isQuestionCompleted(q);
            return (
              <div
                key={q.id}
                className={`dossier-card group relative flex flex-col rounded-md border ${
                  completed
                    ? 'border-border/60 bg-muted/40 opacity-75 hover:opacity-100'
                    : 'border-border bg-card'
                } p-5 pl-6 shadow-2xs hover:border-primary/60 hover:shadow-md transition-all cursor-pointer`}
                onClick={() => handleStartPractice(q)}
              >
                {completed && (
                  <div
                    className="absolute -top-2.5 -right-2.5 size-6 bg-emerald-600 rounded-sm border-2 border-background flex items-center justify-center shadow-xs z-10"
                    title={t('practice:completed', 'Đã hoàn thành')}
                  >
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary">
                      {q.tool === 'sql' ? (
                        <Database className="size-4" />
                      ) : (
                        <FileSpreadsheet className="size-4" />
                      )}
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      LAB-{String(idx + 1).padStart(2, '0')} // {q.tool?.toUpperCase()}
                    </span>
                  </div>

                  <div
                    className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      q.difficulty === 'hard'
                        ? 'border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : q.difficulty === 'medium'
                        ? 'border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {q.difficulty === 'hard'
                      ? t('practice:diffHard', 'Khó')
                      : q.difficulty === 'medium'
                      ? t('practice:diffMedium', 'Trung bình')
                      : t('practice:diffEasy', 'Dễ')}
                  </div>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {q.prompt}
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/80">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-primary" /> {q.timeEstimate || '15-20p'}
                  </div>
                  <div className="flex items-center gap-1 rounded-sm border border-primary/35 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                    <Award className="size-3.5" /> +{q.rewards.baseXp} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 rounded-md border border-dashed border-border bg-card p-6 text-center">
          <div className="relative mb-4">
            <div className="size-14 bg-primary/10 rounded-sm border border-primary/30 flex items-center justify-center">
              <Search className="size-6 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 size-5 bg-background rounded-sm flex items-center justify-center">
              <AlertCircle className="size-3.5 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-base font-bold text-foreground">{t('practice:emptyTitle', 'Không tìm thấy bài tập')}</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {t('practice:emptyDesc', 'Không tìm thấy hồ sơ luyện tập nào khớp với từ khóa. Hãy thử lại nhé!')}
          </p>
        </div>
      )}
    </div>
  );
}
