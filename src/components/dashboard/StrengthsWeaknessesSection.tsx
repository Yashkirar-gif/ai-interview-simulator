import { CheckCircle2, AlertTriangle, ArrowUpRight, Lightbulb, Sparkles } from 'lucide-react';
import { EvaluatedInsight } from '../../types';

interface StrengthsWeaknessesSectionProps {
  strengths: EvaluatedInsight[];
  weaknesses: EvaluatedInsight[];
}

export default function StrengthsWeaknessesSection({
  strengths,
  weaknesses
}: StrengthsWeaknessesSectionProps) {
  return (
    <div id="strengths-weaknesses-section" className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Strengths Card */}
      <div className="glass p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between w-full">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={16} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Observed Strengths</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Evaluated
            </span>
          </div>

          <p className="text-xs text-gray-400">
            Competencies where you consistently exceed baseline performance thresholds.
          </p>

          <div className="space-y-3 pt-2">
            {strengths.map((str, idx) => (
              <div
                key={str.id || idx}
                id={`strength-item-${idx}`}
                className="glass p-3.5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all space-y-1 w-full"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-400 flex-shrink-0" />
                    {str.title}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {str.scoreImpact}% avg
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 pl-4 leading-relaxed">
                  {str.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
          <span>Derived from verbal & technical evaluations</span>
          <span className="text-emerald-400 font-semibold">Keep leaning into these</span>
        </div>
      </div>

      {/* Needs Improvement Card */}
      <div className="glass p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between w-full">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle size={16} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Areas to Strengthen</h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              High ROI
            </span>
          </div>

          <p className="text-xs text-gray-400">
            Targeted adjustments that will unlock immediate score improvements.
          </p>

          <div className="space-y-3 pt-2">
            {weaknesses.map((weak, idx) => (
              <div
                key={weak.id || idx}
                id={`weakness-item-${idx}`}
                className="glass p-3.5 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all space-y-1 w-full"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lightbulb size={13} className="text-amber-400 flex-shrink-0" />
                    {weak.title}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Focus Area
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 pl-4 leading-relaxed">
                  {weak.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
          <span>Actionable feedback engine</span>
          <span className="text-amber-400 font-semibold">Priority for next session</span>
        </div>
      </div>
    </div>
  );
}
