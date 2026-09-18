import { describe, it, expect, beforeEach, vi } from 'vitest';
import { investigationNotebookService } from './investigationNotebookService.js';

describe('investigationNotebookService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    investigationNotebookService.clearAllNotes();
  });

  it('ghim và kiểm tra ghi chú bài học (pinNote / isNotePinned)', () => {
    expect(investigationNotebookService.isNotePinned('topic-001')).toBe(false);

    const note = investigationNotebookService.pinNote({
      topicId: 'topic-001',
      title: 'Hàm SUM',
      excerpt: '=SUM(A1:A10)',
      tool: 'excel',
    });

    expect(note).toBeDefined();
    expect(note.topicId).toBe('topic-001');
    expect(investigationNotebookService.isNotePinned('topic-001')).toBe(true);

    const notes = investigationNotebookService.getNotes();
    expect(notes.length).toBe(1);
    expect(notes[0].title).toBe('Hàm SUM');
  });

  it('gỡ ghim ghi chú bài học (unpinNote)', () => {
    investigationNotebookService.pinNote({
      topicId: 'topic-002',
      title: 'Hàm VLOOKUP',
      tool: 'excel',
    });
    expect(investigationNotebookService.isNotePinned('topic-002')).toBe(true);

    investigationNotebookService.unpinNote('topic-002');
    expect(investigationNotebookService.isNotePinned('topic-002')).toBe(false);
    expect(investigationNotebookService.getNotes().length).toBe(0);
  });

  it('thêm, chỉnh sửa và xóa ghi chép cá nhân (addCustomNote, updateCustomNote, deleteCustomNote)', () => {
    const custom = investigationNotebookService.addCustomNote({
      text: 'Manh mối tại ô D10 có thể là doanh thu quý 3',
      tool: 'excel',
    });

    expect(custom).toBeDefined();
    expect(custom.type).toBe('custom');
    expect(custom.text).toBe('Manh mối tại ô D10 có thể là doanh thu quý 3');

    // Chỉnh sửa ghi chú
    const updated = investigationNotebookService.updateCustomNote(
      custom.id,
      'Cập nhật: D10 là tổng doanh thu cả năm, không phải quý 3'
    );

    expect(updated).toBeDefined();
    expect(updated.text).toBe('Cập nhật: D10 là tổng doanh thu cả năm, không phải quý 3');
    expect(updated.updatedAt).toBeDefined();

    const storedNotes = investigationNotebookService.getNotes();
    expect(storedNotes[0].text).toBe('Cập nhật: D10 là tổng doanh thu cả năm, không phải quý 3');

    // Xóa ghi chú
    investigationNotebookService.deleteCustomNote(custom.id);
    expect(investigationNotebookService.getNotes().length).toBe(0);
  });

  it('thông báo cập nhật qua subscribe callback khi có thay đổi', () => {
    const listener = vi.fn();
    const unsubscribe = investigationNotebookService.subscribe(listener);

    investigationNotebookService.addCustomNote({ text: 'Ghi chú test listener' });
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });
});
