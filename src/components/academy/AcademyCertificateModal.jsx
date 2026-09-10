import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  X,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  Database,
  Calendar,
  Share2,
} from 'lucide-react';

export function AcademyCertificateModal({ isOpen, onClose, certificate }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopyCode = () => {
    if (certificate.certificateId) {
      navigator.clipboard.writeText(certificate.certificateId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('vi-VN');

  const isExcel = certificate.tool === 'excel' || certificate.courseSlug?.includes('excel');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="relative w-full max-w-3xl my-8 bg-card border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:m-0 print:max-w-none print:rounded-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-muted/40 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Sparkles className="size-4" />
            <span>Chứng Chỉ Số Chính Thức — Avi-Mystery Academy</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              title="In hoặc Lưu thành PDF"
            >
              <Printer className="size-3.5" />
              <span className="hidden sm:inline">In / Lưu PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
              title="Sao chép Mã định danh"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép mã'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* ── CERTIFICATE BODY (PRINT AREA) ── */}
        <div className="relative p-6 sm:p-10 bg-gradient-to-b from-amber-500/5 via-card to-background text-card-foreground">
          
          {/* Ornate Border Frame */}
          <div className="border-2 border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden bg-radial from-amber-500/5 to-transparent print:border-amber-700">
            
            {/* Corner Ornamental Accents */}
            <div className="absolute top-2 left-2 size-6 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm print:border-amber-700" />
            <div className="absolute top-2 right-2 size-6 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm print:border-amber-700" />
            <div className="absolute bottom-2 left-2 size-6 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm print:border-amber-700" />
            <div className="absolute bottom-2 right-2 size-6 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm print:border-amber-700" />

            {/* Academy Crest / Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-3 shadow-inner">
                {isExcel ? <FileSpreadsheet className="size-7" /> : <Database className="size-7" />}
              </div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground font-bold">
                AVI-MYSTERY DATA ACADEMY • HỌC VIỆN DỮ LIỆU THỰC CHIẾN
              </div>
              <h1 className="text-xl sm:text-3xl font-serif font-black tracking-wide text-foreground uppercase mt-2">
                Chứng Nhận Tốt Nghiệp
              </h1>
              <div className="text-xs font-serif italic text-amber-600 dark:text-amber-400 mt-1">
                Certificate of Academic & Practical Excellence
              </div>
            </div>

            {/* Recipient */}
            <div className="text-center my-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Chứng chỉ này trân trọng được trao cho Thám tử Dữ liệu
              </p>
              <div className="text-2xl sm:text-4xl font-extrabold text-amber-500 dark:text-amber-400 font-serif tracking-wide my-2">
                {certificate.learnerName || 'Thám Tử Dữ Liệu'}
              </div>
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto" />
            </div>

            {/* Narrative & Course */}
            <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                Đã hoàn thành xuất sắc chương trình đào tạo và vượt qua kỳ thi sát hạch lý thuyết & thực hành chuyên sâu của khóa học:
              </p>
              <div className="text-base sm:text-lg font-bold text-foreground bg-amber-500/10 border border-amber-500/20 py-2 px-4 rounded-xl inline-block shadow-xs">
                {certificate.courseTitle}
              </div>
            </div>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8 p-3 rounded-xl bg-muted/40 border border-border text-center">
              <div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Điểm số</div>
                <div className="text-base sm:text-lg font-black text-emerald-500 font-mono">
                  {certificate.scorePercent}%
                </div>
              </div>
              <div className="border-x border-border">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Xếp loại</div>
                <div className="text-xs sm:text-sm font-bold text-amber-500 truncate px-1">
                  {certificate.grade || 'Đạt Chuẩn'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Ngày cấp</div>
                <div className="text-xs sm:text-sm font-medium text-foreground font-mono">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Seal & Signatures */}
            <div className="flex items-center justify-between pt-6 border-t border-border/80 px-2 sm:px-6">
              {/* Official Seal Badge */}
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full border-2 border-dashed border-amber-500/60 flex items-center justify-center text-amber-500 bg-amber-500/5">
                  <ShieldCheck className="size-6" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> CHỨNG CHỈ HỢP LỆ
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    ID: {certificate.certificateId}
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="text-center">
                <div className="font-serif italic text-sm text-foreground/80 font-semibold mb-1">
                  Avi-Mystery Council
                </div>
                <div className="w-24 h-px bg-foreground/40 mx-auto mb-1" />
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Hội Đồng Giám Khảo
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info (Hidden on print) */}
        <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground print:hidden">
          <div className="flex items-center gap-1.5">
            <Award className="size-4 text-amber-500" />
            <span>Chứng chỉ này được bảo lưu vĩnh viễn trên Hồ sơ Thám tử của bạn.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
}
