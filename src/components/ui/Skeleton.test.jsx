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
  CoursesSkeleton,
  CourseDetailSkeleton,
  LearningMapSkeleton,
  MissionIntroSkeleton,
  ExcelMissionSkeleton,
  SqlMissionSkeleton,
  PracticePageSkeleton,
  AchievementsSkeleton,
  ProfileSkeleton,
  ActivityHistorySkeleton,
  AdminOverviewSkeleton,
} from './Skeleton.jsx';

describe('Skeleton components — primitives', () => {
  it('renders Skeleton primitive with aria-hidden="true"', () => {
    const { container } = render(<Skeleton className="h-4 w-full" count={2} />);
    const elements = container.querySelectorAll('[aria-hidden="true"]');
    expect(elements.length).toBe(2);
  });

  it('renders SkeletonCard with aria-hidden and animate-pulse', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card.className).toContain('animate-pulse');
  });

  it('renders MissionCardSkeleton with flex layout', () => {
    const { container } = render(<MissionCardSkeleton />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card.className).toContain('flex');
  });

  it('renders AdminCourseCardSkeleton with flex layout', () => {
    const { container } = render(<AdminCourseCardSkeleton />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card.className).toContain('flex');
  });

  it('renders PageLoader with aria-busy', () => {
    const { getAllByRole } = render(<PageLoader />);
    const loaders = getAllByRole('status');
    expect(loaders[0]).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Skeleton components — page-level accessibility', () => {
  const pageLevelCases = [
    ['DashboardSkeleton', <DashboardSkeleton />],
    ['CoursesSkeleton', <CoursesSkeleton />],
    ['CourseDetailSkeleton', <CourseDetailSkeleton />],
    ['LearningMapSkeleton', <LearningMapSkeleton />],
    ['MissionIntroSkeleton', <MissionIntroSkeleton />],
    ['ExcelMissionSkeleton', <ExcelMissionSkeleton />],
    ['SqlMissionSkeleton', <SqlMissionSkeleton />],
    ['PracticePageSkeleton', <PracticePageSkeleton />],
    ['AchievementsSkeleton', <AchievementsSkeleton />],
    ['ProfileSkeleton', <ProfileSkeleton />],
    ['ActivityHistorySkeleton', <ActivityHistorySkeleton />],
    ['AdminOverviewSkeleton', <AdminOverviewSkeleton />],
  ];

  it.each(pageLevelCases)('%s renders without crashing', (_name, component) => {
    const { container } = render(component);
    expect(container.firstChild).toBeTruthy();
  });

  it.each(pageLevelCases)('%s has aria-busy="true" on container', (_name, component) => {
    const { container } = render(component);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });

  it.each(pageLevelCases)('%s has aria-label for screen readers', (_name, component) => {
    const { container } = render(component);
    expect(container.firstChild).toHaveAttribute('aria-label');
  });

  it.each(pageLevelCases)('%s uses animate-fade-in class', (_name, component) => {
    const { container } = render(component);
    expect(container.firstChild.className).toContain('animate-fade-in');
  });
});

describe('Skeleton — DashboardSkeleton and PageSkeleton legacy checks', () => {
  it('DashboardSkeleton has aria-busy region', () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });

  it('PageSkeleton renders without crashing', () => {
    const { container } = render(<PageSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });
});
