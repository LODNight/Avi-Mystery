import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  FileSpreadsheet,
  Database,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Award,
  Zap,
  Bookmark,
  Pin,
} from 'lucide-react';
import { ACADEMY_COURSES, getCourseBySlug, getCourseFlatLessons } from '../../mocks/data/academy/academySyllabus.js';
import { TOPIC_SANDBOX_PRESETS } from '../../mocks/data/sandbox/defaultSandboxDatasets.js';
import { knowledgeService, investigationNotebookService } from '../../services/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { KnowledgeViewer } from '../../components/knowledge/KnowledgeViewer.jsx';

export function AcademyCoursePage() {
  const { courseSlug = 'excel-academy', topicId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromMission = searchParams.get('fromMission');
  const toolParam = searchParams.get('tool');
  const { user } = useAuth();
  const userId = user?.uid || user?.id;

  // Selected course object
  const currentCourse = useMemo(() => getCourseBySlug(courseSlug), [courseSlug]);

  // Flat lessons list of current course
  const flatLessons = useMemo(() => getCourseFlatLessons(currentCourse), [currentCourse]);

  // Active lesson determination
  const activeLesson = useMemo(() => {
    if (topicId) {
      const found = flatLessons.find(l => l.topicId === topicId);
      if (found) return found;
    }
    return flatLessons[0] || null;
  }, [flatLessons, topicId]);

  // State
  const [topicsMap, setTopicsMap] = useState({});
  const [readTopics, setReadTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openChapters, setOpenChapters] = useState({});

  // Quiz state for the current active lesson
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize all chapters as open
  useEffect(() => {
    if (currentCourse?.chapters) {
      const initialOpen = {};
      currentCourse.chapters.forEach(ch => {
        initialOpen[ch.id] = true;
      });
      setOpenChapters(initialOpen);
    }
  }, [currentCourse]);

  // Reset quiz state when switching lessons
  useEffect(() => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    setIsCorrect(false);
    setShowCelebration(false);
  }, [activeLesson?.topicId]);

  // Load all published topics & learner's read progress
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [topicsRes, readRes] = await Promise.all([
          knowledgeService.getPublishedTopics(),
          userId ? knowledgeService.getReadTopics(userId) : Promise.resolve({ data: [] }),
        ]);

        if (isMounted) {
          if (topicsRes.data) {
            const map = {};
            topicsRes.data.forEach(t => {
              map[t.id] = t;
            });
            setTopicsMap(map);
          }
          if (readRes.data) {
            setReadTopics(readRes.data);
          }
        }
      } catch (err) {
        console.error('Error loading Academy course data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // If topicId in URL does not match activeLesson, sync URL
  useEffect(() => {
    if (activeLesson && (!topicId || topicId !== activeLesson.topicId)) {
      const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      navigate(`/academy/${currentCourse.slug}/${activeLesson.topicId}${searchStr}`, { replace: true });
    }
  }, [activeLesson, currentCourse.slug, topicId, navigate, searchParams]);

  // Investigation Notebook state for active topic
  const [isNotebookPinned, setIsNotebookPinned] = useState(false);

  useEffect(() => {
    if (activeLesson?.topicId) {
      setIsNotebookPinned(investigationNotebookService.isNotePinned(activeLesson.topicId));
    }
  }, [activeLesson?.topicId]);

  // Active topic markdown and preset data
  const currentTopicData = activeLesson ? topicsMap[activeLesson.topicId] : null;
  const sandboxPreset = activeLesson ? TOPIC_SANDBOX_PRESETS[activeLesson.topicId] : null;

  const handleTogglePinNotebook = () => {
    if (!activeLesson?.topicId) return;
    if (isNotebookPinned) {
      investigationNotebookService.unpinNote(activeLesson.topicId);
      setIsNotebookPinned(false);
    } else {
      const formulaSnippet = sandboxPreset?.defaultFormula || sandboxPreset?.defaultSql || '';
      const excerpt = formulaSnippet ? `Cú pháp mẫu: ${formulaSnippet}` : (activeLesson.title || 'Lý thuyết nghiệp vụ');
      investigationNotebookService.pinNote({
        topicId: activeLesson.topicId,
        title: activeLesson.title,
        excerpt,
        tool: currentCourse.tool,
        courseSlug: currentCourse.slug,
      });
      setIsNotebookPinned(true);
    }
  };

  // Navigation indices
  const currentLessonIndex = flatLessons.findIndex(l => l.topicId === activeLesson?.topicId);
  const prevLesson = currentLessonIndex > 0 ? flatLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < flatLessons.length - 1 ? flatLessons[currentLessonIndex + 1] : null;

  // Completion calculation for current course
  const completedLessonsCount = flatLessons.filter(l => readTopics.includes(l.topicId)).length;
  const progressPercent = flatLessons.length > 0 ? Math.round((completedLessonsCount / flatLessons.length) * 100) : 0;

  // Toggle chapter accordion
  const toggleChapter = (chapterId) => {
    setOpenChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Mark topic completed
  const handleMarkAsCompleted = async (targetTopicId = activeLesson?.topicId) => {
    if (!targetTopicId) return;
    if (!readTopics.includes(targetTopicId)) {
      const updated = [...readTopics, targetTopicId];
      setReadTopics(updated);
      if (userId) {
        try {
          await knowledgeService.markTopicAsRead(userId, targetTopicId);
        } catch (err) {
          console.error('Failed to save read progress:', err);
        }
      }
    }
  };

  // Quiz submission
  const handleOptionSelect = (index) => {
    if (quizSubmitted && isCorrect) return; // Prevent change after correct
    setSelectedOption(index);
    setQuizSubmitted(false);
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null || !activeLesson?.checkpointQuiz) return;
    const correct = selectedOption === activeLesson.checkpointQuiz.correctIndex;
    setIsCorrect(correct);
    setQuizSubmitted(true);

    if (correct) {
      setShowCelebration(true);
      handleMarkAsCompleted(activeLesson.topicId);
    }
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    setIsCorrect(false);
    setShowCelebration(false);
  };

  if (isLoading && Object.keys(topicsMap).length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
          <p className="text-xs font-medium text-muted-foreground animate-pulse">
            Đang tải giáo trình Học viện Academy...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
      {/* ── LEFT SIDEBAR: W3Schools Style Course Syllabus ── */}
      <aside
        className={`${
          isSidebarOpen ? 'w-80 border-r' : 'w-0 border-r-0'
        } shrink-0 bg-card/60 backdrop-blur-md border-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-20`}
      >
        {/* Course Switcher & Header */}
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-500 flex items-center gap-1">
              <GraduationCap className="size-3.5" />
              Chương trình chuẩn hóa
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Thu gọn mục lục"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>

          {/* Switch Course Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
            {ACADEMY_COURSES.map(course => {
              const isSelected = course.slug === currentCourse.slug;
              const Icon = course.iconName === 'FileSpreadsheet' ? FileSpreadsheet : Database;
              return (
                <button
                  key={course.id}
                  onClick={() => navigate(`/academy/${course.slug}`)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'bg-card text-foreground shadow-xs border border-border font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`size-3.5 ${isSelected ? 'text-emerald-500' : ''}`} />
                  <span className="truncate">{course.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-3.5 pt-3 border-t border-border/40">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-foreground">Tiến độ khóa học</span>
              <span className="font-mono font-bold text-emerald-500">
                {completedLessonsCount}/{flatLessons.length} bài ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Syllabus Chapter Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {currentCourse.chapters.map((chapter, chIdx) => {
            const isOpen = openChapters[chapter.id] !== false;
            const chapterCompletedCount = chapter.lessons.filter(l => readTopics.includes(l.topicId)).length;
            const isChapterAllDone = chapterCompletedCount === chapter.lessons.length;

            return (
              <div key={chapter.id} className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
                {/* Chapter Title Bar */}
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center justify-between p-2.5 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                        isOpen ? 'transform rotate-0' : 'transform -rotate-90'
                      }`}
                    />
                    <span className="text-xs font-bold text-foreground truncate">
                      {chapter.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 pl-1">
                    {chapterCompletedCount}/{chapter.lessons.length}
                  </span>
                </button>

                {/* Lesson List */}
                {isOpen && (
                  <div className="p-1 space-y-0.5">
                    {chapter.lessons.map((lesson, lIdx) => {
                      const isActive = activeLesson?.topicId === lesson.topicId;
                      const isCompleted = readTopics.includes(lesson.topicId);

                      return (
                        <Link
                          key={lesson.topicId}
                          to={`/academy/${currentCourse.slug}/${lesson.topicId}`}
                          className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-all group ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className={`size-4 shrink-0 ${isActive ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
                            )}
                            <span className="truncate">
                              {lesson.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono opacity-60 shrink-0">
                            {lesson.duration}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── EXAM & CERTIFICATION LINK ── */}
          <div className="pt-2 border-t border-border mt-3">
            <Link
              to={`/academy/${currentCourse.slug}/exam`}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500/60 text-foreground transition-all group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Award className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
                    Kỳ Thi Tốt Nghiệp
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    10 câu • Cấp Chứng Chỉ
                  </div>
                </div>
              </div>
              <ChevronRight className="size-4 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── MAIN LESSON READING AREA ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Top Floating Bar: Navigation & Sidebar Toggle */}
        <header className="h-12 border-b border-border bg-card/40 backdrop-blur-md px-4 flex items-center justify-between gap-3 shrink-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Mở mục lục bài học"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <span className="hover:text-foreground cursor-pointer font-medium">Học viện</span>
              <ChevronRight className="size-3 shrink-0 opacity-50" />
              <span className="text-foreground font-semibold truncate">{currentCourse.shortTitle}</span>
              {activeLesson && (
                <>
                  <ChevronRight className="size-3 shrink-0 opacity-50" />
                  <span className="text-emerald-500 font-medium truncate">{activeLesson.title}</span>
                </>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePinNotebook}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isNotebookPinned
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={isNotebookPinned ? 'Đã ghim trong Sổ tay điều tra' : 'Ghim vào Sổ tay điều tra để tra cứu trong Workspace'}
            >
              <Bookmark className={`size-3.5 ${isNotebookPinned ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isNotebookPinned ? 'Đã ghim sổ tay' : 'Ghim sổ tay'}</span>
            </button>

            <Link
              to={`/sandbox?tool=${currentCourse.tool}&topicId=${activeLesson?.topicId || ''}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold transition-colors"
              title="Mở Sandbox trong chế độ Focus Mode"
            >
              <Sparkles className="size-3.5" />
              <span className="hidden sm:inline">Mở Sandbox</span>
            </Link>

            <button
              onClick={() => handleMarkAsCompleted()}
              disabled={readTopics.includes(activeLesson?.topicId)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                readTopics.includes(activeLesson?.topicId)
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer'
              }`}
            >
              <CheckCircle2 className="size-3.5" />
              <span>{readTopics.includes(activeLesson?.topicId) ? 'Đã hoàn thành' : 'Đánh dấu xong'}</span>
            </button>
          </div>
        </header>

        {/* ── RETURN TO INVESTIGATION BANNER (Learning Loop Bridge) ── */}
        {fromMission && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 min-w-0">
              <Sparkles className="size-4 text-amber-500 shrink-0" />
              <span className="truncate">
                Bạn đang tra cứu tài liệu hỗ trợ cho <strong>Vụ án {fromMission}</strong>. Đã nắm vững kiến thức?
              </span>
            </div>
            <Link
              to={toolParam === 'sql' ? `/missions/${fromMission}/sql` : `/missions/${fromMission}/workspace`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold transition-all shrink-0 shadow-xs cursor-pointer"
            >
              <span>Quay lại phá án</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}

        {/* Scrollable Reading Content */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 lg:px-20 max-w-4xl w-full mx-auto space-y-10">
          {/* Lesson Header Banner */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {activeLesson?.difficulty || 'Căn bản'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-muted-foreground bg-muted">
                {activeLesson?.duration || '10 phút'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase text-muted-foreground bg-muted">
                {currentCourse.tool}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {activeLesson?.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {activeLesson?.chapterTitle}
            </p>
          </div>

          {/* Detailed Markdown Theory */}
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {currentTopicData?.contentMarkdown ? (
              <KnowledgeViewer markdown={currentTopicData.contentMarkdown} />
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-border text-center text-muted-foreground text-sm">
                Nội dung bài học đang được cập nhật. Bạn có thể mở thực hành ngay trong Sandbox bên dưới.
              </div>
            )}
          </div>

          {/* ── CARD: TRY IT YOURSELF (W3Schools Style) ── */}
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-950/10 dark:bg-emerald-950/20 p-6 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                    Thực Hành Tương Tác: Try it Yourself
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Thử nghiệm công thức trực tiếp trên bảng tính hoặc truy vấn cơ sở dữ liệu SQLite
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                W3Schools Sandbox
              </span>
            </div>

            {/* Code preview block */}
            <div className="rounded-xl bg-card border border-border/80 p-4 font-mono text-xs mb-4 overflow-x-auto shadow-inner">
              <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">
                {currentCourse.tool === 'excel' ? 'Công thức mẫu:' : 'Câu truy vấn SQL mẫu:'}
              </div>
              <code className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {sandboxPreset?.defaultFormula || sandboxPreset?.defaultSql || '=SUM(D2:D9)'}
              </code>
              {sandboxPreset?.examples?.[0]?.explanation && (
                <p className="text-muted-foreground text-xs font-sans mt-2">
                  👉 {sandboxPreset.examples[0].explanation}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-500 shrink-0" />
                <span>Mở trong chế độ Focus Mode không gián đoạn</span>
              </div>

              <Link
                to={`/sandbox?tool=${currentCourse.tool}&topicId=${activeLesson?.topicId}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all group"
              >
                <span>Mở Thực Hành Ngay (Try it Yourself)</span>
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── CARD: QUICK CHECKPOINT (Interactive In-Lesson Quiz) ── */}
          {activeLesson?.checkpointQuiz && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <HelpCircle className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Quick Checkpoint: Củng Cố Kiến Thức
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Trả lời chính xác để nhận +20 XP và hoàn thành bài học
                    </p>
                  </div>
                </div>

                {quizSubmitted && isCorrect && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                    <Award className="size-3.5" />
                    +20 XP
                  </span>
                )}
              </div>

              {/* Question */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground">
                  {activeLesson.checkpointQuiz.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {activeLesson.checkpointQuiz.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isSelected = selectedOption === idx;
                  const isCorrectChoice = idx === activeLesson.checkpointQuiz.correctIndex;

                  let optionStyle = 'border-border hover:border-border/80 bg-background text-foreground';

                  if (quizSubmitted) {
                    if (isCorrectChoice) {
                      optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold';
                    } else if (isSelected && !isCorrectChoice) {
                      optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300';
                    } else {
                      optionStyle = 'opacity-50 border-border bg-background';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-primary bg-primary/5 font-semibold text-foreground';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="size-6 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {letter}
                        </span>
                        <span className="truncate">{option}</span>
                      </div>

                      {quizSubmitted && isCorrectChoice && (
                        <Check className="size-4 text-emerald-500 shrink-0" />
                      )}
                      {quizSubmitted && isSelected && !isCorrectChoice && (
                        <X className="size-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Actions */}
              {quizSubmitted && (
                <div
                  className={`p-4 rounded-xl text-xs mb-5 ${
                    isCorrect
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        <span>Chính xác! Bạn đã nắm vững kiến thức bài này.</span>
                      </>
                    ) : (
                      <>
                        <X className="size-4 text-rose-500" />
                        <span>Chưa chính xác! Hãy thử lại hoặc đọc kỹ lại ví dụ bên trên nhé.</span>
                      </>
                    )}
                  </div>
                  {isCorrect && (
                    <p className="mt-1 opacity-90">
                      💡 <strong>Giải thích:</strong> {activeLesson.checkpointQuiz.explanation}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {quizSubmitted && !isCorrect ? (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Làm lại câu hỏi</span>
                  </button>
                ) : <div />}

                {!quizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={selectedOption === null}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Kiểm tra đáp án</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                ) : isCorrect && nextLesson ? (
                  <Link
                    to={`/academy/${currentCourse.slug}/${nextLesson.topicId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Sang bài tiếp theo</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          )}

          {/* ── BOTTOM NAVIGATION FOOTER ── */}
          <div className="pt-8 pb-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevLesson ? (
              <Link
                to={`/academy/${currentCourse.slug}/${prevLesson.topicId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors group"
              >
                <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="truncate">Bài trước: {prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                to={`/academy/${currentCourse.slug}/${nextLesson.topicId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold transition-colors shadow-xs group"
              >
                <span className="truncate">Bài tiếp theo: {nextLesson.title}</span>
                <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <Link
                to={`/academy/${currentCourse.slug}/exam`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold text-xs transition-all shadow-md group"
              >
                <Award className="size-4" />
                <span>Hoàn thành giáo trình! Làm bài thi tốt nghiệp ❯</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
