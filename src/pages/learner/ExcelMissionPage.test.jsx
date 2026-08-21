import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ExcelMissionPage } from './ExcelMissionPage.jsx';

describe('ExcelMissionPage Component Tests (LRN-EXCEL-002)', () => {
  it('hiển thị thông tin vụ án, FormulaBar và bảng tính SpreadsheetGrid sau khi load thành công', async () => {
    render(
      <MemoryRouter initialEntries={['/missions/mission-001/workspace']}>
        <Routes>
          <Route path="/missions/:missionId/workspace" element={<ExcelMissionPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Kiểm tra loading state
    expect(screen.getByLabelText(/đang tải dữ liệu bài học/i)).toBeInTheDocument();

    // Chờ load thành công
    await waitFor(() => {
      expect(screen.getByText(/Vì sao doanh thu tháng 3 giảm\?/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Mã vụ án: mission-001/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bảng dữ liệu Doanh thu Bán hàng/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i })).toBeInTheDocument();
    expect(screen.getByText('Chuột máy tính không dây')).toBeInTheDocument();
  });

  it('tự động tính toán kết quả khi người dùng gõ công thức =C2*D2 vào FormulaBar', async () => {
    render(
      <MemoryRouter initialEntries={['/missions/mission-001/workspace']}>
        <Routes>
          <Route path="/missions/:missionId/workspace" element={<ExcelMissionPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Vì sao doanh thu tháng 3 giảm\?/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const input = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
    fireEvent.change(input, { target: { value: '=C2*D2' } });

    // Kiểm tra ô E2 tự động hiển thị kết quả 450.000 ₫
    await waitFor(() => {
      expect(screen.getAllByText((content) => content.includes('450')).length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('bật/tắt thanh gợi ý và thực hiện đặt lại bảng tính qua ActionToolbar (Step 3.3)', async () => {
    render(
      <MemoryRouter initialEntries={['/missions/mission-001/workspace']}>
        <Routes>
          <Route path="/missions/:missionId/workspace" element={<ExcelMissionPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Vì sao doanh thu tháng 3 giảm\?/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Bấm mở bảng Gợi ý
    const hintBtn = screen.getByRole('button', { name: /Gợi ý/i });
    fireEvent.click(hintBtn);

    expect(screen.getByText(/Hệ thống Gợi ý Trinh thám/i)).toBeInTheDocument();

    // Bấm Đặt lại
    const resetBtn = screen.getByRole('button', { name: /Đặt lại/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đã đặt lại toàn bộ bảng tính/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('hiển thị ErrorState khi không tìm thấy missionId', async () => {
    render(
      <MemoryRouter initialEntries={['/missions/invalid-id/workspace']}>
        <Routes>
          <Route path="/missions/:missionId/workspace" element={<ExcelMissionPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Không tìm thấy mission "invalid-id"/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Thử lại/i)).toBeInTheDocument();
  });

  it('thực hiện nộp bài vụ án thành công và hiển thị MissionResultModal popup với +XP (Step 3.4)', async () => {
    render(
      <MemoryRouter initialEntries={['/missions/mission-001/workspace']}>
        <Routes>
          <Route path="/missions/:missionId/workspace" element={<ExcelMissionPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Vì sao doanh thu tháng 3 giảm\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Chuột máy tính không dây/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Nhập công thức đúng
    const input = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
    fireEvent.change(input, { target: { value: '=C2*D2' } });

    await waitFor(() => {
      expect(input).toHaveValue('=C2*D2');
    });

    // Bấm Nộp bài vụ án
    const submitBtn = screen.getByRole('button', { name: /Nộp bài vụ án/i });
    fireEvent.click(submitBtn);

    // Chờ async state updates của React flush đầy đủ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Phá Án Thành Công/i)).toBeInTheDocument();
    expect(screen.getByText(/Chúc Mừng Trinh Thám!/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\+100 XP/i).length).toBeGreaterThan(0);
  });
});
