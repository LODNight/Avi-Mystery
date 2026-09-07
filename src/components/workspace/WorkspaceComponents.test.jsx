import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProblemPane } from './ProblemPane.jsx';
import { WorkspaceFooter } from './WorkspaceFooter.jsx';

describe('ProblemPane Component Tests', () => {
  it('hiển thị đầy đủ thông tin vụ án, cốt truyện và mục tiêu', () => {
    render(
      <MemoryRouter>
        <ProblemPane
          title="Vụ án Doanh thu sụt giảm"
          missionId="mission-001"
          story="Tháng 3 doanh số đột ngột giảm 40%."
          objective="Tính toán tổng tiền ở ô E2."
          targetCell="E2"
          rewardXp={100}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Vụ án Doanh thu sụt giảm')).toBeInTheDocument();
    expect(screen.getByText(/Mã vụ án: mission-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Tháng 3 doanh số đột ngột giảm 40%/i)).toBeInTheDocument();
    expect(screen.getByText(/Tính toán tổng tiền ở ô E2/i)).toBeInTheDocument();
    expect(screen.getByText(/Ô đích: E2/i)).toBeInTheDocument();
  });

  it('cho phép mở khóa gợi ý tiếp theo và ghim gợi ý', () => {
    const handleUnlock = vi.fn();
    const handlePin = vi.fn();

    render(
      <MemoryRouter>
        <ProblemPane
          title="Vụ án Doanh thu"
          missionId="mission-001"
          hints={['Gợi ý 1: Xem cột C và D', 'Gợi ý 2: Phép nhân *']}
          hintsUnlockedCount={1}
          onUnlockNextHint={handleUnlock}
          onPinHint={handlePin}
        />
      </MemoryRouter>
    );

    // Gợi ý 1 đã mở
    expect(screen.getByText(/Gợi ý 1: Xem cột C và D/i)).toBeInTheDocument();

    // Ghim gợi ý 1
    const pinBtn = screen.getByRole('button', { name: /Ghim/i });
    fireEvent.click(pinBtn);
    expect(handlePin).toHaveBeenCalledWith('Gợi ý 1: Xem cột C và D');

    // Nút mở gợi ý 2
    const unlockBtn = screen.getByRole('button', { name: /Mở Gợi ý Cấp 2/i });
    fireEvent.click(unlockBtn);
    expect(handleUnlock).toHaveBeenCalledTimes(1);
  });
});

describe('WorkspaceFooter Component Tests', () => {
  it('kích hoạt các sự kiện khi bấm nút Chạy thử, Nộp bài và Đặt lại', () => {
    const handleRun = vi.fn();
    const handleSubmit = vi.fn();
    const handleReset = vi.fn();

    render(
      <WorkspaceFooter
        onRun={handleRun}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Chạy thử/i }));
    expect(handleRun).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Nộp bài vụ án/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Đặt lại/i }));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('hiển thị diagnostic cảnh báo khi có lỗi cú pháp', () => {
    render(
      <WorkspaceFooter
        diagnostic={{ valid: false, message: 'Thiếu dấu ngoặc đóng' }}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Thiếu dấu ngoặc đóng');
  });
});
