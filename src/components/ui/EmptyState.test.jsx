import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState, ErrorState, ProgressBar } from './EmptyState.jsx';

describe('EmptyState Component Tests', () => {
  it('hien thi dung title va description', () => {
    render(
      <EmptyState
        title="Không tìm thấy kết quả"
        description="Vui lòng thử lại với từ khóa khác"
      />
    );

    expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng thử lại với từ khóa khác')).toBeInTheDocument();
  });

  it('gọi hàm onClick khi bấm vào action button', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="Trống"
        action={{ label: 'Tạo mới', onClick: handleAction }}
      />
    );

    const button = screen.getByRole('button', { name: 'Tạo mới' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorState Component Tests', () => {
  it('hiển thị đúng thông báo lỗi và nút Thử lại', () => {
    const handleRetry = vi.fn();
    render(<ErrorState message="Lỗi mạng kết nối" onRetry={handleRetry} />);

    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument();
    expect(screen.getByText('Lỗi mạng kết nối')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Thử lại' });
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

describe('ProgressBar Component Tests', () => {
  it('render progressbar với aria attributes chính xác', () => {
    render(<ProgressBar value={75} showLabel />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('clamp giá trị giá trị vượt mốc 0-100', () => {
    render(<ProgressBar value={150} showLabel />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });
});
