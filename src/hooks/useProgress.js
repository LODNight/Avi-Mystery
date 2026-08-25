import { useState, useEffect, useCallback } from 'react'
import { progressService } from '../services/index.js'
import { calculateOverallMastery, getSkillMasteryLevel } from '../domain/mastery/masteryEvaluator.js'

/**
 * React Custom Hook for Learner Progress, XP Ledger & Skill Mastery Tracking (Step 6.3)
 * Provides a single source of truth for learner progress state across the application.
 *
 * @param {string} [learnerId='user-001'] Target learner ID
 * @returns {Object} Progress hook state and operations
 */
export function useProgress(learnerId = 'user-001') {
  const [progressList, setProgressList] = useState([])
  const [learnerXp, setLearnerXp] = useState({ totalXp: 0, history: [] })
  const [masteryList, setMasteryList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgressData = useCallback(async () => {
    if (!learnerId) return
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch progress records
      const pRes = await progressService.listProgress(learnerId)
      const pData = pRes?.data || []

      // 2. Fetch learner XP
      const xpRes = await progressService.getLearnerXp(learnerId)
      const xpData = xpRes?.data || { totalXp: 0, history: [] }

      // 3. Fetch skill mastery list
      const mRes = await progressService.listSkillMastery(learnerId)
      const mData = mRes?.data || []

      setProgressList(pData)
      setLearnerXp(xpData)
      setMasteryList(mData)
    } catch (err) {
      setError(err?.message || 'Không thể nạp dữ liệu tiến độ người học.')
    } finally {
      setLoading(false)
    }
  }, [learnerId])

  useEffect(() => {
    let isMounted = true
    fetchProgressData().then(() => {
      if (!isMounted) return
    })
    return () => {
      isMounted = false
    }
  }, [fetchProgressData])

  const recordAttempt = useCallback(
    async ({ contentId, contentType = 'question', mode = 'main_quest', isCorrect, score }) => {
      if (!learnerId || !contentId) return null
      try {
        const res = await progressService.recordAttempt({
          learnerId,
          contentId,
          contentType,
          mode,
          isCorrect,
          score,
        })
        if (res?.data) {
          await fetchProgressData()
        }
        return res
      } catch (err) {
        return { data: null, error: { message: err?.message || 'Lỗi ghi nhận lượt làm bài.' } }
      }
    },
    [learnerId, fetchProgressData]
  )

  const awardXp = useCallback(
    async ({ contentId, contentType = 'question', mode = 'main_quest', submissionResult, question, hintsUsed = 0 }) => {
      if (!learnerId || !contentId || !submissionResult) return null
      try {
        const res = await progressService.awardXp({
          learnerId,
          contentId,
          contentType,
          mode,
          submissionResult,
          question,
          hintsUsed,
        })
        if (res?.data) {
          await fetchProgressData()
        }
        return res
      } catch (err) {
        return { data: null, error: { message: err?.message || 'Lỗi trao thưởng XP.' } }
      }
    },
    [learnerId, fetchProgressData]
  )

  const getSkillMastery = useCallback(
    (skillId) => {
      const record = masteryList.find((m) => m.skillId === skillId) || null
      const level = getSkillMasteryLevel(record?.masteryScore || 0)
      return {
        record,
        masteryScore: record?.masteryScore || 0,
        level,
      }
    },
    [masteryList]
  )

  const overallMastery = calculateOverallMastery(masteryList)

  return {
    progressList,
    learnerXp,
    masteryList,
    overallMastery,
    loading,
    error,
    refreshProgress: fetchProgressData,
    recordAttempt,
    awardXp,
    getSkillMastery,
  }
}
