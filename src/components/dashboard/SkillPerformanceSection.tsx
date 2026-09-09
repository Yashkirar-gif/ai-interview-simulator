import { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar 
} from 'recharts';
import { BrainCircuit, Layers, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { SkillScore } from '../../types';
import { useTheme } from '../../ThemeContext';

interface SkillPerformanceSectionProps {
  skills: SkillScore[];
  totalSessions: number;
}

export default function SkillPerformanceSection({ skills, totalSessions }: SkillPerformanceSectionProps) {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'both' | 'bars' | 'radar'>('both');

  const radarData = useMemo(() => {
    return skills.map(s => ({
      subject: s.name.replace(' Knowledge', ''),
      score: s.score,
      fullMark: 100
    }));
  }, [skills]);

  const textColor = isDark ? '#E2E8F0' : '#334155';
  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

  const getLevelBadgeClass = (level: SkillScore['level']) => {
    switch (level) {
      case 'Advanced':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Proficient':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Developing':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div id="skill-performance-section" className="glass p-6 rounded-3xl border border-white/10 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BrainCircuit size={16} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Skill Performance</h3>
          </div>
          <p className="text-xs text-gray-400">
            Multi-dimensional assessment across 5 core competency areas.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 glass p-1 rounded-xl border border-white/10 self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'both' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('bars')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'bars' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Progress Bars
          </button>
          <button
            onClick={() => setViewMode('radar')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'radar' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Radar
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${viewMode === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'} w-full`}>
        {/* Horizontal Progress Bars */}
        {(viewMode === 'both' || viewMode === 'bars') && (
          <div className={`${viewMode === 'both' ? 'lg:col-span-7' : 'w-full'} space-y-4 w-full`}>
            {skills.map(skill => (
              <div
                key={skill.key}
                id={`skill-bar-${skill.key}`}
                className="glass p-4 rounded-2xl border border-white/5 hover:border-white/15 transition-all space-y-2.5 w-full"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{skill.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getLevelBadgeClass(skill.level)}`}>
                      {skill.level}
                    </span>
                  </div>
                  <span className="text-sm font-black text-white">{skill.score}%</span>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(skill.score)}`}
                    style={{ width: `${Math.max(4, skill.score)}%` }}
                  />
                </div>

                {/* Contextual advice */}
                <p className="text-xs text-gray-400 flex items-start gap-1.5 leading-relaxed">
                  <Sparkles size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>{skill.insight}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Radar Chart */}
        {(viewMode === 'both' || viewMode === 'radar') && (
          <div className={`${viewMode === 'both' ? 'lg:col-span-5' : 'max-w-md mx-auto'} w-full flex flex-col items-center justify-center glass p-5 rounded-2xl border border-white/10`}>
            <div className="w-full text-center pb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Competency Equilibrium</span>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke={gridStroke} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }}
                  />
                  <Radar
                    name="Candidate Score"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center pt-1 border-t border-white/5 w-full">
              <span className="text-[11px] text-gray-400">
                Balanced polygon indicates well-rounded senior candidate readiness.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
