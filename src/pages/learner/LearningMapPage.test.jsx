import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LearningMapPage } from './LearningMapPage.jsx';
import { courseService, missionService } from '../../services/index.js';

vi.mock('../../services/index.js', () => ({
  courseService: {
    getCourses: vi.fn(),
    getChaptersByCourse: vi.fn(),
  },
  missionService: {
    getMissionsByChapter: vi.fn(),
  },
}));

const mockCourses = [
  {
    id: 'course-001',
    slug: 'excel-adventure',
    title: 'Excel Adventure Test',
    tool: 'excel',
    status: 'published',
  },
  {
    id: 'course-002',
    slug: 'sql-investigation',
    title: 'SQL Investigation Test',
    tool: 'sql',
    status: 'published',
  },
];

const mockChapters = [
  {
    id: 'ch-001',
    courseId: 'course-001',
    title: 'Chương 1: Những con số biết nói',
    description: 'Học cách tính toán cơ bản',
    orderIndex: 1,
    unlockRule: 'none',
  },
];

const mockMissions = [
  {
    id: 'mission-001',
    chapterId: 'ch-001',
    title: 'Nhiệm vụ 1: Doanh thu',
    objective: 'Tính tổng doanh thu',
    rewardXp: 100,
  },
];

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('LearningMapPage Component Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('hiển thị bản đồ học tập và danh sách bài học vụ án sau khi load thành công', async () => {
    courseService.getCourses.mockResolvedValue({ data: mockCourses, error: null });
    courseService.getChaptersByCourse.mockResolvedValue({ data: mockChapters, error: null });
    missionService.getMissionsByChapter.mockResolvedValue({ data: mockMissions, error: null });

    renderWithRouter(<LearningMapPage />);

    expect(screen.getByText('Bản Đồ Học Tập')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Chương 1: Những con số biết nói')).toBeInTheDocument();
      expect(screen.getByText('Nhiệm vụ 1: Doanh thu')).toBeInTheDocument();
      expect(screen.getAllByText('+100 XP').length).toBeGreaterThan(0);
    });
  });

  it('thay đổi khóa học qua selector dropdown', async () => {
    courseService.getCourses.mockResolvedValue({ data: mockCourses, error: null });
    courseService.getChaptersByCourse.mockResolvedValue({ data: mockChapters, error: null });
    missionService.getMissionsByChapter.mockResolvedValue({ data: mockMissions, error: null });

    renderWithRouter(<LearningMapPage />);

    await waitFor(() => {
      expect(screen.getByText('Chương 1: Những con số biết nói')).toBeInTheDocument();
    });

    const selector = screen.getByLabelText('Chọn khóa học');
    fireEvent.change(selector, { target: { value: 'course-002' } });

    await waitFor(() => {
      expect(courseService.getChaptersByCourse).toHaveBeenCalledWith('course-002');
    });
  });

  it('hiển thị ErrorState khi dịch vụ gặp lỗi', async () => {
    courseService.getCourses.mockResolvedValue({ data: mockCourses, error: null });
    courseService.getChaptersByCourse.mockResolvedValue({ data: null, error: 'Lỗi máy chủ bản đồ' });
    missionService.getMissionsByChapter.mockResolvedValue({ data: [], error: null });

    renderWithRouter(<LearningMapPage />);

    await waitFor(() => {
      expect(screen.getByText('Lỗi máy chủ bản đồ')).toBeInTheDocument();
    });
  });
});
