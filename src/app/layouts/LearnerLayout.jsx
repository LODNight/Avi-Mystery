import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Dumbbell,
  Trophy,
  User,
  LogOut,
  Zap,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { formatXP } from '../../utils/format.js';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/map',          label: 'Bản đồ học',   Icon: Map             },
  { to: '/courses',      label: 'Khóa học',     Icon: BookOpen        },
  { to: '/practice',    label: 'Luyện tập',     Icon: Dumbbell        },
  { to: '/achievements', label: 'Thành tựu',    Icon: Trophy          },
  { to: '/profile',      label: 'Hồ sơ',        Icon: User            },
];

export function LearnerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  // Avatar initials
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar flex-shrink-0" aria-label="Điều hướng chính">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">AviMystery</p>
            <p className="text-xs text-slate-400">DataQuest</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Menu">
          <ul className="space-y-0.5" role="list">
            {navItems.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
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
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-3">
          {/* XP + Streak */}
          {user && (
            <div className="flex items-center gap-3 px-1">
              <div className="flex items-center gap-1 text-amber-400">
                <Flame size={14} className="shrink-0" />
                <span className="text-xs font-semibold">{user.streak}</span>
              </div>
              <div className="flex items-center gap-1 text-primary-400">
                <Zap size={14} className="shrink-0" />
                <span className="text-xs font-semibold">{formatXP(user.xp)}</span>
              </div>
            </div>
          )}

          {/* Avatar row */}
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400">Lv.{user?.level}</p>
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

      {/* ── Main content ── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar" aria-label="Thanh điều hướng trên">
          <div className="flex-1" />
          {/* Streak badge */}
          {user && (
            <div
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5"
              title={`${user.streak} ngày liên tiếp`}
            >
              <Flame size={14} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">{user.streak} ngày</span>
            </div>
          )}
          {/* XP badge */}
          {user && (
            <div
              className="flex items-center gap-1.5 bg-primary-50 border border-primary-200 rounded-lg px-2.5 py-1.5"
              title={`${user.xp} / ${user.xpToNextLevel} XP đến level tiếp theo`}
            >
              <Zap size={14} className="text-primary-500" />
              <span className="text-xs font-semibold text-primary-700">{formatXP(user.xp)}</span>
            </div>
          )}
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
            aria-hidden="true"
          >
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="page-area" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
