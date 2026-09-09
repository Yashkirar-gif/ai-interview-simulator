import { useState, useEffect } from 'react';
import { Target, CheckCircle2, TrendingUp, Edit3, ArrowRight, Sparkles } from 'lucide-react';
import { GoalProgress } from '../../types';

interface ImprovementGoalCardProps {
  currentScore: number;
  onGoalUpdated?: (newGoal: number) => void;
}

export default function ImprovementGoalCard({ currentScore, onGoalUpdated }: ImprovementGoalCardProps) {
  const [targetScore, setTargetScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ais_user_goal_score');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 50 && val <= 100) return val;
      }
    } catch (e) {
      // fallback
    }
    return 90; // default target
  });

  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState<number>(targetScore);

  const handleSaveGoal = (score: number) => {
    const validScore = Math.max(50, Math.min(100, score));
    setTargetScore(validScore);
    localStorage.setItem('ais_user_goal_score', validScore.toString());
    setIsEditing(false);
    if (onGoalUpdated) onGoalUpdated(validScore);
  };

  const progressPercent = targetScore > 0 ? Math.min(100, Math.round((currentScore / targetScore) * 100)) : 0;
  const remainingPercent = Math.max(0, targetScore - currentScore);
  const isGoalReached = currentScore >= targetScore && currentScore > 0;

  const PRESET_GOALS = [75, 80, 85, 90, 95];

  return (
    <div id="improvement-goal-card" className="glass p-6 rounded-3xl border border-white/10 space-y-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Target size={16} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Active Performance Goal</h3>
          </div>
          <p className="text-xs text-gray-400">
            Set custom readiness benchmarks to guide your mock interview sprints.
          </p>
        </div>

        <button
          id="customize-goal-btn"
          onClick={() => {
            setCustomInput(targetScore);
            setIsEditing(!isEditing);
          }}
          className="self-start sm:self-auto px-3 py-1.5 glass rounded-xl border border-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 hover:bg-white/5 transition-colors"
        >
          <Edit3 size={13} className="text-blue-400" />
          <span>{isEditing ? 'Cancel Edit' : 'Adjust Target'}</span>
        </button>
      </div>

      {/* Goal Target Selector if editing */}
      {isEditing && (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Select Benchmark Target:</span>
            <span className="text-xs text-blue-400 font-semibold">{customInput}% Target</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full">
            {PRESET_GOALS.map(score => (
              <button
                key={score}
                onClick={() => {
                  setCustomInput(score);
                  handleSaveGoal(score);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  targetScore === score
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                    : 'glass border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Reach {score}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Goal Stats Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 w-full">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 w-full">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Current Score</span>
          <div className="text-2xl font-black text-white">{currentScore > 0 ? `${currentScore}%` : '--'}</div>
          <span className="text-[11px] text-gray-400 block">Current average</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Target Goal</span>
          <div className="text-2xl font-black text-blue-400">{targetScore}%</div>
          <span className="text-[11px] text-gray-400 block">Target readiness</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Goal Progress</span>
          <div className="text-2xl font-black text-indigo-400">{progressPercent}%</div>
          <span className="text-[11px] text-gray-400 block">Relative fulfillment</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Remaining Gap</span>
          <div className="text-2xl font-black text-emerald-400">
            {isGoalReached ? '0%' : `${remainingPercent}%`}
          </div>
          <span className="text-[11px] text-gray-400 block">
            {isGoalReached ? 'Goal achieved!' : 'To target milestone'}
          </span>
        </div>
      </div>

      {/* Visual Goal Progress Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-300">
            {isGoalReached ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Target of {targetScore}% successfully reached!
              </span>
            ) : (
              `Progress towards ${targetScore}% target: ${progressPercent}%`
            )}
          </span>
          <span className="text-gray-400 text-[11px]">
            {isGoalReached ? 'Set a higher target to continue leveling up' : `${remainingPercent}% points needed`}
          </span>
        </div>

        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isGoalReached 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-500'
            }`}
            style={{ width: `${Math.max(3, progressPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
