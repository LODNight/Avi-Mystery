import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useProgress } from './useProgress.js'

describe('useProgress React Hook', () => {
  it('loads progress, learner XP, and skill mastery data on mount', async () => {
    const { result } = renderHook(() => useProgress('user-001'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(Array.isArray(result.current.progressList)).toBe(true)
    expect(result.current.learnerXp).toBeDefined()
    expect(Array.isArray(result.current.masteryList)).toBe(true)
    expect(result.current.overallMastery).toBeDefined()
  })

  it('provides skill mastery helper function', async () => {
    const { result } = renderHook(() => useProgress('user-001'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const excelSkill = result.current.getSkillMastery('excel_formula')
    expect(excelSkill.masteryScore).toBe(85)
    expect(excelSkill.level.name).toBe('Thành thạo')
  })

  it('records attempt and refreshes progress data', async () => {
    const { result } = renderHook(() => useProgress('user-001'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const res = await result.current.recordAttempt({
        contentId: 'inv-test-001',
        contentType: 'investigation',
        mode: 'main_quest',
        isCorrect: true,
        score: 100,
      })
      expect(res.data.status).toBe('completed')
    })

    await waitFor(() => {
      const found = result.current.progressList.find((p) => p.contentId === 'inv-test-001')
      expect(found).toBeDefined()
      expect(found.status).toBe('completed')
    })
  })
})
