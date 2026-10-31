import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Zap,
  Search,
  TableProperties,
  Award,
  Clock,
  ArrowRight,
  ChevronRight,
  Sun,
  Moon,
  CheckCircle2,
  Shield,
  FileSpreadsheet,
  Briefcase,
  GraduationCap,
  Dumbbell,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';
import { onboardingService, ONBOARDING_STATUS } from './onboardingService.js';
import { Button } from '../../components/ui/Button.jsx';

const INTENT_OPTIONS = [
  {
    id: 'case',
    icon: Briefcase,
    title: 'Phá án thực chiến',
    desc: 'Thích giải đố, đọc hồ sơ hiện trường và tìm manh mối từ dữ liệu ngay.',
  },
  {
    id: 'academy',
    icon: GraduationCap,
    title: 'Học nghiệp vụ từ con số 0',
    desc: 'Mới bắt đầu, muốn học lý thuyết Excel & SQL căn bản trước khi phá án.',
  },
  {
    id: 'practice',
    icon: Dumbbell,
    title: 'Luyện tập kỹ năng tự do',
    desc: 'Đã có nền tảng, muốn rèn nhanh câu lệnh SQL hoặc hàm Excel theo chủ đề.',
  },
];

/**
 * WelcomeGatePage — Hồ sơ Nhập Ngũ Đặc Vụ (First-Run Experience)
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

  const [selectedIntent, setSelectedIntent] = useState('case');

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (onboardingService.isTerminal(user.id)) {
    return <Navigate to="/dashboard" replace />;
  }

  function saveUserIntent(intentId) {
    try {
      localStorage.setItem(`avi:user_intent:${user.id}`, intentId);
    } catch {
      // ignore storage errors
    }
  }

  function handleSelectIntent(intentId) {
    setSelectedIntent(intentId);
    saveUserIntent(intentId);
  }

  function handleStartTutorial() {
    saveUserIntent(selectedIntent);
    onboardingService.setStatus(user.id, ONBOARDING_STATUS.IN_PROGRESS);
    navigate('/onboarding/case-0', { replace: true });
  }

  function handleSkip() {
    saveUserIntent(selectedIntent);
    onboardingService.setStatus(user.id, ONBOARDING_STATUS.SKIPPED);
    navigate('/dashboard', { replace: true });
  }

  const firstName = user.name?.split(' ').slice(-1)[0] || 'Nhà điều tra';

  return (
    <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-200">
      {/* ── Header ── */}
      <header className="w-full border-b border-border bg-card/90 backdrop-blur-md px-6 h-16 flex items-center sticky top-0 z-30">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md border border-primary/40 bg-primary text-primary-foreground shadow-2xs">
              <Zap className="size-4 fill-current" />
            </span>
            <p className="font-mono text-base font-bold tracking-tight">
              avi<span className="text-primary">mystery</span>
            </p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-md border border-border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-5 py-10 sm:py-14">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* ── LEFT 6 COLS: Investigator Induction & Personal Intent Selector ── */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-primary mb-4">
              <Shield className="size-3.5" />
              <span>Nhà điều tra mới gia nhập</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Chào mừng, <span className="text-primary">{firstName}!</span>
            </h1>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
              Trước khi bắt đầu, hãy chọn <strong className="text-foreground">nhu cầu ưu tiên</strong> của bạn để hệ thống sắp xếp bàn làm việc phù hợp nhất:
            </p>

            {/* Personal Intent Picker */}
            <div className="mt-4 flex flex-col gap-2.5">
              {INTENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = selectedIntent === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectIntent(opt.id)}
                    className={`w-full text-left rounded-md border p-3.5 transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-2xs'
                        : 'border-border bg-card/70 hover:border-primary/40 hover:bg-card'
                    }`}
                  >
                    <div
                      className={`grid size-8 shrink-0 place-items-center rounded-sm border mt-0.5 ${
                        isActive
                          ? 'border-primary/40 bg-primary text-primary-foreground'
                          : 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground">
                          {opt.title}
                        </span>
                        {isActive && (
                          <span className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-primary/20 text-primary">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Training Protocol Checklist */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                QUY TRÌNH LÀM QUEN NHANH (2 PHÚT):
              </p>
              <ul className="space-y-2.5 border-l-2 border-primary/40 pl-4">
                {[
                  { icon: TableProperties, code: '01', text: 'Đọc hiểu Hồ sơ vụ án & dữ liệu' },
                  { icon: Search, code: '02', text: 'Sử dụng bảng tính để tìm manh mối' },
                  { icon: Award, code: '03', text: 'Nộp bài và nhận XP thưởng' },
                ].map(({ icon: Icon, code, text }) => (
                  <li key={text} className="flex items-center gap-3 text-xs sm:text-sm text-foreground">
                    <span className="shrink-0 grid size-6 place-items-center rounded-sm border border-primary/30 bg-primary/10 font-mono text-[10px] font-bold text-primary">
                      <Icon className="size-3 text-primary" />
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">[{code}]</span>
                    <span className="font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Time estimate */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3.5 py-2 text-xs font-mono text-muted-foreground">
              <Clock className="size-3.5 text-primary shrink-0" />
              <span>
                Ước tính: <strong className="text-foreground">~2 phút</strong>
              </span>
            </div>
          </div>

          {/* ── RIGHT 6 COLS: Case #00 Dossier Folder ── */}
          <div className="lg:col-span-6 relative">
            <div className="dossier-card corner-brackets rounded-md border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  PROTOCOL // INDUCTION-00
                </span>
                <span className="detective-stamp text-primary border-primary/70">
                  MỞ HỒ SƠ
                </span>
              </div>

              {/* Progress steps visual */}
              <div className="flex items-center gap-2">
                {['Briefing', 'Dữ liệu', 'Phân tích', 'Nộp bài'].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`grid size-7 place-items-center rounded-sm border text-xs font-bold font-mono transition-all ${
                          i === 0
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted text-muted-foreground'
                        }`}
                      >
                        {i === 0 ? <CheckCircle2 className="size-3.5" /> : i + 1}
                      </div>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground hidden sm:block">
                        {step}
                      </span>
                    </div>
                    {i < 3 && <div className="flex-1 h-px bg-border" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Case preview card */}
              <div className="rounded-sm border border-primary/35 bg-background/80 p-4 space-y-2.5 bg-ruled-ledger">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-sm bg-primary/15 border border-primary/30 text-primary shrink-0">
                    <FileSpreadsheet className="size-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
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
                  <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    +50 XP
                  </span>
                  <span className="rounded-sm border border-primary/30 bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                    Excel · Cơ bản
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <Button
                  id="welcome-start-tutorial"
                  onClick={handleStartTutorial}
                  fullWidth
                  size="lg"
                  className="gap-2"
                >
                  Bắt đầu khóa huấn luyện
                  <ArrowRight className="size-4" />
                </Button>

                <button
                  id="welcome-skip-tutorial"
                  onClick={handleSkip}
                  className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground font-semibold transition-colors rounded-sm border border-transparent hover:border-border hover:bg-muted cursor-pointer"
                >
                  Bỏ qua, tôi đã có kinh nghiệm
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <p className="text-center text-[11px] text-muted-foreground">
                Lựa chọn nhu cầu của bạn sẽ được lưu lại và có thể đổi bất cứ lúc nào tại Bàn chỉ huy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
