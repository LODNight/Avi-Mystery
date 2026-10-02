import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Palette,
  Paintbrush,
  Type,
  FileSearch,
  Lock,
  KeyRound,
  Database,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  X,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../../app/providers/ThemeProvider.jsx';

export const SETTINGS_NAV_ITEMS = [
  {
    id: 'profile',
    label: 'Hồ sơ',
    subtitle: 'Nhân dạng & cấp bậc',
    icon: User,
  },
  {
    id: 'appearance',
    label: 'Giao diện',
    subtitle: 'Màu sắc & ngôn ngữ',
    icon: Palette,
  },
  {
    id: 'account-password',
    label: 'Mật khẩu',
    subtitle: 'Bảo mật tài khoản',
    icon: KeyRound,
  },
];

export function SettingsSecondarySidebar({
  isOpen,
  onClose,
  collapsedMain,
  activeTab,
  onSelectTab,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { primaryColor } = useTheme();

  const currentTab = activeTab || searchParams.get('tab') || 'profile';
  const activeColor = primaryColor || '#d97706';

  const isItemActive = (itemId) => {
    if (itemId === 'appearance') {
      return currentTab === 'appearance' || currentTab === 'appearance-color' || currentTab === 'appearance-typography';
    }
    if (itemId === 'account-password') {
      return currentTab === 'account-password' || currentTab === 'account';
    }
    return currentTab === itemId;
  };

  const handleItemClick = (itemId) => {
    if (onSelectTab) {
      onSelectTab(itemId);
    }
    navigate(`/settings?tab=${itemId}`);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  // Determine left offset for desktop side-by-side positioning
  const leftPositionClass = collapsedMain ? 'lg:left-20' : 'lg:left-72';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <button
          aria-label="Đóng menu cài đặt"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Secondary Sidebar Panel - High Taste Neutral Surface */}
      <aside
        id="settings-secondary-sidebar"
        aria-label="Menu cài đặt phụ"
        className={`fixed top-0 bottom-0 z-30 w-80 border-r border-stone-200/90 dark:border-stone-800 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md shadow-sm transition-all duration-300 ease-in-out flex flex-col ${leftPositionClass} ${
          isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-full lg:opacity-0 lg:pointer-events-none'
        }`}
      >
        {/* Header with Warm Contrast */}
        <div className="flex h-20 items-center justify-between border-b border-stone-200/80 dark:border-stone-800 px-5 shrink-0 bg-stone-100/40 dark:bg-stone-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <SlidersHorizontal className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground truncate">
                Cài đặt
              </p>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 tracking-tight truncate">
                Hệ thống & Tuỳ biến
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
              title="Đóng sidebar phụ"
              aria-label="Đóng sidebar phụ"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Categories List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Danh mục cài đặt">
          {SETTINGS_NAV_ITEMS.map((item, index) => {
            const isSelected = isItemActive(item.id);

            return (
              <div key={item.id} className="space-y-1">
                {/* Main Item Card */}
                <button
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`group relative w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/12 text-primary font-bold shadow-xs border border-primary/25'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`grid size-7 place-items-center rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary/15 text-primary'
                          : 'bg-stone-200/50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200'
                      }`}
                    >
                      <item.icon className="size-3.5 shrink-0" strokeWidth={isSelected ? 2.2 : 1.8} />
                    </span>
                    <div className="text-left min-w-0">
                      <p className="truncate leading-tight">{item.label}</p>
                      {item.subtitle && (
                        <p className="text-[10px] font-normal text-muted-foreground truncate leading-tight mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.id === 'appearance' && (
                      <span
                        className="size-2.5 rounded-full border border-black/10 ring-2 ring-primary/20 shrink-0"
                        style={{ backgroundColor: activeColor }}
                        title={`Màu hiện tại: ${activeColor}`}
                      />
                    )}
                    {isSelected && (
                      <span className="size-2 rounded-full bg-primary shrink-0 shadow-xs shadow-primary/50" />
                    )}
                  </div>
                </button>

                {/* Subtle Divider between groups */}
                {index < SETTINGS_NAV_ITEMS.length - 1 && (
                  <div className="my-1 border-b border-stone-200/50 dark:border-stone-800/50" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Refined Footer */}
        <div className="p-3.5 border-t border-stone-200/80 dark:border-stone-800 bg-stone-100/30 dark:bg-stone-900/40 text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-stone-500 dark:text-stone-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tự động đồng bộ cấu hình</span>
          </div>
        </div>
      </aside>
    </>
  );
}
