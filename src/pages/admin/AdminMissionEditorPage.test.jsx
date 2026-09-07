import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminMissionEditorPage } from './AdminMissionEditorPage.jsx';
import { mockAdminContentService } from '../../services/mock/mockAdminContentService.js';

function renderEditor(initialPath = '/admin/missions/new') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin/missions/new" element={<AdminMissionEditorPage />} />
        <Route path="/admin/missions/:missionId/edit" element={<AdminMissionEditorPage />} />
        <Route path="/admin/missions" element={<div>Missions List Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminMissionEditorPage Component Tests', () => {
  beforeEach(() => {
    mockAdminContentService.resetToDefaults();
  });

  it('hiển thị giao diện tạo mới vụ án với 4 tabs', async () => {
    renderEditor('/admin/missions/new');

    await waitFor(() => {
      expect(screen.getByText('Soạn thảo Vụ án mới')).toBeInTheDocument();
      expect(screen.getByText('1. Hồ sơ & Bối cảnh')).toBeInTheDocument();
      expect(screen.getByText('2. Cấu hình Workspace')).toBeInTheDocument();
      expect(screen.getByText('3. Bộ chấm điểm (Checker)')).toBeInTheDocument();
      expect(screen.getByText('4. Hệ thống gợi ý')).toBeInTheDocument();
    });
  });

  it('chuyển tab và hiển thị các trường cấu hình phù hợp', async () => {
    renderEditor('/admin/missions/new');

    await screen.findByText('1. Hồ sơ & Bối cảnh');

    // Click Tab 2
    fireEvent.click(screen.getByText('2. Cấu hình Workspace'));
    expect(screen.getByText(/Thiết lập Không gian làm việc/)).toBeInTheDocument();
    expect(screen.getByText(/Ô mục tiêu cần giải/)).toBeInTheDocument();

    // Click Tab 3
    fireEvent.click(screen.getByText('3. Bộ chấm điểm (Checker)'));
    expect(screen.getByText(/Cấu hình Bộ Chấm Điểm/)).toBeInTheDocument();
    expect(screen.getByText(/Các công thức hợp lệ được chấp nhận/)).toBeInTheDocument();

    // Click Tab 4
    fireEvent.click(screen.getByText('4. Hệ thống gợi ý'));
    expect(screen.getByText(/Hệ thống gợi ý nhiều cấp độ/)).toBeInTheDocument();
  });

  it('mở modal Sandbox Test Runner khi bấm nút "Chạy thử Sandbox"', async () => {
    renderEditor('/admin/missions/new');

    await screen.findByText('Soạn thảo Vụ án mới');

    const sandboxBtn = screen.getByText('Chạy thử Sandbox');
    fireEvent.click(sandboxBtn);

    await waitFor(() => {
      expect(screen.getByText('Sandbox Test Runner')).toBeInTheDocument();
      expect(screen.getByText('ISOLATED')).toBeInTheDocument();
    });

    // Close modal
    fireEvent.click(screen.getByText('Đóng Sandbox'));
    await waitFor(() => {
      expect(screen.queryByText('Sandbox Test Runner')).not.toBeInTheDocument();
    });
  });

  it('tải dữ liệu vụ án có sẵn khi vào chế độ chỉnh sửa', async () => {
    renderEditor('/admin/missions/mission-001/edit');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Vì sao doanh thu tháng 3 giảm?')).toBeInTheDocument();
      expect(screen.getByText('mission-001')).toBeInTheDocument();
    });
  });
});
