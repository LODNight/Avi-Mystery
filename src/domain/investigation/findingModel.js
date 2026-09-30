/**
 * findingModel.js
 *
 * Domain model for Investigation Findings and linked Notes.
 *
 * Semantic distinction:
 *   RAW EVIDENCE
 *       ↓
 *   PLAYER FINDING
 *       ├── FACT: Direct observation of what the evidence shows.
 *       │         (e.g., "Bình An accessed the fund area at 17:24.")
 *       │         Describes what the records or witness explicitly state.
 *       │         (NOTE: NOT system-verified truth at record time; objective
 *       │          correctness is evaluated later during Final Synthesis / HQ Report).
 *       └── INTERPRETATION: Player's subjective inference, hypothesis, or deduction.
 *                 (e.g., "Bình An entered the fund area to steal the money.")
 *
 * A Finding is NOT raw query results (500 rows). It is the player's
 * formulated finding plus evidence source reference.
 */

export const FINDING_TYPES = Object.freeze({
  FACT: 'FACT',
  INTERPRETATION: 'INTERPRETATION',
});

function generateId() {
  return `find-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Creates a normalized Finding entity.
 *
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string} params.caseId
 * @param {string} [params.chapterId]
 * @param {string} [params.stepId]
 * @param {string} [params.type] - 'FACT' | 'INTERPRETATION'
 * @param {string} params.content - The factual observation or hypothesis
 * @param {Object} [params.source] - Metadata: { datasetId, tableId, queryId, query, selectedRow }
 * @param {*} [params.value] - Derived calculated value (if applicable)
 * @param {string} [params.investigationContext]
 * @param {string} [params.createdAt]
 * @returns {Object} Normalized Finding object
 */
export function createFinding({
  id = null,
  caseId,
  chapterId = null,
  stepId = null,
  phaseId = null,
  type = FINDING_TYPES.FACT,
  content = '',
  claim = '',
  source = null,
  sourceEvidenceId = null,
  datasetId = null,
  tableId = null,
  queryId = null,
  query = null,
  selectedRow = null,
  value = null,
  investigationContext = '',
  createdAt = null,
} = {}) {
  const findingId = id || generateId();
  const validChapterId = chapterId || phaseId || null;
  const validContent = String(content || claim || '').trim();
  const validType = type === FINDING_TYPES.INTERPRETATION ? FINDING_TYPES.INTERPRETATION : FINDING_TYPES.FACT;
  const nowStr = createdAt || new Date().toISOString();

  // Normalize source metadata — do NOT store 500 rows
  const normalizedSource = {
    datasetId: source?.datasetId || datasetId || null,
    tableId: source?.tableId || tableId || sourceEvidenceId || null,
    queryId: source?.queryId || queryId || null,
    query: source?.query || (typeof query === 'string' ? query.slice(0, 300) : null),
    selectedRow: selectedRow ? (Array.isArray(selectedRow) ? selectedRow.slice(0, 10) : selectedRow) : null,
  };

  return {
    id: findingId,
    findingId, // Alias for backward compatibility
    caseId,
    chapterId: validChapterId,
    phaseId: validChapterId, // Alias for backward compatibility
    stepId: stepId || null,
    type: validType,
    content: validContent,
    claim: validContent, // Alias for backward compatibility
    value: value !== undefined ? value : null,
    source: normalizedSource,
    sourceEvidenceId: normalizedSource.tableId || normalizedSource.datasetId || null,
    investigationContext: String(investigationContext || '').trim(),
    createdAt: nowStr,
    recordedAt: nowStr,
  };
}

/**
 * Creates a persistent investigation Note linked to a Finding.
 *
 * @param {Object} finding - A normalized Finding object
 * @returns {Object} Note object referencing Case, Chapter, Step, Finding, Source
 */
export function createNoteFromFinding(finding) {
  if (!finding) return null;

  const nowStr = finding.createdAt || new Date().toISOString();
  const isFact = finding.type === FINDING_TYPES.FACT;

  return {
    id: `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    caseId: finding.caseId,
    chapterId: finding.chapterId,
    stepId: finding.stepId,
    findingId: finding.id,
    findingType: finding.type,
    type: 'finding_note',
    category: isFact ? 'observation' : 'theory',
    text: `[${finding.type}] ${finding.content}`,
    content: finding.content,
    source: {
      datasetId: finding.source?.datasetId || null,
      tableId: finding.source?.tableId || null,
      queryId: finding.source?.queryId || null,
    },
    sourceId: finding.source?.tableId || finding.source?.datasetId || null,
    evidenceRef: finding.source?.tableId || null,
    createdAt: nowStr,
    updatedAt: nowStr,
  };
}
