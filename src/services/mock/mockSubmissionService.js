import missionsData from '../../mocks/data/missions.json';
import { checkExcelAnswer } from '../../utils/excelChecker.js';
import { storage } from '../../utils/storage.js';

const DELAY = 0;
function delay(ms = DELAY) {
  if (ms === 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SUBMISSIONS_KEY = 'submission_history';
const SESSION_KEY = 'session';

export const mockSubmissionService = {
  /**
   * Chấm điểm bài nộp Excel Mission
   * @param {Object} params
   * @param {string} [params.userId] - Mã người dùng
   * @param {string} params.missionId - Mã vụ án bài học
   * @param {string} params.userFormula - Công thức do người học nhập
   * @param {Object} [params.sheetData={}] - Dữ liệu bảng tính
   * @param {number} [params.hintsUnlockedCount=0] - Số gợi ý đã mở khóa
   */
  async submitExcelMission({ userId, missionId, userFormula, sheetData = {}, hintsUnlockedCount = 0 }) {
    await delay();

    const mission = missionsData.find((m) => m.id === missionId);
    if (!mission) {
      return { data: null, error: `Không tìm thấy bài học "${missionId}".` };
    }
    const starterContent = mission.starterContent || {};

    // Xác định expected formula & expected value từ mission metadata
    let expectedFormula = starterContent.expectedFormula || '=C2*D2';
    if (missionId === 'mission-001') {
      expectedFormula = ['=C2*D2', '=D2*C2', '=PRODUCT(C2,D2)'];
    }
    const expectedValue = starterContent.expectedValue !== undefined ? starterContent.expectedValue : 450000;

    // Chấm điểm công thức bằng excelChecker
    const checkResult = checkExcelAnswer({
      userFormula,
      expectedFormula,
      expectedValue,
      sheetData,
    });

    const isCorrect = checkResult.isCorrect;
    const baseXp = mission.rewardXp || 100;
    const hintPenalty = hintsUnlockedCount * 15;
    const netXp = isCorrect ? Math.max(0, baseXp - hintPenalty) : 0;

    let userLevelUp = false;
    let updatedUser = null;

    if (isCorrect) {
      // Cập nhật XP người dùng trong LocalStorage Session
      const currentUser = storage.get(SESSION_KEY);
      if (currentUser) {
        const newXp = (currentUser.xp || 0) + netXp;
        let newLevel = currentUser.level || 1;
        let xpNext = currentUser.xpToNextLevel || 1000;

        if (newXp >= xpNext) {
          newLevel += 1;
          xpNext = newLevel * 1000;
          userLevelUp = true;
        }

        updatedUser = {
          ...currentUser,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: xpNext,
        };

        storage.set(SESSION_KEY, updatedUser);
      }

      // Lưu lịch sử bài nộp
      const submissions = storage.get(SUBMISSIONS_KEY) || [];
      const newSubmission = {
        id: `sub-${Date.now()}`,
        userId: userId || currentUser?.id || 'guest',
        missionId,
        userFormula,
        isCorrect: true,
        netXp,
        submittedAt: new Date().toISOString(),
      };
      submissions.push(newSubmission);
      storage.set(SUBMISSIONS_KEY, submissions);
    }

    return {
      data: {
        isCorrect,
        score: checkResult.score,
        netXp,
        baseXp,
        hintPenalty,
        userLevelUp,
        updatedUser,
        feedback: checkResult.feedback,
        userFormulaNormalized: checkResult.userFormulaNormalized,
        missionTitle: mission.title,
      },
      error: null,
    };
  },

  /**
   * Lấy lịch sử nộp bài của người dùng
   */
  async getSubmissionHistory(userId) {
    await delay(100);
    const submissions = storage.get(SUBMISSIONS_KEY) || [];
    const userSubs = submissions.filter((s) => s.userId === userId);
    return { data: userSubs, error: null };
  },
};
