import React from 'react';
import { Database, Target, Layers, FileSpreadsheet, Terminal, Share } from 'lucide-react';

export function AdminGuidePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-7 animate-fade-in pb-12">
      <div className="border-b-2 border-border pb-5">
        <div className="flex items-center gap-2">
          <span className="detective-stamp text-primary border-primary/40 bg-primary/10">
            STANDARD OPERATING PROCEDURE // SOP-00
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Tài liệu vận hành Cục Điều Tra
          </span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Hướng dẫn Luồng hoạt động Admin
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sơ đồ và quy trình chuẩn hóa cách hệ thống quản lý hồ sơ vụ án (Content Studio) vận hành từ lúc khởi tạo tang vật đến khi công bố cho thám tử.
        </p>
      </div>

      {/* Sơ đồ luồng SOP Blueprint */}
      <div className="dossier-card corner-brackets rounded-md border border-border bg-card bg-forensic-grid p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
          <h2 className="font-display text-xl font-bold flex items-center gap-2 text-foreground">
            <Share className="size-5 text-primary" />
            Quy trình Tạo & Xuất bản Nội dung
          </h2>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            PIPELINE // 4 STAGES
          </span>
        </div>
        
        <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-4">
          <GuideStep 
            code="SOP-01"
            icon={Database}
            title="Quản lý Dataset"
            desc="Tạo bộ dữ liệu thô (nhập từ CSV) để tái sử dụng nhiều lần."
          />
          <Arrow />
          <GuideStep 
            code="SOP-02"
            icon={Target}
            title="Tạo Vụ án (Mission)"
            desc="Soạn thảo cốt truyện, kết nối Dataset và cấu hình chấm điểm."
          />
          <Arrow />
          <GuideStep 
            code="SOP-03"
            icon={Layers}
            title="Gom vào Chương"
            desc="Nhóm các vụ án vào các Chương (Chapter) theo chủ đề."
          />
          <Arrow />
          <GuideStep 
            code="SOP-04"
            icon={FileSpreadsheet}
            title="Gắn vào Khóa học"
            desc="Sắp xếp Chương vào Khóa học (Course) và Xuất bản."
          />
        </div>
      </div>

      {/* Chi tiết các bước */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard 
          code="STAGE 01"
          icon={Database}
          title="1. Dataset (Dữ liệu nền tảng)"
          items={[
            "Dataset là bộ dữ liệu độc lập (ví dụ: bảng Customers, Orders).",
            "Nên tạo Dataset trước khi tạo Vụ án.",
            "Một Dataset có thể được gắn cho nhiều Vụ án khác nhau để học viên thực hành.",
            "Bạn có thể import từ file CSV để hệ thống tự động sinh cấu trúc bảng (Schema)."
          ]}
        />
        
        <DetailCard 
          code="STAGE 02"
          icon={Target}
          title="2. Vụ án (Missions / Investigations)"
          items={[
            "Đây là nơi bạn soạn thảo nội dung chính: Bối cảnh vụ án, Mục tiêu.",
            "Chọn Dataset đã tạo để làm môi trường thực hành.",
            "Cấu hình Test Runner (Bộ chấm điểm): Nhập công thức Excel hoặc lệnh SQL đúng để hệ thống tự động chấm điểm cho học viên.",
            "Thiết lập các mức gợi ý (Hints) từ cơ bản đến chi tiết."
          ]}
        />

        <DetailCard 
          code="STAGE 03"
          icon={Layers}
          title="3. Chương (Chapters)"
          items={[
            "Chương là danh mục phân loại để gom nhóm các Vụ án.",
            "Ví dụ: Chương 'Hàm logic cơ bản', Chương 'Truy vấn JOIN đa bảng'.",
            "Bạn có thể sắp xếp thứ tự các Vụ án trong một Chương."
          ]}
        />

        <DetailCard 
          code="STAGE 04"
          icon={FileSpreadsheet}
          title="4. Khóa học (Courses) & Xuất bản"
          items={[
            "Khóa học là cấp độ cao nhất (Ví dụ: 'Thám tử Excel', 'Chuyên gia SQL').",
            "Bạn sắp xếp các Chương vào Khóa học tương ứng.",
            "Quan trọng: Sau khi chuẩn bị xong, bạn phải bấm 'Xuất bản & Sync Map' để hệ thống đồng bộ dữ liệu ra màn hình Bản đồ của Học viên (Read Model)."
          ]}
        />
      </div>

      <div className="dossier-card rounded-md border border-primary/40 bg-primary/5 p-5">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
          <Terminal className="size-4" /> Sandbox - Công cụ thử nghiệm an toàn
        </h3>
        <p className="text-sm text-foreground/85 leading-relaxed">
          Trong quá trình tạo Vụ án, bạn có thể dùng công cụ <strong>Test Runner Sandbox</strong> trên thanh tiêu đề để thử nghiệm trực tiếp công thức Excel hoặc truy vấn SQL.
          Môi trường Sandbox này được cách ly hoàn toàn (`ISOLATED`), không lưu XP và không ảnh hưởng đến dữ liệu thực của hệ thống.
        </p>
      </div>
    </div>
  );
}

function GuideStep({ code, icon: Icon, title, desc }) {
  return (
    <div className="relative flex-1 flex flex-col items-start text-left p-4 rounded-sm border border-border bg-background/90 z-10">
      <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-dashed border-border">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded-xs">
          {code}
        </span>
        <Icon className="size-4 text-primary" />
      </div>
      <h3 className="font-display font-bold text-base text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center justify-center -mx-2 z-0 text-primary/50">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </div>
  );
}

function DetailCard({ code, icon: Icon, title, items }) {
  return (
    <div className="dossier-card rounded-md border border-border bg-card p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3.5">
        <h3 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
          <Icon className="size-4.5 text-primary" />
          {title}
        </h3>
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          [{code}]
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2.5 text-xs text-muted-foreground">
            <span className="font-mono text-primary font-bold mt-0.5">0{idx + 1}.</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
