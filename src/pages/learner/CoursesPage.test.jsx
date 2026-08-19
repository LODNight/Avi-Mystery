import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoursesPage } from './CoursesPage.jsx';
import { courseService } from '../../services/index.js';

// Mock courseService
vi.mock('../../services/index.js', () => ({
  courseService: {
    getCourses: vi.fn(),
  },
}));

const mockCoursesData = [
  {
    id: 'course-001',
    slug: 'excel-adventure',
    title: 'Excel Adventure',
    description: 'Khám phá sức mạnh của Excel',
    tool: 'excel',
    difficulty: 'beginner',
    estimatedDuration: 600,
    totalChapters: 3,
    totalMissions: 9,
    status: 'published',
  },
  {
    id: 'course-002',
    slug: 'sql-investigation',
    title: 'SQL Investigation',
    description: 'Trở thành thám tử dữ liệu với SQL',
    tool: 'sql',
    difficulty: 'beginner',
    estimatedDuration: 720,
    totalChapters: 3,
    totalMissions: 9,
    status: 'published',
  },
];

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('CoursesPage Component Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('hiển thị danh sách khóa học sau khi load dữ liệu thành công', async () => {
    courseService.getCourses.mockResolvedValueOnce({
      data: mockCoursesData,
      error: null,
    });

    renderWithRouter(<CoursesPage />);

    // Kiểm tra tiêu đề trang
    expect(screen.getByText('Danh Sách Khóa Học')).toBeInTheDocument();

    // Đợi tải dữ liệu hoàn tất
    await waitFor(() => {
      expect(screen.getByText('Excel Adventure')).toBeInTheDocument();
      expect(screen.getByText('SQL Investigation')).toBeInTheDocument();
    });
  });

  it('lọc danh sách khóa học theo từ khóa tìm kiếm', async () => {
    courseService.getCourses.mockResolvedValueOnce({
      data: mockCoursesData,
      error: null,
    });

    renderWithRouter(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Excel Adventure')).toBeInTheDocument();
    });

    // Nhập từ khóa SQL
    const searchInput = screen.getByPlaceholderText('Tìm kiếm khóa học, kỹ năng...');
    fireEvent.change(searchInput, { target: { value: 'SQL' } });

    expect(screen.getByText('SQL Investigation')).toBeInTheDocument();
    expect(screen.queryByText('Excel Adventure')).not.toBeInTheDocument();
  });

  it('lọc danh sách khóa học theo công cụ (Tool)', async () => {
    courseService.getCourses.mockResolvedValueOnce({
      data: mockCoursesData,
      error: null,
    });

    renderWithRouter(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Excel Adventure')).toBeInTheDocument();
    });

    // Lọc theo Excel
    const toolSelect = screen.getByLabelText('Lọc theo công cụ');
    fireEvent.change(toolSelect, { target: { value: 'excel' } });

    expect(screen.getByText('Excel Adventure')).toBeInTheDocument();
    expect(screen.queryByText('SQL Investigation')).not.toBeInTheDocument();
  });

  it('hiển thị EmptyState khi tìm kiếm không có kết quả và reset khi bấm nút', async () => {
    courseService.getCourses.mockResolvedValueOnce({
      data: mockCoursesData,
      error: null,
    });

    renderWithRouter(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Excel Adventure')).toBeInTheDocument();
    });

    // Nhập từ khóa không tồn tại
    const searchInput = screen.getByPlaceholderText('Tìm kiếm khóa học, kỹ năng...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentKeyword' } });

    expect(screen.getByText('Không tìm thấy khóa học phù hợp')).toBeInTheDocument();

    // Bấm nút xóa bộ lọc
    const resetButton = screen.getByRole('button', { name: 'Xóa bộ lọc' });
    fireEvent.click(resetButton);

    expect(screen.getByText('Excel Adventure')).toBeInTheDocument();
    expect(screen.getByText('SQL Investigation')).toBeInTheDocument();
  });

  it('hiển thị ErrorState khi dịch vụ gặp lỗi', async () => {
    courseService.getCourses.mockResolvedValueOnce({
      data: null,
      error: 'Không thể kết nối máy chủ',
    });

    renderWithRouter(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Không thể kết nối máy chủ')).toBeInTheDocument();
    });
  });
});
