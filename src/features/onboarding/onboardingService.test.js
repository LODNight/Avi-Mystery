import { describe, it, expect, beforeEach } from 'vitest';
import { onboardingService, ONBOARDING_STATUS } from './onboardingService.js';
import { storage } from '../../utils/storage.js';

const USER_A = 'user-test-001';
const USER_B = 'user-test-002';

describe('onboardingService — First-Run State (Step 6.5.1)', () => {
  // Dọn sạch storage trước mỗi test để đảm bảo independence
  beforeEach(() => {
    onboardingService.reset(USER_A);
    onboardingService.reset(USER_B);
  });

  // ─── Trạng thái mặc định ───────────────────────────────────────────────

  describe('getStatus — trạng thái mặc định', () => {
    it('trả về NOT_STARTED nếu chưa có record trong storage', () => {
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.NOT_STARTED);
    });

    it('trả về NOT_STARTED nếu userId không hợp lệ (null)', () => {
      expect(onboardingService.getStatus(null)).toBe(ONBOARDING_STATUS.NOT_STARTED);
    });

    it('trả về NOT_STARTED nếu userId không hợp lệ (undefined)', () => {
      expect(onboardingService.getStatus(undefined)).toBe(ONBOARDING_STATUS.NOT_STARTED);
    });

    it('trả về NOT_STARTED nếu userId là chuỗi rỗng', () => {
      expect(onboardingService.getStatus('')).toBe(ONBOARDING_STATUS.NOT_STARTED);
    });
  });

  // ─── Các chuyển đổi trạng thái hợp lệ ────────────────────────────────

  describe('setStatus — chuyển đổi hợp lệ', () => {
    it('NOT_STARTED → IN_PROGRESS (bắt đầu tutorial)', () => {
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      expect(result.error).toBeNull();
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
    });

    it('NOT_STARTED → SKIPPED (bỏ qua hướng dẫn)', () => {
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      expect(result.error).toBeNull();
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.SKIPPED);
    });

    it('IN_PROGRESS → COMPLETED (hoàn thành tutorial)', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      expect(result.error).toBeNull();
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.COMPLETED);
    });

    it('IN_PROGRESS → SKIPPED (bỏ qua giữa chừng)', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      expect(result.error).toBeNull();
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.SKIPPED);
    });

    it('IN_PROGRESS → IN_PROGRESS (idempotent — reload giữa tutorial)', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      expect(result.error).toBeNull();
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
    });
  });

  // ─── Trạng thái Terminal (COMPLETED & SKIPPED) ────────────────────────

  describe('setStatus — terminal state (COMPLETED & SKIPPED không thể thay đổi)', () => {
    it('COMPLETED → IN_PROGRESS bị từ chối (không thể replay để tránh duplicate XP)', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      expect(result.error).not.toBeNull();
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.COMPLETED);
    });

    it('COMPLETED → SKIPPED bị từ chối', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      expect(result.error).not.toBeNull();
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.COMPLETED);
    });

    it('COMPLETED → NOT_STARTED bị từ chối', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.NOT_STARTED);
      expect(result.error).not.toBeNull();
    });

    it('SKIPPED → IN_PROGRESS bị từ chối', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      expect(result.error).not.toBeNull();
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.SKIPPED);
    });

    it('SKIPPED → COMPLETED bị từ chối', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      const result = onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      expect(result.error).not.toBeNull();
    });
  });

  // ─── Validation ───────────────────────────────────────────────────────

  describe('setStatus — validation', () => {
    it('từ chối khi userId null', () => {
      const result = onboardingService.setStatus(null, ONBOARDING_STATUS.IN_PROGRESS);
      expect(result.error).not.toBeNull();
    });

    it('từ chối khi status không hợp lệ', () => {
      const result = onboardingService.setStatus(USER_A, 'INVALID_STATUS');
      expect(result.error).not.toBeNull();
      // State không thay đổi
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.NOT_STARTED);
    });
  });

  // ─── Helper functions ─────────────────────────────────────────────────

  describe('isEligibleForOnboarding — chỉ hiển thị Welcome Gate khi NOT_STARTED', () => {
    it('trả về true khi status là NOT_STARTED', () => {
      expect(onboardingService.isEligibleForOnboarding(USER_A)).toBe(true);
    });

    it('trả về false khi status là IN_PROGRESS', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      expect(onboardingService.isEligibleForOnboarding(USER_A)).toBe(false);
    });

    it('trả về false khi status là COMPLETED — không lặp lại Welcome Gate', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      expect(onboardingService.isEligibleForOnboarding(USER_A)).toBe(false);
    });

    it('trả về false khi status là SKIPPED — không lặp lại Welcome Gate', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      expect(onboardingService.isEligibleForOnboarding(USER_A)).toBe(false);
    });
  });

  describe('isTerminal — COMPLETED và SKIPPED là terminal', () => {
    it('NOT_STARTED không phải terminal', () => {
      expect(onboardingService.isTerminal(USER_A)).toBe(false);
    });

    it('IN_PROGRESS không phải terminal', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      expect(onboardingService.isTerminal(USER_A)).toBe(false);
    });

    it('COMPLETED là terminal', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      expect(onboardingService.isTerminal(USER_A)).toBe(true);
    });

    it('SKIPPED là terminal', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      expect(onboardingService.isTerminal(USER_A)).toBe(true);
    });
  });

  describe('isCompleted và isSkipped', () => {
    it('isCompleted trả về true chỉ khi COMPLETED', () => {
      expect(onboardingService.isCompleted(USER_A)).toBe(false);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      expect(onboardingService.isCompleted(USER_A)).toBe(true);
    });

    it('isSkipped trả về true chỉ khi SKIPPED', () => {
      expect(onboardingService.isSkipped(USER_A)).toBe(false);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      expect(onboardingService.isSkipped(USER_A)).toBe(true);
    });
  });

  // ─── Persistence (survive reload simulation) ──────────────────────────

  describe('Persistence — state tồn tại sau reload (storage)', () => {
    it('state được lưu vào localStorage và đọc lại chính xác', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);

      // Giả lập "reload": đọc lại từ storage giống như một instance mới
      const raw = storage.get(`onboarding:${USER_A}`);
      expect(raw).not.toBeNull();
      expect(raw.status).toBe(ONBOARDING_STATUS.IN_PROGRESS);
      expect(raw.updatedAt).toBeDefined();
    });

    it('getStatus đọc đúng trạng thái từ storage sau khi set', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      // Gọi lại getStatus — giống như sau reload
      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
    });
  });

  // ─── Cô lập theo userId ────────────────────────────────────────────────

  describe('User isolation — mỗi user có state riêng biệt', () => {
    it('USER_A và USER_B có state độc lập', () => {
      // Phải đi qua IN_PROGRESS trước (đúng theo state machine)
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.COMPLETED);
      onboardingService.setStatus(USER_B, ONBOARDING_STATUS.IN_PROGRESS);

      // Confirm USER_A không bị ảnh hưởng bởi USER_B và ngược lại
      expect(onboardingService.isCompleted(USER_A)).toBe(true);
      expect(onboardingService.getStatus(USER_B)).toBe(ONBOARDING_STATUS.IN_PROGRESS);
    });

    it('reset USER_A không ảnh hưởng USER_B', () => {
      onboardingService.setStatus(USER_A, ONBOARDING_STATUS.SKIPPED);
      // USER_B cần IN_PROGRESS trước khi COMPLETED
      onboardingService.setStatus(USER_B, ONBOARDING_STATUS.IN_PROGRESS);
      onboardingService.setStatus(USER_B, ONBOARDING_STATUS.COMPLETED);

      onboardingService.reset(USER_A);

      expect(onboardingService.getStatus(USER_A)).toBe(ONBOARDING_STATUS.NOT_STARTED);
      expect(onboardingService.isCompleted(USER_B)).toBe(true);
    });
  });
});
