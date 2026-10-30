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

  it('hiển thị bố cục 2 cột rộng rãi: Hồ sơ (Trái) | Bàn khám nghiệm toàn màn hình (Phải) và mở HQ Terminal dưới dạng Dialog', async () => {
    renderWithRouter('/cases/case-001/investigate');

    // Chờ case load xong
    await waitFor(() => {
      expect(screen.getAllByText(/Đường Dây Buôn Lậu Cà Phê|Illegal Coffee Delivery/i).length).toBeGreaterThan(0);
    });

    // 1. Cột trái (Case File)
    expect(screen.getByText(/Tóm tắt vụ án|Briefing/i)).toBeInTheDocument();
    expect(screen.getByText(/Mục tiêu|Objective/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Nguồn|Sources/i).length).toBeGreaterThan(0);

    // 2. Vùng chính (Evidence Region) - tự động nạp nguồn đầu tiên
    await waitFor(() => {
      expect(screen.getAllByText(/Báo Cáo Xuất Kho|Warehouse Shipping Records/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/ORD-1842/i).length).toBeGreaterThan(0);
    });

    // 3. Mặc định HQ Dialog đóng để nhường toàn bộ không gian cho bàn khám nghiệm
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 4. Bấm nút mở HQ Dialog
    const triggerBtn = screen.getByText(/Mở Báo Cáo HQ/i);
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/HQ Terminal/i)).toBeInTheDocument();
      expect(screen.getByText(/GỬI BÁO CÁO LÊN HQ|Send Report to HQ/i)).toBeInTheDocument();
    });
  });

  it('tính năng Click-to-Fill: Chọn mục trong Báo Cáo HQ rồi click vào ô dữ liệu trên bảng tự động điền giá trị', async () => {
    renderWithRouter('/cases/case-001/investigate');

    await waitFor(() => {
      expect(screen.getAllByText(/ORD-1842/i).length).toBeGreaterThan(0);
    });

    // Mở HQ Dialog và chọn trường quản lý
    fireEvent.click(screen.getByText(/Mở Báo Cáo HQ/i));
    const managerInput = await screen.findByPlaceholderText(/Họ tên quản lý|Full name of the manager/i);
    fireEvent.click(managerInput);

    // Đóng dialog để chấm chọn trên bảng (hoặc bấm trực tiếp ô dữ liệu)
    fireEvent.click(screen.getByTitle(/Thu gọn panel này/i));

    // Click vào ô "Nguyễn Văn Tâm" trong bảng dữ liệu
    const managerCells = screen.getAllByText('Nguyễn Văn Tâm');
    fireEvent.click(managerCells[0]);

    // Mở lại HQ Dialog để kiểm tra giá trị đã được điền vào input quản lý
    fireEvent.click(screen.getByText(/Mở Báo Cáo HQ/i));

    await waitFor(() => {
      const updatedManagerInput = screen.getByPlaceholderText(/Họ tên quản lý|Full name of the manager/i);
      expect(updatedManagerInput.value).toBe('Nguyễn Văn Tâm');
    });
  });

  it('hỗ trợ mở và đóng HQ Terminal Dialog bằng nút đóng hoặc phím tắt', async () => {
    renderWithRouter('/cases/case-001/investigate');

    await waitFor(() => {
      expect(screen.getByText(/Mở Báo Cáo HQ/i)).toBeInTheDocument();
    });

    // Bấm nút nổi để mở HQ Dialog
    fireEvent.click(screen.getByText(/Mở Báo Cáo HQ/i));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/GỬI BÁO CÁO LÊN HQ/i)).toBeInTheDocument();
    });

    // Bấm nút đóng Dialog
    const closeBtn = screen.getByTitle(/Thu gọn panel này/i);
    fireEvent.click(closeBtn);

    // HQ Dialog đóng lại
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText(/Mở Báo Cáo HQ/i)).toBeInTheDocument();
    });
  });

  it('cho phép chuyển đổi sang tab Xử Lý Dữ Liệu (Data Processing Workspace)', async () => {
    renderWithRouter('/cases/case-001/investigate');

    await waitFor(() => {
      expect(screen.getByText(/Xử Lý Dữ Liệu|Data Processing/i)).toBeInTheDocument();
    });

    const processingTabBtn = screen.getByText(/Xử Lý Dữ Liệu|Data Processing/i);
    fireEvent.click(processingTabBtn);

    // Chuyển sang Data Processing Workspace
    await waitFor(() => {
      expect(screen.getByText(/Khảo Sát Dữ Liệu|Data Explorer/i)).toBeInTheDocument();
      expect(screen.getByText(/Ghi Nhận Manh Mối/i)).toBeInTheDocument();
    });
  });
});
