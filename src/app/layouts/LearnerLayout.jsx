import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { usePageStatus } from '../../hooks/usePageStatus.js';
import { UnderMaintenancePage } from '../../pages/learner/UnderMaintenancePage.jsx';
import { StreakDetailModal } from '../../features/gamification/StreakDetailModal.jsx';
import { LevelUpModal } from '../../features/gamification/LevelUpModal.jsx';
import { isAdmin } from '../../constants/roles.js';

import { LearnerSidebar, isLearnerNavPathActive, learnerNav, learnerNavItems } from '../../components/learner/navigation/LearnerSidebar.jsx';
import { LearnerTopBar } from '../../components/learner/navigation/LearnerTopBar.jsx';

// Re-export for compatibility with other files (like LearnerLayout.test.jsx)
export { learnerNavItems, learnerNav, isLearnerNavPathActive };

export function LearnerLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('avi_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const location = useLocation();
  const { user } = useAuth();
  const { getPageStatus, adminBypass, toggleAdminBypass } = usePageStatus();

  const [liveStats, setLiveStats] = useState({
    xp: user?.xp || 0,
    streak: user?.streak || 0,
    level: user?.level || 1,
  });

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    async function fetchStats() {
      try {
        const { progressService } = await import('../../services/index.js');
        const res = await progressService.getLearnerXp(user.id);
        if (res.data && isMounted) {
          setLiveStats({
            xp: typeof res.data.totalXp === 'number' ? res.data.totalXp : (user?.xp || 0),
            streak: res.data.streakSummary?.currentStreak ?? (user?.streak || 0),
            level: res.data.currentLevel ?? (user?.level || 1),
          });
        }
      } catch (e) {
        console.error('Failed to load layout learner stats:', e);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [user, location.pathname]);

  const currentPageStatus = getPageStatus(location.pathname);
  const isMaintenance = currentPageStatus?.status === 'maintenance';
  const isNotice = currentPageStatus?.status === 'notice';
  const isAdminUser = isAdmin(user?.role);
  const shouldBlockLearner = isMaintenance && (!isAdminUser || !adminBypass);

  useEffect(() => {
    localStorage.setItem('avi_sidebar_collapsed', collapsed ? 'true' : 'false');
  }, [collapsed]);

  const activeNavItem = learnerNav.find((item) => item.to === location.pathname);
  const pageTitle = activeNavItem ? activeNavItem.label : 'Nhiệm vụ & Báo cáo';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          aria-label="Đóng menu điều hướng"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <LearnerSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        liveStats={liveStats}
        setShowStreakModal={setShowStreakModal}
      />

      {/* ── Main Content Area ── */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Sticky Header */}
        <LearnerTopBar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          pageTitle={pageTitle}
        />

        {/* Banners Area */}
        {/* Admin Bypass Banner indicator */}
        {isMaintenance && isAdminUser && adminBypass && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-5 py-2.5 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="size-4 shrink-0" />
              <span>Chế độ Xem với quyền Admin: Trang này đang ở trạng thái BẢO TRÌ đối với Học viên thường.</span>
            </div>
            <button
              onClick={toggleAdminBypass}
              className="underline text-xs font-bold hover:text-foreground shrink-0"
            >
              Tắt xem trước
            </button>
          </div>
        )}

        {/* Learner Notice Banner */}
        {!shouldBlockLearner && isNotice && currentPageStatus?.noticeMessage && (
          <div className="bg-blue-500/10 border-b border-blue-500/20 px-5 py-2.5 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-2">
            <Info className="size-4 shrink-0" />
            <span><strong>Thông báo:</strong> {currentPageStatus.noticeMessage}</span>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6">
          {shouldBlockLearner ? (
            <UnderMaintenancePage pageConfig={currentPageStatus} />
          ) : (
            children
          )}
        </main>
      </div>

      {/* Gamification Modals */}
      <StreakDetailModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakCount={liveStats.streak || 1}
      />

      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        previousLevel={1}
        newLevel={2}
        newTitle="Nhà Điều Tra Cấp Cao"
        xpEarned={100}
      />
    </div>
  );
}
