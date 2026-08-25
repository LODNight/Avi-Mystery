import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TutorialCase0Page } from './TutorialCase0Page.jsx';
import { onboardingService, ONBOARDING_STATUS } from './onboardingService.js';
import { progressService } from '../../services/index.js';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../app/providers/ThemeProvider.jsx', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}));

import { useAuth } from '../../hooks/useAuth.js';

let currentMockUser = { id: 'test-user-001', name: 'Minh Test', role: 'learner' };

function renderTutorialPage(initialRoute = '/onboarding/case-0') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/onboarding/case-0" element={<TutorialCase0Page />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TutorialCase0Page Component Tests (Step 6.5.4)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentMockUser = {
      id: `test-user-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Minh Test',
      role: 'learner',
    };
    onboardingService.reset(currentMockUser.id);
  });

  // ─── Route Guards ─────────────────────────────────────────────────────────

  describe('Route Guard — redirects', () => {
    it('redirects to /login if unauthenticated', async () => {
      useAuth.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false });
      renderTutorialPage();
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('redirects to /dashboard if onboarding state is terminal (COMPLETED)', async () => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
      onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.COMPLETED);

      renderTutorialPage();

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });

    it('redirects to /dashboard if onboarding state is terminal (SKIPPED)', async () => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
      onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.SKIPPED);

      renderTutorialPage();

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  describe('Render — elements & spotlight target IDs', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
      onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);
    });

    it('renders briefing, formula bar, dataset grid and spotlight IDs', async () => {
      const { container } = renderTutorialPage();

      await waitFor(() => {
        expect(screen.getByText(/Tính doanh thu cho đơn hàng đầu tiên/i)).toBeInTheDocument();
        expect(screen.getByText(/50 XP/i)).toBeInTheDocument();
      });

      // Verify Spotlight target IDs exist
      expect(container.querySelector('#tutorial-briefing-panel')).not.toBeNull();
      expect(container.querySelector('#tutorial-dataset-grid')).not.toBeNull();
      expect(container.querySelector('#tutorial-formula-bar')).not.toBeNull();
      expect(container.querySelector('#tutorial-submit-btn')).not.toBeNull();
    });

    it('displays hint when clicking "Gợi ý đáp án"', async () => {
      renderTutorialPage();

      await waitFor(() => {
        expect(screen.getByText(/Gợi ý đáp án/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Gợi ý đáp án/i));

      await waitFor(() => {
        expect(screen.getByText(/Gõ =C2\*D2 vào ô E2/i)).toBeInTheDocument();
      });
    });
  });

  // ─── Submission Interactions ──────────────────────────────────────────────

  describe('Submission logic & state transitions', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
      onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);
    });

    it('submitting correct formula =C2*D2 marks status COMPLETED and displays success feedback', async () => {
      const { container } = renderTutorialPage();

      await waitFor(() => {
        expect(container.querySelector('#tutorial-submit-btn')).not.toBeNull();
      });

      // Type correct formula into formula input
      const formulaInput = screen.getByRole('textbox');
      fireEvent.change(formulaInput, { target: { value: '=C2*D2' } });

      // Click submit
      fireEvent.click(container.querySelector('#tutorial-submit-btn'));

      await waitFor(() => {
        expect(screen.getByText(/Đúng rồi!/i)).toBeInTheDocument();
        expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.COMPLETED);
        expect(screen.getByText(/Hoàn thành & Vào Dashboard/i)).toBeInTheDocument();
      });

      // Verify XP was awarded via progressService
      const xpRes = await progressService.getLearnerXp(currentMockUser.id);
      expect(xpRes.data.totalXp).toBe(50);
    });

    it('submitting correct formula multiple times awards XP idempotently (only once)', async () => {
      const { container } = renderTutorialPage();

      await waitFor(() => {
        expect(container.querySelector('#tutorial-submit-btn')).not.toBeNull();
      });

      const formulaInput = screen.getByRole('textbox');
      fireEvent.change(formulaInput, { target: { value: '=C2*D2' } });

      // Call awardXp twice for the same user and contentId
      await progressService.awardXp({
        learnerId: currentMockUser.id,
        contentId: 'tutorial_case_0',
        contentType: 'tutorial',
        mode: 'onboarding',
        submissionResult: { isCorrect: true, score: 100 },
        question: { xp: 50 },
      });

      const secondAward = await progressService.awardXp({
        learnerId: currentMockUser.id,
        contentId: 'tutorial_case_0',
        contentType: 'tutorial',
        mode: 'onboarding',
        submissionResult: { isCorrect: true, score: 100 },
        question: { xp: 50 },
      });

      expect(secondAward.data.xpAwarded).toBe(0);
      expect(secondAward.data.isFirstCompletion).toBe(false);

      const xpRes = await progressService.getLearnerXp(currentMockUser.id);
      expect(xpRes.data.totalXp).toBe(50);
    });

    it('submitting incorrect formula =C2+D2 shows error feedback and does not set COMPLETED', async () => {
      const { container } = renderTutorialPage();

      await waitFor(() => {
        expect(container.querySelector('#tutorial-submit-btn')).not.toBeNull();
      });

      const formulaInput = screen.getByRole('textbox');
      fireEvent.change(formulaInput, { target: { value: '=C2+D2' } });

      fireEvent.click(container.querySelector('#tutorial-submit-btn'));

      await waitFor(() => {
        expect(screen.getByText(/Chưa đúng/i)).toBeInTheDocument();
        expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
      });
    });

    it('clicking "Bỏ qua tutorial" sets status SKIPPED and redirects to /dashboard', async () => {
      renderTutorialPage();

      await waitFor(() => {
        expect(screen.getByText(/Bỏ qua tutorial/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Bỏ qua tutorial/i));

      await waitFor(() => {
        expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.SKIPPED);
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });
});
