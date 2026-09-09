import { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Terminal, 
  Info, 
  RotateCcw, 
  Lightbulb, 
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  Clock,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import confetti from 'canvas-confetti';
import { CODING_QUESTIONS, CodingQuestion } from '../data/codingQuestions';
import { executeCode, CodeError, TestResult } from '../utils/codeRunner';
import { saveCodingAttempt } from '../utils/codingTracker';
import SolutionModal from '../components/coding/SolutionModal';

export default function CodingPage() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const currentQ: CodingQuestion = CODING_QUESTIONS[currentQIndex] || CODING_QUESTIONS[0];

  // The code editor starts ONLY with the starter function stub - NOT the pre-filled answer!
  const [code, setCode] = useState(currentQ?.starterCode || '');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeError, setActiveError] = useState<CodeError | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasPassedAll, setHasPassedAll] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [showInlineHint, setShowInlineHint] = useState(false);

  // Update starter code when changing question
  useEffect(() => {
    setCode(currentQ.starterCode);
    setTestResults([]);
    setActiveError(null);
    setHasPassedAll(false);
    setShowInlineHint(false);
  }, [currentQIndex]);

  const handleReset = () => {
    setCode(currentQ.starterCode);
    setTestResults([]);
    setActiveError(null);
    setHasPassedAll(false);
  };

  const handleApplySolution = (solutionCode: string) => {
    setCode(solutionCode);
    setActiveError(null);
  };

  // Run the candidate's code and report line-specific errors
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveError(null);
    setHasPassedAll(false);

    try {
      const outcome = await executeCode(code, currentQ.functionName, currentQ.testCases);
      setTestResults(outcome.results);
      setActiveError(outcome.error);
      setHasPassedAll(outcome.allPassed);

      const passedCount = outcome.results.filter(r => r.passed).length;
      const totalCount = outcome.results.length;
      const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

      // Save attempt to tracker for ProgressDashboard visualization
      saveCodingAttempt({
        questionId: currentQ.id,
        questionTitle: currentQ.title,
        category: currentQ.category,
        difficulty: currentQ.difficulty,
        passedTests: passedCount,
        totalTests: totalCount,
        passRate,
        allPassed: outcome.allPassed,
        codeLength: code.trim().length,
        errorType: outcome.error?.type || null,
        errorMessage: outcome.error?.message,
        errorLine: outcome.error?.line
      });

      if (outcome.allPassed) {
        confetti({
          particleCount: 110,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6', '#8B5CF6']
        });
      }
    } catch (unexpectedErr: any) {
      const errMsg = unexpectedErr?.message || 'An unexpected error occurred during execution';
      setActiveError({
        type: 'runtime',
        line: 1,
        message: errMsg
      });

      saveCodingAttempt({
        questionId: currentQ.id,
        questionTitle: currentQ.title,
        category: currentQ.category,
        difficulty: currentQ.difficulty,
        passedTests: 0,
        totalTests: currentQ.testCases.length,
        passRate: 0,
        allPassed: false,
        codeLength: code.trim().length,
        errorType: 'runtime',
        errorMessage: errMsg,
        errorLine: 1
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Split lines for line numbers gutter
  const codeLines = code.split('\n');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 w-full max-w-7xl mx-auto flex flex-col justify-between space-y-6">
      <Navbar />

      <SolutionModal
        isOpen={showSolutionModal}
        question={currentQ}
        onClose={() => setShowSolutionModal(false)}
        onApplySolution={handleApplySolution}
      />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-grow w-full">
        {/* Left Column: Problem description & Test Runner Console */}
        <div className="w-full lg:w-5/12 space-y-6">
          {/* Question Card */}
          <div className="glass p-6 sm:p-7 rounded-[32px] space-y-5 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                  <Code2 size={15} />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">
                  {currentQ.category}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-bold uppercase text-gray-300">
                  {currentQ.difficulty}
                </span>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg glass text-gray-300 border border-white/10">
                Problem {currentQIndex + 1} of {CODING_QUESTIONS.length}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">{currentQ.title}</h2>
              <p className="text-gray-300 leading-relaxed text-sm font-medium">
                {currentQ.description}
              </p>
            </div>

            {/* Constraints Card */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Info size={13} className="text-blue-400" /> Constraints & Expected Complexities
              </div>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside font-mono">
                {currentQ.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Hints & Solution Toggle Drawer */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowInlineHint(!showInlineHint)}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle size={14} />
                  {showInlineHint ? 'Hide Hints' : 'Need a Hint?'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSolutionModal(true)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <Lightbulb size={14} /> Show Answer
                </button>
              </div>

              {showInlineHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3.5 glass rounded-xl border border-blue-500/20 space-y-1.5 text-xs text-gray-300"
                >
                  <div className="font-bold text-blue-300">Guiding Hints:</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    {currentQ.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            <div className="pt-1 flex items-center justify-between text-xs font-semibold text-gray-400">
              <Link
                to="/"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                ← Back to Interview Tracks
              </Link>
            </div>
          </div>

          {/* Test Runner Console */}
          <div className="glass p-6 rounded-[32px] space-y-4 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal size={15} className="text-emerald-400" /> Test Runner Console
              </div>

              {hasPassedAll && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Check size={12} /> All Tests Passed!
                </span>
              )}
            </div>

            {/* Error diagnostics banner */}
            {activeError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs space-y-2 text-red-300"
              >
                <div className="flex items-center gap-2 font-bold text-red-400">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>
                    {activeError.line ? `Error on Line ${activeError.line}` : 'Execution Error'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 uppercase font-mono">
                    {activeError.type}
                  </span>
                </div>

                <div className="font-mono text-white text-[12px] bg-black/40 p-2 rounded-lg border border-red-500/20">
                  {activeError.message}
                </div>

                {activeError.lineSnippet && (
                  <div className="text-[11px] font-mono text-red-200">
                    Offending Line {activeError.line}: <code className="text-white font-bold bg-white/10 px-1 py-0.5 rounded">{activeError.lineSnippet}</code>
                  </div>
                )}

                {activeError.suggestion && (
                  <p className="text-[11px] text-gray-400 italic">
                    💡 {activeError.suggestion}
                  </p>
                )}
              </motion.div>
            )}

            {/* Test Cases Results List */}
            <div className="space-y-2.5">
              {testResults.length === 0 && !activeError ? (
                <div className="text-gray-500 text-xs py-8 text-center glass rounded-2xl border border-white/5 space-y-1">
                  <p className="font-medium">Ready to evaluate your code.</p>
                  <p className="text-[11px] text-gray-600">
                    Click "Run Assessment" below to execute unit test assertions.
                  </p>
                </div>
              ) : (
                testResults.map((res, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3.5 glass rounded-xl border text-xs transition-all space-y-1.5",
                      res.passed
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {res.passed ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-red-400 shrink-0" />
                        )}
                        <span className="font-bold text-white">{res.name}</span>
                      </div>

                      <span
                        className={cn(
                          "font-bold font-mono px-2 py-0.5 rounded text-[10px]",
                          res.passed
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : "text-red-400 bg-red-500/10 border border-red-500/20"
                        )}
                      >
                        {res.passed ? 'PASSED' : res.errorLine ? `FAILED (Line ${res.errorLine})` : 'FAILED'}
                      </span>
                    </div>

                    {!res.passed && (
                      <div className="pl-6 space-y-1 text-[11px] font-mono text-gray-400 border-t border-white/5 pt-1.5 mt-1">
                        <div>Input: <span className="text-gray-200">{JSON.stringify(res.input)}</span></div>
                        <div>Expected: <span className="text-emerald-400 font-bold">{JSON.stringify(res.expected)}</span></div>
                        <div>Your Output: <span className="text-red-400 font-bold">{JSON.stringify(res.actual)}</span></div>
                        {res.explanation && (
                          <div className="text-[10px] text-gray-500 italic mt-0.5">{res.explanation}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor with Line Numbers & Error Highlighting */}
        <div className="w-full lg:w-7/12 flex flex-col gap-4">
          <div className="glass-dark flex-grow rounded-[32px] overflow-hidden flex flex-col border border-white/10 shadow-2xl relative min-h-[500px]">
            {/* Editor Top Bar */}
            <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <span className="ml-3 text-xs font-mono text-gray-400 flex items-center gap-1.5">
                  <span>{currentQ.functionName}.js</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-blue-400 font-medium">{codeLines.length} lines</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Option to Show Answer */}
                <button
                  type="button"
                  onClick={() => setShowSolutionModal(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 transition-all flex items-center gap-1.5 shadow-sm"
                  title="View the reference answer and algorithmic solution"
                >
                  <Lightbulb size={13} className="text-amber-400" />
                  <span>Show Answer</span>
                </button>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-gray-400 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/5 flex items-center gap-1 transition-colors"
                  title="Reset code to starter function stub"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Error Callout Banner above Editor if Line is Flagged */}
            {activeError?.line && (
              <div className="bg-red-500/15 border-b border-red-500/30 px-6 py-2.5 flex items-center justify-between gap-2 text-xs text-red-300 animate-fadeIn">
                <div className="flex items-center gap-2 font-mono">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span>
                    Line {activeError.line}: <strong>{activeError.message}</strong>
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                  Highlighted on Line {activeError.line}
                </span>
              </div>
            )}

            {/* Code Editor Container with Synchronized Line Numbers Gutter */}
            <div className="flex-grow flex overflow-hidden font-mono text-sm relative">
              {/* Line Numbers Gutter */}
              <div 
                className="select-none text-right px-3 py-4 border-r border-white/10 text-gray-600 font-mono text-xs sm:text-sm shrink-0 bg-black/30"
                style={{ width: '48px' }}
              >
                {codeLines.map((_, i) => {
                  const lineNum = i + 1;
                  const isErrorLine = activeError?.line === lineNum;
                  return (
                    <div
                      key={lineNum}
                      className={cn(
                        "h-[22px] leading-[22px] flex items-center justify-end font-mono transition-colors",
                        isErrorLine
                          ? "text-red-400 font-black bg-red-500/25 px-1 rounded-sm border-r-2 border-red-500 -mr-3 pr-3"
                          : "text-gray-600 hover:text-gray-400"
                      )}
                      title={isErrorLine ? `Error on Line ${lineNum}` : `Line ${lineNum}`}
                    >
                      {lineNum}
                    </div>
                  );
                })}
              </div>

              {/* Code Textarea & Syntax Highlight Layer */}
              <div className="flex-grow overflow-auto min-w-0 bg-transparent">
                <Editor
                  value={code}
                  onValueChange={val => {
                    setCode(val);
                    // Clear active error when user begins editing
                    if (activeError) setActiveError(null);
                  }}
                  highlight={c => prism.highlight(c, prism.languages.javascript, 'javascript')}
                  padding={16}
                  style={{
                    fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
                    fontSize: 14,
                    lineHeight: '22px',
                    minHeight: '100%',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    whiteSpace: 'pre'
                  }}
                  className="w-full h-full focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40">
              {/* Problem Quick Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-gray-400 font-medium mr-1 whitespace-nowrap">Problems:</span>
                {CODING_QUESTIONS.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQIndex(i)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-black transition-all border shrink-0 flex items-center justify-center",
                      i === currentQIndex
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 ring-2 ring-blue-400/30"
                        : "glass border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                    title={`${q.title} (${q.difficulty})`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowSolutionModal(true)}
                  className="px-4 py-3 rounded-xl glass hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
                >
                  <Eye size={14} className="text-amber-400" />
                  <span>Show Answer</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                >
                  <Play size={14} fill="white" className={isRunning ? 'animate-spin' : ''} />
                  <span>{isRunning ? 'Evaluating...' : 'Run Assessment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
