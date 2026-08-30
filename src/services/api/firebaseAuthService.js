import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase.js';
import { ONBOARDING_STATUS } from '../../features/onboarding/onboardingService.js';

// Helper to map Firebase errors to user-friendly messages
function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email hoặc mật khẩu không đúng.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng. Vui lòng thử email khác hoặc đăng nhập.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không hợp lệ.';
    default:
      return error.message || 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.';
  }
}

// Helper to build the application-level User contract
async function buildUserContract(firebaseUser) {
  if (!firebaseUser) return null;
  
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const userData = userSnap.data();
    
    // Attempt to get learner data if role is learner (or fallback)
    let learnerData = {
      currentLevel: 1,
      totalXp: 0,
      streakSummary: { currentStreak: 0 }
    };
    
    if (userData.role === 'learner') {
      const learnerRef = doc(db, 'learners', firebaseUser.uid);
      const learnerSnap = await getDoc(learnerRef);
      if (learnerSnap.exists()) {
        learnerData = learnerSnap.data();
      }
    }

    return {
      id: firebaseUser.uid,
      name: userData.name || '',
      email: firebaseUser.email,
      role: userData.role || 'learner',
      avatar: null,
      level: learnerData.currentLevel || 1,
      xp: learnerData.totalXp || 0,
      xpToNextLevel: 1000, // Static for now, can be calculated dynamically based on domain logic if needed
      streak: learnerData.streakSummary?.currentStreak || 0,
    };
  } catch (err) {
    console.error("Error building user contract:", err);
    return null;
  }
}

export const firebaseAuthService = {
  async login({ email, password }) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      const userContract = await buildUserContract(userCredential.user);
      if (!userContract) {
        return { data: null, error: 'Không tìm thấy hồ sơ người dùng.' };
      }
      
      return { data: userContract, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },

  async register({ name, email, password }) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;
      
      const cleanName = name.trim();

      // Create users/{uid}
      await setDoc(doc(db, 'users', user.uid), {
        role: 'learner',
        email: normalizedEmail,
        name: cleanName,
        createdAt: serverTimestamp()
      });

      // Create learners/{uid} with default state
      await setDoc(doc(db, 'learners', user.uid), {
        totalXp: 0,
        currentLevel: 1,
        onboardingState: ONBOARDING_STATUS.NOT_STARTED,
        streakSummary: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const userContract = {
        id: user.uid,
        name: cleanName,
        email: normalizedEmail,
        role: 'learner',
        avatar: null,
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        streak: 0,
      };

      return { data: userContract, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },

  async logout() {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: getErrorMessage(error) };
    }
  },

  async getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          const userContract = await buildUserContract(firebaseUser);
          resolve({ data: userContract, error: null });
        } else {
          resolve({ data: null, error: null });
        }
      }, (error) => {
        unsubscribe();
        resolve({ data: null, error: getErrorMessage(error) });
      });
    });
  }
};
