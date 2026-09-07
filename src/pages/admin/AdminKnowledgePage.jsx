import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, FileSpreadsheet, Database, Book } from 'lucide-react';
import { knowledgeService } from '../../services/index.js';

export function AdminKnowledgePage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await knowledgeService.getAllTopics();
      if (res.data) setTopics(res.data);
    } catch (err) {
      showToast('Lỗi khi tải danh sách bài học: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (topicId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      const res = await knowledgeService.deleteTopic(topicId);
      if (!res.error) {
        showToast('Đã xóa bài học thành công');
        loadData();
      } else {
        showToast('Lỗi khi xóa: ' + res.error.message, 'error');
      }
    } catch (err) {
      showToast('Lỗi không xác định', 'error');
    }
  };

  const toggleStatus = async (topic) => {
    const newStatus = topic.status === 'published' ? 'draft' : 'published';
    try {
      const res = await knowledgeService.updateTopic(topic.id, { status: newStatus });
      if (!res.error) {
        showToast(`Đã chuyển sang ${newStatus === 'published' ? 'Publish' : 'Draft'}`);
        loadData();
      }
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái', 'error');
    }
  };

  // Filtered Topics
  const filteredTopics = topics.filter(t => {
    if (toolFilter !== 'all' && t.tool !== toolFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search) {
      const lowerSearch = search.toLowerCase();
      if (!t.title.toLowerCase().includes(lowerSearch) && !t.id.toLowerCase().includes(lowerSearch)) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
          'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        } backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-right-4`}>
          <CheckCircle2 className="size-4" />
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="size-6 text-amber-500" />
            Knowledge Studio
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Quản lý các bài học lý thuyết, cú pháp và hướng dẫn công cụ
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/knowledge/new"
            className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 shadow-sm"
          >
            <Plus className="size-4" />
            Tạo Bài Học Mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên bài học, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Bộ lọc:</span>
        </div>

        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="all">Tất cả Công cụ</option>
          <option value="excel">Excel</option>
          <option value="sql">SQL</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="all">Tất cả Trạng thái</option>
          <option value="published">Đã Xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải dữ liệu...</div>
        ) : filteredTopics.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="grid size-12 place-items-center rounded-full bg-muted mb-4">
              <Book className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Không tìm thấy bài học nào</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Chưa có bài học nào khớp với bộ lọc hoặc hệ thống chưa có dữ liệu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Thứ tự</th>
                  <th className="px-4 py-3 font-medium">Bài học</th>
                  <th className="px-4 py-3 font-medium">Công cụ</th>
                  <th className="px-4 py-3 font-medium">Phân loại</th>
                  <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {topic.orderIndex || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{topic.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{topic.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {topic.tool === 'excel' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <FileSpreadsheet className="size-3.5" />
                          Excel
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                          <Database className="size-3.5" />
                          SQL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize text-muted-foreground">
                      {topic.category || 'Basic'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleStatus(topic)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          topic.status === 'published'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {topic.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/knowledge/${topic.id}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-amber-600 transition-colors rounded-md hover:bg-amber-500/10"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="size-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded-md hover:bg-red-500/10"
                          title="Xóa"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
