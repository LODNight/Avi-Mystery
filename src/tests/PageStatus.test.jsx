import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { pageStatusService, DEFAULT_PAGE_STATUSES } from '../services/pageStatusService.js';
import { UnderMaintenancePage } from '../pages/learner/UnderMaintenancePage.jsx';
import { PageStatusProvider, usePageStatus } from '../app/providers/PageStatusProvider.jsx';
import { AuthProvider } from '../app/providers/AuthProvider.jsx';

describe('pageStatusService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });


  it('getAllStatuses returns default page configuration when storage is empty', () => {
    const statuses = pageStatusService.getAllStatuses();
    expect(statuses).toBeDefined();
    expect(statuses.length).toBeGreaterThan(0);
    const coursesPage = statuses.find((s) => s.id === 'courses');
    expect(coursesPage).toBeDefined();
    expect(coursesPage.status).toBe('active');
  });

  it('getByPath matches paths correctly', () => {
    const exactMatch = pageStatusService.getByPath('/courses');
    expect(exactMatch?.id).toBe('courses');

    const subPathMatch = pageStatusService.getByPath('/courses/pandas-deepdive');
    expect(subPathMatch?.id).toBe('courses');
  });

  it('updatePageStatus updates status and persists in localStorage', () => {
    const updated = pageStatusService.updatePageStatus(
      'courses',
      { status: 'maintenance', maintenanceTitle: 'Bảo trì Khóa học Test' },
      'Tester'
    );

    expect(updated).toBeDefined();
    expect(updated.status).toBe('maintenance');
    expect(updated.maintenanceTitle).toBe('Bảo trì Khóa học Test');
    expect(updated.updatedBy).toBe('Tester');

    const loaded = pageStatusService.getByPath('/courses');
    expect(loaded.status).toBe('maintenance');
  });

  it('setBulkStatus updates all pages simultaneously', () => {
    pageStatusService.setBulkStatus('maintenance', 'AdminTest');
    const all = pageStatusService.getAllStatuses();
    all.forEach((item) => {
      expect(item.status).toBe('maintenance');
    });
  });

  it('resetToDefaults restores original state', () => {
    pageStatusService.setBulkStatus('maintenance');
    const res = pageStatusService.resetToDefaults();
    expect(res.find((s) => s.id === 'courses').status).toBe('active');
  });
});

describe('UnderMaintenancePage Component Tests', () => {
  it('renders custom title, message, and estimated completion time', () => {
    const mockConfig = {
      id: 'courses',
      name: 'Khóa học',
      maintenanceTitle: 'Bảo trì nâng cấp bài học',
      maintenanceMessage: 'Thông điệp bảo trì thử nghiệm từ Admin',
      estimatedTime: '20:00 - 20/08/2026',
    };

    render(
      <MemoryRouter>
        <AuthProvider>
          <PageStatusProvider>
            <UnderMaintenancePage pageConfig={mockConfig} />
          </PageStatusProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Bảo trì nâng cấp bài học')).toBeDefined();
    expect(screen.getByText('Thông điệp bảo trì thử nghiệm từ Admin')).toBeDefined();
    expect(screen.getByText('20:00 - 20/08/2026')).toBeDefined();
    expect(screen.getByText('Về Trang tổng quan')).toBeDefined();
  });
});

