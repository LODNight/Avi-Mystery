import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { progressService } from '../../services/index.js';
import { Trophy, Lock, Target, FileSpreadsheet, Database, Flame, Award, Shield } from 'lucide-react';
import { AchievementsSkeleton } from '../../components/ui/Skeleton.jsx';
import { useTranslation } from 'react-i18next';

export function AchievementsPage() {
  const { user } = useAuth();
  const { t } = useTranslation(['achievements', 'common']);
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
      case 'database-zap': return <Database className={className} />;
      case 'flame': return <Flame className={className} />;
      case 'star': return <Award className={className} />;
      case 'award': return <Shield className={className} />;
      default: return <Trophy className={className} />;
    }
  };

  const getRarityColor = (rarity, isUnlocked) => {
    if (!isUnlocked) return 'bg-muted/50 text-muted-foreground border-border grayscale';
    switch (rarity) {
      case 'legendary': return 'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400';
      case 'epic': return 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400';
      case 'rare': return 'bg-primary/15 border-primary/40 text-primary';
      default: return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400';
    }
  };

  if (loading) {
    return <AchievementsSkeleton />;
  }

  return (
    <div className="space-y-7 animate-fade-in mx-auto max-w-5xl pb-12">
      
      {/* ── Bureau Commendations & Service Medals Header ── */}
      <div className="dossier-card corner-brackets rounded-md bg-card border border-border shadow-sm overflow-hidden p-6 sm:p-7 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
        <div className="relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-sm border border-primary/35 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary mb-2.5">
            <Trophy className="size-3" /> {t('achievements:collection', 'Bộ sưu tập')} // COMMENDATIONS
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('achievements:title', 'Danh hiệu Thám tử')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">
            {t('achievements:description', 'Mở khóa các danh hiệu đặc biệt bằng cách vượt qua các vụ án hóc búa, duy trì chuỗi học tập và nâng cao kỹ năng phân tích dữ liệu của bạn.')}
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center bg-background rounded-sm border border-border p-4 min-w-[160px] shadow-2xs">
          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{t('achievements:progress', 'Tiến trình')}</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-black text-primary">{unlockedCount}</span>
            <span className="text-sm font-bold text-muted-foreground">/ {totalCount}</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-sm bg-muted overflow-hidden border border-border">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center p-1 bg-muted rounded-sm border border-border w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-sm font-mono text-xs font-bold transition-all cursor-pointer ${filter === 'all' ? 'bg-card shadow-2xs text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('achievements:filterAll', 'Tất cả')}
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-sm font-mono text-xs font-bold transition-all cursor-pointer ${filter === 'unlocked' ? 'bg-card shadow-2xs text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('achievements:filterUnlocked', 'Đã mở khóa')}
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-sm font-mono text-xs font-bold transition-all cursor-pointer ${filter === 'locked' ? 'bg-card shadow-2xs text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('achievements:filterLocked', 'Chưa đạt')}
          </button>
        </div>
      </div>

      {/* ── Commendation Medals Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredAchievements.map((badge, idx) => {
          const colorClass = getRarityColor(badge.rarity, badge.isUnlocked);
          
          return (
            <div 
              key={badge.id}
              className={`group relative flex flex-col items-center text-center rounded-md border border-border bg-card p-5 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-primary/50 ${!badge.isUnlocked ? 'opacity-75' : ''}`}
            >
              {/* Top Citation Bar */}
              <div className="w-full flex items-center justify-between border-b border-border/70 pb-2 mb-4 font-mono text-[9px]">
                <span className="text-muted-foreground">MEDAL-0{idx + 1}</span>
                <span className={`font-bold uppercase tracking-wider ${badge.isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                  {badge.rarity}
                </span>
              </div>

              {/* Double-Ring Forensic Seal Container */}
              <div className={`my-2 grid size-16 place-items-center rounded-sm border-2 ${colorClass} ring-4 ring-background transition-transform group-hover:scale-105`}>
                {badge.isUnlocked ? (
                  renderIcon(badge.icon, "size-7")
                ) : (
                  <Lock className="size-6 opacity-50" />
                )}
              </div>
              
              {/* Details */}
              <h3 className={`mt-3 text-sm font-bold mb-1 ${badge.isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {badge.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1 leading-relaxed">
                {badge.description}
              </p>

              {/* Progress (if locked and has progress) */}
              {!badge.isUnlocked && badge.maxProgress > 1 && (
                <div className="w-full mt-auto pt-2 border-t border-border/60">
                  <div className="flex justify-between font-mono text-[10px] font-bold text-muted-foreground mb-1">
                    <span>{t('achievements:itemProgress', 'Tiến độ')}</span>
                    <span>{badge.currentProgress} / {badge.maxProgress}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-sm bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-primary/60" 
                      style={{ width: `${Math.round((badge.currentProgress / badge.maxProgress) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Unlocked Date */}
              {badge.isUnlocked && badge.unlockedAt && (
                <div className="w-full mt-auto pt-3 border-t border-border">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                    {t('achievements:unlockedAt', 'Đạt được: {{date}}', { date: new Date(badge.unlockedAt).toLocaleDateString('vi-VN') })}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 rounded-md border border-dashed border-border bg-card p-6 text-center">
          <Trophy className="size-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-base font-bold text-foreground">{t('achievements:emptyTitle', 'Không có danh hiệu nào')}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t('achievements:emptyDesc', 'Hãy tiếp tục phá án để mở khóa thêm nhiều danh hiệu mới!')}
          </p>
        </div>
      )}
      
    </div>
  );
}
