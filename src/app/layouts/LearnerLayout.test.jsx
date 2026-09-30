import { describe, expect, it } from 'vitest';
import { isLearnerNavPathActive } from './LearnerLayout.jsx';

describe('LearnerLayout route active matching', () => {
  it('match route chính xác và route con theo segment boundary', () => {
    expect(isLearnerNavPathActive('/courses', '/courses')).toBe(true);
    expect(isLearnerNavPathActive('/courses/excel-foundation', '/courses')).toBe(true);
    expect(isLearnerNavPathActive('/courses-archive', '/courses')).toBe(false);
  });

  it('ánh xạ mission workspace về Bản đồ học nhưng không match path gần giống', () => {
    expect(isLearnerNavPathActive('/missions/mission-001/workspace', '/map')).toBe(true);
    expect(isLearnerNavPathActive('/missions-archive', '/map')).toBe(false);
    expect(isLearnerNavPathActive('/maple', '/map')).toBe(false);
  });

  it('không coi route con giả của dashboard là active', () => {
    expect(isLearnerNavPathActive('/dashboard', '/dashboard')).toBe(true);
    expect(isLearnerNavPathActive('/dashboard-preview', '/dashboard')).toBe(false);
  });

  it('ánh xạ case investigation workspace về menu Vụ án', () => {
    expect(isLearnerNavPathActive('/cases/case-001/investigate', '/cases/case-001/investigate')).toBe(true);
    expect(isLearnerNavPathActive('/cases/case-002/investigate', '/cases/case-001/investigate')).toBe(true);
    expect(isLearnerNavPathActive('/cases-archive', '/cases/case-001/investigate')).toBe(false);
  });
});
