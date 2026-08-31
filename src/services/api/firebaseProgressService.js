import { doc, getDoc, setDoc, updateDoc, collection, runTransaction, increment } from 'firebase/firestore'
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
      
      return { data: { learnerId, totalXp, history: [] }, error: null }
    } catch (error) {
       console.error('Lỗi khi lấy thông tin XP:', error)
       return { data: null, error: { code: 'GET_XP_FAILED', message: error.message } }
    }
  },

  async listProgress(learnerId, contentType = null) {
     // Currently we don't need this for MVP core flow since everything is lazy loaded by contentId,
     // but if needed, we can implement it via a collectionGroup or collection query.
     // For now, return empty array to keep UI from breaking if it calls this.
     return { data: [], error: null }
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
    // Import mock to maintain compatibility for now
    const { mockProgressService } = await import('../mock/mockProgressService.js')
    return mockProgressService.getLearnerAchievements(learnerId)
  },

  async getFullHistory(learnerId) {
    const { mockProgressService } = await import('../mock/mockProgressService.js')
    return mockProgressService.getFullHistory(learnerId)
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
