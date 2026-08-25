import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Zap,
  Search,
  TableProperties,
  Award,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';
import { onboardingService, ONBOARDING_STATUS } from './onboardingService.js';
import { Button } from '../../components/ui/Button.jsx';

/**
 * WelcomeGatePage — First-Run Experience (Step 6.5.2)
 *
 * Hiển thị khi user mới đăng ký. Không dùng LearnerLayout (full-screen).
 * Có 2 lối ra:
 *   1. "Bắt đầu huấn luyện" → /onboarding/case-0 (setStatus IN_PROGRESS)
 *   2. "Bỏ qua"             → /dashboard       (setStatus SKIPPED)
 */
export function WelcomeGatePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Không được dùng useEffect để redirect — kiểm tra ngay trong render
  // để tránh flash nội dung trước khi redirect

  // Chưa load xong auth → chờ
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Chưa login → về /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Đã hoàn thành hoặc bỏ qua → về /dashboard (không lặp lại)
  if (onboardingService.isTerminal(user.id)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleStartTutorial() {
    onboardingService.setStatus(user.id, ONBOARDING_STATUS.IN_PROGRESS);
    navigate('/onboarding/case-0', { replace: true });
  }

  function handleSkip() {
    onboardingService.setStatus(user.id, ONBOARDING_STATUS.SKIPPED);
    navigate('/dashboard', { replace: true });
  }

  const firstName = user.name?.split(' ').slice(-1)[0] || 'Nhà điều tra';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* ── Header ── */}
      <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Zap className="size-5 fill-current" />
            </span>
            <p className="font-mono text-base font-bold tracking-tight">
              avi<span className="text-primary">mystery</span>
            </p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun className="size-4 text-amber-400" />
              : <Moon className="size-4" />
            }
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-5 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Hero Copy ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-primary mb-6">
              <Sparkles className="size-3.5" />
              <span>Nhà điều tra mới gia nhập</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Chào mừng,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-primary to-amber-600">
                {firstName}! 🎉
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Trước khi bắt đầu điều tra các vụ án kinh doanh thật, hãy cùng khám phá{' '}
              <strong className="text-foreground">cách nền tảng hoạt động</strong>{' '}
              qua một vụ án đơn giản — chỉ mất khoảng 2 phút.
            </p>

            {/* What you'll learn bullets */}
            <ul className="mt-7 space-y-3">
              {[
                { icon: TableProperties, text: 'Đọc hiểu Hồ sơ vụ án & dữ liệu' },
                { icon: Search,          text: 'Sử dụng bảng tính để tìm manh mối' },
                { icon: Award,           text: 'Nộp bài và nhận XP thưởng' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex-shrink-0 grid size-7 place-items-center rounded-lg bg-primary/10">
                    <Icon className="size-3.5 text-primary" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            {/* Time estimate */}
            <div className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              <span>Ước tính: <strong className="text-foreground">~2 phút</strong></span>
            </div>
          </div>

          {/* ── RIGHT: Action Card ── */}
          <div className="relative">
            {/* Ambient glow */}
            <div className="absolute -top-12 -right-12 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 size-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="relative rounded-3xl border border-border bg-card p-7 sm:p-9 shadow-2xl space-y-6">
              {/* Progress steps visual */}
              <div className="flex items-center gap-2">
                {['Briefing', 'Dữ liệu', 'Phân tích', 'Nộp bài'].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`grid size-8 place-items-center rounded-full border-2 text-xs font-bold font-mono transition-all ${
                          i === 0
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted text-muted-foreground'
                        }`}
                      >
                        {i === 0 ? <CheckCircle2 className="size-4" /> : i + 1}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground hidden sm:block">{step}</span>
                    </div>
                    {i < 3 && (
                      <div className="flex-1 h-px bg-border" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Case preview card */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🕵️</span>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Vụ án #00 · Tutorial
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Tính doanh thu cho đơn hàng đầu tiên
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Giám đốc cần biết tổng doanh thu của đơn hàng ORD-001. Bạn có dữ liệu, hãy sử dụng Excel để tìm ra con số.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    +50 XP
                  </span>
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    Excel · Cơ bản
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Button
                  id="welcome-start-tutorial"
                  onClick={handleStartTutorial}
                  fullWidth
                  size="lg"
                  className="shadow-lg shadow-primary/20 gap-2"
                >
                  Bắt đầu khóa huấn luyện
                  <ArrowRight className="size-4" />
                </Button>

                <button
                  id="welcome-skip-tutorial"
                  onClick={handleSkip}
                  className="w-full flex items-center justify-center gap-1 py-2.5 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors rounded-xl hover:bg-muted"
                >
                  Bỏ qua, tôi đã có kinh nghiệm
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Fine print */}
              <p className="text-center text-[11px] text-muted-foreground">
                Bạn có thể xem lại hướng dẫn bất kỳ lúc nào trong phần Hồ sơ.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
