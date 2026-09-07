import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceSplitPane } from './WorkspaceSplitPane.jsx';

describe('WorkspaceSplitPane Component Tests', () => {
  it('hiển thị cả hai panel trên màn hình desktop (>=1024px)', () => {
    // Giả lập desktop
    window.innerWidth = 1200;

    render(
      <WorkspaceSplitPane
        leftContent={<div data-testid="left-content">Đề bài vụ án</div>}
        rightContent={<div data-testid="right-content">Bảng làm việc Excel</div>}
      />
    );

    expect(screen.getByTestId('left-content')).toBeInTheDocument();
    expect(screen.getByTestId('right-content')).toBeInTheDocument();
    expect(screen.getByLabelText(/Kéo để điều chỉnh kích thước hai khung làm việc/i)).toBeInTheDocument();
  });

  it('hỗ trợ chuyển đổi tab trên màn hình mobile (<1024px)', () => {
    // Giả lập mobile
    window.innerWidth = 600;

    render(
      <WorkspaceSplitPane
        leftContent={<div data-testid="left-content">Đề bài vụ án</div>}
        rightContent={<div data-testid="right-content">Bảng làm việc Excel</div>}
      />
    );

    // Mặc định tab 'left' được chọn
    expect(screen.getByTestId('left-content')).toBeInTheDocument();
    expect(screen.queryByTestId('right-content')).not.toBeInTheDocument();

    // Bấm chuyển sang tab 'right' (Bảng làm việc)
    const rightTabBtn = screen.getByRole('button', { name: /Bảng làm việc/i });
    fireEvent.click(rightTabBtn);

    expect(screen.queryByTestId('left-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('right-content')).toBeInTheDocument();
  });
});
