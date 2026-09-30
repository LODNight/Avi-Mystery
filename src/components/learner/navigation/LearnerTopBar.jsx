import React, { useState } from 'react';
import { Menu, Sun, Moon, PanelLeft } from 'lucide-react';
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
  setThemeSidebarOpen,
  onOpenSettings,
  isSettingsOpen = false,
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(['nav', 'common']);
  const navigate = useNavigate();

  const handleOpenSettings = (section) => {
    if (onOpenSettings) {
      onOpenSettings(section);
    } else if (setThemeSidebarOpen) {
      setThemeSidebarOpen(true);
    } else {
      navigate('/settings');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
    <>
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            className="rounded-xl border border-border p-2.5 lg:hidden text-foreground hover:bg-muted cursor-pointer"
            aria-label={t('common:openMenu', 'Mở menu')}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title={collapsed ? t('nav:expandSidebar', 'Mở rộng sidebar') : t('nav:collapseSidebar', 'Thu gọn sidebar')}
            aria-label="Toggle sidebar collapse"
          >
            <PanelLeft className="size-5" />
          </button>

          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {t('nav:investigator', 'Nhà Điều Tra')}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Avatar Initials */}
          <button
            type="button"
            onClick={() => handleOpenSettings('profile')}
            className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
            title={user?.name ? `${user.name} (${t('common:userSettings', 'Cài đặt người dùng')})` : t('common:userSettings', 'Cài đặt người dùng')}
            aria-label={t('common:userSettings', 'Cài đặt người dùng')}
          >
            {initials}
          </button>
        </div>
      </header>

    </>
  );
}
