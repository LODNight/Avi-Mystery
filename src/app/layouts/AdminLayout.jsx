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
  Target,
  BookOpen,
  Book
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../providers/ThemeProvider.jsx';
import { useBrand, BrandLogoIcon } from '../providers/BrandProvider.jsx';
import { FEATURE_FLAGS } from '../../config/envConfig.js';

const adminNavGroups = [
  {
    code: 'OVR-01',
    category: 'Tổng quan',
    items: [
      { label: 'Tổng quan Admin', to: '/admin', icon: LayoutDashboard },
      { label: 'Hướng dẫn sử dụng', to: '/admin/guide', icon: BookOpen },
    ],
  },
  {
    code: 'OVR-02',
    category: 'Quản trị nội dung',
    items: [
      {
        id: 'content',
        label: 'Nội dung đào tạo',
        icon: Layers,
        children: [
          { label: 'Khóa học & Lộ trình', to: '/admin/courses', icon: FileSpreadsheet },
          { label: 'Chương học', to: '/admin/chapters', icon: Layers },
          { label: 'Vụ án điều tra', to: '/admin/missions', icon: Target },
          { label: 'Dữ liệu Dataset', to: '/admin/datasets', icon: Database },
          { label: 'Knowledge Studio', to: '/admin/knowledge', icon: Book },
        ],
      },
      { label: 'Học viên', to: '/admin/learners', icon: Users },
      { label: 'Báo cáo phân tích', to: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    code: 'OVR-03',
    category: 'Hệ thống',
    items: [
      {
        id: 'settings',
        label: 'Cài đặt hệ thống',
        to: '/admin/settings',
        icon: Settings,
        children: [
          { label: 'Quản lý trang & Bảo trì', to: '/admin/settings?tab=pages', icon: Globe },
          { label: 'Cấu hình hệ thống', to: '/admin/settings?tab=system', icon: Settings },
          { label: 'Bảo mật & Phân quyền', to: '/admin/settings?tab=security', icon: ShieldCheck },
        ],
      },
    ],
  },
];

const flatAdminItems = [];
adminNavGroups.forEach((group) => {
  group.items.forEach((item) => {
    flatAdminItems.push(item);
    if (item.children) {
      flatAdminItems.push(...item.children);
    }
  });
});

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

  const isContentActive = [
    '/admin/courses',
    '/admin/chapters',
    '/admin/missions',
    '/admin/datasets',
    '/admin/knowledge',
  ].some((path) => location.pathname.startsWith(path));

  const isSettingsActive =
    location.pathname.startsWith('/admin/settings') ||
    location.pathname.startsWith('/admin/pages');

  const [openGroups, setOpenGroups] = useState({
    content: true,
    settings: isSettingsActive,
  });

  useEffect(() => {
    if (isContentActive) {
      setOpenGroups((prev) => ({ ...prev, content: true }));
    }
    if (isSettingsActive) {
      setOpenGroups((prev) => ({ ...prev, settings: true }));
    }
  }, [location.pathname, isContentActive, isSettingsActive]);

  const toggleGroup = (groupId) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((prev) => ({ ...prev, [groupId]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

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

  const activeNavItem = flatAdminItems.find((item) => {
    if (!item.to) return false;
    if (item.to === '/admin') return location.pathname === '/admin';
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  });
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

      {/* ── Sidebar: Bureau HQ Overseer Cabinet ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-md py-4 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          collapsed ? 'w-20 px-3' : 'w-72 px-4'
        } ${mobileOpen ? 'translate-x-0 w-72 px-4' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className={`flex items-center border-b border-sidebar-border pb-3.5 ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between px-1'}`}>
          <Link
            to="/admin"
            className="flex items-center gap-3 min-w-0"
            onClick={() => setMobileOpen(false)}
            title={`${brand.brandName} Admin`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-primary/50 bg-primary/15 text-primary shadow-xs">
              <BrandLogoIcon className="size-4.5" />
            </span>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0 animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-base font-bold tracking-tight text-sidebar-foreground truncate">
                    {brand.brandName}
                  </span>
                  <span className="rounded-xs border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-primary shrink-0">
                    HQ OVERSEER
                  </span>
                  {FEATURE_FLAGS.showDevBadge && (
                    <span className="rounded-xs bg-amber-500/15 px-1 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                      DEV
                    </span>
                  )}
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  ARCHIVE & CASE COMMAND
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Collapse (Chỉ hiện khi mở rộng) */}
          {(!collapsed || mobileOpen) && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex items-center justify-center size-7 rounded-sm border border-transparent text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors shrink-0 cursor-pointer"
              title="Thu gọn sidebar"
              aria-label="Thu gọn sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            className="rounded-sm p-1.5 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Chief Overseer Credential Badge */}
        <div className="mt-4 dossier-card rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2.5 transition-all">
          <div className={`flex items-center ${collapsed && !mobileOpen ? 'justify-center' : 'gap-3'}`}>
            <span
              className="grid size-9 shrink-0 place-items-center rounded-sm border border-amber-500/40 bg-amber-500/15 font-mono text-xs font-bold text-amber-500"
              title={user?.name || 'Quản trị viên'}
            >
              {initials}
            </span>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                    ID // HQ-OVERSEER
                  </span>
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="truncate text-xs font-bold text-sidebar-foreground mt-0.5">
                  {user?.name || 'Quản trị viên'}
                </p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  CLEARANCE: LEVEL 5
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="mt-5 flex flex-col gap-4 overflow-y-auto flex-1 pr-0.5" aria-label="Menu Admin">
          {adminNavGroups.map((group) => (
            <div key={group.category} className="flex flex-col gap-1">
              {(!collapsed || mobileOpen) && (
                <div className="flex items-center justify-between px-2.5 pb-1 animate-fade-in">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {group.category}
                  </p>
                  <span className="font-mono text-[9px] text-muted-foreground/60">[{group.code}]</span>
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.children?.length);
                const groupId = item.id || (item.to ? item.to.replace('/admin/', '') : 'group');
                const isOpen = Boolean(openGroups[groupId]);

                const isGroupActive = hasChildren && item.children.some((child) => {
                  if (child.to.includes('?')) {
                    const [base, query] = child.to.split('?');
                    return location.pathname === base && location.search.includes(query);
                  }
                  return location.pathname === child.to || location.pathname.startsWith(`${child.to}/`);
                });

                if (hasChildren) {
                  return (
                    <div key={item.id || item.label} className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupId)}
                        title={collapsed && !mobileOpen ? item.label : undefined}
                        className={`w-full flex items-center justify-between gap-3 rounded-sm transition-all cursor-pointer ${
                          collapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-3 py-2 text-xs font-bold'
                        } ${
                          isGroupActive
                            ? 'bg-primary/10 text-primary border-l-[3px] border-primary'
                            : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground border-l-[3px] border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`size-4 shrink-0 ${isGroupActive ? 'text-primary' : ''}`} />
                          {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                        </div>
                        {(!collapsed || mobileOpen) && (
                          <ChevronDown
                            className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>

                      {/* Dropdown Sub-menu Items */}
                      {isOpen && (!collapsed || mobileOpen) && (
                        <div className="ml-3.5 pl-2.5 border-l border-dashed border-sidebar-border flex flex-col gap-0.5 my-0.5 animate-fade-in">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = child.to.includes('?')
                              ? location.pathname === child.to.split('?')[0] && location.search.includes(child.to.split('?')[1])
                              : location.pathname === child.to || location.pathname.startsWith(`${child.to}/`);

                            return (
                              <NavLink
                                key={child.to}
                                to={child.to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs transition-all ${
                                  isChildActive
                                    ? 'bg-primary/15 text-primary font-bold border-l-2 border-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground font-medium'
                                }`}
                              >
                                <ChildIcon className="size-3.5 shrink-0" />
                                <span className="truncate">{child.label}</span>
                              </NavLink>
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
                    end={item.to === '/admin'}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-sm transition-all ${
                        collapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-3 py-2 text-xs font-bold'
                      } ${
                        isActive
                          ? 'bg-primary/15 text-primary border-l-[3px] border-primary shadow-2xs'
                          : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground border-l-[3px] border-transparent'
                      }`
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}

          <div className="my-1.5 h-px bg-sidebar-border" />
          <button
            onClick={handleLogout}
            title={collapsed && !mobileOpen ? 'Đăng xuất' : undefined}
            className={`flex items-center gap-2.5 rounded-sm text-destructive hover:bg-destructive/10 transition-all cursor-pointer ${
              collapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-3 py-2.5 text-left text-xs font-bold'
            }`}
          >
            <LogOut className="size-4 shrink-0" />
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
        {/* Sticky Header (64px per anti-bloat guardrail) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="rounded-sm border border-border p-2 lg:hidden text-foreground hover:bg-muted"
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4.5" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden lg:flex items-center justify-center rounded-sm border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              <PanelLeft className="size-4" />
            </button>

            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    HQ ARCHIVE COMMAND
                  </p>
                  <span className="hidden sm:inline-block font-mono text-[9px] text-muted-foreground">
                    // SECURE TERMINAL
                  </span>
                </div>
                <h1 className="font-display text-lg font-bold tracking-tight text-foreground leading-tight">
                  {pageTitle}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Telemetry Status Pill */}
            <div className="hidden xl:flex items-center gap-2 rounded-sm border border-border bg-card/70 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>OVERSEER LINK // ACTIVE</span>
            </div>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-sm border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
            </button>

            {/* Back to Learner View */}
            <Link
              to="/dashboard"
              className="hidden items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-foreground hover:border-primary/40 hover:bg-muted lg:flex transition-colors"
            >
              <PanelLeft className="size-3.5 text-primary" />
              Xem giao diện Learner
            </Link>

            {/* User Avatar Initials */}
            <div
              className="grid size-8 place-items-center rounded-sm border border-amber-500/40 bg-amber-500/15 text-amber-500 font-mono text-xs font-bold"
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
