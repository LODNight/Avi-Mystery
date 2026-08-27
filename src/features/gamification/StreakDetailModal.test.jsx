import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StreakDetailModal } from './StreakDetailModal.jsx';

describe('StreakDetailModal Component Tests (Step 7.1.2)', () => {
  it('không hiển thị khi isOpen = false', () => {
    render(
      <StreakDetailModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hiển thị đúng streakCount và các ngày trong tuần khi isOpen = true', () => {
    render(
      <StreakDetailModal
        isOpen={true}
        onClose={vi.fn()}
        streakCount={5}
      />
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('5 Ngày Liên Tiếp! 🔥')).toBeDefined();
    expect(screen.getByText('T2')).toBeDefined();
    expect(screen.getByText('CN')).toBeDefined();
  });

  it('gọi onClose khi click nút X', () => {
    const handleClose = vi.fn();
    render(
      <StreakDetailModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText('Đóng bảng streak');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi onClose khi click nút hành động "Đã hiểu & Giữ vững Streak"', () => {
    const handleClose = vi.fn();
    render(
      <StreakDetailModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    const actionBtn = screen.getByText('Đã hiểu & Giữ vững Streak');
    fireEvent.click(actionBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi onClose khi nhấn phím Escape', () => {
    const handleClose = vi.fn();
    render(
      <StreakDetailModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
