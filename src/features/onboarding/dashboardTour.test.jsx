import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../../pages/learner/DashboardPage.jsx';
import { LearnerLayout } from '../../app/layouts/LearnerLayout.jsx';
import { onboardingService, ONBOARDING_STATUS } from '../../services/index.js';
import { DASHBOARD_TOUR_STEPS } from './dashboardTourContent.js';
import { OnboardingSpotlight } from './OnboardingSpotlight.jsx';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../app/providers/ThemeProvider.jsx', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}));

vi.mock('../../hooks/usePageStatus.js', () => ({
  usePageStatus: () => ({
    getPageStatus: vi.fn(),
    adminBypass: false,
    toggleAdminBypass: vi.fn(),
  }),
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
        <Route path="/dashboard" element={<LearnerLayout><DashboardPage /></LearnerLayout>} />
        <Route path="/onboarding" element={<div>Welcome Gate Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Dashboard Deep Guided Tour (5-Step Tour with Sidebar & Close Behavior)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentMockUser = {
      id: `tour-user-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Thám Tử Test',
      role: 'learner',
    };
    onboardingService.reset(currentMockUser.id);
    onboardingService.resetDashboardTour(currentMockUser.id);
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);
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
    it('defines 5 steps with targets matching Sidebar and key Dashboard section IDs', () => {
      expect(DASHBOARD_TOUR_STEPS).toHaveLength(5);
      expect(DASHBOARD_TOUR_STEPS[0].targetId).toBe('app-sidebar');
      expect(DASHBOARD_TOUR_STEPS[1].targetId).toBe('dashboard-welcome-header');
      expect(DASHBOARD_TOUR_STEPS[2].targetId).toBe('dashboard-continue-investigation');
      expect(DASHBOARD_TOUR_STEPS[3].targetId).toBe('dashboard-active-courses');
      expect(DASHBOARD_TOUR_STEPS[4].targetId).toBe('dashboard-recommended-missions');
    });
  });

  // ── 3. Core Engine Prop Alias Normalization & Close Handlers ─────────────

  describe('OnboardingSpotlight Prop Normalization & Close Behavior', () => {
    it('renders step body when using "content" or "body" key', () => {
      const steps = [
        { targetId: 'test-el', title: 'Step Content Test', content: 'Văn bản sử dụng key content' },
        { target: '#test-el-2', title: 'Step Body Test', body: 'Văn bản sử dụng key body' },
      ];

      render(<OnboardingSpotlight isOpen={true} steps={steps} />);
      expect(screen.getByText('Văn bản sử dụng key content')).toBeInTheDocument();

      // Click next to test step 2
      fireEvent.click(screen.getByText(/Tiếp theo/i));
      expect(screen.getByText('Văn bản sử dụng key body')).toBeInTheDocument();
    });

    it('triggers onClose / onSkip when X button is clicked', () => {
      const handleClose = vi.fn();
      const steps = [
        { targetId: 'test-el', title: 'Close Test', content: 'Nội dung test đóng tour' },
      ];

      render(<OnboardingSpotlight isOpen={true} steps={steps} onClose={handleClose} />);
      const closeBtn = screen.getByRole('button', { name: /Đóng hướng dẫn/i });
      fireEvent.click(closeBtn);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('triggers dismiss callback when Escape key is pressed', () => {
      const handleSkip = vi.fn();
      const steps = [
        { targetId: 'test-el', title: 'Esc Test', content: 'Nội dung test phím esc' },
      ];

      render(<OnboardingSpotlight isOpen={true} steps={steps} onSkip={handleSkip} />);
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(handleSkip).toHaveBeenCalledTimes(1);
    });
  });

  // ── 4. Component Interactions ─────────────────────────────────────────────

  describe('DashboardPage Tour Spotlight Behavior', () => {
    it('auto-triggers tour spotlight on first dashboard visit starting with Sidebar step', async () => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });

      const { container } = renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/Thanh Điều Hướng Sidebar/i)).toBeInTheDocument();
      });

      // Target elements exist for steps
      expect(container.querySelector('#app-sidebar')).not.toBeNull();
      expect(container.querySelector('#dashboard-welcome-header')).not.toBeNull();
      expect(container.querySelector('#dashboard-continue-investigation')).not.toBeNull();
      expect(container.querySelector('#dashboard-active-courses')).not.toBeNull();
      expect(container.querySelector('#dashboard-recommended-missions')).not.toBeNull();
    });

    it('closes tour and marks seen when X button is clicked on Dashboard', async () => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/Thanh Điều Hướng Sidebar/i)).toBeInTheDocument();
      });

      const closeBtn = screen.getByRole('button', { name: /Đóng hướng dẫn/i });
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Thanh Điều Hướng Sidebar/i)).toBeNull();
      });

      expect(onboardingService.hasSeenDashboardTour(currentMockUser.id)).toBe(true);
    });

    it('does not auto-trigger tour spotlight if user has already seen it', async () => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
      onboardingService.markDashboardTourSeen(currentMockUser.id);

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText(/Chào mừng nhà điều tra/i)).toBeInTheDocument();
      });

      // Tour tooltip should not be rendered
      expect(screen.queryByText(/Thanh Điều Hướng Sidebar/i)).toBeNull();
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
        expect(screen.getByText(/Thanh Điều Hướng Sidebar/i)).toBeInTheDocument();
      });
    });
  });
});
