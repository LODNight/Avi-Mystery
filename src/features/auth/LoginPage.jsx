import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, Zap, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { isAdmin } from '../../constants/roles.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

// Tài khoản demo để điền nhanh
const DEMO_ACCOUNTS = [
  { label: 'Learner',        email: 'learner@avimystery.dev',    password: 'demo1234',  role: 'learner'        },
  { label: 'Content Admin',  email: 'admin@avimystery.dev',      password: 'admin1234', role: 'content_admin'  },
];

export function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Nếu đã login → redirect ngay
  if (!isLoading && isAuthenticated) {
    return <Navigate to={isAdmin(user?.role) ? '/admin' : '/dashboard'} replace />;
  }

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Email không hợp lệ.';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu.';
    else if (form.password.length < 6)
      errs.password = 'Mật khẩu ít nhất 6 ký tự.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoginError('');
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);
    if (result.error) {
      setLoginError(result.error);
    } else {
      navigate(isAdmin(result.data?.role) ? '/admin' : '/dashboard', { replace: true });
    }
  }

  function fillDemo(account) {
    setForm({ email: account.email, password: account.password });
    setErrors({});
    setLoginError('');
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* ── Left — Hero ── */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">AviMystery</p>
            <p className="text-xs text-slate-400">DataQuest Platform</p>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Học phân tích dữ liệu<br />
            <span className="text-primary-400">qua điều tra bí ẩn</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Giải các vụ án kinh doanh bằng Excel và SQL. Tìm manh mối, phân tích dữ liệu, đưa ra kết luận — và lên cấp.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="space-y-3">
          {[
            { icon: '🔍', text: 'Tình huống kinh doanh thực tế' },
            { icon: '📊', text: 'Excel Formula & SQL Query' },
            { icon: '🏆', text: 'Hệ thống XP và thành tựu' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="text-lg">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" fill="currentColor" />
            </div>
            <p className="text-base font-bold text-white">AviMystery</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Chào mừng trở lại</h2>
            <p className="text-slate-400 text-sm">Đăng nhập để tiếp tục cuộc điều tra của bạn.</p>
          </div>

          {/* Demo accounts */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-2">Đăng nhập nhanh với tài khoản demo:</p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <ChevronRight size={11} className="text-primary-400" />
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Login-level error */}
            {loginError && (
              <div
                role="alert"
                className="flex items-center gap-2 bg-danger-500/10 border border-danger-500/30 rounded-lg px-3 py-2.5 text-sm text-danger-400"
              >
                <span>⚠️</span>
                {loginError}
              </div>
            )}

            <div className="[&_label]:text-slate-300 [&_input]:bg-slate-800 [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder:text-slate-500 [&_input:focus]:border-primary-500 [&_input:hover]:border-slate-600">
              <Input
                id="login-email"
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  if (errors.email) setErrors((er) => ({ ...er, email: '' }));
                }}
                error={errors.email}
                icon={<Mail size={15} />}
                autoComplete="email"
                required
              />
            </div>

            <div className="[&_label]:text-slate-300 [&_input]:bg-slate-800 [&_input]:border-slate-700 [&_input]:text-white [&_input]:placeholder:text-slate-500 [&_input:focus]:border-primary-500 [&_input:hover]:border-slate-600">
              <div className="relative">
                <Input
                  id="login-password"
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }));
                    if (errors.password) setErrors((er) => ({ ...er, password: '' }));
                  }}
                  error={errors.password}
                  icon={<Lock size={15} />}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-8 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
              className="mt-2"
            >
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            AviMystery DataQuest — Nền tảng học phân tích dữ liệu
          </p>
        </div>
      </div>
    </div>
  );
}
