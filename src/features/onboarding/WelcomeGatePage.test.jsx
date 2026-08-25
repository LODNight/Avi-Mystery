import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WelcomeGatePage } from './WelcomeGatePage.jsx';
import { onboardingService, ONBOARDING_STATUS } from './onboardingService.js';

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock useAuth để kiểm soát trạng thái authentication trong tests
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

// Mock useTheme để tránh lỗi context thiếu ThemeProvider
vi.mock('../../app/providers/ThemeProvider.jsx', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}));

import { useAuth } from '../../hooks/useAuth.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_USER = { id: 'test-user-001', name: 'Minh Test', role: 'learner' };

function renderWelcomePage(initialRoute = '/onboarding') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/onboarding" element={<WelcomeGatePage />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/onboarding/case-0" element={<div>Tutorial Case 0</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('WelcomeGatePage Component Tests (Step 6.5.2)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Dọn sạch onboarding state sau mỗi test
    onboardingService.reset(MOCK_USER.id);
  });

  // ─── Redirect guards ──────────────────────────────────────────────────────

  describe('Route Guard — redirect khi không đủ điều kiện', () => {
    it('redirect về /login khi chưa authenticated', async () => {
      useAuth.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false });

      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('hiển thị spinner khi đang load auth', () => {
      useAuth.mockReturnValue({ user: null, isLoading: true, isAuthenticated: false });

      renderWelcomePage();

      // Loading state: spinner hiển thị, không có content chính
      expect(screen.queryByText(/Bắt đầu khóa huấn luyện/i)).not.toBeInTheDocument();
    });

    it('redirect về /dashboard khi onboarding đã COMPLETED', async () => {
      useAuth.mockReturnValue({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
      // Setup: user đã hoàn thành
      onboardingService.setStatus(MOCK_USER.id, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(MOCK_USER.id, ONBOARDING_STATUS.COMPLETED);

      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });

    it('redirect về /dashboard khi onboarding đã SKIPPED', async () => {
      useAuth.mockReturnValue({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
      onboardingService.setStatus(MOCK_USER.id, ONBOARDING_STATUS.SKIPPED);

      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });

  // ─── Render nội dung chính ────────────────────────────────────────────────

  describe('Render — hiển thị nội dung Welcome Gate', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
    });

    it('hiển thị tên user trong lời chào', async () => {
      renderWelcomePage();

      await waitFor(() => {
        // getByRole('heading') dùng để tránh match nhầm span bên trong
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(/Chào mừng/i);
        expect(heading).toHaveTextContent(/Test!/i);
      });
    });

    it('hiển thị CTA "Bắt đầu khóa huấn luyện"', async () => {
      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Bắt đầu khóa huấn luyện/i })).toBeInTheDocument();
      });
    });

    it('hiển thị nút bỏ qua', async () => {
      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByText(/Bỏ qua, tôi đã có kinh nghiệm/i)).toBeInTheDocument();
      });
    });

    it('hiển thị thông tin vụ án tutorial', async () => {
      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByText(/Vụ án #00/i)).toBeInTheDocument();
        // XP có thể xuất hiện nhiều chỗ (badge + step) — dùng getAllByText
        expect(screen.getAllByText(/50 XP/i).length).toBeGreaterThan(0);
      });
    });

    it('hiển thị logo brand và theme toggle', async () => {
      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByText(/avi/i)).toBeInTheDocument();
        expect(screen.getByText(/mystery/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });
    });
  });

  // ─── Interactions ─────────────────────────────────────────────────────────

  describe('Interaction — CTA clicks', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
    });

    it('click "Bắt đầu" → set IN_PROGRESS và redirect /onboarding/case-0', async () => {
      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Bắt đầu khóa huấn luyện/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Bắt đầu khóa huấn luyện/i }));

      await waitFor(() => {
        // onboarding state phải là IN_PROGRESS
        expect(onboardingService.getStatus(MOCK_USER.id)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
        // Đã navigate đến case-0
        expect(screen.getByText('Tutorial Case 0')).toBeInTheDocument();
      });
    });

    it('click "Bỏ qua" → set SKIPPED và redirect /dashboard', async () => {
      renderWelcomePage();

      await waitFor(() => {
        expect(screen.getByText(/Bỏ qua, tôi đã có kinh nghiệm/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Bỏ qua, tôi đã có kinh nghiệm/i));

      await waitFor(() => {
        // onboarding state phải là SKIPPED
        expect(onboardingService.getStatus(MOCK_USER.id)).toBe(ONBOARDING_STATUS.SKIPPED);
        // Đã navigate đến dashboard
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });
});
