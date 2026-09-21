import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check, Globe, Moon, Sun, Shield, User, Lock,
  Eye, EyeOff, Camera, ChevronRight, Loader2, CheckCircle,
  AlertCircle, Database, Download, Upload, Trash2, X,
  Type, Zap, FileSearch, BookOpen, Lightbulb,
} from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatXP } from '../../utils/format.js';

/* ─── Constants ─────────────────────────────────────────────── */

const AVATAR_PRESETS = [
  { id: 'classic',  emoji: '🕵️', label: 'Cổ điển' },
  { id: 'cyber',    emoji: '💻', label: 'Điều tra Số' },
  { id: 'forensic', emoji: '🔬', label: 'Pháp y' },
  { id: 'shadow',   emoji: '🕶️', label: 'Điệp viên' },
  { id: 'analyst',  emoji: '📊', label: 'Phân tích' },
  { id: 'field',    emoji: '🎯', label: 'Hiện trường' },
];

const ACCENT_PRESETS = [
  { id: 'amber',   css: '#f59e0b', label: 'Amber' },
  { id: 'indigo',  css: '#6366f1', label: 'Indigo' },
  { id: 'emerald', css: '#10b981', label: 'Emerald' },
  { id: 'rose',    css: '#f43f5e', label: 'Crimson' },
];

function getPasswordStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)           s++;
  if (pwd.length >= 12)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
const STR_LABEL = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
const STR_COLOR = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

/* ─── Shared primitives ─────────────────────────────────────── */

/** Consistent section wrapper */
function Section({ id, title, children }) {
  return (
    <section id={id} className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </section>
  );
}

/** Standard setting row — title + description left, control right */
function SettingRow({ label, description, children, topAligned = false }) {
  return (
    <div className={`flex gap-4 px-6 py-4 ${topAligned ? 'items-start' : 'items-center'}`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Segmented control */
function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex gap-1 rounded-xl border border-border bg-muted/60 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            value === opt.value
              ? 'bg-card text-foreground shadow-sm border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Toggle switch */
function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 transition-colors ${
        value ? 'border-primary bg-primary' : 'border-border bg-muted'
      }`}
    >
      <span className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
        value ? 'translate-x-5' : 'translate-x-0.5'
      } mt-[1px]`} />
    </button>
  );
}

/** Autosave feedback chip */
function SaveChip({ state }) {
  if (!state) return null;
  const map = {
    saving: { icon: Loader2, label: 'Đang lưu...', cls: 'text-muted-foreground', spin: true },
    saved:  { icon: CheckCircle, label: 'Đã lưu', cls: 'text-emerald-500', spin: false },
    error:  { icon: AlertCircle, label: 'Lưu thất bại', cls: 'text-red-500', spin: false },
  };
  const { icon: Icon, label, cls, spin } = map[state] || {};
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cls}`}>
      <Icon className={`size-3.5 ${spin ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
}

/** Password modal */
function PasswordModal({ onClose }) {
  const { changePassword } = useAuth();
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [curPwd, setCurPwd]   = useState('');
  const [newPwd, setNewPwd]   = useState('');
  const [conPwd, setConPwd]   = useState('');
  const [state, setState]     = useState(null); // null | 'saving' | 'saved' | 'error'
  const [err, setErr]         = useState('');

  const pwdStr = getPasswordStrength(newPwd);

  const handleSubmit = async () => {
    setErr('');
    if (!curPwd || !newPwd || !conPwd) return setErr('Vui lòng điền đầy đủ tất cả các trường.');
    if (newPwd !== conPwd)             return setErr('Mật khẩu mới và xác nhận không khớp.');
    if (newPwd.length < 8)            return setErr('Mật khẩu mới phải có ít nhất 8 ký tự.');
    setState('saving');
    const res = await changePassword({ currentPassword: curPwd, newPassword: newPwd });
    if (res.error) { setState('error'); setErr(res.error); }
    else { setState('saved'); setTimeout(() => { setState(null); onClose(); }, 1200); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Đổi mật khẩu</h3>
          <button type="button" onClick={onClose} className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Mật khẩu hiện tại', val: curPwd, set: setCurPwd, show: showCur, toggle: () => setShowCur(v => !v) },
            { label: 'Mật khẩu mới', val: newPwd, set: setNewPwd, show: showNew, toggle: () => setShowNew(v => !v) },
            { label: 'Xác nhận mật khẩu mới', val: conPwd, set: setConPwd, show: showCon, toggle: () => setShowCon(v => !v) },
          ].map(({ label, val, set, show, toggle }) => (
            <div key={label}>
              <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 pr-11 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          ))}

          {newPwd && (
            <div className="space-y-1 pt-1">
              <div className="flex gap-1">{[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwdStr ? STR_COLOR[pwdStr] : 'bg-muted'}`} />)}</div>
              <p className="font-mono text-[10px] text-muted-foreground">Độ mạnh: <span className="font-bold text-foreground">{STR_LABEL[pwdStr]}</span></p>
            </div>
          )}

          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <SaveChip state={state} />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer">Hủy</button>
            <button type="button" onClick={handleSubmit} disabled={state === 'saving'}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer">
              <Shield className="size-3.5" />Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export function SettingsPage() {
  const { t, i18n }                      = useTranslation(['settings', 'common']);
  const { theme, toggleTheme }           = useTheme();
  const { user, updateProfile }          = useAuth();

  /* ── Profile state ── */
  const [name, setName]           = useState(user?.name || '');
  const [avatarId, setAvatarId]   = useState(user?.avatar || 'classic');
  const [profileSave, setProfileSave] = useState(null); // null|saving|saved|error

  /* ── Appearance state ── */
  const currentLang   = (i18n.language || 'vi').toLowerCase().startsWith('en') ? 'en' : 'vi';
  const [accentId, setAccentId]   = useState(() => localStorage.getItem('avi_accent') || 'amber');
  const [density, setDensity]     = useState(() => localStorage.getItem('avi_density') || 'comfortable');
  const [textSize, setTextSize]   = useState(() => localStorage.getItem('avi_textsize') || 'medium');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('avi_motion') === 'reduced');

  /* ── Investigation state ── */
  const [hintLevel, setHintLevel]         = useState(() => localStorage.getItem('avi_hints') || 'standard');
  const [autoEvidence, setAutoEvidence]   = useState(() => localStorage.getItem('avi_autoevidence') !== 'false');
  const [evidenceDisplay, setEvidenceDisplay] = useState(() => localStorage.getItem('avi_evidence') || 'list');

  /* ── Modal ── */
  const [showPwdModal, setShowPwdModal] = useState(false);

  const currentPreset = AVATAR_PRESETS.find(a => a.id === avatarId);
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  /* ── Autosave profile ── */
  const triggerSaveProfile = useCallback(async (updates) => {
    setProfileSave('saving');
    const res = await updateProfile(updates);
    setProfileSave(res.error ? 'error' : 'saved');
    setTimeout(() => setProfileSave(null), 2000);
  }, [updateProfile]);

  const handleNameBlur = () => {
    if (name.trim() && name.trim() !== user?.name) {
      triggerSaveProfile({ name: name.trim(), avatar: avatarId });
    }
  };

  const handleAvatarChange = (id) => {
    setAvatarId(id);
    triggerSaveProfile({ name: name.trim() || user?.name, avatar: id });
  };

  /* ── Appearance helpers ── */
  const handleLang = (code) => {
    i18n.changeLanguage(code);
    try { localStorage.setItem('i18nextLng', code); } catch { /* noop */ }
  };

  const handleAccent = (id) => {
    setAccentId(id);
    localStorage.setItem('avi_accent', id);
  };

  const handleDensity = (v) => {
    setDensity(v);
    localStorage.setItem('avi_density', v);
  };

  const handleTextSize = (v) => {
    setTextSize(v);
    localStorage.setItem('avi_textsize', v);
  };

  const handleReducedMotion = (v) => {
    setReducedMotion(v);
    localStorage.setItem('avi_motion', v ? 'reduced' : 'normal');
  };

  /* ── Investigation helpers ── */
  const handleHintLevel = (v) => {
    setHintLevel(v);
    localStorage.setItem('avi_hints', v);
  };

  const handleAutoEvidence = (v) => {
    setAutoEvidence(v);
    localStorage.setItem('avi_autoevidence', String(v));
  };

  const handleEvidenceDisplay = (v) => {
    setEvidenceDisplay(v);
    localStorage.setItem('avi_evidence', v);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in pb-16">

      {/* ── Identity anchor header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,1) 2px,rgba(0,0,0,1) 3px)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-transparent" />
        <div className="relative flex items-center gap-4 p-5">
          <div className="relative shrink-0">
            <div className="grid size-14 place-items-center rounded-2xl border-2 border-primary/30 bg-primary/10 text-2xl shadow-lg">
              {currentPreset?.emoji || initials}
            </div>
            <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-primary font-mono text-[7px] font-black text-primary-foreground">✦</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">AGENT FILE · CONFIDENTIAL</span>
            </div>
            <h1 className="mt-0.5 text-lg font-black tracking-tight text-foreground">Hồ sơ điều tra viên</h1>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
              <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-500">
                <span className="size-1 rounded-full bg-emerald-500" />Đã xác thực
              </span>
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Điểm tích lũy</p>
            <p className="text-base font-black text-primary">{formatXP(user?.xp || 0)}</p>
          </div>
        </div>
      </div>

      {/* ══ SECTION 1: Detective Profile ══ */}
      <Section id="section-profile" title="Hồ sơ Điều tra viên">
        {/* Avatar */}
        <SettingRow topAligned label="Avatar" description="Nhân dạng điều tra viên của bạn">
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1.5">
              {AVATAR_PRESETS.map(preset => (
                <button key={preset.id} type="button" title={preset.label}
                  onClick={() => handleAvatarChange(preset.id)}
                  className={`relative grid size-9 place-items-center rounded-xl border transition-all cursor-pointer ${
                    avatarId === preset.id ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-muted/40 hover:bg-muted'
                  }`}>
                  <span className="text-base leading-none">{preset.emoji}</span>
                  {avatarId === preset.id && (
                    <span className="absolute -top-1 -right-1 grid size-3 place-items-center rounded-full bg-primary">
                      <Check className="size-2 text-primary-foreground" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <SaveChip state={profileSave} />
          </div>
        </SettingRow>

        {/* Display Name */}
        <SettingRow label="Tên hiển thị" description="Hiển thị trên lời chào, sidebar và dashboard">
          <div className="flex items-center gap-2">
            <input type="text" value={name} onChange={e => setName(e.target.value)} onBlur={handleNameBlur}
              placeholder="Tên điều tra viên"
              className="w-40 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right" />
          </div>
        </SettingRow>

        {/* Codename — planned */}
        <SettingRow label="Mã danh điều tra" description="Bí danh sử dụng trong hồ sơ vụ án (sắp ra mắt)">
          <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Sắp ra mắt
          </span>
        </SettingRow>
      </Section>

      {/* ══ SECTION 2: Appearance & Experience ══ */}
      <Section id="section-appearance" title="Giao diện & Trải nghiệm">

        {/* Theme */}
        <SettingRow label="Chế độ hiển thị" description="Tông màu giao diện tổng thể">
          <div className="inline-flex gap-1 rounded-xl border border-border bg-muted/60 p-1">
            {[
              { key: 'light', icon: Sun,  label: 'Sáng' },
              { key: 'dark',  icon: Moon, label: 'Tối' },
            ].map(({ key, icon: Icon, label }) => (
              <button key={key} type="button" onClick={() => theme !== key && toggleTheme()}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  theme === key ? 'bg-card text-foreground shadow-sm border border-border/80' : 'text-muted-foreground hover:text-foreground'
                }`}>
                <Icon className="size-3.5" />{label}
              </button>
            ))}
          </div>
        </SettingRow>

        {/* Accent color */}
        <SettingRow label="Màu điểm nhấn" description="Áp dụng cho các thành phần tương tác chính">
          <div className="flex items-center gap-2">
            {ACCENT_PRESETS.map(preset => (
              <button key={preset.id} type="button" title={preset.label}
                onClick={() => handleAccent(preset.id)}
                className={`relative size-7 rounded-full border-2 transition-all cursor-pointer ${
                  accentId === preset.id ? 'border-foreground scale-110 shadow-sm' : 'border-border/50 hover:border-foreground/50'
                }`} style={{ backgroundColor: preset.css }}>
                {accentId === preset.id && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </SettingRow>

        {/* Language */}
        <SettingRow label="Ngôn ngữ" description="Ngôn ngữ hiển thị toàn bộ giao diện">
          <Segmented
            value={currentLang}
            onChange={handleLang}
            options={[
              { value: 'vi', label: '🇻🇳  Tiếng Việt' },
              { value: 'en', label: '🇬🇧  English' },
            ]}
          />
        </SettingRow>

        {/* Density */}
        <SettingRow label="Mật độ giao diện" description="Điều chỉnh khoảng cách và kích thước thành phần">
          <Segmented
            value={density}
            onChange={handleDensity}
            options={[
              { value: 'compact',      label: 'Compact' },
              { value: 'comfortable',  label: 'Comfortable' },
              { value: 'spacious',     label: 'Spacious' },
            ]}
          />
        </SettingRow>

        {/* Text size */}
        <SettingRow label="Cỡ chữ" description="Kích thước văn bản tổng thể trong giao diện">
          <Segmented
            value={textSize}
            onChange={handleTextSize}
            options={[
              { value: 'small',  label: 'Nhỏ' },
              { value: 'medium', label: 'Vừa' },
              { value: 'large',  label: 'Lớn' },
            ]}
          />
        </SettingRow>

        {/* Reduced Motion */}
        <SettingRow label="Giảm chuyển động" description="Tắt hoặc giảm thiểu hiệu ứng chuyển động trong giao diện">
          <Toggle value={reducedMotion} onChange={handleReducedMotion} />
        </SettingRow>
      </Section>

      {/* ══ SECTION 3: Investigation Preferences ══ */}
      <Section id="section-investigation" title="Tuỳ chọn Điều tra">

        {/* Hint level */}
        <SettingRow label="Mức gợi ý" description="Điều chỉnh lượng hỗ trợ nhận được trong quá trình điều tra">
          <Segmented
            value={hintLevel}
            onChange={handleHintLevel}
            options={[
              { value: 'none',     label: 'Không có' },
              { value: 'standard', label: 'Tiêu chuẩn' },
              { value: 'guided',   label: 'Có dẫn dắt' },
            ]}
          />
        </SettingRow>

        {/* Evidence display */}
        <SettingRow label="Hiển thị bằng chứng" description="Cách bằng chứng được trình bày trong bảng điều tra">
          <Segmented
            value={evidenceDisplay}
            onChange={handleEvidenceDisplay}
            options={[
              { value: 'list', label: 'Danh sách' },
              { value: 'grid', label: 'Lưới' },
            ]}
          />
        </SettingRow>

        {/* Auto-open evidence */}
        <SettingRow label="Tự động mở bằng chứng" description="Tự động hiển thị bảng bằng chứng khi vào không gian điều tra">
          <Toggle value={autoEvidence} onChange={handleAutoEvidence} />
        </SettingRow>
      </Section>

      {/* ══ SECTION 4: Account & Data ══ */}
      <Section id="section-account" title="Tài khoản & Dữ liệu">

        {/* Email — read only */}
        <SettingRow label="Địa chỉ email" description="Dùng để đăng nhập và xác thực tài khoản">
          <span className="font-mono text-xs text-muted-foreground">{user?.email}</span>
        </SettingRow>

        {/* Password — opens modal */}
        <SettingRow label="Mật khẩu" description="Bảo vệ hồ sơ và tài khoản điều tra của bạn">
          <button type="button" onClick={() => setShowPwdModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:border-border/80 transition-all cursor-pointer">
            <Lock className="size-3.5" />Đổi mật khẩu
            <ChevronRight className="size-3.5 text-muted-foreground" />
          </button>
        </SettingRow>

        {/* Export */}
        <SettingRow label="Xuất dữ liệu" description="Tải xuống toàn bộ lịch sử điều tra và tiến độ học tập">
          <button type="button" disabled
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground opacity-50 cursor-not-allowed">
            <Download className="size-3.5" />Xuất (.json)
          </button>
        </SettingRow>

        {/* Import */}
        <SettingRow label="Nhập dữ liệu" description="Khôi phục tiến độ từ file dữ liệu đã xuất trước đó">
          <button type="button" disabled
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground opacity-50 cursor-not-allowed">
            <Upload className="size-3.5" />Nhập (.json)
          </button>
        </SettingRow>

        {/* Reset */}
        <SettingRow label="Xóa dữ liệu điều tra" description="Xóa toàn bộ tiến độ và lịch sử. Hành động này không thể hoàn tác.">
          <button type="button" disabled
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs font-semibold text-red-500/60 opacity-50 cursor-not-allowed">
            <Trash2 className="size-3.5" />Xóa dữ liệu
          </button>
        </SettingRow>
      </Section>

      {/* Autosave notice */}
      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Thay đổi được lưu tự động · Avi-Mystery HQ Control Center
      </p>

      {/* Password modal */}
      {showPwdModal && <PasswordModal onClose={() => setShowPwdModal(false)} />}
    </div>
  );
}
