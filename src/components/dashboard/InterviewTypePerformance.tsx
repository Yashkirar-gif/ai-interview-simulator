import { Layers, Terminal, Users, Code, ArrowRight, CheckCircle2 } from 'lucide-react';
import { InterviewTypeStats, InterviewType } from '../../types';

interface InterviewTypePerformanceProps {
  stats: InterviewTypeStats[];
  onPracticeType: (type: InterviewType) => void;
}

export default function InterviewTypePerformance({ stats, onPracticeType }: InterviewTypePerformanceProps) {
  const getTypeIcon = (type: InterviewType) => {
    switch (type) {
      case 'technical':
        return Code;
      case 'behavioral':
        return Users;
      case 'hr':
        return Layers;
      case 'coding':
        return Terminal;
    }
  };

  const getTypeDescription = (type: InterviewType) => {
    switch (type) {
      case 'technical':
        return 'System internals, browser APIs & architecture';
      case 'behavioral':
        return 'STAR methodology, conflict & team scenarios';
      case 'hr':
        return 'Culture fit, career trajectory & role alignment';
      case 'coding':
        return 'Algorithms, data structures & live execution';
    }
  };

  return (
    <div id="interview-type-section" className="glass p-6 rounded-3xl border border-white/10 space-y-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers size={16} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Interview Type Performance</h3>
          </div>
          <p className="text-xs text-gray-400">
            Compare competency metrics across distinct interview evaluation styles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {stats.map(item => {
          const Icon = getTypeIcon(item.type);
          const hasAttempts = item.attempts > 0;

          return (
            <div
              key={item.type}
              id={`type-card-${item.type}`}
              className="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all space-y-4 group w-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="p-2 rounded-xl border border-white/10"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <span className="text-[11px] text-gray-400">
                        {item.attempts} {item.attempts === 1 ? 'attempt' : 'attempts'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-1">
                  {getTypeDescription(item.type)}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Avg Score</span>
                    <span className="text-base font-black text-white">
                      {hasAttempts ? `${item.averageScore}%` : '--'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Best Score</span>
                    <span className="text-base font-black text-emerald-400">
                      {hasAttempts ? `${item.bestScore}%` : '--'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${hasAttempts ? Math.max(5, item.averageScore) : 0}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                id={`practice-type-btn-${item.type}`}
                onClick={() => onPracticeType(item.type)}
                className="w-full py-2 px-3 rounded-xl glass border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <span>Practice {item.title}</span>
                <ArrowRight size={13} className="text-blue-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
