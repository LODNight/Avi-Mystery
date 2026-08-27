import {
  createLearnerProgressKey,
  createInitialProgress,
  recordAttemptProgress,
  PROGRESS_STATUS,
  CONTENT_TYPES,
} from '../../domain/progress/learnerProgress.js'
import {
  calculateXpReward,
  createXpTransaction,
  applyXpTransaction,
} from '../../domain/reward/rewardEvaluator.js'
import {
  createLearnerMasteryKey,
  createInitialMastery,
  evaluateSkillMastery,
} from '../../domain/mastery/masteryEvaluator.js'
import { getMockLearnerAchievements, ACHIEVEMENTS_DATA } from '../../domain/profile/achievements.js'
import { PROGRESS_ERROR_CODES } from '../contracts/progressService.js'

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}

const DEFAULT_MOCK_MASTERY = [
  { learnerId: 'user-001', skillId: 'excel_formula', masteryScore: 85, totalAttempts: 10, successfulAttempts: 9, lastAssessedAt: new Date().toISOString(), history: [] },
  { learnerId: 'user-001', skillId: 'sql_query', masteryScore: 60, totalAttempts: 5, successfulAttempts: 3, lastAssessedAt: new Date().toISOString(), history: [] },
  { learnerId: 'user-001', skillId: 'data_analysis', masteryScore: 40, totalAttempts: 4, successfulAttempts: 2, lastAssessedAt: new Date().toISOString(), history: [] },
]

export function createMockProgressService({ initialRecords = [], initialXpRecords = [], initialMasteryRecords = [] } = {}) {
  // In-memory progress store keyed by composite `${learnerId}:${contentId}`
  const progressMap = new Map()
  // In-memory XP store keyed by `learnerId`
  const xpMap = new Map()
  // In-memory Mastery store keyed by `${learnerId}:${skillId}`
  const masteryMap = new Map()

  for (const record of initialRecords) {
    const key = createLearnerProgressKey(record.learnerId, record.contentId)
    progressMap.set(key, clone(record))
  }

  for (const xpRecord of initialXpRecords) {
    xpMap.set(xpRecord.learnerId, clone(xpRecord))
  }

  for (const masteryRecord of initialMasteryRecords) {
    const key = createLearnerMasteryKey(masteryRecord.learnerId, masteryRecord.skillId)
    masteryMap.set(key, clone(masteryRecord))
  }

  return {
    async getProgress(learnerId, contentId) {
      if (!learnerId || typeof learnerId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }
      if (!contentId || typeof contentId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'contentId là bắt buộc.' } }
      }

      const key = createLearnerProgressKey(learnerId, contentId)
      const record = progressMap.get(key)

      if (!record) {
        // Return default unstarted record
        const initial = createInitialProgress({ learnerId, contentId })
        return { data: clone(initial), error: null }
      }

      return { data: clone(record), error: null }
    },

    async listProgress(learnerId, contentType = null) {
      if (!learnerId || typeof learnerId !== 'string') {
        return { data: [], error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }

      const records = []
      for (const record of progressMap.values()) {
        if (record.learnerId === learnerId) {
          if (!contentType || record.contentType === contentType) {
            records.push(clone(record))
          }
        }
      }

      return { data: records, error: null }
    },

    async recordAttempt(request) {
      if (!request || typeof request !== 'object') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'Yêu cầu không hợp lệ.' } }
      }
      const { learnerId, contentId, contentType, mode = 'main_quest', isCorrect, score, timestamp } = request

      if (!learnerId || typeof learnerId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }
      if (!contentId || typeof contentId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'contentId là bắt buộc.' } }
      }

      const key = createLearnerProgressKey(learnerId, contentId)
      const existingRecord = progressMap.get(key) || null

      const updatedRecord = recordAttemptProgress(
        existingRecord,
        { isCorrect, score },
        { learnerId, contentId, contentType },
        timestamp || new Date().toISOString()
      )
      updatedRecord.lastMode = mode

      progressMap.set(key, updatedRecord)
      return { data: clone(updatedRecord), error: null }
    },

    async awardXp(request) {
      if (!request || typeof request !== 'object') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'Yêu cầu không hợp lệ.' } }
      }
      const { learnerId, contentId, contentType, mode = 'main_quest', submissionResult, question, hintsUsed = 0 } = request

      if (!learnerId || typeof learnerId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }
      if (!contentId || typeof contentId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'contentId là bắt buộc.' } }
      }
      if (!submissionResult || typeof submissionResult !== 'object') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'submissionResult là bắt buộc.' } }
      }

      const key = createLearnerProgressKey(learnerId, contentId)
      const existingProgress = progressMap.get(key) || null

      // First completion check: status must not be 'completed' prior to this request
      const isFirstCompletion = existingProgress ? existingProgress.status !== PROGRESS_STATUS.COMPLETED : true

      // Update progress record
      const updatedProgress = recordAttemptProgress(
        existingProgress,
        submissionResult,
        { learnerId, contentId, contentType },
        new Date().toISOString()
      )
      updatedProgress.lastMode = mode
      progressMap.set(key, updatedProgress)

      // Calculate XP Reward based on explicit rules
      const xpReward = calculateXpReward({
        question,
        submissionResult,
        isFirstCompletion,
        hintsUsed,
      })

      // Idempotently apply transaction to learner XP ledger
      const existingXp = xpMap.get(learnerId) || { learnerId, totalXp: 0, history: [] }
      const transaction = createXpTransaction({
        learnerId,
        contentId,
        attemptId: submissionResult.attemptId || 'attempt-001',
        xpAmount: xpReward.xpAwarded,
        reason: xpReward.reason,
      })

      const updatedXp = applyXpTransaction(existingXp, transaction)
      xpMap.set(learnerId, updatedXp)

      // Auto-update Skill Mastery if question defines a skillId
      const skillId = question?.skillId || question?.skill
      if (skillId) {
        const masteryKey = createLearnerMasteryKey(learnerId, skillId)
        const currentMastery = masteryMap.get(masteryKey) || null
        const updatedMastery = evaluateSkillMastery(
          currentMastery,
          {
            questionId: contentId,
            isCorrect: Boolean(submissionResult.isCorrect),
            score: submissionResult.score || (submissionResult.isCorrect ? 100 : 0),
          },
          { learnerId, skillId }
        )
        masteryMap.set(masteryKey, updatedMastery)
      }

      return {
        data: {
          progress: clone(updatedProgress),
          xpAwarded: xpReward.xpAwarded,
          totalXp: updatedXp.totalXp,
          isFirstCompletion,
          reason: xpReward.reason,
        },
        error: null,
      }
    },

    async getLearnerXp(learnerId) {
      if (!learnerId || typeof learnerId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }

      const xpRecord = xpMap.get(learnerId) || { learnerId, totalXp: 0, history: [] }
      return { data: clone(xpRecord), error: null }
    },

    async getSkillMastery(learnerId, skillId) {
      if (!learnerId || typeof learnerId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }
      if (!skillId || typeof skillId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'skillId là bắt buộc.' } }
      }

      const key = createLearnerMasteryKey(learnerId, skillId)
      const record = masteryMap.get(key)

      if (!record) {
        const initial = createInitialMastery({ learnerId, skillId })
        return { data: clone(initial), error: null }
      }

      return { data: clone(record), error: null }
    },

    async listSkillMastery(learnerId) {
      if (!learnerId || typeof learnerId !== 'string') {
        return { data: [], error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }

      const records = []
      for (const record of masteryMap.values()) {
        if (record.learnerId === learnerId) {
          records.push(clone(record))
        }
      }

      return { data: records, error: null }
    },

    async recordMasteryAssessment(request) {
      if (!request || typeof request !== 'object') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'Yêu cầu không hợp lệ.' } }
      }
      const { learnerId, skillId, questionId, isCorrect, score, timestamp } = request

      if (!learnerId || typeof learnerId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }
      if (!skillId || typeof skillId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'skillId là bắt buộc.' } }
      }

      const key = createLearnerMasteryKey(learnerId, skillId)
      const currentMastery = masteryMap.get(key) || null

      const updatedMastery = evaluateSkillMastery(
        currentMastery,
        { questionId, isCorrect, score },
        { learnerId, skillId },
        timestamp || new Date().toISOString()
      )

      masteryMap.set(key, updatedMastery)
      return { data: clone(updatedMastery), error: null }
    },

    async getLearnerAchievements(learnerId) {
      if (!learnerId || typeof learnerId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }

      // Merge user progress with static definition
      const userAchievements = getMockLearnerAchievements(learnerId)
      
      const merged = ACHIEVEMENTS_DATA.map(badge => {
        const userProgress = userAchievements.find(a => a.achievementId === badge.id)
        return {
          ...badge,
          isUnlocked: userProgress?.isUnlocked || false,
          currentProgress: userProgress?.currentProgress || 0,
          unlockedAt: userProgress?.unlockedAt || null,
        }
      })

      return { data: merged, error: null }
    },

    async getFullHistory(learnerId) {
      if (!learnerId || typeof learnerId !== 'string') {
        return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
      }

      // Generate a rich set of mock history data for the timeline
      const today = new Date();
      const createDate = (daysAgo, hours = 10) => {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        d.setHours(hours, 0, 0, 0);
        return d.toISOString();
      };

      const mockHistory = [
        // Today
        { id: 'hist-001', type: 'mission', title: 'Vụ án: Bí ẩn dữ liệu doanh thu', timestamp: createDate(0, 14), xp: 120, link: '/missions/mission-001' },
        { id: 'hist-002', type: 'levelup', title: 'Thăng cấp: Thám tử Cấp cao', timestamp: createDate(0, 14), xp: 0, link: '/profile' },
        { id: 'hist-003', type: 'practice', title: 'Luyện tập: Hàm VLOOKUP & XLOOKUP', timestamp: createDate(0, 9), xp: 50, link: '/practice' },
        // Yesterday
        { id: 'hist-004', type: 'achievement', title: 'Mở khóa Danh hiệu: Bậc thầy Excel', timestamp: createDate(1, 20), xp: 100, link: '/achievements' },
        { id: 'hist-005', type: 'practice', title: 'Luyện tập: IF lồng nhau', timestamp: createDate(1, 15), xp: 30, link: '/practice' },
        // 2 days ago
        { id: 'hist-006', type: 'mission', title: 'Vụ án: Dấu vết gian lận giao dịch SQL', timestamp: createDate(2, 11), xp: 200, link: '/missions/sql-mission-001' },
        { id: 'hist-007', type: 'achievement', title: 'Mở khóa Danh hiệu: Truy vấn Siêu tốc', timestamp: createDate(2, 11), xp: 100, link: '/achievements' },
        // 3 days ago
        { id: 'hist-008', type: 'practice', title: 'Luyện tập: GROUP BY & HAVING', timestamp: createDate(3, 16), xp: 40, link: '/practice' },
        { id: 'hist-009', type: 'practice', title: 'Luyện tập: Hàm xử lý chuỗi SQL', timestamp: createDate(3, 10), xp: 40, link: '/practice' },
        // 5 days ago
        { id: 'hist-010', type: 'mission', title: 'Vụ án: Phân tích khách hàng rời bỏ', timestamp: createDate(5, 14), xp: 150, link: '/missions/mission-002' },
        // 7 days ago
        { id: 'hist-011', type: 'practice', title: 'Luyện tập: Pivot Table cơ bản', timestamp: createDate(7, 9), xp: 50, link: '/practice' },
        { id: 'hist-012', type: 'levelup', title: 'Thăng cấp: Thám tử Tập sự', timestamp: createDate(7, 9), xp: 0, link: '/profile' },
        { id: 'hist-013', type: 'mission', title: 'Vụ án: Tutorial Case 0', timestamp: createDate(7, 8), xp: 50, link: '/onboarding/case-0' },
        // 10 days ago
        { id: 'hist-014', type: 'achievement', title: 'Mở khóa Danh hiệu: Bước Chân Đầu Tiên', timestamp: createDate(10, 20), xp: 100, link: '/achievements' },
      ];

      return { data: mockHistory, error: null }
    },

    validateProgress(record) {
      const errors = []
      if (!record || typeof record !== 'object') {
        return { valid: false, errors: ['Bản ghi tiến độ phải là đối tượng.'] }
      }

      if (!record.learnerId || typeof record.learnerId !== 'string') {
        errors.push('Bản ghi tiến độ phải chứa learnerId dạng chuỗi.')
      }

      if (!record.contentId || typeof record.contentId !== 'string') {
        errors.push('Bản ghi tiến độ phải chứa contentId dạng chuỗi.')
      }

      if (!Object.values(CONTENT_TYPES).includes(record.contentType)) {
        errors.push(`contentType "${record.contentType}" không hợp lệ.`)
      }

      if (!Object.values(PROGRESS_STATUS).includes(record.status)) {
        errors.push(`Trạng thái tiến độ "${record.status}" không hợp lệ.`)
      }

      if (typeof record.attempts !== 'number' || record.attempts < 0) {
        errors.push('Số lượt làm bài (attempts) phải là số >= 0.')
      }

      if (typeof record.bestScore !== 'number' || record.bestScore < 0) {
        errors.push('Điểm cao nhất (bestScore) phải là số >= 0.')
      }

      return { valid: errors.length === 0, errors }
    },
  }
}

export const mockProgressService = createMockProgressService({ initialMasteryRecords: DEFAULT_MOCK_MASTERY })
