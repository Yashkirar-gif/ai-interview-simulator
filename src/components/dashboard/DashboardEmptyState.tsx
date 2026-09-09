import { Sparkles, Trophy, BrainCircuit, Flame, ArrowRight, ShieldCheck } from 'lucide-react';

interface DashboardEmptyStateProps {
  onStartFirst: () => void;
}

export default function DashboardEmptyState({ onStartFirst }: DashboardEmptyStateProps) {
  const previews = [
    {
      icon: Trophy,
      title: 'Score Benchmarks',
      desc: 'Track percentiles across technical accuracy, articulation clarity, and speech pacing.'
    },
    {
      icon: BrainCircuit,
      title: '5 Competency Dimensions',
      desc: 'Continuous radar diagnostics across Technical, Communication, Problem Solving, Confidence, and Relevance.'
    },
    {
      icon: Flame,
      title: 'Streak & Milestones',
      desc: 'Daily streak counters, verifiable unlockable achievement badges, and targeted score goals.'
    }
  ];

  return (
    <div id="dashboard-empty-state" className="glass p-6 sm:p-10 md:p-14 rounded-[36px] border border-white/15 text-center space-y-8 w-full max-w-4xl mx-auto shadow-2xl">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
        <Sparkles size={36} />
      </div>

      <div className="space-y-3 w-full max-w-xl mx-auto">
        <h2 className="text-3xl font-black text-white tracking-tight">
          No interviews recorded yet
        </h2>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Complete your first AI mock interview to track your performance, unlock skills breakdowns, and view your progress over time.
        </p>
      </div>

      <div className="pt-2 w-full flex justify-center">
        <button
          id="empty-start-interview-btn"
          onClick={onStartFirst}
          className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles size={16} />
          <span>Start Your First Interview</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-left w-full">
        {previews.map((prev, idx) => {
          const Icon = prev.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 w-full">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                <Icon size={16} />
              </div>
              <h4 className="text-xs font-bold text-white">{prev.title}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">{prev.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
