import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { mockProgressService } from '../../services/mock/mockProgressService.js';
import { formatXP } from '../../utils/format.js';
import { 
  User, Award, Flame, Target, BookOpen, Clock, 
  Activity, Star, TrendingUp, Shield, BarChart3, Sparkles, Info
} from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton.jsx';

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    xp: 2450,
    skills: [],
    recentActivity: []
  });

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [xpRes, masteryRes] = await Promise.all([
          mockProgressService.getLearnerXp(user.id),
          mockProgressService.listSkillMastery(user.id)
        ]);

        const totalXp = xpRes.data?.totalXp && xpRes.data.totalXp > 0 ? xpRes.data.totalXp : 2450;
        
        // Format or provide rich default skill mastery data consistent with 12 completed missions
        let skills = (masteryRes.data && masteryRes.data.length > 0) ? masteryRes.data : [];
        if (skills.length === 0) {
          skills = [
            { skillId: 'excel_formula', name: 'Công thức & Hàm Excel', masteryScore: 85 },
            { skillId: 'sql_query', name: 'Truy vấn & Cú pháp SQL', masteryScore: 65 },
            { skillId: 'data_cleaning', name: 'Làm sạch & Chuẩn hóa dữ liệu', masteryScore: 78 },
            { skillId: 'data_analysis', name: 'Tư duy phân tích thám tử', masteryScore: 60 },
          ];
        } else {
          // Normalize names
          skills = skills.map(s => ({
            ...s,
            name: s.name || (s.skillId === 'excel_formula' ? 'Công thức & Hàm Excel' :
                             s.skillId === 'sql_query' ? 'Truy vấn & Cú pháp SQL' :
                             s.skillId === 'data_analysis' ? 'Tư duy phân tích thám tử' :
                             s.skillId.replace('_', ' ').toUpperCase())
          }));
        }

        const recentActivity = [
          { id: 1, type: 'mission', title: 'Vụ án: Bí ẩn dữ liệu doanh thu', date: '2 giờ trước', xp: 120 },
          { id: 2, type: 'practice', title: 'Luyện tập: Hàm VLOOKUP & XLOOKUP nâng cao', date: 'Hôm qua', xp: 50 },
          { id: 3, type: 'achievement', title: 'Mở khóa danh hiệu: Bậc thầy Excel', date: '3 ngày trước', xp: 100 },
          { id: 4, type: 'mission', title: 'Vụ án: Dấu vết gian lận giao dịch SQL', date: '5 ngày trước', xp: 200 },
        ];

        setStats({
          xp: totalXp,
          skills,
          recentActivity
        });
      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in mx-auto max-w-5xl">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-3xl md:col-span-2" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const initials = user?.name ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : 'US';
  
  const getRankName = (xp) => {
    if (xp >= 5000) return 'Thám tử Huyền thoại';
    if (xp >= 2000) return 'Thám tử Trưởng';
    if (xp >= 500) return 'Thám tử Cấp cao';
    return 'Thám tử Tập sự';
  };
  
  const currentRank = getRankName(stats.xp);

  return (
    <div className="space-y-8 animate-fade-in mx-auto max-w-5xl pb-12">
      
      {/* ── Profile Header ── */}
      <div className="relative rounded-3xl bg-card border border-border shadow-xs overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-primary/20 via-amber-500/10 to-transparent"></div>
        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center gap-5">
          
          {/* Refined Avatar Container (Sleek & balanced size) */}
          <div className="relative shrink-0">
            <div className="grid size-16 sm:size-18 shrink-0 place-items-center rounded-2xl bg-primary shadow-md shadow-primary/20 ring-3 ring-background">
              <span className="text-xl sm:text-2xl font-extrabold text-primary-foreground tracking-wider">{initials}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-amber-500 text-amber-950 shadow-xs ring-2 ring-background">
              <Shield className="size-3.5 fill-current" />
            </div>
          </div>
          
          {/* User Meta Info */}
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-amber-600/10 dark:bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1.5">
              <Award className="size-3" /> {currentRank}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {user?.name || 'Học viên thám tử'}
            </h1>
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1"><User className="size-3.5" /> {user?.email || 'email@example.com'}</span>
              <span className="h-3 w-px bg-border hidden sm:inline-block" />
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold"><Flame className="size-3.5" /> Chuỗi 3 ngày 🔥</span>
            </div>
          </div>
          
          {/* XP Total Badge */}
          <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0.5 rounded-2xl bg-muted/60 dark:bg-muted/30 border border-border px-5 py-3 min-w-[130px] shrink-0">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Tổng XP</span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono tracking-tight">{formatXP(stats.xp)}</span>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Mastery (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col gap-1 hover:border-primary/30 transition-all">
              <Target className="size-5 text-blue-500 mb-1" />
              <span className="text-2xl font-extrabold tracking-tight font-mono">12</span>
              <span className="text-xs text-muted-foreground font-medium">Vụ án hoàn thành</span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col gap-1 hover:border-primary/30 transition-all">
              <BookOpen className="size-5 text-emerald-500 mb-1" />
              <span className="text-2xl font-extrabold tracking-tight font-mono">5</span>
              <span className="text-xs text-muted-foreground font-medium">Bài luyện tập</span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col gap-1 hover:border-primary/30 transition-all">
              <Star className="size-5 text-amber-500 mb-1" />
              <span className="text-2xl font-extrabold tracking-tight font-mono">3</span>
              <span className="text-xs text-muted-foreground font-medium">Danh hiệu đạt được</span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col gap-1 hover:border-primary/30 transition-all">
              <TrendingUp className="size-5 text-rose-500 mb-1" />
              <span className="text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono">Top 5%</span>
              <span className="text-xs text-muted-foreground font-medium">Thứ hạng tuần</span>
            </div>
          </div>
          
          {/* Skill Mastery Section */}
          <div className="relative rounded-3xl border border-border bg-card p-6 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="size-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">Phân tích Kỹ năng (Mastery)</h2>
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                4 Kỹ năng đã đánh giá
              </span>
            </div>
            
            {stats.skills.length > 0 ? (
              <div className="space-y-5">
                {stats.skills.map((skill) => (
                  <div key={skill.skillId} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground tracking-wide flex items-center gap-1.5">
                        {skill.name || skill.skillId}
                        {skill.skillId === 'data_analysis' && (
                          <div 
                            className="group/tooltip relative flex items-center justify-center cursor-help"
                            aria-label="Thông tin về kỹ năng Tư duy phân tích"
                          >
                            <Info className="size-3.5 text-muted-foreground hover:text-primary transition-colors" />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-popover border border-border p-2.5 shadow-md opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-[11px] font-medium text-popover-foreground text-center leading-relaxed">
                              Đo lường tỷ lệ độc lập giải án (ít dùng gợi ý) và kết quả các câu hỏi trắc nghiệm logic.
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
                            </div>
                          </div>
                        )}
                      </span>
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {skill.masteryScore}/100
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted/80 overflow-hidden p-0.5 border border-border/50">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-1000 ease-out shadow-xs" 
                        style={{ width: `${skill.masteryScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Watermark Radar Chart Empty State */
              <div className="relative flex flex-col items-center justify-center min-h-[220px] rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center">
                {/* SVG Watermark Radar Chart in Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-15 pointer-events-none">
                  <svg className="size-48 text-foreground" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                    <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" strokeWidth="1.5" strokeDasharray="3 3" />
                    <polygon points="100,50 145,75 145,125 100,150 55,125 55,75" strokeWidth="1.5" strokeDasharray="3 3" />
                    <polygon points="100,80 120,90 120,110 100,120 80,110 80,90" strokeWidth="1.5" />
                    <line x1="100" y1="20" x2="100" y2="180" strokeWidth="1" />
                    <line x1="30" y1="60" x2="170" y2="140" strokeWidth="1" />
                    <line x1="30" y1="140" x2="170" y2="60" strokeWidth="1" />
                  </svg>
                </div>
                
                {/* Foreground Message */}
                <div className="relative z-10 space-y-2 max-w-sm">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                    <BarChart3 className="size-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Chưa mở khóa bản đồ Kỹ năng</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hoàn thành các bài tập thực hành Excel & SQL để kích hoạt chỉ số đánh giá kỹ năng thám tử của bạn.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Left-aligned Timeline UX/UI (1/3 width) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="size-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">Hoạt động gần đây</h2>
              </div>
              
              {/* Clean Left-aligned Timeline (Nút icon ở bên trái, text trải rộng bên phải) */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {stats.recentActivity.map((act) => (
                  <div key={act.id} className="relative flex items-start gap-3 group">
                    
                    {/* Left Icon Node */}
                    <div className="absolute -left-6 top-0.5 grid size-5 place-items-center rounded-full bg-background border-2 border-primary text-primary shadow-xs ring-4 ring-card">
                      {act.type === 'mission' && <Target className="size-2.5" />}
                      {act.type === 'practice' && <BookOpen className="size-2.5" />}
                      {act.type === 'achievement' && <Sparkles className="size-2.5 text-amber-500" />}
                    </div>
                    
                    {/* Full Width Card Content */}
                    <div className="flex-1 rounded-2xl border border-border/80 bg-muted/30 p-3 shadow-2xs hover:border-primary/40 hover:bg-card transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase leading-none">{act.date}</span>
                        {act.xp > 0 && (
                          <span className="font-mono text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-600/10 px-1.5 py-0.5 rounded-md leading-none flex items-center justify-center">
                            +{act.xp} XP
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-foreground leading-snug">
                        {act.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="w-full mt-6 py-2.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
              Xem lịch sử đầy đủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
