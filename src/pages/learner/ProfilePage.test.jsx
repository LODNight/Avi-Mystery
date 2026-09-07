import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from './ProfilePage.jsx';
import { progressService, authService } from '../../services/index.js';
import { AuthProvider } from '../../app/providers/AuthProvider.jsx';

vi.mock('../../services/index.js', async (importOriginal) => {
  return {
    authService: {
      getCurrentUser: vi.fn().mockResolvedValue({
        data: { id: 'u1', name: 'Sherlock Holmes', email: 'sherlock@avi.test', streak: 5, xp: 1200 },
      }),
    },
    progressService: {
      getLearnerXp: vi.fn(),
      listSkillMastery: vi.fn(),
      getFullHistory: vi.fn(),
      getLearnerAchievements: vi.fn(),
      listProgress: vi.fn(),
    },
  };
});

function renderWithProviders(ui) {
  return render(
    <AuthProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthProvider>
  );
}

const mockXpData = {
  learnerId: 'u1',
  totalXp: 1500,
  streakSummary: { currentStreak: 5 },
};

const mockMasteryData = [
  { skillId: 'excel_formula', name: 'Công thức Excel', masteryScore: 85 },
  { skillId: 'sql_query', name: 'Truy vấn SQL', masteryScore: 70 },
];

const mockHistoryData = [
  { id: 'h1', type: 'mission', title: 'Vụ án 1: Doanh thu', timestamp: new Date().toISOString(), xp: 100 },
  { id: 'h2', type: 'practice', title: 'Luyện tập: VLOOKUP', timestamp: new Date().toISOString(), xp: 50 },
];

const mockAchievementsData = [
  { id: 'a1', title: 'Bậc thầy Excel', isUnlocked: true },
  { id: 'a2', title: 'Truy vấn Siêu tốc', isUnlocked: false },
];

const mockProgressData = [
  { id: 'p1', status: 'completed', contentType: 'mission' },
  { id: 'p2', status: 'completed', contentType: 'practice' },
];

describe('ProfilePage Component Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.getCurrentUser.mockResolvedValue({
      data: { id: 'u1', name: 'Sherlock Holmes', email: 'sherlock@avi.test', streak: 5, xp: 1200 },
    });
    progressService.getLearnerXp.mockResolvedValue({ data: mockXpData, error: null });
    progressService.listSkillMastery.mockResolvedValue({ data: mockMasteryData, error: null });
    progressService.getFullHistory.mockResolvedValue({ data: mockHistoryData, error: null });
    progressService.getLearnerAchievements.mockResolvedValue({ data: mockAchievementsData, error: null });
    progressService.listProgress.mockResolvedValue({ data: mockProgressData, error: null });
  });

  it('hiển thị thông tin cá nhân học viên, danh hiệu, streak và tổng XP', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Sherlock Holmes')).toBeInTheDocument();
      expect(screen.getByText('sherlock@avi.test')).toBeInTheDocument();
      expect(screen.getByText('Chuỗi 5 ngày 🔥')).toBeInTheDocument();
      expect(screen.getByText('1.500 XP')).toBeInTheDocument();
    });
  });

  it('hiển thị chỉ số tổng quan Vụ án hoàn thành, Bài luyện tập, và Danh hiệu', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Vụ án hoàn thành')).toBeInTheDocument();
      expect(screen.getByText('Bài luyện tập')).toBeInTheDocument();
      expect(screen.getByText('Danh hiệu đạt được')).toBeInTheDocument();
    });
  });

  it('hiển thị phân tích kỹ năng Mastery Score', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Phân tích Kỹ năng (Mastery)')).toBeInTheDocument();
      expect(screen.getByText('Công thức Excel')).toBeInTheDocument();
      expect(screen.getByText('85/100')).toBeInTheDocument();
    });
  });

  it('thay đổi bộ lọc thời gian đóng góp Contribution Heatmap', async () => {
    renderWithProviders(<ProfilePage />);

    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: '6months' } });

    await waitFor(() => {
      expect(screen.getByText('lượt phá án trong')).toBeInTheDocument();
    });
  });
});
