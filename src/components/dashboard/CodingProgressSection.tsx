import { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  BarChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Code2, 
  Terminal, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Bug, 
  ArrowRight, 
  Filter, 
  Sparkles,
  RotateCcw,
  Zap,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CodingAttempt } from '../../types';
import { getCodingAttempts } from '../../utils/codingTracker';
import { useTheme } from '../../ThemeContext';

interface CodingProgressSectionProps {
  deviceId?: string;
  onOpenCoding?: () => void;
}

export default function CodingProgressSection({ deviceId, onOpenCoding }: CodingProgressSectionProps) {
  const { isDark } = useTheme();
  const [attempts, setAttempts] = useState<CodingAttempt[]>(() => getCodingAttempts(deviceId));
  const [selectedProblem, setSelectedProblem] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'timeline' | 'problems' | 'distribution'>('timeline');

  // Listen to new attempts saved from the CodingPage in real-time
  useEffect(() => {
    const handleAttemptSaved = () => {
      setAttempts(getCodingAttempts(deviceId));
    };

    window.addEventListener('ais_coding_attempt_saved', handleAttemptSaved);
    window.addEventListener('storage', handleAttemptSaved);

    return () => {
      window.removeEventListener('ais_coding_attempt_saved', handleAttemptSaved);
      window.removeEventListener('storage', handleAttemptSaved);
    };
  }, [deviceId]);

  // Unique problems available in the attempts log
  const uniqueProblems = useMemo(() => {
    const map = new Map<string, { id: number; title: string; category: string; difficulty: string }>();
    attempts.forEach(a => {
      if (!map.has(a.questionTitle)) {
        map.set(a.questionTitle, {
          id: a.questionId,
          title: a.questionTitle,
          category: a.category,
          difficulty: a.difficulty
        });
      }
    });
    return Array.from(map.values());
  }, [attempts]);

  // Filtered attempts based on user selection
  const filteredAttempts = useMemo(() => {
    return attempts.filter(a => {
      if (selectedProblem !== 'all' && a.questionTitle !== selectedProblem) return false;
      if (selectedDifficulty !== 'all' && a.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      return true;
    });
  }, [attempts, selectedProblem, selectedDifficulty]);

  // High-level statistics
  const metrics = useMemo(() => {
    if (filteredAttempts.length === 0) {
      return {
        totalAttempts: 0,
        solvedProblemsCount: 0,
        uniqueProblemsCount: 0,
        avgPassRate: 0,
        perfectRuns: 0,
        syntaxErrors: 0,
        firstVsLatestDelta: 0
      };
    }

    const total = filteredAttempts.length;
    const perfect = filteredAttempts.filter(a => a.allPassed).length;
    const syntax = filteredAttempts.filter(a => a.errorType === 'syntax').length;
    const avgPass = Math.round(filteredAttempts.reduce((acc, a) => acc + a.passRate, 0) / total);

    // Count problems that have at least 1 fully passed run
    const solvedSet = new Set<string>();
    const attemptedSet = new Set<string>();
    filteredAttempts.forEach(a => {
      attemptedSet.add(a.questionTitle);
      if (a.allPassed) solvedSet.add(a.questionTitle);
    });

    // Calculate progression delta (latest 3 attempts avg vs first 3 attempts avg)
    let delta = 0;
    if (total >= 2) {
      const firstChunk = filteredAttempts.slice(0, Math.min(3, Math.ceil(total / 2)));
      const latestChunk = filteredAttempts.slice(-Math.min(3, Math.ceil(total / 2)));
      const firstAvg = firstChunk.reduce((s, a) => s + a.passRate, 0) / firstChunk.length;
      const latestAvg = latestChunk.reduce((s, a) => s + a.passRate, 0) / latestChunk.length;
      delta = Math.round(latestAvg - firstAvg);
    }

    return {
      totalAttempts: total,
      solvedProblemsCount: solvedSet.size,
      uniqueProblemsCount: attemptedSet.size,
      avgPassRate: avgPass,
      perfectRuns: perfect,
      syntaxErrors: syntax,
      firstVsLatestDelta: delta
    };
  }, [filteredAttempts]);

  // Timeline chart data prepared chronologically
  const timelineData = useMemo(() => {
    return filteredAttempts.map((att, idx) => {
      const date = new Date(att.timestamp);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        attemptNumber: idx + 1,
        label: `Run #${idx + 1}`,
        dateStr,
        timeStr,
        passRate: att.passRate,
        passedTests: att.passedTests,
        totalTests: att.totalTests,
        questionTitle: att.questionTitle,
        difficulty: att.difficulty,
        category: att.category,
        allPassed: att.allPassed,
        errorType: att.errorType,
        errorMessage: att.errorMessage,
        codeLength: att.codeLength,
        durationMs: att.durationMs || 25
      };
    });
  }, [filteredAttempts]);

  // Problem-by-problem comparative data (First vs Best Pass Rate)
  const problemComparisonData = useMemo(() => {
    const grouped = new Map<string, {
      title: string;
      difficulty: string;
      attemptsCount: number;
      firstPassRate: number;
      bestPassRate: number;
      latestPassRate: number;
      isSolved: boolean;
    }>();

    attempts.forEach(a => {
      const existing = grouped.get(a.questionTitle);
      if (!existing) {
        grouped.set(a.questionTitle, {
          title: a.questionTitle,
          difficulty: a.difficulty,
          attemptsCount: 1,
          firstPassRate: a.passRate,
          bestPassRate: a.passRate,
          latestPassRate: a.passRate,
          isSolved: a.allPassed
        });
      } else {
        existing.attemptsCount += 1;
        existing.bestPassRate = Math.max(existing.bestPassRate, a.passRate);
        existing.latestPassRate = a.passRate;
        if (a.allPassed) existing.isSolved = true;
      }
    });

    return Array.from(grouped.values());
  }, [attempts]);

  // Error distribution data for Pie Chart
  const distributionData = useMemo(() => {
    let perfect = 0;
    let partial = 0;
    let assertion = 0;
    let syntax = 0;
    let runtime = 0;

    filteredAttempts.forEach(a => {
      if (a.allPassed) {
        perfect++;
      } else if (a.errorType === 'syntax') {
        syntax++;
      } else if (a.errorType === 'runtime') {
        runtime++;
      } else if (a.errorType === 'assertion') {
        assertion++;
      } else {
        partial++;
      }
    });

    const items = [
      { name: '100% All Passed', value: perfect, color: '#10b981' },
      { name: 'Assertion Error', value: assertion, color: '#f59e0b' },
      { name: 'Partial Test Pass', value: partial, color: '#3b82f6' },
      { name: 'Syntax Line Error', value: syntax, color: '#ef4444' },
      { name: 'Runtime Error', value: runtime, color: '#a855f7' }
    ];

    return items.filter(i => i.value > 0);
  }, [filteredAttempts]);

  // Theme styling tokens for recharts
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#9CA3AF' : '#4B5563';

  // Custom Tooltip for Timeline ComposedChart
  const CustomTimelineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass p-3.5 rounded-xl border border-white/20 shadow-2xl space-y-2 min-w-[240px] max-w-xs text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-white font-mono">{data.label}</span>
            <span className="text-gray-400 text-[11px]">{data.dateStr} • {data.timeStr}</span>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-white text-sm">{data.questionTitle}</div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-medium">
                {data.category}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 font-mono">
                {data.difficulty}
              </span>
            </div>
          </div>

          <div className="pt-1 space-y-1 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Pass Rate:</span>
              <span className={`font-black text-sm ${data.allPassed ? 'text-emerald-400' : data.passRate > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {data.passRate}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400">Test Cases:</span>
              <span className="font-mono text-white">{data.passedTests} / {data.totalTests} Passed</span>
            </div>

            {data.allPassed ? (
              <div className="flex items-center gap-1 text-emerald-400 font-semibold pt-1">
                <CheckCircle2 size={13} /> Full Success (All Cases Passed)
              </div>
            ) : data.errorMessage ? (
              <div className="mt-1 p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono leading-tight">
                {data.errorMessage}
              </div>
            ) : null}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Problem Comparison BarChart
  const CustomProblemTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass p-3 rounded-xl border border-white/20 shadow-2xl space-y-1.5 min-w-[210px] text-xs">
          <div className="font-bold text-white border-b border-white/10 pb-1">{data.title}</div>
          <div className="flex items-center justify-between text-gray-300">
            <span>First Run Pass Rate:</span>
            <span className="font-bold text-amber-400">{data.firstPassRate}%</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span>Best Run Pass Rate:</span>
            <span className="font-bold text-emerald-400">{data.bestPassRate}%</span>
          </div>
          <div className="flex items-center justify-between text-gray-300 text-[11px]">
            <span>Total Attempts:</span>
            <span className="font-mono text-blue-400">{data.attemptsCount} tries</span>
          </div>
          <div className="pt-1 text-[11px] font-semibold">
            {data.isSolved ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> Solved with 100% Pass
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle size={12} /> In Progress
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="coding-progress-section" className="glass p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6 w-full shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Live Coding Progress & Attempt Visualizer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  Recharts
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Visual representation of pass rates, test case completion, and debugging progression across consecutive coding runs.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/coding"
            onClick={onOpenCoding}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center gap-1.5 group"
          >
            <Terminal size={14} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Practice in Sandbox</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <div className="glass p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-medium text-gray-400 flex items-center justify-between">
            <span>Total Coding Attempts</span>
            <RotateCcw size={13} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalAttempts}</div>
          <div className="text-[10px] text-gray-400">Across all challenges</div>
        </div>

        <div className="glass p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-medium text-gray-400 flex items-center justify-between">
            <span>Problems Solved</span>
            <CheckCircle2 size={13} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {metrics.solvedProblemsCount}
            <span className="text-xs font-normal text-gray-400 ml-1">/ {metrics.uniqueProblemsCount} tried</span>
          </div>
          <div className="text-[10px] text-emerald-400/80">100% tests passed</div>
        </div>

        <div className="glass p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-medium text-gray-400 flex items-center justify-between">
            <span>Avg Test Pass Rate</span>
            <TrendingUp size={13} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{metrics.avgPassRate}%</div>
          <div className="text-[10px] text-cyan-400/80">
            {metrics.firstVsLatestDelta >= 0 ? `+${metrics.firstVsLatestDelta}% improvement` : `${metrics.firstVsLatestDelta}% delta`}
          </div>
        </div>

        <div className="glass p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-medium text-gray-400 flex items-center justify-between">
            <span>Full Success Runs</span>
            <Award size={13} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.perfectRuns}</div>
          <div className="text-[10px] text-amber-400/80">Zero syntax or assertion bugs</div>
        </div>
      </div>

      {/* Chart View Toggle & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Tab Selection */}
        <div className="flex items-center gap-1 p-1 rounded-xl glass border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp size={13} />
            <span>Progression Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'problems'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 size={13} />
            <span>Problem Comparison</span>
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'distribution'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Error & Test Breakdown</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Problem Selector */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Filter size={13} />
            <select
              value={selectedProblem}
              onChange={e => setSelectedProblem(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">All Challenges</option>
              {uniqueProblems.map(p => (
                <option key={p.title} value={p.title}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Main Recharts Visualizations */}
      <div className="w-full">
        {filteredAttempts.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 glass rounded-2xl border border-white/5 space-y-3">
            <Code2 size={36} className="text-gray-500 animate-pulse" />
            <div className="text-sm font-semibold text-gray-300">No attempts match the selected filter</div>
            <p className="text-xs text-gray-400 max-w-sm">Try choosing "All Challenges" or test your code in the sandbox to generate new attempt telemetry.</p>
            <button
              onClick={() => { setSelectedProblem('all'); setSelectedDifficulty('all'); }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-medium border border-blue-500/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {filteredAttempts.length > 0 && activeTab === 'timeline' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Pass Rate (%) across consecutive executions
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/40 inline-block ml-3" /> Tests Passed count
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> 100% Target line
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="codingPassRateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke={textColor} 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]} 
                    stroke={textColor} 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 4]} 
                    stroke={textColor} 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={val => `${val} tests`}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <ReferenceLine 
                    yAxisId="left"
                    y={100} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: '100% PASS', fill: '#10b981', fontSize: 10, position: 'right' }} 
                  />
                  {/* Test Count Bar */}
                  <Bar 
                    yAxisId="right"
                    dataKey="passedTests" 
                    fill="#3b82f6" 
                    opacity={0.35} 
                    radius={[4, 4, 0, 0]} 
                    barSize={18}
                  />
                  {/* Shaded Area for Pass Rate Progression */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="passRate"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#codingPassRateGrad)"
                  />
                  {/* Distinct Marker Line */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="passRate"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isAllPassed = payload.allPassed;
                      const hasSyntax = payload.errorType === 'syntax';
                      const fillColor = isAllPassed ? '#10b981' : hasSyntax ? '#ef4444' : '#f59e0b';

                      return (
                        <circle
                          key={`dot-${payload.attemptNumber}`}
                          cx={cx}
                          cy={cy}
                          r={isAllPassed ? 5 : 4}
                          fill={fillColor}
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          className="transition-transform hover:scale-125"
                        />
                      );
                    }}
                    activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {filteredAttempts.length > 0 && activeTab === 'problems' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>Learning curve: First Attempt Pass Rate vs Best Attempt Pass Rate per problem</span>
              <span className="text-gray-400 flex items-center gap-3">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded" /> First Run</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> Best Run</span>
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problemComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis 
                    dataKey="title" 
                    stroke={textColor} 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]} 
                    stroke={textColor} 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                  />
                  <Tooltip content={<CustomProblemTooltip />} />
                  <ReferenceLine y={100} stroke="#10b981" strokeDasharray="4 4" />
                  <Bar dataKey="firstPassRate" name="First Run %" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={22} />
                  <Bar dataKey="bestPassRate" name="Best Run %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {filteredAttempts.length > 0 && activeTab === 'distribution' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#0f172a' : '#ffffff'} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} runs`, name]}
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Error Diagnostics */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Outcome Frequency & Failure Diagnostics
              </h4>
              <div className="space-y-2">
                {distributionData.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-xl glass border border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-200 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white">{item.value}</span>
                      <span className="text-[11px] text-gray-400">
                        ({metrics.totalAttempts > 0 ? Math.round((item.value / metrics.totalAttempts) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Coding Attempt Feed */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span className="font-semibold text-gray-300">Recent Attempt Stream:</span>
          <span>Showing latest {Math.min(4, filteredAttempts.length)} runs</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {filteredAttempts.slice(-4).reverse().map((att) => (
            <div 
              key={att.id}
              className="p-3 rounded-xl glass border border-white/10 space-y-1.5 hover:border-white/20 transition-all text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate max-w-[130px]" title={att.questionTitle}>
                  {att.questionTitle}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  att.allPassed 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : att.errorType === 'syntax' 
                    ? 'bg-rose-500/20 text-rose-300' 
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {att.passRate}% Pass
                </span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>{att.passedTests}/{att.totalTests} tests passed</span>
                <span className="font-mono text-[10px]">{att.difficulty}</span>
              </div>
              {att.errorMessage && (
                <div className="text-[10px] text-rose-400/90 truncate font-mono" title={att.errorMessage}>
                  {att.errorMessage}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
