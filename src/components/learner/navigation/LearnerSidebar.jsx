import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Flame,
  Home,
  Map,
  Trophy,
  User,
  LogOut,
  X,
  ChevronLeft,
  ChevronDown,
  GraduationCap,
  Sparkles,
  Dumbbell,
  PanelLeft
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth.js';
import { usePageStatus } from '../../../hooks/usePageStatus.js';
import { useBrand, BrandLogoIcon } from '../../../app/providers/BrandProvider.jsx';
import { FEATURE_FLAGS } from '../../../config/envConfig.js';
import { formatXP } from '../../../utils/format.js';
import { isAdmin } from '../../../constants/roles.js';

export const learnerNavItems = [
  {
    id: 'case',
    label: 'Vụ án',
    children: [
      { label: 'Nhiệm vụ hiện tại', to: '/dashboard', icon: Home },
      { label: 'Hồ sơ vụ án', to: '/map', icon: Map },
    ]
  },
  {
    id: 'academy',
    label: 'Đào tạo',
    children: [
      { label: 'Học viện Academy', to: '/academy', icon: GraduationCap },
      { label: 'Phòng luyện tập', to: '/practice', icon: Dumbbell },
    ],
  },
  {
    id: 'profile',
    label: 'Cá nhân',
    children: [
      { label: 'Thành tựu', to: '/achievements', icon: Trophy },
      { label: 'Hồ sơ', to: '/profile', icon: User },
    ],
  },
];

export const learnerNav = learnerNavItems.flatMap((item) => item.children || [item]);

export function isLearnerNavPathActive(pathname, navPath) {
  if (pathname === navPath) return true;
  if (navPath === '/dashboard') return false; // Strict match for dashboard
  if (navPath === '/map' && /^\/missions(?:\/|$)/.test(pathname)) return true; // Missions belong to Case Files (map)
  if (navPath === '/academy' && /^\/academy(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/practice' && /^\/practice(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/achievements' && /^\/achievements(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/profile' && /^\/profile(?:\/|$)/.test(pathname)) return true;
  return pathname.startsWith(`${navPath}/`);
}

export function LearnerSidebar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  liveStats,
  setShowStreakModal
}) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const { getPageStatus } = usePageStatus();
  
  const [openGroups, setOpenGroups] = useState({
    case: true,
    academy: true,
    profile: false
  });

  useEffect(() => {
    const isProfileActive = ['/profile', '/achievements'].some(path => location.pathname.startsWith(path));
    if (isProfileActive) {
      setOpenGroups(prev => ({ ...prev, profile: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (groupId) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((prev) => ({ ...prev, [groupId]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const isAdminUser = isAdmin(user?.role);

  return (
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
      <nav className="mt-6 flex flex-col gap-4 overflow-y-auto flex-1" aria-label="Menu chính">
        {learnerNavItems.map((group) => {
          const groupId = group.id;
          const isOpen = openGroups[groupId];
          return (
            <div key={groupId} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggleGroup(groupId)}
                title={collapsed && !mobileOpen ? group.label : undefined}
                className={`w-full flex items-center justify-between gap-3 rounded-xl transition-all ${
                  collapsed && !mobileOpen ? 'justify-center p-3' : 'px-3.5 py-1 text-sm font-medium'
                } hover:text-sidebar-foreground text-muted-foreground`}
              >
                {(!collapsed || mobileOpen) && (
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] animate-fade-in">
                    {group.label}
                  </span>
                )}
                {(!collapsed || mobileOpen) && (
                  <ChevronDown
                    className={`size-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
                {(collapsed && !mobileOpen) && (
                  <span className="font-mono text-[10px] font-bold uppercase">{group.label[0]}</span>
                )}
              </button>

              {isOpen && group.children.map(({ label, to, icon: Icon }) => {
                const navStatus = getPageStatus(to);
                const isItemMaintenance = navStatus?.status === 'maintenance';
                const isItemNotice = navStatus?.status === 'notice';
                const isPathActive = isLearnerNavPathActive(location.pathname, to);

                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed && !mobileOpen ? `${label}${isItemMaintenance ? ' (Đang bảo trì)' : ''}` : undefined}
                    className={`relative flex items-center justify-between gap-2 rounded-xl transition-all ${
                      collapsed && !mobileOpen ? 'justify-center p-3 mt-1' : 'px-3.5 py-2.5 text-sm'
                    } ${
                      isPathActive
                        ? 'bg-primary/15 text-primary dark:bg-amber-500/15 dark:text-amber-400 font-bold border-l-4 border-primary dark:border-amber-400 shadow-xs'
                        : 'text-sidebar-foreground/75 font-medium hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
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
            </div>
          )
        })}
      </nav>

      {/* Admin Switcher */}
      {isAdminUser && (
        <div className="mt-4 mb-2 flex flex-col gap-1 px-3 border-t border-sidebar-border pt-4">
          {(!collapsed || mobileOpen) && (
            <p className="pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Developer
            </p>
          )}
          <Link
            to="/admin"
            className={`flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all shadow-xs ${
              collapsed && !mobileOpen ? 'justify-center p-3' : 'px-3 py-2 text-xs font-bold'
            }`}
            title="Admin Console"
          >
            <PanelLeft className="size-[16px] text-amber-500 shrink-0" />
            {(!collapsed || mobileOpen) && <span className="truncate">Admin Console</span>}
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="mt-1 flex flex-col gap-1 border-t border-sidebar-border pt-2">
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
      </div>

      {/* Streak Promo Card */}
      {(!collapsed || mobileOpen) ? (
        <div
          onClick={() => setShowStreakModal(true)}
          className="mt-2 rounded-2xl border border-stone-200 bg-stone-50/90 dark:border-amber-500/25 dark:bg-stone-900/95 p-3.5 text-stone-800 dark:text-stone-100 shadow-2xs dark:shadow-md animate-fade-in transition-all cursor-pointer hover:border-amber-500/50 mx-2 mb-2"
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
        </div>
      ) : (
        <div className="mt-2 flex justify-center pb-2">
          <button
            onClick={() => setShowStreakModal(true)}
            className="grid size-10 place-items-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-700 dark:border-amber-500/30 dark:bg-stone-900 dark:text-amber-400 shadow-2xs hover:border-amber-500 hover:text-amber-400 transition-all cursor-pointer"
            title={`XP: ${formatXP(liveStats.xp)}`}
          >
            <Sparkles className="size-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
