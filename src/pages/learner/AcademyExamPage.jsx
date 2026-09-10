import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  FileSpreadsheet,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  BookOpen,
  Send,
  HelpCircle,
  Check,
  X,
  Printer,
  Share2,
} from 'lucide-react';
import { academyExamService } from '../../services/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { AcademyCertificateModal } from '../../components/academy/AcademyCertificateModal.jsx';

export function AcademyExamPage() {
  const { courseSlug = 'excel-academy' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid || user?.id;
  const userName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'Thám Tử Dữ Liệu';

  // Load Exam Configuration
  const examResponse = useMemo(() => academyExamService.getExam(courseSlug), [courseSlug]);
  const exam = examResponse?.data;

  // Phases: 'intro' | 'in_progress' | 'results'
  const [phase, setPhase] = useState('intro');

  // Exam In-Progress State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam?.durationSeconds || 900);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Exam Result State
  const [examResult, setExamResult] = useState(null);
  const [savedResult, setSavedResult] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Timer Ref
  const timerRef = useRef(null);

  // Check existing result
  useEffect(() => {
    if (userId && courseSlug) {
      const existing = academyExamService.getExamResult(userId, courseSlug);
      if (existing?.data) {
        setSavedResult(existing.data);
      }
    }
  }, [userId, courseSlug]);

  // Timer Countdown Effect
  useEffect(() => {
    if (phase === 'in_progress') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Format Time Helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Exam
  const handleStartExam = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(exam?.durationSeconds || 900);
    setExamResult(null);
    setPhase('in_progress');
  };

  // Select Option
  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Auto Submit when time runs out
  const handleAutoSubmit = () => {
    handleFinalSubmit();
  };

  // Submit Confirmation Trigger
  const handleRequestSubmit = () => {
    setShowConfirmModal(true);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = (exam?.durationSeconds || 900) - timeLeft;

    try {
      const res = await academyExamService.submitExam({
        learnerId: userId,
        learnerName: userName,
        courseSlug,
        answers,
        timeSpentSeconds: timeSpent,
      });

      if (res.data) {
        setExamResult(res.data);
        setSavedResult(res.data);
        setPhase('results');
        if (res.data.isPassed) {
          setIsCertModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Lỗi khi nộp bài thi:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="size-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy bài thi</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Khóa học <code>{courseSlug}</code> hiện chưa có bài kiểm tra tốt nghiệp.
        </p>
        <Link
          to="/academy"
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
        >
          Quay về danh sách khóa học
        </Link>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isExcel = courseSlug.startsWith('excel');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 animate-fade-in">
      
      {/* ── TOP BREADCRUMB / BACK ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to={`/academy/${courseSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>Quay về giáo trình {exam.shortTitle}</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-bold">
          <Sparkles className="size-3.5" />
          <span>Kỳ Thi Tốt Nghiệp Chuẩn Hóa</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 1: BRIEFING / INTRO                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {phase === 'intro' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-3xl bg-gradient-to-br from-card via-card to-amber-500/5 border border-border p-6 sm:p-10 shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <GraduationCap className="size-48" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold mb-4">
                {isExcel ? <FileSpreadsheet className="size-4 text-emerald-500" /> : <Database className="size-4 text-blue-500" />}
                <span>{exam.courseTitle}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground mb-3">
                Kỳ Thi Sát Hạch & Cấp Chứng Chỉ Tốt Nghiệp
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {exam.description}
              </p>

              {/* Rules Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-center">
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">Số câu hỏi</div>
                  <div className="text-lg font-bold text-foreground font-mono">{totalQuestions} câu</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-center">
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">Thời gian</div>
                  <div className="text-lg font-bold text-amber-500 font-mono">15 phút</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-center">
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">Điểm đạt chuẩn</div>
                  <div className="text-lg font-bold text-emerald-500 font-mono">≥ {exam.passingScorePercent}%</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-center">
                  <div className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">Phần thưởng</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">+{exam.rewardXp} XP</div>
                </div>
              </div>

              {/* Previous Result Banner if Available */}
              {savedResult && (
                <div
                  className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    savedResult.isPassed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {savedResult.isPassed ? (
                      <CheckCircle2 className="size-6 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="size-6 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {savedResult.isPassed
                          ? `Bạn đã đạt chứng chỉ với số điểm ${savedResult.scorePercent}% (${savedResult.grade})!`
                          : `Lần thi trước bạn đạt ${savedResult.scorePercent}% (chưa đủ 80% để nhận chứng chỉ).`}
                      </div>
                      <div className="text-xs opacity-80">
                        {savedResult.isPassed
                          ? 'Bạn có thể thi lại để cải thiện điểm số hoặc xem lại chứng chỉ bất kỳ lúc nào.'
                          : 'Hãy ôn tập lại các bài học và thử sức lại ngay bây giờ.'}
                      </div>
                    </div>
                  </div>

                  {savedResult.isPassed && (
                    <button
                      type="button"
                      onClick={() => setIsCertModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Award className="size-4" />
                      <span>Xem Chứng Chỉ</span>
                    </button>
                  )}
                </div>
              )}

              {/* CTA Action */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-95 transition-all shadow-md flex items-center gap-2"
                >
                  <GraduationCap className="size-5" />
                  <span>{savedResult ? 'Bắt đầu thi lại' : 'Bắt đầu làm bài thi'}</span>
                </button>
                <Link
                  to={`/academy/${courseSlug}`}
                  className="px-5 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-colors"
                >
                  Ôn lại lý thuyết
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 2: IN PROGRESS (EXAM RUNNER)                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {phase === 'in_progress' && (
        <div className="space-y-6">
          {/* Top Sticky Bar */}
          <div className="sticky top-16 z-20 rounded-2xl bg-card/95 backdrop-blur-md border border-border p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            {/* Question Counter & Category */}
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Câu {currentQuestionIndex + 1} / {totalQuestions}
              </div>
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-primary" />
                <span>{currentQuestion.category}</span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm border transition-colors ${
                timeLeft < 120
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse'
                  : 'bg-muted/40 border-border text-foreground'
              }`}
            >
              <Clock className="size-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleRequestSubmit}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs transition-opacity shadow-xs flex items-center gap-1.5"
            >
              <Send className="size-3.5" />
              <span>Nộp bài thi</span>
            </button>
          </div>

          {/* Quick Jumper Navigator */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground mr-2 shrink-0">Chuyển câu:</span>
            {exam.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`size-8 rounded-lg text-xs font-bold font-mono shrink-0 transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : isAnswered
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm">
            {/* Prompt */}
            <div className="mb-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground leading-relaxed whitespace-pre-line">
                {currentQuestion.text}
              </h2>

              {currentQuestion.codeSnippet && (
                <div className="mt-4 p-4 rounded-xl bg-muted/60 border border-border font-mono text-xs text-foreground overflow-x-auto">
                  <code>{currentQuestion.codeSnippet}</code>
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = answers[currentQuestion.id] === oIdx;
                const letter = String.fromCharCode(65 + oIdx);

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 group ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-xs'
                        : 'bg-card border-border hover:bg-muted/50 hover:border-border/80'
                    }`}
                  >
                    <span
                      className={`size-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                      }`}
                    >
                      {letter}
                    </span>
                    <span
                      className={`text-sm leading-relaxed ${
                        isSelected ? 'font-semibold text-foreground' : 'text-foreground/90'
                      }`}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation Between Questions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="size-4" />
                <span>Câu trước</span>
              </button>

              <span className="text-xs text-muted-foreground font-mono">
                Đã trả lời {answeredCount} / {totalQuestions} câu
              </span>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold transition-opacity shadow-xs"
                >
                  <span>Câu tiếp</span>
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestSubmit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Send className="size-3.5" />
                  <span>Nộp bài thi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 3: RESULTS & ANSWER REVIEW                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {phase === 'results' && examResult && (
        <div className="space-y-8">
          {/* Result Hero Banner */}
          <div
            className={`rounded-3xl border p-6 sm:p-10 shadow-sm text-center relative overflow-hidden ${
              examResult.isPassed
                ? 'bg-gradient-to-br from-card via-card to-emerald-500/10 border-emerald-500/30'
                : 'bg-gradient-to-br from-card via-card to-rose-500/10 border-rose-500/30'
            }`}
          >
            <div className="inline-flex items-center justify-center size-16 rounded-2xl mb-4 shadow-sm">
              {examResult.isPassed ? (
                <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
                  <Award className="size-9" />
                </div>
              ) : (
                <div className="size-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center">
                  <RotateCcw className="size-8" />
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
              {examResult.isPassed
                ? '🎉 Chúc Mừng! Bạn Đã Xuất Sắc Vượt Qua Kỳ Thi'
                : 'Rất Tiếc! Bạn Chưa Đạt Điểm Chuẩn (≥ 80%)'}
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
              {examResult.isPassed
                ? `Bạn đã đạt ${examResult.scorePercent}% điểm và mở khóa Chứng chỉ tốt nghiệp cùng +${examResult.rewardXp} XP thưởng!`
                : `Bạn đạt ${examResult.scorePercent}% điểm (${examResult.totalCorrect}/${examResult.totalQuestions} câu đúng). Hãy ôn lại các câu trả lời bên dưới và thi lại nhé!`}
            </p>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-6">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Điểm số</div>
                <div className={`text-xl font-black font-mono ${examResult.isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {`${examResult.scorePercent}%`}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Câu đúng</div>
                <div className="text-xl font-black text-foreground font-mono">
                  {examResult.totalCorrect} / {examResult.totalQuestions}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Xếp loại</div>
                <div className="text-xs font-bold text-amber-500 truncate pt-1">
                  {examResult.grade}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Thời gian</div>
                <div className="text-xl font-black text-foreground font-mono">
                  {formatTime(examResult.timeSpentSeconds || 0)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {examResult.isPassed && examResult.certificate && (
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Award className="size-4" />
                  <span>Xem & In Chứng Chỉ Tốt Nghiệp</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStartExam}
                className="px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-colors flex items-center gap-2"
              >
                <RotateCcw className="size-4" />
                <span>Thi lại bài này</span>
              </button>

              <Link
                to={`/academy/${courseSlug}`}
                className="px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-colors"
              >
                Về khóa học
              </Link>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              <span>Chi Tiết Đáp Án & Giải Thích Từng Câu ({totalQuestions} câu)</span>
            </h2>

            <div className="space-y-4">
              {examResult.questionResults.map((qr, idx) => {
                const isCorrect = qr.isCorrect;
                return (
                  <div
                    key={qr.questionId}
                    className={`rounded-2xl border p-5 transition-all ${
                      isCorrect
                        ? 'bg-card border-border/80'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {qr.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {isCorrect ? (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <Check className="size-4" /> Đúng (+1)
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1">
                            <X className="size-4" /> Sai (0)
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
                      {qr.text}
                    </p>

                    {/* Options list in review */}
                    <div className="space-y-2 mb-4">
                      {qr.options.map((opt, oIdx) => {
                        const isLearnerChoice = qr.selectedIndex === oIdx;
                        const isCorrectAnswer = qr.correctIndex === oIdx;
                        const letter = String.fromCharCode(65 + oIdx);

                        let optClass = 'bg-muted/30 border-border/50 text-foreground/80';
                        if (isCorrectAnswer) {
                          optClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-semibold';
                        } else if (isLearnerChoice && !isCorrect) {
                          optClass = 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200 line-through opacity-80';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${optClass}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold shrink-0">{letter}.</span>
                              <span>{opt}</span>
                            </div>
                            {isCorrectAnswer && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0">
                                Đáp án đúng
                              </span>
                            )}
                            {isLearnerChoice && !isCorrectAnswer && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 shrink-0">
                                Bạn đã chọn
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">💡 Giải thích chi tiết: </strong>
                      {qr.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM SUBMIT MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Xác nhận nộp bài thi</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {answeredCount < totalQuestions ? (
                <span>
                  Bạn mới trả lời <strong>{answeredCount} / {totalQuestions}</strong> câu hỏi. Vẫn còn{' '}
                  <strong className="text-rose-500">{totalQuestions - answeredCount}</strong> câu chưa có đáp án.
                  Bạn có chắc chắn muốn nộp bài không?
                </span>
              ) : (
                <span>
                  Bạn đã trả lời đầy đủ <strong>{totalQuestions} / {totalQuestions}</strong> câu hỏi. Bạn đã sẵn sàng
                  nộp bài để hệ thống chấm điểm?
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors"
              >
                Quay lại làm bài
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold transition-opacity"
              >
                {isSubmitting ? 'Đang chấm điểm...' : 'Xác nhận nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CERTIFICATE MODAL ── */}
      <AcademyCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={examResult?.certificate || savedResult?.certificate}
      />

    </div>
  );
}
