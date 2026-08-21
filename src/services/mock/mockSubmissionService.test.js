import { describe, it, expect, beforeEach } from 'vitest';
import { mockSubmissionService } from './mockSubmissionService.js';
import { storage } from '../../utils/storage.js';

describe('mockSubmissionService Unit Tests (Step 3.4)', () => {
  beforeEach(() => {
    storage.clear();
    // Giả lập session user
    storage.set('session', {
      id: 'user-001',
      name: 'Sherlock Learner',
      xp: 100,
      level: 1,
      xpToNextLevel: 1000,
    });
  });

  it('chấm điểm đúng khi người dùng nhập công thức chính xác =C2*D2', async () => {
    const res = await mockSubmissionService.submitExcelMission({
      userId: 'user-001',
      missionId: 'mission-001',
      userFormula: '=C2*D2',
      sheetData: { C2: 3, D2: 150000 },
      hintsUnlockedCount: 0,
    });

    expect(res.error).toBeNull();
    expect(res.data.isCorrect).toBe(true);
    expect(res.data.netXp).toBe(100);
    expect(res.data.feedback).toMatch(/chính xác/i);

    // Kiểm tra XP đã được cộng vào session
    const updatedUser = storage.get('session');
    expect(updatedUser.xp).toBe(200);
  });

  it('tính toán trừ điểm XP khi mở gợi ý trước khi nộp bài', async () => {
    const res = await mockSubmissionService.submitExcelMission({
      userId: 'user-001',
      missionId: 'mission-001',
      userFormula: '=C2*D2',
      sheetData: { C2: 3, D2: 150000 },
      hintsUnlockedCount: 2, // 2 gợi ý -> trừ 30 XP (100 - 30 = 70 XP)
    });

    expect(res.data.isCorrect).toBe(true);
    expect(res.data.netXp).toBe(70);
    expect(res.data.hintPenalty).toBe(30);

    const updatedUser = storage.get('session');
    expect(updatedUser.xp).toBe(170);
  });

  it('chấm điểm sai khi nhập công thức không chính xác', async () => {
    const res = await mockSubmissionService.submitExcelMission({
      userId: 'user-001',
      missionId: 'mission-001',
      userFormula: '=C2+D2',
      sheetData: { C2: 3, D2: 150000 },
      hintsUnlockedCount: 0,
    });

    expect(res.data.isCorrect).toBe(false);
    expect(res.data.netXp).toBe(0);
    expect(res.data.feedback).toBeDefined();

    // Session XP không thay đổi khi làm sai
    const currentUser = storage.get('session');
    expect(currentUser.xp).toBe(100);
  });

  it('tự động thăng cấp (Level Up) khi XP tích lũy vượt mốc level', async () => {
    storage.set('session', {
      id: 'user-001',
      name: 'Sherlock Learner',
      xp: 950,
      level: 1,
      xpToNextLevel: 1000,
    });

    const res = await mockSubmissionService.submitExcelMission({
      userId: 'user-001',
      missionId: 'mission-001',
      userFormula: '=C2*D2',
      sheetData: { C2: 3, D2: 150000 },
      hintsUnlockedCount: 0, // +100 XP -> 1050 XP (vượt 1000 -> Level 2)
    });

    expect(res.data.isCorrect).toBe(true);
    expect(res.data.userLevelUp).toBe(true);
    expect(res.data.updatedUser.level).toBe(2);
    expect(res.data.updatedUser.xpToNextLevel).toBe(2000);
  });

  it('trả về lỗi khi không tìm thấy mã mission', async () => {
    const res = await mockSubmissionService.submitExcelMission({
      userId: 'user-001',
      missionId: 'invalid-mission',
      userFormula: '=C2*D2',
    });

    expect(res.data).toBeNull();
    expect(res.error).toMatch(/Không tìm thấy/i);
  });
});
