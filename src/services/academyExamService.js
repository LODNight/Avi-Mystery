/**
 * Academy Exam Service (Sprint 9.5 — Step 9.5.3)
 * Quản lý logic chấm điểm kỳ thi tốt nghiệp, lưu kết quả làm bài
 * và cấp chứng chỉ điện tử cho học viên.
 */

import { ACADEMY_EXAMS, getExamBySlug } from '../mocks/data/academy/academyExams.js';
import { progressService } from './index.js';
import { storage } from '../utils/storage.js';

export const academyExamService = {
  /**
   * Lấy cấu hình và danh sách câu hỏi của kỳ thi theo slug
   */
  getExam(courseSlug) {
    const exam = getExamBySlug(courseSlug);
    if (!exam) {
      return { data: null, error: { message: `Không tìm thấy kỳ thi cho khóa học ${courseSlug}` } };
    }
    return { data: exam, error: null };
  },

  /**
   * Lấy kết quả thi đã lưu của học viên cho khóa học cụ thể
   */
  getExamResult(learnerId, courseSlug) {
    if (!learnerId || !courseSlug) return { data: null, error: null };
    const key = `academy_exam:${learnerId}:${courseSlug}`;
    const result = storage.get(key);
    return { data: result || null, error: null };
  },

  /**
   * Lấy danh sách tất cả chứng chỉ đã nhận của học viên
   */
  getLearnerCertificates(learnerId) {
    if (!learnerId) return { data: [], error: null };
    const key = `academy_certificates:${learnerId}`;
    const certificates = storage.get(key);
    return { data: Array.isArray(certificates) ? certificates : [], error: null };
  },

  /**
   * Chấm điểm bài thi, lưu kết quả, cấp chứng chỉ và cộng XP nếu đạt chuẩn (>= 80%)
   * @param {Object} payload
   * @param {string} payload.learnerId
   * @param {string} payload.learnerName
   * @param {string} payload.courseSlug
   * @param {Object|Array} payload.answers { [questionId]: selectedIndex }
   * @param {number} payload.timeSpentSeconds
   */
  async submitExam({ learnerId, learnerName, courseSlug, answers = {}, timeSpentSeconds = 0 }) {
    const exam = getExamBySlug(courseSlug);
    if (!exam) {
      return { data: null, error: { message: 'Kỳ thi không tồn tại.' } };
    }

    const totalQuestions = exam.questions.length;
    let totalCorrect = 0;

    const questionResults = exam.questions.map((q, idx) => {
      const selectedIndex = Array.isArray(answers) ? answers[idx] : answers[q.id];
      const isSelected = selectedIndex !== undefined && selectedIndex !== null;
      const isCorrect = isSelected && Number(selectedIndex) === Number(q.correctIndex);
      if (isCorrect) totalCorrect += 1;

      return {
        questionId: q.id,
        category: q.category,
        text: q.text,
        options: q.options,
        selectedIndex: isSelected ? Number(selectedIndex) : null,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scorePercent = Math.round((totalCorrect / totalQuestions) * 100);
    const isPassed = scorePercent >= exam.passingScorePercent;

    let grade = 'Chưa Đạt';
    if (scorePercent >= 95) {
      grade = 'Xuất Sắc (High Distinction)';
    } else if (scorePercent >= 90) {
      grade = 'Giỏi (Distinction)';
    } else if (scorePercent >= 80) {
      grade = 'Đạt Chuẩn (Proficient)';
    }

    let certificate = null;

    if (isPassed) {
      const toolCode = courseSlug.startsWith('excel') ? 'EXCEL' : 'SQL';
      const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
      const certId = `AVI-${toolCode}-CERT-${randomPart}`;

      certificate = {
        id: certId,
        certificateId: certId,
        courseSlug,
        courseTitle: exam.courseTitle,
        shortTitle: exam.shortTitle,
        tool: exam.courseSlug.startsWith('excel') ? 'excel' : 'sql',
        learnerId,
        learnerName: learnerName?.trim() || 'Thám Tử Dữ Liệu',
        scorePercent,
        totalCorrect,
        totalQuestions,
        grade,
        issuedAt: new Date().toISOString(),
        verificationCode: `VERIFY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      };

      // Lưu chứng chỉ vào danh sách chứng chỉ của học viên
      if (learnerId) {
        const certKey = `academy_certificates:${learnerId}`;
        const existingCerts = storage.get(certKey) || [];
        // Thay thế chứng chỉ cũ của cùng courseSlug nếu thi lại điểm cao hơn, hoặc thêm mới
        const filtered = existingCerts.filter(c => c.courseSlug !== courseSlug);
        filtered.push(certificate);
        storage.set(certKey, filtered);
      }

      // Idempotent XP Award qua progressService
      try {
        if (learnerId) {
          await progressService.awardXp({
            learnerId,
            contentId: `academy-exam-${courseSlug}`,
            contentType: 'question',
            mode: 'practice',
            submissionResult: {
              isCorrect: true,
              score: scorePercent,
              attemptId: `exam-${courseSlug}-${Date.now()}`,
            },
            question: {
              baseXp: exam.rewardXp,
              skillId: courseSlug.startsWith('excel') ? 'excel_formula' : 'sql_query',
            },
          });
        }
      } catch (err) {
        console.error('Error awarding exam XP:', err);
      }
    }

    const examSummary = {
      courseSlug,
      learnerId,
      scorePercent,
      totalCorrect,
      totalQuestions,
      isPassed,
      grade,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
      certificateId: certificate ? certificate.certificateId : null,
      questionResults,
    };

    if (learnerId) {
      const examKey = `academy_exam:${learnerId}:${courseSlug}`;
      storage.set(examKey, examSummary);
    }

    return {
      data: {
        ...examSummary,
        certificate,
        rewardXp: isPassed ? exam.rewardXp : 0,
      },
      error: null,
    };
  },
};
