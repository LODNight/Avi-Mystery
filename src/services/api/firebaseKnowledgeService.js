import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { KNOWLEDGE_ERROR_CODES } from '../contracts/knowledgeService.js';
import { mockKnowledgeService } from '../mock/mockKnowledgeService.js';

export const firebaseKnowledgeService = {
  // --- Learner Methods ---

  async getPublishedTopics(filter = {}) {
    try {
      const qConstraints = [where('status', '==', 'published')];
      
      if (filter.tool) {
        qConstraints.push(where('tool', '==', filter.tool));
      }
      if (filter.category) {
        qConstraints.push(where('category', '==', filter.category));
      }
      
      const q = query(collection(db, 'knowledge_topics'), ...qConstraints);
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Fallback sang mock topics khi Firestore chưa được seed dữ liệu
        return mockKnowledgeService.getPublishedTopics(filter);
      }

      let topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      topics.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      
      return { data: topics, error: null };
    } catch (error) {
      console.warn('Firestore getPublishedTopics error, fallback to mock:', error.message);
      return mockKnowledgeService.getPublishedTopics(filter);
    }
  },

  async getTopicsByMission(missionId) {
    if (!missionId) return { data: [], error: null };
    try {
      const q = query(
        collection(db, 'knowledge_topics'), 
        where('status', '==', 'published'),
        where('relatedMissions', 'array-contains', missionId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { data: [], error: null };
      }
      const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: topics, error: null };
    } catch (error) {
      console.error('Error fetching topics by mission:', error);
      return { data: [], error: { code: KNOWLEDGE_ERROR_CODES.UNKNOWN_ERROR, message: error.message } };
    }
  },

  async getTopicById(topicId) {
    if (!topicId) return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.VALIDATION_ERROR } };
    try {
      const docRef = doc(db, 'knowledge_topics', topicId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
      }
      return mockKnowledgeService.getTopicById(topicId);
    } catch (error) {
      console.warn('Firestore getTopicById error, fallback to mock:', error.message);
      return mockKnowledgeService.getTopicById(topicId);
    }
  },

  async markTopicAsRead(learnerId, topicId) {
    if (!learnerId || !topicId) return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.VALIDATION_ERROR } };
    try {
      // Store in a subcollection of learners: learners/{learnerId}/knowledge_progress/{topicId}
      const progressRef = doc(db, 'learners', learnerId, 'knowledge_progress', topicId);
      await setDoc(progressRef, {
        topicId,
        readAt: serverTimestamp()
      }, { merge: true });
      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error in markTopicAsRead:', error);
      return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.UNKNOWN_ERROR, message: error.message } };
    }
  },

  async getReadTopics(learnerId) {
    if (!learnerId) return { data: [], error: { code: KNOWLEDGE_ERROR_CODES.VALIDATION_ERROR } };
    try {
      const q = query(collection(db, 'learners', learnerId, 'knowledge_progress'));
      const snapshot = await getDocs(q);
      const readTopics = snapshot.docs.map(doc => doc.id); // Array of topicIds
      return { data: readTopics, error: null };
    } catch (error) {
      console.error('Error in getReadTopics:', error);
      return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.UNKNOWN_ERROR, message: error.message } };
    }
  },

  // --- Admin Methods ---

  async getAllTopics() {
    try {
      const snapshot = await getDocs(collection(db, 'knowledge_topics'));
      if (snapshot.empty) {
        return mockKnowledgeService.getAllTopics();
      }
      let topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      topics.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      return { data: topics, error: null };
    } catch (error) {
      console.warn('Error fetching all topics, fallback to mock:', error.message);
      return mockKnowledgeService.getAllTopics();
    }
  },

  async createTopic(topicData) {
    try {
      const newRef = doc(collection(db, 'knowledge_topics'));
      const payload = {
        ...topicData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(newRef, payload);
      return { data: { id: newRef.id, ...payload }, error: null };
    } catch (error) {
      console.error('Error in createTopic:', error);
      return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.UNKNOWN_ERROR, message: error.message } };
    }
  },

  async updateTopic(topicId, updates) {
    if (!topicId) return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.VALIDATION_ERROR } };
    try {
      const docRef = doc(db, 'knowledge_topics', topicId);
      const payload = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      await updateDoc(docRef, payload);
      return { data: { id: topicId, ...payload }, error: null };
    } catch (error) {
      console.error('Error in updateTopic:', error);
      return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.UNKNOWN_ERROR, message: error.message } };
    }
  },

  async deleteTopic(topicId) {
    if (!topicId) return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.VALIDATION_ERROR } };
    try {
      await deleteDoc(doc(db, 'knowledge_topics', topicId));
      return { data: true, error: null };
    } catch (error) {
      console.error('Error in deleteTopic:', error);
      return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.UNKNOWN_ERROR, message: error.message } };
    }
  }
};
