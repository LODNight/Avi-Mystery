/**
 * learningMapProjector.js
 *
 * Encapsulates the Domain Projection boundary (CQRS) for the Learning Map Read Model.
 * Transforms Source of Truth content entities into materialized read models
 * and manages persistence of projected views.
 */

import { buildLearningMapView } from './readModelBuilder.js';
import { storage } from '../../utils/storage.js';

export const LEARNING_MAP_VIEWS_KEY = 'admin_learning_map_views';

export const learningMapProjector = {
  /**
   * Pure domain projection of a single course into its Read Model document.
   */
  projectCourse(course, chapters = [], missions = []) {
    return buildLearningMapView(course, chapters, missions);
  },

  /**
   * Synchronizes and persists the projected read model for a given course.
   *
   * @param {Object} course The published Course document
   * @param {Array<Object>} chapters Chapters belonging to the course
   * @param {Array<Object>} missions Missions belonging to the course
   * @param {Object} [storageAdapter=storage] Storage provider
   * @returns {Object|null} The updated read model view
   */
  syncCourseProjection(course, chapters = [], missions = [], storageAdapter = storage) {
    const view = buildLearningMapView(course, chapters, missions);
    if (!view) {
      return null;
    }

    const currentViews = storageAdapter.get(LEARNING_MAP_VIEWS_KEY) || [];
    const existingIndex = currentViews.findIndex((v) => v.courseId === course.id);

    let updatedViews;
    if (existingIndex >= 0) {
      updatedViews = [...currentViews];
      updatedViews[existingIndex] = view;
    } else {
      updatedViews = [...currentViews, view];
    }

    storageAdapter.set(LEARNING_MAP_VIEWS_KEY, updatedViews);
    return view;
  },
};
