import { describe, it, expect } from 'vitest'
import { createMockProgressService } from './mockProgressService.js'
import { PROGRESS_ERROR_CODES } from '../contracts/progressService.js'
import { PROGRESS_STATUS, CONTENT_TYPES } from '../../domain/progress/learnerProgress.js'

describe('mockProgressService Unit Tests (Step 5.6)', () => {
  it('trả về bản ghi unstarted khi chưa có tiến độ', async () => {
    const service = createMockProgressService()
    const res = await service.getProgress('user-001', 'q-001')

    expect(res.error).toBeNull()
    expect(res.data).toEqual({
      learnerId: 'user-001',
      contentId: 'q-001',
      contentType: CONTENT_TYPES.QUESTION,
      status: PROGRESS_STATUS.NOT_STARTED,
      attempts: 0,
      bestScore: 0,
      lastAttemptAt: null,
      completedAt: null,
    })
  })

  it('ghi nhận nộp bài và cập nhật tiến độ đúng theo lượt thử', async () => {
    const service = createMockProgressService()
    const res1 = await service.recordAttempt({
      learnerId: 'user-001',
      contentId: 'q-001',
      contentType: 'question',
      isCorrect: false,
      score: 50,
      timestamp: '2026-08-25T12:00:00.000Z',
    })

    expect(res1.error).toBeNull()
    expect(res1.data.status).toBe(PROGRESS_STATUS.IN_PROGRESS)
    expect(res1.data.attempts).toBe(1)
    expect(res1.data.bestScore).toBe(50)
    expect(res1.data.completedAt).toBeNull()

    const res2 = await service.recordAttempt({
      learnerId: 'user-001',
      contentId: 'q-001',
      contentType: 'question',
      isCorrect: true,
      score: 100,
      timestamp: '2026-08-25T12:05:00.000Z',
    })

    expect(res2.error).toBeNull()
    expect(res2.data.status).toBe(PROGRESS_STATUS.COMPLETED)
    expect(res2.data.attempts).toBe(2)
    expect(res2.data.bestScore).toBe(100)
    expect(res2.data.completedAt).toBe('2026-08-25T12:05:00.000Z')

    // Fetch progress again
    const fetchRes = await service.getProgress('user-001', 'q-001')
    expect(fetchRes.data).toEqual(res2.data)
  })

  it('lọc danh sách tiến độ theo learnerId và contentType', async () => {
    const service = createMockProgressService()
    await service.recordAttempt({ learnerId: 'user-001', contentId: 'q-001', contentType: 'question', isCorrect: true })
    await service.recordAttempt({ learnerId: 'user-001', contentId: 'inv-001', contentType: 'investigation', isCorrect: true })
    await service.recordAttempt({ learnerId: 'user-002', contentId: 'q-001', contentType: 'question', isCorrect: false })

    const qList = await service.listProgress('user-001', 'question')
    expect(qList.error).toBeNull()
    expect(qList.data).toHaveLength(1)
    expect(qList.data[0].contentId).toBe('q-001')

    const allUser1 = await service.listProgress('user-001')
    expect(allUser1.data).toHaveLength(2)
  })

  it('báo lỗi validation khi thiếu learnerId hoặc contentId', async () => {
    const service = createMockProgressService()

    const res1 = await service.getProgress('', 'q-001')
    expect(res1.data).toBeNull()
    expect(res1.error.code).toBe(PROGRESS_ERROR_CODES.VALIDATION_ERROR)

    const res2 = await service.recordAttempt({ contentId: 'q-001', isCorrect: true })
    expect(res2.data).toBeNull()
    expect(res2.error.code).toBe(PROGRESS_ERROR_CODES.VALIDATION_ERROR)
  })

  it('kiểm tra tính hợp lệ của bản ghi tiến độ trong validateProgress', () => {
    const service = createMockProgressService()
    const validRecord = {
      learnerId: 'user-001',
      contentId: 'q-001',
      contentType: 'question',
      status: 'completed',
      attempts: 1,
      bestScore: 100,
      lastAttemptAt: '2026-08-25T12:00:00.000Z',
      completedAt: '2026-08-25T12:00:00.000Z',
    }

    expect(service.validateProgress(validRecord).valid).toBe(true)

    const invalidRecord = { ...validRecord, status: 'unknown_status' }
    const validation = service.validateProgress(invalidRecord)
    expect(validation.valid).toBe(false)
    expect(validation.errors[0]).toMatch(/không hợp lệ/i)
  })

  it('trao XP chính xác ở lần hoàn thành đầu tiên và không trao trùng ở lần nộp lại (idempotency)', async () => {
    const service = createMockProgressService()
    const mockQuestion = { questionId: 'q-001', rewards: { baseXp: 60 } }
    const submission1 = { attemptId: 'att-01', isCorrect: true, score: 100 }

    // First completion -> award XP
    const res1 = await service.awardXp({
      learnerId: 'user-001',
      contentId: 'q-001',
      contentType: 'question',
      submissionResult: submission1,
      question: mockQuestion,
    })

    expect(res1.error).toBeNull()
    expect(res1.data.xpAwarded).toBe(60)
    expect(res1.data.totalXp).toBe(60)
    expect(res1.data.isFirstCompletion).toBe(true)
    expect(res1.data.reason).toBe('FIRST_COMPLETION')

    // Second completion retry -> 0 additional XP
    const submission2 = { attemptId: 'att-02', isCorrect: true, score: 100 }
    const res2 = await service.awardXp({
      learnerId: 'user-001',
      contentId: 'q-001',
      contentType: 'question',
      submissionResult: submission2,
      question: mockQuestion,
    })

    expect(res2.error).toBeNull()
    expect(res2.data.xpAwarded).toBe(0)
    expect(res2.data.totalXp).toBe(60) // Remains 60, not 120!
    expect(res2.data.isFirstCompletion).toBe(false)
    expect(res2.data.reason).toBe('ALREADY_COMPLETED')

    // Verify getLearnerXp ledger
    const xpRes = await service.getLearnerXp('user-001')
    expect(xpRes.error).toBeNull()
    expect(xpRes.data.totalXp).toBe(60)
    expect(xpRes.data.history).toHaveLength(2)
  })

  it('quản lý tiến trình thành thạo kỹ năng (skill mastery) qua recordMasteryAssessment và getSkillMastery', async () => {
    const service = createMockProgressService()

    // 1. Initial unassessed fetch
    const initRes = await service.getSkillMastery('user-001', 'excel-sum')
    expect(initRes.error).toBeNull()
    expect(initRes.data.masteryScore).toBe(0)
    expect(initRes.data.totalAttempts).toBe(0)

    // 2. Record first assessment
    const m1 = await service.recordMasteryAssessment({
      learnerId: 'user-001',
      skillId: 'excel-sum',
      questionId: 'q-001',
      isCorrect: true,
      score: 100,
    })

    expect(m1.error).toBeNull()
    expect(m1.data.masteryScore).toBe(100)
    expect(m1.data.totalAttempts).toBe(1)
    expect(m1.data.successfulAttempts).toBe(1)

    // 3. Record second assessment (failed)
    const m2 = await service.recordMasteryAssessment({
      learnerId: 'user-001',
      skillId: 'excel-sum',
      questionId: 'q-002',
      isCorrect: false,
      score: 0,
    })

    expect(m2.error).toBeNull()
    expect(m2.data.masteryScore).toBe(50) // 1 success / 2 attempts = 50%
    expect(m2.data.totalAttempts).toBe(2)

    // 4. List skill mastery for user-001
    const listRes = await service.listSkillMastery('user-001')
    expect(listRes.error).toBeNull()
    expect(listRes.data).toHaveLength(1)
    expect(listRes.data[0].skillId).toBe('excel-sum')
  })
})
