import coursesData from '../../mocks/data/courses.json';
import chaptersData from '../../mocks/data/chapters.json';

const DELAY = 300;
function delay(ms = DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockCourseService = {
  async getCourses(filters = {}) {
    await delay();
    let list = [...coursesData];

    // Filter theo status nếu có
    if (filters.status) {
      list = list.filter((c) => c.status === filters.status);
    }

    return { data: list, error: null };
  },

  async getCourse(slugOrId) {
    await delay();
    const course = coursesData.find(
      (c) => c.id === slugOrId || c.slug === slugOrId
    );
    if (!course) {
      return { data: null, error: `Không tìm thấy course "${slugOrId}".` };
    }
    return { data: course, error: null };
  },

  async getChaptersByCourse(courseId) {
    await delay();
    const chapters = chaptersData
      .filter((ch) => ch.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    return { data: chapters, error: null };
  },
};
