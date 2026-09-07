import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FocusLayout, useFocusMode } from './FocusLayout.jsx';

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'user-001', name: 'Sherlock Holmes', xp: 250 },
  }),
}));

vi.mock('../providers/ThemeProvider.jsx', () => ({
  useTheme: vi.fn().mockReturnValue({
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('../providers/BrandProvider.jsx', () => ({
  useBrand: vi.fn().mockReturnValue({
    brand: { brandName: 'Avi-Mystery' },
  }),
  BrandLogoIcon: () => <span data-testid="brand-icon">Logo</span>,
}));

function ConsumerProbe() {
  const { isFocusMode, toggleFocusMode } = useFocusMode();
  return (
    <div>
      <span data-testid="focus-state">{isFocusMode ? 'focus-on' : 'focus-off'}</span>
      <button type="button" onClick={toggleFocusMode} data-testid="child-toggle">
        Toggle from child
      </button>
    </div>
  );
}

describe('FocusLayout Component Tests', () => {
  it('hiển thị đầy đủ thanh Top App Bar với thương hiệu, XP và avatar', () => {
    render(
      <MemoryRouter>
        <FocusLayout>
          <div>Workspace Content</div>
        </FocusLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Rời bàn làm việc')).toBeInTheDocument();
    expect(screen.getByText('Avi-Mystery')).toBeInTheDocument();
    expect(screen.getByText('250 XP')).toBeInTheDocument();
    expect(screen.getByText('SH')).toBeInTheDocument();
    expect(screen.getByText('FOCUS MODE')).toBeInTheDocument();
    expect(screen.getByText('Workspace Content')).toBeInTheDocument();
  });

  it('cho phép bật/tắt Chế độ tập trung (Focus Mode) và đồng bộ qua useFocusMode hook', () => {
    render(
      <MemoryRouter>
        <FocusLayout>
          <ConsumerProbe />
        </FocusLayout>
      </MemoryRouter>
    );

    // Mặc định Focus Mode tắt
    expect(screen.getByTestId('focus-state')).toHaveTextContent('focus-off');
    const toggleButton = screen.getByRole('button', { name: /FOCUS MODE/i });

    // Bật Focus Mode
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('focus-state')).toHaveTextContent('focus-on');
    expect(screen.getByText('FOCUS ON')).toBeInTheDocument();

    // Tắt Focus Mode
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('focus-state')).toHaveTextContent('focus-off');
    expect(screen.getByText('FOCUS MODE')).toBeInTheDocument();
  });
});
