import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DetectiveWorkspacePage } from './DetectiveWorkspacePage.jsx';

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { id: 'user-001' } }),
}));

vi.mock('../../app/layouts/FocusLayout.jsx', () => ({
  useFocusMode: vi.fn().mockReturnValue({ isFocusMode: false, toggleFocusMode: vi.fn() }),
}));

function renderWithRouter(initialRoute = '/cases/case-001/investigate') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/cases/:caseId/investigate" element={<DetectiveWorkspacePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DetectiveWorkspacePage Component & Layout Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hiển thị bố cục 3 cột đồng thời: Hồ sơ (Trái) | Bằng chứng (Giữa) | HQ Terminal (Phải) mà không có modal backdrop che khuất', async () => {
    const { container } = renderWithRouter('/cases/case-001/investigate');

    // Chờ case load xong
    await waitFor(() => {
      expect(screen.getAllByText(/Đường Dây Buôn Lậu Cà Phê|Illegal Coffee Delivery/i).length).toBeGreaterThan(0);
    });

    // 1. Cột trái (Case File)
    expect(screen.getByText(/Tóm tắt vụ án|Briefing/i)).toBeInTheDocument();
    expect(screen.getByText(/Mục tiêu|Objective/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Nguồn|Sources/i).length).toBeGreaterThan(0);

    // 2. Cột giữa (Evidence Region) - tự động nạp nguồn đầu tiên
    await waitFor(() => {
      expect(screen.getAllByText(/Báo Cáo Xuất Kho|Warehouse Shipping Records/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/ORD-1842/i).length).toBeGreaterThan(0);
    });

    // 3. Cột phải (HQ Terminal) mở cố định bên phải
    expect(screen.getByText(/HQ Terminal/i)).toBeInTheDocument();
    expect(screen.getByText(/GỬI BÁO CÁO LÊN HQ|Send Report to HQ/i)).toBeInTheDocument();

    // Xác nhận KHÔNG có backdrop làm mờ nền (không overlay che khuất)
    const backdrops = document.querySelectorAll('.bg-black\\/40');
    expect(backdrops.length).toBe(0);
  });

  it('tính năng Click-to-Fill: Click vào ô dữ liệu trên bảng tự động điền giá trị vào trường báo cáo đang chọn', async () => {
    renderWithRouter('/cases/case-001/investigate');

    await waitFor(() => {
      expect(screen.getAllByText(/ORD-1842/i).length).toBeGreaterThan(0);
    });

    // Tìm input người quản lý trong báo cáo
    const managerInput = screen.getByPlaceholderText(/Họ tên quản lý|Full name of the manager/i);
    expect(managerInput).toBeInTheDocument();
    expect(managerInput.value).toBe('');

    // Focus / chọn trường này
    fireEvent.click(managerInput);

    // Click vào ô "Nguyễn Văn Tâm" trong bảng dữ liệu
    const managerCells = screen.getAllByText('Nguyễn Văn Tâm');
    fireEvent.click(managerCells[0]);

    // Giá trị Nguyễn Văn Tâm lập tức được điền vào ô manager
    await waitFor(() => {
      expect(managerInput.value).toBe('Nguyễn Văn Tâm');
    });
  });

  it('hỗ trợ thu gọn cột HQ Terminal và mở lại bằng nút nổi', async () => {
    renderWithRouter('/cases/case-001/investigate');

    await waitFor(() => {
      expect(screen.getByText(/HQ Terminal/i)).toBeInTheDocument();
    });

    // Bấm nút thu gọn panel HQ
    const closeBtn = screen.getByTitle(/Thu gọn panel này/i);
    fireEvent.click(closeBtn);

    // HQ Terminal bị ẩn đi, xuất hiện nút nổi "Mở Báo Cáo HQ"
    await waitFor(() => {
      expect(screen.queryByText(/GỬI BÁO CÁO LÊN HQ/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Mở Báo Cáo HQ/i)).toBeInTheDocument();
    });

    // Bấm nút nổi để mở lại
    const triggerBtn = screen.getByText(/Mở Báo Cáo HQ/i);
    fireEvent.click(triggerBtn);

    // HQ Terminal xuất hiện trở lại
    await waitFor(() => {
      expect(screen.getByText(/GỬI BÁO CÁO LÊN HQ/i)).toBeInTheDocument();
    });
  });
});
