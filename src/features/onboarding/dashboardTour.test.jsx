import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../../pages/learner/DashboardPage.jsx';
import { onboardingService, ONBOARDING_STATUS } from '../../services/index.js';
import { DASHBOARD_TOUR_STEPS } from './dashboardTourContent.js';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../app/providers/ThemeProvider.jsx', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}));

vi.mock('../../hooks/useAsync.js', () => ({
  useAsync: () => ({
    execute: vi.fn(),
    loading: false,
    error: null,
    data: [],
  }),
}));

import { useAuth } from '../../hooks/useAuth.js';

let currentMockUser = { id: 'tour-user-001', name: 'Thám Tử Test', role: 'learner' };

function renderDashboardPage() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/onboarding" element={<div>Welcome Gate Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Dashboard Guided Tour (Step 6.6)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentMockUser = {
      id: `tour-user-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Thám Tử Test',
      role: 'learner',
    };
    onboardingService.reset(currentMockUser.id);
    onboardingService.resetDashboardTour(currentMockUser.id);
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.COMPLETED);
  });

  // ── 1. onboardingService Dashboard Tour State ─────────────────────────────

  describe('onboardingService Dashboard Tour Helpers', () => {
    it('hasSeenDashboardTour returns false initially and true after markDashboardTourSeen', () => {
      expect(onboardingService.hasSeenDashboardTour(currentMockUser.id)).toBe(false);

      onboardingService.markDashboardTourSeen(currentMockUser.id);
      expect(onboardingService.hasSeenDashboardTour(currentMockUser.id)).toBe(true);

      onboardingService.resetDashboardTour(currentMockUser.id);
      expect(onboardingService.hasSeenDashboardTour(currentMockUser.id)).toBe(false);
    });
  });

  // ── 2. Content Config ──────────────────────────────────────────────────────

  describe('dashboardTourContent Config', () => {
    it('defines 4 valid steps with targets matching Dashboard IDs', () => {
      expect(DASHBOARD_TOUR_STEPS).toHaveLength(4);
      expect(DASHBOARD_TOUR_STEPS[0].targetId).toBe('dashboard-welcome-header');
      expect(DASHBOARD_TOUR_STEPS[1].targetId).toBe('dashboard-continue-investigation');
      expect(DASHBOARD_TOUR_STEPS[2].targetId).toBe('dashboard-investigator-level');
      expect(DASHBOARD_TOUR_STEPS[3].targetId).toBe('dashboard-active-courses');
    });
  });

  // ── 3. Component Interactions ─────────────────────────────────────────────

  describe('DashboardPage Tour Spotlight Behavior', () => {
    it('auto-triggers tour spotlight on first dashboard visit', async () => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });

      const { container } = renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/Trung Tâm Điều Tra/i)).toBeInTheDocument();
      });

      // Target elements exist
      expect(container.querySelector('#dashboard-welcome-header')).not.toBeNull();
      expect(container.querySelector('#dashboard-continue-investigation')).not.toBeNull();
      expect(container.querySelector('#dashboard-investigator-level')).not.toBeNull();
      expect(container.querySelector('#dashboard-active-courses')).not.toBeNull();
    });

    it('does not auto-trigger tour spotlight if user has already seen it', async () => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
      onboardingService.markDashboardTourSeen(currentMockUser.id);

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/Chào mừng nhà điều tra/i)).toBeInTheDocument();
      });

      // Tour tooltip should not be rendered
      expect(screen.queryByText(/Chào mừng bạn đến với tổng hành dinh/i)).toBeNull();
    });

    it('allows re-triggering tour by clicking "Hướng dẫn Dashboard" button', async () => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
      onboardingService.markDashboardTourSeen(currentMockUser.id);

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/Hướng dẫn Dashboard/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Hướng dẫn Dashboard/i));

      await waitFor(() => {
        expect(screen.getByText(/Trung Tâm Điều Tra/i)).toBeInTheDocument();
      });
    });
  });
});
