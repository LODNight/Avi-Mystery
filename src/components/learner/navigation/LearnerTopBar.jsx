import React from 'react';
import { Menu, Sun, Moon, PanelLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth.js';
import { useTheme } from '../../../app/providers/ThemeProvider.jsx';

export function LearnerTopBar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  pageTitle
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
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

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center rounded-xl border border-border p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          <PanelLeft className="size-5" />
        </button>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Nhà Điều Tra
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

        {/* User Avatar Initials */}
        <div
          className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold"
          title={user?.name}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
