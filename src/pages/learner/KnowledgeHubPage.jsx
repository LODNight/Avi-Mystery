import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronRight, FileSpreadsheet, Database, Search, Menu, X, ArrowLeft, ArrowRight, Play, Sparkles } from 'lucide-react';
import { knowledgeService } from '../../services/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { KnowledgeViewer } from '../../components/knowledge/KnowledgeViewer.jsx';

export function KnowledgeHubPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [topics, setTopics] = useState([]);
  const [readTopics, setReadTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const userId = user?.uid || user?.id;

  // Lấy dữ liệu 1 lần khi load trang
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [topicsRes, readRes] = await Promise.all([
          knowledgeService.getPublishedTopics(),
          userId ? knowledgeService.getReadTopics(userId) : { data: [] }
        ]);
        
        if (!isMounted) return;
        if (topicsRes.data) {
          setTopics(topicsRes.data);
          // Nếu không có topicId trên URL nhưng có list topics, redirect tới topic đầu tiên
          if (!topicId && topicsRes.data.length > 0) {
            navigate(`/knowledge/${topicsRes.data[0].id}`, { replace: true });
          }
        }
        if (readRes.data) setReadTopics(readRes.data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu Knowledge:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [userId]);

  const filteredTopics = topics.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.tool && t.tool.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  const activeTopic = topics.find(t => t.id === topicId) || topics[0];

  const handleSelectTopic = (id) => {
    navigate(`/knowledge/${id}`);
    setIsMobileSidebarOpen(false);
  };

  const handleMarkAsRead = async () => {
    if (!userId || !activeTopic) return;
    try {
      await knowledgeService.markTopicAsRead(userId, activeTopic.id);
      if (!readTopics.includes(activeTopic.id)) {
        setReadTopics(prev => [...prev, activeTopic.id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const excelTopics = filteredTopics.filter(t => t.tool === 'excel');
  const sqlTopics = filteredTopics.filter(t => t.tool === 'sql');

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground animate-pulse flex flex-col items-center">
          <BookOpen className="size-10 mb-4 opacity-20" />
          <p>Đang tải thư viện kiến thức...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:static lg:w-72 lg:flex-shrink-0 lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-5 text-amber-500" />
            Thư Viện Kiến Thức
          </h2>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border/60">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm công thức, cú pháp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-8 pr-8 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20 placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-1.5 text-[11px] text-muted-foreground px-1">
              Tìm thấy <strong className="text-foreground">{filteredTopics.length}</strong> bài học
            </p>
          )}
        </div>
        
        {/* Topics List */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Excel Section */}
          {excelTopics.length > 0 && (
            <div className="mb-6">
              <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="size-3.5 text-emerald-500" />
                  Công thức Excel
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  {excelTopics.length}
                </span>
              </h3>
              <ul className="space-y-0.5">
                {excelTopics.map(topic => {
                  const isActive = topic.id === activeTopic?.id;
                  const isRead = readTopics.includes(topic.id);
                  return (
                    <li key={topic.id}>
                      <button
                        onClick={() => handleSelectTopic(topic.id)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                          isActive 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border-r-2 border-amber-500' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <span className="truncate pr-2">{topic.title}</span>
                        {isRead && <CheckCircle2 className="size-3.5 text-emerald-500 flex-shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* SQL Section */}
          {sqlTopics.length > 0 && (
            <div>
              <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="size-3.5 text-blue-500" />
                  Cú pháp SQL
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  {sqlTopics.length}
                </span>
              </h3>
              <ul className="space-y-0.5">
                {sqlTopics.map(topic => {
                  const isActive = topic.id === activeTopic?.id;
                  const isRead = readTopics.includes(topic.id);
                  return (
                    <li key={topic.id}>
                      <button
                        onClick={() => handleSelectTopic(topic.id)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                          isActive 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border-r-2 border-blue-500' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <span className="truncate pr-2">{topic.title}</span>
                        {isRead && <CheckCircle2 className="size-3.5 text-emerald-500 flex-shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {filteredTopics.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Không tìm thấy bài học nào phù hợp.
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted"
            title="Mở danh mục bài học"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-semibold truncate text-foreground">
            {activeTopic ? activeTopic.title : 'Thư viện kiến thức'}
          </span>
        </div>

        {/* Scrollable Article Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTopic ? (
            <div className="max-w-4xl mx-auto p-6 md:p-8 pb-24">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4">
                    <span className="capitalize">{activeTopic.tool}</span>
                    <ChevronRight className="size-3.5" />
                    <span className="capitalize">{activeTopic.category}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{activeTopic.title}</h1>
                </div>
                <Link
                  to={`/sandbox?tool=${activeTopic.tool}&topicId=${activeTopic.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
                >
                  <Sparkles className="size-4" />
                  <span>Thực hành Sandbox (Try it Yourself)</span>
                </Link>
              </div>

              <KnowledgeViewer markdown={activeTopic.contentMarkdown} />

              {/* ── Guided Progression / Up Next Card (Step 3: Không để người dùng vào ngõ cụt) ── */}
              {(() => {
                const currentIdx = filteredTopics.findIndex(t => t.id === activeTopic.id);
                const nextTopic = currentIdx >= 0 && currentIdx < filteredTopics.length - 1 ? filteredTopics[currentIdx + 1] : null;
                const prevTopic = currentIdx > 0 ? filteredTopics[currentIdx - 1] : null;

                return (
                  <div className="mt-14 rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                      <div>
                        <h3 className="font-bold text-foreground text-base">Hoàn thành bài đọc này?</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Đánh dấu đã hiểu để lưu tiến độ và chuẩn bị vận dụng vào các vụ án.
                        </p>
                      </div>
                      <button
                        onClick={handleMarkAsRead}
                        disabled={readTopics.includes(activeTopic.id)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                          readTopics.includes(activeTopic.id)
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
                            : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                        }`}
                      >
                        <CheckCircle2 className="size-4" />
                        <span>{readTopics.includes(activeTopic.id) ? 'Đã hiểu bài học này' : 'Đánh dấu đã hiểu'}</span>
                      </button>
                    </div>

                    {/* Next Steps: Sandbox or Related Mission */}
                    <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                      <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`/sandbox?tool=${activeTopic.tool}&topicId=${activeTopic.id}`}
                          className="flex-1 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 p-3.5 flex items-center justify-between gap-3 transition-colors group"
                        >
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Mô hình W3Schools
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                              Mở Sandbox thực hành ngay
                            </p>
                          </div>
                          <Sparkles className="size-4 text-amber-500 shrink-0" />
                        </Link>

                        {activeTopic.relatedMissions?.length > 0 && (
                          <div className="flex-1 rounded-2xl bg-muted/60 border border-border p-3.5 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                Vụ án cốt truyện
                              </span>
                              <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5 truncate max-w-[150px]">
                                {activeTopic.relatedMissions[0]}
                              </p>
                            </div>
                            <Link
                              to={`/missions/${activeTopic.relatedMissions[0]}/workspace`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors shrink-0"
                            >
                              <Play className="size-3 fill-current" />
                              <span>Phá án</span>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Previous / Next Lesson Navigation Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {prevTopic && (
                          <button
                            onClick={() => handleSelectTopic(prevTopic.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title={`Bài trước: ${prevTopic.title}`}
                          >
                            <ArrowLeft className="size-3.5" />
                            <span className="hidden sm:inline">Bài trước</span>
                          </button>
                        )}
                        {nextTopic && (
                          <button
                            onClick={() => handleSelectTopic(nextTopic.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                            title={`Bài tiếp: ${nextTopic.title}`}
                          >
                            <span>Bài tiếp theo</span>
                            <ArrowRight className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Chưa có nội dung bài học nào được xuất bản.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
