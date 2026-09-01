import { doc, getDoc, setDoc, updateDoc, collection, runTransaction, increment, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase.js'
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
} from '../../domain/reward/rewardEvaluator.js'
import { PROGRESS_ERROR_CODES } from '../contracts/progressService.js'

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}

export const firebaseProgressService = {
  async getProgress(learnerId, contentId) {
    if (!learnerId || typeof learnerId !== 'string') {
      return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
    }
    if (!contentId || typeof contentId !== 'string') {
      return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'contentId là bắt buộc.' } }
    }

    try {
      const docRef = doc(db, 'learners', learnerId, 'progress', contentId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null }
      } else {
        const initial = createInitialProgress({ learnerId, contentId })
        return { data: clone(initial), error: null }
      }
    } catch (error) {
      console.error('Lỗi khi lấy tiến trình:', error)
      return { data: null, error: { code: PROGRESS_ERROR_CODES.NOT_FOUND, message: error.message } }
    }
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

    try {
      const progressRef = doc(db, 'learners', learnerId, 'progress', contentId)

      let updatedRecord = null
      
      await runTransaction(db, async (transaction) => {
        const progressDoc = await transaction.get(progressRef)
        const existingRecord = progressDoc.exists() ? progressDoc.data() : null

        updatedRecord = recordAttemptProgress(
          existingRecord,
          { isCorrect, score },
          { learnerId, contentId, contentType },
          timestamp || new Date().toISOString()
        )
        updatedRecord.lastMode = mode

        transaction.set(progressRef, updatedRecord, { merge: true })
      })

      return { data: clone(updatedRecord), error: null }
    } catch (error) {
      console.error('Lỗi khi ghi nhận lượt làm bài:', error)
      return { data: null, error: { code: 'PROGRESS_UPDATE_FAILED', message: error.message } }
    }
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
    if (!submissionResult || typeof submissionResult !== 'object' || !submissionResult.attemptId) {
      return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'submissionResult và attemptId là bắt buộc.' } }
    }

    const attemptId = submissionResult.attemptId

    try {
      let finalResult = null

      await runTransaction(db, async (transaction) => {
        const ledgerRef = doc(db, 'learners', learnerId, 'xpLedger', attemptId)
        const ledgerDoc = await transaction.get(ledgerRef)

        const learnerRef = doc(db, 'learners', learnerId)
        const learnerDoc = await transaction.get(learnerRef)

        const progressRef = doc(db, 'learners', learnerId, 'progress', contentId)
        const progressDoc = await transaction.get(progressRef)

        // 1. Idempotency Check
        if (ledgerDoc.exists()) {
          const ledgerData = ledgerDoc.data()
          finalResult = {
            progress: progressDoc.exists() ? progressDoc.data() : createInitialProgress({ learnerId, contentId }),
            xpAwarded: 0, // Already awarded in previous transaction
            totalXp: learnerDoc.exists() ? (learnerDoc.data().totalXp || 0) : 0,
            isFirstCompletion: ledgerData.reason === 'FIRST_COMPLETION',
            reason: 'IDEMPOTENT_REPLAY'
          }
          return
        }

        // 2. Evaluate Domain Rules
        const existingProgress = progressDoc.exists() ? progressDoc.data() : null
        const isFirstCompletion = existingProgress ? existingProgress.status !== PROGRESS_STATUS.COMPLETED : true

        const updatedProgress = recordAttemptProgress(
          existingProgress,
          submissionResult,
          { learnerId, contentId, contentType },
          new Date().toISOString()
        )
        updatedProgress.lastMode = mode

        const xpReward = calculateXpReward({
          question,
          submissionResult,
          isFirstCompletion,
          hintsUsed,
        })

        const xpTransaction = createXpTransaction({
          learnerId,
          contentId,
          attemptId,
          xpAmount: xpReward.xpAwarded,
          reason: xpReward.reason,
        })
        xpTransaction.mode = mode // Add mode to ledger

        // 3. Apply Writes
        transaction.set(ledgerRef, xpTransaction)
        transaction.set(progressRef, updatedProgress, { merge: true })

        if (xpReward.xpAwarded > 0) {
          if (learnerDoc.exists()) {
            transaction.update(learnerRef, {
              totalXp: increment(xpReward.xpAwarded)
            })
          } else {
            transaction.set(learnerRef, {
              totalXp: xpReward.xpAwarded
            }, { merge: true })
          }
        } else if (!learnerDoc.exists()) {
          // Ensure learner doc exists even if no XP awarded yet
           transaction.set(learnerRef, {
              totalXp: 0
           }, { merge: true })
        }

        const currentTotalXp = learnerDoc.exists() ? (learnerDoc.data().totalXp || 0) : 0
        
        finalResult = {
          progress: clone(updatedProgress),
          xpAwarded: xpReward.xpAwarded,
          totalXp: currentTotalXp + xpReward.xpAwarded,
          isFirstCompletion: xpReward.isFirstCompletion,
          reason: xpReward.reason,
        }
      })

      return { data: finalResult, error: null }
    } catch (error) {
      console.error('Lỗi khi tính điểm và lưu trữ XP:', error)
      return { data: null, error: { code: 'AWARD_XP_FAILED', message: error.message } }
    }
  },

  // Deferred Methods (Compatibility implementations)
  async getLearnerXp(learnerId) {
    if (!learnerId || typeof learnerId !== 'string') {
      return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
    }
    
    try {
      const learnerRef = doc(db, 'learners', learnerId)
      const learnerDoc = await getDoc(learnerRef)
      const totalXp = learnerDoc.exists() ? (learnerDoc.data().totalXp || 0) : 0

      const historyRes = await this.getFullHistory(learnerId)
      const history = historyRes.data || []

      const today = new Date()
      const dateMap = {}
      history.forEach(h => {
        if (h.timestamp) {
          const d = new Date(h.timestamp)
          dateMap[d.toLocaleDateString('vi-VN')] = true
        }
      })

      let currentStreak = 0
      for (let i = 0; i < 365; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        if (dateMap[d.toLocaleDateString('vi-VN')]) {
          currentStreak++
        } else if (i > 0) {
          break
        }
      }

      return {
        data: {
          learnerId,
          totalXp,
          streakSummary: { currentStreak },
          history
        },
        error: null
      }
    } catch (error) {
       console.error('Lỗi khi lấy thông tin XP:', error)
       return { data: null, error: { code: 'GET_XP_FAILED', message: error.message } }
    }
  },

  async listProgress(learnerId, contentType = null) {
    if (!learnerId || typeof learnerId !== 'string') {
      return { data: null, error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
    }

    try {
      const progressRef = collection(db, 'learners', learnerId, 'progress')
      let q = progressRef

      if (contentType) {
        q = query(progressRef, where('contentType', '==', contentType))
      }

      const snapshot = await getDocs(q)
      const progressList = []
      
      snapshot.forEach((docSnap) => {
        progressList.push(docSnap.data())
      })

      return { data: progressList, error: null }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tiến độ:', error)
      return { data: null, error: { code: 'LIST_PROGRESS_FAILED', message: error.message } }
    }
  },

  async getSkillMastery(learnerId, skillId) {
    return { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Deferred persistence' } }
  },

  async listSkillMastery(learnerId) {
    return { data: [], error: { code: 'NOT_IMPLEMENTED', message: 'Deferred persistence' } }
  },

  async recordMasteryAssessment(request) {
    return { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Deferred persistence' } }
  },

  async getLearnerAchievements(learnerId) {
    if (!learnerId || typeof learnerId !== 'string') {
      return { data: [], error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
    }

    try {
      const { ACHIEVEMENTS_DATA } = await import('../../domain/profile/achievements.js')
      const progressRes = await this.listProgress(learnerId)
      const progressList = progressRes.data || []
      const learnerDoc = await getDoc(doc(db, 'learners', learnerId))
      const learnerData = learnerDoc.exists() ? learnerDoc.data() : {}

      const completedMissions = progressList.filter(p => p.status === 'completed')
      const completedCount = completedMissions.length
      const excelCompletedMissions = completedMissions.filter(p => p.contentType === 'course' || p.contentId === 'mission-001' || p.contentType === 'question')
      const sqlCompletedMissions = completedMissions.filter(p => p.contentId === 'sql-mission-001' || p.contentId?.includes('sql'))
      
      const excelCompletedCount = excelCompletedMissions.length
      const sqlCompletedCount = sqlCompletedMissions.length
      const streak = learnerData.streakSummary?.currentStreak || 0

      const merged = ACHIEVEMENTS_DATA.map(badge => {
        let isUnlocked = false
        let currentProgress = 0

        if (badge.id === 'badge-first-blood') {
          isUnlocked = completedCount >= 1
          currentProgress = Math.min(completedCount, 1)
        } else if (badge.id === 'badge-excel-novice') {
          isUnlocked = excelCompletedCount >= 5
          currentProgress = Math.min(excelCompletedCount, badge.maxProgress)
        } else if (badge.id === 'badge-excel-master') {
          isUnlocked = excelCompletedCount >= 10
          currentProgress = Math.min(excelCompletedCount * 10, badge.maxProgress)
        } else if (badge.id === 'badge-sql-novice') {
          isUnlocked = sqlCompletedCount >= 1
          currentProgress = Math.min(sqlCompletedCount, badge.maxProgress)
        } else if (badge.id === 'badge-sql-master') {
          isUnlocked = sqlCompletedCount >= 10
          currentProgress = Math.min(sqlCompletedCount * 10, badge.maxProgress)
        } else if (badge.id === 'badge-streak-3') {
          isUnlocked = streak >= 3
          currentProgress = Math.min(streak, 3)
        } else if (badge.id === 'badge-streak-7') {
          isUnlocked = streak >= 7
          currentProgress = Math.min(streak, 7)
        } else if (badge.id === 'badge-flawless') {
          const flawlessCount = completedMissions.filter(p => !p.hintsUsed || p.hintsUsed === 0).length
          isUnlocked = flawlessCount >= 1
          currentProgress = Math.min(flawlessCount, 1)
        }

        return {
          ...badge,
          isUnlocked,
          currentProgress: isUnlocked ? badge.maxProgress : currentProgress,
          unlockedAt: isUnlocked ? (completedMissions[0]?.updatedAt || new Date().toISOString()) : null,
        }
      })

      return { data: merged, error: null }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh hiệu:', error)
      return { data: [], error: null }
    }
  },

  async listSkillMastery(learnerId) {
    if (!learnerId || typeof learnerId !== 'string') {
      return { data: [], error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
    }

    try {
      const progressRes = await this.listProgress(learnerId)
      const progressList = progressRes.data || []

      const hasExcel = progressList.some(p => (p.contentId === 'mission-001' || p.contentType === 'question' || p.contentType === 'course') && p.status === 'completed')
      const hasSql = progressList.some(p => (p.contentId === 'sql-mission-001' || p.contentId?.includes('sql')) && p.status === 'completed')

      const skills = [
        { skillId: 'excel_formula', name: 'Công thức & Hàm Excel', masteryScore: hasExcel ? 85 : 0 },
        { skillId: 'sql_query', name: 'Truy vấn & Cú pháp SQL', masteryScore: hasSql ? 85 : 0 },
        { skillId: 'data_cleaning', name: 'Làm sạch & Chuẩn hóa dữ liệu', masteryScore: (hasExcel || hasSql) ? 80 : 0 },
        { skillId: 'data_analysis', name: 'Tư duy phân tích thám tử', masteryScore: (hasExcel || hasSql) ? 75 : 0 },
      ]

      return { data: skills, error: null }
    } catch (error) {
      console.error('Lỗi khi lấy điểm kỹ năng:', error)
      return { data: [], error: null }
    }
  },

  async getFullHistory(learnerId) {
    if (!learnerId || typeof learnerId !== 'string') {
      return { data: [], error: { code: PROGRESS_ERROR_CODES.VALIDATION_ERROR, message: 'learnerId là bắt buộc.' } }
    }

    try {
      const ledgerRef = collection(db, 'learners', learnerId, 'xpLedger')
      const ledgerSnap = await getDocs(ledgerRef)

      const progressRef = collection(db, 'learners', learnerId, 'progress')
      const progressSnap = await getDocs(progressRef)

      const historyItems = []

      const getTitle = (contentId) => {
        if (contentId === 'mission-001') return 'Vụ án: Phân tích doanh thu giảm (Excel)'
        if (contentId === 'sql-mission-001') return 'Vụ án: Truy vấn bảng dữ liệu SQL'
        if (contentId === 'mission-002') return 'Vụ án: Phân tích khách hàng (Excel)'
        return `Nhiệm vụ: ${contentId || 'Bí ẩn dữ liệu'}`
      }

      const getLink = (contentId) => {
        if (contentId === 'sql-mission-001') return '/missions/sql-mission-001'
        if (contentId) return `/missions/${contentId}`
        return '/dashboard'
      }

      const seenLedgerKeys = new Set()

      ledgerSnap.forEach((docSnap) => {
        const d = docSnap.data()
        const contentId = d.contentId || 'unknown'
        const xp = typeof d.xpAmount === 'number' ? d.xpAmount : (typeof d.xp === 'number' ? d.xp : 0)
        
        // Deduplicate repeat attempts for identical content on the same date/timestamp if 0 XP or duplicate log
        const dedupeKey = `${contentId}:${d.reason || ''}:${xp}`
        if (!seenLedgerKeys.has(dedupeKey) || xp > 0) {
          seenLedgerKeys.add(dedupeKey)
          historyItems.push({
            id: docSnap.id,
            type: d.mode === 'practice' ? 'practice' : 'mission',
            title: getTitle(d.contentId),
            timestamp: d.createdAt || new Date().toISOString(),
            xp: xp,
            link: getLink(d.contentId),
          })
        }
      })

      const addedContentIds = new Set(historyItems.map(h => h.title))

      progressSnap.forEach((docSnap) => {
        const d = docSnap.data()
        const title = getTitle(d.contentId)
        if (d.contentId && !addedContentIds.has(title)) {
          historyItems.push({
            id: `progress-${docSnap.id}`,
            type: d.contentType === 'practice' ? 'practice' : 'mission',
            title: title,
            timestamp: d.updatedAt || new Date().toISOString(),
            xp: d.bestScore ? d.bestScore * 2 : 50,
            link: getLink(d.contentId),
          })
        }
      })

      historyItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      return { data: historyItems, error: null }
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử hoạt động từ Firebase:', error)
      return { data: [], error: null }
    }
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
