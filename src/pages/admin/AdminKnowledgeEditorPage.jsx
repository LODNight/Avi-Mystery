import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Edit3, CheckCircle2, AlertCircle, Search, X } from 'lucide-react';
import { knowledgeService, adminContentService } from '../../services/index.js';
import { KnowledgeViewer } from '../../components/knowledge/KnowledgeViewer.jsx';

export function AdminKnowledgeEditorPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(topicId) && topicId !== 'new';

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [toast, setToast] = useState(null);

  // Danh sách missions từ adminContentService
  const [allMissions, setAllMissions] = useState([]);
  const [missionSearch, setMissionSearch] = useState('');
  const [missionFilterTool, setMissionFilterTool] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [formData, setFormData] = useState({
    title: '',
    tool: 'excel',
    category: 'basic',
    orderIndex: 0,
    status: 'draft',
    relatedMissions: [], // Array of mission IDs
    contentMarkdown: '## Tiêu đề bài học\n\nViết nội dung Markdown tại đây...'
  });

  useEffect(() => {
    async function loadMissions() {
      try {
        const res = await adminContentService.getMissions();
        if (res.data) {
          setAllMissions(res.data);
        }
      } catch (err) {
        console.error('Lỗi tải missions:', err);
      }
    }
    loadMissions();

    if (isEdit) {
      loadTopic();
    }
  }, [isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTopic = async () => {
    try {
      const res = await knowledgeService.getTopicById(topicId);
      if (res.data) {
        setFormData({
          ...res.data,
          relatedMissions: Array.isArray(res.data.relatedMissions) ? res.data.relatedMissions : []
        });
      } else {
        showToast('Không tìm thấy bài học', 'error');
        setTimeout(() => navigate('/admin/knowledge'), 1500);
      }
    } catch (err) {
      showToast('Lỗi khi tải dữ liệu: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMission = (missionId) => {
    setFormData(prev => {
      const current = prev.relatedMissions || [];
      if (current.includes(missionId)) {
        return { ...prev, relatedMissions: current.filter(id => id !== missionId) };
      } else {
        return { ...prev, relatedMissions: [...current, missionId] };
      }
    });
  };

  const removeMission = (missionId) => {
    setFormData(prev => ({
      ...prev,
      relatedMissions: (prev.relatedMissions || []).filter(id => id !== missionId)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.contentMarkdown.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        orderIndex: Number(formData.orderIndex),
        relatedMissions: formData.relatedMissions || []
      };

      let res;
      if (isEdit) {
        res = await knowledgeService.updateTopic(topicId, payload);
      } else {
        res = await knowledgeService.createTopic(payload);
      }

      if (!res.error) {
        showToast('Lưu bài học thành công');
        if (!isEdit) {
          navigate('/admin/knowledge');
        }
      } else {
        showToast('Lỗi khi lưu: ' + res.error.message, 'error');
      }
    } catch {
      showToast('Lỗi hệ thống', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center font-mono text-xs text-muted-foreground animate-pulse">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6 pb-20">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-sm shadow-lg border font-mono text-xs font-bold ${
          toast.type === 'error' ? 'bg-rose-500/15 border-rose-500/40 text-rose-600' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600'
        } backdrop-blur-md flex items-center gap-2`}>
          {toast.type === 'error' ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
          <p>{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sticky top-0 z-10 bg-background/90 backdrop-blur-md pb-4 pt-2 border-b-2 border-border">
        <div className="flex items-center gap-3.5">
          <Link
            to="/admin/knowledge"
            className="p-2 rounded-sm border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
              FIELD MANUAL EDITOR
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mt-1">
              {isEdit ? 'Chỉnh Sửa Bài Học' : 'Tạo Bài Học Mới'}
            </h1>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors cursor-pointer"
          >
            {isPreview ? (
              <><Edit3 className="size-3.5" /> Chế độ Soạn thảo</>
            ) : (
              <><Eye className="size-3.5" /> Xem trước Nội dung</>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="size-3.5" />
            {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="dossier-card corner-brackets rounded-md border border-border bg-card p-5 space-y-4 shadow-2xs">
            <h3 className="font-display text-base font-bold text-foreground border-b border-border pb-2.5">
              Thông tin cơ bản
            </h3>
            
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                Tiêu đề bài học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none"
                placeholder="Ví dụ: Hàm SUM, Lệnh SELECT..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Công cụ
                </label>
                <select
                  name="tool"
                  value={formData.tool}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="excel">Excel</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Phân loại
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="basic">Cơ bản (Basic)</option>
                  <option value="intermediate">Trung bình (Inter)</option>
                  <option value="advanced">Nâng cao (Adv)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="draft">Bản nháp (Draft)</option>
                  <option value="published">Xuất bản (Publish)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Thứ tự (Sort)
                </label>
                <input
                  type="number"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-sm focus:border-primary outline-none tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Nhiệm vụ liên quan
                  {formData.relatedMissions?.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-xs text-[10px] bg-primary/15 text-primary border border-primary/30 font-mono font-bold">
                      {formData.relatedMissions.length}
                    </span>
                  )}
                </label>
              </div>

              {/* Selected Mission Chips */}
              {formData.relatedMissions?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-sm bg-muted/40 border border-dashed border-border max-h-24 overflow-y-auto">
                  {formData.relatedMissions.map(mId => {
                    const found = allMissions.find(m => m.id === mId);
                    return (
                      <span
                        key={mId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-xs font-medium bg-background border border-border text-foreground"
                      >
                        <span className="font-mono text-primary text-[11px] font-bold">{mId}</span>
                        {found && <span className="truncate max-w-[120px] text-muted-foreground">{found.title}</span>}
                        <button
                          type="button"
                          onClick={() => removeMission(mId)}
                          className="text-muted-foreground hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Chưa gắn bài học này với nhiệm vụ nào.</p>
              )}

              {/* Mission Search & Filter */}
              <div className="space-y-2 pt-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm nhiệm vụ theo tên hoặc ID..."
                    value={missionSearch}
                    onChange={(e) => setMissionSearch(e.target.value)}
                    className="w-full rounded-sm border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:border-primary outline-none"
                  />
                  {missionSearch && (
                    <button
                      type="button"
                      onClick={() => setMissionSearch('')}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <div className="flex gap-1">
                  {['all', 'excel', 'sql'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMissionFilterTool(t)}
                      className={`px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        missionFilterTool === t
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t === 'all' ? 'Tất cả' : t.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Mission Options List */}
                <div className="rounded-sm border border-border bg-background divide-y divide-border/40 max-h-48 overflow-y-auto">
                  {allMissions
                    .filter(m => {
                      if (missionFilterTool !== 'all' && m.tool !== missionFilterTool) return false;
                      if (!missionSearch) return true;
                      const q = missionSearch.toLowerCase();
                      return m.id.toLowerCase().includes(q) || (m.title && m.title.toLowerCase().includes(q));
                    })
                    .map(m => {
                      const isChecked = formData.relatedMissions?.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMission(m.id)}
                          className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer select-none transition-colors ${
                            isChecked ? 'bg-primary/10 font-medium' : 'hover:bg-muted/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="size-3.5 rounded-xs text-primary focus:ring-primary border-border"
                          />
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="font-mono text-[11px] font-bold text-primary">{m.id}</span>
                            <span className="truncate text-foreground">{m.title}</span>
                          </div>
                          <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-xs bg-muted text-muted-foreground">
                            {m.tool}
                          </span>
                        </div>
                      );
                    })}
                  {allMissions.length === 0 && (
                    <div className="p-3 text-center font-mono text-xs text-muted-foreground">
                      Không có nhiệm vụ nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Markdown Content */}
        <div className="lg:col-span-2">
          <div className="dossier-card rounded-md border border-border bg-card shadow-2xs h-[600px] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40 flex justify-between items-center">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                {isPreview ? 'Nội Dung (Xem Trước)' : 'Soạn thảo Nội Dung (Markdown)'}
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground">UTF-8 // MARKDOWN</span>
            </div>
            
            <div className="flex-1 overflow-hidden p-0 relative bg-background">
              {isPreview ? (
                <div className="absolute inset-0 overflow-y-auto p-6 bg-background">
                  <KnowledgeViewer markdown={formData.contentMarkdown} />
                </div>
              ) : (
                <textarea
                  name="contentMarkdown"
                  value={formData.contentMarkdown}
                  onChange={handleChange}
                  className="w-full h-full p-6 resize-none bg-background text-foreground text-sm font-mono border-0 outline-none"
                  placeholder="## Giới thiệu..."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
