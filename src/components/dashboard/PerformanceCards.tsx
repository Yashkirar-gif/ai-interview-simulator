import { Award, BarChart3, Trophy, MessageSquareCode, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ProgressStats } from '../../types';

interface PerformanceCardsProps {
  stats: ProgressStats;
}

export default function PerformanceCards({ stats }: PerformanceCardsProps) {
  const cards = [
    {
      id: 'card-total-interviews',
      title: 'Total Interviews',
      value: stats.totalInterviews.toString(),
      subtext: stats.totalInterviews === 1 ? '1 session completed' : 'Completed mock sessions',
      icon: Award,
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: stats.interviewsDelta !== 0 ? {
        text: `${stats.interviewsDelta > 0 ? `+${stats.interviewsDelta}` : stats.interviewsDelta} vs prior`,
        positive: stats.interviewsDelta > 0
      } : { text: 'Current period', neutral: true }
    },
    {
      id: 'card-avg-score',
      title: 'Average Score',
      value: stats.totalInterviews > 0 ? `${stats.averageScore}%` : '--',
      subtext: 'Across all evaluated answers',
      icon: BarChart3,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: stats.totalInterviews > 0 && stats.scoreDelta !== 0 ? {
        text: `${stats.scoreDelta > 0 ? `+${stats.scoreDelta}%` : `${stats.scoreDelta}%`}`,
        positive: stats.scoreDelta > 0
      } : (stats.totalInterviews > 0 ? { text: 'Consistent', neutral: true } : null)
    },
    {
      id: 'card-best-score',
      title: 'Best Score',
      value: stats.totalInterviews > 0 ? `${stats.bestScore}%` : '--',
      subtext: stats.bestScore >= 90 ? 'Elite tier performance' : 'Personal peak record',
      icon: Trophy,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: stats.totalInterviews > 0 ? {
        text: stats.bestScore >= 80 ? 'Proficient' : 'In Progress',
        positive: stats.bestScore >= 80,
        neutral: stats.bestScore < 80
      } : null
    },
    {
      id: 'card-questions-answered',
      title: 'Questions Answered',
      value: stats.totalQuestions.toString(),
      subtext: 'Unique technical responses',
      icon: MessageSquareCode,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: stats.totalQuestions > 0 ? {
        text: `${stats.totalQuestions} evaluated`,
        neutral: true
      } : null
    },
    {
      id: 'card-current-streak',
      title: 'Current Streak',
      value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'Day' : 'Days'}`,
      subtext: stats.bestStreak > stats.currentStreak 
        ? `Personal best: ${stats.bestStreak} days`
        : (stats.currentStreak > 0 ? 'Daily momentum active!' : 'Practice today to start streak'),
      icon: Flame,
      iconColor: stats.currentStreak > 0 ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' : 'text-gray-400 bg-white/5 border-white/10',
      badge: stats.currentStreak > 0 ? {
        text: `${stats.currentStreak}d streak`,
        positive: true
      } : null
    }
  ];

  return (
    <div id="top-performance-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all duration-200 group w-full"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconColor} transition-transform group-hover:scale-105`}>
                <Icon size={16} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-gray-400 line-clamp-1">
                {card.subtext}
              </p>
            </div>

            {card.badge && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
                {card.badge.neutral ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
                    <Minus size={11} /> {card.badge.text}
                  </span>
                ) : card.badge.positive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <TrendingUp size={11} /> {card.badge.text}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                    <TrendingDown size={11} /> {card.badge.text}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
