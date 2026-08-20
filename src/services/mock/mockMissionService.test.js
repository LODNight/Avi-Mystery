import { describe, it, expect } from 'vitest';
import { mockMissionService } from './mockMissionService.js';

describe('mockMissionService Unit Tests', () => {
  it('getMissionsByChapter trả về danh sách mission đã xuất bản theo chapterId', async () => {
    const res = await mockMissionService.getMissionsByChapter('ch-001');
    expect(res.error).toBeNull();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.every((m) => m.chapterId === 'ch-001' && m.status === 'published')).toBe(true);
  });

  it('getMission trả về thông tin chi tiết mission', async () => {
    const res = await mockMissionService.getMission('mission-001');
    expect(res.error).toBeNull();
    expect(res.data.id).toBe('mission-001');
  });

  it('getMission trả về lỗi khi không tìm thấy missionId', async () => {
    const res = await mockMissionService.getMission('invalid-mission-id');
    expect(res.data).toBeNull();
    expect(res.error).toContain('Không tìm thấy');
  });

  it('getRecommendedMissions trả về tối đa 3 bài học gợi ý', async () => {
    const res = await mockMissionService.getRecommendedMissions('user-001');
    expect(res.error).toBeNull();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeLessThanOrEqual(3);
  });

  it('getDataset trả về thông tin dataset theo datasetId', async () => {
    const res = await mockMissionService.getDataset('ds-001');
    expect(res.error).toBeNull();
    expect(res.data.id).toBe('ds-001');
    expect(Array.isArray(res.data.columns)).toBe(true);
    expect(Array.isArray(res.data.rows)).toBe(true);
  });

  it('getDataset trả về lỗi khi không tìm thấy datasetId', async () => {
    const res = await mockMissionService.getDataset('invalid-ds-id');
    expect(res.data).toBeNull();
    expect(res.error).toContain('Không tìm thấy dataset');
  });
});

