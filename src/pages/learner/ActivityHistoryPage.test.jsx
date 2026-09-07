import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityHistoryPage } from './ActivityHistoryPage.jsx';
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
      getFullHistory: vi.fn(),
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

const todayIso = new Date().toISOString();

const mockHistory = [
  {
    id: 'h1',
    type: 'mission',
    title: 'Vụ án 1: Doanh thu',
    timestamp: todayIso,
    xp: 120,
    link: '/missions/mission-001',
  },
  {
    id: 'h2',
    type: 'practice',
    title: 'Luyện tập: VLOOKUP',
    timestamp: todayIso,
    xp: 50,
    link: '/practice',
  },
];

describe('ActivityHistoryPage Component Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.getCurrentUser.mockResolvedValue({
      data: { id: 'u1', name: 'Sherlock Holmes' },
    });
    progressService.getFullHistory.mockResolvedValue({ data: mockHistory, error: null });
  });

  it('hiển thị lịch sử hoạt động và tổng số XP thu thập', async () => {
    renderWithProviders(<ActivityHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Lịch sử Hoạt động')).toBeInTheDocument();
      expect(screen.getByText('+170 XP')).toBeInTheDocument();
      expect(screen.getByText('Vụ án 1: Doanh thu')).toBeInTheDocument();
      expect(screen.getByText('Luyện tập: VLOOKUP')).toBeInTheDocument();
    });
  });

  it('lọc lịch sử theo loại hoạt động (Vụ án / Luyện tập)', async () => {
    renderWithProviders(<ActivityHistoryPage />);

    await screen.findByText('Vụ án 1: Doanh thu');

    const selectElements = screen.getAllByRole('combobox');
    const typeSelect = selectElements[0];

    fireEvent.change(typeSelect, { target: { value: 'mission' } });

    await waitFor(() => {
      expect(screen.getByText('Vụ án 1: Doanh thu')).toBeInTheDocument();
      expect(screen.queryByText('Luyện tập: VLOOKUP')).not.toBeInTheDocument();
      expect(screen.getAllByText(/\+120\s*XP/).length).toBeGreaterThanOrEqual(1);
    });
  });
});
