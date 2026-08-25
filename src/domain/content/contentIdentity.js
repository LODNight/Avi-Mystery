/**
 * Learning Domain Entity Identity Definitions & Graph Contract
 * Establishes stable identities for Course, Phase, Chapter, Dataset, Investigation, and Question.
 */

export const ENTITY_TYPES = Object.freeze({
  COURSE: 'course',
  PHASE: 'phase',
  CHAPTER: 'chapter',
  DATASET: 'dataset',
  INVESTIGATION: 'investigation',
  QUESTION: 'question',
})

export const IDENTITY_PREFIXES = Object.freeze({
  [ENTITY_TYPES.COURSE]: 'course-',
  [ENTITY_TYPES.PHASE]: 'phase-',
  [ENTITY_TYPES.CHAPTER]: 'ch-',
  [ENTITY_TYPES.DATASET]: ['ds-', 'sql-'],
  [ENTITY_TYPES.INVESTIGATION]: 'inv-',
  [ENTITY_TYPES.QUESTION]: 'q-',
})

/**
 * Validates if an ID belongs to a given entity type format.
 *
 * @param {string} entityType
 * @param {string} id
 * @returns {boolean}
 */
export function isValidEntityId(entityType, id) {
  if (!id || typeof id !== 'string') return false
  const prefix = IDENTITY_PREFIXES[entityType]
  if (!prefix) return false

  if (Array.isArray(prefix)) {
    return prefix.some((p) => id.startsWith(p))
  }
  return id.startsWith(prefix)
}

// Internal registry mapping legacy missions to new domain graph
const LEGACY_MISSION_GRAPH = [
  // Course 1: Excel Adventure
  { missionId: 'mission-001', invId: 'inv-001', qId: 'q-001', chId: 'ch-001', phaseId: 'phase-001', courseId: 'course-001', datasetId: 'ds-001', tool: 'excel' },
  { missionId: 'mission-002', invId: 'inv-002', qId: 'q-002', chId: 'ch-001', phaseId: 'phase-001', courseId: 'course-001', datasetId: 'ds-001', tool: 'excel' },
  { missionId: 'mission-003', invId: 'inv-003', qId: 'q-003', chId: 'ch-001', phaseId: 'phase-001', courseId: 'course-001', datasetId: 'ds-001', tool: 'excel' },
  { missionId: 'mission-004', invId: 'inv-004', qId: 'q-004', chId: 'ch-002', phaseId: 'phase-002', courseId: 'course-001', datasetId: 'ds-001', tool: 'excel' },
  { missionId: 'mission-005', invId: 'inv-005', qId: 'q-005', chId: 'ch-002', phaseId: 'phase-002', courseId: 'course-001', datasetId: 'ds-001', tool: 'excel' },
  { missionId: 'mission-006', invId: 'inv-006', qId: 'q-006', chId: 'ch-002', phaseId: 'phase-002', courseId: 'course-001', datasetId: 'ds-002', tool: 'excel' },
  { missionId: 'mission-007', invId: 'inv-007', qId: 'q-007', chId: 'ch-003', phaseId: 'phase-003', courseId: 'course-001', datasetId: 'ds-002', tool: 'excel' },
  { missionId: 'mission-008', invId: 'inv-008', qId: 'q-008', chId: 'ch-003', phaseId: 'phase-003', courseId: 'course-001', datasetId: 'ds-001', tool: 'excel' },
  { missionId: 'mission-009', invId: 'inv-009', qId: 'q-009', chId: 'ch-003', phaseId: 'phase-003', courseId: 'course-001', datasetId: 'ds-001', tool: 'excel' },

  // Course 2: SQL Investigation
  { missionId: 'mission-010', invId: 'inv-010', qId: 'q-010', chId: 'ch-004', phaseId: 'phase-004', courseId: 'course-002', datasetId: 'sql-sales-v1', tool: 'sql' },
  { missionId: 'mission-011', invId: 'inv-011', qId: 'q-011', chId: 'ch-004', phaseId: 'phase-004', courseId: 'course-002', datasetId: 'sql-sales-v1', tool: 'sql' },
  { missionId: 'mission-012', invId: 'inv-012', qId: 'q-012', chId: 'ch-004', phaseId: 'phase-004', courseId: 'course-002', datasetId: 'sql-sales-v1', tool: 'sql' },
  { missionId: 'mission-013', invId: 'inv-013', qId: 'q-013', chId: 'ch-005', phaseId: 'phase-005', courseId: 'course-002', datasetId: 'sql-sales-v1', tool: 'sql' },
  { missionId: 'mission-014', invId: 'inv-014', qId: 'q-014', chId: 'ch-005', phaseId: 'phase-005', courseId: 'course-002', datasetId: 'sql-sales-v1', tool: 'sql' },
  { missionId: 'mission-015', invId: 'inv-015', qId: 'q-015', chId: 'ch-005', phaseId: 'phase-005', courseId: 'course-002', datasetId: 'sql-sales-v1', tool: 'sql' },
  { missionId: 'mission-016', invId: 'inv-016', qId: 'q-016', chId: 'ch-006', phaseId: 'phase-006', courseId: 'course-002', datasetId: 'sql-commerce-v1', tool: 'sql' },
  { missionId: 'mission-017', invId: 'inv-017', qId: 'q-017', chId: 'ch-006', phaseId: 'phase-006', courseId: 'course-002', datasetId: 'sql-commerce-v1', tool: 'sql' },
  { missionId: 'mission-018', invId: 'inv-018', qId: 'q-018', chId: 'ch-006', phaseId: 'phase-006', courseId: 'course-002', datasetId: 'sql-commerce-v1', tool: 'sql' },
]

// Phase definitions
const PHASES = [
  { id: 'phase-001', courseId: 'course-001', orderIndex: 1, title: 'Giai đoạn 1: Cơ bản Excel', chapterIds: ['ch-001'] },
  { id: 'phase-002', courseId: 'course-001', orderIndex: 2, title: 'Giai đoạn 2: Logic & Thống kê', chapterIds: ['ch-002'] },
  { id: 'phase-003', courseId: 'course-001', orderIndex: 3, title: 'Giai đoạn 3: Phân tích Nâng cao', chapterIds: ['ch-003'] },
  { id: 'phase-004', courseId: 'course-002', orderIndex: 1, title: 'Giai đoạn 1: Khám phá SQL', chapterIds: ['ch-004'] },
  { id: 'phase-005', courseId: 'course-002', orderIndex: 2, title: 'Giai đoạn 2: Gom nhóm & Lọc', chapterIds: ['ch-005'] },
  { id: 'phase-006', courseId: 'course-002', orderIndex: 3, title: 'Giai đoạn 3: Liên kết Bảng (JOIN)', chapterIds: ['ch-006'] },
]

function normalizeId(id) {
  if (!id || typeof id !== 'string') return id
  if (id === 'sql-mission-01') return 'mission-010'
  if (id === 'inv-sql-01') return 'inv-010'
  if (id === 'q-sql-01') return 'q-010'
  return id
}

/**
 * Resolves legacy missionId to the new domain entity graph.
 *
 * @param {string} missionId
 * @returns {Object|null}
 */
export function resolveLegacyMissionIdentity(missionId) {
  const normId = normalizeId(missionId)
  const match = LEGACY_MISSION_GRAPH.find((item) => item.missionId === normId || item.missionId === missionId)
  if (!match) return null

  return {
    missionId: match.missionId,
    investigationId: match.invId,
    questionId: match.qId,
    chapterId: match.chId,
    phaseId: match.phaseId,
    courseId: match.courseId,
    datasetId: match.datasetId,
    tool: match.tool,
  }
}

/**
 * Resolves questionId to its explicit entity identity metadata.
 *
 * @param {string} questionId
 * @returns {Object|null}
 */
export function getQuestionIdentity(questionId) {
  const normId = normalizeId(questionId)
  const match = LEGACY_MISSION_GRAPH.find((item) => item.qId === normId || item.qId === questionId || item.missionId === normId || item.missionId === questionId)
  if (!match) return null

  return {
    id: match.qId,
    investigationId: match.invId,
    datasetId: match.datasetId,
    tool: match.tool,
    legacyMissionId: match.missionId,
  }
}

/**
 * Resolves investigationId to its explicit entity identity metadata.
 *
 * @param {string} investigationId
 * @returns {Object|null}
 */
export function getInvestigationIdentity(investigationId) {
  const normId = normalizeId(investigationId)
  const match = LEGACY_MISSION_GRAPH.find((item) => item.invId === normId || item.invId === investigationId || item.missionId === normId || item.missionId === investigationId)
  if (!match) return null

  return {
    id: match.invId,
    chapterId: match.chId,
    phaseId: match.phaseId,
    courseId: match.courseId,
    datasetId: match.datasetId,
    questionIds: [match.qId],
    legacyMissionId: match.missionId,
  }
}

/**
 * Resolves phaseId to its explicit Phase identity record.
 *
 * @param {string} phaseId
 * @returns {Object|null}
 */
export function getPhaseIdentity(phaseId) {
  return PHASES.find((p) => p.id === phaseId) || null
}

/**
 * Returns all phases for a given course.
 *
 * @param {string} courseId
 * @returns {Array}
 */
export function getPhasesByCourse(courseId) {
  return PHASES.filter((p) => p.courseId === courseId)
}
