/**
/**
 * Dashboard Guided Tour Steps & Content Configuration (Step 6.6)
 *
 * Định nghĩa 4 bước giới thiệu giao diện Dashboard cho thám tử mới:
 *  1. Header & Learning Pulse (#dashboard-welcome-header)
 *  2. Continue Investigation Card (#dashboard-continue-investigation)
 *  3. Investigator Level & XP Progress (#dashboard-investigator-level)
 *  4. Active Courses & Mission Roadmap (#dashboard-active-courses)
 */

export const DASHBOARD_TOUR_STEPS = Object.freeze([
  {
    targetId: 'dashboard-welcome-header',
    title: '👋 Trung Tâm Điều Tra',
    content:
      'Chào mừng bạn đến với tổng hành dinh! Nơi đây hiển thị chuỗi ngày học liên tục (Streak) và lời chúc mỗi ngày giúp bạn duy trì thói quen rèn luyện.',
  },
  {
    targetId: 'dashboard-continue-investigation',
    title: '🔎 Trở Lại Vụ Án Gần Nhất',
    content:
      'Thẻ này lưu vết vụ án bạn đang phá dở cùng % tiến độ. Click nút "Play" để lập tức quay lại môi trường thực hành Excel/SQL.',
  },
  {
    targetId: 'dashboard-investigator-level',
    title: '🏆 Cấp Độ Thám Tử & XP',
    content:
      'Tích lũy điểm XP từ mỗi bài thực hành đúng để tăng cấp danh hiệu thám tử dữ liệu (Data Investigator) và nhận huy hiệu danh giá.',
  },
  {
    targetId: 'dashboard-active-courses',
    title: '📚 Bản Đồ Học Tập & Khóa Học',
    content:
      'Khám phá danh sách các khóa học Excel, SQL và chuỗi vụ án điều tra kinh doanh thực tế được thiết kế theo cấp độ từ cơ bản đến nâng cao.',
  },
]);
