import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementsPage } from './AchievementsPage.jsx';
import { progressService, authService } from '../../services/index.js';
import { AuthProvider } from '../../app/providers/AuthProvider.jsx';

vi.mock('../../services/index.js', async (importOriginal) => {
  return {
    authService: {
      getCurrentUser: vi.fn().mockResolvedValue({
        data: { id: 'u1', name: 'Sherlock Holmes' },
      }),
    },
    progressService: {
      getLearnerAchievements: vi.fn(),
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

const mockAchievements = [
  {
    id: 'first-step',
    title: 'Bước Chân Đầu Tiên',
    description: 'Hoàn thành vụ án đầu tiên của bạn.',
    rarity: 'common',
    icon: 'target',
    isUnlocked: true,
    unlockedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'excel-master',
    title: 'Bậc Thầy Excel',
    description: 'Giải mã 10 câu hỏi công thức Excel nâng cao.',
    rarity: 'epic',
    icon: 'file-spreadsheet',
    isUnlocked: false,
    currentProgress: 3,
    maxProgress: 10,
  },
];

describe('AchievementsPage Component Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.getCurrentUser.mockResolvedValue({
      data: { id: 'u1', name: 'Sherlock Holmes' },
    });
    progressService.getLearnerAchievements.mockResolvedValue({ data: mockAchievements, error: null });
  });

  it('hiển thị danh hiệu thám tử và tỷ lệ tiến trình hoàn thành', async () => {
    renderWithProviders(<AchievementsPage />);

    await waitFor(() => {
      expect(screen.getByText('Danh hiệu Thám tử')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('/ 2')).toBeInTheDocument();
      expect(screen.getByText('Bước Chân Đầu Tiên')).toBeInTheDocument();
      expect(screen.getByText('Bậc Thầy Excel')).toBeInTheDocument();
    });
  });

  it('lọc danh hiệu theo trạng thái Đã mở khóa và Chưa đạt', async () => {
    renderWithProviders(<AchievementsPage />);

    await screen.findByText('Bước Chân Đầu Tiên');

    // Click "Đã mở khóa" filter
    const unlockedBtn = screen.getByRole('button', { name: 'Đã mở khóa' });
    fireEvent.click(unlockedBtn);

    await waitFor(() => {
      expect(screen.getByText('Bước Chân Đầu Tiên')).toBeInTheDocument();
      expect(screen.queryByText('Bậc Thầy Excel')).not.toBeInTheDocument();
    });

    // Click "Chưa đạt" filter
    const lockedBtn = screen.getByRole('button', { name: 'Chưa đạt' });
    fireEvent.click(lockedBtn);

    await waitFor(() => {
      expect(screen.queryByText('Bước Chân Đầu Tiên')).not.toBeInTheDocument();
      expect(screen.getByText('Bậc Thầy Excel')).toBeInTheDocument();
    });
  });
});
