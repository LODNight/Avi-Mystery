import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Target,
  Database,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const navItems = [
  { to: '/admin',          label: 'Tổng quan',   Icon: LayoutDashboard, end: true },
  { to: '/admin/courses',  label: 'Khóa học',    Icon: BookOpen         },
  { to: '/admin/chapters', label: 'Chương học',  Icon: Layers           },
  { to: '/admin/missions', label: 'Nhiệm vụ',    Icon: Target           },
  { to: '/admin/datasets', label: 'Dataset',     Icon: Database         },
  { to: '/admin/learners', label: 'Học viên',    Icon: Users            },
  { to: '/admin/analytics',label: 'Phân tích',   Icon: BarChart3        },
  { to: '/admin/settings', label: 'Cài đặt',     Icon: Settings         },
];

export function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="app-shell">
      {/* ── Admin Sidebar ── */}
      <aside
        className="sidebar flex-shrink-0"
        style={{ background: '#0f172a' }}
        aria-label="Admin navigation"
      >
        {/* Logo + Admin indicator */}
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-secondary-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight">AviMystery</p>
              <p className="text-xs text-secondary-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Admin menu">
          <ul className="space-y-0.5" role="list">
            {navItems.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={16} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Preview as Learner */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <a
              href="/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-nav-item"
            >
              <ExternalLink size={15} className="shrink-0" />
              <span className="truncate text-xs">Xem Learner App</span>
            </a>
          </div>
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-8 h-8 rounded-full bg-secondary-600 flex items-center justify-center text-white text-xs font-bold shrink-0"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Đăng xuất"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        {/* Admin Topbar */}
        <header
          className="topbar border-b border-slate-200"
          aria-label="Admin topbar"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary-50 text-secondary-700 border border-secondary-200 rounded-md px-2 py-1">
              <Shield size={11} />
              Admin App
            </span>
          </div>
          <div className="flex-1" />
          <div
            className="w-8 h-8 rounded-full bg-secondary-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
            aria-hidden="true"
          >
            {initials}
          </div>
        </header>

        <main className="page-area" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
