/**
 * Learning Map Domain Adapter (Step 6.1)
 * Transforms raw domain models (Journey -> Phase -> Chapter -> Investigation -> Question)
 * and learner progress into a normalized tree structure for Learning Map rendering.
 */

/**
 * Translates legacy Mission object to normalized Investigation entity representation.
 *
 * @param {Object} mission Legacy mission object
 * @returns {Object|null} Normalized Investigation entity
 */
export function translateLegacyMissionToInvestigation(mission) {
  if (!mission || typeof mission !== 'object') return null
  return {
    investigationId: mission.investigationId || mission.id,
    missionId: mission.legacyMissionId || mission.missionId || mission.id,
    chapterId: mission.chapterId || 'ch-001',
    datasetId: mission.datasetId || null,
    title: mission.title || '',
    objective: mission.objective || '',
    rewardXp: typeof mission.rewardXp === 'number' ? mission.rewardXp : (mission.rewards?.baseXp || 50),
    tool: mission.tool || mission.metadata?.tool || 'excel',
    status: mission.status || 'published',
  }
}

/**
 * Transforms an Investigation entity and associated child questions/progress
 * into a UI-ready InvestigationNode.
 *
 * @param {Object} params
 * @param {Object} params.investigation Investigation entity or legacy mission
 * @param {Array} [params.questions=[]] Child questions
 * @param {Map|Array} [params.progressList=[]] Learner progress records
 * @param {boolean} [params.isCurrent=false] Whether node is active current lesson
 * @param {boolean} [params.isLocked=false] Whether node is locked by prerequisites
 * @param {number} [params.chapterIndex=1] Chapter order index
 * @param {number} [params.nodeIndex=1] Investigation order index in chapter
 * @returns {Object} Normalized InvestigationNode
 */
export function transformToInvestigationNode({
  investigation,
  questions = [],
  progressList = [],
  isCurrent = false,
  isLocked = false,
  chapterIndex = 1,
  nodeIndex = 1,
}) {
  const normInv = translateLegacyMissionToInvestigation(investigation)
  if (!normInv) return null

  // Build progress lookup helper
  const pMap = progressList instanceof Map
    ? progressList
    : new Map((Array.isArray(progressList) ? progressList : []).map(p => [p.contentId, p]))

  const invProgress = pMap.get(normInv.investigationId) || pMap.get(normInv.missionId) || null
  const isCompleted = invProgress?.status === 'completed'

  // Calculate total reward XP
  const questionsXp = Array.isArray(questions) && questions.length > 0
    ? questions.reduce((sum, q) => sum + (q.rewards?.baseXp || q.xp || 50), 0)
    : normInv.rewardXp

  const targetId = normInv.missionId || normInv.investigationId
  const tool = normInv.tool || 'excel'
  const targetUrl = isCurrent
    ? tool === 'sql' ? `/missions/${targetId}/sql` : `/missions/${targetId}/workspace`
    : `/missions/${targetId}`

  const status = isCompleted
    ? 'completed'
    : isCurrent
    ? 'current'
    : isLocked
    ? 'locked'
    : 'available'

  return {
    id: normInv.missionId || normInv.investigationId,
    investigationId: normInv.investigationId,
    missionId: normInv.missionId,
    title: normInv.title,
    objective: normInv.objective,
    rewardXp: questionsXp,
    tool,
    targetUrl,
    status,
    isCompleted,
    isCurrent,
    isLocked,
    chapterIndex,
    nodeIndex,
    questions: (questions || []).map(q => ({
      questionId: q.questionId || q.id,
      title: q.prompt || q.title || 'Câu hỏi đánh giá',
      baseXp: q.rewards?.baseXp || q.xp || 50,
    })),
  }
}

/**
 * Assembles full Learning Map Tree from domain entity collections.
 * Consumes: Journey (Course) -> Phase -> Chapter -> Investigation -> Question.
 *
 * @param {Object} params
 * @param {Object} params.course Active Course/Journey object
 * @param {Array} [params.phases=[]] List of Phases for Course
 * @param {Array} [params.chapters=[]] List of Chapters for Course
 * @param {Object} [params.investigationsByChapter={}] Map of chapterId -> Investigation[]
 * @param {Object} [params.questionsByInvestigation={}] Map of investigationId -> Question[]
 * @param {Array} [params.progressList=[]] List of LearnerProgressRecord
 * @returns {Object} Learning Map Tree
 */
export function buildLearningMapTree({
  course,
  phases = [],
  chapters = [],
  investigationsByChapter = {},
  questionsByInvestigation = {},
  progressList = [],
}) {
  if (!course) {
    return {
      journey: null,
      phases: [],
      chapters: [],
      stats: { totalChapters: 0, totalInvestigations: 0, totalXp: 0, completionPercentage: 0 },
    }
  }

  const pMap = new Map((progressList || []).map(p => [p.contentId, p]))

  let globalCurrentFound = false
  let totalInvestigationsCount = 0
  let completedInvestigationsCount = 0
  let totalXpAmount = 0

  const processedChapters = (chapters || []).map((ch, chIdx) => {
    const rawInvs = investigationsByChapter[ch.id] || []
    const isChapterLocked = ch.unlockRule === 'complete_previous' && chIdx > 1

    const nodes = rawInvs.map((inv, invIdx) => {
      const invId = inv.investigationId || inv.id
      const childQuestions = questionsByInvestigation[invId] || []
      const normInv = translateLegacyMissionToInvestigation(inv)

      const invProgress = pMap.get(normInv.investigationId) || pMap.get(normInv.missionId) || null
      const isCompleted = invProgress?.status === 'completed'

      let isCurrent = false
      if (!isCompleted && !globalCurrentFound && !isChapterLocked) {
        isCurrent = true
        globalCurrentFound = true
      }

      const node = transformToInvestigationNode({
        investigation: inv,
        questions: childQuestions,
        progressList: pMap,
        isCurrent,
        isLocked: isChapterLocked,
        chapterIndex: chIdx + 1,
        nodeIndex: invIdx + 1,
      })

      totalInvestigationsCount += 1
      if (node.isCompleted) completedInvestigationsCount += 1
      totalXpAmount += node.rewardXp

      return node
    })

    return {
      id: ch.id,
      phaseId: ch.phaseId || null,
      title: ch.title,
      description: ch.description,
      orderIndex: ch.orderIndex || chIdx + 1,
      unlockRule: ch.unlockRule || 'none',
      investigations: nodes,
    }
  })

  // If no node was marked current (e.g. first node or all completed), set fallback
  if (!globalCurrentFound && processedChapters.length > 0 && processedChapters[0].investigations.length > 0) {
    const firstNode = processedChapters[0].investigations[0]
    if (!firstNode.isCompleted) {
      firstNode.isCurrent = true
      firstNode.status = 'current'
    }
  }

  const completionPercentage = totalInvestigationsCount > 0
    ? Math.round((completedInvestigationsCount / totalInvestigationsCount) * 100)
    : 0

  return {
    journey: {
      id: course.id,
      title: course.title,
      tool: course.tool,
      slug: course.slug,
    },
    phases: phases || [],
    chapters: processedChapters,
    stats: {
      totalChapters: processedChapters.length,
      totalInvestigations: totalInvestigationsCount,
      totalXp: totalXpAmount,
      completionPercentage,
    },
  }
}

/**
 * Assembles a unified Multi-Phase Learning Journey Map Tree (Step 6.2).
 * Hierarchical structure: Learning Journey -> Phase -> Chapter -> Investigation -> Question.
 *
 * @param {Object} params
 * @param {Array} [params.courses=[]] List of published courses
 * @param {Array} [params.phases=[]] List of Phase definitions
 * @param {Object} [params.chaptersByCourse={}] Map of courseId -> Chapter[]
 * @param {Object} [params.investigationsByChapter={}] Map of chapterId -> Investigation[]
 * @param {Object} [params.questionsByInvestigation={}] Map of investigationId -> Question[]
 * @param {Array} [params.progressList=[]] Learner progress records
 * @returns {Object} Full Learning Journey Tree
 */
export function buildFullJourneyMapTree({
  courses = [],
  phases = [],
  chaptersByCourse = {},
  investigationsByChapter = {},
  questionsByInvestigation = {},
  progressList = [],
}) {
  const pMap = new Map((progressList || []).map(p => [p.contentId, p]))

  // Derive Phase definitions if not explicitly provided
  const journeyPhases = (phases && phases.length > 0)
    ? phases
    : (courses || []).map((c, idx) => ({
        id: `phase-${c.id}`,
        courseId: c.id,
        title: `Phase ${idx + 1}: ${c.title}`,
        description: c.tool === 'excel'
          ? 'Nhiệm vụ điều tra dữ liệu trên bảng tính Excel'
          : 'Nhiệm vụ truy vấn dữ liệu chuyên sâu với SQL Engine',
        tool: c.tool,
        orderIndex: idx + 1,
      }))

  let totalChaptersCount = 0
  let totalInvestigationsCount = 0
  let completedInvestigationsCount = 0
  let totalXpAmount = 0
  let globalCurrentFound = false

  const processedPhases = journeyPhases.map((phase, pIdx) => {
    const courseId = phase.courseId || (courses[pIdx] && courses[pIdx].id)
    const rawChapters = (chaptersByCourse[courseId] || [])

    let phaseInvestigationsCount = 0
    let phaseCompletedCount = 0
    let phaseXpAmount = 0

    const chapters = rawChapters.map((ch, chIdx) => {
      const rawInvs = investigationsByChapter[ch.id] || []
      const isChapterLocked = ch.unlockRule === 'complete_previous' && (pIdx > 0 || chIdx > 1)

      const nodes = rawInvs.map((inv, invIdx) => {
        const invId = inv.investigationId || inv.id
        const childQuestions = questionsByInvestigation[invId] || []
        const normInv = translateLegacyMissionToInvestigation(inv)

        const invProgress = pMap.get(normInv.investigationId) || pMap.get(normInv.missionId) || null
        const isCompleted = invProgress?.status === 'completed'

        let isCurrent = false
        if (!isCompleted && !globalCurrentFound && !isChapterLocked) {
          isCurrent = true
          globalCurrentFound = true
        }

        const node = transformToInvestigationNode({
          investigation: inv,
          questions: childQuestions,
          progressList: pMap,
          isCurrent,
          isLocked: isChapterLocked,
          chapterIndex: chIdx + 1,
          nodeIndex: invIdx + 1,
        })

        phaseInvestigationsCount += 1
        totalInvestigationsCount += 1
        if (node.isCompleted) {
          phaseCompletedCount += 1
          completedInvestigationsCount += 1
        }
        phaseXpAmount += node.rewardXp
        totalXpAmount += node.rewardXp

        return node
      })

      totalChaptersCount += 1

      return {
        id: ch.id,
        phaseId: phase.id,
        title: ch.title,
        description: ch.description,
        orderIndex: ch.orderIndex || chIdx + 1,
        unlockRule: ch.unlockRule || 'none',
        investigations: nodes,
      }
    })

    const phaseProgress = phaseInvestigationsCount > 0
      ? Math.round((phaseCompletedCount / phaseInvestigationsCount) * 100)
      : 0

    return {
      id: phase.id,
      courseId,
      title: phase.title,
      description: phase.description,
      tool: phase.tool || 'excel',
      orderIndex: phase.orderIndex || pIdx + 1,
      totalChapters: chapters.length,
      totalInvestigations: phaseInvestigationsCount,
      totalXp: phaseXpAmount,
      completionPercentage: phaseProgress,
      status: phaseProgress === 100 ? 'completed' : phaseProgress > 0 ? 'in_progress' : 'available',
      chapters,
    }
  })

  // Set fallback current if none set
  if (!globalCurrentFound && processedPhases.length > 0 && processedPhases[0].chapters.length > 0) {
    const firstCh = processedPhases[0].chapters[0]
    if (firstCh.investigations.length > 0 && !firstCh.investigations[0].isCompleted) {
      firstCh.investigations[0].isCurrent = true
      firstCh.investigations[0].status = 'current'
    }
  }

  const overallProgress = totalInvestigationsCount > 0
    ? Math.round((completedInvestigationsCount / totalInvestigationsCount) * 100)
    : 0

  return {
    journeySummary: {
      totalPhases: processedPhases.length,
      totalChapters: totalChaptersCount,
      totalInvestigations: totalInvestigationsCount,
      totalXp: totalXpAmount,
      overallProgress,
    },
    phases: processedPhases,
  }
}

/**
 * Assembles a unified Multi-Phase Learning Journey Map Tree using the new Read Model.
 *
 * @param {Object} params
 * @param {Array} [params.courseViews=[]] List of CourseView documents from learning_map_views
 * @param {Array} [params.progressList=[]] Learner progress records
 * @returns {Object} Full Learning Journey Tree
 */
export function buildJourneyMapFromReadModel({
  courseViews = [],
  progressList = [],
}) {
  const pMap = new Map((progressList || []).map(p => [p.contentId, p]))

  let totalChaptersCount = 0
  let totalInvestigationsCount = 0
  let completedInvestigationsCount = 0
  let totalXpAmount = 0
  let globalCurrentFound = false

  const processedPhases = courseViews.map((courseView, pIdx) => {
    let phaseInvestigationsCount = 0
    let phaseCompletedCount = 0
    let phaseXpAmount = 0

    const chapters = (courseView.chapters || []).map((ch, chIdx) => {
      const isChapterLocked = ch.unlockRule === 'complete_previous' && (pIdx > 0 || chIdx > 1)

      const nodes = (ch.nodes || []).map((node, invIdx) => {
        const invProgress = pMap.get(node.nodeId) || null
        const isCompleted = invProgress?.status === 'completed'

        let isCurrent = false
        if (!isCompleted && !globalCurrentFound && !isChapterLocked) {
          isCurrent = true
          globalCurrentFound = true
        }
        
        const targetUrl = node.targetUrl || (
          isCurrent 
            ? node.tool === 'sql' ? `/missions/${node.nodeId}/sql` : `/missions/${node.nodeId}/workspace`
            : `/missions/${node.nodeId}`
        );

        const processedNode = {
          id: node.nodeId,
          investigationId: node.nodeId,
          missionId: node.nodeId,
          title: node.title,
          objective: node.objective,
          rewardXp: node.rewardXp || 0,
          tool: node.tool || 'excel',
          targetUrl,
          status: isCompleted ? 'completed' : isCurrent ? 'current' : isChapterLocked ? 'locked' : 'available',
          isCompleted,
          isCurrent,
          isLocked: isChapterLocked,
          chapterIndex: chIdx + 1,
          nodeIndex: invIdx + 1,
          questions: []
        }

        phaseInvestigationsCount += 1
        totalInvestigationsCount += 1
        if (isCompleted) {
          phaseCompletedCount += 1
          completedInvestigationsCount += 1
        }
        phaseXpAmount += processedNode.rewardXp
        totalXpAmount += processedNode.rewardXp

        return processedNode
      })

      totalChaptersCount += 1

      return {
        id: ch.chapterId,
        phaseId: `phase-${courseView.courseId}`,
        title: ch.title,
        description: ch.description || '',
        orderIndex: ch.order || chIdx + 1,
        unlockRule: ch.unlockRule || 'none',
        investigations: nodes,
      }
    })

    const phaseProgress = phaseInvestigationsCount > 0
      ? Math.round((phaseCompletedCount / phaseInvestigationsCount) * 100)
      : 0

    return {
      id: `phase-${courseView.courseId}`,
      courseId: courseView.courseId,
      title: `Phase ${pIdx + 1}: ${courseView.title}`,
      description: courseView.tool === 'excel'
        ? 'Nhiệm vụ điều tra dữ liệu trên bảng tính Excel'
        : courseView.tool === 'sql' 
          ? 'Nhiệm vụ truy vấn dữ liệu chuyên sâu với SQL Engine' 
          : courseView.description || '',
      tool: courseView.tool || 'excel',
      orderIndex: courseView.order || pIdx + 1,
      totalChapters: chapters.length,
      totalInvestigations: phaseInvestigationsCount,
      totalXp: phaseXpAmount,
      completionPercentage: phaseProgress,
      status: phaseProgress === 100 ? 'completed' : phaseProgress > 0 ? 'in_progress' : 'available',
      chapters,
    }
  })

  // Set fallback current if none set
  if (!globalCurrentFound && processedPhases.length > 0 && processedPhases[0].chapters.length > 0) {
    const firstCh = processedPhases[0].chapters[0]
    if (firstCh.investigations.length > 0 && !firstCh.investigations[0].isCompleted) {
      firstCh.investigations[0].isCurrent = true
      firstCh.investigations[0].status = 'current'
      
      const node = firstCh.investigations[0];
      node.targetUrl = node.tool === 'sql' ? `/missions/${node.id}/sql` : `/missions/${node.id}/workspace`;
    }
  }

  const overallProgress = totalInvestigationsCount > 0
    ? Math.round((completedInvestigationsCount / totalInvestigationsCount) * 100)
    : 0

  return {
    journeySummary: {
      totalPhases: processedPhases.length,
      totalChapters: totalChaptersCount,
      totalInvestigations: totalInvestigationsCount,
      totalXp: totalXpAmount,
      overallProgress,
    },
    phases: processedPhases,
  }
}
