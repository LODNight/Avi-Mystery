import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MissionIntroPage } from './MissionIntroPage.jsx';
import { missionService, courseService } from '../../services/index.js';

vi.mock('../../services/index.js', () => ({
  missionService: {
    getMission: vi.fn(),
  },
  courseService: {
    getCourse: vi.fn(),
  },
}));

const mockMission = {
  id: 'mission-001',
  chapterId: 'ch-001',
  courseId: 'course-001',
  title: 'Vì sao doanh thu tháng 3 giảm?',
  story: 'Giám đốc tài chính gọi điện cho bạn lúc 8 giờ sáng...',
  objective: 'Tính tổng doanh thu tháng 3 và so sánh với tháng 2.',
  tool: 'excel',
  difficulty: 'easy',
  estimatedDuration: 15,
  datasetId: 'ds-001',
  rewardXp: 100,
  orderIndex: 1,
  status: 'published',
  starterContent: {
    targetSheet: 'Sales',
    targetCell: 'B15',
    hint: 'Dùng hàm SUMIF',
  },
};

const mockCourse = {
  id: 'course-001',
  slug: 'excel-adventure',
  title: 'Excel Adventure Test',
};

function renderWithRouter(initialRoute = '/missions/mission-001') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/missions/:missionId" element={<MissionIntroPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MissionIntroPage Component Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('hiển thị thông tin hồ sơ vụ án, bối cảnh và mục tiêu sau khi load thành công', async () => {
    missionService.getMission.mockResolvedValue({ data: mockMission, error: null });
    courseService.getCourse.mockResolvedValue({ data: mockCourse, error: null });

    renderWithRouter('/missions/mission-001');

    await waitFor(() => {
      expect(screen.getByText('Vì sao doanh thu tháng 3 giảm?')).toBeInTheDocument();
      expect(screen.getByText(/Giám đốc tài chính gọi điện cho bạn/i)).toBeInTheDocument();
      expect(screen.getByText('Tính tổng doanh thu tháng 3 và so sánh với tháng 2.')).toBeInTheDocument();
      expect(screen.getAllByText(/100 XP/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('B15')).toBeInTheDocument();
    });
  });

  it('hiển thị ErrorState khi vụ án không tồn tại hoặc dịch vụ gặp lỗi', async () => {
    missionService.getMission.mockResolvedValue({ data: null, error: 'Không tìm thấy nhiệm vụ' });
    courseService.getCourse.mockResolvedValue({ data: null, error: null });

    renderWithRouter('/missions/invalid-id');

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy nhiệm vụ')).toBeInTheDocument();
    });
  });
});
