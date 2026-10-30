import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Zap,
  Eye,
  EyeOff,
  ChevronRight,
  Sun,
  Moon,
  User,
  Flame,
  Search,
  ShieldCheck,
  Award,
  Play,
  AlertTriangle,
  FileText,
  FolderLock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';
import { isAdmin } from '../../constants/roles.js';
import { FEATURE_FLAGS } from '../../config/envConfig.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { onboardingService } from '../onboarding/onboardingService.js';

// Tài khoản demo để điền nhanh
const DEMO_ACCOUNTS = [
  { label: 'Learner (Học viên)', email: 'learner@avimystery.dev', password: 'demo1234', role: 'learner' },
  { label: 'Content Admin (Quản trị)', email: 'admin@avimystery.dev', password: 'admin1234', role: 'content_admin' },
];

export function AuthPage({ initialMode = 'login' }) {
  const { login, register, isAuthenticated, isLoading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={isAdmin(user?.role) ? '/admin' : '/dashboard'} replace />;
  }

  function handleTabSwitch(targetMode) {
    setMode(targetMode);
    setErrors({});
    setAuthError('');
  }

  function validateLogin() {
    const errs = {};
    if (!loginForm.email.trim()) errs.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) errs.email = 'Email không hợp lệ.';
    if (!loginForm.password) errs.password = 'Vui lòng nhập mật khẩu.';
    return errs;
  }

  function validateRegister() {
    const errs = {};
    if (!registerForm.name.trim()) errs.name = 'Vui lòng nhập họ và tên.';
    if (!registerForm.email.trim()) errs.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) errs.email = 'Email không hợp lệ.';
    if (!registerForm.password) errs.password = 'Vui lòng nhập mật khẩu.';
    else if (registerForm.password.length < 6) errs.password = 'Mật khẩu cần ít nhất 6 ký tự.';
    if (registerForm.confirmPassword !== registerForm.password) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    return errs;
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setAuthError('');
    setSubmitting(true);
    const result = await login(loginForm);
    setSubmitting(false);
    if (result.error) {
      setAuthError(result.error);
    } else {
      navigate(isAdmin(result.data?.role) ? '/admin' : '/dashboard', { replace: true });
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const errs = validateRegister();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setAuthError('');
    setSubmitting(true);
    const result = await register({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
    });
    setSubmitting(false);
    if (result.error) {
      setAuthError(result.error);
    } else {
      navigate('/onboarding', { replace: true });
    }
  }

  function fillDemo(account) {
    setMode('login');
    setLoginForm({ email: account.email, password: account.password });
    setErrors({});
    setAuthError('');
  }

  async function handleTestOnboardingDemo() {
    setSubmitting(true);
    setAuthError('');
    const demoLearner = DEMO_ACCOUNTS[0];
    const result = await login({ email: demoLearner.email, password: demoLearner.password });
    setSubmitting(false);
    if (result.error) {
      setAuthError(result.error);
    } else if (result.data?.id) {
      onboardingService.reset(result.data.id);
      navigate('/onboarding', { replace: true });
    }
  }

  const passwordLength = registerForm.password.length;
  const hasNumber = /\d/.test(registerForm.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(registerForm.password);

  let passwordStrength = 0;
  if (passwordLength >= 6) passwordStrength += 1;
  if (passwordLength >= 8 && hasNumber) passwordStrength += 1;
  if (hasSpecial || passwordLength >= 10) passwordStrength += 1;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col justify-between transition-colors duration-200 selection:bg-primary/20">
      {/* ── Top Bar / Bureau Header ── */}
      <header className="w-full border-b border-border bg-card/90 backdrop-blur-md px-6 h-16 flex items-center sticky top-0 z-30">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="grid size-9 place-items-center rounded-md border border-primary/40 bg-primary text-primary-foreground shadow-2xs">
              <Zap className="size-4 fill-current" />
            </span>
            <div>
              <p className="font-mono text-base font-bold tracking-tight text-foreground leading-none">
                avi<span className="text-primary">mystery</span>
              </p>
              <p className="mt-0.5 text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                BUREAU OF DATA INVESTIGATION
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-md border border-border bg-background px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="size-4 text-amber-400" />
                  <span className="hidden sm:inline">Giao diện Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="size-4 text-slate-600" />
                  <span className="hidden sm:inline">Giao diện Tối</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout Body ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 lg:p-10 flex items-center justify-center">
        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

          {/* ── LEFT PANEL: Classified Case #001 Archival Dossier (Desktop Only) ── */}
          <div className="lg:col-span-7 hidden lg:flex flex-col justify-between dossier-card corner-brackets rounded-md border border-border bg-card p-8 xl:p-10 relative overflow-hidden shadow-sm">
            {/* Top Classification Header */}
            <div className="relative z-10 flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                  <FolderLock className="size-3.5" />
                  <span>CỤC ĐIỀU TRA DỮ LIỆU // HỒ SƠ MẬT</span>
                </div>

                <h1 className="mt-4 font-display text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  Giải mã bí ẩn kinh doanh bằng nghiệp vụ Excel & SQL
                </h1>
              </div>

              <span className="detective-stamp text-primary border-primary/70 shrink-0 mt-1">
                CASE #001
              </span>
            </div>

            {/* Crime-Scene Evidence Photo & Redacted Transcript */}
            <div className="my-6 relative z-10 grid grid-cols-12 gap-4 items-stretch">
              <div className="col-span-5 rounded-sm border border-border bg-muted overflow-hidden relative min-h-[160px]">
                <img
                  src="https://picsum.photos/seed/noir-detective-desk/640/420"
                  alt="Bàn làm việc lưu trữ hồ sơ điều tra"
                  className="h-full w-full object-cover grayscale contrast-125 opacity-90"
                />
                <div className="absolute bottom-0 inset-x-0 bg-background/90 border-t border-border px-2.5 py-1 font-mono text-[10px] text-foreground flex items-center justify-between">
                  <span>FIG. 01 // KHO CẢNG</span>
                  <span className="text-primary font-bold">EVID-A4</span>
                </div>
              </div>

              <div className="col-span-7 rounded-sm border border-border bg-background/90 p-4 flex flex-col justify-between bg-ruled-ledger">
                <div>
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        BIÊN BẢN HIỆN TRƯỜNG
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-primary">
                      <Flame className="size-3 fill-current" />
                      <span>CẤP 1 · INVESTIGATOR</span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs font-bold text-foreground">
                    Vụ án #01: Doanh thu tháng 3 sụt giảm bất thường (-32%)
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Đối chiếu sổ cái xuất nhập kho và truy vấn nhật ký giao dịch để truy tìm mắt xích thất thoát trước giờ họp Hội đồng.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/70 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-muted-foreground">CÔNG CỤ: EXCEL & SQL</span>
                  <span className="font-bold text-primary">THƯỞNG: +100 XP</span>
                </div>
              </div>
            </div>

            {/* Forensic Protocols Ledger Strip */}
            <div className="grid sm:grid-cols-3 gap-3 relative z-10 border-t border-border pt-5">
              {[
                { icon: Search, code: 'PR-01', title: 'Vụ án thực tế', desc: 'Hồ sơ doanh nghiệp' },
                { icon: ShieldCheck, code: 'PR-02', title: 'Excel & SQL', desc: 'Truy vấn & đối khớp' },
                { icon: Award, code: 'PR-03', title: 'Hệ thống cấp bậc', desc: 'Huân chương phá án' },
              ].map(({ icon: Icon, code, title, desc }) => (
                <div key={title} className="rounded-sm border border-border bg-background/60 p-3 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="size-4 text-primary" />
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{code}</span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL: Security Clearance Terminal (Login / Register) ── */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center max-w-md mx-auto">
            <div className="rounded-md border border-border bg-card p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-5 font-mono text-[10px] text-muted-foreground">
                <span>SECURITY TERMINAL // AUTH-01</span>
                <span className="text-primary font-bold">CLEARANCE REQUIRED</span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-muted rounded-md border border-border mb-6">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className={`py-2 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-card text-foreground shadow-2xs border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('register')}
                  className={`py-2 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-card text-foreground shadow-2xs border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Đăng ký tài khoản
                </button>
              </div>

              {/* Title & Description */}
              <div className="mb-5">
                <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                  {mode === 'login' ? 'Xác thực thẻ điều tra viên' : 'Đăng ký hồ sơ điều tra viên'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {mode === 'login'
                    ? 'Nhập thông tin định danh để tiếp tục thụ lý các hồ sơ dữ liệu.'
                    : 'Khởi tạo hồ sơ đặc vụ mới để tham gia giải mã các chuyên án cùng AviMystery.'}
                </p>
              </div>

              {/* Demo Account Pills */}
              {mode === 'login' && FEATURE_FLAGS.enableDevShortcuts && (
                <div className="mb-5 rounded-md border border-border bg-muted/40 p-3.5 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground">
                      Tài khoản Demo thử nhanh:
                    </p>
                    <span className="rounded-sm bg-primary/15 border border-primary/30 px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase text-primary">
                      DEV ONLY
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemo(acc)}
                        className="flex-1 flex items-center justify-between gap-1 text-xs bg-card hover:border-primary/50 text-foreground border border-border rounded-sm px-2.5 py-2 transition-all shadow-2xs cursor-pointer"
                      >
                        <span className="font-medium truncate">{acc.label}</span>
                        <ChevronRight className="size-3 text-primary shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-border/60">
                    <button
                      type="button"
                      onClick={handleTestOnboardingDemo}
                      className="w-full flex items-center justify-center gap-1.5 text-xs bg-primary/15 hover:bg-primary/25 text-primary font-bold border border-primary/30 rounded-sm px-3 py-2 transition-all cursor-pointer"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>Test Luồng Hướng Dẫn (Welcome Gate)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* General Error Banner */}
              {authError && (
                <div
                  role="alert"
                  className="mb-5 flex items-center gap-2 rounded-sm bg-destructive/10 border border-destructive/30 p-3 text-xs font-medium text-destructive animate-fade-in"
                >
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* ── FORM: LOGIN ── */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} noValidate aria-busy={submitting ? 'true' : undefined} className="space-y-4">
                  <Input
                    id="login-email"
                    label="Địa chỉ Email"
                    type="email"
                    placeholder="name@avimystery.dev"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm((f) => ({ ...f, email: e.target.value }));
                      if (errors.email) setErrors((er) => ({ ...er, email: '' }));
                    }}
                    error={errors.email}
                    icon={<Mail className="size-4" />}
                    autoComplete="email"
                    required
                  />

                  <div className="relative">
                    <Input
                      id="login-password"
                      label="Mật khẩu"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => {
                        setLoginForm((f) => ({ ...f, password: e.target.value }));
                        if (errors.password) setErrors((er) => ({ ...er, password: '' }));
                      }}
                      error={errors.password}
                      icon={<Lock className="size-4" />}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={submitting}
                    className="mt-4"
                  >
                    {submitting ? 'Đang xác thực...' : 'Đăng nhập'}
                  </Button>
                </form>
              ) : (
                /* ── FORM: REGISTER ── */
                <form onSubmit={handleRegisterSubmit} noValidate aria-busy={submitting ? 'true' : undefined} className="space-y-4">
                  <Input
                    id="register-name"
                    label="Họ và tên nhà điều tra"
                    type="text"
                    placeholder="VD: Nguyễn Văn Data"
                    value={registerForm.name}
                    onChange={(e) => {
                      setRegisterForm((f) => ({ ...f, name: e.target.value }));
                      if (errors.name) setErrors((er) => ({ ...er, name: '' }));
                    }}
                    error={errors.name}
                    icon={<User className="size-4" />}
                    autoComplete="name"
                    required
                  />

                  <Input
                    id="register-email"
                    label="Địa chỉ Email"
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={registerForm.email}
                    onChange={(e) => {
                      setRegisterForm((f) => ({ ...f, email: e.target.value }));
                      if (errors.email) setErrors((er) => ({ ...er, email: '' }));
                    }}
                    error={errors.email}
                    icon={<Mail className="size-4" />}
                    autoComplete="email"
                    required
                  />

                  <div className="relative">
                    <Input
                      id="register-password"
                      label="Mật khẩu"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ít nhất 6 ký tự"
                      value={registerForm.password}
                      onChange={(e) => {
                        setRegisterForm((f) => ({ ...f, password: e.target.value }));
                        if (errors.password) setErrors((er) => ({ ...er, password: '' }));
                      }}
                      error={errors.password}
                      icon={<Lock className="size-4" />}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {registerForm.password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1.5 h-1">
                        <div
                          className={`flex-1 rounded-sm transition-all ${
                            passwordStrength >= 1 ? 'bg-amber-500' : 'bg-muted'
                          }`}
                        />
                        <div
                          className={`flex-1 rounded-sm transition-all ${
                            passwordStrength >= 2 ? 'bg-amber-500' : 'bg-muted'
                          }`}
                        />
                        <div
                          className={`flex-1 rounded-sm transition-all ${
                            passwordStrength >= 3 ? 'bg-emerald-500' : 'bg-muted'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground text-right font-mono">
                        {passwordStrength === 1 && 'Độ bảo mật: Yếu'}
                        {passwordStrength === 2 && 'Độ bảo mật: Trung bình'}
                        {passwordStrength >= 3 && 'Độ bảo mật: Khá mạnh'}
                      </p>
                    </div>
                  )}

                  <Input
                    id="register-confirm-password"
                    label="Xác nhận mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={registerForm.confirmPassword}
                    onChange={(e) => {
                      setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }));
                      if (errors.confirmPassword) setErrors((er) => ({ ...er, confirmPassword: '' }));
                    }}
                    error={errors.confirmPassword}
                    icon={<Lock className="size-4" />}
                    autoComplete="new-password"
                    required
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={submitting}
                    className="mt-4"
                  >
                    {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
                  </Button>
                </form>
              )}

              {/* Bottom footer text */}
              <div className="mt-6 border-t border-border pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                  <button
                    type="button"
                    onClick={() => handleTabSwitch(mode === 'login' ? 'register' : 'login')}
                    className="font-bold text-primary hover:underline ml-1 cursor-pointer"
                  >
                    {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                  </button>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[11px]">© 2026 AVI-MYSTERY // CỤC ĐIỀU TRA PHÂN TÍCH DỮ LIỆU</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Bảo mật</span>
            <span className="hover:underline cursor-pointer">Điều khoản</span>
            <span className="hover:underline cursor-pointer">Hỗ trợ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
