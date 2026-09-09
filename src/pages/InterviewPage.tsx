import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  ArrowRight, 
  ArrowLeft,
  Volume2, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  Activity,
  X,
  Keyboard,
  Home,
  Check,
  RotateCcw,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useInterview } from '../InterviewContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { analyzeTranscript } from '../utils/analyzer';
import { cn } from '../utils/cn';
import ThemeToggle from '../components/ThemeToggle';

export default function InterviewPage() {
  const navigate = useNavigate();
  const { session, setSession, saveCompletedSession, swapCurrentQuestion } = useInterview();
  const { isListening, transcript, startListening, stopListening, isSupported, error: micError } = useSpeechRecognition();
  const { speak, cancel } = useSpeechSynthesis();
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass p-10 rounded-[36px] text-center space-y-6 max-w-md border border-white/10">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-2xl font-bold">No Active Session</h2>
          <p className="text-gray-400 text-sm">
            Select a specialization track on the platform to start a personalized simulation.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white transition-all shadow-lg shadow-blue-600/30"
          >
            <Home size={16} /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions = session.questions.length;
  const currentQuestionNum = session.currentQuestionIndex + 1;
  const progressPercentage = Math.min(100, Math.round((currentQuestionNum / totalQuestions) * 100));
  const currentQuestion = session.questions[session.currentQuestionIndex];

  // Start the interview with voice
  const handleBegin = () => {
    setHasStarted(true);
    speakQuestion();
  };

  const speakQuestion = () => {
    setIsSpeaking(true);
    speak(currentQuestion.text);
    setTimeout(() => setIsSpeaking(false), 3000); 
  };

  const handleSwapQuestion = async () => {
    if (isSwapping) return;
    setIsSwapping(true);
    try {
      const replacement = await swapCurrentQuestion();
      if (replacement) {
        setTimeLeft(60);
        setManualText('');
        if (isListening) {
          stopListening();
        }
        if (hasStarted) {
          setIsSpeaking(true);
          speak(replacement.text);
          setTimeout(() => setIsSpeaking(false), 3000);
        }
      }
    } catch (err) {
      console.warn('Failed to swap question:', err);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleNext = () => {
    stopListening();
    cancel();
    
    const finalAnswer = isTypingMode ? (manualText || transcript) : (transcript || manualText);
    
    // Analyze response
    const analysis = analyzeTranscript(finalAnswer, currentQuestion.expectedKeywords, (60 - timeLeft) * 1000);
    
    const updatedResponses = [
      ...session.responses,
      {
        questionId: currentQuestion.id,
        transcript: finalAnswer,
        duration: 60 - timeLeft,
        analysis
      }
    ];

    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1,
        responses: updatedResponses
      });
      setTimeLeft(60);
      setHasStarted(false);
      setManualText('');
    } else {
      const completedSession = {
        ...session,
        responses: updatedResponses,
        endTime: Date.now()
      };
      setSession(completedSession);
      saveCompletedSession(completedSession);
      navigate('/results');
    }
  };

  const confirmExit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopListening();
    cancel();
    setShowExitModal(false);
    navigate('/');
  };

  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !isSpeaking) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNext();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, timeLeft, isSpeaking]);

  const activeResponseText = isTypingMode ? manualText : transcript;

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 flex flex-col justify-between">
      {/* Simulation Header & Progress Bar Section */}
      <header className="max-w-4xl mx-auto w-full space-y-4 mb-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back & Cross Exit Button */}
            <button
              onClick={() => setShowExitModal(true)}
              className="px-3 py-2 rounded-xl glass hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all border border-white/10 flex items-center gap-1.5 text-xs font-bold group shadow-sm"
              title="Exit simulation"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back</span>
              <span className="text-gray-500 font-normal hidden sm:inline">|</span>
              <X size={15} className="text-gray-400 group-hover:text-red-400" />
            </button>

            <div className="glass px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10">
              <Activity size={14} className="text-blue-500 animate-pulse" />
              <span className="uppercase tracking-wider font-mono text-[11px] text-gray-300">Live Sim</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase">
              {session.role} • {session.difficulty}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle className="!py-1.5 !px-2.5" />
            <button
              onClick={() => setIsTypingMode(!isTypingMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isTypingMode
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                  : 'glass text-gray-400 hover:text-white border-white/10'
              }`}
            >
              <Keyboard size={14} />
              <span className="hidden sm:inline">{isTypingMode ? 'Type Mode' : 'Switch to Typing'}</span>
            </button>

            <div className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm transition-colors border",
              timeLeft < 10 ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" : "glass text-blue-400 border-white/10"
            )}>
              <Clock size={15} />
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar Component */}
        <div className="glass p-4 rounded-2xl border border-white/10 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white font-mono">
                Question {currentQuestionNum} of {totalQuestions}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-blue-400 font-semibold font-mono">
                {progressPercentage}% Complete
              </span>
            </div>

            {/* Question Step Markers */}
            <div className="flex items-center gap-1.5">
              {session.questions.map((_, idx) => {
                const isCompleted = idx < session.currentQuestionIndex;
                const isCurrent = idx === session.currentQuestionIndex;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono transition-all",
                      isCompleted 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                        : isCurrent 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40 font-black scale-105" 
                        : "glass text-gray-500 border border-white/5"
                    )}
                    title={`Question ${idx + 1}`}
                  >
                    {isCompleted ? <Check size={11} className="stroke-[3]" /> : idx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continuous Progress Bar Track */}
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
              initial={{ width: `${((currentQuestionNum - 1) / totalQuestions) * 100}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      {/* Main Simulation View */}
      <main className="max-w-4xl mx-auto w-full flex-grow flex flex-col items-center justify-center gap-8">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div 
              key="start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-10 sm:p-12 rounded-[40px] text-center space-y-8 max-w-xl w-full border border-white/10 shadow-2xl"
            >
              <div className="mx-auto w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-600/30">
                <Volume2 size={38} className="text-white" />
              </div>
              <div className="space-y-3">
                <div className="text-xs font-bold font-mono uppercase tracking-widest text-blue-400">
                  {session.role} • {session.difficulty} track
                </div>
                <h2 className="text-3xl font-bold">Ready for Question {currentQuestionNum}?</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The interviewer will speak the question aloud. You can speak into your microphone or type your response.
                </p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={handleBegin}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
                >
                  Start Question
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSwapQuestion}
                    disabled={isSwapping}
                    className="flex-1 py-2.5 px-3 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1.5 border border-white/10 disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isSwapping ? "animate-spin text-blue-400" : ""} />
                    <span>{isSwapping ? "Getting fresh question..." : "Swap Question"}</span>
                  </button>
                  <button
                    onClick={() => setShowExitModal(true)}
                    className="py-2.5 px-4 rounded-xl glass hover:bg-red-500/10 text-xs text-gray-400 hover:text-red-300 transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <ArrowLeft size={13} /> Exit
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              {/* Question Header Card */}
              <div className="glass p-8 sm:p-10 rounded-[36px] space-y-4 relative overflow-hidden border border-white/10">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs tracking-widest uppercase font-mono">
                    <BrainCircuit size={16} />
                    <span>{currentQuestion.category} Question • #{currentQuestionNum}</span>
                    {currentQuestion.isAiGenerated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold normal-case tracking-normal">
                        <Sparkles size={10} /> AI Dynamic
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSwapQuestion}
                      disabled={isSwapping}
                      className="p-1.5 px-2.5 rounded-lg glass hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 border border-white/10 disabled:opacity-50"
                      title="Get an unseen question"
                    >
                      <RefreshCw size={13} className={isSwapping ? "animate-spin text-blue-400" : ""} />
                      <span className="hidden sm:inline">{isSwapping ? "Swapping..." : "Swap Question"}</span>
                    </button>
                    <button
                      onClick={speakQuestion}
                      className="p-1.5 px-2.5 rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs flex items-center gap-1 border border-white/10"
                      title="Repeat question"
                    >
                      <Volume2 size={14} /> Replay
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                  "{currentQuestion.text}"
                </h3>
                
                {isSpeaking && (
                   <div className="flex gap-1 items-end h-4 pt-2">
                      {[...Array(8)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [4, 16, 4] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-blue-500 rounded-full"
                        />
                      ))}
                      <span className="text-[11px] font-mono text-blue-400 ml-2">Speaking...</span>
                   </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Response Input Panel */}
                <div className="glass p-6 sm:p-8 rounded-[32px] space-y-4 min-h-[300px] flex flex-col border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isTypingMode ? <Keyboard size={15} /> : <Mic size={15} />}
                      {isTypingMode ? 'TYPE YOUR ANSWER' : 'VOICE TRANSCRIPT'}
                    </div>
                    {!isTypingMode && isListening && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> REC
                      </div>
                    )}
                  </div>

                  {/* Input or Voice view */}
                  {isTypingMode ? (
                    <textarea
                      value={manualText}
                      onChange={e => setManualText(e.target.value)}
                      placeholder="Type your structured answer here (mention key architecture concepts and practical examples)..."
                      className="flex-grow w-full glass p-4 rounded-2xl text-sm sm:text-base text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                    />
                  ) : (
                    <div className="flex-grow text-lg sm:text-xl text-gray-200 font-medium leading-relaxed overflow-y-auto max-h-[220px]">
                      {transcript || <span className="text-gray-600 italic">Click "Start Answer" below and speak clearly...</span>}
                    </div>
                  )}
                  
                  {/* Action row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/5">
                    {!isTypingMode && (
                      <button 
                        onClick={isListening ? stopListening : startListening}
                        className={cn(
                          "flex-grow py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md",
                          isListening
                            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
                        )}
                      >
                        {isListening ? <><MicOff size={18} /> Stop Recording</> : <><Mic size={18} /> Start Answer</>}
                      </button>
                    )}

                    <button 
                      onClick={handleNext}
                      disabled={!activeResponseText && timeLeft > 0}
                      className="glass px-5 py-3.5 rounded-2xl text-blue-400 hover:text-white hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-blue-400 transition-all flex items-center justify-center gap-2 text-sm font-bold border border-white/10 w-full sm:w-auto"
                    >
                      <span>Submit Answer</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Hints and Keyword Guidance */}
                <div className="space-y-4">
                  <div className="glass p-6 rounded-3xl space-y-3 border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <AlertCircle size={15} /> QUICK TIPS
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {currentQuestion.tips}
                    </p>
                  </div>

                  <div className="glass p-6 rounded-3xl space-y-3 border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <CheckCircle2 size={15} /> EXPECTED DOMAIN CONCEPTS
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentQuestion.expectedKeywords.map(k => (
                        <span key={k} className="text-[10px] uppercase font-black px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Speech Support Notice if blocked */}
      {!isSupported || micError ? (
        <div className="max-w-4xl mx-auto w-full mt-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="shrink-0" size={16} />
            <span>Microphone unavailable: Switch to <strong>Typing Mode</strong> above to complete the interview without audio.</span>
          </div>
          <button
            onClick={() => setIsTypingMode(true)}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg font-bold"
          >
            Enable Typing
          </button>
        </div>
      ) : null}

      {/* In-App Exit Confirmation Modal (Guarantees reliable operation in all iframes) */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <RotateCcw size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Exit Interview Simulation?</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your active session progress and question responses will not be saved.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors border border-white/10"
                >
                  Resume Interview
                </button>
                <button
                  type="button"
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Exit to Tracks
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
