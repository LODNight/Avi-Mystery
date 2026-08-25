import { describe, it, expect } from 'vitest'
import { questionService, submissionService, progressService } from '../../services/index.js'

describe('Step 5.7 — XP Reward Integration Flow (Question -> Submission -> Progress -> XP)', () => {
  it('executes full pipeline and awards XP on first completion without evaluator mutation', async () => {
    const learnerId = 'learner-test-01'

    // 1. Fetch Question entity
    const qRes = await questionService.getQuestion('q-001')
    expect(qRes.error).toBeNull()
    const question = qRes.data

    // 2. Submit answer to Submission Service (pure evaluator)
    const subRes = await submissionService.submit({
      questionId: question.questionId,
      mode: 'submit',
      tool: 'excel',
      answer: { formula: '=C2*D2', sheetData: { C2: 3, D2: 150000 } },
      clientAttemptId: 'client-att-101',
    })

    expect(subRes.error).toBeNull()
    expect(subRes.data.isCorrect).toBe(true)
    expect(subRes.data.questionId).toBe('q-001')

    // Verify Evaluator/Submission result did NOT mutate XP state directly
    expect(subRes.data).not.toHaveProperty('totalXp')

    // 3. Award XP via Progress Service
    const awardRes = await progressService.awardXp({
      learnerId,
      contentId: question.questionId,
      contentType: 'question',
      submissionResult: subRes.data,
      question,
    })

    expect(awardRes.error).toBeNull()
    expect(awardRes.data.xpAwarded).toBe(100)
    expect(awardRes.data.totalXp).toBe(100)
    expect(awardRes.data.isFirstCompletion).toBe(true)
    expect(awardRes.data.progress.status).toBe('completed')

    // 4. Retry identical submission (idempotency check)
    const subRes2 = await submissionService.submit({
      questionId: question.questionId,
      mode: 'submit',
      tool: 'excel',
      answer: { formula: '=C2*D2', sheetData: { C2: 3, D2: 150000 } },
      clientAttemptId: 'client-att-102',
    })

    const awardRes2 = await progressService.awardXp({
      learnerId,
      contentId: question.questionId,
      contentType: 'question',
      submissionResult: subRes2.data,
      question,
    })

    expect(awardRes2.error).toBeNull()
    expect(awardRes2.data.xpAwarded).toBe(0) // Idempotent 0 XP!
    expect(awardRes2.data.totalXp).toBe(100)  // Total XP unchanged!
    expect(awardRes2.data.isFirstCompletion).toBe(false)
    expect(awardRes2.data.reason).toBe('ALREADY_COMPLETED')

    // 5. Verify learner XP ledger
    const xpLedger = await progressService.getLearnerXp(learnerId)
    expect(xpLedger.error).toBeNull()
    expect(xpLedger.data.totalXp).toBe(100)
  })
})
