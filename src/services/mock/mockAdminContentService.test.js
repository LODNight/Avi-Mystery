import { describe, it, expect, beforeEach } from 'vitest';
import { mockAdminContentService } from './mockAdminContentService.js';

describe('mockAdminContentService Unit Tests', () => {
  beforeEach(() => {
    mockAdminContentService.resetToDefaults();
  });

  describe('Course Operations', () => {
    it('lấy danh sách khóa học thành công', async () => {
      const res = await mockAdminContentService.getCourses();
      expect(res.error).toBeNull();
      expect(res.data.length).toBeGreaterThan(0);
    });

    it('lấy chi tiết một khóa học theo id', async () => {
      const res = await mockAdminContentService.getCourse('course-001');
      expect(res.error).toBeNull();
      expect(res.data.id).toBe('course-001');
      expect(res.data.title).toContain('Excel');
    });

    it('tạo mới và cập nhật một khóa học', async () => {
      const createRes = await mockAdminContentService.saveCourse({
        title: 'Khóa học Test Python',
        tool: 'python',
        difficulty: 'intermediate',
      });
      expect(createRes.error).toBeNull();
      expect(createRes.data.id).toBeDefined();
      expect(createRes.data.status).toBe('draft');

      const updateRes = await mockAdminContentService.saveCourse({
        id: createRes.data.id,
        title: 'Khóa học Test Python (Updated)',
      });
      expect(updateRes.error).toBeNull();
      expect(updateRes.data.title).toBe('Khóa học Test Python (Updated)');
    });

    it('xóa khóa học', async () => {
      const res = await mockAdminContentService.deleteCourse('course-003');
      expect(res.error).toBeNull();
      const check = await mockAdminContentService.getCourse('course-003');
      expect(check.data).toBeNull();
    });

    it('không bị collision ID khi xóa rồi tạo mới entity (Collision-proof IDs)', async () => {
      const c1 = await mockAdminContentService.saveCourse({ title: 'Course A' });
      const c2 = await mockAdminContentService.saveCourse({ title: 'Course B' });
      await mockAdminContentService.deleteCourse(c1.data.id);
      const c3 = await mockAdminContentService.saveCourse({ title: 'Course C' });
      expect(c3.data.id).not.toBe(c2.data.id);
      expect(c3.data.id).not.toBe(c1.data.id);
    });
  });

  describe('Chapter Operations', () => {
    it('lấy danh sách chương theo courseId', async () => {
      const res = await mockAdminContentService.getChapters('course-001');
      expect(res.error).toBeNull();
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data.every((ch) => ch.courseId === 'course-001')).toBe(true);
    });

    it('tạo mới và cập nhật chương', async () => {
      const createRes = await mockAdminContentService.saveChapter({
        courseId: 'course-001',
        title: 'Chương 99: Chương Test',
      });
      expect(createRes.error).toBeNull();
      expect(createRes.data.id).toBeDefined();

      const updateRes = await mockAdminContentService.saveChapter({
        id: createRes.data.id,
        title: 'Chương 99: Đã cập nhật',
      });
      expect(updateRes.data.title).toBe('Chương 99: Đã cập nhật');
    });
  });

  describe('Mission Operations & Filtering', () => {
    it('lọc nhiệm vụ theo công cụ và trạng thái', async () => {
      const excelMissions = await mockAdminContentService.getMissions({ tool: 'excel' });
      expect(excelMissions.data.every((m) => m.tool === 'excel')).toBe(true);

      const sqlMissions = await mockAdminContentService.getMissions({ tool: 'sql' });
      expect(sqlMissions.data.every((m) => m.tool === 'sql')).toBe(true);

      const searchRes = await mockAdminContentService.getMissions({ search: 'doanh thu' });
      expect(searchRes.data.length).toBeGreaterThan(0);
      expect(searchRes.data.some((m) => m.title.toLowerCase().includes('doanh thu'))).toBe(true);
    });

    it('tạo mới một vụ án với checkerConfig và hints', async () => {
      const newMissionData = {
        courseId: 'course-001',
        chapterId: 'ch-001',
        title: 'Vụ án bí ẩn chiếc hóa đơn',
        story: 'Một hóa đơn kỳ lạ xuất hiện...',
        objective: 'Tìm tổng tiền hóa đơn',
        tool: 'excel',
        difficulty: 'medium',
        rewardXp: 150,
        datasetId: 'ds-001',
        starterContent: {
          targetSheet: 'Sales',
          targetCell: 'F2',
          hint: 'Dùng SUM',
        },
        checkerConfig: {
          expectedFormula: ['=SUM(A1:A5)'],
          expectedValue: 500000,
        },
        hints: [
          { id: 'h-1', text: 'Hãy kiểm tra cột A', penaltyXp: 20 },
        ],
      };

      const res = await mockAdminContentService.saveMission(newMissionData);
      expect(res.error).toBeNull();
      expect(res.data.id).toMatch(/^mission-/);
      expect(res.data.rewardXp).toBe(150);
      expect(res.data.checkerConfig.expectedValue).toBe(500000);
    });

    it('chuyển đổi trạng thái Draft / Published của vụ án', async () => {
      const res = await mockAdminContentService.toggleMissionStatus('mission-001');
      expect(res.error).toBeNull();
      expect(res.data.status).toBe('draft');

      const res2 = await mockAdminContentService.toggleMissionStatus('mission-001');
      expect(res2.data.status).toBe('published');
    });

    it('nhân bản (duplicate) vụ án', async () => {
      const dupRes = await mockAdminContentService.duplicateMission('mission-001');
      expect(dupRes.error).toBeNull();
      expect(dupRes.data.id).not.toBe('mission-001');
      expect(dupRes.data.title).toContain('(Bản sao)');
      expect(dupRes.data.status).toBe('draft');
    });

    it('xóa vụ án thành công', async () => {
      const delRes = await mockAdminContentService.deleteMission('mission-002');
      expect(delRes.error).toBeNull();

      const check = await mockAdminContentService.getMission('mission-002');
      expect(check.data).toBeNull();
    });
  });

  describe('Dataset Operations', () => {
    it('lấy danh sách và tạo mới dataset', async () => {
      const list = await mockAdminContentService.getDatasets();
      expect(list.data.length).toBeGreaterThan(0);

      const createRes = await mockAdminContentService.saveDataset({
        name: 'test_dataset.csv',
        type: 'sql',
        description: 'Dataset mô phỏng đơn hàng',
      });
      expect(createRes.error).toBeNull();
      expect(createRes.data.id).toBeDefined();
    });
  });

  describe('Publish & Read Model Sync', () => {
    it('xuất bản khóa học và tạo lại materialized learning map view', async () => {
      const res = await mockAdminContentService.publishCourse('course-001');
      expect(res.error).toBeNull();
      expect(res.data.course.status).toBe('published');
      expect(res.data.mapView).toBeDefined();
      expect(res.data.mapView.courseId).toBe('course-001');
      expect(res.data.mapView.chapters.length).toBeGreaterThan(0);
      expect(res.data.mapView.chapters[0].nodes.length).toBeGreaterThan(0);
    });

    it('lưu hoặc đổi trạng thái nhiệm vụ không tự ý trigger xuất bản khóa học (Command Isolation)', async () => {
      const initialCourse = await mockAdminContentService.getCourse('course-001');
      const initialVersion = initialCourse.data.version || 1;

      // Lưu mission
      await mockAdminContentService.saveMission({
        id: 'mission-001',
        courseId: 'course-001',
        title: 'Cập nhật tiêu đề không trigger publish',
      });

      // Kiểm tra phiên bản khóa học không bị nhảy ngầm
      const courseAfterSave = await mockAdminContentService.getCourse('course-001');
      expect(courseAfterSave.data.version || 1).toBe(initialVersion);

      // Toggle trạng thái mission cũng không trigger publish ngầm
      await mockAdminContentService.toggleMissionStatus('mission-001');
      const courseAfterToggle = await mockAdminContentService.getCourse('course-001');
      expect(courseAfterToggle.data.version || 1).toBe(initialVersion);
    });
  });
});
