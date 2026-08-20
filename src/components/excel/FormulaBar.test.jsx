import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormulaBar } from './FormulaBar.jsx';

describe('FormulaBar Component Tests (LRN-EXCEL-002)', () => {
  it('hiển thị đúng tọa độ ô đang chọn và công thức', () => {
    render(<FormulaBar selectedCell="E2" formula="=C2*D2" />);

    expect(screen.getByText('E2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('=C2*D2')).toBeInTheDocument();
  });

  it('gọi hàm onChange khi người dùng gõ công thức mới', () => {
    const handleChange = vi.fn();
    render(<FormulaBar selectedCell="E2" formula="" onChange={handleChange} />);

    const input = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
    fireEvent.change(input, { target: { value: '=SUM(B2:B5)' } });

    expect(handleChange).toHaveBeenCalledWith('=SUM(B2:B5)');
  });

  it('gọi hàm onSubmit khi nhấn phím Enter hoặc bấm nút Áp dụng', () => {
    const handleSubmit = vi.fn();
    render(<FormulaBar selectedCell="E2" formula="=C2*D2" onSubmit={handleSubmit} />);

    const input = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSubmit).toHaveBeenCalledTimes(1);

    const button = screen.getByRole('button', { name: /Áp dụng/i });
    fireEvent.click(button);

    expect(handleSubmit).toHaveBeenCalledTimes(2);
  });

  it('làm nổi bật màu Hổ phách khi ô chọn là Target Cell', () => {
    render(<FormulaBar selectedCell="E2" formula="" isTargetCell={true} />);

    const badge = screen.getByText('E2');
    expect(badge).toHaveClass('bg-amber-500');
  });
});
