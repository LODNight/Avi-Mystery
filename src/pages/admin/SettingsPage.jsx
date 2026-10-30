import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Globe,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Moon,
  Sun,
  Eye,
  Sliders,
  Save,
  RotateCcw,
  Bell,
  Lock,
  Terminal,
  Play,
} from 'lucide-react';
import { AdminPageStatusPage } from './PageStatusPage.jsx';
import { usePageStatus } from '../../hooks/usePageStatus.js';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';
import { useBrand, PRESET_LOGOS, BrandLogoIcon } from '../../app/providers/BrandProvider.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { onboardingService } from '../../features/onboarding/onboardingService.js';

export function AdminSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTabFromUrl = searchParams.get('tab') || 'pages';
  const [activeTab, setActiveTab] = useState(activeTabFromUrl);

  const { user } = useAuth();
  const { adminBypass, toggleAdminBypass } = usePageStatus();
  const { theme, toggleTheme } = useTheme();
  const { brand, updateBrand, resetBrand } = useBrand();

  const [brandForm, setBrandForm] = useState({
    brandName: brand.brandName,
    brandTagline: brand.brandTagline,
    brandLogo: brand.brandLogo,
  });

  const [toastMessage, setToastMessage] = useState('');

  // Sync tab with URL search param
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setBrandForm({
      brandName: brand.brandName,
      brandTagline: brand.brandTagline,
      brandLogo: brand.brandLogo,
    });
  }, [brand]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSaveBrand = (e) => {
    e.preventDefault();
    updateBrand(brandForm);
    showToast('Đã lưu cấu hình Logo & Favicon thành công! Trình duyệt và giao diện đã tự động đồng bộ.');
  };

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-sm border border-primary/40 bg-card px-4 py-3 text-foreground shadow-2xl font-mono text-xs font-bold">
          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Archival Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
              BUREAU CONTROL // SYSTEM CONFIG
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Quản trị & Cấu hình
            </p>
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cài đặt Hệ thống
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            Quản lý trạng thái các trang, bảo trì, logo thương hiệu và phân quyền hệ thống Avi-Mystery.
          </p>
        </div>
      </div>

      {/* File Cabinet Index Tabs */}
      <div className="flex items-center gap-1.5 border-b-2 border-border overflow-x-auto">
        <button
          onClick={() => handleTabChange('pages')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pages'
              ? 'rounded-t-sm border-t-2 border-x border-primary bg-card text-primary -mb-[2px]'
              : 'border-t-2 border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <Globe className="size-3.5 shrink-0" />
          <span>Quản lý trạng thái trang & Bảo trì</span>
        </button>

        <button
          onClick={() => handleTabChange('system')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'system'
              ? 'rounded-t-sm border-t-2 border-x border-primary bg-card text-primary -mb-[2px]'
              : 'border-t-2 border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <Settings className="size-3.5 shrink-0" />
          <span>Cấu hình chung & Logo Thương hiệu</span>
        </button>

        <button
          onClick={() => handleTabChange('security')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'rounded-t-sm border-t-2 border-x border-primary bg-card text-primary -mb-[2px]'
              : 'border-t-2 border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <ShieldCheck className="size-3.5 shrink-0" />
          <span>Bảo mật & Phân quyền</span>
        </button>
      </div>

      {/* Tab Content 1: Page Status & Maintenance Manager */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <AdminPageStatusPage />
        </div>
      )}

      {/* Tab Content 2: System Settings */}
      {activeTab === 'system' && (
        <div className="mx-auto max-w-4xl space-y-6">
          {/* ── Brand & Logo Configuration Card ── */}
          <form onSubmit={handleSaveBrand} className="dossier-card corner-brackets rounded-md border border-border bg-card p-6 shadow-2xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Settings className="size-4 text-primary" />
                Cấu hình Logo & Thương hiệu Trang (Dynamic Favicon)
              </h3>
              <span className="rounded-xs border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-primary">
                Tự động đồng bộ Tab & App Logo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tên thương hiệu */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Tên thương hiệu trang (Site Title)
                </label>
                <input
                  type="text"
                  value={brandForm.brandName}
                  onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                  placeholder="Ví dụ: Avi-Mystery"
                  className="w-full rounded-sm border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>

              {/* Khẩu hiệu */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Khẩu hiệu / Mô tả ngắn (Tagline)
                </label>
                <input
                  type="text"
                  value={brandForm.brandTagline}
                  onChange={(e) => setBrandForm({ ...brandForm, brandTagline: e.target.value })}
                  placeholder="Nền tảng học phân tích dữ liệu..."
                  className="w-full rounded-sm border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Chọn Logo Biểu Tượng & Dynamic Favicon */}
            <div className="space-y-3">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                Chọn biểu tượng Logo & Favicon tab trình duyệt
              </label>
              <p className="text-xs text-muted-foreground">
                Biểu tượng bạn chọn bên dưới sẽ lập tức đổi biểu tượng logo trên ứng dụng và thẻ favicon góc trên trình duyệt.
              </p>

              {/* Preset Icon Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {PRESET_LOGOS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = brandForm.brandLogo === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBrandForm({ ...brandForm, brandLogo: item.id })}
                      className={`flex flex-col items-center justify-center gap-2 rounded-sm border p-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                          : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="grid size-9 place-items-center rounded-sm border border-primary/30 bg-primary/15 text-primary">
                        <Icon className="size-4.5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-center leading-tight">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL input */}
              <div className="pt-2 space-y-1.5">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Hoặc nhập đường dẫn hình ảnh Custom Logo (URL image/png/svg)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={PRESET_LOGOS.some((p) => p.id === brandForm.brandLogo) ? '' : brandForm.brandLogo}
                    onChange={(e) => {
                      if (e.target.value.trim()) {
                        setBrandForm({ ...brandForm, brandLogo: e.target.value.trim() });
                      }
                    }}
                    placeholder="https://example.com/custom-logo.svg"
                    className="flex-1 rounded-sm border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-sm bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-sm border border-primary/50 bg-primary text-primary-foreground shadow-sm">
                  <BrandLogoIcon logoKey={brandForm.brandLogo} className="size-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider">
                    Xem trước Logo & Favicon
                  </p>
                  <p className="font-display text-base font-bold text-foreground">
                    {brandForm.brandName || 'Avi-Mystery'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetBrand();
                    showToast('Đã khôi phục logo mặc định');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  Mặc định
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:opacity-90 transition-all cursor-pointer"
                >
                  <Save className="size-3.5" />
                  Lưu cấu hình Logo
                </button>
              </div>
            </div>
          </form>

          {/* ── Display Settings & Preview ── */}
          <div className="dossier-card rounded-md border border-border bg-card p-6 shadow-2xs space-y-5">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Sliders className="size-4 text-primary" />
              Cấu hình Chế độ Xem trước & Hiển thị
            </h3>

            {/* Admin Maintenance Bypass Toggle */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-sm bg-muted/30 border border-dashed border-border">
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Eye className="size-4 text-amber-500" />
                  Bỏ qua Bảo trì dành cho Admin
                </p>
                <p className="text-xs text-muted-foreground max-w-md">
                  Khi bật tính năng này, tài khoản Admin có thể vào xem bình thường các trang đang đặt trạng thái Bảo trì.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleAdminBypass();
                  showToast(adminBypass ? 'Đã tắt chế độ xem trước Admin' : 'Đã bật chế độ xem trước Admin');
                }}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-sm border transition-colors duration-200 ease-in-out focus:outline-none ${
                  adminBypass ? 'border-primary bg-primary' : 'border-border bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 m-0.5 transform rounded-xs bg-white shadow-sm transition duration-200 ease-in-out ${
                    adminBypass ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-sm bg-muted/30 border border-dashed border-border">
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="size-4 text-primary" /> : <Sun className="size-4 text-primary" />}
                  Giao diện Ứng dụng ({theme === 'dark' ? 'Chế độ Tối' : 'Chế độ Sáng'})
                </p>
                <p className="text-xs text-muted-foreground">
                  Đổi tông màu chủ đạo thám tử (Chế độ Tối / Chế độ Sáng).
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  showToast('Đã đổi giao diện hệ thống');
                }}
                className="rounded-sm border border-border bg-card px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted cursor-pointer"
              >
                {theme === 'dark' ? 'Chuyển sang Sáng' : 'Chuyển sang Tối'}
              </button>
            </div>
          </div>

          {/* ── Dev Onboarding Testing Card ── */}
          <div className="dossier-card corner-brackets rounded-md border border-primary/40 bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Terminal className="size-4 text-primary" />
                Công cụ Dev: Test Chế độ Hướng dẫn Onboarding
              </h3>
              <span className="rounded-xs border border-primary/40 bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary">
                DEV TESTING
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dành riêng cho Dev/Admin để kiểm thử luồng hướng dẫn nhập môn (Welcome Gate, Tutorial Case 0) và Tour Dashboard mà <strong>không cần phải tạo tài khoản mới</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const targetUserId = user?.id || 'learner-1';
                  onboardingService.reset(targetUserId);
                  showToast('Đã reset trạng thái Onboarding! Đang chuyển sang trang Welcome Gate...');
                  setTimeout(() => navigate('/onboarding'), 800);
                }}
                className="flex items-center justify-center gap-2 rounded-sm bg-primary hover:opacity-90 text-primary-foreground px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                <Play className="size-3.5 fill-current" />
                <span>Test Luồng Welcome Gate & Case 0</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetUserId = user?.id || 'learner-1';
                  onboardingService.resetDashboardTour(targetUserId);
                  showToast('Đã reset Tour Dashboard! Đang chuyển hướng tới Dashboard...');
                  setTimeout(() => navigate('/dashboard'), 800);
                }}
                className="flex items-center justify-center gap-2 rounded-sm border border-primary/40 bg-card hover:bg-primary/10 text-foreground px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <RotateCcw className="size-3.5 text-primary" />
                <span>Test Tour Dashboard (5 bước)</span>
              </button>
            </div>
          </div>

          <div className="dossier-card rounded-md border border-border bg-card p-6 shadow-2xs space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Bell className="size-4 text-primary" />
              Thông báo Hệ thống
            </h3>
            <p className="text-xs text-muted-foreground">
              Quản lý kênh phát sóng thông báo khẩn cấp cho tất cả các nhà điều tra Avi-Mystery.
            </p>
            <div className="space-y-3">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                Thông báo mặc định trên trang Tổng quan
              </label>
              <input
                type="text"
                defaultValue="Chào mừng bạn đến với Nền tảng Điều tra Dữ liệu Avi-Mystery!"
                className="w-full rounded-sm border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => showToast('Đã lưu cấu hình thông báo')}
                className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer"
              >
                <Save className="size-3.5" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Security & Roles */}
      {activeTab === 'security' && (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="dossier-card corner-brackets rounded-md border border-border bg-card p-6 shadow-2xs space-y-6">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Lock className="size-4 text-primary" />
              Phân quyền & Vai trò người dùng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-sm border border-dashed border-border bg-muted/30 p-4 space-y-2">
                <span className="rounded-xs border border-primary/40 bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary inline-block">
                  CLEARANCE // ADMIN
                </span>
                <h4 className="font-display text-base font-bold text-foreground">Quản trị viên Hệ thống</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Toàn quyền chuyển trạng thái các trang</li>
                  <li>Quản lý khóa học, chapter & mission</li>
                  <li>Bỏ qua bảo trì để preview nội dung</li>
                </ul>
              </div>

              <div className="rounded-sm border border-dashed border-border bg-muted/30 p-4 space-y-2">
                <span className="rounded-xs border border-border bg-muted px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-foreground inline-block">
                  CLEARANCE // LEARNER
                </span>
                <h4 className="font-display text-base font-bold text-foreground">Nhà điều tra dữ liệu</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Truy cập học tập theo lộ trình</li>
                  <li>Bị giới hạn khi trang chuyển Bảo trì</li>
                  <li>Nhận thông báo cập nhật mới</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
