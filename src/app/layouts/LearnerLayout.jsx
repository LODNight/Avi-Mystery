import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Flame,
  Home,
  Map,
  BookOpen,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Dumbbell,
  AlertTriangle,
  Info,
  Wrench,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../providers/ThemeProvider.jsx';
import { usePageStatus } from '../../hooks/usePageStatus.js';
import { useBrand, BrandLogoIcon } from '../providers/BrandProvider.jsx';
import { FEATURE_FLAGS } from '../../config/envConfig.js';
import { UnderMaintenancePage } from '../../pages/learner/UnderMaintenancePage.jsx';
import { formatXP } from '../../utils/format.js';

const learnerNav = [
  { label: 'Tổng quan', to: '/dashboard', icon: Home },
  { label: 'Bản đồ học', to: '/map', icon: Map },
  { label: 'Khóa học', to: '/courses', icon: BookOpen },
  { label: 'Luyện tập', to: '/practice', icon: Dumbbell },
  { label: 'Thành tựu', to: '/achievements', icon: Trophy },
  { label: 'Hồ sơ', to: '/profile', icon: User },
];

export function LearnerLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('avi_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getPageStatus, adminBypass, toggleAdminBypass } = usePageStatus();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPageStatus = getPageStatus(location.pathname);
  const isMaintenance = currentPageStatus?.status === 'maintenance';
  const isNotice = currentPageStatus?.status === 'notice';
  const isAdminUser = user?.role === 'admin';
  const shouldBlockLearner = isMaintenance && (!isAdminUser || !adminBypass);

  useEffect(() => {
    localStorage.setItem('avi_sidebar_collapsed', collapsed ? 'true' : 'false');
  }, [collapsed]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const activeNavItem = learnerNav.find((item) => item.to === location.pathname);
  const pageTitle = activeNavItem ? activeNavItem.label : 'Nhà điều tra dữ liệu';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          aria-label="Đóng menu điều hướng"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-stone-200 dark:border-stone-800 bg-sidebar py-5 shadow-sm sm:shadow-md transition-all duration-300 ease-in-out lg:translate-x-0 ${
          collapsed ? 'w-20 px-3.5' : 'w-72 px-4'
        } ${mobileOpen ? 'translate-x-0 w-72 px-4' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between px-1'}`}>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 min-w-0"
            onClick={() => setMobileOpen(false)}
            title={brand.brandName}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BrandLogoIcon className="size-5" />
            </span>
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-lg font-bold tracking-tight text-sidebar-foreground truncate animate-fade-in">
                  {brand.brandName}
                </span>
                {FEATURE_FLAGS.showDevBadge && (
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    DEV
                  </span>
                )}
              </div>
            )}
          </Link>

          {/* Desktop Sidebar Collapse Toggle (Chỉ hiện khi mở rộng) */}
          {(!collapsed || mobileOpen) && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors shrink-0"
              title="Thu gọn sidebar"
              aria-label="Thu gọn sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* User Card Badge */}
        <div className="mt-6 rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-2.5 transition-all">
          <div className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'gap-3'}`}>
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/20 font-mono text-sm font-bold text-primary"
              title={user?.name || 'Học viên'}
            >
              {initials}
            </span>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {user?.name || 'Học viên'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Cấp {user?.level || 1} · Investigator
                </p>
              </div>
            )}
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Flame className="size-4 fill-amber-500" />
                <span className="text-xs font-bold">{user?.streak || 0}d</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="mt-6 flex flex-col gap-1 overflow-y-auto flex-1" aria-label="Menu chính">
          {(!collapsed || mobileOpen) && (
            <p className="px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground animate-fade-in">
              Học tập
            </p>
          )}
          {learnerNav.map(({ label, to, icon: Icon }) => {
            const navStatus = getPageStatus(to);
            const isItemMaintenance = navStatus?.status === 'maintenance';
            const isItemNotice = navStatus?.status === 'notice';
            const isPathActive =
              location.pathname === to ||
              (to === '/map' && location.pathname.startsWith('/missions')) ||
              (to !== '/dashboard' && location.pathname.startsWith(to));

            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                title={collapsed && !mobileOpen ? `${label}${isItemMaintenance ? ' (Đang bảo trì)' : ''}` : undefined}
                className={
                  `relative flex items-center justify-between gap-2 rounded-xl transition-all ${
                    collapsed && !mobileOpen ? 'justify-center p-3' : 'px-3.5 py-3 text-sm'
                  } ${
                    isPathActive
                      ? 'bg-primary/15 text-primary dark:bg-amber-500/15 dark:text-amber-400 font-bold border-l-4 border-primary dark:border-amber-400 shadow-xs'
                      : 'text-sidebar-foreground/75 font-medium hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`size-[18px] shrink-0 ${isPathActive ? 'text-primary dark:text-amber-400' : ''}`} />
                  {(!collapsed || mobileOpen) && <span className="truncate">{label}</span>}
                </div>

                {(!collapsed || mobileOpen) && isItemMaintenance && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    Bảo trì
                  </span>
                )}
                {(!collapsed || mobileOpen) && !isItemMaintenance && isItemNotice && (
                  <span className="size-2 rounded-full bg-amber-500 shrink-0 animate-ping" title="Có thông báo mới" />
                )}
              </NavLink>
            );
          })}

          <div className="my-3 h-px bg-sidebar-border" />

          {(!collapsed || mobileOpen) && (
            <p className="px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground animate-fade-in">
              Tài khoản
            </p>
          )}
          <button
            onClick={handleLogout}
            title={collapsed && !mobileOpen ? 'Đăng xuất' : undefined}
            className={`flex items-center gap-3 rounded-xl text-destructive hover:bg-sidebar-accent transition-all ${
              collapsed && !mobileOpen ? 'justify-center p-3' : 'px-3 py-3 text-left text-sm font-medium'
            }`}
          >
            <LogOut className="size-[18px] shrink-0" />
            {(!collapsed || mobileOpen) && <span>Đăng xuất</span>}
          </button>
        </nav>

        {/* Streak Promo Card - Subtle Surface with Amber Accent */}
        {(!collapsed || mobileOpen) ? (
          <div className="mt-auto rounded-2xl border border-stone-200 bg-stone-50/90 dark:border-amber-500/25 dark:bg-stone-900/95 p-3.5 text-stone-800 dark:text-stone-100 shadow-2xs dark:shadow-md animate-fade-in transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500 fill-amber-500/20" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-100">Chuỗi học tập</span>
              </div>
              <span className="rounded-full border border-stone-200 dark:border-amber-500/30 bg-stone-100 dark:bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-700 dark:text-amber-300">
                {formatXP(user?.xp || 0)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              Hoàn thành 1 nhiệm vụ hôm nay để duy trì tiến trình.
            </p>
            <Link
              to="/dashboard"
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors"
            >
              Vào nhiệm vụ <ChevronRight className="size-3" />
            </Link>
          </div>
        ) : (
          <div className="mt-auto flex justify-center pt-2">
            <Link
              to="/dashboard"
              className="grid size-10 place-items-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-700 dark:border-amber-500/30 dark:bg-stone-900 dark:text-amber-400 shadow-2xs hover:border-amber-500 hover:text-amber-400 transition-all"
              title={`XP: ${formatXP(user?.xp || 0)} · Giữ vững streak học tập`}
            >
              <Sparkles className="size-4" />
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main Content Area ── */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 px-5 backdrop-blur-md sm:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="rounded-xl border border-border p-2.5 lg:hidden text-foreground hover:bg-muted"
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </button>

            {/* Desktop Sidebar Toggle Button in Header */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden lg:flex items-center justify-center rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              <PanelLeft className="size-5" />
            </button>

            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Không gian nhà điều tra
              </p>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
            </button>

            {/* Admin preview switcher */}
            {isAdminUser && (
              <Link
                to="/admin"
                className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted lg:flex"
              >
                <PanelLeft className="size-4 text-primary" />
                Chuyển sang Admin
              </Link>
            )}

            {/* User Avatar Initials */}
            <div
              className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold"
              title={user?.name}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Banners Area */}
        {/* Admin Bypass Banner indicator */}
        {isMaintenance && isAdminUser && adminBypass && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-5 py-2.5 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="size-4 shrink-0" />
              <span>Chế độ Xem với quyền Admin: Trang này đang ở trạng thái BẢO TRÌ đối với Học viên thường.</span>
            </div>
            <button
              onClick={toggleAdminBypass}
              className="underline text-xs font-bold hover:text-foreground shrink-0"
            >
              Tắt xem trước
            </button>
          </div>
        )}

        {/* Learner Notice Banner */}
        {!shouldBlockLearner && isNotice && currentPageStatus?.noticeMessage && (
          <div className="bg-blue-500/10 border-b border-blue-500/20 px-5 py-2.5 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-2">
            <Info className="size-4 shrink-0" />
            <span><strong>Thông báo:</strong> {currentPageStatus.noticeMessage}</span>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-5 sm:p-8">
          {shouldBlockLearner ? (
            <UnderMaintenancePage pageConfig={currentPageStatus} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

