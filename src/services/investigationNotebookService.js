/**
 * investigationNotebookService.js
 * Quản lý Sổ tay điều tra (Investigation Notebook) phía client.
 * Cho phép người học ghim các đoạn lý thuyết/công thức trọng tâm trong lúc đọc bài
 * để mang vào bàn làm việc (Mission Workspace / ProblemPane) tra cứu tức thì.
 */

const STORAGE_KEY = 'avi_investigation_notebook_notes';
const EVENT_NAME = 'avi_notebook_updated';

function getStoredNotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading notebook notes:', err);
    return [];
  }
}

function saveStoredNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: notes }));
  } catch (err) {
    console.error('Error saving notebook notes:', err);
  }
}

export const investigationNotebookService = {
  getNotes() {
    return getStoredNotes();
  },

  pinNote({ topicId, title, excerpt, tool = 'excel', courseSlug = 'excel-academy' }) {
    if (!topicId) return;
    const current = getStoredNotes();
    const existingIndex = current.findIndex(n => n.topicId === topicId);
    const newNote = {
      id: `note-${topicId}-${Date.now()}`,
      topicId,
      title: title || 'Ghi chú nghiệp vụ',
      excerpt: excerpt || '',
      tool,
      courseSlug,
      pinnedAt: new Date().toISOString(),
    };

    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...newNote };
    } else {
      updated = [newNote, ...current];
    }

    saveStoredNotes(updated);
    return newNote;
  },

  unpinNote(topicId) {
    const current = getStoredNotes();
    const updated = current.filter(n => n.topicId !== topicId);
    saveStoredNotes(updated);
  },

  isNotePinned(topicId) {
    if (!topicId) return false;
    const current = getStoredNotes();
    return current.some(n => n.topicId === topicId);
  },

  clearAllNotes() {
    saveStoredNotes([]);
  },

  subscribe(callback) {
    const handler = (e) => {
      callback(e.detail || getStoredNotes());
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  },
};
