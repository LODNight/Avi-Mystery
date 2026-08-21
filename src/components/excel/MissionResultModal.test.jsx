import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MissionResultModal } from './MissionResultModal.jsx';

describe('MissionResultModal Component Tests (Step 3.4)', () => {
  it('không render khi isOpen = false', () => {
    const { container } = render(
      <MissionResultModal isOpen={false} result={{ isCorrect: true }} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('hiển thị popup Phá Án Thành Công với điểm XP khi kết quả đúng', () => {
    const handleClose = vi.fn();
    const handleNext = vi.fn();

    render(
      <MissionResultModal
        isOpen={true}
        result={{
          isCorrect: true,
          netXp: 85,
          baseXp: 100,
          hintPenalty: 15,
          userLevelUp: true,
          updatedUser: { level: 2 },
          feedback: 'Công thức hoàn toàn chính xác!',
          missionTitle: 'Vì sao doanh thu tháng 3 giảm?',
        }}
        onClose={handleClose}
        onNextMission={handleNext}
      />
    );

    expect(screen.getByText(/Chúc Mừng Trinh Thám!/i)).toBeInTheDocument();
    expect(screen.getByText('+85 XP')).toBeInTheDocument();
    expect(screen.getByText(/THĂNG CẤP MỚI! Bạn đã đạt Cấp 2/i)).toBeInTheDocument();
    expect(screen.getByText('Công thức hoàn toàn chính xác!')).toBeInTheDocument();

    // Bấm nút bài học tiếp theo
    fireEvent.click(screen.getByRole('button', { name: /Bài học tiếp theo/i }));
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('hiển thị popup Chưa Thể Phá Án khi công thức nhập sai', () => {
    const handleRetry = vi.fn();

    render(
      <MissionResultModal
        isOpen={true}
        result={{
          isCorrect: false,
          netXp: 0,
          feedback: 'Công thức Excel phải bắt đầu bằng dấu "="',
          missionTitle: 'Vì sao doanh thu tháng 3 giảm?',
        }}
        onClose={vi.fn()}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText(/Chưa Thể Phá Án/i)).toBeInTheDocument();
    expect(screen.getByText('Công thức Excel phải bắt đầu bằng dấu "="')).toBeInTheDocument();

    // Bấm nút thử lại
    fireEvent.click(screen.getByRole('button', { name: /Thử lại công thức/i }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
