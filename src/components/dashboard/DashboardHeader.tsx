import { Sparkles, Calendar, TrendingUp, RotateCcw } from 'lucide-react';
import { ProgressFilter } from '../../types';

interface DashboardHeaderProps {
  filter: ProgressFilter;
  onFilterChange: (filter: ProgressFilter) => void;
  onStartNew: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const FILTER_OPTIONS: { id: ProgressFilter; label: string }[] = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '3m', label: 'Last 3 Months' },
  { id: 'all', label: 'All Time' },
];

export default function DashboardHeader({
  filter,
  onFilterChange,
  onStartNew,
  onRefresh,
  isRefreshing
}: DashboardHeaderProps) {
  return (
    <div id="dashboard-header" className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
      <div className="space-y-2 w-full md:max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 glass rounded-full text-xs font-bold text-blue-400 border border-blue-500/20 uppercase tracking-widest">
          <TrendingUp size={13} className="text-blue-400" /> Performance Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Interview <span className="text-blue-500">Progress</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base font-medium w-full max-w-xl">
          Track your performance and improve your interview skills.
        </p>
      </div>

      <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Date / Filter Selector */}
        <div 
          id="dashboard-date-filter" 
          className="w-full sm:w-auto max-w-full overflow-x-auto glass p-1 rounded-2xl border border-white/10 flex items-center gap-1 shadow-inner scrollbar-none"
        >
          {FILTER_OPTIONS.map(opt => {
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                id={`filter-btn-${opt.id}`}
                onClick={() => onFilterChange(opt.id)}
                className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            id="refresh-stats-btn"
            onClick={onRefresh}
            title="Refresh metrics"
            disabled={isRefreshing}
            className="p-2.5 glass rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <RotateCcw size={15} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
          </button>
          <button
            id="header-start-interview-btn"
            onClick={onStartNew}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Sparkles size={14} /> Start New Test
          </button>
        </div>
      </div>
    </div>
  );
}
