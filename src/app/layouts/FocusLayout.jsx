import React, { useState, createContext, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X, Sun, Moon, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../providers/ThemeProvider.jsx';
import { useBrand, BrandLogoIcon } from '../providers/BrandProvider.jsx';
import { formatXP } from '../../utils/format.js';

export const FocusModeContext = createContext({
  isFocusMode: false,
  setIsFocusMode: () => {},
  toggleFocusMode: () => {},
});

export function useFocusMode() {
  return useContext(FocusModeContext);
}

export function FocusLayout({ children }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { brand } = useBrand();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleFocusMode = () => setIsFocusMode((prev) => !prev);

  const handleExit = () => {
    navigate('/map');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
    <FocusModeContext.Provider value={{ isFocusMode, setIsFocusMode, toggleFocusMode }}>
      <div className="h-screen max-h-screen bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-200">
        {/* ── Focus Mode Top Bar ── */}
        <header className="sticky top-0 z-40 flex h-13 sm:h-14 items-center justify-between border-b border-border bg-card/95 px-3 sm:px-5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border bg-background px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-xs cursor-pointer"
              title="Rời bàn làm việc (Quay lại)"
              aria-label="Rời bàn làm việc"
            >
              <ArrowLeft className="size-4" />
              <span>Rời bàn làm việc</span>
            </button>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <Link to="/dashboard" className="flex items-center gap-2 text-foreground font-semibold text-sm hover:opacity-85 transition-opacity">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <BrandLogoIcon className="size-4" />
              </span>
              <span className="font-mono text-xs font-bold tracking-tight hidden md:inline">
                {brand.brandName}
              </span>
            </Link>

            {/* Interactive Focus Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold border transition-all cursor-pointer select-none flex items-center gap-1 ${
                isFocusMode
                  ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              }`}
              title={
                isFocusMode
                  ? 'Đang bật Focus Mode (Thu gọn đề bài để tập trung). Bấm để mở lại đề bài.'
                  : 'Bật Focus Mode để mở rộng tối đa không gian bảng tính'
              }
              aria-pressed={isFocusMode}
            >
              {isFocusMode ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
              <span>{isFocusMode ? 'FOCUS ON' : 'FOCUS MODE'}</span>
            </button>
          </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* User XP pill */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-mono font-bold text-muted-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>{formatXP(user?.xp || 0)}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-border bg-background p-1.5 sm:p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
          </button>

          {/* User Avatar */}
          <div
            className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold shadow-xs select-none"
            title={user?.name}
          >
            {initials}
          </div>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="flex-1 min-h-0 w-full p-2 sm:p-2.5 overflow-hidden flex flex-col">
        {children}
      </main>
      </div>
    </FocusModeContext.Provider>
  );
}
