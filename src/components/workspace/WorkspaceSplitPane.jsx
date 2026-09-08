import React, { useState, useEffect, useRef } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { FileText, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * WorkspaceSplitPane Component (Sprint 9 / Split-Pane IDE Architecture)
 * Cung cấp bố cục chia khung (Split-Pane) chuẩn LeetCode:
 * - Desktop (>= 1024px): Cột trái (40%) và Cột phải (60%) có thể kéo giãn qua Separator.
 * - Mobile / Tablet (< 1024px): Tab switcher giữa "Đề bài & Gợi ý" và "Không gian làm việc".
 */
export function WorkspaceSplitPane({
  leftContent,
  rightContent,
  leftTitle = 'Hồ sơ vụ án',
  rightTitle = 'Bảng làm việc',
  defaultLeftSize = '34%',
  minLeftSize = '25%',
  maxLeftSize = '42%',
  isFocusMode = false,
  onToggleFocusMode = null,
  className = '',
}) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  const [activeMobileTab, setActiveMobileTab] = useState('left'); // 'left' | 'right'

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    if (isFocusMode) {
      setActiveMobileTab('right');
    }
  }, [isFocusMode]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Layout dành cho Mobile / Tablet (< 1024px): Chuyển đổi tab linh hoạt ──
  if (isMobile) {
    return (
      <div className={`flex flex-col h-full min-h-[calc(100vh-5rem)] ${className}`}>
        {/* Mobile Tab Selector */}
        <div className="flex items-center gap-1 border-b border-border bg-card/60 p-1.5 backdrop-blur shrink-0">
          <button
            type="button"
            onClick={() => setActiveMobileTab('left')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
              activeMobileTab === 'left'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <FileText className="size-3.5" />
            <span>{leftTitle}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('right')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
              activeMobileTab === 'right'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>{rightTitle}</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto">
          {activeMobileTab === 'left' ? (
            <div className="p-3 sm:p-4">{leftContent}</div>
          ) : (
            <div className="p-3 sm:p-4 flex flex-col h-full">{rightContent}</div>
          )}
        </div>
      </div>
    );
  }

  // ── Layout dành cho Desktop khi BẬT Focus Mode: Mở rộng tối đa bảng tính ──
  if (isFocusMode) {
    return (
      <div className={`relative h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col ${className}`}>
        {/* Floating Quick Peek Button */}
        {onToggleFocusMode && (
          <div className="absolute top-2.5 left-2.5 z-30">
            <button
              type="button"
              onClick={onToggleFocusMode}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/95 hover:bg-muted text-foreground px-2.5 py-1 text-xs font-bold shadow-md backdrop-blur-md transition-all cursor-pointer select-none"
              title="Mở lại khung Đề bài & Manh mối (Tắt Focus Mode)"
            >
              <FileText className="size-3.5 text-amber-500" />
              <span>Xem đề bài</span>
            </button>
          </div>
        )}

        <div className="h-full w-full overflow-hidden flex flex-col bg-background dark:bg-workspace">
          {rightContent}
        </div>
      </div>
    );
  }

  const leftDefaultNum = parseInt(defaultLeftSize, 10) || 38;
  const leftMinNum = parseInt(minLeftSize, 10) || 25;
  const leftMaxNum = parseInt(maxLeftSize, 10) || 48;

  const leftDefault = `${leftDefaultNum}%`;
  const leftMin = `${leftMinNum}%`;
  const leftMax = `${leftMaxNum}%`;

  const rightDefault = `${100 - leftDefaultNum}%`;
  const rightMin = `${100 - leftMaxNum}%`;

  // ── Layout dành cho Desktop (>= 1024px): Split-Pane IDE với thanh kéo ──
  return (
    <div className={`h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${className}`}>
      <Group orientation="horizontal" className="h-full w-full relative">
        {/* Left Pane (Đề bài, cốt truyện, mục tiêu, gợi ý) */}
        {!isCollapsed && (
          <Panel
            id="problem-pane"
            defaultSize={leftDefault}
            minSize={leftMin}
            maxSize={leftMax}
            className="h-full overflow-y-auto bg-muted/20 dark:bg-card/40 focus:outline-none scrollbar-thin"
          >
            <div className="p-3.5 lg:p-4 h-full">
              {leftContent}
            </div>
          </Panel>
        )}

        {/* Separator / Resize Divider Bar */}
        {!isCollapsed && (
          <Separator
            aria-label="Kéo để điều chỉnh kích thước hai khung làm việc"
            className="relative flex w-3 items-center justify-center bg-border/60 hover:bg-amber-500/20 active:bg-amber-500/30 transition-colors cursor-col-resize group select-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <div className="h-8 w-1 rounded-full bg-border group-hover:bg-amber-500 transition-colors" />
            
            {/* Collapse Toggle Button */}
            <button
               type="button"
               onClick={toggleCollapse}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center size-5 rounded-full border border-border bg-card shadow-md hover:bg-muted text-muted-foreground transition-all cursor-pointer z-10"
               title="Thu gọn khung Đề bài"
            >
               <ChevronLeft className="size-3.5" />
            </button>
          </Separator>
        )}

        {/* Right Pane (Workspace, Editor, Spreadsheet/Results) */}
        <Panel
          id="workspace-pane"
          defaultSize={rightDefault}
          minSize={rightMin}
          className="h-full overflow-hidden flex flex-col bg-background dark:bg-workspace focus:outline-none relative"
        >
          {isCollapsed && (
            <button
               type="button"
               onClick={toggleCollapse}
               className="absolute top-1/2 left-0 -translate-y-1/2 flex items-center justify-center size-6 rounded-r-full border border-border border-l-0 bg-card shadow-md hover:bg-muted text-muted-foreground transition-all cursor-pointer z-50"
               title="Mở rộng khung Đề bài"
            >
               <ChevronRight className="size-3.5" />
            </button>
          )}
          {rightContent}
        </Panel>
      </Group>
    </div>
  );
}
