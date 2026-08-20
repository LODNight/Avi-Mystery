/**
 * Formatting utilities — số, thời gian, text
 */

/**
 * Format số dạng gọn: 1200 → "1,200"
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Format tiền tệ VNĐ: 150000 → "150.000 ₫"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Format XP: 720 → "720 XP"
 */
export function formatXP(xp) {
  return `${formatNumber(xp)} XP`;
}

/**
 * Format thời gian làm bài (phút): 90 → "1 giờ 30 phút"
 */
export function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

/**
 * Format ngày: ISO string → "17/08/2026"
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoString));
}

/**
 * Format ngày giờ ngắn: "17/08 09:00"
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

/**
 * Format thời gian tương đối: "2 giờ trước"
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Label cho difficulty
 */
export function difficultyLabel(difficulty) {
  const map = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
    beginner: 'Người mới',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };
  return map[difficulty] ?? capitalize(difficulty);
}

/**
 * Label cho tool
 */
export function toolLabel(tool) {
  const map = { excel: 'Excel', sql: 'SQL' };
  return map[tool] ?? capitalize(tool);
}
