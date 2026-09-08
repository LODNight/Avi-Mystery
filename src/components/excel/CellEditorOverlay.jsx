import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * CellEditorOverlay
 * Component hiển thị khung nhập liệu nổi (absolute) nằm đè lên ô đang chọn.
 * Sử dụng createPortal để gắn trực tiếp vào container scrollbar của SpreadsheetGrid,
 * giải quyết triệt để vấn đề tràn chữ (overflow) và không làm re-render SpreadsheetGrid khi gõ phím.
 */
export function CellEditorOverlay({
  activeCell,
  draftValue,
  onChange,
  onCommit,
  onCancel,
  gridContainerRef,
  validationState,
}) {
  const [position, setPosition] = useState(null);
  const inputRef = useRef(null);

  // Tính toán vị trí của ô tính (target cell) để gắn overlay
  useEffect(() => {
    if (!activeCell || !gridContainerRef?.current) return;

    const updatePosition = () => {
      const container = gridContainerRef.current;
      const cellNode = container.querySelector(`[data-cell-addr="${activeCell}"]`);
      if (cellNode) {
        // Sử dụng getBoundingClientRect để tính toán tọa độ chính xác tuyệt đối
        // so với góc trên bên trái của container scrollbar
        const containerRect = container.getBoundingClientRect();
        const cellRect = cellNode.getBoundingClientRect();

        setPosition({
          top: cellRect.top - containerRect.top + container.scrollTop,
          left: cellRect.left - containerRect.left + container.scrollLeft,
          minWidth: cellRect.width,
          height: cellRect.height,
        });
      }
    };

    updatePosition();

    // Cập nhật vị trí khi resize
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [activeCell, gridContainerRef]);

  // Focus
  useEffect(() => {
    if (position && inputRef.current) {
      inputRef.current.focus();
    }
  }, [position]);

  if (!activeCell || !position || !gridContainerRef?.current) return null;

  const isInvalid = validationState && !validationState.valid;

  const overlayContent = (
    <div
      data-testid="cell-editor-overlay"
      className={`absolute bg-background shadow-lg transition-colors ${
        isInvalid ? 'border-2 border-rose-500 shadow-rose-500/20' : 'border-2 border-primary shadow-primary/20'
      }`}
      style={{
        top: position.top,
        left: position.left,
        minWidth: position.minWidth,
        height: position.height,
        zIndex: 40,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={draftValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            onCommit('enter');
          } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          } else if (e.key === 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            onCommit('tab');
          } else if (
            e.key === 'ArrowLeft' ||
            e.key === 'ArrowRight' ||
            e.key === 'ArrowUp' ||
            e.key === 'ArrowDown'
          ) {
            // Không để event lan ra ngoài gây di chuyển ô tính trong khi đang soạn thảo
            e.stopPropagation();
          }
        }}
        className="block h-full px-3 py-1.5 bg-transparent text-foreground focus:outline-none focus:ring-0 font-mono text-xs tabular-nums"
        style={{ width: 'max-content', minWidth: '100%' }}
        spellCheck={false}
      />
    </div>
  );

  return createPortal(overlayContent, gridContainerRef.current);
}

