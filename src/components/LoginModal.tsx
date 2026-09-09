import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Lock, ArrowRight, Check, Sparkles, LogOut } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  onLogin: (name: string) => void;
  onLogout: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
      onClose();
    } else if (email.trim()) {
      onLogin(email.split('@')[0]);
      onClose();
    } else {
      onLogin('Alex Rivers');
      onClose();
    }
  };

  const handleDemoLogin = (demoName: string) => {
    onLogin(demoName);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass border border-white/20 p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] max-w-md w-full shadow-2xl relative max-h-[92vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {currentUser ? 'Candidate Profile' : 'Candidate Sign In'}
                </h3>
                <p className="text-xs text-gray-400">
                  {currentUser ? 'Manage your test profile' : 'Save your interview history and metrics'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {currentUser ? (
            <div className="py-6 space-y-6">
              <div className="p-5 glass rounded-2xl border border-blue-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-black text-lg">
                    {currentUser.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{currentUser}</h4>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> Active Candidate Account
                    </p>
                  </div>
                </div>
                <div className="pt-2 text-xs text-gray-400">
                  Your interview performances are synced locally. Take tests to build your feedback dossier.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex-1 py-3 glass hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-red-500/20"
                >
                  <LogOut size={16} /> Sign Out
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              {/* Demo 1-click accounts */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Quick Demo Access
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('Alex Rivers (Frontend Pro)')}
                    className="p-3 text-left glass rounded-xl hover:border-blue-500/40 hover:bg-white/5 transition-all text-xs font-semibold"
                  >
                    <div className="font-bold text-white">Alex Rivers</div>
                    <div className="text-[10px] text-gray-400">Senior Frontend</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('Jordan Chen (Fullstack)')}
                    className="p-3 text-left glass rounded-xl hover:border-blue-500/40 hover:bg-white/5 transition-all text-xs font-semibold"
                  >
                    <div className="font-bold text-white">Jordan Chen</div>
                    <div className="text-[10px] text-gray-400">Fullstack Engineer</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-[1px] bg-white/10 flex-grow" />
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-mono">
                  Or enter your name
                </span>
                <div className="h-[1px] bg-white/10 flex-grow" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full glass pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Email Address (optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="maya@example.com"
                      className="w-full glass pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                >
                  Continue as Candidate <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
