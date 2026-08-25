import { storage } from '../../utils/storage.js';

/**
 * Onboarding Status Constants
 *
 * NOT_STARTED  — Người dùng mới, chưa thấy Welcome Gate.
 * IN_PROGRESS  — Đang trong luồng Tutorial Case 0.
 * COMPLETED    — Đã hoàn thành onboarding (terminal).
 * SKIPPED      — Đã bấm "Bỏ qua hướng dẫn" (terminal).
 */
export const ONBOARDING_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
});

/**
 * Terminal statuses — không thể chuyển sang trạng thái khác.
 * Đảm bảo Welcome Gate không lặp lại sau khi đã hoàn thành hoặc bỏ qua.
 */
const TERMINAL_STATUSES = new Set([
  ONBOARDING_STATUS.COMPLETED,
  ONBOARDING_STATUS.SKIPPED,
]);

/**
 * Chuyển đổi trạng thái hợp lệ.
 * Key: trạng thái hiện tại → Value: các trạng thái có thể chuyển đến.
 */
const VALID_TRANSITIONS = Object.freeze({
  [ONBOARDING_STATUS.NOT_STARTED]: new Set([
    ONBOARDING_STATUS.IN_PROGRESS,
    ONBOARDING_STATUS.SKIPPED,
  ]),
  [ONBOARDING_STATUS.IN_PROGRESS]: new Set([
    ONBOARDING_STATUS.COMPLETED,
    ONBOARDING_STATUS.SKIPPED,
    ONBOARDING_STATUS.IN_PROGRESS, // idempotent: cho phép ghi lại IN_PROGRESS
  ]),
  [ONBOARDING_STATUS.COMPLETED]: new Set(), // terminal
  [ONBOARDING_STATUS.SKIPPED]: new Set(),   // terminal
});

/**
 * Tạo storage key theo userId.
 * Mỗi user có state riêng biệt, không dùng chung.
 */
function buildStorageKey(userId) {
  return `onboarding:${userId}`;
}

/**
 * onboardingService — Single owner của onboarding state.
 *
 * Lưu state vào localStorage (thông qua storage.js) để sống sót sau reload.
 * Không ảnh hưởng đến learner progress, XP, hay submission state.
 */
export const onboardingService = {
  /**
   * Lấy trạng thái onboarding hiện tại của user.
   * Mặc định là NOT_STARTED nếu chưa có record.
   *
   * @param {string} userId
   * @returns {string} ONBOARDING_STATUS
   */
  getStatus(userId) {
    if (!userId || typeof userId !== 'string') {
      return ONBOARDING_STATUS.NOT_STARTED;
    }
    const record = storage.get(buildStorageKey(userId));
    const status = record?.status;
    // Validate stored value — chống corruption
    if (status && Object.values(ONBOARDING_STATUS).includes(status)) {
      return status;
    }
    return ONBOARDING_STATUS.NOT_STARTED;
  },

  /**
   * Cập nhật trạng thái onboarding của user.
   * Chỉ cho phép chuyển đổi hợp lệ theo VALID_TRANSITIONS.
   *
   * @param {string} userId
   * @param {string} newStatus — một trong ONBOARDING_STATUS
   * @returns {{ error: string|null }}
   */
  setStatus(userId, newStatus) {
    if (!userId || typeof userId !== 'string') {
      return { error: 'userId là bắt buộc.' };
    }
    if (!Object.values(ONBOARDING_STATUS).includes(newStatus)) {
      return { error: `Trạng thái không hợp lệ: "${newStatus}".` };
    }

    const currentStatus = this.getStatus(userId);

    // Kiểm tra transition hợp lệ
    const allowedNext = VALID_TRANSITIONS[currentStatus];
    if (!allowedNext.has(newStatus)) {
      return {
        error: `Không thể chuyển từ "${currentStatus}" sang "${newStatus}".`,
      };
    }

    storage.set(buildStorageKey(userId), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    return { error: null };
  },

  /**
   * Kiểm tra user có cần thấy Welcome Gate không.
   * Chỉ trả về true khi status = NOT_STARTED.
   *
   * @param {string} userId
   * @returns {boolean}
   */
  isEligibleForOnboarding(userId) {
    return this.getStatus(userId) === ONBOARDING_STATUS.NOT_STARTED;
  },

  /**
   * Kiểm tra user đã hoàn thành onboarding chưa.
   *
   * @param {string} userId
   * @returns {boolean}
   */
  isCompleted(userId) {
    return this.getStatus(userId) === ONBOARDING_STATUS.COMPLETED;
  },

  /**
   * Kiểm tra user đã bỏ qua onboarding chưa.
   *
   * @param {string} userId
   * @returns {boolean}
   */
  isSkipped(userId) {
    return this.getStatus(userId) === ONBOARDING_STATUS.SKIPPED;
  },

  /**
   * Kiểm tra trạng thái có phải terminal không.
   * Terminal = COMPLETED hoặc SKIPPED → không hiển thị Welcome Gate lại.
   *
   * @param {string} userId
   * @returns {boolean}
   */
  isTerminal(userId) {
    return TERMINAL_STATUSES.has(this.getStatus(userId));
  },

  /**
   * Reset state của user (dùng cho testing hoặc admin).
   * Không dùng trong luồng product thông thường.
   *
   * @param {string} userId
   */
  reset(userId) {
    if (!userId || typeof userId !== 'string') return;
    storage.remove(buildStorageKey(userId));
    storage.remove(`onboarding_dashboard_tour:${userId}`);
  },

  // ── Dashboard Tour Helpers (Step 6.6) ──────────────────────────────────

  /**
   * Kiểm tra user đã xem Dashboard Guided Tour chưa.
   *
   * @param {string} userId
   * @returns {boolean}
   */
  hasSeenDashboardTour(userId) {
    if (!userId || typeof userId !== 'string') return false;
    const record = storage.get(`onboarding_dashboard_tour:${userId}`);
    return Boolean(record?.seen);
  },

  /**
   * Đánh dấu user đã xem Dashboard Guided Tour.
   *
   * @param {string} userId
   */
  markDashboardTourSeen(userId) {
    if (!userId || typeof userId !== 'string') return;
    storage.set(`onboarding_dashboard_tour:${userId}`, {
      seen: true,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Reset trạng thái đã xem Dashboard Tour (cho phép xem lại tour).
   *
   * @param {string} userId
   */
  resetDashboardTour(userId) {
    if (!userId || typeof userId !== 'string') return;
    storage.remove(`onboarding_dashboard_tour:${userId}`);
  },
};
