import { mockCourseService } from './src/services/mock/mockCourseService.js';
import { mockInvestigationService } from './src/services/mock/mockInvestigationService.js';
import { mockMissionService } from './src/services/mock/mockMissionService.js';

async function benchmarkBefore() {
  const start = performance.now();
  let requests = 0;
  
  const courseService = {
    getCourses: async (f) => { requests++; return mockCourseService.getCourses(f); },
    getChaptersByCourse: async (id) => { requests++; return mockCourseService.getChaptersByCourse(id); }
  };
  const investigationService = {
    getInvestigationsByChapter: async (id) => { requests++; return mockInvestigationService.getInvestigationsByChapter(id); }
  };
  const missionService = {
    getMissionsByChapter: async (id) => { requests++; return mockMissionService.getMissionsByChapter(id); }
  };

  const coursesRes = await courseService.getCourses({ status: 'published' });
  const courseList = coursesRes.data;
  const chaptersByCourse = {};
  const investigationsMap = {};
  for (const course of courseList) {
    const chRes = await courseService.getChaptersByCourse(course.id);
    const chList = chRes?.data || [];
    chaptersByCourse[course.id] = chList;
    for (const ch of chList) {
      try {
        const invRes = await investigationService.getInvestigationsByChapter(ch.id);
        if (invRes?.data && invRes.data.length > 0) {
          investigationsMap[ch.id] = invRes.data;
        } else {
          const mRes = await missionService.getMissionsByChapter(ch.id);
          investigationsMap[ch.id] = mRes?.data || [];
        }
      } catch (_e) {
        const mRes = await missionService.getMissionsByChapter(ch.id);
        investigationsMap[ch.id] = mRes?.data || [];
      }
    }
  }
  const end = performance.now();
  console.log('BEFORE (Sequential):');
  console.log(`- Time: ${(end - start).toFixed(0)} ms`);
  console.log(`- Total Requests: ${requests}`);
  return { time: end - start, requests };
}

async function benchmarkAfter() {
  const start = performance.now();
  let requests = 0;
  
  const courseService = {
    getCourses: async (f) => { requests++; return mockCourseService.getCourses(f); },
    getChaptersByCourse: async (id) => { requests++; return mockCourseService.getChaptersByCourse(id); }
  };
  const investigationService = {
    getInvestigationsByChapter: async (id) => { requests++; return mockInvestigationService.getInvestigationsByChapter(id); }
  };
  const missionService = {
    getMissionsByChapter: async (id) => { requests++; return mockMissionService.getMissionsByChapter(id); }
  };

  const coursesRes = await courseService.getCourses({ status: 'published' });
  const courseList = coursesRes.data;
  const chaptersByCourse = {};
  const investigationsMap = {};
  
  await Promise.all(
    courseList.map(async (course) => {
      const chRes = await courseService.getChaptersByCourse(course.id);
      const chList = chRes?.data || [];
      chaptersByCourse[course.id] = chList;
      await Promise.all(
        chList.map(async (ch) => {
          try {
            const invRes = await investigationService.getInvestigationsByChapter(ch.id);
            if (invRes?.data && invRes.data.length > 0) {
              investigationsMap[ch.id] = invRes.data;
            } else {
              const mRes = await missionService.getMissionsByChapter(ch.id);
              investigationsMap[ch.id] = mRes?.data || [];
            }
          } catch (_e) {
            const mRes = await missionService.getMissionsByChapter(ch.id);
            investigationsMap[ch.id] = mRes?.data || [];
          }
        })
      );
    })
  );

  const end = performance.now();
  console.log('AFTER (Promise.all):');
  console.log(`- Time: ${(end - start).toFixed(0)} ms`);
  console.log(`- Total Requests: ${requests}`);
  return { time: end - start, requests };
}

async function run() {
  await benchmarkBefore();
  await benchmarkAfter();
}
run();
