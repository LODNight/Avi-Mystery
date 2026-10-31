/**
 * Dashboard Guided Tour Steps & Content Configuration (5-Step Tour with Sidebar)
 *
 * Định nghĩa 5 bước tour hướng dẫn toàn diện bao quát cả Sidebar và Nội dung Dashboard:
 *  1. Sidebar Navigation Menu (#app-sidebar)
 *  2. Welcome Header & Intent Compass (#dashboard-welcome-header)
 *  3. Adaptive Next Best Action (#dashboard-continue-investigation)
 *  4. Active Courses & Roadmap (#dashboard-active-courses)
 *  5. Recommended Next Action (#dashboard-recommended-missions)
 */

export const DASHBOARD_TOUR_STEPS = Object.freeze([
  {
    target: '#app-sidebar',
    targetId: 'app-sidebar',
    title: '📌 Thanh Điều Hướng Sidebar',
    body: 'Menu chính được phân tách rõ ràng: Bàn chỉ huy (Trang chủ), Chuyên án điều tra (Phá đại án nhiều giai đoạn), Bản đồ nhiệm vụ (Bài tập ngắn theo chương), Học viện nghiệp vụ (Học từ con số 0) và Phòng luyện tập.',
    content: 'Menu chính được phân tách rõ ràng: Bàn chỉ huy (Trang chủ), Chuyên án điều tra (Phá đại án nhiều giai đoạn), Bản đồ nhiệm vụ (Bài tập ngắn theo chương), Học viện nghiệp vụ (Học từ con số 0) và Phòng luyện tập.',
  },
  {
    target: '#dashboard-welcome-header',
    targetId: 'dashboard-welcome-header',
    title: '🧭 La Bàn Định Hướng Nhu Cầu Cá Nhân',
    body: 'Bạn có thể chọn 1 trong 3 hướng ưu tiên bất cứ lúc nào: (1) Phá án thực chiến, (2) Học lý thuyết từ cơ bản tại Học viện, hoặc (3) Luyện tập kỹ năng nhanh.',
    content: 'Bạn có thể chọn 1 trong 3 hướng ưu tiên bất cứ lúc nào: (1) Phá án thực chiến, (2) Học lý thuyết từ cơ bản tại Học viện, hoặc (3) Luyện tập kỹ năng nhanh.',
  },
  {
    target: '#dashboard-continue-investigation',
    targetId: 'dashboard-continue-investigation',
    title: '🔎 Trọng Tâm Hành Động Tiếp Theo',
    body: 'Khu vực này tự động thay đổi theo nhu cầu bạn chọn ở trên và hiển thị chính xác tiến độ thực tế của bạn để bắt đầu chỉ với 1 cú nhấp chuột.',
    content: 'Khu vực này tự động thay đổi theo nhu cầu bạn chọn ở trên và hiển thị chính xác tiến độ thực tế của bạn để bắt đầu chỉ với 1 cú nhấp chuột.',
  },
  {
    target: '#dashboard-active-courses',
    targetId: 'dashboard-active-courses',
    title: '📚 Chuyên Đề Đào Tạo & Nghiệp Vụ',
    body: 'Theo dõi các khóa học phân tích dữ liệu chuyên sâu theo từng công cụ (Excel / SQL).',
    content: 'Theo dõi các khóa học phân tích dữ liệu chuyên sâu theo từng công cụ (Excel / SQL).',
  },
  {
    target: '#dashboard-recommended-missions',
    targetId: 'dashboard-recommended-missions',
    title: '🚀 Nhiệm Vụ Ngắn Rèn Thao Tác',
    body: 'Danh sách các bài tập thực hành ngắn 5–10 phút để bạn rèn phản xạ xử lý dữ liệu và tích lũy thêm XP mỗi ngày.',
    content: 'Danh sách các bài tập thực hành ngắn 5–10 phút để bạn rèn phản xạ xử lý dữ liệu và tích lũy thêm XP mỗi ngày.',
  },
]);
