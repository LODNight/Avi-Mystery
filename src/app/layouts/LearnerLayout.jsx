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
  ChevronDown,
  GraduationCap,
  Sparkles,
  Dumbbell,
  AlertTriangle,
  Info,
  Wrench,
  Eye,
  Library,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../providers/ThemeProvider.jsx';
import { usePageStatus } from '../../hooks/usePageStatus.js';
import { useBrand, BrandLogoIcon } from '../providers/BrandProvider.jsx';
import { FEATURE_FLAGS } from '../../config/envConfig.js';
import { UnderMaintenancePage } from '../../pages/learner/UnderMaintenancePage.jsx';
import { formatXP } from '../../utils/format.js';
import { StreakDetailModal } from '../../features/gamification/StreakDetailModal.jsx';
import { LevelUpModal } from '../../features/gamification/LevelUpModal.jsx';
import { isAdmin } from '../../constants/roles.js';

export const learnerNavItems = [
  {
    label: 'Tổng quan',
    to: '/dashboard',
    icon: Home,
  },
  {
    id: 'learning',
    label: 'Không gian học tập',
    icon: GraduationCap,
    children: [
      { label: 'Bản đồ học', to: '/map', icon: Map },
      { label: 'Khóa học', to: '/courses', icon: BookOpen },
      { label: 'Thư viện kiến thức', to: '/knowledge', icon: Library },
      { label: 'Phòng luyện tập', to: '/practice', icon: Dumbbell },
    ],
  },
  {
    id: 'detective',
    label: 'Hồ sơ thám tử',
    icon: User,
    children: [
      { label: 'Thành tựu & Huy hiệu', to: '/achievements', icon: Trophy },
      { label: 'Hồ sơ cá nhân', to: '/profile', icon: User },
    ],
  },
];

export const learnerNav = learnerNavItems.flatMap((item) => item.children || [item]);

export function isLearnerNavPathActive(pathname, navPath) {
  if (pathname === navPath) return true;
  if (navPath === '/map' && /^\/missions(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/knowledge' && /^\/knowledge(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/dashboard') return false;
  return pathname.startsWith(`${navPath}/`);
}

export function LearnerLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('avi_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const location = useLocation();

  const isLearningActive = [
    '/map',
    '/courses',
    '/knowledge',
    '/practice',
    '/missions',
  ].some((path) => location.pathname.startsWith(path));

  const isDetectiveActive = [
    '/achievements',
    '/profile',
  ].some((path) => location.pathname.startsWith(path));

  const [openGroups, setOpenGroups] = useState({
    learning: true, // Mặc định mở để học viên thấy lộ trình học
    detective: isDetectiveActive,
  });

  useEffect(() => {
    if (isLearningActive) {
      setOpenGroups((prev) => ({ ...prev, learning: true }));
    }
    if (isDetectiveActive) {
      setOpenGroups((prev) => ({ ...prev, detective: true }));
    }
  }, [location.pathname, isLearningActive, isDetectiveActive]);

  const toggleGroup = (groupId) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((prev) => ({ ...prev, [groupId]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getPageStatus, adminBypass, toggleAdminBypass } = usePageStatus();
  const { brand } = useBrand();
  const navigate = useNavigate();

  const [liveStats, setLiveStats] = useState({
    xp: user?.xp || 0,
    streak: user?.streak || 0,
    level: user?.level || 1,
  });

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    async function fetchStats() {
      try {
        const { progressService } = await import('../../services/index.js');
        const res = await progressService.getLearnerXp(user.id);
        if (res.data && isMounted) {
          setLiveStats({
            xp: typeof res.data.totalXp === 'number' ? res.data.totalXp : (user?.xp || 0),
            streak: res.data.streakSummary?.currentStreak ?? (user?.streak || 0),
            level: res.data.currentLevel ?? (user?.level || 1),
          });
        }
      } catch (e) {
        console.error('Failed to load layout learner stats:', e);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [user, location.pathname]);

  const currentPageStatus = getPageStatus(location.pathname);
  const isMaintenance = currentPageStatus?.status === 'maintenance';
  const isNotice = currentPageStatus?.status === 'notice';
  const isAdminUser = isAdmin(user?.role);
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
        id="app-sidebar"
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
                  Cấp {liveStats.level} · Investigator
                </p>
              </div>
            )}
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Flame className="size-4 fill-amber-500" />
                <span className="text-xs font-bold">{liveStats.streak} ngày</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="mt-6 flex flex-col gap-1 overflow-y-auto flex-1" aria-label="Menu chính">
          {learnerNavItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);
            const groupId = item.id || 'group';
            const isOpen = Boolean(openGroups[groupId]);

            if (hasChildren) {
              const isGroupActive = item.children.some((child) =>
                isLearnerNavPathActive(location.pathname, child.to)
              );

              return (
                <div key={item.id || item.label} className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupId)}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl transition-all ${
                      collapsed && !mobileOpen ? 'justify-center p-3' : 'px-3.5 py-2.5 text-sm font-medium'
                    } ${
                      isGroupActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border-l-4 border-amber-500 shadow-xs'
                        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`size-[18px] shrink-0 ${isGroupActive ? 'text-amber-500 dark:text-amber-400' : ''}`} />
                      {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                    </div>
                    {(!collapsed || mobileOpen) && (
                      <ChevronDown
                        className={`size-4 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Dropdown Sub-menu Items */}
                  {isOpen && (!collapsed || mobileOpen) && (
                    <div className="ml-4 pl-3 border-l border-sidebar-border flex flex-col gap-1 my-1 animate-fade-in">
                      {item.children.map(({ label, to, icon: ChildIcon }) => {
                        const navStatus = getPageStatus(to);
                        const isItemMaintenance = navStatus?.status === 'maintenance';
                        const isItemNotice = navStatus?.status === 'notice';
                        const isPathActive = isLearnerNavPathActive(location.pathname, to);

                        return (
                          <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                              isPathActive
                                ? 'bg-primary/15 text-primary dark:bg-amber-500/15 dark:text-amber-400 font-bold'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ChildIcon className={`size-3.5 shrink-0 ${isPathActive ? 'text-amber-500 dark:text-amber-400' : ''}`} />
                              <span className="truncate">{label}</span>
                            </div>
                            {isItemMaintenance && (
                              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                                Bảo trì
                              </span>
                            )}
                            {!isItemMaintenance && isItemNotice && (
                              <span className="size-1.5 rounded-full bg-amber-500 shrink-0 animate-ping" title="Có thông báo mới" />
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single item (Dashboard)
            const isPathActive = isLearnerNavPathActive(location.pathname, item.to);
            const navStatus = getPageStatus(item.to);
            const isItemMaintenance = navStatus?.status === 'maintenance';
            const isItemNotice = navStatus?.status === 'notice';

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                title={collapsed && !mobileOpen ? `${item.label}${isItemMaintenance ? ' (Đang bảo trì)' : ''}` : undefined}
                className={`relative flex items-center justify-between gap-2 rounded-xl transition-all ${
                  collapsed && !mobileOpen ? 'justify-center p-3' : 'px-3.5 py-2.5 text-sm'
                } ${
                  isPathActive
                    ? 'bg-primary/15 text-primary dark:bg-amber-500/15 dark:text-amber-400 font-bold border-l-4 border-primary dark:border-amber-400 shadow-xs'
                    : 'text-sidebar-foreground/75 font-medium hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`size-[18px] shrink-0 ${isPathActive ? 'text-primary dark:text-amber-400' : ''}`} />
                  {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
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

          <div className="my-2 h-px bg-sidebar-border" />

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
          <div
            onClick={() => setShowStreakModal(true)}
            className="mt-auto rounded-2xl border border-stone-200 bg-stone-50/90 dark:border-amber-500/25 dark:bg-stone-900/95 p-3.5 text-stone-800 dark:text-stone-100 shadow-2xs dark:shadow-md animate-fade-in transition-all cursor-pointer hover:border-amber-500/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500 fill-amber-500/20" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-100">Chuỗi học tập 🔥</span>
              </div>
              <span className="rounded-full border border-stone-200 dark:border-amber-500/30 bg-stone-100 dark:bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-700 dark:text-amber-300">
                {formatXP(liveStats.xp)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              Hoàn thành 1 nhiệm vụ hôm nay để duy trì tiến trình. Bấm để xem chi tiết.
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
              Xem lịch sử streak <ChevronRight className="size-3" />
            </div>
          </div>
        ) : (
          <div className="mt-auto flex justify-center pt-2">
            <button
              onClick={() => setShowStreakModal(true)}
              className="grid size-10 place-items-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-700 dark:border-amber-500/30 dark:bg-stone-900 dark:text-amber-400 shadow-2xs hover:border-amber-500 hover:text-amber-400 transition-all cursor-pointer"
              title={`XP: ${formatXP(liveStats.xp)} · Bấm để xem Streak học tập`}
            >
              <Sparkles className="size-4" />
            </button>
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
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
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
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors shadow-xs"
              >
                <PanelLeft className="size-4 text-amber-500" />
                <span className="hidden sm:inline">Chuyển sang Admin</span>
                <span className="sm:hidden">Admin</span>
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
        <main className="flex-1 p-4 sm:p-6">
          {shouldBlockLearner ? (
            <UnderMaintenancePage pageConfig={currentPageStatus} />
          ) : (
            children
          )}
        </main>
      </div>

      {/* Gamification Modals */}
      <StreakDetailModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakCount={liveStats.streak || 1}
      />

      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        previousLevel={1}
        newLevel={2}
        newTitle="Nhà Điều Tra Cấp Cao"
        xpEarned={100}
      />
    </div>
  );
}

