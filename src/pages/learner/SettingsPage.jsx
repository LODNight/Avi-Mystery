import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Moon,
  Sun,
  User,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  KeyRound,
  Palette,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useTheme, getContrastForeground } from '../../app/providers/ThemeProvider.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatXP } from '../../utils/format.js';
import { DETECTIVE_PERSONA_PRESETS, analyzeContrast, parseHex } from '../../utils/colorEngine.js';
import InvestigationStamp from '../../components/investigation/InvestigationStamp.jsx';

/* ─── Constants ─────────────────────────────────────────────── */

const AVATAR_PRESETS = [
  { id: 'classic',  emoji: '🕵️', fallbackLabel: 'Cổ điển' },
  { id: 'cyber',    emoji: '💻', fallbackLabel: 'Điều tra Số' },
  { id: 'forensic', emoji: '🔬', fallbackLabel: 'Pháp y' },
  { id: 'shadow',   emoji: '🕶️', fallbackLabel: 'Điệp viên' },
  { id: 'analyst',  emoji: '📊', fallbackLabel: 'Phân tích' },
  { id: 'field',    emoji: '🎯', fallbackLabel: 'Hiện trường' },
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

/* ══════════════════════════════════════════════════════════════ */
export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'profile';
  const activeTab = (rawTab === 'appearance-color' || rawTab === 'appearance-typography')
    ? 'appearance'
    : (rawTab === 'account')
    ? 'account-password'
    : (['profile', 'appearance', 'language', 'account-password'].includes(rawTab) ? rawTab : 'profile');

  const { theme, toggleTheme, primaryColor, setPrimaryColor } = useTheme();
  const { user, updateProfile, changePassword } = useAuth();
  const { t, i18n } = useTranslation(['settings', 'common', 'nav']);

  /* ── Profile state ── */
  const [name, setName] = useState(user?.name || '');
  const [avatarId, setAvatarId] = useState(user?.avatar || 'classic');
  const [profileSaveState, setProfileSaveState] = useState(null);

  /* ── Appearance state ── */
  const currentLang = (i18n.language || 'vi').toLowerCase().startsWith('en') ? 'en' : 'vi';

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
  const strengthLabels = [
    '',
    t('settings:strengthVeryWeak', 'Rất yếu'),
    t('settings:strengthWeak', 'Yếu'),
    t('settings:strengthMedium', 'Trung bình'),
    t('settings:strengthStrong', 'Mạnh'),
    t('settings:strengthVeryStrong', 'Rất mạnh'),
  ];

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
      return setPwdError(t('settings:pwdFillAll', 'Vui lòng điền đầy đủ tất cả các trường.'));
    }
    if (newPwd !== conPwd) {
      return setPwdError(t('settings:pwdMismatch', 'Mật khẩu mới và mật khẩu xác nhận không khớp.'));
    }
    if (newPwd.length < 8) {
      return setPwdError(t('settings:pwdMinLength', 'Mật khẩu mới phải có tối thiểu 8 ký tự.'));
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
                {t('settings:investigatorProfile', 'INVESTIGATOR PROFILE · CONFIDENTIAL')}
              </p>
              <h1 className="text-lg font-black tracking-tight text-foreground">
                {user?.name || t('settings:cadetInvestigator', 'Học viên Điều tra')}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>{user?.email}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-500">
                  <span className="size-1 rounded-full bg-emerald-500" /> {t('settings:verified', 'Đã xác thực')}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              {t('settings:accumulatedXp', 'Điểm tích lũy XP')}
            </p>
            <p className="text-lg font-black text-primary">{formatXP(user?.xp || 0)}</p>
          </div>
        </div>
      </div>

      {/* ═══════════ CONDITIONAL RENDER BY ACTIVE TAB ═══════════ */}

      {/* 1. HỒ SƠ */}
      {activeTab === 'profile' && (
        <SectionWrapper
          title={t('settings:profileSectionTitle', 'Hồ sơ Điều tra viên')}
          description={t('settings:profileSectionDesc', 'Thiết lập nhân dạng, tên hiển thị và bí danh của bạn trong hệ thống')}
          icon={User}
        >
          {/* Avatar selector */}
          <SettingRow
            topAligned
            label={t('settings:avatarLabel', 'Biểu tượng Avatar')}
            description={t('settings:avatarDesc', 'Chọn biểu tượng đại diện trong sổ tay vụ án và xếp hạng')}
          >
            <div className="flex flex-col items-end gap-2">
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((p) => {
                  const avatarTitle = t(`settings:avatar_${p.id}`, p.fallbackLabel);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={avatarTitle}
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
                  );
                })}
              </div>
              {profileSaveState === 'saving' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> {t('settings:saving', 'Đang lưu...')}
                </span>
              )}
              {profileSaveState === 'saved' && (
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle className="size-3.5" /> {t('settings:saved', 'Đã cập nhật')}
                </span>
              )}
            </div>
          </SettingRow>

          {/* Display Name */}
          <SettingRow
            label={t('settings:displayNameLabel', 'Tên hiển thị')}
            description={t('settings:displayNameDesc', 'Hiển thị trên lời chào, dashboard và báo cáo điều tra')}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                placeholder={t('settings:namePlaceholder', 'Tên điều tra viên')}
                className="w-56 rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right"
              />
            </div>
          </SettingRow>

          {/* Codename */}
          <SettingRow
            label={t('settings:codenameLabel', 'Mã danh điều tra')}
            description={t('settings:codenameDesc', 'Mã hiệu bảo mật gán cho hồ sơ tác nghiệp')}
          >
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 font-mono text-xs font-bold text-primary">
              AGENT-{(user?.id || '001').slice(0, 6).toUpperCase()}
            </span>
          </SettingRow>
        </SectionWrapper>
      )}

      {/* 2. GIAO DIỆN & TRẢI NGHIỆM */}
      {activeTab === 'appearance' && (
        <SectionWrapper
          title={t('settings:appearanceSectionTitle', 'Giao diện & Trải nghiệm')}
          description={t('settings:appearanceSectionDesc', 'Tùy chỉnh chế độ hiển thị Sáng/Tối và bảng màu chủ đạo (Primary Color)')}
          icon={Palette}
        >
          {/* Display Mode (Light / Dark) */}
          <SettingRow
            label={t('settings:themeModeLabel', 'Chế độ hiển thị')}
            description={t('settings:themeModeDesc', 'Chọn tông màu tối ưu cho môi trường làm việc của bạn')}
          >
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
                <Sun className="size-4" /> {t('settings:lightMode', 'Sáng (Light)')}
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
                <Moon className="size-4" /> {t('settings:darkMode', 'Tối (Dark)')}
              </button>
            </div>
          </SettingRow>

          {/* Color Picker & Custom HEX Bar */}
          <SettingRow
            topAligned
            label={t('settings:customColorLabel', 'Thanh nhập bảng màu tùy ý')}
            description={t('settings:customColorDesc', 'Tự do kéo chọn màu hoặc nhập trực tiếp mã màu HEX yêu thích cho toàn bộ giao diện')}
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
                    title={t('settings:customColorPickerTitle', 'Bấm để chọn màu tự do')}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                    {t('settings:hexCodeLabel', 'Mã màu HEX')}
                  </p>
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
                    title={t('settings:resetDefault', 'Khôi phục mặc định')}
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Contrast Meter */}
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                    style={{ backgroundColor: activeColor }}
                  />
                  <span className="font-mono font-semibold text-muted-foreground text-[11px]">
                    {t('settings:contrastScore', 'Tương phản {{score}}', { score: contrastAnalysis.score })}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  contrastAnalysis.isAccessible
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  <CheckCircle className="size-2.5" /> {t('settings:wcagStandard', 'Chuẩn {{level}}', { level: contrastAnalysis.wcagLevel })}
                </span>
              </div>

              {/* Presets Swatches */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t('settings:paletteCollection', 'Bộ sưu tập bảng màu thám tử')}
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
                  {t('settings:livePreviewTitle', 'Thao trường xem trước tương tác')}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t('settings:livePreviewDesc', 'Mô phỏng tức thì các thành phần giao diện thực tế khi áp dụng bảng màu')}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle className="size-3" /> {t('settings:contrastPassed', 'Đạt chuẩn tương phản ({{score}})', { score: contrastAnalysis.score })}
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
                    {t('settings:primaryButton', 'Nút Primary')}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 active:scale-98 transition-all cursor-pointer"
                  >
                    {t('settings:outlineButton', 'Nút Outline')}
                  </button>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary border border-primary/25">
                    <Sparkles className="size-3" /> {t('settings:featuredBadge', 'Badge Nổi Bật')}
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
                      {t('settings:evidenceTitle', 'VẬT CHỨNG #EVD-049')}
                    </span>
                  </div>
                  <InvestigationStamp
                    variant="classified"
                    label={t('settings:classifiedStamp', 'HỒ SƠ MẬT')}
                    size="sm"
                    animated={false}
                    rotate="-rotate-2"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-foreground">{t('settings:evidenceDescHeader', 'Trích xuất cơ sở dữ liệu nghi can')}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t('settings:evidenceDescSub', 'Độ tương phản tự động bảo đảm văn bản luôn sắc nét và dễ đọc.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* 3. NGÔN NGỮ */}
      {activeTab === 'language' && (
        <SectionWrapper
          title={t('settings:languageTitle', 'Ngôn ngữ hiển thị')}
          description={t('settings:languageDesc', 'Tùy chỉnh ngôn ngữ áp dụng trên toàn bộ ứng dụng')}
          icon={Globe}
        >
          <SettingRow
            label={t('settings:systemLanguageLabel', 'Ngôn ngữ hệ thống')}
            description={t('settings:systemLanguageDesc', 'Ngôn ngữ được ưu tiên hiển thị')}
          >
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
        </SectionWrapper>
      )}

      {/* 4. BẢO MẬT & MẬT KHẨU */}
      {activeTab === 'account-password' && (
        <SectionWrapper
          title={t('settings:securityTitle', 'Bảo mật & Mật khẩu')}
          description={t('settings:securityDesc', 'Quản lý và cập nhật mật khẩu bảo mật cho tài khoản của bạn')}
          icon={KeyRound}
        >
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                {t('settings:currentPassword', 'Mật khẩu hiện tại')}
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
                {t('settings:newPassword', 'Mật khẩu mới')}
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
                    {t('settings:strengthLabel', 'Độ mạnh:')} <span className="font-bold text-foreground">{strengthLabels[pwdStrength]}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                {t('settings:confirmPassword', 'Xác nhận mật khẩu mới')}
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
                  <Loader2 className="size-3 animate-spin" /> {t('settings:updating', 'Đang cập nhật...')}
                </span>
              )}
              {pwdSaveState === 'saved' && (
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle className="size-3.5" /> {t('settings:passwordUpdated', 'Mật khẩu đã được đổi thành công!')}
                </span>
              )}
              {!pwdSaveState && <span />}

              <button
                type="submit"
                disabled={pwdSaveState === 'saving'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="size-3.5" /> {t('settings:updatePasswordBtn', 'Cập nhật mật khẩu')}
              </button>
            </div>
          </form>
        </SectionWrapper>
      )}

      {/* Footer notice */}
      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground pt-4">
        {t('settings:quickNotice', 'Hệ thống Avi-Mystery HQ · Mọi thay đổi tuỳ chỉnh được lưu tự động')}
      </p>
    </div>
  );
}