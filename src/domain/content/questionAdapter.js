import { getQuestionIdentity } from './contentIdentity.js'

/**
 * Maps a raw legacy Mission/Step object (and optional graph identity) to a canonical Question domain entity.
 *
 * @param {Object} mission Raw mission/step object from missions.json
 * @param {Object} [graphIdentity] Resolved identity graph object from contentIdentity.js
 * @returns {Object|null} Canonical Question entity
 */
export function mapMissionToQuestion(mission, graphIdentity = null) {
  if (!mission || typeof mission !== 'object') return null

  const resolved = graphIdentity || getQuestionIdentity(mission.id)

  const questionId = resolved?.id || (mission.id.startsWith('q-') ? mission.id : `q-${mission.id.replace(/^mission-/, '')}`)
  const investigationId = resolved?.investigationId || `inv-${mission.id.replace(/^mission-/, '')}`
  const datasetId = resolved?.datasetId || mission.datasetId || null

  const tool = mission.tool || resolved?.tool || 'excel'
  const type = tool === 'sql' ? 'sql_query' : 'excel_formula'
  const difficulty = mission.difficulty || 'beginner'
  const skillId = `skill-${tool}-${mission.category || 'basics'}`

  const prompt = mission.task || mission.description || mission.title || ''

  const hints = []
  if (mission.hint) {
    hints.push({
      id: `${questionId}-hint-1`,
      text: mission.hint,
      costXp: 10,
    })
  }

  const checkerConfig = {
    targetCell: mission.targetCell || null,
    expectedResult: mission.expectedResult ?? null,
    initialFormula: mission.initialFormula || null,
    starterSql: mission.starterSql || null,
    allowedTables: mission.tables || null,
  }

  const baseXp = mission.reward?.xp || mission.xp || 100

  return {
    questionId,
    id: questionId,
    investigationId,
    datasetId,
    skillId,
    difficulty,
    tool,
    type,
    prompt,
    checkerConfig,
    starterContent: {
      initialFormula: mission.initialFormula || null,
      starterSql: mission.starterSql || null,
    },
    hints,
    rewards: {
      baseXp,
    },
    legacyMissionId: mission.id,
  }
}
