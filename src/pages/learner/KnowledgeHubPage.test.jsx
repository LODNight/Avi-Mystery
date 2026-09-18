import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { KnowledgeHubPage } from './KnowledgeHubPage.jsx';
import { knowledgeService, investigationNotebookService } from '../../services/index.js';

// Mock Auth Provider
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: { uid: 'test-detective-01', email: 'detective@avi.test' },
  }),
}));

describe('KnowledgeHubPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    investigationNotebookService.clearAllNotes();
  });

  const renderKnowledgeHub = (initialEntries = ['/knowledge/topic-001']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/knowledge" element={<KnowledgeHubPage />} />
          <Route path="/knowledge/:topicId" element={<KnowledgeHubPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('hiển thị danh mục tài liệu nghiệp vụ, tiêu đề bài học và con dấu điều tra', async () => {
    renderKnowledgeHub();

    // Kiểm tra header sidebar
    expect(await screen.findByText('Thư Viện Kiến Thức')).toBeInTheDocument();
    expect(screen.getByText(/TƯ LIỆU NGHIỆP VỤ/i)).toBeInTheDocument();

    // Kiểm tra danh mục bài học
    expect(screen.getByText('Công thức Excel')).toBeInTheDocument();
    expect(screen.getByText('Cú pháp SQL')).toBeInTheDocument();

    // Kiểm tra tiêu đề bài học hiển thị
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();

    // Kiểm tra con dấu nghiệp vụ
    expect(screen.getByTestId('investigation-stamp')).toBeInTheDocument();
  });

  it('hỗ trợ tìm kiếm bài học trong sidebar', async () => {
    renderKnowledgeHub();

    await screen.findByText('Thư Viện Kiến Thức');
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm công thức, cú pháp/i);

    fireEvent.change(searchInput, { target: { value: 'SUM' } });

    await waitFor(() => {
      expect(screen.getByText(/Tìm thấy/i)).toBeInTheDocument();
    });
  });

  it('hỗ trợ ghim và gỡ ghim bài học vào Sổ tay điều tra', async () => {
    renderKnowledgeHub();

    await screen.findByRole('heading', { level: 1 });

    const pinBtn = screen.getByRole('button', { name: /Ghim sổ tay/i });
    expect(pinBtn).toBeInTheDocument();

    // Click ghim
    fireEvent.click(pinBtn);
    expect(screen.getByText(/Đã ghim sổ tay/i)).toBeInTheDocument();

    // Click gỡ ghim
    fireEvent.click(screen.getByRole('button', { name: /Đã ghim sổ tay/i }));
    expect(screen.getByText(/Ghim sổ tay/i)).toBeInTheDocument();
  });

  it('mở drawer Sổ tay điều tra khi bấm "Mở sổ tay"', async () => {
    renderKnowledgeHub();

    await screen.findByRole('heading', { level: 1 });

    const openNotebookBtn = screen.getByRole('button', { name: /Mở sổ tay/i });
    fireEvent.click(openNotebookBtn);

    // Kiểm tra drawer mở
    expect(await screen.findByRole('heading', { name: /Sổ Tay Điều Tra/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Thêm ghi chép \/ manh mối cá nhân/i)).toBeInTheDocument();

    // Đóng drawer
    const closeBtn = screen.getByTitle(/Đóng sổ tay/i);
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Thêm ghi chép \/ manh mối cá nhân/i)).not.toBeInTheDocument();
    });
  });

  it('đánh dấu bài học đã hiểu và chuyển đổi trạng thái', async () => {
    renderKnowledgeHub();

    await screen.findByRole('heading', { level: 1 });

    const markReadBtn = screen.getByRole('button', { name: /Đánh dấu đã hiểu/i });
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đã hiểu bài học này/i)).toBeInTheDocument();
    });
  });
});
