/**
 * Dashboard Guided Tour Steps & Content Configuration (5-Step Tour with Sidebar)
 *
 * Định nghĩa 5 bước tour hướng dẫn toàn diện bao quát cả Sidebar và Nội dung Dashboard:
 *  1. Sidebar Navigation Menu (#app-sidebar)
 *  2. Welcome Header & Stats (#dashboard-welcome-header)
 *  3. Continue Last Active Case (#dashboard-continue-investigation)
 *  4. Active Courses & Roadmap (#dashboard-active-courses)
 *  5. Recommended Next Action (#dashboard-recommended-missions)
 */

export const DASHBOARD_TOUR_STEPS = Object.freeze([
  {
    target: '#app-sidebar',
    targetId: 'app-sidebar',
    title: '📌 Thanh Điều Hướng Sidebar',
    body: 'Menu chính giúp bạn di chuyển nhanh giữa các khu vực: Tổng quan, Bản đồ học tập, Danh sách khóa học, Luyện tập, Thành tựu và Hồ sơ cá nhân.',
    content: 'Menu chính giúp bạn di chuyển nhanh giữa các khu vực: Tổng quan, Bản đồ học tập, Danh sách khóa học, Luyện tập, Thành tựu và Hồ sơ cá nhân.',
  },
  {
    target: '#dashboard-welcome-header',
    targetId: 'dashboard-welcome-header',
    title: '👋 Chào mừng & Chỉ số Thám tử',
    body: 'Chào mừng bạn đến Tổng hành dinh! Nơi đây hiển thị chuỗi ngày Streak, tổng điểm XP và danh hiệu cấp độ thám tử dữ liệu của bạn.',
    content: 'Chào mừng bạn đến Tổng hành dinh! Nơi đây hiển thị chuỗi ngày Streak, tổng điểm XP và danh hiệu cấp độ thám tử dữ liệu của bạn.',
  },
  {
    target: '#dashboard-continue-investigation',
    targetId: 'dashboard-continue-investigation',
    title: '🔎 Trở lại vụ án đang phá dở',
    body: 'Xem nhanh tiến độ vụ án bạn đang làm dở. Nhấn nút Play để trở lại ngay môi trường làm việc Excel/SQL.',
    content: 'Xem nhanh tiến độ vụ án bạn đang làm dở. Nhấn nút Play để trở lại ngay môi trường làm việc Excel/SQL.',
  },
  {
    target: '#dashboard-active-courses',
    targetId: 'dashboard-active-courses',
    title: '📚 Lộ trình học & Vụ án đề xuất',
    body: 'Theo dõi các khóa học phân tích dữ liệu đang diễn ra và chọn nhiệm vụ thử thách tiếp theo phù hợp với trình độ.',
    content: 'Theo dõi các khóa học phân tích dữ liệu đang diễn ra và chọn nhiệm vụ thử thách tiếp theo phù hợp với trình độ.',
  },
  {
    target: '#dashboard-recommended-missions',
    targetId: 'dashboard-recommended-missions',
    title: '🚀 Tiếp theo nên làm gì?',
    body: 'Hãy bắt đầu ngay bằng cách bấm "Khám phá khóa học" hoặc chọn một hồ sơ vụ án bên dưới để tích lũy thêm XP!',
    content: 'Hãy bắt đầu ngay bằng cách bấm "Khám phá khóa học" hoặc chọn một hồ sơ vụ án bên dưới để tích lũy thêm XP!',
  },
]);
