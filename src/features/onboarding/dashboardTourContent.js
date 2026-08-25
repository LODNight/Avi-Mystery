/**
 * Dashboard Guided Tour Steps & Content Configuration (Step 6.6 Refinement)
 *
 * Định nghĩa 6 bước tour hướng dẫn sâu và toàn diện cho giao diện Dashboard:
 *  1. Welcome Header & Status (#dashboard-welcome-header)
 *  2. 4 Stat Counters & Streak (#dashboard-stat-cards)
 *  3. Continue Last Active Case (#dashboard-continue-investigation)
 *  4. Investigator Rank & XP Progress (#dashboard-investigator-level)
 *  5. Active Courses & Roadmap (#dashboard-active-courses)
 *  6. Recommended Missions Grid (#dashboard-recommended-missions)
 */

export const DASHBOARD_TOUR_STEPS = Object.freeze([
  {
    target: '#dashboard-welcome-header',
    targetId: 'dashboard-welcome-header',
    title: '👋 Trung Tâm Điều Tra & Tổng Quan',
    body: 'Chào mừng bạn đến với Tổng hành dinh! Nơi đây hiển thị thời gian thực tế, lời chúc thám tử mỗi ngày và trạng thái ghi nhận hoàn thành khóa huấn luyện nhập môn (+50 XP).',
    content: 'Chào mừng bạn đến với Tổng hành dinh! Nơi đây hiển thị thời gian thực tế, lời chúc thám tử mỗi ngày và trạng thái ghi nhận hoàn thành khóa huấn luyện nhập môn (+50 XP).',
  },
  {
    target: '#dashboard-stat-cards',
    targetId: 'dashboard-stat-cards',
    title: '🔥 Bộ Chỉ Số Rèn Luyện & Streak',
    body: 'Theo dõi 4 chỉ số cốt lõi: Chuỗi ngày Streak (duy trì thói quen rèn luyện), Mục tiêu nhiệm vụ tuần, Tổng điểm XP tích lũy và Thời gian học tập.',
    content: 'Theo dõi 4 chỉ số cốt lõi: Chuỗi ngày Streak (duy trì thói quen rèn luyện), Mục tiêu nhiệm vụ tuần, Tổng điểm XP tích lũy và Thời gian học tập.',
  },
  {
    target: '#dashboard-continue-investigation',
    targetId: 'dashboard-continue-investigation',
    title: '🔎 Trở Lại Vụ Án Gần Nhất',
    body: 'Thẻ lưu vết vụ án bạn đang phá dở cùng % tiến độ. Click vào biểu tượng Play để lập tức quay lại môi trường thực hành bảng tính Excel/SQL.',
    content: 'Thẻ lưu vết vụ án bạn đang phá dở cùng % tiến độ. Click vào biểu tượng Play để lập tức quay lại môi trường thực hành bảng tính Excel/SQL.',
  },
  {
    target: '#dashboard-investigator-level',
    targetId: 'dashboard-investigator-level',
    title: '🏆 Cấp Độ Thám Tử & Tích Lũy XP',
    body: 'Mỗi bài tập phá án thành công mang về điểm kinh nghiệm (XP). Tích lũy đủ XP để nâng cấp danh hiệu (Data Investigator) và mở khóa các huy hiệu danh giá.',
    content: 'Mỗi bài tập phá án thành công mang về điểm kinh nghiệm (XP). Tích lũy đủ XP để nâng cấp danh hiệu (Data Investigator) và mở khóa các huy hiệu danh giá.',
  },
  {
    target: '#dashboard-active-courses',
    targetId: 'dashboard-active-courses',
    title: '📚 Khóa Học Đang Diễn Ra',
    body: 'Truy cập nhanh các khóa học phân tích dữ liệu từ Excel cơ bản đến SQL nâng cao. Theo dõi tiến độ từng khóa và khám phá lộ trình học tập toàn diện.',
    content: 'Truy cập nhanh các khóa học phân tích dữ liệu từ Excel cơ bản đến SQL nâng cao. Theo dõi tiến độ từng khóa và khám phá lộ trình học tập toàn diện.',
  },
  {
    target: '#dashboard-recommended-missions',
    targetId: 'dashboard-recommended-missions',
    title: '💼 Bảng Hồ Sơ Vụ Án Đề Xuất',
    body: 'Danh sách các nhiệm vụ điều tra đề xuất dành riêng cho cấp độ của bạn. Chọn một hồ sơ vụ án để bắt đầu thử thách phân tích dữ liệu kinh doanh thực tế!',
    content: 'Danh sách các nhiệm vụ điều tra đề xuất dành riêng cho cấp độ của bạn. Chọn một hồ sơ vụ án để bắt đầu thử thách phân tích dữ liệu kinh doanh thực tế!',
  },
]);
