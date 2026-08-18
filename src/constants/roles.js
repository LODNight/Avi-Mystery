// Các vai trò người dùng trong hệ thống
export const ROLES = {
  LEARNER: 'learner',
  CONTENT_ADMIN: 'content_admin',
  SUPER_ADMIN: 'super_admin',
};

// Kiểm tra xem role có phải admin không
export const ADMIN_ROLES = [ROLES.CONTENT_ADMIN, ROLES.SUPER_ADMIN];

export function isAdmin(role) {
  return ADMIN_ROLES.includes(role);
}

export function isLearner(role) {
  return role === ROLES.LEARNER;
}
