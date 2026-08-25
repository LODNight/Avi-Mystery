import missionsData from '../../mocks/data/missions.json'
import { getQuestionIdentity } from '../../domain/content/contentIdentity.js'
import { mapMissionToQuestion } from '../../domain/content/questionAdapter.js'

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}

export function createMockQuestionService() {
  return {
    async getQuestion(questionId) {
      if (!questionId) {
        return { data: null, error: 'Cần cung cấp questionId.' }
      }

      // Try finding by qId or missionId
      const identity = getQuestionIdentity(questionId)
      const missionId = identity?.legacyMissionId || questionId
      const mission = missionsData.find((m) => m.id === missionId || m.id === questionId)

      if (!mission) {
        return { data: null, error: `Không tìm thấy Question "${questionId}".` }
      }

      const question = mapMissionToQuestion(mission, identity)
      return { data: clone(question), error: null }
    },

    async getQuestionsByInvestigation(investigationId) {
      if (!investigationId) {
        return { data: null, error: 'Cần cung cấp investigationId.' }
      }

      const targetMissionId = investigationId.replace(/^inv-/, 'mission-')
      const targetSqlId = investigationId.replace(/^inv-/, 'sql-mission-')

      const missions = missionsData.filter((m) => {
        const identity = getQuestionIdentity(m.id)
        return identity?.investigationId === investigationId || m.id === targetMissionId || m.id === targetSqlId
      })

      const questions = missions.map((mission) => {
        const identity = getQuestionIdentity(mission.id)
        return mapMissionToQuestion(mission, identity)
      })

      return { data: clone(questions), error: null }
    },

    validateQuestion(question) {
      const errors = []
      if (!question || typeof question !== 'object' || Array.isArray(question)) {
        return { valid: false, errors: ['Question phải là một đối tượng hợp lệ.'] }
      }

      const id = question.questionId || question.id
      if (!id || typeof id !== 'string') {
        errors.push('Question phải chứa questionId (hoặc id) dạng chuỗi.')
      }

      if (!question.investigationId || typeof question.investigationId !== 'string') {
        errors.push('Question phải chứa investigationId dạng chuỗi.')
      }

      if (!question.datasetId || typeof question.datasetId !== 'string') {
        errors.push('Question phải chứa datasetId dạng chuỗi.')
      }

      if (!question.prompt || typeof question.prompt !== 'string') {
        errors.push('Question phải chứa câu hỏi/hướng dẫn (prompt).')
      }

      if (!question.type || typeof question.type !== 'string') {
        errors.push('Question phải chứa loại câu hỏi (type).')
      }

      if (!question.checkerConfig || typeof question.checkerConfig !== 'object') {
        errors.push('Question phải chứa cấu hình kiểm tra (checkerConfig).')
      }

      if (!question.rewards || typeof question.rewards.baseXp !== 'number') {
        errors.push('Question phải chứa reward metadata hợp lệ (rewards.baseXp).')
      }

      return { valid: errors.length === 0, errors }
    },
  }
}

export const mockQuestionService = createMockQuestionService()
