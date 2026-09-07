import { describe, it, expect, beforeEach } from 'vitest';
import { learningMapProjector, LEARNING_MAP_VIEWS_KEY } from './learningMapProjector.js';
import { storage } from '../../utils/storage.js';

describe('learningMapProjector Domain Tests', () => {
  beforeEach(() => {
    storage.remove(LEARNING_MAP_VIEWS_KEY);
  });

  it('projectCourse t?o ra Read Model cho khóa h?c published', () => {
    const course = { id: 'c-01', status: 'published', title: 'Khóa h?c SQL' };
    const chapters = [{ id: 'ch-01', courseId: 'c-01', status: 'published', title: 'Chuong 1' }];
    const missions = [{ id: 'm-01', chapterId: 'ch-01', status: 'published', title: 'Nhi?m v? 1' }];

    const view = learningMapProjector.projectCourse(course, chapters, missions);
    expect(view).toBeDefined();
    expect(view.courseId).toBe('c-01');
    expect(view.chapters).toHaveLength(1);
    expect(view.chapters[0].nodes).toHaveLength(1);
  });

  it('syncCourseProjection c?p nh?t dúng vào storage adapter', () => {
    const course = { id: 'c-01', status: 'published', title: 'Khóa h?c SQL' };
    const chapters = [{ id: 'ch-01', courseId: 'c-01', status: 'published', title: 'Chuong 1' }];
    const missions = [{ id: 'm-01', chapterId: 'ch-01', status: 'published', title: 'Nhi?m v? 1' }];

    const view = learningMapProjector.syncCourseProjection(course, chapters, missions, storage);
    expect(view).toBeDefined();

    const storedViews = storage.get(LEARNING_MAP_VIEWS_KEY);
    expect(storedViews).toHaveLength(1);
    expect(storedViews[0].courseId).toBe('c-01');
  });
});
