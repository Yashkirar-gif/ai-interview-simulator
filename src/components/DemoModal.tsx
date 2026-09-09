import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, Volume2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../InterviewContext';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const navigate = useNavigate();
  const { startNewSession } = useInterview();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => (prev < 3 ? prev + 1 : 0));
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const handleStartReal = () => {
    onClose();
    startNewSession('frontend', 'intermediate');
    navigate('/interview');
  };

  const steps = [
    {
      speaker: 'AI Interviewer',
      text: '"Can you describe the browser critical rendering path from HTML parsing to pixel paint?"',
      highlight: 'Voice synthesis in real-time',
      tag: 'Step 1: Audio Prompt'
    },
    {
      speaker: 'Candidate Voice',
      text: '"First, the browser builds the DOM and CSSOM, merges them into the Render Tree, computes Layout, and paints pixels..."',
      highlight: 'Browser speech recognition live stream',
      tag: 'Step 2: Speech-to-Text'
    },
    {
      speaker: 'AI Evaluation Engine',
      text: 'Matched 5/5 keywords (DOM, CSSOM, Render Tree, Layout, Paint). Clarity score: 94%. Confidence: 88%.',
      highlight: 'Heuristic keyword extraction and filler word detection',
      tag: 'Step 3: Instant Analytics'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass border border-white/20 p-8 rounded-[36px] max-w-2xl w-full shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Interactive Simulation Demo</h3>
                <p className="text-xs text-gray-400">See how real-time voice analysis and evaluation work</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close demo"
            >
              <X size={20} />
            </button>
          </div>

          {/* Interactive walkthrough area */}
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
              <span>SIMULATED INTERVIEW FLOW</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors font-mono"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause Auto-Play' : 'Play Walkthrough'}
              </button>
            </div>

            {/* Steps display */}
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentStep === idx
                      ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/10'
                      : 'glass border-white/5 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                      {step.tag}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {step.speaker}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white/90 leading-relaxed italic">
                    {step.text}
                  </p>
                  <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {step.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl glass hover:bg-white/5 text-sm font-bold text-gray-300 transition-colors"
            >
              Close Demo
            </button>
            <button
              onClick={handleStartReal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              Try It Live Now <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
