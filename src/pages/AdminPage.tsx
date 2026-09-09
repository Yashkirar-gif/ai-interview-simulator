import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  History, 
  Laptop, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  KeyRound, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Award, 
  Clock, 
  Calendar, 
  BarChart3, 
  Eye, 
  Trash2, 
  FileText, 
  ArrowLeft,
  X,
  Sparkles,
  Server
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../components/Navbar';
import { downloadInterviewPDFReport } from '../utils/pdfGenerator';

interface DeviceData {
  id: string;
  visitCount: number;
  firstSeen: string;
  lastSeen: string;
  userAgent: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  testsTaken: number;
  freeTestUsed: boolean;
}

interface TestData {
  id: string;
  deviceId: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  isGuest: boolean;
  role: string;
  difficulty: string;
  score: number;
  startTime: number;
  endTime: number;
  questions: any[];
  responses: any[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  role: string;
}

interface OverviewData {
  metrics: {
    totalUniqueDevices: number;
    totalVisits: number;
    totalTests: number;
    totalUsers: number;
    guestTests: number;
    registeredTests: number;
    avgScore: number;
    trackCounts: Record<string, number>;
    difficultyCounts: Record<string, number>;
  };
  devices: DeviceData[];
  sessions: TestData[];
  users: UserData[];
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string>(() => {
    return localStorage.getItem('ais_admin_key') || '';
  });
  const [inputKey, setInputKey] = useState('admin123');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);

  const [activeTab, setActiveTab] = useState<'tests' | 'devices' | 'users'>('tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Authenticate admin key
  const verifyKey = async (keyToVerify: string) => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: keyToVerify })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setAdminKey(keyToVerify);
        localStorage.setItem('ais_admin_key', keyToVerify);
        fetchOverview(keyToVerify);
      } else {
        setAuthError('Invalid Admin Key. Default key is "admin123".');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setAuthError('Server communication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { 'x-admin-key': key }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Session expired. Please re-enter Admin Key.');
      }
    } catch (err) {
      console.error('Fetch overview error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      verifyKey(adminKey);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey('');
    localStorage.removeItem('ais_admin_key');
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/session/${sessionId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });
      if (res.ok) {
        fetchOverview(adminKey);
        if (selectedTest?.id === sessionId) setSelectedTest(null);
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    } finally {
      setSessionToDelete(null);
    }
  };

  // Filtered Tests list
  const filteredSessions = useMemo(() => {
    if (!data) return [];
    return data.sessions.filter(s => {
      const matchesSearch = 
        s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || s.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [data, searchQuery, roleFilter]);

  // Filtered Devices list
  const filteredDevices = useMemo(() => {
    if (!data) return [];
    return data.devices.filter(d => {
      return (
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.userName && d.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.userEmail && d.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.userAgent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [data, searchQuery]);

  // Chart data preparation
  const trackChartData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.metrics.trackCounts).map(([name, count]) => ({
      name: name === 'frontend' ? 'Frontend' : name === 'react' ? 'React' : 'Full Stack',
      count
    }));
  }, [data]);

  const difficultyChartData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.metrics.difficultyCounts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count
    }));
  }, [data]);

  // If not authenticated, show passcode login card
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-6 max-w-lg mx-auto flex flex-col justify-center">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 sm:p-10 rounded-[36px] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
            <KeyRound size={32} />
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Server size={12} /> Full-Stack Express Engine
            </div>
            <h1 className="text-3xl font-black">Admin <span className="text-blue-500">Console</span></h1>
            <p className="text-gray-400 text-sm">
              Enter your administrator security key to view candidate visits, device telemetry, and test audit records.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} /> {authError}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); verifyKey(inputKey); }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Security Passcode</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="password"
                  value={inputKey}
                  onChange={e => setInputKey(e.target.value)}
                  placeholder="admin123"
                  className="w-full glass pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-white/10 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !inputKey}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              Authorize Dashboard Access
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 text-center">
            <button
              onClick={() => { setInputKey('admin123'); verifyKey('admin123'); }}
              className="text-xs text-blue-400 hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
            >
              <Sparkles size={13} /> Quick Access: Use Demo Passcode ('admin123')
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      <Navbar />

      {/* Admin Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry System
            </span>
            <span className="px-3 py-1 rounded-full glass border border-white/10 text-gray-300 text-xs font-mono">
              Full Stack API: /api/admin/overview
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Admin <span className="text-blue-500">Intelligence Portal</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Monitor unique candidate devices, inspect test submissions, and enforce the 1-free-test guest quota.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOverview(adminKey)}
            disabled={loading}
            className="px-4 py-2.5 glass hover:bg-white/10 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 text-gray-300 hover:text-white transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 glass hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-xl text-xs font-bold border border-white/10 transition-colors"
          >
            Sign Out Admin
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass p-5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Laptop size={14} className="text-blue-400" /> Unique Devices
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{data.metrics.totalUniqueDevices}</div>
            <div className="text-[11px] text-gray-500">Tracked via browser fingerprint</div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <History size={14} className="text-emerald-400" /> Total Visits
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{data.metrics.totalVisits}</div>
            <div className="text-[11px] text-gray-500">Total sessions loaded</div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText size={14} className="text-purple-400" /> Tests Taken
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400">{data.metrics.totalTests}</div>
            <div className="text-[11px] text-gray-500">Across all tracks</div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Users size={14} className="text-amber-400" /> Registered
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{data.metrics.totalUsers}</div>
            <div className="text-[11px] text-gray-500">{data.metrics.registeredTests} tests taken by users</div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle size={14} className="text-cyan-400" /> Guest 1st Tests
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">{data.metrics.guestTests}</div>
            <div className="text-[11px] text-gray-500">Free trials claimed</div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/10 space-y-1 shadow-lg">
            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Award size={14} className="text-rose-400" /> Average Score
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400">{data.metrics.avgScore}%</div>
            <div className="text-[11px] text-gray-500">Global performance</div>
          </div>
        </div>
      )}

      {/* Visual Analytics Row */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-[28px] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-400" /> Tests by Specialization Track
              </h3>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackChartData}>
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} 
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-6 rounded-[28px] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-emerald-400" /> Tests by Difficulty Tier
              </h3>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyChartData}>
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} 
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 glass p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'tests' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText size={14} /> Test Submissions ({data?.sessions.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'devices' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Laptop size={14} /> Devices & Visits ({data?.devices.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'users' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={14} /> Candidates ({data?.users.length || 0})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search candidate, device..."
                className="w-full glass pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 border border-white/10"
              />
            </div>

            {activeTab === 'tests' && (
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="glass px-3 py-2 rounded-xl text-xs text-gray-300 font-semibold border border-white/10 focus:outline-none"
              >
                <option value="all">All Tracks</option>
                <option value="frontend">Frontend</option>
                <option value="react">React</option>
                <option value="fullstack">Full Stack</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: Test Sessions List */}
        {activeTab === 'tests' && (
          <div className="glass rounded-[28px] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-5">Candidate / User</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Track & Level</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Device ID</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => {
                      const dateStr = new Date(session.endTime || session.startTime).toLocaleString();
                      return (
                        <tr key={session.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-bold text-white text-sm">{session.userName}</div>
                            <div className="text-gray-400 text-[11px] font-mono">{session.userEmail}</div>
                          </td>
                          <td className="py-4 px-4">
                            {session.isGuest ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 font-semibold text-[10px] border border-amber-500/20">
                                Guest (1 Free Test)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 font-semibold text-[10px] border border-blue-500/20">
                                <CheckCircle2 size={11} /> Registered Candidate
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-gray-200 capitalize">{session.role}</div>
                            <div className="text-[10px] font-mono text-gray-400 uppercase">{session.difficulty}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-mono font-bold text-sm ${
                              session.score >= 80 ? 'text-emerald-400' : session.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {session.score}%
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-gray-400">
                            {session.deviceId.slice(0, 16)}...
                          </td>
                          <td className="py-4 px-4 text-gray-400 text-[11px]">
                            {dateStr}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedTest(session)}
                                className="px-3 py-1.5 glass hover:bg-blue-600 hover:text-white rounded-lg text-gray-300 font-bold text-[11px] transition-all flex items-center gap-1 border border-white/10"
                              >
                                <Eye size={12} /> Audit Dossier
                              </button>
                              {sessionToDelete === session.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setSessionToDelete(null)}
                                    className="px-2 py-1 glass hover:bg-white/10 text-gray-400 rounded text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSessionToDelete(session.id)}
                                  className="p-1.5 glass hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors border border-white/10"
                                  title="Delete record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500 italic">
                        No test sessions match your current query or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Device & Visitor Telemetry */}
        {activeTab === 'devices' && (
          <div className="glass rounded-[28px] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-5">Device Identifier</th>
                    <th className="py-3.5 px-4">Visit Count</th>
                    <th className="py-3.5 px-4">Tests Taken</th>
                    <th className="py-3.5 px-4">Free Test Quota</th>
                    <th className="py-3.5 px-4">Associated Candidate</th>
                    <th className="py-3.5 px-4">First Seen</th>
                    <th className="py-3.5 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((device) => {
                      return (
                        <tr key={device.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-mono font-bold text-white flex items-center gap-2">
                              <Laptop size={14} className="text-blue-400 shrink-0" />
                              {device.id}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate max-w-xs" title={device.userAgent}>
                              {device.userAgent}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold font-mono text-xs border border-blue-500/20">
                              {device.visitCount} visits
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-gray-200">
                            {device.testsTaken} tests
                          </td>
                          <td className="py-4 px-4">
                            {device.freeTestUsed ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold text-[10px] border border-red-500/20">
                                1st Free Test Claimed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                                Free Test Available
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {device.userName ? (
                              <div>
                                <div className="font-bold text-white">{device.userName}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{device.userEmail}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">Guest (Not Signed In)</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-400 text-[11px]">
                            {new Date(device.firstSeen).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-gray-400 text-[11px]">
                            {new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(device.lastSeen).toLocaleDateString()})
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500 italic">
                        No devices match your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Registered Candidates */}
        {activeTab === 'users' && (
          <div className="glass rounded-[28px] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-5">Candidate Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Candidate ID</th>
                    <th className="py-3.5 px-4">Registered Date</th>
                    <th className="py-3.5 px-4">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black">
                            {u.name.charAt(0)}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-300">{u.email}</td>
                      <td className="py-4 px-4 font-mono text-gray-500">{u.id}</td>
                      <td className="py-4 px-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-gray-400">{new Date(u.lastLogin).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Test Dossier Modal (Shows exact questions, transcripts & analysis for chosen test) */}
      <AnimatePresence>
        {selectedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass border border-white/20 p-6 sm:p-8 rounded-[36px] max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 sticky top-0 bg-[#050505]/80 backdrop-blur-md -mx-6 -mt-6 p-6 rounded-t-[36px] z-10">
                <div>
                  <div className="text-xs text-blue-400 font-bold uppercase tracking-widest font-mono">
                    Session Audit #{selectedTest.id}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedTest.userName} - {selectedTest.role.toUpperCase()} ({selectedTest.difficulty})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadInterviewPDFReport(selectedTest)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                    title="Export candidate dossier to PDF"
                  >
                    <FileText size={14} /> Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] uppercase font-mono text-gray-400">Score</div>
                  <div className="text-xl font-black text-emerald-400">{selectedTest.score}%</div>
                </div>
                <div className="glass p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] uppercase font-mono text-gray-400">Candidate Status</div>
                  <div className="text-xs font-bold text-white">
                    {selectedTest.isGuest ? 'Guest (1 Free Test)' : 'Registered User'}
                  </div>
                </div>
                <div className="glass p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] uppercase font-mono text-gray-400">Device ID</div>
                  <div className="text-xs font-mono text-gray-300 truncate" title={selectedTest.deviceId}>
                    {selectedTest.deviceId.slice(0, 12)}...
                  </div>
                </div>
                <div className="glass p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] uppercase font-mono text-gray-400">Completed</div>
                  <div className="text-xs font-medium text-gray-300">
                    {new Date(selectedTest.endTime || selectedTest.startTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Questions & Candidate Transcripts */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-300 uppercase tracking-wider">
                  Evaluated Question Dossiers ({selectedTest.responses.length})
                </h4>
                {selectedTest.responses.map((resp: any, i: number) => {
                  const q = selectedTest.questions[i] || { text: `Question ${i + 1}`, category: 'technical' };
                  return (
                    <div key={i} className="glass p-5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 font-mono">Q{i + 1} • {q.category}</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          Score: {resp.analysis?.score || 0}%
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{q.text}</p>
                      
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <div className="text-[10px] text-gray-400 uppercase font-mono">Candidate's Spoken Answer:</div>
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                          "{resp.transcript || 'No voice transcript recorded.'}"
                        </p>
                      </div>

                      {resp.analysis?.feedback && (
                        <div className="text-xs text-gray-400">
                          <span className="font-bold text-gray-300">AI Feedback: </span>
                          {resp.analysis.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedTest(null)}
                  className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
