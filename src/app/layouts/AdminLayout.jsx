import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Database,
  Layers,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../providers/ThemeProvider.jsx';
import { useBrand, BrandLogoIcon } from '../providers/BrandProvider.jsx';
import { FEATURE_FLAGS } from '../../config/envConfig.js';

const adminNav = [
  { label: 'Tổng quan Admin', to: '/admin', icon: LayoutDashboard },
  { label: 'Quản lý khóa học', to: '/admin/courses', icon: FileSpreadsheet },
  { label: 'Quản lý chương', to: '/admin/chapters', icon: Layers },
  { label: 'Quản lý Dataset', to: '/admin/datasets', icon: Database },
  { label: 'Học viên', to: '/admin/learners', icon: Users },
  { label: 'Phân tích', to: '/admin/analytics', icon: BarChart3 },
  {
    label: 'Cài đặt',
    to: '/admin/settings',
    icon: Settings,
    children: [
      { label: 'Quản lý trang & Bảo trì', to: '/admin/settings?tab=pages', icon: Globe },
      { label: 'Cấu hình hệ thống', to: '/admin/settings?tab=system', icon: Settings },
      { label: 'Bảo mật & Phân quyền', to: '/admin/settings?tab=security', icon: ShieldCheck },
    ],
  },
];

export function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('avi_admin_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const location = useLocation();

  const isSettingsActive = location.pathname.startsWith('/admin/settings') || location.pathname.startsWith('/admin/pages');
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('avi_admin_sidebar_collapsed', collapsed ? 'true' : 'false');
  }, [collapsed]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const activeNavItem = adminNav.find((item) => item.to === location.pathname);
  const pageTitle = activeNavItem ? activeNavItem.label : 'Quản trị hệ thống';

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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar py-5 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          collapsed ? 'w-20 px-3.5' : 'w-72 px-4'
        } ${mobileOpen ? 'translate-x-0 w-72 px-4' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between px-1'}`}>
          <Link
            to="/admin"
            className="flex items-center gap-3 min-w-0"
            onClick={() => setMobileOpen(false)}
            title={`${brand.brandName} Admin`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BrandLogoIcon className="size-5" />
            </span>
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-lg font-bold tracking-tight text-sidebar-foreground truncate animate-fade-in">
                  {brand.brandName} <span className="text-xs text-primary font-semibold">Admin</span>
                </span>
                {FEATURE_FLAGS.showDevBadge && (
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    DEV
                  </span>
                )}
              </div>
            )}
          </Link>

          {/* Desktop Toggle Collapse (Chỉ hiện khi mở rộng) */}
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
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 font-mono text-sm font-bold text-amber-500"
              title={user?.name || 'Quản trị viên'}
            >
              {initials}
            </span>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {user?.name || 'Quản trị viên'}
                </p>
                <p className="truncate text-xs text-muted-foreground">Admin Workspace</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="mt-6 flex flex-col gap-1 overflow-y-auto flex-1" aria-label="Menu Admin">
          {(!collapsed || mobileOpen) && (
            <p className="px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground animate-fade-in">
              Quản lý
            </p>
          )}
          {adminNav.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);
            const isItemActive = hasChildren
              ? isSettingsActive
              : location.pathname === item.to;

            if (hasChildren) {
              return (
                <div key={item.to} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <NavLink
                      to={item.to}
                      onClick={() => {
                        setSettingsOpen((prev) => !prev);
                      }}
                      title={collapsed && !mobileOpen ? item.label : undefined}
                      className={`flex-1 flex items-center justify-between gap-3 rounded-xl transition-all ${
                        collapsed && !mobileOpen ? 'justify-center p-3' : 'px-3 py-3 text-sm font-medium'
                      } ${
                        isItemActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="size-[18px] shrink-0" />
                        {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                      </div>
                      {(!collapsed || mobileOpen) && (
                        <ChevronDown
                          className={`size-4 transition-transform duration-200 ${
                            settingsOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </NavLink>
                  </div>

                  {/* Dropdown Sub-menu Items */}
                  {settingsOpen && (!collapsed || mobileOpen) && (
                    <div className="ml-4 pl-3 border-l border-sidebar-border flex flex-col gap-1 my-1 animate-fade-in">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive =
                          location.search.includes(child.to.split('?')[1]) ||
                          (location.pathname === '/admin/pages' && child.to.includes('tab=pages'));

                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                              isChildActive
                                ? 'bg-primary/15 text-primary font-bold'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            }`}
                          >
                            <ChildIcon className="size-3.5 shrink-0" />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl transition-all ${
                    collapsed && !mobileOpen ? 'justify-center p-3' : 'px-3 py-3 text-sm font-medium'
                  } ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`
                }
              >
                <Icon className="size-[18px] shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}

          <div className="my-3 h-px bg-sidebar-border" />

          {(!collapsed || mobileOpen) && (
            <p className="px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground animate-fade-in">
              Hệ thống
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
      </aside>


      {/* ── Main Content Area ── */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="rounded-xl border border-border p-2.5 lg:hidden text-foreground hover:bg-muted"
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
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
                Quản trị nội dung
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

            {/* Back to Learner View */}
            <Link
              to="/dashboard"
              className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted lg:flex"
            >
              <PanelLeft className="size-4 text-primary" />
              Xem giao diện Learner
            </Link>

            {/* User Avatar Initials */}
            <div
              className="grid size-9 place-items-center rounded-xl bg-amber-500 text-slate-950 font-mono text-xs font-bold"
              title={user?.name}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
