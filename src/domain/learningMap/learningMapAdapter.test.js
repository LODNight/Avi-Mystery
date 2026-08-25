import { describe, it, expect } from 'vitest'
import {
  translateLegacyMissionToInvestigation,
  transformToInvestigationNode,
  buildLearningMapTree,
  buildFullJourneyMapTree,
} from './learningMapAdapter.js'

describe('Learning Map Domain Adapter Tests (Step 6.1)', () => {
  it('dịch chuyển đối tượng mission cũ thành Investigation entity chuẩn hóa', () => {
    const legacyMission = {
      id: 'mission-001',
      chapterId: 'ch-001',
      title: 'Nhiệm vụ 1: Doanh thu',
      objective: 'Tính tổng doanh thu',
      rewardXp: 100,
      tool: 'excel',
    }

    const norm = translateLegacyMissionToInvestigation(legacyMission)

    expect(norm).toEqual({
      investigationId: 'mission-001',
      missionId: 'mission-001',
      chapterId: 'ch-001',
      datasetId: null,
      title: 'Nhiệm vụ 1: Doanh thu',
      objective: 'Tính tổng doanh thu',
      rewardXp: 100,
      tool: 'excel',
      status: 'published',
    })
  })

  it('chuyển đổi Investigation và progress thành InvestigationNode đại diện cho UI', () => {
    const inv = {
      id: 'inv-001',
      investigationId: 'inv-001',
      missionId: 'mission-001',
      title: 'Vụ án 1: Doanh thu thất thoát',
      objective: 'Tìm vết hổng doanh thu',
      tool: 'excel',
    }

    const progressList = [
      { contentId: 'inv-001', contentType: 'investigation', status: 'completed' },
    ]

    const node = transformToInvestigationNode({
      investigation: inv,
      progressList,
      chapterIndex: 1,
      nodeIndex: 1,
    })

    expect(node.isCompleted).toBe(true)
    expect(node.status).toBe('completed')
    expect(node.rewardXp).toBe(50)
  })

  it('xây dựng cây phân cấp Learning Map chuẩn (Journey -> Phase -> Chapter -> Investigation -> Question)', () => {
    const course = { id: 'course-001', title: 'Excel Adventure', tool: 'excel' }
    const chapters = [
      { id: 'ch-001', title: 'Chương 1', description: 'Mô tả 1', unlockRule: 'none' },
    ]
    const investigationsByChapter = {
      'ch-001': [
        { id: 'inv-001', title: 'Vụ án 1', rewardXp: 100, tool: 'excel' },
        { id: 'inv-002', title: 'Vụ án 2', rewardXp: 150, tool: 'excel' },
      ],
    }
    const questionsByInvestigation = {
      'inv-001': [{ id: 'q-001', prompt: 'Câu hỏi 1', baseXp: 100 }],
    }
    const progressList = [
      { contentId: 'inv-001', status: 'completed' },
    ]

    const tree = buildLearningMapTree({
      course,
      chapters,
      investigationsByChapter,
      questionsByInvestigation,
      progressList,
    })

    expect(tree.journey.id).toBe('course-001')
    expect(tree.chapters).toHaveLength(1)
    expect(tree.chapters[0].investigations).toHaveLength(2)

    const inv1 = tree.chapters[0].investigations[0]
    expect(inv1.isCompleted).toBe(true)
    expect(inv1.status).toBe('completed')

    const inv2 = tree.chapters[0].investigations[1]
    expect(inv2.isCompleted).toBe(false)
    expect(inv2.isCurrent).toBe(true)
    expect(inv2.status).toBe('current')

    expect(tree.stats.completionPercentage).toBe(50)
  })

  it('xây dựng cây lộ trình đa giai đoạn (buildFullJourneyMapTree) chứa danh sách các Phase và tính toán tổng tiến độ', () => {
    const courses = [
      { id: 'course-001', title: 'Excel Adventure', tool: 'excel' },
      { id: 'course-002', title: 'SQL Investigation', tool: 'sql' },
    ]
    const chaptersByCourse = {
      'course-001': [{ id: 'ch-001', title: 'Chương Excel 1', unlockRule: 'none' }],
      'course-002': [{ id: 'ch-002', title: 'Chương SQL 1', unlockRule: 'none' }],
    }
    const investigationsByChapter = {
      'ch-001': [{ id: 'inv-001', title: 'Vụ án Excel 1', rewardXp: 100, tool: 'excel' }],
      'ch-002': [{ id: 'inv-002', title: 'Vụ án SQL 1', rewardXp: 200, tool: 'sql' }],
    }
    const progressList = [
      { contentId: 'inv-001', status: 'completed' },
    ]

    const journeyTree = buildFullJourneyMapTree({
      courses,
      chaptersByCourse,
      investigationsByChapter,
      progressList,
    })

    expect(journeyTree.journeySummary.totalPhases).toBe(2)
    expect(journeyTree.journeySummary.totalInvestigations).toBe(2)
    expect(journeyTree.journeySummary.overallProgress).toBe(50)

    expect(journeyTree.phases[0].status).toBe('completed')
    expect(journeyTree.phases[0].completionPercentage).toBe(100)

    expect(journeyTree.phases[1].status).toBe('available')
    expect(journeyTree.phases[1].chapters[0].investigations[0].isCurrent).toBe(true)
  })
})

