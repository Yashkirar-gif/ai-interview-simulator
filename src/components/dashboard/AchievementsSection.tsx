import { useState } from 'react';
import { 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Flame, 
  Brain, 
  Sparkles, 
  Rocket, 
  CheckCheck, 
  Medal, 
  Target, 
  Terminal,
  Award
} from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const filtered = achievements.filter(a => {
    if (filterMode === 'unlocked') return a.unlocked;
    if (filterMode === 'locked') return !a.unlocked;
    return true;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return Rocket;
      case 'CheckCheck': return CheckCheck;
      case 'Medal': return Medal;
      case 'Target': return Target;
      case 'Trophy': return Trophy;
      case 'Flame': return Flame;
      case 'Brain': return Brain;
      case 'Sparkles': return Sparkles;
      case 'Terminal': return Terminal;
      default: return Award;
    }
  };

  return (
    <div id="achievements-section" className="glass p-6 rounded-3xl border border-white/10 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy size={16} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Milestones & Achievements</h3>
          </div>
          <p className="text-xs text-gray-400">
            Earn verifiable badges as you complete interviews and elevate your skills.
          </p>
        </div>

        {/* Status Count & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-semibold text-gray-400">
            <strong className="text-white font-bold">{unlockedCount}</strong> of {totalCount} Unlocked
          </div>

          <div className="glass p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'all' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterMode('unlocked')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'unlocked' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setFilterMode('locked')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'locked' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {filtered.map(ach => {
          const Icon = getIcon(ach.icon);
          const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              id={`achievement-card-${ach.id}`}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                ach.unlocked
                  ? 'glass border-amber-500/30 bg-gradient-to-b from-amber-500/[0.07] to-transparent hover:border-amber-500/50 shadow-sm'
                  : 'glass border-white/5 opacity-70 hover:opacity-100 hover:border-white/15'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-2xl border flex-shrink-0 transition-transform group-hover:scale-105 ${
                    ach.unlocked
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-inner'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white leading-snug">{ach.title}</h4>
                    {ach.unlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Requirement Progress</span>
                  <span className="font-semibold text-white">
                    {ach.unlocked ? 'Complete' : `${ach.progress} / ${ach.maxProgress}`}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked ? 'bg-amber-400' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
