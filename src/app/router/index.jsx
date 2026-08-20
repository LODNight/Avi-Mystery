import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { isAdmin, isLearner } from '../../constants/roles.js';
import { LearnerLayout } from '../layouts/LearnerLayout.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { PageLoader, PageSkeleton } from '../../components/ui/Skeleton.jsx';

// Pages
import { LoginPage, RegisterPage } from '../../features/auth/LoginPage.jsx';
import { DashboardPage } from '../../pages/learner/DashboardPage.jsx';
import { CoursesPage } from '../../pages/learner/CoursesPage.jsx';
import { CourseDetailPage } from '../../pages/learner/CourseDetailPage.jsx';
import { LearningMapPage } from '../../pages/learner/LearningMapPage.jsx';
import { MissionIntroPage } from '../../pages/learner/MissionIntroPage.jsx';
import { ExcelMissionPage } from '../../pages/learner/ExcelMissionPage.jsx';
import { AdminOverviewPage } from '../../pages/admin/OverviewPage.jsx';
import { AdminPageStatusPage } from '../../pages/admin/PageStatusPage.jsx';
import { AdminSettingsPage } from '../../pages/admin/SettingsPage.jsx';
import { NotFoundPage } from '../../pages/NotFoundPage.jsx';



/* ─────────────────── Route Guards ─────────────────── */

/**
 * RequireAuth — chặn user chưa login, redirect về /login
 */
function RequireAuth({ children }) {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/**
 * RequireLearner — chỉ cho learner vào, admin redirect về /admin
 */
function RequireLearner() {
  const { user } = useAuth();
  if (isAdmin(user?.role)) return <Navigate to="/admin" replace />;
  return (
    <LearnerLayout>
      <Outlet />
    </LearnerLayout>
  );
}

/**
 * RequireAdmin — chỉ cho admin vào, learner redirect về /dashboard
 */
function RequireAdmin() {
  const { user } = useAuth();
  if (!isAdmin(user?.role)) return <Navigate to="/dashboard" replace />;
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

/**
 * RootRedirect — / → redirect theo role
 */
function RootRedirect() {
  const { isLoading, isAuthenticated, user } = useAuth();
  if (isLoading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin(user?.role)
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />;
}

/* ─────────────────── Router ─────────────────── */

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Learner routes */}
        <Route
          element={
            <RequireAuth>
              <RequireLearner />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<LearningMapPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/missions/:missionId" element={<MissionIntroPage />} />
          <Route path="/missions/:missionId/workspace" element={<ExcelMissionPage />} />
          <Route path="/practice" element={<PlaceholderPage title="Luyện tập" />} />
          <Route path="/achievements" element={<PlaceholderPage title="Thành tựu" />} />
          <Route path="/profile" element={<PlaceholderPage title="Hồ sơ" />} />
        </Route>

        {/* Admin routes */}
        <Route
          element={
            <RequireAuth>
              <RequireAdmin />
            </RequireAuth>
          }
        >
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/pages" element={<AdminPageStatusPage />} />
          <Route path="/admin/courses" element={<PlaceholderPage title="Quản lý khóa học" />} />
          <Route path="/admin/chapters" element={<PlaceholderPage title="Quản lý chương học" />} />
          <Route path="/admin/missions" element={<PlaceholderPage title="Quản lý nhiệm vụ" />} />
          <Route path="/admin/datasets" element={<PlaceholderPage title="Quản lý Dataset" />} />
          <Route path="/admin/learners" element={<PlaceholderPage title="Quản lý học viên" />} />
          <Route path="/admin/analytics" element={<PlaceholderPage title="Phân tích" />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ─── Placeholder cho các route đang phát triển ─── */
function PlaceholderPage({ title }) {
  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center shadow-sm">
        <div className="grid size-14 place-items-center rounded-2xl bg-amber-500/15 font-mono text-2xl text-amber-600 dark:text-amber-400 mb-3">
          🚧
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          Tính năng này đang được phát triển trong Sprint tiếp theo. Dưới đây là mô phỏng bố cục dự kiến của trang.
        </p>
      </div>

      {/* Skeleton Preview Grid */}
      <PageSkeleton />
    </div>
  );
}
