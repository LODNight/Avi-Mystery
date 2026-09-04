import { getFirestore, collection, getDocs } from 'firebase/firestore';

let cachedMapTree = null;
let inFlightPromise = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const apiLearningMapService = {
  /**
   * Firebase implementation of getLearningMapTree with caching.
   * 
   * @returns {Promise<{ data: Array<Object>, error: any }>}
   */
  async getLearningMapTree(forceRefresh = false) {
    const isCacheValid = cachedMapTree && (Date.now() - lastFetchTime < CACHE_TTL);

    if (!forceRefresh && isCacheValid) {
      return { data: cachedMapTree, error: null };
    }

    if (!forceRefresh && inFlightPromise) {
      return inFlightPromise;
    }

    inFlightPromise = (async () => {
      try {
        const db = getFirestore();
        const viewsRef = collection(db, 'learning_map_views');
        const snapshot = await getDocs(viewsRef);
        
        const views = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === 'published') {
            views.push(data);
          }
        });
        
        views.sort((a, b) => (a.order || 1) - (b.order || 1));
        
        cachedMapTree = views;
        lastFetchTime = Date.now();

        return {
          data: views,
          error: null
        };
      } catch (error) {
        console.error('Error in apiLearningMapService.getLearningMapTree:', error);
        return {
          data: null,
          error: 'Lỗi tải dữ liệu bản đồ học tập từ máy chủ'
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
    lastFetchTime = 0;
  }
};
