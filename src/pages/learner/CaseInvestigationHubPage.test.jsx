import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaseInvestigationHubPage } from './CaseInvestigationHubPage.jsx';

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { id: 'user-001', name: 'Investigator' } }),
}));

describe('CaseInvestigationHubPage Component & Navigation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hiển thị Phòng Tiếp Nhận & Giao Ban Hồ Sơ Vụ Án tại /cases mà không tự động nhảy thẳng vào bàn thực hành', () => {
    render(
      <MemoryRouter initialEntries={['/cases']}>
        <Routes>
          <Route path="/cases" element={<CaseInvestigationHubPage />} />
          <Route path="/cases/:caseId" element={<CaseInvestigationHubPage />} />
          <Route path="/cases/:caseId/investigate" element={<div>WORKSPACE_SCREEN</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Không bị redirect thẳng sang WORKSPACE_SCREEN
    expect(screen.queryByText('WORKSPACE_SCREEN')).not.toBeInTheDocument();

    // Hiển thị tiêu đề trang và danh sách vụ án
    expect(screen.getByText(/Điều Tra Vụ Án Hiện Trường/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Đường Dây Buôn Lậu Cà Phê|Illegal Coffee Delivery/i).length).toBeGreaterThan(0);

    // Hiển thị Chỉ thị điều tra trọng tâm, Lộ trình phá án và Danh mục tang vật
    expect(screen.getByText(/CHỈ THỊ ĐIỀU TRA TRỌNG TÂM/i)).toBeInTheDocument();
    expect(screen.getByText(/LỘ TRÌNH PHÁ ÁN/i)).toBeInTheDocument();
    expect(screen.getAllByText(/DANH MỤC TANG VẬT/i).length).toBeGreaterThan(0);
  });

  it('chỉ chuyển vào Bàn Khám Nghiệm (/cases/:caseId/investigate) khi người chơi bấm nút Bắt Đầu Điều Tra', async () => {
    render(
      <MemoryRouter initialEntries={['/cases']}>
        <Routes>
          <Route path="/cases" element={<CaseInvestigationHubPage />} />
          <Route path="/cases/:caseId" element={<CaseInvestigationHubPage />} />
          <Route path="/cases/:caseId/investigate" element={<div>WORKSPACE_SCREEN</div>} />
        </Routes>
      </MemoryRouter>
    );

    const startBtn = screen.getByRole('button', { name: /Bắt đầu khám nghiệm hiện trường/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText('WORKSPACE_SCREEN')).toBeInTheDocument();
    });
  });
});
