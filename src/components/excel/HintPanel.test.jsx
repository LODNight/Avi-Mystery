import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HintPanel } from './HintPanel.jsx';

describe('HintPanel Component Tests (Step 3.3)', () => {
  it('hiển thị đúng số lượng gợi ý và điểm thưởng net ban đầu khi chưa mở khóa gợi ý nào', () => {
    const hints = ['Gợi ý 1', 'Gợi ý 2', 'Gợi ý 3'];
    render(
      <HintPanel
        hints={hints}
        hintsUnlockedCount={0}
        onUnlockNextHint={vi.fn()}
        baseXp={100}
        penaltyPerHint={15}
      />
    );

    expect(screen.getByText(/Hệ thống Gợi ý Trinh thám/i)).toBeInTheDocument();
    expect(screen.getByText(/Phần thưởng dự kiến: 100 XP/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mở Gợi ý Cấp 1 \(-15 XP\)/i })).toBeInTheDocument();
  });

  it('hiển thị gợi ý cấp 1 và tính trừ điểm XP khi hintsUnlockedCount = 1', () => {
    const hints = ['Gợi ý 1: Nhân 2 ô', 'Gợi ý 2: Phép tính =C2*D2', 'Gợi ý 3'];
    render(
      <HintPanel
        hints={hints}
        hintsUnlockedCount={1}
        onUnlockNextHint={vi.fn()}
        baseXp={100}
        penaltyPerHint={15}
      />
    );

    expect(screen.getByText('Gợi ý 1: Nhân 2 ô')).toBeInTheDocument();
    expect(screen.getByText(/Phần thưởng dự kiến: 85 XP/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\(-15 XP\)/i).length).toBeGreaterThan(0);
  });

  it('kích hoạt onUnlockNextHint khi nhấn mở khóa gợi ý tiếp theo', () => {
    const handleUnlock = vi.fn();
    render(
      <HintPanel
        hints={['Gợi ý 1', 'Gợi ý 2']}
        hintsUnlockedCount={0}
        onUnlockNextHint={handleUnlock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Mở Gợi ý Cấp 1/i }));
    expect(handleUnlock).toHaveBeenCalledTimes(1);
  });
});
