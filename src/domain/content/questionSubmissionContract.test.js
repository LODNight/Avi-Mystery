import { describe, it, expect } from 'vitest'
import { submissionService, questionService } from '../../services/index.js'
import { checkExcelAnswer } from '../../utils/excelChecker.js'
import { evaluateSqlResult } from '../../utils/sql/sqlChecker.js'

describe('Step 5.5 — Question Submission Binding Contract Tests', () => {
  it('verifies Question domain entity integrates with submissionService seamlessly', async () => {
    // Fetch question entity
    const qRes = await questionService.getQuestion('q-001')
    expect(qRes.error).toBeNull()
    const question = qRes.data

    // Submit answer referencing questionId
    const subRes = await submissionService.submit({
      mode: 'submit',
      questionId: question.questionId,
      investigationId: question.investigationId,
      tool: 'excel',
      answer: {
        formula: '=C2*D2',
        sheetData: { C2: 3, D2: 150000 },
      },
      clientAttemptId: 'contract-test-attempt-001',
    })

    expect(subRes.error).toBeNull()
    expect(subRes.data.questionId).toBe(question.questionId)
    expect(subRes.data.investigationId).toBe(question.investigationId)
    expect(subRes.data.isCorrect).toBe(true)
    expect(typeof subRes.data.potentialXp).toBe('number')
  })

  it('verifies Evaluator functions (checkExcelAnswer, evaluateSqlResult) remain 100% pure', () => {
    const excelInput = {
      userFormula: '=SUM(A1:A5)',
      expectedFormula: ['=SUM(A1:A5)'],
      expectedValue: 100,
      sheetData: { A1: 20, A2: 20, A3: 20, A4: 20, A5: 20 },
    }

    // Call evaluator multiple times with identical inputs
    const excelRes1 = checkExcelAnswer(excelInput)
    const excelRes2 = checkExcelAnswer(excelInput)

    expect(excelRes1).toEqual(excelRes2)
    expect(excelRes1.isCorrect).toBe(true)

    const sqlActual = { columns: ['id', 'name'], rows: [[1, 'Alice']] }
    const sqlExpected = { columns: ['id', 'name'], rows: [[1, 'Alice']] }
    const sqlConfig = { orderMatters: false, columnOrderMatters: true }

    const sqlRes1 = evaluateSqlResult(sqlActual, sqlExpected, sqlConfig, 'SELECT * FROM users')
    const sqlRes2 = evaluateSqlResult(sqlActual, sqlExpected, sqlConfig, 'SELECT * FROM users')

    expect(sqlRes1).toEqual(sqlRes2)
    expect(sqlRes1.isCorrect).toBe(true)
  })

  it('verifies submission result is deterministic and allows retries with new attempt IDs', async () => {
    const wrongSubmit = await submissionService.submit({
      mode: 'submit',
      questionId: 'q-001',
      tool: 'excel',
      answer: { formula: '=C2+D2' },
      clientAttemptId: 'retry-attempt-wrong',
    })

    expect(wrongSubmit.error).toBeNull()
    expect(wrongSubmit.data.isCorrect).toBe(false)

    // Retry with corrected formula and new clientAttemptId
    const retrySubmit = await submissionService.submit({
      mode: 'submit',
      questionId: 'q-001',
      tool: 'excel',
      answer: { formula: '=C2*D2', sheetData: { C2: 3, D2: 150000 } },
      clientAttemptId: 'retry-attempt-correct',
    })

    expect(retrySubmit.error).toBeNull()
    expect(retrySubmit.data.isCorrect).toBe(true)
    expect(retrySubmit.data.questionId).toBe('q-001')
  })
})
