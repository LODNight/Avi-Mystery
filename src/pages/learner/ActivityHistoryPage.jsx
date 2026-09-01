import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { progressService } from '../../services/index.js';
import { 
  ArrowLeft, Calendar, Filter, Target, BookOpen, 
  Sparkles, ArrowUpCircle, Trophy, History, Shield
} from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

export function ActivityHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'mission', 'practice', 'achievement', 'levelup'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', '7days', '30days'

  useEffect(() => {
    async function loadHistory() {
      if (!user?.id) return;
      try {
        const res = await progressService.getFullHistory(user.id);
        if (res.data) {
          setHistory(res.data);
        }
      } catch (error) {
        console.error('Failed to load activity history', error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  // Filter Logic
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      
      // Time filter
      if (timeFilter !== 'all') {
        const itemDate = new Date(item.timestamp);
        const today = new Date();
        const diffTime = Math.abs(today - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (timeFilter === '7days' && diffDays > 7) return false;
        if (timeFilter === '30days' && diffDays > 30) return false;
      }
      return true;
    });
  }, [history, typeFilter, timeFilter]);

  // Group by Date Helper
  const groupedHistory = useMemo(() => {
    const groups = {};
    filteredHistory.forEach(item => {
      const dateObj = new Date(item.timestamp);
      
      // Determine label: "Hôm nay", "Hôm qua", or formatted date
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateLabel = '';
      if (dateObj.toDateString() === today.toDateString()) {
        dateLabel = 'Hôm nay';
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Hôm qua';
      } else {
        dateLabel = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(item);
    });
    return groups;
  }, [filteredHistory]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'mission': return <Target className="size-4" />;
      case 'practice': return <BookOpen className="size-4" />;
      case 'achievement': return <Sparkles className="size-4" />;
      case 'levelup': return <ArrowUpCircle className="size-4" />;
      default: return <History className="size-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'mission': return 'text-blue-500 border-blue-500 bg-blue-500/10';
      case 'practice': return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
      case 'achievement': return 'text-amber-500 border-amber-500 bg-amber-500/10';
      case 'levelup': return 'text-purple-500 border-purple-500 bg-purple-500/10';
      default: return 'text-primary border-primary bg-primary/10';
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in mx-auto max-w-4xl pt-6">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-12 w-full max-w-md rounded-xl" />
        <div className="space-y-8 mt-8">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalFilteredXp = filteredHistory.reduce((acc, curr) => acc + (curr.xp || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in mx-auto max-w-4xl pb-12">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <History className="size-6 text-primary" />
              Lịch sử Hoạt động
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Theo dõi quá trình học tập và phần thưởng bạn đã đạt được.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl shrink-0">
          <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="text-[10px] font-bold text-amber-700/70 dark:text-amber-400/70 uppercase tracking-widest leading-none mb-0.5">Tổng XP Lọc</div>
            <div className="text-sm font-black text-amber-700 dark:text-amber-400 leading-none">
              +{totalFilteredXp.toLocaleString()} XP
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <Filter className="size-4 text-muted-foreground ml-2 shrink-0" />
          
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-muted text-foreground text-sm font-semibold rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="all">Tất cả Hoạt động</option>
            <option value="mission">🎯 Vụ án cốt truyện</option>
            <option value="practice">📖 Luyện tập</option>
            <option value="achievement">🏆 Danh hiệu</option>
            <option value="levelup">🌟 Thăng cấp</option>
          </select>

          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-muted text-foreground text-sm font-semibold rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="all">Toàn bộ thời gian</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
          </select>
        </div>
      </div>

      {/* ── Timeline Feed ── */}
      <div className="space-y-10">
        {Object.keys(groupedHistory).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-border bg-card/50">
            <Shield className="size-12 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-foreground">Không tìm thấy dữ liệu</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Chưa có hoạt động nào khớp với bộ lọc của bạn. Hãy thử thay đổi bộ lọc hoặc bắt đầu phá án!
            </p>
          </div>
        ) : (
          Object.keys(groupedHistory).map((dateLabel, groupIdx) => (
            <div key={dateLabel} className="relative">
              
              {/* Date Header */}
              <div className="sticky top-0 z-10 flex items-center gap-3 mb-6 bg-background/80 backdrop-blur-md py-2 -mx-2 px-2">
                <div className="grid size-8 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <Calendar className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  {dateLabel}
                </h3>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Timeline Container */}
              <div className="relative pl-6 sm:pl-10 space-y-5 before:absolute before:left-2 sm:before:left-[1.35rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                {groupedHistory[dateLabel].map((act, index) => {
                  const isAchievement = act.type === 'achievement' || act.type === 'levelup';
                  return (
                    <div key={act.id} className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 group">
                      
                      {/* Node Point */}
                      <div className={`absolute -left-6 sm:-left-10 top-2 sm:top-1/2 sm:-translate-y-1/2 grid size-6 place-items-center rounded-full border-2 bg-background shadow-sm ring-4 ring-background z-10 transition-transform group-hover:scale-110 ${getActivityColor(act.type)}`}>
                        {getActivityIcon(act.type)}
                      </div>

                      {/* Card Content */}
                      <div 
                        onClick={() => act.link && navigate(act.link)}
                        className={`flex-1 flex flex-col sm:flex-row justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all ${isAchievement ? 'bg-gradient-to-r from-amber-500/5 to-transparent border-amber-500/20' : ''} ${act.link ? 'cursor-pointer hover:shadow-md hover:border-primary/50' : 'hover:shadow-md'}`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                              {formatTime(act.timestamp)}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                              {act.type === 'mission' ? 'Vụ án' : 
                               act.type === 'practice' ? 'Luyện tập' : 
                               act.type === 'achievement' ? 'Danh hiệu' : 'Thăng cấp'}
                            </span>
                          </div>
                          <h4 className={`text-sm sm:text-base font-bold ${isAchievement ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>
                            {act.title}
                          </h4>
                        </div>
                        
                        {/* XP Reward (if any) */}
                        {act.xp > 0 ? (
                          <div className="mt-3 sm:mt-0 flex items-center justify-start sm:justify-end shrink-0">
                            <span className="font-mono text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl shadow-xs">
                              +{act.xp} XP
                            </span>
                          </div>
                        ) : (
                          <div className="mt-3 sm:mt-0 flex items-center justify-start sm:justify-end shrink-0">
                            <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
                              Thành tựu
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}
