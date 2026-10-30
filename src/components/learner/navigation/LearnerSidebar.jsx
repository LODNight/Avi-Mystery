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
  Dumbbell,
  PanelLeft,
  Settings,
  Briefcase,
  Shield,
  FileCheck2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    labelKey: 'sectionCase',
    serial: 'SEC-01',
    children: [
      { id: 'dashboard', label: 'Nhiệm vụ hiện tại', labelKey: 'currentMission', to: '/dashboard', icon: Home, code: '01' },
      { id: 'investigation', label: 'Điều tra vụ án', labelKey: 'investigationWorkspace', to: '/cases/case-001/investigate', icon: Briefcase, code: '02' },
      { id: 'map', label: 'Hồ sơ vụ án', labelKey: 'caseFiles', to: '/map', icon: Map, code: '03' },
    ]
  },
  {
    id: 'academy',
    label: 'Đào tạo',
    labelKey: 'sectionAcademy',
    serial: 'SEC-02',
    children: [
      { id: 'academy', label: 'Học viện Academy', labelKey: 'academy', to: '/academy', icon: GraduationCap, code: '04' },
      { id: 'practice', label: 'Phòng luyện tập', labelKey: 'practiceLab', to: '/practice', icon: Dumbbell, code: '05' },
    ],
  },
  {
    id: 'profile',
    label: 'Cá nhân',
    labelKey: 'sectionProfile',
    serial: 'SEC-03',
    children: [
      { id: 'achievements', label: 'Thành tựu', labelKey: 'achievements', to: '/achievements', icon: Trophy, code: '06' },
      { id: 'profile', label: 'Hồ sơ', labelKey: 'profile', to: '/profile', icon: User, code: '07' },
      { id: 'settings', label: 'Cài đặt', labelKey: 'settings', to: '/settings', icon: Settings, code: '08' },
    ],
  },
];

export const learnerNav = learnerNavItems.flatMap((item) => item.children || [item]);

export function isLearnerNavPathActive(pathname, navPath) {
  if (pathname === navPath) return true;
  if (navPath === '/dashboard') return false; // Strict match for dashboard
  if (navPath === '/cases/case-001/investigate' && /^\/cases(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/map' && /^\/missions(?:\/|$)/.test(pathname)) return true; // Missions belong to Case Files (map)
  if (navPath === '/academy' && /^\/academy(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/practice' && /^\/practice(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/achievements' && /^\/achievements(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/profile' && /^\/profile(?:\/|$)/.test(pathname)) return true;
  if (navPath === '/settings' && /^\/settings(?:\/|$)/.test(pathname)) return true;
  return pathname.startsWith(`${navPath}/`);
}

export function LearnerSidebar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  liveStats,
  setShowStreakModal,
}) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const { getPageStatus } = usePageStatus();
  const { t } = useTranslation(['nav', 'common']);

  
  const [openGroups, setOpenGroups] = useState({
    case: true,
    academy: true,
    profile: false
  });

  useEffect(() => {
    const isProfileActive = ['/profile', '/achievements', '/settings'].some(path => location.pathname.startsWith(path));
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
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar py-4 transition-all duration-300 ease-in-out lg:translate-x-0 ${
        collapsed ? 'w-20 px-3' : 'w-72 px-4'
      } ${mobileOpen ? 'translate-x-0 w-72 px-4' : '-translate-x-full'}`}
    >
      {/* Bureau Masthead Header */}
      <div className={`flex items-center border-b border-sidebar-border pb-3.5 ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between px-1'}`}>
        <Link
          to="/dashboard"
          className="flex items-center gap-3 min-w-0"
          onClick={() => setMobileOpen(false)}
          title={brand.brandName}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary text-primary-foreground shadow-xs">
            <BrandLogoIcon className="size-4" />
          </span>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0 animate-fade-in">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-base font-bold tracking-tight text-sidebar-foreground truncate">
                  {brand.brandName}
                </span>
                {FEATURE_FLAGS.showDevBadge && (
                  <span className="rounded-sm bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    DEV
                  </span>
                )}
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                BUREAU ARCHIVE // V2.4
              </p>
            </div>
          )}
        </Link>

        {(!collapsed || mobileOpen) && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex items-center justify-center size-7 rounded-md border border-transparent hover:border-sidebar-border text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors shrink-0 cursor-pointer"
            title={t('nav:collapseSidebar', 'Thu gọn sidebar')}
            aria-label={t('nav:collapseSidebar', 'Thu gọn sidebar')}
          >
            <ChevronLeft className="size-4" />
          </button>
        )}

        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-sidebar-accent lg:hidden cursor-pointer"
          onClick={() => setMobileOpen(false)}
          aria-label={t('common:closeMenu', 'Close menu')}
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Investigator Credentials Dossier Card */}
      <div className="mt-4 rounded-md border border-sidebar-border bg-card/70 p-2.5 shadow-2xs transition-all relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary/70" aria-hidden="true" />
        <div className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'gap-2.5 pl-1.5'}`}>
          <span
            className="grid size-9 shrink-0 place-items-center rounded-sm border border-primary/40 bg-primary/15 font-mono text-xs font-bold text-primary"
            title={user?.name || 'Học viên'}
          >
            {initials}
          </span>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0 flex-1 animate-fade-in">
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                  ID // AGT-0{liveStats.level}
                </span>
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 shrink-0">
                  <Flame className="size-3.5 fill-current" />
                  <span className="font-mono text-[11px] font-bold">{liveStats.streak} {t('nav:streak', 'ngày')}</span>
                </div>
              </div>
              <p className="truncate text-sm font-bold text-sidebar-foreground mt-0.5">
                {user?.name || 'Học viên'}
              </p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">
                {t('nav:level', 'Cấp')} {liveStats.level} · {t('nav:investigator', 'Nhà Điều Tra')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bureau File Cabinet Drawers */}
      <nav className="mt-5 flex flex-col gap-3.5 overflow-y-auto flex-1" aria-label="Menu chính">
        {learnerNavItems.map((group) => {
          const groupId = group.id;
          const isOpen = openGroups[groupId];
          const groupLabel = group.labelKey ? t(`nav:${group.labelKey}`, group.label) : group.label;
          return (
            <div key={groupId} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggleGroup(groupId)}
                title={collapsed && !mobileOpen ? groupLabel : undefined}
                className={`w-full flex items-center justify-between gap-2 rounded-sm transition-all ${
                  collapsed && !mobileOpen ? 'justify-center py-2' : 'px-2.5 py-1 text-xs'
                } hover:text-sidebar-foreground text-muted-foreground cursor-pointer border-b border-sidebar-border/60`}
              >
                {(!collapsed || mobileOpen) && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-semibold text-primary/80">
                      [{group.serial}]
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] animate-fade-in">
                      {groupLabel}
                    </span>
                  </div>
                )}
                {(!collapsed || mobileOpen) && (
                  <ChevronDown
                    className={`size-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
                {(collapsed && !mobileOpen) && (
                  <span className="font-mono text-[10px] font-bold uppercase">{groupLabel[0]}</span>
                )}
              </button>

              {isOpen && group.children.map(({ label, labelKey, to, icon: Icon, code }) => {
                const navStatus = getPageStatus(to);
                const isItemMaintenance = navStatus?.status === 'maintenance';
                const isItemNotice = navStatus?.status === 'notice';
                const isPathActive = isLearnerNavPathActive(location.pathname, to);
                const itemLabel = labelKey ? t(`nav:${labelKey}`, label) : label;

                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed && !mobileOpen ? `${itemLabel}${isItemMaintenance ? ' (Đang bảo trì)' : ''}` : undefined}
                    className={`relative flex items-center justify-between gap-2 rounded-md transition-all ${
                      collapsed && !mobileOpen ? 'justify-center p-2.5 mt-0.5' : 'px-3 py-2 text-sm'
                    } ${
                      isPathActive
                        ? 'bg-primary/15 text-primary font-bold border-l-[3px] border-primary shadow-2xs'
                        : 'text-sidebar-foreground/80 font-medium hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`size-4 shrink-0 ${isPathActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      {(!collapsed || mobileOpen) && <span className="truncate">{itemLabel}</span>}
                    </div>

                    {(!collapsed || mobileOpen) && !isItemMaintenance && !isItemNotice && code && (
                      <span className={`font-mono text-[10px] shrink-0 ${isPathActive ? 'text-primary font-bold' : 'text-muted-foreground/60'}`}>
                        #{code}
                      </span>
                    )}

                    {(!collapsed || mobileOpen) && isItemMaintenance && (
                      <span className="rounded-sm bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
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
          );
        })}
      </nav>

      {/* Admin Switcher */}
      {isAdminUser && (
        <div className="mt-3 mb-1 flex flex-col gap-1 px-1 border-t border-sidebar-border pt-3">
          {(!collapsed || mobileOpen) && (
            <p className="pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              HQ Overseer
            </p>
          )}
          <Link
            to="/admin"
            className={`flex items-center gap-2.5 rounded-md border border-sidebar-border hover:border-primary/40 bg-card/60 text-sidebar-foreground hover:bg-sidebar-accent transition-all ${
              collapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-3 py-2 text-xs font-bold'
            }`}
            title="Admin Console"
          >
            <PanelLeft className="size-4 text-primary shrink-0" />
            {(!collapsed || mobileOpen) && <span className="truncate">Admin Console</span>}
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="mt-1 flex flex-col gap-1 border-t border-sidebar-border pt-2">
        <button
          onClick={handleLogout}
          title={collapsed && !mobileOpen ? t('nav:logout', 'Đăng xuất') : undefined}
          className={`flex items-center gap-2.5 rounded-md text-destructive hover:bg-sidebar-accent transition-all cursor-pointer ${
            collapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-3 py-2.5 text-left text-sm font-medium'
          }`}
        >
          <LogOut className="size-4 shrink-0" />
          {(!collapsed || mobileOpen) && <span>{t('nav:logout', 'Đăng xuất')}</span>}
        </button>
      </div>

      {/* Field Service Record / Streak Log Footer */}
      {(!collapsed || mobileOpen) ? (
        <div
          onClick={() => setShowStreakModal(true)}
          className="mt-2 rounded-md border border-sidebar-border bg-card/90 p-2.5 text-sidebar-foreground shadow-2xs animate-fade-in transition-all cursor-pointer hover:border-primary/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-3.5 text-primary" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground">
                {t('nav:streak', 'Chuỗi')} công tác
              </span>
            </div>
            <span className="rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
              {formatXP(liveStats.xp)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex justify-center pb-1">
          <button
            onClick={() => setShowStreakModal(true)}
            className="grid size-9 place-items-center rounded-md border border-sidebar-border bg-card text-primary shadow-2xs hover:border-primary/50 transition-all cursor-pointer"
            title={`XP: ${formatXP(liveStats.xp)}`}
          >
            <Shield className="size-4 text-primary" />
          </button>
        </div>
      )}

    </aside>
  );
}
