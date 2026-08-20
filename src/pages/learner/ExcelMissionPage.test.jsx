import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ExcelMissionPage } from './ExcelMissionPage.jsx';
import { mockMissionService } from '../../services/mock/mockMissionService.js';

describe('ExcelMissionPage Component Tests', () => {
  it('hiển thị thông tin vụ án và dataset sau khi load thành công', async () => {
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
    });

    expect(screen.getByText(/Mã vụ án: mission-001/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bảng dữ liệu Doanh thu Bán hàng/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Spreadsheet Grid Workspace/i)).toBeInTheDocument();
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
    });

    expect(screen.getByText(/Thử lại/i)).toBeInTheDocument();
  });
});
