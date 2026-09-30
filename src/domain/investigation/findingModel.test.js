import { describe, it, expect } from 'vitest';
import { createFinding, createNoteFromFinding, FINDING_TYPES } from './findingModel.js';
import { investigationStateService } from '../../services/investigationSessionService.js';

describe('findingModel & Note Persistence Tests', () => {
  it('creates a normalized FACT finding by default', () => {
    const finding = createFinding({
      caseId: 'case-001',
      chapterId: 'ch-01',
      stepId: 'step-04',
      content: 'Bình An truy cập kho lúc 17:24.',
      source: {
        datasetId: 'ds-warehouse',
        tableId: 'access_logs',
        queryId: 'q-01',
      },
    });

    expect(finding.id).toBeDefined();
    expect(finding.caseId).toBe('case-001');
    expect(finding.chapterId).toBe('ch-01');
    expect(finding.stepId).toBe('step-04');
    expect(finding.type).toBe(FINDING_TYPES.FACT);
    expect(finding.content).toBe('Bình An truy cập kho lúc 17:24.');
    expect(finding.source.tableId).toBe('access_logs');
    expect(finding.source.datasetId).toBe('ds-warehouse');
  });

  it('supports INTERPRETATION type and keeps it distinct from FACT', () => {
    const fact = createFinding({
      caseId: 'case-001',
      content: 'Lê Hoa xuất 4.210 kg cà phê không có Form OUT-07',
      type: FINDING_TYPES.FACT,
    });

    const interpretation = createFinding({
      caseId: 'case-001',
      content: 'Lê Hoa có ý định tẩu tán hàng hóa ra khỏi kho',
      type: FINDING_TYPES.INTERPRETATION,
    });

    expect(fact.type).toBe('FACT');
    expect(interpretation.type).toBe('INTERPRETATION');
  });

  it('createNoteFromFinding generates a linked note referencing case, chapter, step, finding, source', () => {
    const finding = createFinding({
      id: 'find-test-1',
      caseId: 'case-001',
      chapterId: 'ch-01',
      stepId: 'step-04',
      type: FINDING_TYPES.FACT,
      content: 'Cửa kho B bị mở vào lúc 02:15 sáng.',
      source: {
        tableId: 'door_sensors',
        queryId: 'q-night-access',
      },
    });

    const note = createNoteFromFinding(finding);

    expect(note.findingId).toBe('find-test-1');
    expect(note.caseId).toBe('case-001');
    expect(note.chapterId).toBe('ch-01');
    expect(note.stepId).toBe('step-04');
    expect(note.findingType).toBe('FACT');
    expect(note.category).toBe('observation');
    expect(note.text).toContain('Cửa kho B bị mở vào lúc 02:15 sáng.');
    expect(note.source.tableId).toBe('door_sensors');
    // Ensure raw 500 rows are not included
    expect(note.rows).toBeUndefined();
  });

  it('investigationStateService.recordFinding persists finding AND automatically creates a linked note', () => {
    const caseId = 'case-test-persist';
    const userId = 'user-test-01';

    investigationStateService.recordFinding(caseId, userId, {
      chapterId: 'ch-02',
      stepId: 'step-03',
      type: FINDING_TYPES.FACT,
      content: 'Hóa đơn INV-8820 bị sửa số tiền từ 10M thành 120M',
      source: {
        tableId: 'invoices',
        queryId: 'q-inv-diff',
      },
      value: 110000000,
    });

    const state = investigationStateService.getState(caseId, userId);
    expect(state.findings.length).toBe(1);
    expect(state.findings[0].content).toBe('Hóa đơn INV-8820 bị sửa số tiền từ 10M thành 120M');
    expect(state.findings[0].chapterId).toBe('ch-02');
    expect(state.findings[0].stepId).toBe('step-03');

    // Note was automatically created
    expect(state.notes.length).toBe(1);
    expect(state.notes[0].findingId).toBe(state.findings[0].id);
    expect(state.notes[0].caseId).toBe(caseId);
    expect(state.notes[0].chapterId).toBe('ch-02');
    expect(state.notes[0].stepId).toBe('step-03');
    expect(state.notes[0].source.tableId).toBe('invoices');

    // Delete finding removes both finding and note
    investigationStateService.deleteFinding(caseId, userId, state.findings[0].id);
    const updatedState = investigationStateService.getState(caseId, userId);
    expect(updatedState.findings.length).toBe(0);
    expect(updatedState.notes.length).toBe(0);
  });
});
