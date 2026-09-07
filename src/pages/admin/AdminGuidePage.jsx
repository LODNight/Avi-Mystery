import React from 'react';
import { BookOpen, Database, Target, Layers, FileSpreadsheet, Play, Share } from 'lucide-react';

export function AdminGuidePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Hướng dẫn Luồng hoạt động Admin</h1>
        <p className="mt-2 text-muted-foreground">
          Sơ đồ và giải thích chi tiết cách hệ thống quản lý nội dung (Content Studio) hoạt động từ lúc tạo dữ liệu đến khi xuất bản cho học viên.
        </p>
      </div>

      {/* Sơ đồ luồng */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Share className="size-5 text-primary" />
          Quy trình Tạo & Xuất bản Nội dung
        </h2>
        
        <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-4">
          <GuideStep 
            step="1"
            icon={Database}
            title="Quản lý Dataset"
            desc="Tạo bộ dữ liệu thô (nhập từ CSV) để tái sử dụng nhiều lần."
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <Arrow />
          <GuideStep 
            step="2"
            icon={Target}
            title="Tạo Vụ án (Mission)"
            desc="Soạn thảo cốt truyện, kết nối Dataset và cấu hình chấm điểm."
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <Arrow />
          <GuideStep 
            step="3"
            icon={Layers}
            title="Gom vào Chương"
            desc="Nhóm các vụ án vào các Chương (Chapter) theo chủ đề."
            color="text-amber-500"
            bg="bg-amber-500/10"
          />
          <Arrow />
          <GuideStep 
            step="4"
            icon={FileSpreadsheet}
            title="Gắn vào Khóa học"
            desc="Sắp xếp Chương vào Khóa học (Course) và Xuất bản."
            color="text-purple-500"
            bg="bg-purple-500/10"
          />
        </div>
      </div>

      {/* Chi tiết các bước */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard 
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
          icon={Layers}
          title="3. Chương (Chapters)"
          items={[
            "Chương là danh mục phân loại để gom nhóm các Vụ án.",
            "Ví dụ: Chương 'Hàm logic cơ bản', Chương 'Truy vấn JOIN đa bảng'.",
            "Bạn có thể sắp xếp thứ tự các Vụ án trong một Chương."
          ]}
        />

        <DetailCard 
          icon={FileSpreadsheet}
          title="4. Khóa học (Courses) & Xuất bản"
          items={[
            "Khóa học là cấp độ cao nhất (Ví dụ: 'Thám tử Excel', 'Chuyên gia SQL').",
            "Bạn sắp xếp các Chương vào Khóa học tương ứng.",
            "Quan trọng: Sau khi chuẩn bị xong, bạn phải bấm 'Cập nhật Learning Map' để hệ thống đồng bộ dữ liệu ra màn hình Bản đồ của Học viên (Read Model)."
          ]}
        />
      </div>

      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
        <h3 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
          <Play className="size-4" /> Sandbox - Công cụ thử nghiệm an toàn
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Trong quá trình tạo Vụ án, bạn có thể dùng công cụ <strong>Test Runner Sandbox</strong> (biểu tượng 🧪 trên thanh tiêu đề) để thử nghiệm trực tiếp công thức Excel hoặc truy vấn SQL.
          Môi trường Sandbox này được cách ly hoàn toàn, không lưu XP và không ảnh hưởng đến dữ liệu thực của hệ thống.
        </p>
      </div>
    </div>
  );
}

function GuideStep({ step, icon: Icon, title, desc, color, bg }) {
  return (
    <div className="relative flex-1 flex flex-col items-center text-center p-4 rounded-xl border border-border/50 bg-background/50 z-10">
      <div className={`absolute -top-3 -left-3 size-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-md`}>
        {step}
      </div>
      <div className={`size-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4`}>
        <Icon className="size-7" />
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center justify-center -mx-4 z-0 text-muted-foreground/30">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </div>
  );
}

function DetailCard({ icon: Icon, title, items }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Icon className="size-5 text-primary" />
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
