import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CourseDetailPage } from './CourseDetailPage.jsx';
import { courseService, missionService, progressService, authService } from '../../services/index.js';

import { AuthProvider } from '../../app/providers/AuthProvider.jsx';

vi.mock('../../services/index.js', () => ({
  authService: {
    getCurrentUser: vi.fn().mockResolvedValue({ data: { id: 'u1', name: 'Test' } }),
  },
  courseService: {
    getCourse: vi.fn(),
    getChaptersByCourse: vi.fn(),
  },
  missionService: {
    getMissionsByChapter: vi.fn(),
  },
  progressService: {
    listProgress: vi.fn().mockResolvedValue({ data: [], error: null }),
    getLearnerXp: vi.fn().mockResolvedValue({ data: { totalXp: 0 }, error: null }),
    listSkillMastery: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

const mockCourse = {
  id: 'course-001',
  slug: 'excel-adventure',
  title: 'Excel Adventure Test',
  description: 'Mô tả khóa học Excel thử nghiệm',
  tool: 'excel',
  difficulty: 'beginner',
  estimatedDuration: 600,
  totalChapters: 1,
  totalMissions: 2,
};

const mockChapters = [
  {
    id: 'ch-001',
    courseId: 'course-001',
    title: 'Chương 1: Những con số biết nói',
    description: 'Học cách tính toán cơ bản',
    orderIndex: 1,
  },
];

const mockMissions = [
  {
    id: 'mission-001',
    chapterId: 'ch-001',
    title: 'Vì sao doanh thu tháng 3 giảm?',
    objective: 'Tính tổng doanh thu tháng 3',
    rewardXp: 100,
    estimatedDuration: 15,
  },
];

function renderCourseDetail(slug = 'excel-adventure') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/courses/${slug}`]}>
        <Routes>
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('CourseDetailPage Component Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.getCurrentUser.mockResolvedValue({ data: { id: 'u1', name: 'Test' } });
    progressService.listProgress.mockResolvedValue({ data: [], error: null });
    progressService.getLearnerXp.mockResolvedValue({ data: { totalXp: 0 }, error: null });
    progressService.listSkillMastery.mockResolvedValue({ data: [], error: null });
  });

  it('hiển thị chi tiết khóa học và danh sách chương sau khi load thành công', async () => {
    courseService.getCourse.mockResolvedValueOnce({ data: mockCourse, error: null });
    courseService.getChaptersByCourse.mockResolvedValueOnce({ data: mockChapters, error: null });
    missionService.getMissionsByChapter.mockResolvedValueOnce({ data: mockMissions, error: null });

    renderCourseDetail();

    await waitFor(() => {
      expect(screen.getByText('Excel Adventure Test')).toBeInTheDocument();
      expect(screen.getByText('Mô tả khóa học Excel thử nghiệm')).toBeInTheDocument();
      expect(screen.getByText('Chương 1: Những con số biết nói')).toBeInTheDocument();
      expect(screen.getByText('Vì sao doanh thu tháng 3 giảm?')).toBeInTheDocument();
    });
  });

  it('ẩn/hiện danh sách nhiệm vụ khi đóng/mở chapter accordion', async () => {
    courseService.getCourse.mockResolvedValueOnce({ data: mockCourse, error: null });
    courseService.getChaptersByCourse.mockResolvedValueOnce({ data: mockChapters, error: null });
    missionService.getMissionsByChapter.mockResolvedValueOnce({ data: mockMissions, error: null });

    renderCourseDetail();

    await waitFor(() => {
      expect(screen.getByText('Vì sao doanh thu tháng 3 giảm?')).toBeInTheDocument();
    });

    // Bấm vào tiêu đề chương để đóng accordion
    const chapterButton = screen.getByRole('button', { name: /Chương 1: Những con số biết nói/i });
    fireEvent.click(chapterButton);

    expect(screen.queryByText('Vì sao doanh thu tháng 3 giảm?')).not.toBeInTheDocument();
  });

  it('hiển thị ErrorState khi không tìm thấy khóa học', async () => {
    courseService.getCourse.mockResolvedValueOnce({
      data: null,
      error: 'Không tìm thấy course "invalid-slug".',
    });

    renderCourseDetail('invalid-slug');

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy course "invalid-slug".')).toBeInTheDocument();
    });
  });

  it('tính toán và hiển thị tiến độ 100% và badge hoàn thành khi bài học đã completed', async () => {
    courseService.getCourse.mockResolvedValueOnce({ data: mockCourse, error: null });
    courseService.getChaptersByCourse.mockResolvedValueOnce({ data: mockChapters, error: null });
    missionService.getMissionsByChapter.mockResolvedValueOnce({ data: mockMissions, error: null });
    progressService.listProgress.mockResolvedValueOnce({
      data: [{ contentId: 'mission-001', status: 'completed' }],
      error: null,
    });

    renderCourseDetail();

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('1 / 1 bài')).toBeInTheDocument();
      expect(screen.getByText('Ôn tập lại khóa học')).toBeInTheDocument();
      expect(screen.getByText('Đã làm')).toBeInTheDocument();
    });
  });
});
