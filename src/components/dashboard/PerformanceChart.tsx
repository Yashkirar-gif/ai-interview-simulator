import { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity, ArrowUpRight } from 'lucide-react';
import { InterviewSession } from '../../types';
import { useTheme } from '../../ThemeContext';
import { classifyInterviewType } from '../../utils/progressCalculator';

interface PerformanceChartProps {
  sessions: InterviewSession[];
  scoreTrend: 'improving' | 'declining' | 'stable';
  scoreDelta: number;
}

export default function PerformanceChart({ sessions, scoreTrend, scoreDelta }: PerformanceChartProps) {
  const { isDark } = useTheme();

  // Prepare chronological chart data
  const chartData = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    const sorted = [...sessions].sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

    return sorted.map((s, idx) => {
      const date = new Date(s.endTime || s.startTime);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const type = classifyInterviewType(s);

      return {
        id: s.id,
        round: `#${idx + 1}`,
        dateStr: formattedDate,
        fullTime: `${formattedDate} • ${timeStr}`,
        score: s.score ?? 0,
        role: s.role,
        difficulty: s.difficulty,
        type: type.toUpperCase(),
        questionsCount: s.responses?.length || s.questions?.length || 0
      };
    });
  }, [sessions]);

  const averageScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(chartData.reduce((acc, d) => acc + d.score, 0) / chartData.length);
  }, [chartData]);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass p-3.5 rounded-xl border border-white/20 shadow-2xl space-y-1.5 w-48 max-w-[calc(100vw-3rem)] sm:max-w-xs">
          <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-white/10 pb-1">
            <span>{data.fullTime}</span>
            <span className="font-semibold text-blue-400">{data.round}</span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs text-gray-300">Score:</span>
            <span className="text-base font-black text-white">{data.score}%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Type:</span>
            <span className="font-medium text-emerald-400">{data.type}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Role:</span>
            <span className="font-medium capitalize text-gray-300">{data.role} ({data.difficulty})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#9CA3AF' : '#4B5563';

  return (
    <div id="performance-chart-section" className="glass p-6 rounded-3xl border border-white/10 space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity size={16} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Performance Over Time</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Tracking individual interview evaluation scores chronologically.
          </p>
        </div>

        {/* Trend Indicator Badge */}
        <div className="flex items-center gap-2">
          {scoreTrend === 'improving' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <TrendingUp size={14} />
              <span>Trending Upward (+{scoreDelta}%)</span>
            </div>
          ) : scoreTrend === 'declining' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
              <TrendingDown size={14} />
              <span>Trending Downward ({scoreDelta}%)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Minus size={14} />
              <span>Consistent Trajectory</span>
            </div>
          )}

          {averageScore > 0 && (
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold">
              <span>Avg: {averageScore}%</span>
            </div>
          )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl w-full">
          <Activity size={28} className="text-gray-500 mb-2" />
          <p className="text-sm font-semibold text-gray-300">No interview data in this period</p>
          <p className="text-xs text-gray-500 mt-1">Complete a practice session to start charting your score trajectory.</p>
        </div>
      ) : chartData.length === 1 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl space-y-3 w-full">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">First Session Recorded: {chartData[0].score}%</p>
            <p className="text-xs text-gray-400 mt-1 w-full max-w-sm mx-auto">
              Complete at least 2 interview sessions to render the full interactive trend line graph.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreLineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis 
                dataKey="dateStr" 
                stroke={textColor} 
                tick={{ fill: textColor, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 25, 50, 75, 100]}
                stroke={textColor} 
                tick={{ fill: textColor, fontSize: 11 }}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              {averageScore > 0 && (
                <ReferenceLine 
                  y={averageScore} 
                  stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)"} 
                  strokeDasharray="4 4" 
                />
              )}
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6', stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#60a5fa', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
