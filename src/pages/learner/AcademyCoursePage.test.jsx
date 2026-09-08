import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AcademyCoursePage } from './AcademyCoursePage.jsx';
import { knowledgeService } from '../../services/index.js';

// Mock useAuth
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-learner-1', uid: 'test-learner-1', name: 'Thám Tử Tập Sự' },
  })),
}));

describe('AcademyCoursePage Tests (Sprint 9.5 — Step 9.5.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAcademy = (initialEntries = ['/academy']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/academy" element={<AcademyCoursePage />} />
          <Route path="/academy/:courseSlug" element={<AcademyCoursePage />} />
          <Route path="/academy/:courseSlug/:topicId" element={<AcademyCoursePage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('1. Hiển thị đúng mục lục giáo trình W3Schools, tiêu đề khóa học và thanh tiến độ', async () => {
    renderAcademy();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excel Academy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /SQL Academy/i })).toBeInTheDocument();
      expect(screen.getByText(/Tiến độ khóa học/i)).toBeInTheDocument();
    });

    // Check chapters are visible
    expect(screen.getAllByText(/Chương 1: Các Hàm Tính Toán Căn Bản/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Chương 2: Thống Kê Có Điều Kiện & Logic/i)).toBeInTheDocument();

    // Check active lesson
    expect(screen.getByRole('heading', { level: 1, name: /Hàm SUM - Tính Tổng/i })).toBeInTheDocument();
  });

  it('2. Chuyển đổi giữa khóa học Excel Academy và SQL Academy', async () => {
    renderAcademy();

    await waitFor(() => {
      expect(screen.getByText('SQL Academy')).toBeInTheDocument();
    });

    // Click tab SQL Academy
    fireEvent.click(screen.getByText('SQL Academy'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Lệnh SELECT - Truy Vấn Cơ Bản/i })).toBeInTheDocument();
    });
  });

  it('3. Chọn bài học từ sidebar cập nhật bài đọc tương ứng', async () => {
    renderAcademy(['/academy/excel-academy']);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Hàm SUM - Tính Tổng/i })).toBeInTheDocument();
    });

    // Click vào bài học AVERAGE & COUNT trong sidebar (dùng role link bắt đầu bằng tiêu đề)
    const lessonLink = screen.getByRole('link', { name: /^Hàm AVERAGE & COUNT/i });
    fireEvent.click(lessonLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Hàm AVERAGE & COUNT - Thống Kê Cơ Bản/i })).toBeInTheDocument();
    });
  });

  it('4. Tương tác với Quick Checkpoint: báo sai khi chọn sai, cộng điểm và đánh dấu xong khi chọn đúng', async () => {
    const markSpy = vi.spyOn(knowledgeService, 'markTopicAsRead').mockResolvedValue({ data: { success: true } });

    renderAcademy(['/academy/excel-academy/topic-001']);

    await waitFor(() => {
      expect(screen.getByText(/Quick Checkpoint: Củng Cố Kiến Thức/i)).toBeInTheDocument();
      expect(screen.getByText(/Trong Excel, cú pháp nào sau đây dùng để tính tổng các ô từ D2 đến D9\?/i)).toBeInTheDocument();
    });

    // Chọn đáp án sai: A =TOTAL(D2:D9)
    const wrongOption = screen.getByRole('button', { name: /A =TOTAL\(D2:D9\)/i });
    fireEvent.click(wrongOption);

    // Bấm kiểm tra đáp án
    const submitBtn = screen.getByRole('button', { name: /Kiểm tra đáp án/i });
    fireEvent.click(submitBtn);

    // Báo chưa chính xác
    await waitFor(() => {
      expect(screen.getByText(/Chưa chính xác!/i)).toBeInTheDocument();
    });

    // Bấm làm lại câu hỏi
    const retryBtn = screen.getByRole('button', { name: /Làm lại câu hỏi/i });
    fireEvent.click(retryBtn);

    // Chọn đáp án đúng: B =SUM(D2:D9)
    const correctOption = screen.getByRole('button', { name: /B =SUM\(D2:D9\)/i });
    fireEvent.click(correctOption);

    // Submit lại
    const submitBtn2 = screen.getByRole('button', { name: /Kiểm tra đáp án/i });
    fireEvent.click(submitBtn2);

    // Báo chính xác và huy hiệu +20 XP
    await waitFor(() => {
      expect(screen.getByText(/Chính xác! Bạn đã nắm vững kiến thức bài này./i)).toBeInTheDocument();
      expect(screen.getByText(/^\+20 XP$/i)).toBeInTheDocument();
    });

    expect(markSpy).toHaveBeenCalledWith('test-learner-1', 'topic-001');
  });

  it('5. Thẻ Try it Yourself chứa liên kết chính xác sang /sandbox', async () => {
    renderAcademy(['/academy/excel-academy/topic-001']);

    await waitFor(() => {
      expect(screen.getByText(/Thực Hành Tương Tác: Try it Yourself/i)).toBeInTheDocument();
    });

    const tryItLink = screen.getByRole('link', { name: /Mở Thực Hành Ngay \(Try it Yourself\)/i });
    expect(tryItLink).toBeInTheDocument();
    expect(tryItLink.getAttribute('href')).toContain('/sandbox?tool=excel&topicId=topic-001');
  });

  it('6. Điều hướng tuần tự với nút "Bài tiếp theo" hoạt động chuẩn xác', async () => {
    renderAcademy(['/academy/excel-academy/topic-001']);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Hàm SUM - Tính Tổng/i })).toBeInTheDocument();
    });

    // Nút Bài tiếp theo
    const nextBtn = screen.getByRole('link', { name: /Bài tiếp theo: Hàm AVERAGE & COUNT/i });
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Hàm AVERAGE & COUNT - Thống Kê Cơ Bản/i })).toBeInTheDocument();
    });
  });
});
