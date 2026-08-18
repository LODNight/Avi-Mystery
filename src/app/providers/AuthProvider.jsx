import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../../services/index.js';

export const AuthContext = createContext(null);

/**
 * AuthProvider — wrap toàn bộ app để cung cấp auth state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'loading' | 'authenticated' | 'unauthenticated'
  const [status, setStatus] = useState('loading');

  // Khôi phục session khi app khởi động
  useEffect(() => {
    let cancelled = false;
    authService.getCurrentUser().then(({ data }) => {
      if (!cancelled) {
        setUser(data);
        setStatus(data ? 'authenticated' : 'unauthenticated');
      }
    });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    if (result.data) {
      setUser(result.data);
      setStatus('authenticated');
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = {
    user,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — hook để lấy auth context trong bất kỳ component nào.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
