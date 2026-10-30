import React from 'react';
import { Menu, Sun, Moon, PanelLeft, Radio } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth.js';
import { useTheme } from '../../../app/providers/ThemeProvider.jsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function LearnerTopBar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  pageTitle,
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(['nav', 'common']);
  const navigate = useNavigate();

  const handleOpenSettings = (section = 'profile') => {
    navigate(`/settings?tab=${section}`);
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          className="rounded-md border border-border p-2 lg:hidden text-foreground hover:bg-muted cursor-pointer"
          aria-label={t('common:openMenu', 'Mở menu')}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-4" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title={collapsed ? t('nav:expandSidebar', 'Mở rộng sidebar') : t('nav:collapseSidebar', 'Thu gọn sidebar')}
          aria-label="Toggle sidebar collapse"
        >
          <PanelLeft className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block h-7 w-px bg-border" aria-hidden="true" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                {t('nav:investigator', 'Nhà Điều Tra')}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                // <Radio className="size-2.5 text-emerald-500 animate-pulse" /> HQ-LINK ACTIVE
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-tight">{pageTitle}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md border border-border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title={theme === 'dark' ? t('common:switchToLight', 'Chuyển sang chế độ Sáng') : t('common:switchToDark', 'Chuyển sang chế độ Tối')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
        </button>

        {/* User Avatar Initials */}
        <button
          type="button"
          onClick={() => handleOpenSettings('profile')}
          className="grid size-9 place-items-center rounded-md border border-primary/40 bg-primary text-primary-foreground font-mono text-xs font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
          title={user?.name ? `${user.name} (${t('common:userSettings', 'Cài đặt người dùng')})` : t('common:userSettings', 'Cài đặt người dùng')}
          aria-label={t('common:userSettings', 'Cài đặt người dùng')}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
