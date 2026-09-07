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

    const targetCellElement = screen.getByTestId('target-cell-marker').closest('td');
    fireEvent.click(targetCellElement);

    expect(handleCellSelect).toHaveBeenCalledWith('E2');
  });

  it('hiển thị marker và viền accent cho ô target mà KHÔNG dùng badge chữ "Mục tiêu" che khuất ô', () => {
    render(<SpreadsheetGrid dataset={mockDataset} selectedCell="E2" targetCell="E2" />);

    // Marker ô mục tiêu hiển thị
    expect(screen.getByTestId('target-cell-marker')).toBeInTheDocument();
    // Không còn chữ "Mục tiêu" gây che khuất dữ liệu trong ô tính
    expect(screen.queryByText('Mục tiêu')).not.toBeInTheDocument();
  });

  it('hiển thị giá trị kết quả rõ ràng khi đã có dữ liệu tính toán', () => {
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
