import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Database,
  Search,
  Award,
  Sparkles,
  AlertCircle,
  Clock,
  Filter,
  ChevronDown,
  Check,
} from 'lucide-react';
import { contentService } from '../../services/index.js';
import { useProgress } from '../../hooks/useProgress.js';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/EmptyState.jsx';

export function PracticePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTool, setFilterTool] = useState('all'); // all, excel, sql
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();
  const { progressList } = useProgress();

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
          const adjustedQuestions = (res.data || []).map(q => {
            const diff = q.difficulty || 'easy';
            let xp = 100;
            let time = '15-20p';
            if (diff === 'easy' || diff === 'beginner') { xp = 50; time = '5-10p'; q.difficulty = 'easy'; }
            else if (diff === 'medium' || diff === 'intermediate') { xp = 100; time = '15-20p'; q.difficulty = 'medium'; }
            else if (diff === 'hard' || diff === 'advanced') { xp = 200; time = '30-45p'; q.difficulty = 'hard'; }
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

  const isQuestionCompleted = (questionId) => {
    return progressList?.some(p => p.contentId === questionId && p.status === 'completed');
  };

  const handleStartPractice = (question) => {
    const route =
      question.tool === 'sql'
        ? `/missions/${question.legacyMissionId}/sql`
        : `/missions/${question.legacyMissionId}/workspace`;
    navigate(route, { state: { mode: 'practice' } });
  };

  const filteredQuestions = questions
    .filter((q) => {
      const matchesTool = filterTool === 'all' || q.tool === filterTool;
      const matchesSearch = q.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTool && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'xp_desc') return (b.rewards?.baseXp || 0) - (a.rewards?.baseXp || 0);
      if (sortBy === 'xp_asc') return (a.rewards?.baseXp || 0) - (b.rewards?.baseXp || 0);
      
      const diffWeight = { 'easy': 1, 'medium': 2, 'hard': 3 };
      if (sortBy === 'difficulty_asc') return (diffWeight[a.difficulty] || 0) - (diffWeight[b.difficulty] || 0);
      if (sortBy === 'difficulty_desc') return (diffWeight[b.difficulty] || 0) - (diffWeight[a.difficulty] || 0);
      
      return 0; // default
    });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
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

      {/* Filters & Search */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl w-full xl:w-auto overflow-x-auto shrink-0">
          <button
            onClick={() => setFilterTool('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              filterTool === 'all'
                ? 'bg-background shadow-xs text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterTool('excel')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              filterTool === 'excel'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileSpreadsheet className="size-4" /> Excel
          </button>
          <button
            onClick={() => setFilterTool('sql')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              filterTool === 'sql'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="size-4" /> SQL
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto shrink-0 items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-muted-foreground whitespace-nowrap hidden lg:inline-block">
              Sắp xếp theo
            </span>
            <div className="relative w-full sm:w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-input bg-background pl-4 pr-10 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer shadow-sm"
              >
                <option value="default" className="bg-background text-foreground">Mặc định</option>
                
                <optgroup label="Mức thưởng XP" className="bg-muted text-muted-foreground font-bold">
                  <option value="xp_desc" className="bg-background text-foreground font-medium">XP (Cao đến Thấp)</option>
                  <option value="xp_asc" className="bg-background text-foreground font-medium">XP (Thấp đến Cao)</option>
                </optgroup>
                
                <optgroup label="Mức độ khó" className="bg-muted text-muted-foreground font-bold">
                  <option value="difficulty_asc" className="bg-background text-foreground font-medium">Độ khó (Dễ đến Khó)</option>
                  <option value="difficulty_desc" className="bg-background text-foreground font-medium">Độ khó (Khó đến Dễ)</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown className="size-4" />
              </div>
            </div>
          </div>
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      {filteredQuestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuestions.map((q) => {
            const completed = isQuestionCompleted(q.id);
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
