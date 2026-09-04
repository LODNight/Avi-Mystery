import mapViews from '../../mocks/data/learning_map_views.json';

let cachedMapTree = null;
let inFlightPromise = null;

export const mockLearningMapService = {
  /**
   * Mock implementation of getLearningMapTree with caching.
   * 
   * @returns {Promise<{ data: Array<Object>, error: any }>}
   */
  async getLearningMapTree(forceRefresh = false) {
    if (!forceRefresh && cachedMapTree) {
      return { data: cachedMapTree, error: null };
    }

    if (!forceRefresh && inFlightPromise) {
      return inFlightPromise;
    }

    inFlightPromise = (async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        cachedMapTree = mapViews;
        return {
          data: cachedMapTree,
          error: null
        };
      } catch (error) {
        console.error('Error in mockLearningMapService.getLearningMapTree:', error);
        return {
          data: null,
          error: 'Lỗi tải dữ liệu lộ trình học tập'
        };
      } finally {
        inFlightPromise = null;
      }
    })();

    return inFlightPromise;
  },

  /**
   * Invalidate the cache to force a fresh fetch on next call.
   */
  invalidateCache() {
    cachedMapTree = null;
    inFlightPromise = null;
  }
};
