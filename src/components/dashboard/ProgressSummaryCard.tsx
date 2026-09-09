import { Sparkles, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import { ProgressSummaryData } from '../../types';

interface ProgressSummaryCardProps {
  data: ProgressSummaryData;
  onTakeAction: () => void;
}

export default function ProgressSummaryCard({ data, onTakeAction }: ProgressSummaryCardProps) {
  return (
    <div id="ai-progress-summary-card" className="glass p-6 rounded-3xl border border-blue-500/20 relative overflow-hidden bg-gradient-to-r from-blue-900/15 via-indigo-900/10 to-transparent w-full">
      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div className="space-y-3 w-full max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              AI Progress Synthesis
            </span>
            {data.improvementPercentage !== 0 && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                data.improvementPercentage > 0 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {data.improvementPercentage > 0 ? `+${data.improvementPercentage}%` : `${data.improvementPercentage}%`} Trend
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
            "{data.summary}"
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Lead Strength: <strong className="text-white">{data.strongestSkill}</strong> ({data.strongestScore}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Growth Area: <strong className="text-white">{data.weakestSkill}</strong> ({data.weakestScore}%)</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 w-full sm:w-auto">
          <button
            id="action-recommended-btn"
            onClick={onTakeAction}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Target Next Weakness</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
