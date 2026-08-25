import missionsData from '../../mocks/data/missions.json'
import { getInvestigationIdentity } from '../../domain/content/contentIdentity.js'
import { mapMissionToInvestigation } from '../../domain/content/investigationAdapter.js'

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}

export function createMockInvestigationService() {
  return {
    async getInvestigation(investigationId) {
      if (!investigationId) {
        return { data: null, error: 'Cần cung cấp investigationId.' }
      }

      // Try finding by invId or missionId
      const identity = getInvestigationIdentity(investigationId)
      const missionId = identity?.legacyMissionId || investigationId
      const mission = missionsData.find((m) => m.id === missionId)

      if (!mission) {
        return { data: null, error: `Không tìm thấy Investigation "${investigationId}".` }
      }

      const investigation = mapMissionToInvestigation(mission, identity)
      return { data: clone(investigation), error: null }
    },

    async getInvestigationsByChapter(chapterId) {
      if (!chapterId) {
        return { data: null, error: 'Cần cung cấp chapterId.' }
      }

      const missions = missionsData.filter((m) => m.chapterId === chapterId)
      const investigations = missions.map((mission) => {
        const identity = getInvestigationIdentity(mission.id)
        return mapMissionToInvestigation(mission, identity)
      })

      return { data: clone(investigations), error: null }
    },

    validateInvestigation(investigation) {
      const errors = []
      if (!investigation || typeof investigation !== 'object' || Array.isArray(investigation)) {
        return { valid: false, errors: ['Investigation phải là một đối tượng hợp lệ.'] }
      }

      const id = investigation.investigationId || investigation.id
      if (!id || typeof id !== 'string') {
        errors.push('Investigation phải chứa investigationId (hoặc id) dạng chuỗi.')
      }

      if (!investigation.chapterId || typeof investigation.chapterId !== 'string') {
        errors.push('Investigation phải chứa chapterId dạng chuỗi.')
      }

      if (!investigation.datasetId || typeof investigation.datasetId !== 'string') {
        errors.push('Investigation phải chứa datasetId dạng chuỗi.')
      }

      if (!investigation.title || typeof investigation.title !== 'string') {
        errors.push('Investigation phải có tiêu đề (title).')
      }

      if (typeof investigation.ordering !== 'number' && typeof investigation.orderIndex !== 'number') {
        errors.push('Investigation phải có thứ tự sắp xếp (ordering / orderIndex).')
      }

      if (!Array.isArray(investigation.questionIds)) {
        errors.push('Investigation phải chứa mảng câu hỏi (questionIds).')
      }

      return { valid: errors.length === 0, errors }
    },
  }
}

export const mockInvestigationService = createMockInvestigationService()
