/**
 * Danh sách các danh hiệu (Achievements) có trong hệ thống.
 * Cấu trúc:
 * - id: Mã danh hiệu
 * - title: Tên danh hiệu
 * - description: Mô tả cách đạt được
 * - icon: Tên icon (Lucide)
 * - rarity: 'common', 'rare', 'epic', 'legendary'
 * - category: 'milestone', 'skill_excel', 'skill_sql', 'streak'
 * - maxProgress: Số lượng yêu cầu để hoàn thành (nếu có)
 */
export const ACHIEVEMENTS_DATA = [
  {
    id: 'badge-first-blood',
    title: 'Vụ án đầu tiên',
    description: 'Hoàn thành nhiệm vụ đầu tiên trong vai trò thám tử dữ liệu.',
    icon: 'target',
    rarity: 'common',
    category: 'milestone',
    maxProgress: 1,
  },
  {
    id: 'badge-excel-novice',
    title: 'Thực tập sinh Excel',
    description: 'Hoàn thành 5 vụ án sử dụng công cụ Excel.',
    icon: 'file-spreadsheet',
    rarity: 'common',
    category: 'skill_excel',
    maxProgress: 5,
  },
  {
    id: 'badge-excel-master',
    title: 'Bậc thầy Excel',
    description: 'Đạt 100 điểm Mastery cho kỹ năng Excel.',
    icon: 'star',
    rarity: 'epic',
    category: 'skill_excel',
    maxProgress: 100,
  },
  {
    id: 'badge-sql-novice',
    title: 'Học việc truy vấn',
    description: 'Thực thi thành công 10 câu truy vấn SQL không lỗi.',
    icon: 'database',
    rarity: 'common',
    category: 'skill_sql',
    maxProgress: 10,
  },
  {
    id: 'badge-sql-master',
    title: 'Thợ săn dữ liệu SQL',
    description: 'Đạt 100 điểm Mastery cho kỹ năng SQL.',
    icon: 'database-zap', // Database + Zap
    rarity: 'epic',
    category: 'skill_sql',
    maxProgress: 100,
  },
  {
    id: 'badge-streak-3',
    title: 'Nhiệt huyết 3 ngày',
    description: 'Duy trì chuỗi học tập liên tục trong 3 ngày.',
    icon: 'flame',
    rarity: 'rare',
    category: 'streak',
    maxProgress: 3,
  },
  {
    id: 'badge-streak-7',
    title: 'Chuyên cần 1 tuần',
    description: 'Duy trì chuỗi học tập liên tục trong 7 ngày.',
    icon: 'flame',
    rarity: 'epic',
    category: 'streak',
    maxProgress: 7,
  },
  {
    id: 'badge-flawless',
    title: 'Thám tử hoàn hảo',
    description: 'Hoàn thành một vụ án khó mà không dùng bất kỳ gợi ý nào.',
    icon: 'award',
    rarity: 'legendary',
    category: 'milestone',
    maxProgress: 1,
  },
];

/**
 * Hàm hỗ trợ lấy dữ liệu thành tựu mặc định (dùng cho mock service).
 */
export function getMockLearnerAchievements(learnerId) {
  // Trả về dữ liệu giả lập cho 1 user (một số đã mở khóa, một số đang dở dang)
  return [
    {
      achievementId: 'badge-first-blood',
      isUnlocked: true,
      currentProgress: 1,
      unlockedAt: '2026-08-20T10:00:00Z',
    },
    {
      achievementId: 'badge-excel-novice',
      isUnlocked: true,
      currentProgress: 5,
      unlockedAt: '2026-08-22T14:30:00Z',
    },
    {
      achievementId: 'badge-excel-master',
      isUnlocked: false,
      currentProgress: 85,
    },
    {
      achievementId: 'badge-sql-novice',
      isUnlocked: false,
      currentProgress: 3,
    },
    {
      achievementId: 'badge-streak-3',
      isUnlocked: true,
      currentProgress: 3,
      unlockedAt: '2026-08-25T08:15:00Z',
    },
    {
      achievementId: 'badge-streak-7',
      isUnlocked: false,
      currentProgress: 3,
    },
    {
      achievementId: 'badge-flawless',
      isUnlocked: false,
      currentProgress: 0,
    },
  ];
}
