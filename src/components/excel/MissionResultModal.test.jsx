import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MissionResultModal } from './MissionResultModal.jsx';

describe('MissionResultModal Component Tests (Step 3.4)', () => {
  it('không render khi isOpen = false', () => {
    const { container } = render(
      <MissionResultModal
        isOpen={false}
        result={{ isCorrect: true, missionCompleted: true }}
        onClose={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('không render modal cho incorrect answer', () => {
    render(
      <MissionResultModal
        isOpen={true}
        result={{ isCorrect: false, missionCompleted: false, feedback: 'Chưa đúng' }}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hiển thị success modal với potentialXp chưa được trao', () => {
    const handleClose = vi.fn();
    const handleNext = vi.fn();

    render(
      <MissionResultModal
        isOpen={true}
        result={{
          isCorrect: true,
          stepCompleted: true,
          missionCompleted: true,
          potentialXp: 85,
          feedback: 'Công thức hoàn toàn chính xác!',
        }}
        missionTitle="Vì sao doanh thu tháng 3 giảm?"
        onClose={handleClose}
        onNextMission={handleNext}
      />
    );

    expect(screen.getByText(/Chúc Mừng Trinh Thám!/i)).toBeInTheDocument();
    expect(screen.getByText(/Phần thưởng dự kiến: \+85 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/XP chưa được trao trong Step 3.4/i)).toBeInTheDocument();
    expect(screen.getByText('Công thức hoàn toàn chính xác!')).toBeInTheDocument();
    expect(screen.queryByText(/THĂNG CẤP/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Về bản đồ học tập/i }));
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('focus dialog, đóng bằng Escape và trả focus về trigger', async () => {
    const handleClose = vi.fn();
    const result = {
      isCorrect: true,
      stepCompleted: true,
      missionCompleted: true,
      potentialXp: 100,
      feedback: 'Chính xác',
    };
    const { rerender } = render(
      <>
        <button type="button">Nộp bài</button>
        <MissionResultModal isOpen={false} result={result} onClose={handleClose} />
      </>
    );
    const trigger = screen.getByRole('button', { name: /Nộp bài/i });
    trigger.focus();

    rerender(
      <>
        <button type="button">Nộp bài</button>
        <MissionResultModal isOpen={true} result={result} onClose={handleClose} />
      </>
    );

    await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    rerender(
      <>
        <button type="button">Nộp bài</button>
        <MissionResultModal isOpen={false} result={result} onClose={handleClose} />
      </>
    );
    await waitFor(() => expect(screen.getByRole('button', { name: /Nộp bài/i })).toHaveFocus());
  });
});
