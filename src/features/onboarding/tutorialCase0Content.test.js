import { describe, it, expect } from 'vitest';
import {
  TUTORIAL_ID,
  TUTORIAL_XP,
  TUTORIAL_CASE_0,
  checkTutorialAnswer,
} from './tutorialCase0Content.js';

describe('tutorialCase0Content — Step 6.5.3', () => {

  // ─── Structural integrity ─────────────────────────────────────────────────

  describe('Content structure', () => {
    it('TUTORIAL_ID là "case-0" (phân biệt với mission production)', () => {
      expect(TUTORIAL_ID).toBe('case-0');
    });

    it('TUTORIAL_XP là 50 (giá trị khích lệ, nhỏ hơn mission thật)', () => {
      expect(TUTORIAL_XP).toBe(50);
    });

    it('TUTORIAL_CASE_0 có đầy đủ các sections: briefing, dataset, workspace, evaluator, spotlightSteps', () => {
      expect(TUTORIAL_CASE_0.briefing).toBeDefined();
      expect(TUTORIAL_CASE_0.dataset).toBeDefined();
      expect(TUTORIAL_CASE_0.workspace).toBeDefined();
      expect(TUTORIAL_CASE_0.evaluator).toBeDefined();
      expect(TUTORIAL_CASE_0.spotlightSteps).toBeDefined();
    });

    it('tool là "excel"', () => {
      expect(TUTORIAL_CASE_0.tool).toBe('excel');
    });

    it('difficulty là "tutorial" (không phải easy/hard)', () => {
      expect(TUTORIAL_CASE_0.difficulty).toBe('tutorial');
    });
  });

  // ─── Briefing ─────────────────────────────────────────────────────────────

  describe('Briefing', () => {
    it('có title và objective', () => {
      expect(TUTORIAL_CASE_0.briefing.title).toBeTruthy();
      expect(TUTORIAL_CASE_0.briefing.objective).toBeTruthy();
    });

    it('có hint hướng dẫn công thức', () => {
      expect(TUTORIAL_CASE_0.briefing.hint).toContain('=C2*D2');
    });
  });

  // ─── Dataset ──────────────────────────────────────────────────────────────

  describe('Dataset', () => {
    it('có đúng 5 cột: orderId, product, quantity, unitPrice, total', () => {
      const keys = TUTORIAL_CASE_0.dataset.columns.map((c) => c.key);
      expect(keys).toEqual(['orderId', 'product', 'quantity', 'unitPrice', 'total']);
    });

    it('chỉ có đúng 1 dòng dữ liệu (giảm cognitive load tối đa)', () => {
      expect(TUTORIAL_CASE_0.dataset.rows).toHaveLength(1);
    });

    it('dòng đầu tiên là ORD-001 với total = null (chờ người dùng điền)', () => {
      const row = TUTORIAL_CASE_0.dataset.rows[0];
      expect(row.orderId).toBe('ORD-001');
      expect(row.quantity).toBe(3);
      expect(row.unitPrice).toBe(150000);
      expect(row.total).toBeNull();
    });

    it('cột total là editable=true, các cột khác editable=false', () => {
      const totalCol = TUTORIAL_CASE_0.dataset.columns.find((c) => c.key === 'total');
      expect(totalCol.editable).toBe(true);

      const readOnlyCols = TUTORIAL_CASE_0.dataset.columns.filter((c) => c.key !== 'total');
      readOnlyCols.forEach((col) => {
        expect(col.editable).toBe(false);
      });
    });
  });

  // ─── Workspace ────────────────────────────────────────────────────────────

  describe('Workspace config', () => {
    it('targetCell là E2 (cột Thành tiền, dòng đầu tiên)', () => {
      expect(TUTORIAL_CASE_0.workspace.targetCell).toBe('E2');
    });

    it('formulaPlaceholder chứa gợi ý công thức', () => {
      expect(TUTORIAL_CASE_0.workspace.formulaPlaceholder).toBe('=C2*D2');
    });
  });

  // ─── Evaluator ────────────────────────────────────────────────────────────

  describe('Evaluator config', () => {
    it('expectedFormula là =C2*D2', () => {
      expect(TUTORIAL_CASE_0.evaluator.expectedFormula).toBe('=C2*D2');
    });

    it('expectedValue là 450000 (3 × 150000)', () => {
      expect(TUTORIAL_CASE_0.evaluator.expectedValue).toBe(450000);
    });

    it('có feedback cho correct, incorrect, và empty', () => {
      expect(TUTORIAL_CASE_0.evaluator.feedback.correct).toBeTruthy();
      expect(TUTORIAL_CASE_0.evaluator.feedback.incorrect).toBeTruthy();
      expect(TUTORIAL_CASE_0.evaluator.feedback.empty).toBeTruthy();
    });
  });

  // ─── Spotlight steps ──────────────────────────────────────────────────────

  describe('Spotlight steps', () => {
    it('có đúng 4 bước hướng dẫn', () => {
      expect(TUTORIAL_CASE_0.spotlightSteps).toHaveLength(4);
    });

    it('mỗi bước có id, target, title, body', () => {
      TUTORIAL_CASE_0.spotlightSteps.forEach((step) => {
        expect(step.id).toBeTruthy();
        expect(step.target).toMatch(/^#/); // CSS selector bắt đầu bằng #
        expect(step.title).toBeTruthy();
        expect(step.body).toBeTruthy();
      });
    });

    it('bước cuối cùng nhắm vào submit button', () => {
      const lastStep = TUTORIAL_CASE_0.spotlightSteps[3];
      expect(lastStep.target).toBe('#tutorial-submit-btn');
    });
  });

  // ─── checkTutorialAnswer ──────────────────────────────────────────────────

  describe('checkTutorialAnswer — formula evaluation', () => {
    it('trả về isCorrect=true khi công thức đúng =C2*D2 (chính xác)', () => {
      const result = checkTutorialAnswer('=C2*D2');
      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toContain('✅');
    });

    it('trả về isCorrect=true khi công thức đúng nhưng viết hoa =c2*d2', () => {
      const result = checkTutorialAnswer('=c2*d2');
      expect(result.isCorrect).toBe(true);
    });

    it('trả về isCorrect=true khi công thức có khoảng trắng thừa "= C2 * D2"', () => {
      const result = checkTutorialAnswer('= C2 * D2');
      expect(result.isCorrect).toBe(true);
    });

    it('trả về isCorrect=true khi người dùng nhập trực tiếp số 450000', () => {
      const result = checkTutorialAnswer('450000');
      expect(result.isCorrect).toBe(true);
    });

    it('trả về isCorrect=false khi công thức sai (=C2+D2)', () => {
      const result = checkTutorialAnswer('=C2+D2');
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('❌');
    });

    it('trả về isCorrect=false khi ô trống (empty string)', () => {
      const result = checkTutorialAnswer('');
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('⚠️');
    });

    it('trả về isCorrect=false khi ô null/undefined', () => {
      expect(checkTutorialAnswer(null).isCorrect).toBe(false);
      expect(checkTutorialAnswer(undefined).isCorrect).toBe(false);
    });

    it('trả về isCorrect=false khi nhập số sai (999)', () => {
      const result = checkTutorialAnswer('999');
      expect(result.isCorrect).toBe(false);
    });
  });
});
