import { describe, it, expect } from 'vitest';
import { mockCourseService } from './mockCourseService.js';

describe('mockCourseService Unit Tests', () => {
  it('getCourses trả về danh sách khóa học', async () => {
    const res = await mockCourseService.getCourses();
    expect(res.error).toBeNull();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('getCourses lọc đúng theo status', async () => {
    const res = await mockCourseService.getCourses({ status: 'published' });
    expect(res.error).toBeNull();
    expect(res.data.every((c) => c.status === 'published')).toBe(true);
  });

  it('getCourse trả về khóa học theo id hoặc slug', async () => {
    const res = await mockCourseService.getCourse('course-001');
    expect(res.error).toBeNull();
    expect(res.data.id).toBe('course-001');
  });

  it('getCourse trả về lỗi khi không tìm thấy khóa học', async () => {
    const res = await mockCourseService.getCourse('non-existent-course');
    expect(res.data).toBeNull();
    expect(res.error).toContain('Không tìm thấy');
  });

  it('getChaptersByCourse trả về các chương thuộc về courseId', async () => {
    const res = await mockCourseService.getChaptersByCourse('course-001');
    expect(res.error).toBeNull();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.every((ch) => ch.courseId === 'course-001')).toBe(true);
  });
});
