import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpreadsheetGrid } from './SpreadsheetGrid.jsx';

describe('SpreadsheetGrid Component Tests (LRN-EXCEL-002)', () => {
  const mockDataset = {
    columns: [
      { key: 'id', name: 'Mã đơn', type: 'string' },
      { key: 'product', name: 'Tên sản phẩm', type: 'string' },
      { key: 'quantity', name: 'Số lượng', type: 'number' },
      { key: 'unitPrice', name: 'Đơn giá', type: 'currency' },
      { key: 'total', name: 'Thành tiền', type: 'currency' },
    ],
    rows: [
      { id: 'ORD-001', product: 'Gạo ST25 Organic', quantity: 3, unitPrice: 150000, total: null },
    ],
  };

  it('renders đúng tiêu đề cột A, B, C, D, E và các hàng Excel 1, 2', () => {
    render(<SpreadsheetGrid dataset={mockDataset} selectedCell="E2" targetCell="E2" />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();

    expect(screen.getByText('Gạo ST25 Organic')).toBeInTheDocument();
  });

  it('gọi hàm onCellSelect khi click chọn ô tính', () => {
    const handleCellSelect = vi.fn();
    render(
      <SpreadsheetGrid
        dataset={mockDataset}
        selectedCell="A2"
        onCellSelect={handleCellSelect}
        targetCell="E2"
      />
    );

    const targetCellElement = screen.getByText('Mục tiêu').closest('td');
    fireEvent.click(targetCellElement);

    expect(handleCellSelect).toHaveBeenCalledWith('E2');
  });

  it('hiển thị badge "Mục tiêu" khi ô target chưa có dữ liệu (Trạng thái 1)', () => {
    render(<SpreadsheetGrid dataset={mockDataset} selectedCell="E2" targetCell="E2" />);

    expect(screen.getByText('Mục tiêu')).toBeInTheDocument();
  });

  it('ẩn chữ "Mục tiêu" và hiển thị giá trị kết quả rõ ràng khi đã có dữ liệu (Trạng thái 2 - Smart Visibility)', () => {
    const cellValues = { E2: 450000 };
    render(
      <SpreadsheetGrid
        dataset={mockDataset}
        selectedCell="E2"
        targetCell="E2"
        cellValues={cellValues}
      />
    );

    expect(screen.getByText('450.000 ₫')).toBeInTheDocument();
    expect(screen.queryByText('Mục tiêu')).not.toBeInTheDocument();
  });
});
