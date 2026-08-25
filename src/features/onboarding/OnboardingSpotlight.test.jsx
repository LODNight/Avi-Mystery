import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OnboardingSpotlight } from './OnboardingSpotlight.jsx';

const MOCK_STEPS = [
  {
    id: 'step-1',
    target: '#target-1',
    title: 'Bước 1: Hướng dẫn 1',
    body: 'Nội dung bước 1',
  },
  {
    id: 'step-2',
    target: '#target-2',
    title: 'Bước 2: Hướng dẫn 2',
    body: 'Nội dung bước 2',
  },
];

describe('OnboardingSpotlight Component Tests (Step 6.5.5)', () => {
  it('không hiển thị khi isOpen = false', () => {
    render(<OnboardingSpotlight steps={MOCK_STEPS} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hiển thị dialog và thông tin bước đầu tiên khi isOpen = true', () => {
    render(<OnboardingSpotlight steps={MOCK_STEPS} isOpen={true} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Bước 1: Hướng dẫn 1')).toBeInTheDocument();
    expect(screen.getByText('Nội dung bước 1')).toBeInTheDocument();
    expect(screen.getByText('Tiếp theo')).toBeInTheDocument();
  });

  it('chuyển bước khi click nút "Tiếp theo" và "Trước"', () => {
    render(<OnboardingSpotlight steps={MOCK_STEPS} isOpen={true} />);

    // Bước 1 → Bước 2
    fireEvent.click(screen.getByText('Tiếp theo'));
    expect(screen.getByText('Bước 2: Hướng dẫn 2')).toBeInTheDocument();
    expect(screen.getByText('Nội dung bước 2')).toBeInTheDocument();
    expect(screen.getByText('Bắt đầu làm')).toBeInTheDocument();

    // Quay lại Bước 1
    fireEvent.click(screen.getByText('Truớc'));
    expect(screen.getByText('Bước 1: Hướng dẫn 1')).toBeInTheDocument();
  });

  it('gọi onComplete khi click "Bắt đầu làm" ở bước cuối cùng', () => {
    const handleComplete = vi.fn();
    render(<OnboardingSpotlight steps={MOCK_STEPS} isOpen={true} onComplete={handleComplete} />);

    // Chuyển sang bước cuối
    fireEvent.click(screen.getByText('Tiếp theo'));

    // Click Bắt đầu làm
    fireEvent.click(screen.getByText('Bắt đầu làm'));
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('gọi onSkip khi click nút đóng (X)', () => {
    const handleSkip = vi.fn();
    render(<OnboardingSpotlight steps={MOCK_STEPS} isOpen={true} onSkip={handleSkip} />);

    fireEvent.click(screen.getByLabelText('Đóng hướng dẫn'));
    expect(handleSkip).toHaveBeenCalledTimes(1);
  });

  it('gọi onSkip khi nhấn phím Escape', () => {
    const handleSkip = vi.fn();
    render(<OnboardingSpotlight steps={MOCK_STEPS} isOpen={true} onSkip={handleSkip} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleSkip).toHaveBeenCalledTimes(1);
  });

  it('chuyển bước khi nhấn phím ArrowRight và ArrowLeft', () => {
    render(<OnboardingSpotlight steps={MOCK_STEPS} isOpen={true} />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Bước 2: Hướng dẫn 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('Bước 1: Hướng dẫn 1')).toBeInTheDocument();
  });
});
