import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Lightbulb } from 'lucide-react';

export function PrerequisiteAlert({ topics = [], readTopics = [] }) {
  if (!topics || topics.length === 0) return null;

  // Tính số bài học chưa đọc
  const unreadTopics = topics.filter(t => !readTopics.includes(t.id));

  if (unreadTopics.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex gap-3">
        <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
        <div>
          <h4 className="font-medium text-emerald-700 dark:text-emerald-400">Bạn đã nắm vững lý thuyết!</h4>
          <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-1">
            Bạn đã học tất cả các kiến thức cần thiết cho vụ án này. Sẵn sàng điều tra thôi!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 md:p-5 flex gap-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-500/20">
        <Lightbulb className="size-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-amber-700 dark:text-amber-400">
          Gợi ý: Củng cố kiến thức trước khi bắt đầu
        </h4>
        <p className="text-sm text-amber-600 dark:text-amber-300/80 mt-1 mb-3">
          Có {unreadTopics.length} bài học lý thuyết được đề xuất cho vụ án này. Bạn nên xem qua để giải quyết nhanh hơn.
        </p>
        
        <div className="flex flex-col gap-2">
          {unreadTopics.map(topic => (
            <Link
              key={topic.id}
              to={`/knowledge/${topic.id}`}
              className="group flex items-center justify-between rounded-lg border border-amber-500/20 bg-background/50 px-3 py-2 text-sm hover:bg-amber-500/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-amber-500" />
                <span className="font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {topic.title}
                </span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Giả lập CheckCircle2 import inline để khỏi lỗi
const CheckCircle2 = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
