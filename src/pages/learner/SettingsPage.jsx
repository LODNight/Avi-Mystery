import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Moon,
  Sun,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  KeyRound,
  Download,
  Upload,
  Trash2,
  FileSearch,
  ShieldCheck,
  Palette,
  Type,
  Maximize2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useTheme, getContrastForeground } from '../../app/providers/ThemeProvider.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatXP } from '../../utils/format.js';
import { isAdmin } from '../../constants/roles.js';
import { DETECTIVE_PERSONA_PRESETS, analyzeContrast, parseHex } from '../../utils/colorEngine.js';
import InvestigationStamp from '../../components/investigation/InvestigationStamp.jsx';

/* ─── Constants ─────────────────────────────────────────────── */

const AVATAR_PRESETS = [
  { id: 'classic',  emoji: '🕵️', label: 'Cổ điển' },
  { id: 'cyber',    emoji: '💻', label: 'Điều tra Số' },
  { id: 'forensic', emoji: '🔬', label: 'Pháp y' },
  { id: 'shadow',   emoji: '🕶️', label: 'Điệp viên' },
  { id: 'analyst',  emoji: '📊', label: 'Phân tích' },
  { id: 'field',    emoji: '🎯', label: 'Hiện trường' },
];

const ACCENT_PRESETS = DETECTIVE_PERSONA_PRESETS;

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

/* ─── Shared UI Primitives ──────────────────────────────────── */

function SectionWrapper({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs animate-fade-in">
      <div className="border-b border-border/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
          )}
          <div>
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="divide-y divide-border/60 p-6 space-y-6 divide-y-0">{children}</div>
    </section>
  );
}

function SettingRow({ label, description, children, topAligned = false }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 justify-between ${topAligned ? 'sm:items-start' : 'sm:items-center'} py-2`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex gap-1 rounded-xl border border-border bg-muted/60 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            value === opt.value
              ? 'bg-card text-foreground shadow-sm border border-border/80 font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleSwitch({ value, onChange }) {
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
      <span
        className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        } mt-[1px]`}
      />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const { theme, toggleTheme, primaryColor, setPrimaryColor } = useTheme();
  const { user, updateProfile, changePassword } = useAuth();
  const { i18n } = useTranslation(['settings', 'common']);

  /* ── Profile state ── */
  const [name, setName] = useState(user?.name || '');
  const [avatarId, setAvatarId] = useState(user?.avatar || 'classic');
  const [profileSaveState, setProfileSaveState] = useState(null);

  /* ── Appearance state ── */
  const currentLang = (i18n.language || 'vi').toLowerCase().startsWith('en') ? 'en' : 'vi';
  const [density, setDensity] = useState(() => localStorage.getItem('avi_density') || 'comfortable');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('avi_textsize') || 'medium');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('avi_motion') === 'reduced');

  /* ── Investigation state ── */
  const [hintLevel, setHintLevel] = useState(() => localStorage.getItem('avi_hints') || 'standard');
  const [evidenceDisplay, setEvidenceDisplay] = useState(() => localStorage.getItem('avi_evidence') || 'list');
  const [autoEvidence, setAutoEvidence] = useState(() => localStorage.getItem('avi_autoevidence') !== 'false');

  /* ── Password change state ── */
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [conPwd, setConPwd] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [pwdSaveState, setPwdSaveState] = useState(null);
  const [pwdError, setPwdError] = useState('');

  const currentPreset = AVATAR_PRESETS.find((a) => a.id === avatarId);
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const defaultThemeColor = theme === 'dark' ? '#f59e0b' : '#d97706';
  const activeColor = primaryColor || defaultThemeColor;
  const safePickerColor = parseHex(activeColor)?.hex.toLowerCase() || (theme === 'dark' ? '#f59e0b' : '#d97706');
  const [hexInput, setHexInput] = useState(activeColor);

  useEffect(() => {
    setHexInput(activeColor);
  }, [activeColor]);

  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    const parsed = parseHex(val);
    if (parsed) {
      setPrimaryColor(parsed.hex);
    }
  };

  const handleHexInputBlur = () => {
    const parsed = parseHex(hexInput);
    if (parsed) {
      setHexInput(parsed.hex);
    } else {
      setHexInput(activeColor);
    }
  };

  const handleColorPickerChange = (e) => {
    const val = e.target.value;
    setHexInput(val.toUpperCase());
    setPrimaryColor(val);
  };

  const contrastAnalysis = analyzeContrast(activeColor);
  const activePresetInfo = DETECTIVE_PERSONA_PRESETS.find(
    (p) => p.css.toLowerCase() === activeColor.toLowerCase()
  );
  const pwdStrength = getPasswordStrength(newPwd);

  /* ── Profile handlers ── */
  const triggerSaveProfile = useCallback(async (updates) => {
    setProfileSaveState('saving');
    const res = await updateProfile(updates);
    setProfileSaveState(res?.error ? 'error' : 'saved');
    setTimeout(() => setProfileSaveState(null), 2000);
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

  /* ── Password handler ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (!curPwd || !newPwd || !conPwd) {
      return setPwdError('Vui lòng điền đầy đủ tất cả các trường.');
    }
    if (newPwd !== conPwd) {
      return setPwdError('Mật khẩu mới và mật khẩu xác nhận không khớp.');
    }
    if (newPwd.length < 8) {
      return setPwdError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
    }

    setPwdSaveState('saving');
    const res = await changePassword({ currentPassword: curPwd, newPassword: newPwd });
    if (res?.error) {
      setPwdSaveState('error');
      setPwdError(res.error);
    } else {
      setPwdSaveState('saved');
      setCurPwd('');
      setNewPwd('');
      setConPwd('');
      setTimeout(() => setPwdSaveState(null), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 animate-fade-in">
      
      {/* ── Top Identity Card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="grid size-14 place-items-center rounded-2xl border-2 border-primary/30 bg-primary/10 text-2xl shadow-md">
                {currentPreset?.emoji || initials}
              </div>
              <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-primary font-mono text-[7px] font-black text-primary-foreground">
                ✦
              </span>
            </div>
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                INVESTIGATOR PROFILE · CONFIDENTIAL
              </p>
              <h1 className="text-lg font-black tracking-tight text-foreground">
                {user?.name || 'Học viên Điều tra'}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>{user?.email}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-500">
                  <span className="size-1 rounded-full bg-emerald-500" /> Đã xác thực
                </span>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Điểm tích lũy XP</p>
            <p className="text-lg font-black text-primary">{formatXP(user?.xp || 0)}</p>
          </div>
        </div>
      </div>

      {/* ═══════════ CONDITIONAL RENDER BY ACTIVE TAB ═══════════ */}

      {/* 1. HỒ SƠ */}
      {activeTab === 'profile' && (
        <SectionWrapper
          title="Hồ sơ Điều tra viên"
          description="Thiết lập nhân dạng, tên hiển thị và bí danh của bạn trong hệ thống"
          icon={User}
        >
          {/* Avatar selector */}
          <SettingRow topAligned label="Biểu tượng Avatar" description="Chọn biểu tượng đại diện trong sổ tay vụ án và xếp hạng">
            <div className="flex flex-col items-end gap-2">
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.label}
                    onClick={() => handleAvatarChange(p.id)}
                    className={`relative grid size-10 place-items-center rounded-xl border text-lg transition-all cursor-pointer ${
                      avatarId === p.id
                        ? 'border-primary bg-primary/15 shadow-sm scale-105'
                        : 'border-border/60 bg-muted/40 hover:bg-muted'
                    }`}
                  >
                    <span>{p.emoji}</span>
                    {avatarId === p.id && (
                      <span className="absolute -top-1 -right-1 grid size-3.5 place-items-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {profileSaveState === 'saving' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> Đang lưu...
                </span>
              )}
              {profileSaveState === 'saved' && (
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle className="size-3.5" /> Đã cập nhật
                </span>
              )}
            </div>
          </SettingRow>

          {/* Display Name */}
          <SettingRow label="Tên hiển thị" description="Hiển thị trên lời chào, dashboard và báo cáo điều tra">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                placeholder="Tên điều tra viên"
                className="w-56 rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right"
              />
            </div>
          </SettingRow>

          {/* Codename */}
          <SettingRow label="Mã danh điều tra" description="Mã hiệu bảo mật gán cho hồ sơ tác nghiệp">
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 font-mono text-xs font-bold text-primary">
              AGENT-{(user?.id || '001').slice(0, 6).toUpperCase()}
            </span>
          </SettingRow>
        </SectionWrapper>
      )}

      {/* 2. GIAO DIỆN -> MÀU SẮC */}
      {activeTab === 'appearance-color' && (
        <SectionWrapper
          title="Giao diện: Màu sắc"
          description="Tuỳ chỉnh chế độ hiển thị Sáng/Tối và bảng màu chủ đạo (Primary Color) theo sở thích"
          icon={Palette}
        >
          {/* Display Mode (Light / Dark) */}
          <SettingRow label="Chế độ hiển thị" description="Chọn tông màu tối ưu cho môi trường làm việc của bạn">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs font-bold'
                    : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Sun className="size-4" /> Sáng (Light)
              </button>
              <button
                type="button"
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary shadow-xs font-bold'
                    : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Moon className="size-4" /> Tối (Dark)
              </button>
            </div>
          </SettingRow>

          {/* Color Picker & Custom HEX Bar */}
          <SettingRow
            topAligned
            label="Thanh nhập bảng màu tùy ý"
            description="Tự do kéo chọn màu hoặc nhập trực tiếp mã màu HEX yêu thích cho toàn bộ giao diện"
          >
            <div className="flex flex-col gap-4 min-w-[260px] sm:min-w-[320px]">
              {/* Color input row */}
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border-2 border-border shadow-xs cursor-pointer group">
                  <input
                    type="color"
                    value={safePickerColor}
                    onChange={handleColorPickerChange}
                    className="absolute -top-3 -left-3 size-16 cursor-pointer"
                    title="Bấm để chọn màu tự do"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Mã màu HEX</p>
                  <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexInputChange}
                    onBlur={handleHexInputBlur}
                    placeholder="#D97706"
                    className="w-full bg-transparent text-sm font-mono uppercase text-foreground font-bold focus:outline-none"
                  />
                </div>
                {primaryColor && (
                  <button
                    type="button"
                    onClick={() => {
                      setPrimaryColor(null);
                      setHexInput(defaultThemeColor);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer transition-colors"
                    title="Khôi phục mặc định"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Contrast Meter / Thước đo tương phản tự động */}
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                    style={{ backgroundColor: activeColor }}
                  />
                  <span className="font-mono font-semibold text-muted-foreground text-[11px]">
                    Tương phản {contrastAnalysis.score}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  contrastAnalysis.isAccessible
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  <CheckCircle className="size-2.5" /> Chuẩn {contrastAnalysis.wcagLevel}
                </span>
              </div>

              {/* Presets Swatches */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Bộ sưu tập bảng màu thám tử
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {DETECTIVE_PERSONA_PRESETS.map((preset) => {
                    const isSelected = activeColor.toLowerCase() === preset.css.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        title={`${preset.name}: ${preset.tagline}`}
                        onClick={() => setPrimaryColor(preset.css)}
                        className={`group relative size-9 rounded-xl border-2 transition-all cursor-pointer shadow-xs flex items-center justify-center ${
                          isSelected
                            ? 'border-foreground scale-110 shadow-md ring-2 ring-primary/40 ring-offset-2 ring-offset-card'
                            : 'border-transparent hover:scale-105 hover:shadow-xs'
                        }`}
                        style={{ backgroundColor: preset.css }}
                      >
                        {isSelected && (
                          <Check className="size-4 text-white drop-shadow-sm" strokeWidth={3} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Persona Tagline description */}
                {activePresetInfo && (
                  <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-xs">{activePresetInfo.name}</span>
                      <span className="font-mono text-[9px] text-muted-foreground uppercase">{activePresetInfo.tagline}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{activePresetInfo.description}</p>
                  </div>
                )}
              </div>
            </div>
          </SettingRow>

          {/* Interactive Live Preview */}
          <div className="mt-4 rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Thao trường xem trước tương tác
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Mô phỏng tức thì các thành phần giao diện thực tế khi áp dụng bảng màu
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle className="size-3" /> Đạt chuẩn tương phản ({contrastAnalysis.score})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Left Column: Buttons & Badges */}
              <div className="flex flex-col gap-3 justify-center">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                  >
                    Nút Primary
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 active:scale-98 transition-all cursor-pointer"
                  >
                    Nút Outline
                  </button>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary border border-primary/25">
                    <Sparkles className="size-3" /> Badge Nổi Bật
                  </span>
                </div>
              </div>

              {/* Right Column: Mini Evidence Dossier Card */}
              <div
                className="relative rounded-xl border border-primary/30 bg-card p-3.5 shadow-sm transition-all duration-300"
                style={{
                  boxShadow: '0 0 16px var(--primary-glow)',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      VẬT CHỨNG #EVD-049
                    </span>
                  </div>
                  <InvestigationStamp
                    variant="classified"
                    label="HỒ SƠ MẬT"
                    size="sm"
                    animated={false}
                    rotate="-rotate-2"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-foreground">Trích xuất cơ sở dữ liệu nghi can</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Độ tương phản tự động bảo đảm văn bản luôn sắc nét và dễ đọc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* 2. GIAO DIỆN -> NGÔN NGỮ & CỠ CHỮ */}
      {activeTab === 'appearance-typography' && (
        <SectionWrapper
          title="Giao diện: Ngôn ngữ & Cỡ chữ"
          description="Thiết lập ngôn ngữ, kích thước font chữ và độ tương phản hiển thị"
          icon={Type}
        >
          {/* Language */}
          <SettingRow label="Ngôn ngữ hiển thị" description="Ngôn ngữ áp dụng trên toàn bộ ứng dụng">
            <SegmentedControl
              value={currentLang}
              onChange={(code) => {
                i18n.changeLanguage(code);
                try { localStorage.setItem('i18nextLng', code); } catch { /* noop */ }
              }}
              options={[
                { value: 'vi', label: '🇻🇳 Tiếng Việt' },
                { value: 'en', label: '🇬🇧 English' },
              ]}
            />
          </SettingRow>

          {/* Text size */}
          <SettingRow label="Cỡ chữ giao diện" description="Kích cỡ font văn bản tổng thể trong không gian làm việc">
            <SegmentedControl
              value={textSize}
              onChange={(v) => {
                setTextSize(v);
                localStorage.setItem('avi_textsize', v);
              }}
              options={[
                { value: 'small',  label: 'Nhỏ' },
                { value: 'medium', label: 'Vừa (Mặc định)' },
                { value: 'large',  label: 'Lớn' },
              ]}
            />
          </SettingRow>

          {/* Density */}
          <SettingRow label="Mật độ hiển thị" description="Khoảng cách và độ đệm giữa các thành phần giao diện">
            <SegmentedControl
              value={density}
              onChange={(v) => {
                setDensity(v);
                localStorage.setItem('avi_density', v);
              }}
              options={[
                { value: 'compact',     label: 'Gọn (Compact)' },
                { value: 'comfortable', label: 'Chuẩn (Comfortable)' },
                { value: 'spacious',    label: 'Rộng (Spacious)' },
              ]}
            />
          </SettingRow>

          {/* Reduced Motion */}
          <SettingRow label="Giảm chuyển động" description="Hạn chế các hiệu ứng chuyển cảnh phức tạp và chuyển động liên tục">
            <ToggleSwitch
              value={reducedMotion}
              onChange={(v) => {
                setReducedMotion(v);
                localStorage.setItem('avi_motion', v ? 'reduced' : 'normal');
              }}
            />
          </SettingRow>
        </SectionWrapper>
      )}

      {/* 3. ĐIỀU TRA */}
      {activeTab === 'investigation' && (
        <SectionWrapper
          title="Tuỳ chọn Điều tra"
          description="Thiết lập các trợ giúp và phương thức làm việc trong không gian phá án"
          icon={FileSearch}
        >
          {/* Hint level */}
          <SettingRow label="Mức hỗ trợ gợi ý" description="Điều chỉnh mức độ hướng dẫn khi giải các câu hỏi truy vấn">
            <SegmentedControl
              value={hintLevel}
              onChange={(v) => {
                setHintLevel(v);
                localStorage.setItem('avi_hints', v);
              }}
              options={[
                { value: 'none',     label: 'Không có' },
                { value: 'standard', label: 'Tiêu chuẩn' },
                { value: 'guided',   label: 'Có dẫn dắt' },
              ]}
            />
          </SettingRow>

          {/* Evidence display */}
          <SettingRow label="Trình bày bảng bằng chứng" description="Phương thức sắp xếp các thẻ bằng chứng thu thập được">
            <SegmentedControl
              value={evidenceDisplay}
              onChange={(v) => {
                setEvidenceDisplay(v);
                localStorage.setItem('avi_evidence', v);
              }}
              options={[
                { value: 'list', label: 'Dạng danh sách' },
                { value: 'grid', label: 'Dạng lưới' },
              ]}
            />
          </SettingRow>

          {/* Auto open evidence */}
          <SettingRow label="Tự động mở ngăn bằng chứng" description="Tự động bung ngăn bằng chứng khi mở màn hình điều tra vụ án">
            <ToggleSwitch
              value={autoEvidence}
              onChange={(v) => {
                setAutoEvidence(v);
                localStorage.setItem('avi_autoevidence', String(v));
              }}
            />
          </SettingRow>
        </SectionWrapper>
      )}

      {/* 4. TÀI KHOẢN -> MẬT KHẨU */}
      {activeTab === 'account-password' && (
        <SectionWrapper
          title="Tài khoản: Mật khẩu"
          description="Quản lý và cập nhật mật khẩu bảo mật cho tài khoản của bạn"
          icon={KeyRound}
        >
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showCur ? 'text' : 'password'}
                  value={curPwd}
                  onChange={(e) => setCurPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 pr-10 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCur(!showCur)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showCur ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 pr-10 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {newPwd && (
                <div className="space-y-1 pt-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= pwdStrength ? STR_COLOR[pwdStrength] : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Độ mạnh: <span className="font-bold text-foreground">{STR_LABEL[pwdStrength]}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showCon ? 'text' : 'password'}
                  value={conPwd}
                  onChange={(e) => setConPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 pr-10 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCon(!showCon)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showCon ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}

            <div className="flex items-center justify-between pt-2">
              {pwdSaveState === 'saving' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> Đang cập nhật...
                </span>
              )}
              {pwdSaveState === 'saved' && (
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle className="size-3.5" /> Mật khẩu đã được đổi thành công!
                </span>
              )}
              {!pwdSaveState && <span />}

              <button
                type="submit"
                disabled={pwdSaveState === 'saving'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="size-3.5" /> Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </SectionWrapper>
      )}

      {/* 4. TÀI KHOẢN -> DATA */}
      {activeTab === 'account-data' && (
        <SectionWrapper
          title="Tài khoản: Quản lý Dữ liệu (Data)"
          description="Sao lưu, xuất dữ liệu và quản lý lịch sử tiến độ điều tra của bạn"
          icon={Database}
        >
          {/* Export Data */}
          <SettingRow
            label="Xuất dữ liệu điều tra"
            description="Tải xuống tệp dữ liệu .json lưu toàn bộ lịch sử vụ án, ghi chép và kết quả SQL"
          >
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground opacity-60 cursor-not-allowed"
            >
              <Download className="size-3.5" /> Xuất (.json)
            </button>
          </SettingRow>

          {/* Import Data */}
          <SettingRow
            label="Khôi phục dữ liệu"
            description="Nhập tệp dữ liệu đã sao lưu trước đó để đồng bộ lại trạng thái điều tra"
          >
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground opacity-60 cursor-not-allowed"
            >
              <Upload className="size-3.5" /> Nhập (.json)
            </button>
          </SettingRow>

          {/* Reset Data */}
          <SettingRow
            label="Xoá toàn bộ dữ liệu điều tra"
            description="Đặt lại tiến độ vụ án về ban đầu. Hành động này không thể hoàn tác"
          >
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-500 opacity-60 cursor-not-allowed"
            >
              <Trash2 className="size-3.5" /> Xóa dữ liệu
            </button>
          </SettingRow>
        </SectionWrapper>
      )}

      {/* 5. QUYỀN */}
      {activeTab === 'permissions' && (
        <SectionWrapper
          title="Phân quyền Hệ thống"
          description="Chi tiết vai trò, giấy phép điều tra và các đặc quyền truy cập tính năng"
          icon={ShieldCheck}
        >
          <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-4">
            <div>
              <p className="font-bold text-sm text-primary">
                Vai trò: {isAdmin(user?.role) ? 'Quản trị viên (Admin)' : 'Học viên Điều tra viên'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mã định danh ID: {user?.id || 'learner-local'}
              </p>
            </div>
            <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 font-mono text-xs font-black text-emerald-500">
              ĐÃ XÁC THỰC
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-foreground">Bảng ma trận phân quyền chi tiết:</p>
            <div className="divide-y divide-border/50 border border-border rounded-xl overflow-hidden bg-card/50">
              {[
                { name: '1. Hồ sơ vụ án & Hiện trường', desc: 'Đọc và tương tác với các hồ sơ vụ án mở', status: 'Đã cấp (Toàn quyền)' },
                { name: '2. Trình thực thi SQL Sandbox', desc: 'Thực thi câu lệnh SQL trong môi trường cô lập an toàn', status: 'Đã cấp (Sandbox)' },
                { name: '3. Bộ xử lý dữ liệu Excel', desc: 'Xem và phân tích các bảng tính chứng cứ', status: 'Đã cấp (Cho phép)' },
                { name: '4. Sổ tay ghi chép & Manh mối', desc: 'Tự do lưu trữ phát hiện và giả thuyết', status: 'Đã cấp (Read/Write)' },
                { name: '5. Bảng xếp hạng & Thành tích', desc: 'Hiển thị XP và tiến trình lên bảng vàng', status: 'Đã cấp (Public)' },
                {
                  name: '6. Bảng điều khiển Admin Console',
                  desc: 'Quản lý khóa học, vụ án và cấu hình người dùng',
                  status: isAdmin(user?.role) ? 'Đã cấp (Toàn quyền)' : 'Từ chối (Yêu cầu quyền Admin)',
                  isAdminItem: true,
                },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      p.isAdminItem && !isAdmin(user?.role)
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* Footer notice */}
      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground pt-4">
        Hệ thống Avi-Mystery HQ · Mọi thay đổi tuỳ chỉnh được lưu tự động
      </p>
    </div>
  );
}
