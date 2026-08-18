import missionsData from '../../mocks/data/missions.json';

const DELAY = 300;
function delay(ms = DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockMissionService = {
  async getMissionsByChapter(chapterId) {
    await delay();
    const missions = missionsData
      .filter((m) => m.chapterId === chapterId && m.status === 'published')
      .sort((a, b) => a.orderIndex - b.orderIndex);
    return { data: missions, error: null };
  },

  async getMission(missionId) {
    await delay();
    const mission = missionsData.find((m) => m.id === missionId);
    if (!mission) {
      return { data: null, error: `Không tìm thấy mission "${missionId}".` };
    }
    return { data: mission, error: null };
  },

  async getRecommendedMissions(_userId) {
    await delay();
    // Trả về 3 mission đầu tiên của khóa Excel (giả lập gợi ý)
    const recommended = missionsData
      .filter((m) => m.status === 'published')
      .slice(0, 3);
    return { data: recommended, error: null };
  },
};
