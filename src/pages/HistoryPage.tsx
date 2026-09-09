import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  History, 
  Calendar, 
  Award, 
  ChevronRight, 
  Search, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Laptop, 
  Eye, 
  CheckCircle2, 
  User, 
  Lock,
  Clock,
  FileText
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthGateModal from '../components/AuthGateModal';
import { useInterview } from '../InterviewContext';
import { InterviewSession, Role } from '../types';
import { downloadInterviewPDFReport } from '../utils/pdfGenerator';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, setSession, clearHistory, deviceStats, currentUser, promptAuthGate } = useInterview();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.questions.some(q => q.text.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || item.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleViewReport = (sessionItem: InterviewSession) => {
    setSession(sessionItem);
    navigate('/results');
  };

  const getRoleName = (role: Role) => {
    switch (role) {
      case 'frontend': return 'Frontend Mastery';
      case 'react': return 'React Deep Dive';
      case 'fullstack': return 'Full Stack Pro';
      default: return role;
    }
  };

  const calculateAverageScore = (sessionItem: InterviewSession) => {
    if (!sessionItem.responses || sessionItem.responses.length === 0) return 0;
    const total = sessionItem.responses.reduce((sum, r) => sum + (r.analysis?.score || 0), 0);
    return Math.round(total / sessionItem.responses.length);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 max-w-5xl mx-auto space-y-8">
      <Navbar />
      <AuthGateModal />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 glass rounded-full text-xs font-bold text-blue-400 border border-blue-500/20 uppercase tracking-widest">
            <History size={13} /> Device & Performance Log
          </div>
          <h1 className="text-4xl font-black">Interview <span className="text-blue-500">History</span></h1>
          <p className="text-gray-400 font-medium text-sm">
            Private test logs for this device and candidate account.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
          >
            <Sparkles size={14} /> Start New Test
          </Link>
          {history.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    clearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-2 rounded-xl glass hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors border border-white/10"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-3.5 py-2.5 rounded-xl glass hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs font-bold transition-colors border border-white/10 flex items-center gap-1.5"
                title="Clear interview history for this device"
              >
                <Trash2 size={14} /> Clear Device History
              </button>
            )
          )}
        </div>
      </div>

      {/* Device & Account Telemetry Banner */}
      <div className="glass p-5 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
            <Laptop size={22} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                Device Fingerprint
              </span>
              <span className="text-xs font-mono text-blue-400 font-bold">
                {deviceStats.deviceId}
              </span>
            </div>
            <div className="text-sm font-semibold text-white flex items-center gap-3 flex-wrap">
              <span>Visits from this device: <strong className="text-emerald-400">{deviceStats.visitCount} times</strong></span>
              <span className="text-gray-500">•</span>
              <span>Tests completed: <strong className="text-blue-400">{deviceStats.testsTaken} tests</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl border border-blue-500/30 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">{currentUser.name}</span>
              <span className="text-gray-400">(Registered)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                <Lock size={12} /> Guest Mode
              </span>
              <button
                onClick={promptAuthGate}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Sign In for Unlimited
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions, track, or difficulty..."
            className="w-full glass pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 border border-white/10"
          />
        </div>

        <div className="flex items-center gap-1.5 glass p-1 rounded-xl border border-white/10 text-xs font-semibold">
          {['all', 'frontend', 'react', 'fullstack'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                roleFilter === r ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Tracks' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((sessionItem, i) => {
            const avgScore = calculateAverageScore(sessionItem);
            const dateStr = new Date(sessionItem.endTime || sessionItem.startTime).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <motion.div 
                key={sessionItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleViewReport(sessionItem)}
                className="glass p-6 rounded-[28px] flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-blue-500/40 transition-all cursor-pointer border border-white/10 shadow-lg shadow-black/10"
              >
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    <History size={26} />
                  </div>
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {getRoleName(sessionItem.role)}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 text-[10px] font-black uppercase font-mono">
                        {sessionItem.difficulty}
                      </span>
                      {sessionItem.isGuest ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                          1st Free Test
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                          Candidate Test
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} /> {dateStr}
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <Award size={13} /> Score: {avgScore}%
                      </span>
                      <span className="text-gray-500">
                        {sessionItem.responses.length} answered
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadInterviewPDFReport(sessionItem);
                    }}
                    title="Download Performance Summary PDF"
                    className="glass px-3.5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-white/10 flex items-center gap-1.5 text-gray-300"
                  >
                    <FileText size={14} /> PDF
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewReport(sessionItem);
                    }}
                    className="glass px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-all border border-white/10 text-white"
                  >
                    View Report
                  </button>
                  <div className="p-2.5 glass rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all border border-white/10">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-16 glass rounded-[32px] border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <History size={32} className="text-gray-500" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg">No sessions recorded on this device</h4>
              <p className="text-xs text-gray-400 max-w-sm">
                {searchQuery || roleFilter !== 'all' 
                  ? 'Try adjusting your search terms or filter.' 
                  : 'Start your first test simulation to begin building your private performance record.'}
              </p>
            </div>
            <Link
              to="/"
              className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all flex items-center gap-2"
            >
              Launch 1st Free Test <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
