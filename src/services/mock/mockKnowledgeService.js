import { KNOWLEDGE_ERROR_CODES } from '../contracts/knowledgeService.js';
import { storage } from '../../utils/storage.js';

let mockTopics = [
  {
    id: 'topic-001',
    tool: 'excel',
    category: 'basic',
    title: 'Hàm SUM - Tính Tổng',
    contentMarkdown: '## Giới thiệu Hàm SUM\n\nHàm **SUM** dùng để tính tổng các giá trị trong một hoặc nhiều dải ô.\n\n### Cú pháp\n```excel\n=SUM(number1, [number2], ...)\n```\n\n### Ví dụ thực tế\nTính tổng cột doanh thu từ B2 đến B10:\n```excel\n=SUM(B2:B10)\n```\n\n- Bỏ qua các ô chứa chữ hoặc rỗng.\n- Có thể tính tổng nhiều ô rời rạc: `=SUM(A1, B3, C5)`.',
    relatedMissions: ['mission-001', 'mission-002'],
    orderIndex: 1,
    status: 'published'
  },
  {
    id: 'topic-005',
    tool: 'excel',
    category: 'basic',
    title: 'Hàm AVERAGE & COUNT - Thống Kê Cơ Bản',
    contentMarkdown: '## Hàm AVERAGE & COUNT trong Excel\n\n- **AVERAGE**: Tính giá trị trung bình cộng của các ô chứa số.\n- **COUNT**: Đếm số ô có chứa dữ liệu dạng số.\n\n### Cú pháp\n```excel\n=AVERAGE(range)\n=COUNT(range)\n```\n\n### Ví dụ thực tế\nTính đơn giá trung bình từ E2 đến E9:\n```excel\n=AVERAGE(E2:E9)\n```\n\nĐếm số lượng mặt hàng có số liệu số lượng:\n```excel\n=COUNT(D2:D9)\n```',
    relatedMissions: ['mission-001'],
    orderIndex: 2,
    status: 'published'
  },
  {
    id: 'topic-006',
    tool: 'excel',
    category: 'basic',
    title: 'Hàm MIN & MAX - Tìm Cực Trị Dữ Liệu',
    contentMarkdown: '## Hàm MIN và MAX\n\nHàm **MIN** và **MAX** giúp nhanh chóng phát hiện giá trị nhỏ nhất hoặc lớn nhất trong một tập hợp dữ liệu.\n\n### Cú pháp\n```excel\n=MAX(number1, [number2], ...)\n=MIN(number1, [number2], ...)\n```\n\n### Ví dụ thực tế\nTìm đơn hàng có thành tiền lớn nhất:\n```excel\n=MAX(F2:F9)\n```\n\nTìm giá trị đơn giá thấp nhất:\n```excel\n=MIN(E2:E9)\n```',
    relatedMissions: ['mission-001'],
    orderIndex: 3,
    status: 'published'
  },
  {
    id: 'topic-002',
    tool: 'excel',
    category: 'intermediate',
    title: 'Hàm SUMIF - Tính Tổng Có Điều Kiện',
    contentMarkdown: '## Giới thiệu Hàm SUMIF\n\nHàm **SUMIF** dùng để tính tổng các giá trị thỏa mãn một tiêu chí nhất định.\n\n### Cú pháp\n```excel\n=SUMIF(range, criteria, [sum_range])\n```\n\n### Ví dụ thực tế\nTính tổng doanh thu của nhân viên có mã "NV01":\n```excel\n=SUMIF(A2:A20, "NV01", B2:B20)\n```\n\n- `range`: Vùng điều kiện cần kiểm tra.\n- `criteria`: Điều kiện (ví dụ: `">100"`, `"Hoàn thành"`).\n- `sum_range`: Vùng số liệu thực tế cần cộng tổng.',
    relatedMissions: ['mission-001'],
    orderIndex: 4,
    status: 'published'
  },
  {
    id: 'topic-003',
    tool: 'sql',
    category: 'basic',
    title: 'Lệnh SELECT - Truy Vấn Cơ Bản',
    contentMarkdown: '## Cú pháp SELECT cơ bản\n\nLệnh **SELECT** được dùng để trích xuất dữ liệu từ các bảng trong cơ sở dữ liệu.\n\n### Cú pháp\n```sql\nSELECT column1, column2 FROM table_name;\n```\n\n### Ví dụ thực tế\nLấy toàn bộ cột dữ liệu từ bảng giao dịch:\n```sql\nSELECT * FROM sales;\n```\n\nChỉ lấy mã giao dịch và số tiền:\n```sql\nSELECT transaction_id, amount FROM sales;\n```',
    relatedMissions: ['sql-case-001'],
    orderIndex: 5,
    status: 'published'
  },
  {
    id: 'topic-004',
    tool: 'sql',
    category: 'intermediate',
    title: 'Mệnh Đề WHERE - Lọc Dữ Liệu SQL',
    contentMarkdown: '## Mệnh đề WHERE trong SQL\n\nMệnh đề **WHERE** được dùng để lọc các dòng dữ liệu thoả mãn điều kiện đặt ra.\n\n### Cú pháp\n```sql\nSELECT * FROM table_name WHERE condition;\n```\n\n### Ví dụ thực tế\nTìm các giao dịch có số tiền lớn hơn 500.000đ:\n```sql\nSELECT * FROM sales WHERE amount > 500000;\n```\n\nKết hợp nhiều điều kiện với `AND` / `OR`:\n```sql\nSELECT * FROM sales WHERE payment_method = "Credit Card" AND amount >= 1000000;\n```',
    relatedMissions: ['sql-case-001'],
    orderIndex: 6,
    status: 'published'
  },
  {
    id: 'topic-007',
    tool: 'sql',
    category: 'basic',
    title: 'Mệnh Đề ORDER BY & LIMIT - Sắp Xếp & Giới Hạn',
    contentMarkdown: '## ORDER BY & LIMIT trong SQL\n\n- **ORDER BY**: Sắp xếp kết quả trả về theo thứ tự tăng dần (`ASC` - mặc định) hoặc giảm dần (`DESC`).\n- **LIMIT**: Giới hạn số lượng bản ghi hiển thị.\n\n### Cú pháp\n```sql\nSELECT * FROM table_name ORDER BY column_name DESC LIMIT n;\n```\n\n### Ví dụ thực tế\nXem top 5 đơn hàng có doanh số cao nhất:\n```sql\nSELECT transaction_id, product_name, amount FROM sales ORDER BY amount DESC LIMIT 5;\n```',
    relatedMissions: ['sql-case-001'],
    orderIndex: 7,
    status: 'published'
  },
  {
    id: 'topic-008',
    tool: 'sql',
    category: 'intermediate',
    title: 'Mệnh Đề GROUP BY & Hàm Tổng Hợp',
    contentMarkdown: '## Mệnh đề GROUP BY trong SQL\n\nMệnh đề **GROUP BY** gom các hàng có cùng giá trị thành các nhóm tóm tắt dữ liệu, thường dùng chung với các hàm tổng hợp như `COUNT()`, `SUM()`, `AVG()`, `MAX()`, `MIN()`.\n\n### Cú pháp\n```sql\nSELECT column_name, COUNT(*), SUM(amount) FROM table_name GROUP BY column_name;\n```\n\n### Ví dụ thực tế\nThống kê tổng doanh thu theo từng phương thức thanh toán:\n```sql\nSELECT payment_method, COUNT(*) AS total_orders, SUM(amount) AS total_revenue FROM sales GROUP BY payment_method;\n```',
    relatedMissions: ['sql-case-001'],
    orderIndex: 8,
    status: 'published'
  }
];

export const mockKnowledgeService = {
  // --- Learner Methods ---
  async getPublishedTopics(filter = {}) {
    let topics = mockTopics.filter(t => t.status === 'published');
    if (filter.tool) topics = topics.filter(t => t.tool === filter.tool);
    if (filter.category) topics = topics.filter(t => t.category === filter.category);
    topics.sort((a, b) => a.orderIndex - b.orderIndex);
    return { data: topics, error: null };
  },

  async getTopicsByMission(missionId) {
    if (!missionId) return { data: [], error: null };
    const topics = mockTopics.filter(t => t.status === 'published' && t.relatedMissions?.includes(missionId));
    return { data: topics, error: null };
  },

  async getTopicById(topicId) {
    const topic = mockTopics.find(t => t.id === topicId);
    if (topic) return { data: topic, error: null };
    return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.NOT_FOUND } };
  },

  async markTopicAsRead(learnerId, topicId) {
    const key = `knowledge_progress_${learnerId}`;
    const readList = storage.get(key) || [];
    if (!readList.includes(topicId)) {
      readList.push(topicId);
      storage.set(key, readList);
    }
    return { data: { success: true }, error: null };
  },

  async getReadTopics(learnerId) {
    const key = `knowledge_progress_${learnerId}`;
    const readList = storage.get(key) || [];
    return { data: readList, error: null };
  },

  // --- Admin Methods ---
  async getAllTopics() {
    let topics = [...mockTopics];
    topics.sort((a, b) => a.orderIndex - b.orderIndex);
    return { data: topics, error: null };
  },

  async createTopic(topicData) {
    const newTopic = {
      ...topicData,
      id: `topic-${Date.now()}`
    };
    mockTopics.push(newTopic);
    return { data: newTopic, error: null };
  },

  async updateTopic(topicId, updates) {
    const idx = mockTopics.findIndex(t => t.id === topicId);
    if (idx === -1) return { data: null, error: { code: KNOWLEDGE_ERROR_CODES.NOT_FOUND } };
    mockTopics[idx] = { ...mockTopics[idx], ...updates };
    return { data: mockTopics[idx], error: null };
  },

  async deleteTopic(topicId) {
    mockTopics = mockTopics.filter(t => t.id !== topicId);
    return { data: true, error: null };
  }
};
