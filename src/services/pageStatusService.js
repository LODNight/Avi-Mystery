/**
 * Service quản lý trạng thái các trang hệ thống (Admin & Learner)
 * Lưu trữ cấu hình trong localStorage và hỗ trợ khôi phục mặc định
 */

const STORAGE_KEY = 'avi_page_statuses_v1';

export const DEFAULT_PAGE_STATUSES = [
  {
    id: 'dashboard',
    name: 'Trang Tổng quan',
    path: '/dashboard',
    category: 'Learner Core',
    status: 'active',
    maintenanceTitle: 'Bảo trì Trang Tổng quan',
    maintenanceMessage: 'Hệ thống đang đồng bộ dữ liệu tiến trình học tập của bạn. Vui lòng quay lại trong chốc lát.',
    estimatedTime: '30 phút nữa',
    noticeMessage: 'Hệ thống sẽ tổng kết bảng xếp hạng tuần vào 24:00 đêm nay.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Hệ thống',
  },
  {
    id: 'map',
    name: 'Bản đồ học tập',
    path: '/map',
    category: 'Learner Core',
    status: 'active',
    maintenanceTitle: 'Cập nhật Bản đồ Tiến trình',
    maintenanceMessage: 'Đang mở rộng các node nhiệm vụ điều tra dữ liệu nông nghiệp mới cho Sprint tiếp theo.',
    estimatedTime: '18:00 - 20/08/2026',
    noticeMessage: 'Đã cập nhật thêm 3 chương học mới trong Bản đồ điều tra.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Hệ thống',
  },
  {
    id: 'courses',
    name: 'Danh sách Khóa học',
    path: '/courses',
    category: 'Learner Core',
    status: 'active',
    maintenanceTitle: 'Bảo trì Hệ thống Khóa học',
    maintenanceMessage: 'Chúng tôi đang cập nhật các bộ dataset nông nghiệp chuẩn hóa và nâng cấp tài liệu học.',
    estimatedTime: '2 giờ nữa',
    noticeMessage: 'Sắp ra mắt khóa học mới: "Phân tích Dữ liệu Nông nghiệp Chuyên sâu".',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Hệ thống',
  },
  {
    id: 'practice',
    name: 'Khu vực Luyện tập',
    path: '/practice',
    category: 'Learner Core',
    status: 'active',
    maintenanceTitle: 'Bảo trì Tính năng Luyện tập',
    maintenanceMessage: 'Máy chủ chấm bài và kiểm tra truy vấn SQL/Pandas đang được nâng cấp băng thông.',
    estimatedTime: '19:30 đêm nay',
    noticeMessage: 'Chế độ luyện tập mới sẽ bổ sung thêm gợi ý AI thông minh.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Hệ thống',
  },
  {
    id: 'achievements',
    name: 'Thành tựu & Huy hiệu',
    path: '/achievements',
    category: 'Gamification',
    status: 'active',
    maintenanceTitle: 'Bảo trì Hệ thống Huy hiệu',
    maintenanceMessage: 'Hệ thống đang recalculate điểm kinh nghiệm (XP) và cấp bậc nhà điều tra.',
    estimatedTime: '15 phút nữa',
    noticeMessage: 'Huy hiệu mới "Nhà phân tích xuất sắc" vừa được phát hành!',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Hệ thống',
  },
  {
    id: 'profile',
    name: 'Hồ sơ cá nhân',
    path: '/profile',
    category: 'User Account',
    status: 'active',
    maintenanceTitle: 'Bảo trì Trang Hồ sơ',
    maintenanceMessage: 'Tính năng tùy chỉnh ảnh đại diện và bảo mật tài khoản đang được bảo trì.',
    estimatedTime: '17:00 chiều nay',
    noticeMessage: 'Hãy cập nhật đầy đủ thông tin cá nhân để nhận quà tặng XP.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Hệ thống',
  },
];

export const pageStatusService = {
  /**
   * Lấy toàn bộ danh sách trạng thái trang
   */
  getAllStatuses: () => {
    const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_PAGE_STATUSES));
    if (typeof window === 'undefined') return cloneDefaults();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const defaults = cloneDefaults();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
      }
      const parsed = JSON.parse(saved);
      // Merge với default để bảo đảm không thiếu trang nếu thêm trang mới
      const merged = cloneDefaults().map((defItem) => {
        const found = parsed.find((p) => p.id === defItem.id || p.path === defItem.path);
        return found ? { ...defItem, ...found } : defItem;
      });
      return merged;
    } catch (err) {
      console.error('Lỗi khi đọc trang thái trang từ localStorage:', err);
      return cloneDefaults();
    }
  },

  /**
   * Lấy cấu hình trạng thái của 1 đường dẫn cụ thể (e.g. '/courses' hay '/courses/sql-basics')
   */
  getByPath: (path) => {
    const statuses = pageStatusService.getAllStatuses();
    // Khớp chính xác hoặc khớp prefix (ví dụ /courses/sql-1 sẽ thuộc /courses)
    return (
      statuses.find((s) => s.path === path) ||
      statuses.find((s) => s.path !== '/' && path.startsWith(s.path)) ||
      null
    );
  },

  /**
   * Cập nhật thông tin/trạng thái của 1 trang
   */
  updatePageStatus: (id, partialConfig, updatedByName = 'Admin') => {
    const statuses = pageStatusService.getAllStatuses();
    const index = statuses.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...statuses[index],
      ...partialConfig,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedByName,
    };

    statuses[index] = updatedItem;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (err) {
      console.error('Lỗi khi lưu trạng thái trang:', err);
    }
    return updatedItem;
  },

  /**
   * Đặt trạng thái hàng loạt (VD: Bảo trì tất cả hoặc Kích hoạt tất cả)
   */
  setBulkStatus: (newStatus, updatedByName = 'Admin') => {
    const statuses = pageStatusService.getAllStatuses();
    const updated = statuses.map((s) => ({
      ...s,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedByName,
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Lỗi khi lưu trạng thái hàng loạt:', err);
    }
    return updated;
  },

  /**
   * Khôi phục cấu hình mặc định ban đầu
   */
  resetToDefaults: () => {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_PAGE_STATUSES));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch (err) {
      console.error('Lỗi khi khôi phục trạng thái mặc định:', err);
    }
    return defaults;
  },

};
