import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, FileSpreadsheet, Database, Book } from 'lucide-react';
import { knowledgeService } from '../../services/index.js';

export function AdminKnowledgePage() {
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
    } catch {
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
    } catch {
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
    <div className="mx-auto max-w-7xl animate-fade-in space-y-7 pb-12">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-sm shadow-lg border font-mono text-xs font-bold ${
          toast.type === 'error' ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400' :
          'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
        } backdrop-blur-md flex items-center gap-2`}>
          <CheckCircle2 className="size-4" />
          <p>{toast.message}</p>
        </div>
      )}

      {/* Archival Masthead */}
      <div className="flex flex-col gap-4 border-b-2 border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
              FIELD MANUAL ARCHIVE // CODEX
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sổ tay nghiệp vụ
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <BookOpen className="size-7 text-primary" />
            Knowledge Studio
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Quản lý các bài học lý thuyết, cú pháp và hướng dẫn công cụ điều tra dữ liệu.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/knowledge/new"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-primary px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:opacity-90 shadow-sm"
          >
            <Plus className="size-4" />
            Tạo Bài Học Mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-md border border-border bg-card/80 p-3.5 shadow-2xs flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên bài học, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="flex items-center gap-1.5">
          <Filter className="size-3.5 text-primary" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Bộ lọc:</span>
        </div>

        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="px-3 py-2 rounded-sm border border-border bg-background font-mono text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="all">Tất cả Công cụ</option>
          <option value="excel">Excel</option>
          <option value="sql">SQL</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-sm border border-border bg-background font-mono text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="all">Tất cả Trạng thái</option>
          <option value="published">Đã Xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      {/* Field Manual Ledger Table */}
      <div className="dossier-card rounded-md border border-border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-muted-foreground animate-pulse">
            Đang tải dữ liệu...
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="grid size-12 place-items-center rounded-sm border border-border bg-muted mb-4">
              <Book className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Không tìm thấy bài học nào</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Chưa có bài học nào khớp với bộ lọc hoặc hệ thống chưa có dữ liệu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 border-b-2 border-border">
                <tr>
                  <th className="px-4 py-3.5">Thứ tự</th>
                  <th className="px-4 py-3.5">Bài học</th>
                  <th className="px-4 py-3.5">Công cụ</th>
                  <th className="px-4 py-3.5">Phân loại</th>
                  <th className="px-4 py-3.5 text-center">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTopics.map((topic, idx) => (
                  <tr key={topic.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-muted-foreground tabular-nums">
                      #{String(topic.orderIndex ?? idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-display font-bold text-base text-foreground">{topic.title}</div>
                      <div className="font-mono text-[11px] text-primary mt-0.5">{topic.id}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {topic.tool === 'excel' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase">
                          <FileSpreadsheet className="size-3" />
                          Excel
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs border border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-[10px] font-bold uppercase">
                          <Database className="size-3" />
                          SQL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs uppercase text-muted-foreground">
                      {topic.category || 'Basic'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleStatus(topic)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-xs border font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          topic.status === 'published'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-border bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {topic.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/knowledge/${topic.id}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-sm border border-transparent hover:border-border hover:bg-muted"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="size-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors rounded-sm border border-transparent hover:border-rose-500/40 hover:bg-rose-500/10 cursor-pointer"
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
