import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import {
  Skeleton,
  SkeletonCard,
  MissionCardSkeleton,
  AdminCourseCardSkeleton,
  StatCardSkeleton,
  DashboardSkeleton,
  PageSkeleton,
  PageLoader,
} from './Skeleton.jsx';

describe('Skeleton components & loading ARIA accessibility', () => {
  it('renders primitive Skeleton with aria-hidden="true"', () => {
    const { container } = render(<Skeleton className="h-4 w-full" count={2} />);
    const elements = container.querySelectorAll('[aria-hidden="true"]');
    expect(elements.length).toBe(2);
  });

  it('renders SkeletonCard preserving course card layout with aria-hidden="true"', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card.className).toContain('rounded-2xl');
    expect(card.className).toContain('animate-pulse');
  });

  it('renders MissionCardSkeleton preserving recommended mission card geometry', () => {
    const { container } = render(<MissionCardSkeleton />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card.className).toContain('rounded-2xl');
    expect(card.className).toContain('flex');
  });

  it('renders AdminCourseCardSkeleton preserving admin course card geometry', () => {
    const { container } = render(<AdminCourseCardSkeleton />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card.className).toContain('rounded-2xl');
    expect(card.className).toContain('flex');
  });

  it('renders DashboardSkeleton with aria-busy="true"', () => {
    const { getByRole } = render(<DashboardSkeleton />);
    const region = getByRole('region');
    expect(region).toHaveAttribute('aria-busy', 'true');
  });

  it('renders PageSkeleton with aria-busy="true"', () => {
    const { getByRole } = render(<PageSkeleton />);
    const region = getByRole('region');
    expect(region).toHaveAttribute('aria-busy', 'true');
  });

  it('renders PageLoader with aria-busy="true"', () => {
    const { getAllByRole } = render(<PageLoader />);
    const loaders = getAllByRole('status');
    expect(loaders[0]).toHaveAttribute('aria-busy', 'true');
  });
});
