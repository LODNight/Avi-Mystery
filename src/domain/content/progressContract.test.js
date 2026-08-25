import { describe, it, expect } from 'vitest'
import {
  createLearnerProgressKey,
  createInitialProgress,
  recordAttemptProgress,
  PROGRESS_STATUS,
  CONTENT_TYPES,
} from '../progress/learnerProgress.js'
import { questionService, progressService } from '../../services/index.js'

describe('Step 5.6 — Learner Progress Contract & Decoupling Tests', () => {
  it('creates deterministic composite keys from learnerId and contentId', () => {
    const key1 = createLearnerProgressKey('user-001', 'q-001')
    const key2 = createLearnerProgressKey('user-001', 'inv-001')

    expect(key1).toBe('user-001:q-001')
    expect(key2).toBe('user-001:inv-001')
    expect(() => createLearnerProgressKey('', 'q-001')).toThrow()
    expect(() => createLearnerProgressKey('user-001', '')).toThrow()
  })

  it('ensures progress operations NEVER mutate static content definitions', async () => {
    const qRes = await questionService.getQuestion('q-001')
    expect(qRes.error).toBeNull()
    const originalQuestion = JSON.parse(JSON.stringify(qRes.data))

    // Record attempts for question
    const p1 = recordAttemptProgress(null, { isCorrect: false, score: 40 }, { learnerId: 'user-001', contentId: originalQuestion.questionId })
    const p2 = recordAttemptProgress(p1, { isCorrect: true, score: 100 }, { learnerId: 'user-001', contentId: originalQuestion.questionId })

    // Verify Question content object is 100% identical and un-mutated
    expect(qRes.data).toEqual(originalQuestion)
    expect(qRes.data).not.toHaveProperty('status')
    expect(qRes.data).not.toHaveProperty('attempts')
    expect(p2.learnerId).toBe('user-001')
    expect(p2.contentId).toBe('q-001')
  })

  it('distinguishes attempt counts from completion state across retries', () => {
    const t1 = '2026-08-25T10:00:00.000Z'
    const t2 = '2026-08-25T10:05:00.000Z'
    const t3 = '2026-08-25T10:10:00.000Z'

    // Attempt 1: Failed attempt
    const p1 = recordAttemptProgress(null, { isCorrect: false, score: 30 }, { learnerId: 'user-001', contentId: 'q-001' }, t1)
    expect(p1.status).toBe(PROGRESS_STATUS.IN_PROGRESS)
    expect(p1.attempts).toBe(1)
    expect(p1.bestScore).toBe(30)
    expect(p1.completedAt).toBeNull()
    expect(p1.lastAttemptAt).toBe(t1)

    // Attempt 2: Successful attempt
    const p2 = recordAttemptProgress(p1, { isCorrect: true, score: 100 }, { learnerId: 'user-001', contentId: 'q-001' }, t2)
    expect(p2.status).toBe(PROGRESS_STATUS.COMPLETED)
    expect(p2.attempts).toBe(2)
    expect(p2.bestScore).toBe(100)
    expect(p2.completedAt).toBe(t2)
    expect(p2.lastAttemptAt).toBe(t2)

    // Attempt 3: Retry after completion (lower score)
    const p3 = recordAttemptProgress(p2, { isCorrect: false, score: 70 }, { learnerId: 'user-001', contentId: 'q-001' }, t3)
    expect(p3.status).toBe(PROGRESS_STATUS.COMPLETED)
    expect(p3.attempts).toBe(3)
    expect(p3.bestScore).toBe(100) // Preserved higher score
    expect(p3.completedAt).toBe(t2) // Preserved original completion timestamp
    expect(p3.lastAttemptAt).toBe(t3)
  })

  it('verifies progressService gateway exposes progressService without content duplication', async () => {
    expect(progressService).toBeDefined()

    const res1 = await progressService.recordAttempt({
      learnerId: 'learner-100',
      contentId: 'q-010',
      contentType: 'question',
      isCorrect: true,
      score: 100,
    })

    expect(res1.error).toBeNull()
    expect(res1.data.learnerId).toBe('learner-100')
    expect(res1.data.contentId).toBe('q-010')
    expect(res1.data.status).toBe(PROGRESS_STATUS.COMPLETED)

    const listRes = await progressService.listProgress('learner-100', 'question')
    expect(listRes.error).toBeNull()
    expect(listRes.data).toHaveLength(1)
    expect(listRes.data[0].contentId).toBe('q-010')
  })
})
