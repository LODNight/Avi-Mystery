import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
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
  CheckCircle2,
  Sparkles,
  Flame,
  Search,
  ShieldCheck,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';
import { isAdmin } from '../../constants/roles.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

// Tài khoản demo để điền nhanh
const DEMO_ACCOUNTS = [
  { label: 'Learner (Học viên)', email: 'learner@avimystery.dev', password: 'demo1234', role: 'learner' },
  { label: 'Content Admin (Quản trị)', email: 'admin@avimystery.dev', password: 'admin1234', role: 'content_admin' },
];

export function AuthPage({ initialMode = 'login' }) {
  const { login, register, isAuthenticated, isLoading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(initialMode);

  // Sync mode với initialMode prop khi route thay đổi
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

  // Nếu đã login → redirect ngay
  if (!isLoading && isAuthenticated) {
    return <Navigate to={isAdmin(user?.role) ? '/admin' : '/dashboard'} replace />;
  }

  // Chuyển Tab
  function handleTabSwitch(targetMode) {
    setMode(targetMode);
    setErrors({});
    setAuthError('');
  }

  // --- Validate Login ---
  function validateLogin() {
    const errs = {};
    if (!loginForm.email.trim()) errs.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) errs.email = 'Email không hợp lệ.';
    if (!loginForm.password) errs.password = 'Vui lòng nhập mật khẩu.';
    return errs;
  }

  // --- Validate Register ---
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

  // --- Handle Login Submit ---
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

  // --- Handle Register Submit ---
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
      navigate('/dashboard', { replace: true });
    }
  }

  // Điền nhanh tài khoản demo
  function fillDemo(account) {
    setMode('login');
    setLoginForm({ email: account.email, password: account.password });
    setErrors({});
    setAuthError('');
  }

  // Độ mạnh mật khẩu (dành cho form Đăng ký)
  const passwordLength = registerForm.password.length;
  const hasNumber = /\d/.test(registerForm.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(registerForm.password);

  let passwordStrength = 0;
  if (passwordLength >= 6) passwordStrength += 1;
  if (passwordLength >= 8 && hasNumber) passwordStrength += 1;
  if (hasSpecial || passwordLength >= 10) passwordStrength += 1;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors duration-200 selection:bg-primary/20">
      {/* ── Top Bar / Header ── */}
      <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Zap className="size-5 fill-current" />
            </span>
            <div>
              <p className="font-mono text-lg font-bold tracking-tight text-foreground">
                avi<span className="text-primary">mystery</span>
              </p>
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                DataQuest Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-2 text-xs font-semibold"
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
        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── LEFT PANEL: Hero Detective Showcase (Desktop Only) ── */}
          <div className="lg:col-span-6 hidden lg:flex flex-col justify-between h-full min-h-[580px] rounded-3xl border border-border/80 bg-card/60 p-8 xl:p-10 relative overflow-hidden backdrop-blur-xl shadow-xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>Nền tảng Học Phân Tích Dữ Liệu qua Vụ Án</span>
              </div>

              <h1 className="mt-6 text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Giải mã bí ẩn kinh doanh bằng{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-primary to-amber-600">
                  Excel & SQL
                </span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Hóa thân thành Nhà điều tra dữ liệu. Truy vấn bảng dữ liệu, tìm ra nguyên nhân gốc rễ của các vụ án kinh doanh thực tế và thăng cấp danh hiệu của bạn.
              </p>
            </div>

            {/* Live Card Preview Component */}
            <div className="my-6 relative z-10 rounded-2xl border border-border bg-background/80 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-amber-500/15 font-mono text-lg text-amber-600 dark:text-amber-400">
                    🕵️‍♂️
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-muted-foreground uppercase">Hồ sơ nhà điều tra</p>
                    <p className="text-sm font-bold text-foreground">Cấp 1 · Investigator</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="size-3.5 fill-current" />
                  <span>Streak 1 Ngày</span>
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 p-3.5 border border-border/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-foreground">Vụ án #01: Doanh thu tháng 3 giảm sụt</span>
                  <span className="font-mono font-bold text-primary">+100 XP</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-background">
                  <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Công cụ: Excel & SQL</span>
                  <span className="font-mono">75% Hoàn thành</span>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid sm:grid-cols-3 gap-3 relative z-10">
              {[
                { icon: Search, title: 'Vụ án thực tế', desc: 'Case study kinh doanh' },
                { icon: ShieldCheck, title: 'Excel & SQL', desc: 'Luyện tập tương tác' },
                { icon: Award, title: 'Hệ thống XP', desc: 'Thăng cấp & danh hiệu' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-border/60 bg-muted/40 p-3 text-left">
                  <Icon className="size-4 text-primary mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">{title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL: Form Container (Login / Register) ── */}
          <div className="lg:col-span-6 w-full flex flex-col justify-center max-w-md mx-auto">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
              
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-muted rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('register')}
                  className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Đăng ký tài khoản
                </button>
              </div>

              {/* Title & Description */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {mode === 'login' ? 'Chào mừng trở lại 👋' : 'Bắt đầu cuộc điều tra 🔍'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {mode === 'login'
                    ? 'Nhập tài khoản để tiếp tục các nhiệm vụ phân tích dữ liệu.'
                    : 'Tạo tài khoản nhà điều tra mới để tham gia thử thách cùng AviMystery.'}
                </p>
              </div>

              {/* Demo Account Pills (Chỉ hiện khi ở tab Đăng nhập) */}
              {mode === 'login' && (
                <div className="mb-6 rounded-2xl border border-border/80 bg-muted/40 p-3.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider font-bold text-muted-foreground mb-2">
                    Tài khoản Demo thử nhanh:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemo(acc)}
                        className="flex-1 flex items-center justify-between gap-1 text-xs bg-card hover:border-primary/50 text-foreground border border-border rounded-xl px-3 py-2 transition-all shadow-sm"
                      >
                        <span className="font-medium truncate">{acc.label}</span>
                        <ChevronRight className="size-3 text-primary shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* General Error Banner */}
              {authError && (
                <div
                  role="alert"
                  className="mb-5 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs font-medium text-destructive animate-fade-in"
                >
                  <span className="text-sm">⚠️</span>
                  <span>{authError}</span>
                </div>
              )}

              {/* ── FORM: LOGIN ── */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
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
                    className="mt-4 shadow-lg shadow-primary/20"
                  >
                    {submitting ? 'Đang xác thực...' : 'Đăng nhập'}
                  </Button>
                </form>
              ) : (
                /* ── FORM: REGISTER ── */
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
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

                  {/* Password Strength Indicator */}
                  {registerForm.password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1.5 h-1">
                        <div
                          className={`flex-1 rounded-full transition-all ${
                            passwordStrength >= 1 ? 'bg-amber-500' : 'bg-muted'
                          }`}
                        />
                        <div
                          className={`flex-1 rounded-full transition-all ${
                            passwordStrength >= 2 ? 'bg-amber-500' : 'bg-muted'
                          }`}
                        />
                        <div
                          className={`flex-1 rounded-full transition-all ${
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
                    className="mt-4 shadow-lg shadow-primary/20"
                  >
                    {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
                  </Button>
                </form>
              )}

              {/* Bottom footer text */}
              <div className="mt-6 border-t border-border/60 pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                  <button
                    type="button"
                    onClick={() => handleTabSwitch(mode === 'login' ? 'register' : 'login')}
                    className="font-bold text-primary hover:underline ml-1"
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
      <footer className="w-full border-t border-border/60 py-4 px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 AviMystery DataQuest. Nền tảng học phân tích dữ liệu ứng dụng thực tế.</p>
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
