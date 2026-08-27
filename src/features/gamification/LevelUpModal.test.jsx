import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LevelUpModal } from './LevelUpModal.jsx';

describe('LevelUpModal Component Tests (Step 7.1.1)', () => {
  it('không hiển thị khi isOpen = false', () => {
    render(
      <LevelUpModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hiển thị đúng thông tin khi isOpen = true', () => {
    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        previousLevel={2}
        newLevel={3}
        newTitle="Thám Tử Lừng Danh"
        xpEarned={150}
      />
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Chúc mừng Thám tử! 🎉')).toBeDefined();
    expect(screen.getByText('LV. 2')).toBeDefined();
    expect(screen.getByText('LV. 3')).toBeDefined();
    expect(screen.getByText('Thám Tử Lừng Danh')).toBeDefined();
    expect(screen.getByText('+150 XP')).toBeDefined();
  });

  it('gọi onClose khi click nút X', () => {
    const handleClose = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText('Đóng thông báo');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi onClose khi click nút "Tiếp tục phá án"', () => {
    const handleClose = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    const actionBtn = screen.getByText('Tiếp tục phá án');
    fireEvent.click(actionBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi onClose khi nhấn phím Escape', () => {
    const handleClose = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
