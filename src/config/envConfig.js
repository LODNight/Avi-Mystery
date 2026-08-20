/**
 * Configuration manager để phân biệt môi trường DEV (dành cho thử nghiệm)
 * và môi trường PRODUCTION (bản dành cho User).
 */

const getAppEnv = () => {
  // 1. Nếu được định nghĩa qua biến môi trường VITE_APP_ENV (Vercel settings)
  if (import.meta.env.VITE_APP_ENV) {
    return import.meta.env.VITE_APP_ENV;
  }

  // 2. Kiểm tra nếu chạy localhost hoặc domain preview của Vercel
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.includes('-git-dev-') ||
      host.includes('preview') ||
      host.includes('dev.')
    ) {
      return 'development';
    }
  }

  // 3. Mặc định là mode của Vite
  return import.meta.env.MODE || 'production';
};

export const APP_ENV = getAppEnv();

/**
 * Trả về true nếu đang chạy trên bản DEV (Localhost hoặc Vercel Dev Branch)
 */
export const IS_DEV = APP_ENV === 'development' || import.meta.env.DEV;

/**
 * Trả về true nếu đang ở bản PRODUCTION cho User
 */
export const IS_PROD = !IS_DEV;

/**
 * Cấu hình kiểm soát tính năng theo môi trường (Feature Flags)
 */
export const FEATURE_FLAGS = {
  // Bản Dev hiển thị Badge "BẢN DEV / PREVIEW" để Dev nhận biết ngay
  showDevBadge: IS_DEV,

  // Bản Dev hiển thị tất cả các bài thử nghiệm / nháp
  showExperimentalFeatures: IS_DEV,

  // Bản Dev cho phép bật phím tắt Admin / Bypass nhanh
  enableDevShortcuts: IS_DEV,
};
