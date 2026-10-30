import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FolderOpen,
  FileSpreadsheet,
  Database,
  Clock,
  Crosshair,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  RotateCcw,
  FileText,
  Mic,
  Table2,
  Search,
  Stamp,
  Paperclip,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.js';
import { caseContentService } from '../../services/caseContentService.js';
import { caseStateService, investigationStateService } from '../../services/investigationSessionService.js';

// Additional classified dossier previews so the Bureau Archive feels like a real multi-case cabinet
const ARCHIVE_UPCOMING_CASES = [
  {
    id: 'case-002',
    caseNumber: '#002',
    title: 'Hồ Sơ Bóng Ma Kho Lạnh',
    tool: 'sql',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    status: 'classified',
    summary:
      'Hệ thống cảm biến nhiệt độ tại Kho Lạnh Cảng Cát Lái bị vô hiệu hóa đúng 18 phút trong ca trực đêm. Truy vấn nhật ký thẻ từ và bảng phân ca SQL để lật mặt kẻ nội gián.',
    requiredClearance: 'Hoàn thành Vụ án #001',
  },
  {
    id: 'case-003',
    caseNumber: '#003',
    title: 'Giao Dịch Đêm Mất Tích',
    tool: 'excel',
    difficulty: 'advanced',
    estimatedMinutes: 35,
    status: 'classified',
    summary:
      '12 bút toán hoàn tiền ảo được chia nhỏ dưới ngưỡng kiểm duyệt tự động. Đối chiếu sổ cái ngân hàng và bảng kê chứng từ để truy tìm tài khoản thụ hưởng cuối cùng.',
    requiredClearance: 'Cấp độ Điều tra viên Cấp 2',
  },
];

const DIFFICULTY_META = {
  tutorial: { label: 'Nhập môn hiện trường', color: 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10' },
  beginner: { label: 'Cơ bản', color: 'text-sky-500 border-sky-500/40 bg-sky-500/10' },
  intermediate: { label: 'Trung cấp', color: 'text-amber-500 border-amber-500/40 bg-amber-500/10' },
  advanced: { label: 'Trọng án', color: 'text-rose-500 border-rose-500/40 bg-rose-500/10' },
};

const SOURCE_ICON = {
  table: Table2,
  sql_table: Database,
  document: FileText,
  statement: Mic,
};

/**
 * CaseInvestigationHubPage — Phòng Tiếp Nhận & Giao Ban Hồ Sơ Vụ Án
 *
 * Route: /cases and /cases/:caseId (Rendered inside LearnerLayout with Sidebar)
 * Prevents jumping straight into the FocusLayout workspace without reviewing the Case Briefing first.
 */
export function CaseInvestigationHubPage() {
  const { caseId: routeCaseId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id || 'user-001';

  const [toolFilter, setToolFilter] = useState('all'); // 'all' | 'excel' | 'sql'
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  // Load published cases from caseContentService
  const publishedCases = useMemo(() => {
    const res = caseContentService.listCases();
    return res.data || [];
  }, [i18n.language]);

  const [selectedCaseId, setSelectedCaseId] = useState(
    routeCaseId || publishedCases[0]?.id || 'case-001'
  );

  useEffect(() => {
    if (routeCaseId) {
      setSelectedCaseId(routeCaseId);
    }
  }, [routeCaseId]);

  // Load full details of the selected case
  const selectedCaseDetail = useMemo(() => {
    const res = caseContentService.getCase(selectedCaseId);
    return res.data || null;
  }, [selectedCaseId, i18n.language]);

  // Load user's live session progress for the selected case
  const selectedCaseState = useMemo(() => {
    if (!selectedCaseId) return null;
    return caseStateService.getState(selectedCaseId, userId);
  }, [selectedCaseId, userId, refreshTick]);

  const selectedInvestigationState = useMemo(() => {
    if (!selectedCaseId) return null;
    return investigationStateService.getState(selectedCaseId, userId);
  }, [selectedCaseId, userId, refreshTick]);

  // Combine published + classified archive cases for the left roster
  const allDossiers = useMemo(() => {
    const active = publishedCases.map((c) => {
      const fullRes = caseContentService.getCase(c.id);
      const st = caseStateService.getState(c.id, userId);
      const inv = investigationStateService.getState(c.id, userId);
      return {
        ...c,
        isPlayable: true,
        summary: fullRes.data?.briefing?.objective || '',
        phasesCount: fullRes.data?.phases?.length || 1,
        sourcesCount: fullRes.data?.sources?.length || 0,
        sessionStatus: st?.status || 'OPEN',
        currentPhaseId: st?.currentPhaseId || 'phase-1',
        completedPhasesCount: st?.completedPhaseIds?.length || 0,
        viewedSourcesCount: inv?.viewedSourceIds?.length || 0,
        findingsCount: inv?.findings?.length || 0,
      };
    });

    const classified = ARCHIVE_UPCOMING_CASES.map((c) => ({
      ...c,
      isPlayable: false,
      phasesCount: 3,
      sourcesCount: 4,
      sessionStatus: 'CLASSIFIED',
      completedPhasesCount: 0,
    }));

    return [...active, ...classified].filter((item) => {
      if (toolFilter !== 'all' && item.tool !== toolFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title?.toLowerCase().includes(q) ||
          item.caseNumber?.toLowerCase().includes(q) ||
          item.summary?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [publishedCases, userId, toolFilter, searchQuery, refreshTick, i18n.language]);

  const handleResetCaseProgress = () => {
    if (!selectedCaseId) return;
    localStorage.removeItem(`avi:case:${selectedCaseId}:${userId}:state`);
    localStorage.removeItem(`avi:investigation:${selectedCaseId}:${userId}`);
    localStorage.removeItem(`avi:report:${selectedCaseId}:phase-1:${userId}`);
    localStorage.removeItem(`avi:report:${selectedCaseId}:phase-2:${userId}`);
    localStorage.removeItem(`avi-cs-${selectedCaseId}-${userId}`);
    setRefreshTick((t) => t + 1);
  };

  const isStarted =
    selectedCaseState &&
    selectedCaseState.status !== 'OPEN' &&
    selectedCaseState.status !== 'CASE_CLOSED';
  const isSolved = selectedCaseState?.status === 'CASE_CLOSED';
  const currentPhaseNum = selectedCaseState?.currentPhaseId?.replace('phase-', '') || '1';
  const totalPhases = selectedCaseDetail?.phases?.length || 1;
  const diffMeta =
    DIFFICULTY_META[selectedCaseDetail?.difficulty] || DIFFICULTY_META.tutorial;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-fade-in pb-12">
      {/* ═══════════════════════════════════════════════════════════════════════
          [ZONE 0] BUREAU CASE DISPATCH MASTHEAD
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col justify-between gap-4 border-b-2 border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
              BUREAU CASE DISPATCH // SEC-02
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              // PHÒNG TIẾP NHẬN &amp; GIAO BAN HỒ SƠ VỤ ÁN
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Điều Tra Vụ Án Hiện Trường
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Chọn một hồ sơ vụ án trong tủ lưu trữ để đọc bản tóm tắt hiện trường, kiểm tra danh mục tang vật và chỉ thị điều tra trước khi bước vào bàn khám nghiệm.
          </p>
        </div>

        {/* Search & Tool Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã hoặc tên vụ án..."
              className="rounded-sm border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none w-48"
            />
          </div>
          <div className="inline-flex rounded-sm border border-border bg-card p-0.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'excel', label: 'Excel' },
              { id: 'sql', label: 'SQL' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setToolFilter(tab.id)}
                className={`px-2.5 py-1 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  toolFilter === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          [ZONE 1] ASYMMETRIC 12-COLUMN SPLIT: CASE ROSTER (5) | BRIEFING DESK (7)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT 5 COLS: TỦ HỒ SƠ VỤ ÁN (CASE ARCHIVE ROSTER) ──────────── */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-primary" />
              Danh sách hồ sơ ({allDossiers.length})
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Nhấp để xem tóm tắt vụ án
            </span>
          </div>

          {allDossiers.map((item) => {
            const isSelected = item.id === selectedCaseId;
            const isLocked = !item.isPlayable;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.isPlayable) {
                    setSelectedCaseId(item.id);
                  }
                }}
                className={`dossier-card rounded-md border p-4 transition-all relative overflow-hidden ${
                  isLocked
                    ? 'border-border/60 bg-card/50 opacity-75 cursor-not-allowed'
                    : isSelected
                    ? 'border-primary bg-card shadow-sm cursor-pointer ring-1 ring-primary/30'
                    : 'border-border bg-card/90 hover:border-primary/50 cursor-pointer'
                }`}
              >
                {/* Left Accent Strip */}
                <div
                  className={`absolute inset-y-0 left-0 w-1 ${
                    isLocked
                      ? 'bg-muted-foreground/30'
                      : item.sessionStatus === 'CASE_CLOSED'
                      ? 'bg-emerald-500'
                      : isSelected
                      ? 'bg-primary'
                      : 'bg-primary/40'
                  }`}
                />

                <div className="pl-2 flex flex-col gap-2.5">
                  {/* Top Row: Stamp + Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xs border border-primary/40 bg-primary/10 text-primary">
                        CASE {item.caseNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                        {item.tool === 'sql' ? (
                          <Database className="size-3 text-sky-500" />
                        ) : (
                          <FileSpreadsheet className="size-3 text-emerald-500" />
                        )}
                        {item.tool?.toUpperCase()}
                      </span>
                    </div>

                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-xs border border-border bg-muted text-muted-foreground">
                        <Lock className="size-2.5" />
                        Hồ sơ niêm phong
                      </span>
                    ) : item.sessionStatus === 'CASE_CLOSED' ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-xs border border-emerald-500/40 bg-emerald-500/15 text-emerald-500">
                        <CheckCircle2 className="size-2.5" />
                        Đã phá án
                      </span>
                    ) : item.sessionStatus !== 'OPEN' ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-xs border border-amber-500/40 bg-amber-500/15 text-amber-500">
                        Đang điều tra • GĐ {item.currentPhaseId?.replace('phase-', '')}/{item.phasesCount}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-xs border border-primary/40 bg-primary/10 text-primary">
                        Mới tiếp nhận
                      </span>
                    )}
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Bottom Telemetry Footer */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground">
                    {isLocked ? (
                      <span className="text-amber-500/90 font-semibold">
                        Yêu cầu: {item.requiredClearance}
                      </span>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {item.estimatedMinutes} phút
                          </span>
                          <span>•</span>
                          <span>{item.phasesCount} giai đoạn</span>
                          <span>•</span>
                          <span>{item.sourcesCount} tang vật</span>
                        </div>
                        <span className="text-primary font-bold inline-flex items-center gap-0.5">
                          Xem hồ sơ
                          <ChevronRight className="size-3" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT 7 COLS: BÀN GIAO BAN & CHI TIẾT HỒ SƠ VỤ ÁN (CASE BRIEFING) ── */}
        <div className="lg:col-span-7">
          {selectedCaseDetail ? (
            <div className=" flex flex-col">
              {/* Manila Folder Top Tab */}
              <div className="inline-flex items-center gap-2 rounded-t-md border-t border-x border-primary/50 bg-card px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary -mb-px relative z-10 ml-3 w-fit">
                <Paperclip className="size-3" />
                <span>HỒ SƠ GIAO NHIỆM VỤ // CASE {selectedCaseDetail.caseNumber}</span>
              </div>

              <div className="dossier-card corner-brackets rounded-md border border-primary/45 bg-card shadow-sm overflow-hidden">
                {/* 1. Dossier Header */}
                <div className="border-b border-border bg-muted/30 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
                        CASE {selectedCaseDetail.caseNumber}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs border ${diffMeta.color}`}
                      >
                        {diffMeta.label}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs border border-border bg-background text-foreground">
                        {selectedCaseDetail.tool === 'sql' ? (
                          <Database className="size-3 text-sky-500" />
                        ) : (
                          <FileSpreadsheet className="size-3 text-emerald-500" />
                        )}
                        Công cụ: {selectedCaseDetail.tool?.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                        <Clock className="size-3" />
                        ~{selectedCaseDetail.estimatedMinutes} phút
                      </span>
                    </div>

                    {isSolved ? (
                      <span className="detective-stamp text-emerald-500 border-emerald-500/60 bg-emerald-500/10">
                        CASE SOLVED // ĐÃ PHÁ ÁN
                      </span>
                    ) : isStarted ? (
                      <span className="detective-stamp text-amber-500 border-amber-500/60 bg-amber-500/10">
                        ĐANG THỤ LÝ // GĐ {currentPhaseNum}/{totalPhases}
                      </span>
                    ) : (
                      <span className="detective-stamp text-primary border-primary/60 bg-primary/10">
                        CHỜ KHÁM NGHIỆM
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {selectedCaseDetail.title}
                  </h2>

                  {/* Top Action CTA right in header for immediate access after reading */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/70">
                    <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                      <span>
                        Tiến độ:{' '}
                        <strong className="text-foreground">
                          Giai đoạn {currentPhaseNum}/{totalPhases}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Tang vật đã mở:{' '}
                        <strong className="text-foreground">
                          {selectedInvestigationState?.viewedSourceIds?.length || 0}/
                          {selectedCaseDetail.sources?.length || 0}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Manh mối:{' '}
                        <strong className="text-emerald-500">
                          {selectedInvestigationState?.findings?.length || 0}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {(isStarted || isSolved) && (
                        <button
                          type="button"
                          onClick={handleResetCaseProgress}
                          title="Đặt lại toàn bộ tiến độ vụ án này về ban đầu"
                          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background hover:bg-muted px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <RotateCcw className="size-3" />
                          <span>Làm lại từ đầu</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/cases/${selectedCaseDetail.id}/investigate`)}
                        className="inline-flex items-center gap-2 rounded-sm bg-primary hover:opacity-95 text-primary-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                      >
                        <span>
                          {isStarted
                            ? `Tiếp tục điều tra (Giai đoạn ${currentPhaseNum})`
                            : 'Bắt đầu khám nghiệm hiện trường'}
                        </span>
                        <ArrowUpRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Dossier Body Sections */}
                <div className="p-5 sm:p-6 flex flex-col gap-5">
                  {/* Primary Investigation Objective */}
                  <div className="rounded-sm border-l-4 border-primary bg-primary/10 p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Crosshair className="size-4 text-primary" />
                      <span className="font-mono text-[10px] font-black uppercase tracking-widest text-primary">
                        [CHỈ THỊ ĐIỀU TRA TRỌNG TÂM // PRIMARY OBJECTIVE]
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      {selectedCaseDetail.briefing?.objective}
                    </p>
                  </div>

                  {/* Case Narrative Briefing */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldAlert className="size-4 text-amber-500" />
                      <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        [BÁO CÁO HIỆN TRƯỜNG BAN ĐẦU // CASE BRIEFING]
                      </span>
                    </div>
                    <div className="rounded-sm border border-border bg-muted/20 p-4 text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                      {selectedCaseDetail.briefing?.narrative}
                    </div>
                  </div>

                  {/* Two-Column Breakdown: Investigation Phases & Evidence Locker */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                    {/* Investigation Phases */}
                    <div>
                      <div className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
                        <Stamp className="size-3.5 text-primary" />
                        <span>LỘ TRÌNH PHÁ ÁN ({selectedCaseDetail.phases?.length || 0} GIAI ĐOẠN)</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {(selectedCaseDetail.phases || []).map((phase, idx) => {
                          const unlockedIds = selectedCaseState?.unlockedPhaseIds || ['phase-1'];
                          const completedIds = selectedCaseState?.completedPhaseIds || [];
                          const isPhaseCompleted = completedIds.includes(phase.id);
                          const isPhaseUnlocked = unlockedIds.includes(phase.id);

                          return (
                            <div
                              key={phase.id}
                              className={`rounded-sm border p-3 ${
                                isPhaseCompleted
                                  ? 'border-emerald-500/40 bg-emerald-500/5'
                                  : isPhaseUnlocked
                                  ? 'border-primary/40 bg-primary/5'
                                  : 'border-border/70 bg-muted/20 opacity-65'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
                                  GIAI ĐOẠN 0{idx + 1}
                                </span>
                                {isPhaseCompleted ? (
                                  <span className="font-mono text-[9px] font-bold uppercase text-emerald-500 flex items-center gap-1">
                                    <CheckCircle2 className="size-3" /> Hoàn tất
                                  </span>
                                ) : isPhaseUnlocked ? (
                                  <span className="font-mono text-[9px] font-bold uppercase text-amber-500">
                                    Đang mở
                                  </span>
                                ) : (
                                  <span className="font-mono text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                    <Lock className="size-2.5" /> Chờ mở khóa
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-foreground">{phase.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                                {phase.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Evidence Exhibits Preview */}
                    <div>
                      <div className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
                        <FolderOpen className="size-3.5 text-primary" />
                        <span>DANH MỤC TANG VẬT ({selectedCaseDetail.sources?.length || 0} HỒ SƠ)</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {(selectedCaseDetail.sources || []).map((src, idx) => {
                          const Icon = SOURCE_ICON[src.type] || FileText;
                          const unlockedIds = selectedCaseState?.unlockedPhaseIds || ['phase-1'];
                          const isUnlocked = unlockedIds.includes(src.unlockedAtPhase);

                          return (
                            <div
                              key={src.id}
                              className={`rounded-sm border p-2.5 flex items-start gap-2.5 ${
                                isUnlocked
                                  ? 'border-border bg-background'
                                  : 'border-border/60 bg-muted/20 opacity-60'
                              }`}
                            >
                              <div className="grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-muted/50 text-primary mt-0.5">
                                {isUnlocked ? <Icon className="size-3.5" /> : <Lock className="size-3.5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-mono text-[9px] font-bold uppercase text-primary">
                                    [EXH-0{idx + 1}]
                                  </span>
                                  <span className="font-mono text-[9px] text-muted-foreground uppercase">
                                    {isUnlocked ? 'Sẵn sàng khám nghiệm' : `Mở ở ${src.unlockedAtPhase}`}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-foreground truncate">{src.title}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{src.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Warrant Footer CTA */}
                  <div className="mt-2 rounded-sm border border-dashed border-primary/50 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] font-black uppercase tracking-widest text-primary">
                        LỆNH KHÁM NGHIỆM HIỆN TRƯỜNG // WARRANT WRT-2026-{selectedCaseDetail.caseNumber?.replace('#', '')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Khi bấm vào nút bên phải, bạn sẽ tiến vào Bàn Khám Nghiệm Tập Trung (Focus Mode) với đầy đủ dữ liệu tang vật, bàn tính và kênh liên lạc HQ.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/cases/${selectedCaseDetail.id}/investigate`)}
                      className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-sm bg-primary hover:opacity-95 text-primary-foreground px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                    >
                      <span>Bắt Đầu Điều Tra Vụ Án</span>
                      <ArrowUpRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
