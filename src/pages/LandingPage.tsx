import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Code, Zap, Shield, ChevronRight, Play, Sparkles, Terminal, History, ArrowRight, Award, Cpu, Mic, FileCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import DemoModal from '../components/DemoModal';
import { useInterview } from '../InterviewContext';
import { Role, Difficulty } from '../types';

export default function LandingPage() {
  const navigate = useNavigate();
  const { startNewSession } = useInterview();
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);

  const handleStart = (role: Role, difficulty: Difficulty) => {
    const newSession = startNewSession(role, difficulty);
    if (newSession) {
      navigate('/interview');
    }
  };

  const scrollToTracks = () => {
    const el = document.getElementById('tracks');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const techBadges = [
    { name: 'BrowserAI', role: 'frontend' as Role, desc: 'Client-side heuristics & instant lexical evaluation' },
    { name: 'SpeechNode', role: 'react' as Role, desc: 'Real-time Web Speech API voice recognition' },
    { name: 'LogicCore', role: 'fullstack' as Role, desc: 'Algorithmic reasoning & architectural evaluation' },
    { name: 'HackHub', role: 'frontend' as Role, desc: 'Curated technical & behavioral question bank' }
  ];

  return (
    <div className="relative overflow-hidden pt-24 pb-20 px-6 min-h-screen flex flex-col justify-between">
      <Navbar />

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[520px] bg-blue-600/10 blur-[130px] rounded-full -z-10 pointer-events-none" />

      <main className="max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={scrollToTracks}
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-blue-400 mb-4 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group"
          >
            <Zap size={14} className="fill-current text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Interactive Voice & Coding Simulation</span>
            <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight"
          >
            Master the <span className="gradient-text">Interview</span> <br />
            with Simulation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 font-medium leading-relaxed"
          >
            An intelligent platform to sharpen your technical and behavioral skills.
            Real-time voice analysis, dynamic questions, coding challenges, and comprehensive feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={scrollToTracks}
              className="w-full sm:w-auto bg-blue-600 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-98"
            >
              Get Started for Free <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto glass px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-98 border border-white/10"
            >
              <Play size={20} className="fill-white" /> Watch Demo
            </button>
          </motion.div>
        </div>

        {/* ATS Resume Checker Callout Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-20 glass p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-blue-950/20 to-black relative overflow-hidden shadow-2xl"
        >
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <FileCheck size={14} /> New: AI ATS Resume Scanner
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Benchmark & Optimize Your Resume for 100/100 ATS Compatibility
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Scan your resume against Workday, Greenhouse & Lever ATS algorithms. Get your objective ATS score, tailored keyword gaps for your target role, bullet-by-bullet rewrites, what to add, and what to remove.
              </p>
            </div>
            <Link
              to="/resume"
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-98 whitespace-nowrap cursor-pointer"
            >
              <span>Scan Resume Free</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Tracks Section */}
        <div id="tracks" className="scroll-mt-28 mb-24">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 text-center sm:text-left">
            <div>
              <h2 className="text-3xl font-black">Choose Your Track</h2>
              <p className="text-gray-400 text-sm font-medium">
                Each round draws a unique, randomized mix of technical and behavioral challenges.
              </p>
            </div>
            <Link
              to="/coding"
              className="glass px-4 py-2 rounded-xl text-sm font-bold text-blue-400 hover:text-white hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <Terminal size={16} /> Jump to Live Coding Round
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Frontend Track */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 glass rounded-3xl space-y-6 relative group border border-white/10 hover:border-blue-500/40 transition-all"
            >
              <div className="p-4 bg-blue-500/10 rounded-2xl w-fit text-blue-500 group-hover:bg-blue-500 transition-colors group-hover:text-white">
                <Code size={32} />
              </div>
              <h3 className="text-2xl font-bold">Frontend Mastery</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Browser rendering pipelines, closures, box model, asynchronous operations, and critical performance.
              </p>
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => handleStart('frontend', 'beginner')}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-between px-4"
                >
                  <span>Start Beginner</span>
                  <span className="text-gray-400 font-mono text-[11px]">Core JS/CSS</span>
                </button>
                <button
                  onClick={() => handleStart('frontend', 'intermediate')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold transition-all flex items-center justify-between px-4 shadow-md shadow-blue-600/20"
                >
                  <span>Start Intermediate</span>
                  <span className="text-blue-200 font-mono text-[11px]">Browser & DOM</span>
                </button>
                <button
                  onClick={() => handleStart('frontend', 'advanced')}
                  className="w-full py-2.5 rounded-xl border border-blue-500/40 hover:bg-blue-500/20 text-xs font-bold text-blue-300 transition-all flex items-center justify-between px-4"
                >
                  <span>Start Advanced</span>
                  <span className="text-blue-300 font-mono text-[11px]">Micro-Frontends</span>
                </button>
              </div>
            </motion.div>

            {/* React Track */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 glass rounded-3xl space-y-6 relative group border border-purple-500/40 shadow-lg shadow-purple-500/5 hover:border-purple-500/70 transition-all"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-[10px] font-black uppercase px-3.5 py-1 rounded-full tracking-wider shadow-md">
                Most Popular
              </div>
              <div className="p-4 bg-purple-500/10 rounded-2xl w-fit text-purple-400 group-hover:bg-purple-600 transition-colors group-hover:text-white">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold">React Deep Dive</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Hooks lifecycle, Context API, state patterns, reconciliation, Server Components & Hydration errors.
              </p>
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => handleStart('react', 'beginner')}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-between px-4"
                >
                  <span>Start Beginner</span>
                  <span className="text-gray-400 font-mono text-[11px]">Virtual DOM</span>
                </button>
                <button
                  onClick={() => handleStart('react', 'intermediate')}
                  className="w-full py-2.5 rounded-xl border border-purple-500/40 hover:bg-purple-600/20 text-xs font-bold text-purple-200 transition-all flex items-center justify-between px-4"
                >
                  <span>Start Intermediate</span>
                  <span className="text-purple-300 font-mono text-[11px]">Hooks & Context</span>
                </button>
                <button
                  onClick={() => handleStart('react', 'advanced')}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-between px-4"
                >
                  <span>Start Advanced</span>
                  <span className="text-purple-200 font-mono text-[11px]">RSC & Profiler</span>
                </button>
              </div>
            </motion.div>

            {/* Full Stack Track */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 glass rounded-3xl space-y-6 relative group border border-white/10 hover:border-emerald-500/40 transition-all"
            >
              <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit text-emerald-400 group-hover:bg-emerald-600 transition-colors group-hover:text-white">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-bold">Full Stack Pro</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Distributed transactions, SQL/NoSQL schemas, microservices Sagas, JWT tokens, and DB isolation.
              </p>
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => handleStart('fullstack', 'beginner')}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-between px-4"
                >
                  <span>Start Beginner</span>
                  <span className="text-gray-400 font-mono text-[11px]">SQL vs NoSQL</span>
                </button>
                <button
                  onClick={() => handleStart('fullstack', 'intermediate')}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-between px-4"
                >
                  <span>Start Intermediate</span>
                  <span className="text-gray-400 font-mono text-[11px]">JWT & ORMs</span>
                </button>
                <button
                  onClick={() => handleStart('fullstack', 'advanced')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-between px-4"
                >
                  <span>Start Advanced</span>
                  <span className="text-emerald-200 font-mono text-[11px]">Sagas & Caching</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Clickable Tech Badges / Feature Tags */}
        <div className="space-y-4 mb-24">
          <div className="text-center text-xs font-mono text-gray-500 uppercase tracking-widest">
            Powered by Modern Web Technologies
          </div>
          <div className="glass p-6 rounded-[32px] border border-white/10 flex flex-wrap items-center justify-around gap-4">
            {techBadges.map(badge => (
              <button
                key={badge.name}
                onClick={() => {
                  setActiveBadge(activeBadge === badge.name ? null : badge.name);
                  handleStart(badge.role, 'intermediate');
                }}
                className="group p-3 rounded-2xl hover:bg-white/5 transition-all text-center flex flex-col items-center"
              >
                <span className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-gray-400 group-hover:text-blue-400 transition-colors">
                  {badge.name}
                </span>
                <span className="text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors mt-1 font-medium">
                  {badge.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="pt-12 pb-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase italic">AI Interview Sim</span>
            <span>• Practice with browser voice synthesis & heuristics</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={scrollToTracks} className="hover:text-white transition-colors">
              Tracks
            </button>
            <Link to="/coding" className="hover:text-white transition-colors">
              Coding Round
            </Link>
            <Link to="/resume" className="hover:text-white transition-colors text-emerald-400">
              Resume Checker
            </Link>
            <Link to="/history" className="hover:text-white transition-colors">
              History
            </Link>
            <button onClick={() => setDemoOpen(true)} className="hover:text-white transition-colors">
              Demo
            </button>
          </div>
        </footer>
      </main>

      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
