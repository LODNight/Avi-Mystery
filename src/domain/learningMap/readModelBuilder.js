/**
 * readModelBuilder.js
 * 
 * Deterministic builder to generate the Learning Map Read Model (learning_map_views)
 * from the Source of Truth entities (Course, Chapters, Missions/Investigations).
 */

/**
 * Builds a materialized read model for a single course.
 * 
 * @param {Object} course The published Course document
 * @param {Array<Object>} chapters All chapters associated with the course
 * @param {Array<Object>} nodes All missions/investigations associated with the course
 * @returns {Object|null} The Learning Map Read Model document, or null if course is not published
 */
export function buildLearningMapView(course, chapters = [], nodes = []) {
  if (!course || course.status !== 'published') {
    return null;
  }

  // 1. Filter published chapters and sort by orderIndex
  const publishedChapters = chapters
    .filter(ch => ch.status === 'published' && ch.courseId === course.id)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  // 2. Map chapters and nest their published nodes
  const chaptersView = publishedChapters.map(ch => {
    // Find nodes for this chapter, filter published, sort by orderIndex
    const chapterNodes = nodes
      .filter(node => node.chapterId === ch.id && node.status === 'published')
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map(node => ({
        nodeId: node.id,
        nodeType: node.type || 'mission', // Fallback to mission if type not explicitly set
        title: node.title,
        objective: node.objective,
        rewardXp: node.rewardXp || 0,
        tool: node.tool,
        order: node.orderIndex || 1,
        targetUrl: node.targetUrl || null
      }));

    return {
      chapterId: ch.id,
      title: ch.title,
      order: ch.orderIndex || 1,
      status: ch.status,
      nodes: chapterNodes
    };
  });

  // 3. Construct the Read Model document
  return {
    courseId: course.id,
    schemaVersion: 1,
    contentVersion: course.version || 1, // Derived from Source of Truth
    title: course.title,
    status: course.status,
    order: course.orderIndex || 1,
    chapters: chaptersView,
    generatedAt: new Date().toISOString(),
    updatedAt: course.updatedAt || new Date().toISOString()
  };
}
