import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InvestigationWorkbench } from './InvestigationWorkbench.jsx';

// Sample dataset matching Case #001 Warehouse Shipping Records
const mockDataset = {
  id: 'ds-coffee-warehouse-may',
  title: 'Warehouse Shipping Records — May 2026',
  schema: [
    { name: 'order_id', label: 'Order ID', type: 'string', excelColumn: 'A' },
    { name: 'date', label: 'Date', type: 'date', excelColumn: 'B' },
    { name: 'product', label: 'Product', type: 'string', excelColumn: 'C' },
    { name: 'quantity_kg', label: 'Quantity (kg)', type: 'number', excelColumn: 'D' },
    { name: 'destination', label: 'Destination', type: 'string', excelColumn: 'E' },
    { name: 'authorized', label: 'Authorization', type: 'string', excelColumn: 'F' },
    { name: 'manager', label: 'Manager', type: 'string', excelColumn: 'G' },
  ],
  rows: [
    { order_id: 'ORD-1835', date: '02/05/2026', product: 'Robusta Coffee', quantity_kg: 2100, destination: 'Warehouse B', authorized: 'YES — Form OUT-04', manager: 'Phạm Thu Hà' },
    { order_id: 'ORD-1836', date: '05/05/2026', product: 'Robusta Coffee', quantity_kg: 3500, destination: 'Warehouse B', authorized: 'YES — Form OUT-04', manager: 'Phạm Thu Hà' },
    { order_id: 'ORD-1839', date: '08/05/2026', product: 'Robusta Coffee', quantity_kg: 1890, destination: 'Distribution Hub C', authorized: 'YES — Form OUT-05', manager: 'Trần Đức Long' },
    { order_id: 'ORD-1842', date: '14/05/2026', product: 'Robusta Coffee', quantity_kg: 4210, destination: '—', authorized: 'YES', manager: 'Nguyễn Văn Tâm' },
    { order_id: 'ORD-1847', date: '19/05/2026', product: 'Robusta Coffee', quantity_kg: 2800, destination: 'Distribution Hub C', authorized: 'YES — Form OUT-05', manager: 'Trần Đức Long' },
    { order_id: 'ORD-1851', date: '23/05/2026', product: 'Robusta Coffee', quantity_kg: 2320, destination: 'Warehouse B', authorized: 'YES — Form OUT-06', manager: 'Phạm Thu Hà' },
    { order_id: 'ORD-1858', date: '28/05/2026', product: 'Robusta Coffee', quantity_kg: 1600, destination: 'Distribution Hub C', authorized: 'YES — Form OUT-06', manager: 'Trần Đức Long' },
  ],
};

describe('InvestigationWorkbench Component Tests', () => {
  let onRecordFinding;
  let onSaveWorkbenchState;
  let onViewSource;

  beforeEach(() => {
    onRecordFinding = vi.fn();
    onSaveWorkbenchState = vi.fn();
    onViewSource = vi.fn();
  });

  it('1. Render tiêu đề nguồn chứng cứ, thanh FormulaBar và các Quick Formula chips', () => {
    render(
      <InvestigationWorkbench
        sourceEvidenceId="src-warehouse-records"
        sourceTitle="Báo Cáo Xuất Kho"
        dataset={mockDataset}
        phaseId="phase-1"
        onSaveWorkbenchState={onSaveWorkbenchState}
        onRecordFinding={onRecordFinding}
        onViewSource={onViewSource}
      />
    );

    expect(screen.getAllByText('Báo Cáo Xuất Kho').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /^=SUM\(D2:D8\)$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^=SUM\(D2:D8\)-14210$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^=18420-14210$/i })).toBeInTheDocument();
  });

  it('2. Nhấp vào Quick Formula chip =SUM(D2:D8)-14210 tính ra kết quả 4210 và hiển thị kết quả điều tra', async () => {
    render(
      <InvestigationWorkbench
        sourceEvidenceId="src-warehouse-records"
        sourceTitle="Báo Cáo Xuất Kho"
        dataset={mockDataset}
        phaseId="phase-1"
        onSaveWorkbenchState={onSaveWorkbenchState}
        onRecordFinding={onRecordFinding}
        onViewSource={onViewSource}
      />
    );

    const chip = screen.getByRole('button', { name: /=SUM\(D2:D8\)-14210/i });
    fireEvent.click(chip);

    // Chờ panel kết quả phân tích hiển thị
    await waitFor(() => {
      expect(screen.getByText('Kết Quả Điều Tra')).toBeInTheDocument();
    });

    // Nút Ghi Nhận Kết Quả / Record Finding xuất hiện
    expect(screen.getByRole('button', { name: /Ghi Nhận Kết Quả/i })).toBeInTheDocument();
  });

  it('3. Mở Modal Ghi Nhận Manh Mối với giá trị 4210 và tự động điền luận điểm điều tra', async () => {
    render(
      <InvestigationWorkbench
        sourceEvidenceId="src-warehouse-records"
        sourceTitle="Báo Cáo Xuất Kho"
        dataset={mockDataset}
        phaseId="phase-1"
        onSaveWorkbenchState={onSaveWorkbenchState}
        onRecordFinding={onRecordFinding}
        onViewSource={onViewSource}
      />
    );

    const chip = screen.getByRole('button', { name: /=SUM\(D2:D8\)-14210/i });
    fireEvent.click(chip);

    await waitFor(() => {
      expect(screen.getByText('Kết Quả Điều Tra')).toBeInTheDocument();
    });

    // Bấm nút Record Finding
    const recordBtn = screen.getByRole('button', { name: /Ghi Nhận Kết Quả/i });
    fireEvent.click(recordBtn);

    // Modal xuất hiện với claim điền sẵn
    await waitFor(() => {
      expect(screen.getByText('Số lượng xuất kho trái phép vượt hạn mức ủy quyền là 4.210 kg')).toBeInTheDocument();
    });

    // Bấm xác nhận ghi nhận trong modal
    const confirmButtons = screen.getAllByRole('button', { name: /Ghi Nhận Kết Quả/i });
    // Nút cuối cùng là nút submit trong modal
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    // Kiểm tra callback onRecordFinding được gọi với đúng giá trị 4210
    expect(onRecordFinding).toHaveBeenCalledWith(
      expect.objectContaining({
        phaseId: 'phase-1',
        value: 4210,
        sourceEvidenceId: 'src-warehouse-records',
        claim: expect.stringContaining('4.210 kg'),
      })
    );
  });
});
