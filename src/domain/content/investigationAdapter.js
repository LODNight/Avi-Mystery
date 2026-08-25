import { resolveLegacyMissionIdentity } from './contentIdentity.js'

/**
 * Maps a raw legacy Mission object (and optional graph identity) to a canonical Investigation domain entity.
 *
 * @param {Object} mission Raw mission object from missions.json
 * @param {Object} [graphIdentity] Resolved identity graph object from contentIdentity.js
 * @returns {Object|null} Canonical Investigation entity
 */
export function mapMissionToInvestigation(mission, graphIdentity = null) {
  if (!mission || typeof mission !== 'object') return null

  const resolved = graphIdentity || resolveLegacyMissionIdentity(mission.id)

  const investigationId = resolved?.investigationId || resolved?.id || mission.id
  const chapterId = resolved?.chapterId || mission.chapterId || null
  const phaseId = resolved?.phaseId || null
  const courseId = resolved?.courseId || mission.courseId || null
  const datasetId = resolved?.datasetId || mission.datasetId || null
  const questionIds = resolved?.questionIds || (resolved?.questionId ? [resolved.questionId] : (resolved?.qId ? [resolved.qId] : []))

  const narrative = mission.story || mission.description || ''
  const ordering = Number.isInteger(mission.orderIndex) ? mission.orderIndex : 1
  const status = mission.status || 'published'

  return {
    investigationId,
    id: investigationId,
    chapterId,
    phaseId,
    courseId,
    datasetId,
    title: mission.title || '',
    narrative,
    story: narrative,
    objective: mission.objective || '',
    ordering,
    orderIndex: ordering,
    status,
    questionIds,
    legacyMissionId: mission.id,
    metadata: {
      tool: mission.tool || resolved?.tool || 'excel',
      difficulty: mission.difficulty || 'beginner',
    },
  }
}
