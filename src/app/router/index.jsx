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
import { PageLoader } from '../../components/ui/Skeleton.jsx';

// Pages (lazy không cần thiết cho MVP)
import { LoginPage, RegisterPage } from '../../features/auth/LoginPage.jsx';
import { DashboardPage } from '../../pages/learner/DashboardPage.jsx';
import { AdminOverviewPage } from '../../pages/admin/OverviewPage.jsx';
import { NotFoundPage } from '../../pages/NotFoundPage.jsx';

/* ─────────────────── Route Guards ─────────────────── */

/**
 * RequireAuth — chặn user chưa login, redirect về /login
 */
function RequireAuth({ children }) {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <PageLoader />;
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
  if (isLoading) return <PageLoader />;
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
          {/* Placeholder routes — sẽ implement ở sprint tiếp theo */}
          <Route path="/map" element={<PlaceholderPage title="Bản đồ học tập" />} />
          <Route path="/courses" element={<PlaceholderPage title="Khóa học" />} />
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
          <Route path="/admin/courses" element={<PlaceholderPage title="Quản lý khóa học" />} />
          <Route path="/admin/chapters" element={<PlaceholderPage title="Quản lý chương học" />} />
          <Route path="/admin/missions" element={<PlaceholderPage title="Quản lý nhiệm vụ" />} />
          <Route path="/admin/datasets" element={<PlaceholderPage title="Quản lý Dataset" />} />
          <Route path="/admin/learners" element={<PlaceholderPage title="Quản lý học viên" />} />
          <Route path="/admin/analytics" element={<PlaceholderPage title="Phân tích" />} />
          <Route path="/admin/settings" element={<PlaceholderPage title="Cài đặt" />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ─── Placeholder tạm cho các route chưa implement ─── */
function PlaceholderPage({ title }) {
  return (
    <div className="page-container">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500">Trang này đang được phát triển trong sprint tiếp theo.</p>
      </div>
    </div>
  );
}
