import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { progressService } from '../../services/index.js';
import { Trophy, Lock, Search, Target, FileSpreadsheet, Database, Flame, Award, Shield } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

export function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const res = await progressService.getLearnerAchievements(user.id);
        if (res.data) {
          setAchievements(res.data);
        }
      } catch (error) {
        console.error('Failed to load achievements', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const renderIcon = (iconName, className) => {
    switch (iconName) {
      case 'target': return <Target className={className} />;
      case 'file-spreadsheet': return <FileSpreadsheet className={className} />;
      case 'database': return <Database className={className} />;
      case 'database-zap': return <Database className={className} />; // Or another icon
      case 'flame': return <Flame className={className} />;
      case 'star': return <Award className={className} />;
      case 'award': return <Shield className={className} />;
      default: return <Trophy className={className} />;
    }
  };

  const getRarityColor = (rarity, isUnlocked) => {
    if (!isUnlocked) return 'bg-muted/50 text-muted-foreground border-border grayscale';
    switch (rarity) {
      case 'legendary': return 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-amber-500/20';
      case 'epic': return 'bg-purple-500/10 border-purple-500/30 text-purple-500 shadow-purple-500/20';
      case 'rare': return 'bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-blue-500/20';
      default: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-emerald-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in mx-auto max-w-5xl">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in mx-auto max-w-5xl pb-12">
      
      {/* ── Header ── */}
      <div className="relative rounded-3xl bg-card border border-border shadow-sm overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Trophy className="size-32" />
        </div>
        
        <div className="relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
            <Trophy className="size-3" /> Bộ sưu tập
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Danh hiệu Thám tử
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Mở khóa các danh hiệu đặc biệt bằng cách vượt qua các vụ án hóc búa, duy trì chuỗi học tập và nâng cao kỹ năng phân tích dữ liệu của bạn.
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center bg-background rounded-2xl border border-border p-4 min-w-[160px] shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Tiến trình</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground">{unlockedCount}</span>
            <span className="text-sm font-bold text-muted-foreground">/ {totalCount}</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-amber-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-muted/50 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'all' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'unlocked' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Đã mở khóa
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'locked' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Chưa đạt
          </button>
        </div>
      </div>

      {/* ── Badges Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredAchievements.map(badge => {
          const colorClass = getRarityColor(badge.rarity, badge.isUnlocked);
          
          return (
            <div 
              key={badge.id}
              className={`group relative flex flex-col items-center text-center rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${!badge.isUnlocked ? 'opacity-80' : ''}`}
            >
              {/* Rarity Label */}
              <div className="absolute top-4 right-4">
                <span className={`text-[9px] font-black uppercase tracking-wider ${badge.isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {badge.rarity}
                </span>
              </div>

              {/* Icon Container */}
              <div className={`mt-4 mb-5 grid size-20 place-items-center rounded-full border-2 ${colorClass} shadow-lg transition-transform group-hover:scale-110`}>
                {badge.isUnlocked ? (
                  renderIcon(badge.icon, "size-8")
                ) : (
                  <Lock className="size-8 opacity-50" />
                )}
              </div>
              
              {/* Details */}
              <h3 className={`text-sm sm:text-base font-bold mb-1 ${badge.isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {badge.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                {badge.description}
              </p>

              {/* Progress (if locked and has progress) */}
              {!badge.isUnlocked && badge.maxProgress > 1 && (
                <div className="w-full mt-auto">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                    <span>Tiến độ</span>
                    <span>{badge.currentProgress} / {badge.maxProgress}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-primary/50" 
                      style={{ width: `${Math.round((badge.currentProgress / badge.maxProgress) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Unlocked Date */}
              {badge.isUnlocked && badge.unlockedAt && (
                <div className="w-full mt-auto pt-4 border-t border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Đạt được: {new Date(badge.unlockedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 rounded-3xl border border-dashed border-border bg-card p-6 text-center">
          <Trophy className="size-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground">Không có danh hiệu nào</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Hãy tiếp tục phá án để mở khóa thêm nhiều danh hiệu mới!
          </p>
        </div>
      )}
      
    </div>
  );
}
