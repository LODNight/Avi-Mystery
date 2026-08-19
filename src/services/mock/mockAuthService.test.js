import { describe, it, expect, beforeEach } from 'vitest';
import { mockAuthService } from './mockAuthService.js';
import { storage } from '../../utils/storage.js';

describe('mockAuthService Unit Tests', () => {
  beforeEach(() => {
    storage.remove('session');
  });

  it('login thành công với email và password hợp lệ', async () => {
    const res = await mockAuthService.login({
      email: 'learner@avimystery.dev',
      password: 'demo1234',
    });

    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();
    expect(res.data.email).toBe('learner@avimystery.dev');
    expect(res.data.role).toBe('learner');
    // Không được trả về password
    expect(res.data.password).toBeUndefined();
  });

  it('login thất bại với sai password', async () => {
    const res = await mockAuthService.login({
      email: 'learner@avimystery.dev',
      password: 'wrongpassword',
    });

    expect(res.data).toBeNull();
    expect(res.error).toContain('không đúng');
  });

  it('register thành công với user mới', async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const res = await mockAuthService.register({
      name: 'Test Learner',
      email: testEmail,
      password: 'password123',
    });

    expect(res.error).toBeNull();
    expect(res.data.email).toBe(testEmail);
    expect(res.data.role).toBe('learner');
    expect(res.data.level).toBe(1);

    // Kiểm tra session đã được lưu
    const current = await mockAuthService.getCurrentUser();
    expect(current.data.email).toBe(testEmail);
  });

  it('register thất bại khi email đã tồn tại', async () => {
    const res = await mockAuthService.register({
      name: 'Minh Quân',
      email: 'learner@avimystery.dev',
      password: 'password123',
    });

    expect(res.data).toBeNull();
    expect(res.error).toContain('đã được sử dụng');
  });

  it('logout xóa session thành công', async () => {
    await mockAuthService.login({
      email: 'learner@avimystery.dev',
      password: 'demo1234',
    });

    await mockAuthService.logout();
    const current = await mockAuthService.getCurrentUser();
    expect(current.data).toBeNull();
  });
});
