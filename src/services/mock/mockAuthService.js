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
