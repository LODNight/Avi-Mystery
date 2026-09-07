/**
 * mockAdminContentService.js
 * In-memory / localStorage adapter for Admin Content Authoring Studio.
 * Handles Courses, Chapters, Missions, Datasets, and synchronous Learning Map updates.
 */

import initialCourses from '../../mocks/data/courses.json';
import initialChapters from '../../mocks/data/chapters.json';
import initialMissions from '../../mocks/data/missions.json';
import initialDatasets from '../../mocks/data/datasets.json';
import initialMapViews from '../../mocks/data/learning_map_views.json';
import { learningMapProjector, LEARNING_MAP_VIEWS_KEY } from '../../domain/learningMap/learningMapProjector.js';
import { storage } from '../../utils/storage.js';
import { assertImplementsContract } from '../contracts/contractValidator.js';
import { adminContentServiceContract } from '../contracts/adminContentService.js';

const COURSES_KEY = 'admin_courses';
const CHAPTERS_KEY = 'admin_chapters';
const MISSIONS_KEY = 'admin_missions';
const DATASETS_KEY = 'admin_datasets';
const MAP_VIEWS_KEY = LEARNING_MAP_VIEWS_KEY;

function loadOrInit(key, initialData) {
  const cached = storage.get(key);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  storage.set(key, initialData);
  return [...initialData];
}

/**
 * Generates collision-proof sequential IDs even when records have been deleted.
 */
function generateNextId(prefix, items) {
  let maxNum = 0;
  for (const item of items) {
    if (item && typeof item.id === 'string' && item.id.startsWith(prefix)) {
      const num = parseInt(item.id.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  let candidate = `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  let counter = maxNum + 1;
  while (items.some((it) => it.id === candidate)) {
    counter++;
    candidate = `${prefix}${String(counter).padStart(3, '0')}`;
  }
  return candidate;
}

export const mockAdminContentService = {
  // ── Reset Helper for Tests / Dev ──
  resetToDefaults() {
    storage.set(COURSES_KEY, initialCourses);
    storage.set(CHAPTERS_KEY, initialChapters);
    storage.set(MISSIONS_KEY, initialMissions);
    storage.set(DATASETS_KEY, initialDatasets);
    storage.set(MAP_VIEWS_KEY, initialMapViews);
  },

  // ── Courses ──
  async getCourses() {
    const courses = loadOrInit(COURSES_KEY, initialCourses);
    return { data: courses, error: null };
  },

  async getCourse(courseId) {
    const courses = loadOrInit(COURSES_KEY, initialCourses);
    const course = courses.find((c) => c.id === courseId || c.slug === courseId);
    if (!course) {
      return { data: null, error: `Không tìm thấy khóa học với ID: ${courseId}` };
    }
    return { data: course, error: null };
  },

  async saveCourse(courseData) {
    const courses = loadOrInit(COURSES_KEY, initialCourses);
    let updatedCourse;
    const now = new Date().toISOString();

    if (courseData.id) {
      const index = courses.findIndex((c) => c.id === courseData.id);
      if (index >= 0) {
        updatedCourse = {
          ...courses[index],
          ...courseData,
          updatedAt: now,
        };
        courses[index] = updatedCourse;
      } else {
        updatedCourse = {
          ...courseData,
          createdAt: now,
          updatedAt: now,
        };
        courses.push(updatedCourse);
      }
    } else {
      const newId = generateNextId('course-', courses);
      updatedCourse = {
        id: newId,
        slug: courseData.slug || newId,
        status: 'draft',
        totalChapters: 0,
        totalMissions: 0,
        ...courseData,
        createdAt: now,
        updatedAt: now,
      };
      courses.push(updatedCourse);
    }

    storage.set(COURSES_KEY, courses);
    return { data: updatedCourse, error: null };
  },

  async deleteCourse(courseId) {
    let courses = loadOrInit(COURSES_KEY, initialCourses);
    courses = courses.filter((c) => c.id !== courseId);
    storage.set(COURSES_KEY, courses);
    return { data: { success: true }, error: null };
  },

  // ── Chapters ──
  async getChapters(courseId) {
    const chapters = loadOrInit(CHAPTERS_KEY, initialChapters);
    const filtered = courseId ? chapters.filter((ch) => ch.courseId === courseId) : chapters;
    filtered.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    return { data: filtered, error: null };
  },

  async getChapter(chapterId) {
    const chapters = loadOrInit(CHAPTERS_KEY, initialChapters);
    const chapter = chapters.find((ch) => ch.id === chapterId);
    if (!chapter) {
      return { data: null, error: `Không tìm thấy chương với ID: ${chapterId}` };
    }
    return { data: chapter, error: null };
  },

  async saveChapter(chapterData) {
    const chapters = loadOrInit(CHAPTERS_KEY, initialChapters);
    let updatedChapter;

    if (chapterData.id) {
      const index = chapters.findIndex((ch) => ch.id === chapterData.id);
      if (index >= 0) {
        updatedChapter = { ...chapters[index], ...chapterData };
        chapters[index] = updatedChapter;
      } else {
        updatedChapter = { ...chapterData };
        chapters.push(updatedChapter);
      }
    } else {
      const newId = generateNextId('ch-', chapters);
      updatedChapter = {
        id: newId,
        orderIndex: chapters.length + 1,
        status: 'draft',
        totalMissions: 0,
        ...chapterData,
      };
      chapters.push(updatedChapter);
    }

    storage.set(CHAPTERS_KEY, chapters);
    return { data: updatedChapter, error: null };
  },

  async deleteChapter(chapterId) {
    let chapters = loadOrInit(CHAPTERS_KEY, initialChapters);
    chapters = chapters.filter((ch) => ch.id !== chapterId);
    storage.set(CHAPTERS_KEY, chapters);
    return { data: { success: true }, error: null };
  },

  // ── Missions ──
  async getMissions(filters = {}) {
    let missions = loadOrInit(MISSIONS_KEY, initialMissions);

    if (filters.courseId) {
      missions = missions.filter((m) => m.courseId === filters.courseId);
    }
    if (filters.chapterId) {
      missions = missions.filter((m) => m.chapterId === filters.chapterId);
    }
    if (filters.tool && filters.tool !== 'all') {
      missions = missions.filter((m) => m.tool === filters.tool);
    }
    if (filters.status && filters.status !== 'all') {
      missions = missions.filter((m) => m.status === filters.status);
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      missions = missions.filter((m) => m.difficulty === filters.difficulty);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      missions = missions.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          (m.objective && m.objective.toLowerCase().includes(q))
      );
    }

    missions.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    return { data: missions, error: null };
  },

  async getMission(missionId) {
    const missions = loadOrInit(MISSIONS_KEY, initialMissions);
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) {
      return { data: null, error: `Không tìm thấy nhiệm vụ: ${missionId}` };
    }
    return { data: mission, error: null };
  },

  async saveMission(missionData) {
    const missions = loadOrInit(MISSIONS_KEY, initialMissions);
    let updatedMission;
    const now = new Date().toISOString();

    if (missionData.id) {
      const index = missions.findIndex((m) => m.id === missionData.id);
      if (index >= 0) {
        updatedMission = {
          ...missions[index],
          ...missionData,
          version: (missions[index].version || 1) + 1,
          updatedAt: now,
        };
        missions[index] = updatedMission;
      } else {
        updatedMission = {
          ...missionData,
          version: 1,
          createdAt: now,
          updatedAt: now,
        };
        missions.push(updatedMission);
      }
    } else {
      const newId = generateNextId('mission-', missions);
      updatedMission = {
        id: newId,
        status: 'draft',
        orderIndex: missions.length + 1,
        version: 1,
        ...missionData,
        createdAt: now,
        updatedAt: now,
      };
      missions.push(updatedMission);
    }

    storage.set(MISSIONS_KEY, missions);
    return { data: updatedMission, error: null };
  },

  async deleteMission(missionId) {
    let missions = loadOrInit(MISSIONS_KEY, initialMissions);
    missions = missions.filter((m) => m.id !== missionId);
    storage.set(MISSIONS_KEY, missions);

    return { data: { success: true }, error: null };
  },

  async toggleMissionStatus(missionId) {
    const missions = loadOrInit(MISSIONS_KEY, initialMissions);
    const index = missions.findIndex((m) => m.id === missionId);
    if (index === -1) {
      return { data: null, error: `Không tìm thấy nhiệm vụ: ${missionId}` };
    }

    const currentStatus = missions[index].status || 'draft';
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    missions[index].status = nextStatus;
    missions[index].updatedAt = new Date().toISOString();

    storage.set(MISSIONS_KEY, missions);
    return { data: missions[index], error: null };
  },

  async duplicateMission(missionId) {
    const missions = loadOrInit(MISSIONS_KEY, initialMissions);
    const original = missions.find((m) => m.id === missionId);
    if (!original) {
      return { data: null, error: `Không tìm thấy nhiệm vụ: ${missionId}` };
    }

    const newId = generateNextId('mission-', missions);
    const duplicated = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      title: `${original.title} (Bản sao)`,
      status: 'draft',
      orderIndex: missions.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    missions.push(duplicated);
    storage.set(MISSIONS_KEY, missions);
    return { data: duplicated, error: null };
  },

  // ── Datasets ──
  async getDatasets() {
    const datasets = loadOrInit(DATASETS_KEY, initialDatasets);
    return { data: datasets, error: null };
  },

  async getDataset(datasetId) {
    const datasets = loadOrInit(DATASETS_KEY, initialDatasets);
    const dataset = datasets.find((d) => d.id === datasetId);
    if (!dataset) {
      return { data: null, error: `Không tìm thấy dataset: ${datasetId}` };
    }
    return { data: dataset, error: null };
  },

  async saveDataset(datasetData) {
    const datasets = loadOrInit(DATASETS_KEY, initialDatasets);
    let updated;

    if (datasetData.id) {
      const index = datasets.findIndex((d) => d.id === datasetData.id);
      if (index >= 0) {
        updated = { ...datasets[index], ...datasetData, updatedAt: new Date().toISOString() };
        datasets[index] = updated;
      } else {
        updated = { ...datasetData, createdAt: new Date().toISOString() };
        datasets.push(updated);
      }
    } else {
      const newId = generateNextId('ds-', datasets);
      updated = {
        id: newId,
        version: 1,
        ...datasetData,
        createdAt: new Date().toISOString(),
      };
      datasets.push(updated);
    }

    storage.set(DATASETS_KEY, datasets);
    return { data: updated, error: null };
  },

  async deleteDataset(datasetId) {
    let datasets = loadOrInit(DATASETS_KEY, initialDatasets);
    datasets = datasets.filter((d) => d.id !== datasetId);
    storage.set(DATASETS_KEY, datasets);
    return { data: { success: true }, error: null };
  },

  // ── Publish & Materialized Read Model Synchronization ──
  async publishCourse(courseId) {
    const courses = loadOrInit(COURSES_KEY, initialCourses);
    const chapters = loadOrInit(CHAPTERS_KEY, initialChapters);
    const missions = loadOrInit(MISSIONS_KEY, initialMissions);

    const courseIndex = courses.findIndex((c) => c.id === courseId);
    if (courseIndex === -1) {
      return { data: null, error: `Không tìm thấy khóa học: ${courseId}` };
    }

    const course = courses[courseIndex];
    course.status = 'published';
    course.version = (course.version || 1) + 1;
    course.updatedAt = new Date().toISOString();
    courses[courseIndex] = course;
    storage.set(COURSES_KEY, courses);

    // Build and synchronize the materialized read model using the Domain Projector
    const newMapView = learningMapProjector.syncCourseProjection(course, chapters, missions, storage);

    return {
      data: {
        course,
        mapView: newMapView,
      },
      error: null,
    };
  },
};

// Enforce that mock implementation satisfies all contract methods at runtime
assertImplementsContract(adminContentServiceContract, mockAdminContentService, 'mockAdminContentService');

