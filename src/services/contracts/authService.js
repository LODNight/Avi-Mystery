/**
 * authService contract
 *
 * Mọi auth adapter (mock hoặc api) đều phải implement đủ các method này.
 * Component chỉ gọi các method dưới đây, không biết data đến từ đâu.
 *
 * Tất cả method trả về Promise để giả lập async behavior.
 *
 * Response shape:
 *   { data: T, error: null }  — thành công
 *   { data: null, error: string } — thất bại
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'learner'|'content_admin'|'super_admin'} role
 * @property {string|null} avatar
 * @property {number} level
 * @property {number} xp
 * @property {number} xpToNextLevel
 * @property {number} streak
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * authService interface — implement này trong mock và api adapter.
 *
 * @type {{
 *   login: (credentials: LoginCredentials) => Promise<{data: AuthUser|null, error: string|null}>,
 *   logout: () => Promise<void>,
 *   getCurrentUser: () => Promise<{data: AuthUser|null, error: string|null}>,
 * }}
 */
export const authServiceContract = {
  async login(_credentials) {
    throw new Error('authService.login not implemented');
  },
  async logout() {
    throw new Error('authService.logout not implemented');
  },
  async getCurrentUser() {
    throw new Error('authService.getCurrentUser not implemented');
  },
};
