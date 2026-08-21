import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActionToolbar } from './ActionToolbar.jsx';

describe('ActionToolbar Component Tests (Step 3.3)', () => {
  it('hiển thị đầy đủ các nút Chạy thử, Đặt lại, Gợi ý và Nộp bài', () => {
    render(
      <ActionToolbar
        onRun={vi.fn()}
        onSubmit={vi.fn()}
        onReset={vi.fn()}
        onToggleHint={vi.fn()}
        hintCount={3}
        hintsUnlockedCount={1}
      />
    );

    expect(screen.getByRole('button', { name: /Chạy thử công thức/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đặt lại/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gợi ý/i })).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nộp bài vụ án/i })).toBeInTheDocument();
  });

  it('kích hoạt các callback khi người dùng bấm vào từng nút', () => {
    const handleRun = vi.fn();
    const handleSubmit = vi.fn();
    const handleReset = vi.fn();
    const handleToggleHint = vi.fn();

    render(
      <ActionToolbar
        onRun={handleRun}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onToggleHint={handleToggleHint}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Chạy thử công thức/i }));
    expect(handleRun).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Đặt lại/i }));
    expect(handleReset).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Gợi ý/i }));
    expect(handleToggleHint).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Nộp bài vụ án/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('vô hiệu hóa các nút khi ở trạng thái isSubmitting hoặc isEvaluating', () => {
    render(
      <ActionToolbar
        onRun={vi.fn()}
        onSubmit={vi.fn()}
        onReset={vi.fn()}
        onToggleHint={vi.fn()}
        isSubmitting={true}
      />
    );

    expect(screen.getByRole('button', { name: /Chạy thử công thức/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Đang chấm điểm/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Gợi ý/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Đặt lại/i })).toBeDisabled();
    expect(screen.getByText(/Đang chấm điểm/i)).toBeInTheDocument();
  });
});
