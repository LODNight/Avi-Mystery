import coursesData from '../../mocks/data/courses.json'
import chaptersData from '../../mocks/data/chapters.json'
import datasetsData from '../../mocks/data/datasets.json'
import missionsData from '../../mocks/data/missions.json'
import { mockDatasetService } from './mockDatasetService.js'
import { mockInvestigationService } from './mockInvestigationService.js'
import { mockQuestionService } from './mockQuestionService.js'
import {
  getInvestigationIdentity,
  getPhaseIdentity,
  getPhasesByCourse,
  getQuestionIdentity,
  resolveLegacyMissionIdentity,
} from '../../domain/content/contentIdentity.js'

export function createMockContentService() {
  return {
    async getCourse(courseId) {
      const course = coursesData.find((c) => c.id === courseId || c.slug === courseId)
      if (!course) return { data: null, error: `Course not found: ${courseId}` }

      const phases = getPhasesByCourse(course.id)
      return {
        data: {
          ...course,
          phaseIds: phases.map((p) => p.id),
        },
        error: null,
      }
    },

    async getPhase(phaseId) {
      const phase = getPhaseIdentity(phaseId)
      if (!phase) return { data: null, error: `Phase not found: ${phaseId}` }

      return { data: phase, error: null }
    },

    async getChapter(chapterId) {
      const chapter = chaptersData.find((ch) => ch.id === chapterId)
      if (!chapter) return { data: null, error: `Chapter not found: ${chapterId}` }

      // Link to phase and investigations
      const legacyMissions = missionsData.filter((m) => m.chapterId === chapter.id)
      const mappedRef = resolveLegacyMissionIdentity(legacyMissions[0]?.id)

      return {
        data: {
          ...chapter,
          phaseId: mappedRef?.phaseId || null,
          investigationIds: legacyMissions.map((m) => {
            const resolved = resolveLegacyMissionIdentity(m.id)
            return resolved?.investigationId || m.id
          }),
        },
        error: null,
      }
    },

    async getDataset(datasetId, version = null) {
      return mockDatasetService.getDataset(datasetId, version)
    },

    async getInvestigation(investigationId) {
      return mockInvestigationService.getInvestigation(investigationId)
    },

    async getQuestion(questionId) {
      return mockQuestionService.getQuestion(questionId)
    },

    async resolveLegacyMission(missionId) {
      const resolved = resolveLegacyMissionIdentity(missionId)
      if (!resolved) return { data: null, error: `Legacy mission unknown: ${missionId}` }
      return { data: resolved, error: null }
    },
  }
}

export const mockContentService = createMockContentService()
