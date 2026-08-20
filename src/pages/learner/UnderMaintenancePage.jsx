import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Clock,
  Home,
  RotateCw,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { usePageStatus } from '../../hooks/usePageStatus.js';

export function UnderMaintenancePage({ pageConfig, onBypass }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { adminBypass, toggleAdminBypass } = usePageStatus();

  const title = pageConfig?.maintenanceTitle || 'Trang đang trong quá trình bảo trì';
  const message =
    pageConfig?.maintenanceMessage ||
    'Hệ thống đang tiến hành nâng cấp hạ tầng và dữ liệu để mang lại trải nghiệm tốt nhất cho các nhà điều tra. Vui lòng quay lại sau.';
  const estimatedTime = pageConfig?.estimatedTime || 'Dự kiến hoàn tất trong ít phút';
  const pageName = pageConfig?.name || 'Trang này';

  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-12 px-4 animate-fade-in">
      {/* Decorative Container */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-card via-card/95 to-amber-950/10 p-6 sm:p-12 text-center shadow-xl shadow-amber-950/5 dark:shadow-amber-500/5">
        {/* Background glow & mesh grid effect */}
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-amber-500/15 blur-3xl" />

        {/* Badge Header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 mb-6">
          <Wrench className="size-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>BẢO TRÌ NỘI DUNG · {pageName.toUpperCase()}</span>
        </div>

        {/* Main Animated Icon */}
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-inner">
          <ShieldAlert className="size-12 animate-pulse" />
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">
          {title}
        </h2>
        <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
          {message}
        </p>

        {/* Estimated Completion Time Box */}
        {estimatedTime && (
          <div className="mx-auto mt-6 inline-flex max-w-md items-center gap-3 rounded-2xl border border-border bg-muted/60 px-5 py-3 text-left shadow-sm">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Thời gian dự kiến khôi phục
              </p>
              <p className="text-sm font-semibold text-foreground">{estimatedTime}</p>
            </div>
          </div>
        )}

        {/* Admin Bypass Warning Box (If current user is admin) */}
        {user?.role === 'admin' && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-left">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 shrink-0 text-amber-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Chế độ Quản trị viên (Admin Mode)
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bạn có thể tạm thời bỏ qua trang bảo trì này để kiểm tra dữ liệu phía Learner.
                </p>
                <button
                  onClick={() => {
                    if (onBypass) onBypass();
                    else toggleAdminBypass();
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="size-3.5" />
                  {adminBypass ? 'Tắt bỏ qua bảo trì' : 'Xem trang với quyền Admin'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-all"
          >
            <Home className="size-4" />
            Về Trang tổng quan
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all shadow-sm"
          >
            <RotateCw className="size-4" />
            Thử tải lại
          </button>
        </div>

        {/* Footnote */}
        <p className="mt-8 font-mono text-xs text-muted-foreground">
          Cần hỗ trợ gấp? Vui lòng liên hệ Admin qua kênh hỗ trợ kĩ thuật Avi-Mystery.
        </p>
      </div>
    </div>
  );
}
