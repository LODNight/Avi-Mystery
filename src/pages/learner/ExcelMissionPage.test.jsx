import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
});
