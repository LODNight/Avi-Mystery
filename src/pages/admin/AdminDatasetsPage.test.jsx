import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDatasetsPage } from './AdminDatasetsPage.jsx';
import { mockAdminContentService } from '../../services/mock/mockAdminContentService.js';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AdminDatasetsPage Component Tests', () => {
  beforeEach(() => {
    mockAdminContentService.resetToDefaults();
  });

  it('hiển thị danh sách các dataset hiện có', async () => {
    renderWithRouter(<AdminDatasetsPage />);

    await waitFor(() => {
      expect(screen.getByText('Quản lý Dataset & Schema Generator')).toBeInTheDocument();
      expect(screen.getByText('Nhập Dataset Từ CSV')).toBeInTheDocument();
    });
  });

  it('mở modal xem Schema của dataset khi bấm "Xem Schema"', async () => {
    renderWithRouter(<AdminDatasetsPage />);

    const viewSchemaBtns = await screen.findAllByText('Xem Schema');
    expect(viewSchemaBtns.length).toBeGreaterThan(0);

    fireEvent.click(viewSchemaBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Đóng')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Đóng'));
  });

  it('mở modal Nhập CSV và tự động nhận diện Schema', async () => {
    renderWithRouter(<AdminDatasetsPage />);

    const importBtn = await screen.findByText('Nhập Dataset Từ CSV');
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(screen.getByText('Nhập CSV & Tự Động Tạo SQLite Schema')).toBeInTheDocument();
      expect(screen.getByText(/Tự động nhận diện Schema/)).toBeInTheDocument();
    });

    // Test filling dataset name and saving
    const nameInput = screen.getByPlaceholderText('Ví dụ: sales_q2_2026.csv');
    fireEvent.change(nameInput, { target: { value: 'custom_test_dataset' } });

    const saveBtn = screen.getByText('Lưu & Tạo Dataset');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đã tạo thành công Dataset/)).toBeInTheDocument();
    });
  });
});
