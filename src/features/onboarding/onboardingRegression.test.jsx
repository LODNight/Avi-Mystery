import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WelcomeGatePage } from './WelcomeGatePage.jsx';
import { TutorialCase0Page } from './TutorialCase0Page.jsx';
import { onboardingService, ONBOARDING_STATUS, progressService } from '../../services/index.js';
import { DashboardPage } from '../../pages/learner/DashboardPage.jsx';

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

let currentMockUser = { id: 'test-user-reg-001', name: 'Thám Tử Test', role: 'learner' };

function renderAppAtRoute(initialRoute = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/onboarding" element={<WelcomeGatePage />} />
        <Route path="/onboarding/case-0" element={<TutorialCase0Page />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/courses" element={<div>Courses Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Sprint 6.5 — Onboarding Regression Test Suite (Step 6.5.7 & 6.5.8)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentMockUser = {
      id: `reg-user-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Thám Tử Test',
      role: 'learner',
    };
    onboardingService.reset(currentMockUser.id);
  });

  // ── 1. New Learner Flow ────────────────────────────────────────────────────

  it('1. New Learner: accessing /dashboard when NOT_STARTED redirects to /onboarding', async () => {
    useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });

    renderAppAtRoute('/dashboard');

    await waitFor(() => {
      expect(screen.getByText(/Nhà điều tra mới gia nhập/i)).toBeInTheDocument();
      expect(screen.getByText(/Bắt đầu khóa huấn luyện/i)).toBeInTheDocument();
    });
  });

  // ── 2. Skip Flow ───────────────────────────────────────────────────────────

  it('2. Skip Flow: clicking "Bỏ qua tutorial" sets SKIPPED status and redirects to /dashboard', async () => {
    useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });

    renderAppAtRoute('/onboarding');

    await waitFor(() => {
      expect(screen.getByText(/Bỏ qua, tôi đã có kinh nghiệm/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Bỏ qua, tôi đã có kinh nghiệm/i));

    await waitFor(() => {
      expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.SKIPPED);
      expect(screen.getByText(/Chào mừng nhà điều tra/i)).toBeInTheDocument();
    });
  });

  // ── 3. Start & Complete Flow ───────────────────────────────────────────────

  it('3. Complete Flow: start onboarding -> solve Case 0 -> receive XP -> handoff to Dashboard', async () => {
    useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });

    // Step A: Welcome Gate -> Click start
    const { container } = renderAppAtRoute('/onboarding');

    await waitFor(() => {
      expect(screen.getByText(/Bắt đầu khóa huấn luyện/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Bắt đầu khóa huấn luyện/i));

    await waitFor(() => {
      expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
      expect(screen.getByText(/Vụ án #00/i)).toBeInTheDocument();
    });

    // Step B: Submit correct formula =C2*D2
    const formulaInput = screen.getByRole('textbox');
    fireEvent.change(formulaInput, { target: { value: '=C2*D2' } });

    const submitBtn = container.querySelector('#tutorial-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đúng rồi!/i)).toBeInTheDocument();
      expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.COMPLETED);
    });

    // Check XP awarded
    const xpRes = await progressService.getLearnerXp(currentMockUser.id);
    expect(xpRes.data.totalXp).toBe(50);

    // Step C: Click completion button -> Handoff to Dashboard
    fireEvent.click(screen.getByText(/Hoàn thành & Vào Dashboard/i));

    await waitFor(() => {
      expect(screen.getByText(/Chào mừng nhà điều tra/i)).toBeInTheDocument();
      expect(screen.getByText(/Đã hoàn thành Huấn luyện nhập môn/i)).toBeInTheDocument();
    });
  });

  // ── 4. Terminal State Return Guard ────────────────────────────────────────

  it('4. Return Guard: navigating to /onboarding after COMPLETED redirects straight to /dashboard', async () => {
    useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.COMPLETED);

    renderAppAtRoute('/onboarding');

    await waitFor(() => {
      expect(screen.getByText(/Chào mừng nhà điều tra/i)).toBeInTheDocument();
    });
  });

  // ── 5. Reload Persistence ─────────────────────────────────────────────────

  it('5. Reload Persistence: state remains IN_PROGRESS across page reload/remount', async () => {
    useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);

    // Initial mount
    const { unmount } = renderAppAtRoute('/onboarding/case-0');
    await waitFor(() => {
      expect(screen.getByText(/Vụ án #00/i)).toBeInTheDocument();
    });

    // Simulate page reload by unmounting and remounting
    unmount();

    renderAppAtRoute('/onboarding/case-0');
    await waitFor(() => {
      expect(screen.getByText(/Vụ án #00/i)).toBeInTheDocument();
      expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
    });
  });

  // ── 6. Fail -> Retry Flow ──────────────────────────────────────────────────

  it('6. Fail -> Retry: wrong formula shows feedback without completing, correct formula completes successfully', async () => {
    useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);

    const { container } = renderAppAtRoute('/onboarding/case-0');

    await waitFor(() => {
      expect(container.querySelector('#tutorial-submit-btn')).not.toBeNull();
    });

    const formulaInput = screen.getByRole('textbox');
    const submitBtn = container.querySelector('#tutorial-submit-btn');

    // Attempt 1: Wrong formula
    fireEvent.change(formulaInput, { target: { value: '=C2+D2' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Chưa đúng/i)).toBeInTheDocument();
      expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
    });

    // Attempt 2: Correct formula
    fireEvent.change(formulaInput, { target: { value: '=C2*D2' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đúng rồi!/i)).toBeInTheDocument();
      expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.COMPLETED);
    });
  });

  // ── 7. Replay / Reset Flow ─────────────────────────────────────────────────

  it('7. Replay Flow: resetting onboarding state allows re-entering tutorial without double XP', async () => {
    useAuth.mockReturnValue({ user: currentMockUser, isLoading: false, isAuthenticated: true });
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.COMPLETED);

    // Initial completion awards 50 XP
    await progressService.awardXp({
      learnerId: currentMockUser.id,
      contentId: 'tutorial_case_0',
      contentType: 'tutorial',
      mode: 'onboarding',
      submissionResult: { isCorrect: true, score: 100 },
      question: { xp: 50 },
    });

    // Reset onboarding state to replay
    onboardingService.reset(currentMockUser.id);
    expect(onboardingService.getStatus(currentMockUser.id)).toBe(ONBOARDING_STATUS.NOT_STARTED);

    // Start again
    onboardingService.setStatus(currentMockUser.id, ONBOARDING_STATUS.IN_PROGRESS);

    // Submit again
    const secondAward = await progressService.awardXp({
      learnerId: currentMockUser.id,
      contentId: 'tutorial_case_0',
      contentType: 'tutorial',
      mode: 'onboarding',
      submissionResult: { isCorrect: true, score: 100 },
      question: { xp: 50 },
    });

    // Idempotency prevents secondary XP gain
    expect(secondAward.data.xpAwarded).toBe(0);
    const xpRes = await progressService.getLearnerXp(currentMockUser.id);
    expect(xpRes.data.totalXp).toBe(50);
  });
});
