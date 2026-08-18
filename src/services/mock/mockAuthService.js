import usersData from '../../mocks/data/users.json';
import { storage } from '../../utils/storage.js';

// Giả lập độ trễ mạng (ms)
const DELAY = 300;

function delay(ms = DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Key lưu session trong localStorage
const SESSION_KEY = 'session';

export const mockAuthService = {
  async login({ email, password }) {
    await delay();

    // Loại bỏ khoảng trắng thừa
    const normalizedEmail = email.trim().toLowerCase();

    const user = usersData.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!user) {
      return { data: null, error: 'Email hoặc mật khẩu không đúng.' };
    }

    // Lưu session (không lưu password)
    const { password: _pwd, ...safeUser } = user;
    storage.set(SESSION_KEY, safeUser);

    return { data: safeUser, error: null };
  },

  async register({ name, email, password }) {
    await delay();

    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra email trùng
    const existing = usersData.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (existing) {
      return { data: null, error: 'Email này đã được sử dụng. Vui lòng thử email khác hoặc đăng nhập.' };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role: 'learner',
      avatar: null,
      level: 1,
      xp: 100,
      xpToNextLevel: 1000,
      streak: 1,
    };

    // Thêm vào usersData mảng trong bộ nhớ
    usersData.push({ ...newUser, password });

    // Lưu session
    storage.set(SESSION_KEY, newUser);

    return { data: newUser, error: null };
  },

  async logout() {
    await delay(100);
    storage.remove(SESSION_KEY);
  },

  async getCurrentUser() {
    await delay(100);
    const user = storage.get(SESSION_KEY);
    if (!user) return { data: null, error: null };
    return { data: user, error: null };
  },
};
