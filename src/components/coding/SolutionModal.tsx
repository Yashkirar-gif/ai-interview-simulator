import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Copy, ArrowDownToLine, Lightbulb, Clock, Database, Sparkles, BookOpen } from 'lucide-react';
import prism from 'prismjs';
import { CodingQuestion } from '../../data/codingQuestions';

interface SolutionModalProps {
  isOpen: boolean;
  question: CodingQuestion;
  onClose: () => void;
  onApplySolution: (solutionCode: string) => void;
}

export default function SolutionModal({
  isOpen,
  question,
  onClose,
  onApplySolution
}: SolutionModalProps) {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(question.solutionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleApply = () => {
    onApplySolution(question.solutionCode);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 800);
  };

  const highlightedCode = prism.highlight(
    question.solutionCode,
    prism.languages.javascript,
    'javascript'
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="glass border border-white/20 p-6 sm:p-8 rounded-[32px] max-w-2xl w-full shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
                  <Lightbulb size={18} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  Reference Solution
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                  {question.difficulty}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {question.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Close solution modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Solution Code Block with Copy & Insert buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-400" /> Optimal JavaScript Implementation
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg glass text-xs font-semibold hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center gap-1 border border-white/10"
                  title="Copy code to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-4 border border-white/10 overflow-x-auto font-mono text-xs sm:text-sm bg-black/60 shadow-inner">
              <pre>
                <code
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  className="language-javascript"
                />
              </pre>
            </div>
          </div>

          {/* Complexity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 glass rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                <Clock size={14} className="text-blue-400" /> Time Complexity
              </div>
              <p className="text-xs text-gray-400 font-mono font-medium">
                {question.timeComplexity}
              </p>
            </div>

            <div className="p-3.5 glass rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                <Database size={14} className="text-purple-400" /> Space Complexity
              </div>
              <p className="text-xs text-gray-400 font-mono font-medium">
                {question.spaceComplexity}
              </p>
            </div>
          </div>

          {/* Step-by-Step Explanation */}
          <div className="p-4 glass rounded-2xl border border-white/10 space-y-2">
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} className="text-emerald-400" /> How It Works
            </div>
            <div className="text-xs text-gray-300 leading-relaxed space-y-1.5 whitespace-pre-line">
              {question.solutionExplanation}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-400 text-center sm:text-left">
              Want to see this solution execute and pass all tests?
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2.5 glass hover:bg-white/10 text-xs font-bold text-gray-300 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleApply}
                disabled={applied}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5"
              >
                {applied ? (
                  <>
                    <Check size={14} /> Applied!
                  </>
                ) : (
                  <>
                    <ArrowDownToLine size={14} /> Insert Solution in Editor
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
