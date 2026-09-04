import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LearningMapPage } from './LearningMapPage.jsx';
import {
  courseService,
  investigationService,
  missionService,
  progressService,
  authService,
  learningMapService,
} from '../../services/index.js';

vi.mock('../../services/index.js', async (importOriginal) => {
  const actualAdapter = await import('../../domain/learningMap/learningMapAdapter.js');
  return {
    courseService: {
      getCourses: vi.fn(),
      getChaptersByCourse: vi.fn(),
    },
    investigationService: {
      getInvestigationsByChapter: vi.fn(),
    },
    missionService: {
      getMissionsByChapter: vi.fn(),
    },
    authService: {
      getCurrentUser: vi.fn().mockResolvedValue({ data: { id: 'u1', name: 'Test' } }),
    },
    progressService: {
      listProgress: vi.fn(),
      getLearnerXp: vi.fn(),
      listSkillMastery: vi.fn(),
    },
    learningMapService: {
      getLearningMapTree: vi.fn(),
    },
    learningMapAdapter: actualAdapter,
  };
});

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

const mockChaptersExcel = [
  {
    id: 'ch-001',
    courseId: 'course-001',
    title: 'Chương 1: Excel Cơ Bản',
    description: 'Học cách tính toán cơ bản',
    orderIndex: 1,
    unlockRule: 'none',
  },
];

const mockChaptersSql = [
  {
    id: 'ch-002',
    courseId: 'course-002',
    title: 'Chương 1: SQL Fundamentals',
    description: 'Truy vấn dữ liệu cơ bản',
    orderIndex: 1,
    unlockRule: 'none',
  },
];

const mockMissionsExcel = [
  {
    id: 'mission-001',
    chapterId: 'ch-001',
    title: 'Nhiệm vụ Excel 1: Doanh thu',
    objective: 'Tính tổng doanh thu',
    rewardXp: 100,
    tool: 'excel',
  },
];

const mockMissionsSql = [
  {
    id: 'mission-002',
    chapterId: 'ch-002',
    title: 'Nhiệm vụ SQL 1: Filter Data',
    objective: 'Lọc thông tin vụ án',
    rewardXp: 200,
    tool: 'sql',
  },
];

const mockMasteryRecords = [
  { learnerId: 'user-001', skillId: 'excel_formula', masteryScore: 85, totalAttempts: 10, successfulAttempts: 9 },
];

const mockCourseViews = [
  {
    courseId: 'course-001',
    title: 'Excel Adventure Test',
    tool: 'excel',
    chapters: [
      {
        chapterId: 'ch-001',
        title: 'Chương 1: Excel Cơ Bản',
        description: 'Học cách tính toán cơ bản',
        order: 1,
        nodes: [
          {
            nodeId: 'mission-001',
            title: 'Nhiệm vụ Excel 1: Doanh thu',
            objective: 'Tính tổng doanh thu',
            rewardXp: 100,
            tool: 'excel',
            order: 1,
          },
        ],
      },
    ],
  },
  {
    courseId: 'course-002',
    title: 'SQL Investigation Test',
    tool: 'sql',
    chapters: [
      {
        chapterId: 'ch-002',
        title: 'Chương 1: SQL Fundamentals',
        description: 'Truy vấn dữ liệu cơ bản',
        order: 1,
        nodes: [
          {
            nodeId: 'mission-002',
            title: 'Nhiệm vụ SQL 1: Filter Data',
            objective: 'Lọc thông tin vụ án',
            rewardXp: 200,
            tool: 'sql',
            order: 1,
          },
        ],
      },
    ],
  },
];

import { AuthProvider } from '../../app/providers/AuthProvider.jsx';

function renderWithRouter(ui) {
  return render(
    <AuthProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthProvider>
  );
}

describe('LearningMapPage Component Tests (Step 6.3 Dynamic Progress & Mastery UX)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.getCurrentUser.mockResolvedValue({ data: { id: 'u1', name: 'Test' } });
    learningMapService.getLearningMapTree.mockResolvedValue({ data: mockCourseViews, error: null });
    courseService.getCourses.mockResolvedValue({ data: mockCourses, error: null });
    courseService.getChaptersByCourse.mockImplementation((courseId) => {
      if (courseId === 'course-001') return Promise.resolve({ data: mockChaptersExcel, error: null });
      return Promise.resolve({ data: mockChaptersSql, error: null });
    });
    investigationService.getInvestigationsByChapter.mockImplementation((chId) => {
      if (chId === 'ch-001') return Promise.resolve({ data: mockMissionsExcel, error: null });
      return Promise.resolve({ data: mockMissionsSql, error: null });
    });
    missionService.getMissionsByChapter.mockImplementation((chId) => {
      if (chId === 'ch-001') return Promise.resolve({ data: mockMissionsExcel, error: null });
      return Promise.resolve({ data: mockMissionsSql, error: null });
    });
    progressService.listProgress.mockResolvedValue({ data: [], error: null });
    progressService.getLearnerXp.mockResolvedValue({ data: { learnerId: 'user-001', totalXp: 500, history: [] }, error: null });
    progressService.listSkillMastery.mockResolvedValue({ data: mockMasteryRecords, error: null });
  });

  it('hiển thị bản đồ hành trình điều tra, thẻ Phase tab và Skill Mastery Summary card', async () => {
    renderWithRouter(<LearningMapPage />);

    await waitFor(() => {
      expect(screen.getByText('Bản Đồ Học Tập')).toBeInTheDocument();
      expect(screen.getAllByText('Phase 1: Excel Adventure Test').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Phase 2: SQL Investigation Test').length).toBeGreaterThan(0);
      expect(screen.getByText('Excel Cơ Bản')).toBeInTheDocument();
      expect(screen.getByText('Nhiệm vụ Excel 1: Doanh thu')).toBeInTheDocument();
      expect(screen.getByText('Độ Thành Thạo Kỹ Năng (Skill Mastery)')).toBeInTheDocument();
      expect(screen.getByText('Công thức Excel')).toBeInTheDocument();
    });
  });

  it('chuyển đổi giữa các Phase tab hiển thị nội dung chương vụ án tương ứng', async () => {
    renderWithRouter(<LearningMapPage />);

    // Wait for skeleton to resolve and content to appear
    const phase1Tabs = await screen.findAllByText('Phase 1: Excel Adventure Test', {}, { timeout: 4000 });
    expect(phase1Tabs.length).toBeGreaterThan(0);

    // Phase 2 tab must also be present
    const phase2Tabs = await screen.findAllByText('Phase 2: SQL Investigation Test', {}, { timeout: 4000 });
    expect(phase2Tabs.length).toBeGreaterThan(0);

    // Click Phase 2 Tab
    const phase2Button = phase2Tabs[phase2Tabs.length - 1].closest('button');
    fireEvent.click(phase2Button);

    await waitFor(() => {
      expect(screen.getByText('SQL Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Nhiệm vụ SQL 1: Filter Data')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('hiển thị ErrorState khi dịch vụ gặp lỗi', async () => {
    learningMapService.getLearningMapTree.mockResolvedValue({ data: null, error: 'Lỗi tải lộ trình' });

    renderWithRouter(<LearningMapPage />);

    await waitFor(() => {
      expect(screen.getByText('Lỗi tải lộ trình')).toBeInTheDocument();
    });
  });
});
