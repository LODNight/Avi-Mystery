import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminMissionsPage } from './AdminMissionsPage.jsx';
import { mockAdminContentService } from '../../services/mock/mockAdminContentService.js';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AdminMissionsPage Component Tests', () => {
  beforeEach(() => {
    mockAdminContentService.resetToDefaults();
  });

  it('hiển thị danh sách vụ án và các thẻ thống kê tổng quan', async () => {
    renderWithRouter(<AdminMissionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Quản lý Vụ án & Nhiệm vụ')).toBeInTheDocument();
      expect(screen.getByText('Tổng vụ án')).toBeInTheDocument();
      expect(screen.getByText('Vì sao doanh thu tháng 3 giảm?')).toBeInTheDocument();
    });
  });

  it('lọc danh sách vụ án theo công cụ Excel và SQL', async () => {
    renderWithRouter(<AdminMissionsPage />);

    await screen.findByText('Vì sao doanh thu tháng 3 giảm?');

    const selects = screen.getAllByRole('combobox');
    const toolSelect = selects[1]; // Tool dropdown

    // Filter to SQL
    fireEvent.change(toolSelect, { target: { value: 'sql' } });

    await waitFor(() => {
      // Excel mission should disappear
      expect(screen.queryByText('Vì sao doanh thu tháng 3 giảm?')).not.toBeInTheDocument();
      // SQL mission should be visible
      expect(screen.getByText('Khám phá dữ liệu bán hàng')).toBeInTheDocument();
    });
  });

  it('tìm kiếm vụ án theo từ khóa', async () => {
    renderWithRouter(<AdminMissionsPage />);

    await screen.findByText('Vì sao doanh thu tháng 3 giảm?');

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm vụ án/);
    fireEvent.change(searchInput, { target: { value: 'tồn kho' } });

    await waitFor(() => {
      expect(screen.getByText('Hàng tồn kho nào cần nhập thêm?')).toBeInTheDocument();
      expect(screen.queryByText('Vì sao doanh thu tháng 3 giảm?')).not.toBeInTheDocument();
    });
  });

  it('chuyển đổi trạng thái xuất bản (Toggle Publish Status)', async () => {
    renderWithRouter(<AdminMissionsPage />);

    await screen.findByText('Vì sao doanh thu tháng 3 giảm?');

    const publishButtons = screen.getAllByTitle('Bấm để đổi trạng thái Xuất bản / Bản nháp');
    expect(publishButtons.length).toBeGreaterThan(0);

    // Click toggle
    fireEvent.click(publishButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Đã chuyển vụ án/)).toBeInTheDocument();
    });
  });
});
