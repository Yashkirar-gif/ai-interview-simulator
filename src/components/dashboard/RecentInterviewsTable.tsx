import { useState, useMemo } from 'react';
import { 
  History, 
  Calendar, 
  ExternalLink, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { InterviewSession, Role, InterviewType } from '../../types';
import { classifyInterviewType } from '../../utils/progressCalculator';

interface RecentInterviewsTableProps {
  sessions: InterviewSession[];
  onSelectSession: (session: InterviewSession) => void;
  onStartNew: () => void;
}

export default function RecentInterviewsTable({
  sessions,
  onSelectSession,
  onStartNew
}: RecentInterviewsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredAndSortedSessions = useMemo(() => {
    let list = sessions.filter(s => {
      const type = classifyInterviewType(s);
      const search = searchTerm.toLowerCase();
      return (
        s.role.toLowerCase().includes(search) ||
        s.difficulty.toLowerCase().includes(search) ||
        type.toLowerCase().includes(search)
      );
    });

    list.sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = a.score ?? 0;
        const scoreB = b.score ?? 0;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }
      const timeA = a.endTime || a.startTime || 0;
      const timeB = b.endTime || b.startTime || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [sessions, searchTerm, sortBy, sortOrder]);

  const getRoleDisplayName = (role: Role) => {
    switch (role) {
      case 'frontend': return 'Frontend Developer';
      case 'react': return 'React Specialist';
      case 'fullstack': return 'Full Stack Engineer';
      default: return role;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'beginner':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getScoreBadge = (score: number = 0) => {
    if (score >= 85) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (score >= 70) {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  const getTypeBadge = (type: InterviewType) => {
    switch (type) {
      case 'technical':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'behavioral':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'hr':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'coding':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div id="recent-interviews-section" className="glass p-6 rounded-3xl border border-white/10 space-y-5 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <History size={16} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Interviews</h3>
          </div>
          <p className="text-xs text-gray-400">
            Click any interview row to view detailed response feedback and analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px] max-w-sm flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="recent-interviews-search"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by role, type..."
              className="w-full pl-9 pr-3 py-1.5 glass rounded-xl text-xs border border-white/10 focus:border-blue-500 focus:outline-none text-white placeholder:text-gray-500"
            />
          </div>

          {/* Sort toggle */}
          <button
            id="sort-interviews-btn"
            onClick={() => {
              if (sortBy === 'date') {
                setSortBy('score');
                setSortOrder('desc');
              } else {
                setSortBy('date');
                setSortOrder('desc');
              }
            }}
            className="px-3 py-1.5 glass rounded-xl border border-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <ArrowUpDown size={13} className="text-blue-400" />
            <span>Sort: {sortBy === 'date' ? 'Date' : 'Score'}</span>
          </button>
        </div>
      </div>

      {filteredAndSortedSessions.length === 0 ? (
        <div className="py-12 text-center space-y-3 border border-dashed border-white/10 rounded-2xl w-full">
          <History size={28} className="mx-auto text-gray-500" />
          <p className="text-sm font-semibold text-gray-300">No matching interview sessions</p>
          <p className="text-xs text-gray-500 w-full max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search query.' : 'Complete an interview round to review full metrics.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onStartNew}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 w-full sm:w-auto"
            >
              Start an Interview
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Date</th>
                <th className="pb-3">Job Role</th>
                <th className="pb-3">Interview Type</th>
                <th className="pb-3">Difficulty</th>
                <th className="pb-3 text-center">Score</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedSessions.map(session => {
                const date = new Date(session.endTime || session.startTime);
                const dateFormatted = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const timeFormatted = date.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const type = classifyInterviewType(session);
                const score = session.score ?? 0;

                return (
                  <tr
                    key={session.id}
                    id={`interview-row-${session.id}`}
                    onClick={() => onSelectSession(session)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-gray-500" />
                        <div>
                          <span className="text-xs font-semibold text-white block">{dateFormatted}</span>
                          <span className="text-[10px] text-gray-400">{timeFormatted}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span className="text-xs font-bold text-white block">
                        {getRoleDisplayName(session.role)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {session.responses?.length || session.questions?.length || 0} questions answered
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border capitalize ${getTypeBadge(type)}`}>
                        {type}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border capitalize ${getDifficultyBadge(session.difficulty)}`}>
                        {session.difficulty}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black border ${getScoreBadge(score)}`}>
                        {score}%
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 size={11} /> Completed
                      </span>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                        View Report
                        <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
