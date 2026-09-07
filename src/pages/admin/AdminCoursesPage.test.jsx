import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminCoursesPage } from './AdminCoursesPage.jsx';
import { mockAdminContentService } from '../../services/mock/mockAdminContentService.js';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AdminCoursesPage Component Tests', () => {
  beforeEach(() => {
    mockAdminContentService.resetToDefaults();
  });

  it('hiển thị danh sách khóa học và nút tạo mới', async () => {
    renderWithRouter(<AdminCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Quản lý Khóa học')).toBeInTheDocument();
      expect(screen.getByText('Tạo Khóa Học Mới')).toBeInTheDocument();
    });
  });

  it('bấm "Xuất bản & Sync Map" cập nhật lại Learning Map view', async () => {
    renderWithRouter(<AdminCoursesPage />);

    const publishButtons = await screen.findAllByText('Xuất bản & Sync Map');
    expect(publishButtons.length).toBeGreaterThan(0);

    fireEvent.click(publishButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/đồng bộ lại Bản đồ Học tập/)).toBeInTheDocument();
    });
  });

  it('mở modal tạo khóa học mới', async () => {
    renderWithRouter(<AdminCoursesPage />);

    const createBtn = await screen.findByText('Tạo Khóa Học Mới');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('Tạo Khóa học mới')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ví dụ: Phân Tích Dữ Liệu/)).toBeInTheDocument();
    });
  });
});
