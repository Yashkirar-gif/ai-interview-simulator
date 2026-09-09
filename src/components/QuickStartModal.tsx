import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Code, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Role, Difficulty } from '../types';
import { useInterview } from '../InterviewContext';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickStartModal({ isOpen, onClose }: QuickStartModalProps) {
  const navigate = useNavigate();
  const { startNewSession } = useInterview();
  const [role, setRole] = useState<Role>('frontend');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');

  if (!isOpen) return null;

  const handleLaunch = () => {
    const newSession = startNewSession(role, difficulty);
    onClose();
    if (newSession) {
      navigate('/interview');
    }
  };

  const roles = [
    {
      id: 'frontend' as Role,
      title: 'Frontend Mastery',
      icon: Code,
      desc: 'Browser architecture, JS closures, CSS layouts, and modern web APIs.'
    },
    {
      id: 'react' as Role,
      title: 'React Deep Dive',
      icon: Zap,
      desc: 'Hooks, state architecture, Virtual DOM, reconciliation & rendering.'
    },
    {
      id: 'fullstack' as Role,
      title: 'Full Stack Pro',
      icon: Shield,
      desc: 'System architecture, API contracts, databases, and microservices.'
    }
  ];

  const difficulties: { id: Difficulty; label: string; tag: string }[] = [
    { id: 'beginner', label: 'Beginner', tag: 'Core fundamentals & definitions' },
    { id: 'intermediate', label: 'Intermediate', tag: 'Practical problem solving & trade-offs' },
    { id: 'advanced', label: 'Advanced', tag: 'System scaling, internals & leadership' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass border border-white/20 p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] max-w-xl w-full shadow-2xl relative max-h-[92vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Quick Start Interview</h3>
                <p className="text-xs text-gray-400">Select your specialization and challenge tier</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="py-6 space-y-6">
            {/* Role picker */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                1. Choose Specialization
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {roles.map(r => {
                  const Icon = r.icon;
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'glass border-white/10 text-gray-300 hover:border-white/25 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={20} className={isSelected ? 'text-blue-400 mb-2' : 'text-gray-400 mb-2'} />
                      <div className="font-bold text-sm leading-tight">{r.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty picker */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                2. Choose Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {difficulties.map(d => {
                  const isSelected = difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-white text-black font-bold border-white shadow-lg shadow-white/20'
                          : 'glass border-white/10 text-gray-300 hover:border-white/25 hover:bg-white/5 font-semibold text-sm'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions note */}
            <div className="p-3.5 glass rounded-xl border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
              <span>Each session draws fresh randomized technical & behavioral questions</span>
              <span className="font-mono bg-blue-500/20 px-2 py-0.5 rounded text-[11px] font-bold">3 Questions</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 glass hover:bg-white/5 text-sm font-bold text-gray-300 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLaunch}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
            >
              Start Session Now <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
