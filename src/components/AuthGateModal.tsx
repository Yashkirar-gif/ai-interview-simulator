import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Sparkles, CheckCircle2, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useInterview } from '../InterviewContext';

export default function AuthGateModal() {
  const { authGateOpen, setAuthGateOpen, loginUser, deviceStats } = useInterview();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authGateOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await loginUser(name.trim(), email.trim() || undefined);
    setLoading(false);
    setAuthGateOpen(false);
  };

  const handleQuickCandidate = async (candidateName: string, candidateEmail: string) => {
    setLoading(true);
    await loginUser(candidateName, candidateEmail);
    setLoading(false);
    setAuthGateOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass border border-blue-500/30 p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] max-w-lg w-full shadow-2xl relative max-h-[92vh] overflow-y-auto"
        >
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => setAuthGateOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Lock size={13} /> 1 Free Guest Test Completed
              </div>
              <h3 className="text-2xl font-black text-white">
                Sign In to Continue <span className="text-blue-500">Practicing</span>
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                You've completed your 1 free mock interview on this device. Sign in or register in seconds to unlock unlimited simulations, personalized AI analysis, and full portfolio audit tracking.
              </p>
            </div>

            {/* Benefits badge */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-400" /> Account Privileges Unlocked
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Unlimited Interview Rounds
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Full Stack Dossier History
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Advanced Coding Challenges
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> Instant Resume Export
                </div>
              </div>
            </div>

            {/* 1-Click Candidate Accounts */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                1-Click Quick Candidate Sign In
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickCandidate('Alex Rivers', 'alex.rivers@techdev.io')}
                  className="p-3 text-left glass rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-xs group"
                >
                  <div className="font-bold text-white group-hover:text-blue-400">Alex Rivers</div>
                  <div className="text-[10px] text-gray-400">alex.rivers@techdev.io</div>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickCandidate('Jordan Chen', 'jordan.chen@cloudstack.net')}
                  className="p-3 text-left glass rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-xs group"
                >
                  <div className="font-bold text-white group-hover:text-blue-400">Jordan Chen</div>
                  <div className="text-[10px] text-gray-400">jordan.chen@cloudstack.net</div>
                </button>
              </div>
            </div>

            {/* Custom Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full glass pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Email Address (for portfolio link)</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full glass px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
              >
                <Sparkles size={16} />
                {loading ? 'Creating Candidate Session...' : 'Sign In & Start Unlimited Tests'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
