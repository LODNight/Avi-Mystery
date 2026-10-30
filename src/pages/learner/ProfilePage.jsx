import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { progressService, academyExamService } from '../../services/index.js';
import { formatXP } from '../../utils/format.js';
import { 
  User, Award, Flame, Target, BookOpen, Clock, 
  Activity, Star, TrendingUp, Shield, BarChart3, Info, GraduationCap, Settings, Fingerprint
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProfileSkeleton } from '../../components/ui/Skeleton.jsx';
import { AcademyCertificateModal } from '../../components/academy/AcademyCertificateModal.jsx';


export function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation(['profile', 'common', 'nav', 'settings']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [heatmapFilter, setHeatmapFilter] = useState('6months');
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [stats, setStats] = useState({
    xp: 0,
    streak: user?.streak || 0,
    skills: [],
    recentActivity: [],
    fullHistory: [],
    completedMissionsCount: 0,
    practiceCount: 0,
    achievementsCount: 0
  });

  const availableYears = React.useMemo(() => {
    const yearsSet = new Set();
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear);

    if (stats.fullHistory && stats.fullHistory.length > 0) {
      stats.fullHistory.forEach(item => {
        if (item.timestamp) {
          const y = new Date(item.timestamp).getFullYear();
          if (!isNaN(y)) yearsSet.add(y);
        }
      });
    }

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [stats.fullHistory]);

  const heatmapData = React.useMemo(() => {
    const today = new Date();

    const formatDateKey = (dateObj) => {
      return `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    };

    const activityMap = {};
    if (stats.fullHistory) {
      stats.fullHistory.forEach(item => {
        if (item.timestamp) {
          const d = new Date(item.timestamp);
          if (!isNaN(d.getTime())) {
            const dateStr = formatDateKey(d);
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
          }
        }
      });
    }

    const monthsData = [];
    let totalContributions = 0;
    let activeDays = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    let startMonth;
    let numMonths = 6;

    if (heatmapFilter === '6months') {
      startMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      numMonths = 6;
    } else {
      const filterYear = parseInt(heatmapFilter, 10) || today.getFullYear();
      startMonth = new Date(filterYear, 0, 1);
      numMonths = 12;
    }
    
    for (let i = 0; i < numMonths; i++) {
      const year = startMonth.getFullYear();
      const monthNum = startMonth.getMonth();
      const monthLabel = t('profile:month', 'Thg {{month}}', { month: monthNum + 1 });
      const key = `${year}-${monthNum}`;
      
      const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
      const monthWeeks = [];
      let currentColumn = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, monthNum, day);
        const isFuture = d > today;
        const formattedDate = d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
        const mapKey = formatDateKey(d);
        
        let count = 0;
        if (!isFuture) {
          count = activityMap[mapKey] || 0;
          if (count > 0) {
            totalContributions += count;
            activeDays++;
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        }

        const dayObj = { dateObj: d, formattedDate, count, isFuture };
        const dayOfWeek = (d.getDay() + 6) % 7;

        if (day === 1 && dayOfWeek > 0) {
          for (let p = 0; p < dayOfWeek; p++) {
            currentColumn.push(null);
          }
        }

        currentColumn.push(dayObj);

        if (currentColumn.length === 7 || day === daysInMonth) {
          while (currentColumn.length < 7) {
            currentColumn.push(null);
          }
          monthWeeks.push(currentColumn);
          currentColumn = [];
        }
      }
      
      monthsData.push({ key, label: monthLabel, weeks: monthWeeks });
      startMonth.setMonth(startMonth.getMonth() + 1);
    }

    return { monthsData, totalContributions, activeDays, maxStreak };
  }, [stats.fullHistory, heatmapFilter]);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [xpRes, masteryRes, historyRes, achievementsRes, progressRes] = await Promise.all([
          progressService.getLearnerXp(user.id),
          progressService.listSkillMastery(user.id),
          progressService.getFullHistory(user.id),
          progressService.getLearnerAchievements(user.id),
          progressService.listProgress(user.id)
        ]);

        const totalXp = typeof xpRes.data?.totalXp === 'number' ? xpRes.data.totalXp : (user?.xp || 0);
        const currentStreak = xpRes.data?.streakSummary?.currentStreak ?? (user?.streak || 0);
        const skills = (masteryRes.data && masteryRes.data.length > 0) ? masteryRes.data : [];
        const fullHistory = historyRes.data || [];
        const progressList = progressRes.data || [];

        const completedMissionsList = progressList.filter(p => p.status === 'completed' && p.contentType !== 'practice');
        const completedMissionsCount = completedMissionsList.length;
        const practiceCount = progressList.filter(p => p.status === 'completed' && p.contentType === 'practice').length;
        const achievementsCount = (achievementsRes.data || []).filter(a => a.isUnlocked).length;

        const getRelativeDate = (timestamp) => {
          const dateObj = new Date(timestamp);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (dateObj.toDateString() === today.toDateString()) return t('profile:today', 'Hôm nay');
          if (dateObj.toDateString() === yesterday.toDateString()) return t('profile:yesterday', 'Hôm qua');
          
          const diffTime = Math.abs(today - dateObj);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) return t('profile:daysAgo', '{{count}} ngày trước', { count: diffDays });
          return dateObj.toLocaleDateString('vi-VN');
        };

        const recentActivity = fullHistory.slice(0, 4).map(h => ({
          id: h.id,
          type: h.type,
          title: h.title,
          date: getRelativeDate(h.timestamp),
          xp: typeof h.xp === 'number' ? h.xp : 0
        }));

        setStats({
          xp: totalXp,
          streak: currentStreak,
          skills,
          recentActivity,
          fullHistory,
          completedMissionsCount,
          practiceCount,
          achievementsCount
        });

        const certsRes = academyExamService.getLearnerCertificates(user.id);
        if (certsRes?.data) {
          setCertificates(certsRes.data);
        }
      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  const initials = user?.name ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : 'US';
  
  const getRankName = (xp) => {
    if (xp >= 5000) return t('profile:rankLegendary', 'Thám tử Huyền thoại');
    if (xp >= 2000) return t('profile:rankChief', 'Thám tử Trưởng');
    if (xp >= 500) return t('profile:rankSenior', 'Thám tử Cấp cao');
    return t('profile:rankApprentice', 'Thám tử Tập sự');
  };
  
  const currentRank = getRankName(stats.xp);

  return (
    <div className="space-y-7 animate-fade-in mx-auto max-w-7xl pb-12">
      
      {/* ── Investigator Personnel Dossier ID Card Header ── */}
      <div className="dossier-card corner-brackets rounded-md bg-card border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-2 font-mono text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5 font-bold text-primary">
            <Fingerprint className="size-3.5" /> PERSONNEL DOSSIER // ID-AGT-0{user?.level || 1}
          </span>
          <span>CLEARANCE STATUS: ACTIVE</span>
        </div>

        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
          {/* Investigator Badge Photo Box */}
          <div className="relative shrink-0">
            <div className="grid size-16 sm:size-18 shrink-0 place-items-center rounded-sm border-2 border-primary bg-primary/15 shadow-2xs">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-primary tracking-wider">{initials}</span>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-sm bg-primary text-primary-foreground shadow-2xs">
              <Shield className="size-3.5 fill-current" />
            </div>
          </div>
          
          {/* User Meta Info */}
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
              <Award className="size-3" /> {currentRank}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {user?.name || t('profile:defaultName', 'Học viên thám tử')}
            </h1>
            <div className="font-mono text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1"><User className="size-3.5 text-primary" /> {user?.email || 'email@example.com'}</span>
              <span className="h-3 w-px bg-border hidden sm:inline-block" />
              <span className="flex items-center gap-1 text-primary font-bold"><Flame className="size-3.5" /> {t('profile:streakDays', 'Chuỗi {{count}} ngày 🔥', { count: stats.streak })}</span>
            </div>
          </div>
          
          {/* Action buttons & XP Total Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0.5 rounded-sm bg-background border border-border px-5 py-2.5 min-w-[130px] shrink-0">
              <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('profile:totalXp', 'Tổng XP')}</span>
              <span className="text-2xl font-black text-primary font-mono tracking-tight">{formatXP(stats.xp)}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-colors shadow-2xs cursor-pointer shrink-0"
              title={t('common:userSettings', 'Cài đặt người dùng')}
            >
              <Settings className="size-4 text-primary" />
              <span className="hidden sm:inline">{t('common:userSettings', 'Cài đặt')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Mastery (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Service Record Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-md border border-border bg-card p-4 shadow-2xs flex flex-col gap-1 hover:border-primary/40 transition-all">
              <Target className="size-4 text-primary mb-1" />
              <span className="text-2xl font-extrabold tracking-tight font-mono text-foreground">{stats.completedMissionsCount}</span>
              <span className="text-xs text-muted-foreground font-medium">{t('profile:completedMissions', 'Vụ án hoàn thành')}</span>
            </div>
            <div className="rounded-md border border-border bg-card p-4 shadow-2xs flex flex-col gap-1 hover:border-primary/40 transition-all">
              <BookOpen className="size-4 text-primary mb-1" />
              <span className="text-2xl font-extrabold tracking-tight font-mono text-foreground">{stats.practiceCount}</span>
              <span className="text-xs text-muted-foreground font-medium">{t('profile:practiceCount', 'Bài luyện tập')}</span>
            </div>
            <div className="rounded-md border border-border bg-card p-4 shadow-2xs flex flex-col gap-1 hover:border-primary/40 transition-all">
              <Star className="size-4 text-primary mb-1" />
              <span className="text-2xl font-extrabold tracking-tight font-mono text-foreground">{stats.achievementsCount}</span>
              <span className="text-xs text-muted-foreground font-medium">{t('profile:achievementsCount', 'Danh hiệu đạt được')}</span>
            </div>
            <div className="rounded-md border border-border bg-card p-4 shadow-2xs flex flex-col gap-1 hover:border-primary/40 transition-all">
              <TrendingUp className="size-4 text-primary mb-1" />
              <span className="text-2xl font-extrabold tracking-tight text-primary font-mono">{t('profile:top5', 'Top 5%')}</span>
              <span className="text-xs text-muted-foreground font-medium">{t('profile:weeklyRank', 'Thứ hạng tuần')}</span>
            </div>
          </div>

          {/* ── ACADEMY CERTIFICATES SECTION ── */}
          <div className="relative rounded-md border border-border bg-card p-6 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary">
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{t('profile:academyCertificates', 'Chứng Chỉ Học Viện (Academy Certificates)')}</h2>
                  <p className="text-xs text-muted-foreground">{t('profile:certDesc', 'Chứng nhận tốt nghiệp chính thức sau khi vượt qua kỳ thi sát hạch')}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-sm">
                {t('profile:certCount', '{{count}} Chứng chỉ', { count: certificates.length })}
              </span>
            </div>

            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id || cert.certificateId}
                    className="dossier-card p-4 pl-5 rounded-md border border-primary/35 bg-background/70 hover:border-primary/60 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-sm">
                          <Award className="size-3" /> {cert.grade || t('profile:passed', 'Đạt Chuẩn')}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground leading-snug mb-1">
                        {cert.courseTitle}
                      </h3>
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {t('profile:score', 'Điểm: {{score}}% • {{id}}', { score: cert.scorePercent, id: cert.certificateId })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCert(cert)}
                      className="w-full py-2 rounded-sm border border-primary/35 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="size-3.5" />
                      <span>{t('profile:viewAndPrintCert', 'Xem & In Chứng Chỉ')}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-sm border border-dashed border-border text-center bg-muted/20">
                <GraduationCap className="size-9 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-3">
                  {t('profile:noCert', 'Bạn chưa có chứng chỉ nào. Hãy hoàn thành khóa học Excel hoặc SQL Academy và vượt qua bài thi tốt nghiệp để nhận chứng chỉ chính thức!')}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/academy')}
                  className="px-4 py-2 rounded-sm bg-primary text-primary-foreground font-mono text-xs font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {t('profile:exploreAcademy', 'Khám phá Học viện Academy')}
                </button>
              </div>
            )}
          </div>
          
          {/* Skill Mastery Section */}
          <div className="relative rounded-md border border-border bg-card p-6 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary">
                  <Activity className="size-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">{t('profile:skillMastery', 'Phân tích Kỹ năng (Mastery)')}</h2>
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-sm border border-border">
                {t('profile:skillsEvaluated', '{{count}} Kỹ năng đã đánh giá', { count: stats.skills.filter(s => s.masteryScore > 0).length })}
              </span>
            </div>
            
            {stats.skills.length > 0 ? (
              <div className="space-y-4">
                {stats.skills.map((skill) => (
                  <div key={skill.skillId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground tracking-wide flex items-center gap-1.5">
                        {skill.name || skill.skillId}
                        {skill.skillId === 'data_analysis' && (
                          <div 
                            className="group/tooltip relative flex items-center justify-center cursor-help"
                            aria-label={t('profile:analyticalThinkingInfo', 'Thông tin về kỹ năng Tư duy phân tích')}
                          >
                            <Info className="size-3.5 text-muted-foreground hover:text-primary transition-colors" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-sm bg-popover border border-border p-2.5 shadow-md opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-[11px] font-medium text-popover-foreground text-center leading-relaxed">
                              {t('profile:analyticalThinkingDesc', 'Đo lường tỷ lệ độc lập giải án (ít dùng gợi ý) và kết quả các câu hỏi trắc nghiệm logic.')}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
                            </div>
                          </div>
                        )}
                      </span>
                      <span className="font-mono font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-sm">
                        {skill.masteryScore}/100
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-sm bg-muted overflow-hidden border border-border">
                      <div 
                        className="h-full bg-primary transition-all duration-700 ease-out" 
                        style={{ width: `${skill.masteryScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center min-h-[200px] rounded-sm border border-dashed border-border bg-card/40 p-6 text-center">
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
                
                <div className="relative z-10 space-y-2 max-w-sm">
                  <div className="mx-auto grid size-11 place-items-center rounded-sm bg-muted text-muted-foreground">
                    <BarChart3 className="size-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{t('profile:skillsLocked', 'Chưa mở khóa bản đồ Kỹ năng')}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('profile:skillsLockedDesc', 'Hoàn thành các bài tập thực hành Excel & SQL để kích hoạt chỉ số đánh giá kỹ năng thám tử của bạn.')}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Field Activity Heatmap */}
          <div className="rounded-md border border-border bg-card p-4 sm:p-6 shadow-2xs overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-extrabold text-foreground tracking-tight font-mono">
                  {heatmapData.totalContributions}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {t('profile:investigationsIn', 'lượt phá án trong')}
                </span>
                
                <select 
                  value={heatmapFilter}
                  onChange={(e) => setHeatmapFilter(e.target.value)}
                  className="bg-background border border-border px-2.5 py-1 rounded-sm font-mono text-xs font-semibold text-foreground hover:bg-muted transition-colors outline-none cursor-pointer"
                >
                  <option value="6months">{t('profile:last6Months', '6 tháng qua')}</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={String(yr)}>{t('profile:year', 'Năm {{year}}', { year: yr })}</option>
                  ))}
                </select>

                <div 
                  className="group/tooltip relative flex items-center justify-center cursor-help ml-1"
                  aria-label={t('profile:contributionInfo', 'Thông tin chuỗi đóng góp')}
                >
                  <Info className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-sm bg-popover border border-border p-2.5 shadow-md opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-[11px] font-medium text-popover-foreground text-center leading-relaxed">
                    {t('profile:contributionDesc', 'Thống kê tổng số lượt bài giải Excel & SQL bạn đã hoàn thành trong khoảng thời gian đã chọn.')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-sm border border-border w-fit">
                <div className="flex items-center gap-1.5">
                  {t('profile:activeDays', 'Ngày hoạt động:')} <span className="font-bold text-foreground">{heatmapData.activeDays}</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  {t('profile:longestStreak', 'Streak dài nhất:')} <span className="font-bold text-primary">{heatmapData.maxStreak}</span>
                </div>
              </div>
            </div>

            <div 
              className="overflow-x-auto pb-2 scrollbar-hide"
              style={{ direction: 'rtl' }}
            >
              <div className="flex gap-4 min-w-max" style={{ direction: 'ltr' }}>
                <div className="flex flex-col justify-between font-mono text-[10px] font-medium text-muted-foreground py-0.5 sticky left-0 bg-card z-10 pr-2 select-none shrink-0">
                  <span>{t('profile:monday', 'T2')}</span>
                  <span>{t('profile:wednesday', 'T4')}</span>
                  <span>{t('profile:friday', 'T6')}</span>
                </div>

                <div className="flex gap-3 pr-2">
                  {heatmapData.monthsData.map((month) => (
                    <div key={month.key} className="flex flex-col gap-2">
                      <div className="flex gap-1.5">
                        {month.weeks.map((week, wIdx) => (
                          <div key={wIdx} className="flex flex-col gap-1.5">
                            {week.map((day, dIdx) => {
                              if (!day) {
                                return <div key={dIdx} className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 bg-transparent" />;
                              }
                              let colorClass = 'bg-stone-200/80 dark:bg-stone-800/90 border border-stone-300/40 dark:border-stone-700/40';
                              if (day.isFuture) colorClass = 'bg-muted/30 border border-transparent';
                              else if (day.count === 1) colorClass = 'bg-emerald-600/70 dark:bg-emerald-700/80 border border-emerald-500/30';
                              else if (day.count >= 2 && day.count <= 3) colorClass = 'bg-emerald-500 dark:bg-emerald-500';
                              else if (day.count >= 4 && day.count <= 5) colorClass = 'bg-emerald-400 dark:bg-emerald-400';
                              else if (day.count >= 6) colorClass = 'bg-emerald-300 dark:bg-emerald-300 ring-1 ring-emerald-200/50';

                              return (
                                <div
                                  key={dIdx}
                                  title={t('profile:attempts', '{{date}}: {{count}} lượt làm bài', { date: day.formattedDate, count: day.count })}
                                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] transition-all hover:scale-125 hover:z-20 cursor-pointer shrink-0 ${colorClass}`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      <div className="font-mono text-[10px] font-semibold text-muted-foreground text-center">
                        {month.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Field Investigation Log Timeline (1/3 width) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-md border border-border bg-card p-5 sm:p-6 shadow-2xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-5">
                <div className="grid size-8 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary">
                  <Clock className="size-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">{t('profile:recentActivity', 'Hoạt động gần đây')}</h2>
              </div>
              
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:border-l before:border-dashed before:border-primary/50">
                {stats.recentActivity.map((act) => (
                  <div key={act.id} className="relative flex items-start gap-3 group">
                    <div className="absolute -left-6 top-1 grid size-5 place-items-center rounded-sm bg-background border border-primary text-primary shadow-2xs">
                      {act.type === 'mission' && <Target className="size-2.5" />}
                      {act.type === 'practice' && <BookOpen className="size-2.5" />}
                      {act.type === 'achievement' && <Award className="size-2.5 text-primary" />}
                    </div>
                    
                    <div className="flex-1 rounded-sm border border-border bg-background/70 p-3 shadow-2xs hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase leading-none">{act.date}</span>
                        {act.xp > 0 && (
                          <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded-sm leading-none">
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
            
            <button 
              onClick={() => navigate('/profile/history')}
              className="w-full mt-6 py-2.5 rounded-sm border border-primary/35 font-mono text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              {t('profile:viewFullHistory', 'Xem lịch sử đầy đủ')}
            </button>
          </div>
        </div>
      </div>

      {/* ── CERTIFICATE MODAL ── */}
      <AcademyCertificateModal
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />

    </div>
  );
}
