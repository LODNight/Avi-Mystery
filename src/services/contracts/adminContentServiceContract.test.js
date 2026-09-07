import { describe, it, expect } from 'vitest';
import { adminContentServiceContract } from './adminContentService.js';
import { mockAdminContentService } from '../mock/mockAdminContentService.js';
import { assertImplementsContract } from './contractValidator.js';

describe('adminContentServiceContract Enforcement Tests', () => {
  it('d?m b?o contract g?c ném ngo?i l? Not Implemented khi g?i tr?c ti?p', async () => {
    await expect(adminContentServiceContract.getCourses()).rejects.toThrow('not implemented');
    await expect(adminContentServiceContract.saveMission({})).rejects.toThrow('not implemented');
    await expect(adminContentServiceContract.publishCourse('c1')).rejects.toThrow('not implemented');
  });

  it('d?m b?o mockAdminContentService tri?n khai d?y d? 100% các phuong th?c c?a contract', () => {
    expect(() => {
      assertImplementsContract(
        adminContentServiceContract,
        mockAdminContentService,
        'mockAdminContentService'
      );
    }).not.toThrow();

    // Verify each function exists
    const contractMethods = Object.keys(adminContentServiceContract).filter(
      (k) => typeof adminContentServiceContract[k] === 'function'
    );
    expect(contractMethods.length).toBeGreaterThanOrEqual(16);

    for (const method of contractMethods) {
      expect(typeof mockAdminContentService[method]).toBe('function');
    }
  });

  it('phát hi?n và ném ngo?i l? rõ ràng khi service b? thi?u phuong th?c b?t bu?c', () => {
    const brokenService = {
      getCourses: async () => {},
      // missing all other methods
    };

    expect(() => {
      assertImplementsContract(
        adminContentServiceContract,
        brokenService,
        'brokenService'
      );
    }).toThrow(/\[Contract Violation\] brokenService is missing required methods/);
  });
});
