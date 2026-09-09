import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Activity, 
  RotateCcw, 
  Home, 
  CheckCircle2, 
  XCircle, 
  Hash,
  Download,
  Terminal,
  History,
  Sparkles,
  FileText,
  Check
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useInterview } from '../InterviewContext';
import { useTheme } from '../ThemeContext';
import Navbar from '../components/Navbar';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { cn } from '../utils/cn';
import { downloadInterviewPDFReport } from '../utils/pdfGenerator';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, setSession, history, startNewSession } = useInterview();
  const { isDark } = useTheme();

  const sessionIdParam = searchParams.get('id');

  useEffect(() => {
    if (sessionIdParam && history.length > 0 && (!session || session.id !== sessionIdParam)) {
      const found = history.find(s => s.id === sessionIdParam);
      if (found) {
        setSession(found);
      }
    }
  }, [sessionIdParam, session, history, setSession]);

  useEffect(() => {
    if (session && session.responses.length > 0) {
      const avgScore = session.responses.reduce((acc, r) => acc + (r.analysis?.score || 0), 0) / session.responses.length;
      if (avgScore >= 70) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#8B5CF6', '#10B981']
        });
      }
    }
  }, [session]);

  if (!session || session.responses.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 glass p-10 rounded-[36px] text-center space-y-6 border border-white/10">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto">
            <Trophy size={32} />
          </div>
          <h2 className="text-2xl font-bold">No Completed Session</h2>
          <p className="text-gray-400 text-sm">
            You haven't completed an interview session yet. Start one to see your feedback and analytics.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all"
            >
              Start an Interview
            </Link>
            <Link
              to="/history"
              className="w-full py-3 glass hover:bg-white/5 text-gray-300 rounded-xl font-bold text-sm transition-all"
            >
              View Past History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avgScore = Math.round(session.responses.reduce((acc, r) => acc + (r.analysis?.score || 0), 0) / session.responses.length);
  const avgConfidence = Math.round(session.responses.reduce((acc, r) => acc + (r.analysis?.confidence || 0), 0) / session.responses.length);
  const avgClarity = Math.round(session.responses.reduce((acc, r) => acc + (r.analysis?.clarity || 0), 0) / session.responses.length);
  const avgKeywords = Math.round(session.responses.reduce((acc, r) => acc + (r.analysis?.keywordMatch || 0), 0) / session.responses.length);
  const totalFiller = session.responses.reduce((acc, r) => acc + (r.analysis?.fillerWords || 0), 0);

  const radarData = [
    { subject: 'Technical', A: avgKeywords, fullMark: 100 },
    { subject: 'Confidence', A: avgConfidence, fullMark: 100 },
    { subject: 'Clarity', A: avgClarity, fullMark: 100 },
    { subject: 'Structure', A: Math.min(100, Math.round(avgClarity * 1.1)), fullMark: 100 },
    { subject: 'Flow', A: Math.max(0, 100 - (totalFiller * 5 / session.responses.length)), fullMark: 100 },
  ];

  const barData = session.responses.map((r, i) => ({
    name: `Q${i + 1}`,
    score: r.analysis?.score || 0
  }));

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleRetake = () => {
    startNewSession(session.role, session.difficulty);
    navigate('/interview');
  };

  const handleDownloadPDF = () => {
    if (!session) return;
    setDownloadingPdf(true);
    try {
      const ok = downloadInterviewPDFReport(session);
      if (ok) {
        setPdfDownloaded(true);
        setTimeout(() => setPdfDownloaded(false), 3500);
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadReport = () => {
    let report = `# AI Interview Performance Report\n`;
    report += `Date: ${new Date(session.startTime).toLocaleString()}\n`;
    report += `Track: ${session.role.toUpperCase()} (${session.difficulty})\n`;
    report += `Overall Score: ${avgScore}/100\n`;
    report += `Clarity: ${avgClarity}%\n`;
    report += `Confidence: ${avgConfidence}%\n`;
    report += `Keyword Match: ${avgKeywords}%\n`;
    report += `Filler Word Count: ${totalFiller}\n\n`;
    report += `## Detailed Responses\n\n`;

    session.responses.forEach((resp, idx) => {
      const q = session.questions.find(q => q.id === resp.questionId);
      report += `### Question ${idx + 1}: ${q?.text || ''}\n`;
      report += `Candidate Answer: "${resp.transcript}"\n`;
      report += `Score: ${resp.analysis?.score}/100\n`;
      report += `Feedback: ${resp.analysis?.feedback}\n`;
      report += `Strengths: ${resp.analysis?.strengths.join(', ')}\n`;
      report += `Areas to Improve: ${resp.analysis?.weaknesses.join(', ')}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${session.role}-${session.difficulty}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <Navbar />

      <header className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="space-y-3 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 glass border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full"
          >
            <Sparkles size={12} />
            {session.role} • {session.difficulty} track
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black"
          >
            Your Performance <span className="text-blue-500">Report</span>
          </motion.h1>
          <p className="text-sm text-gray-400">
            Completed on {new Date(session.endTime || session.startTime).toLocaleDateString()} with comprehensive heuristic evaluation.
          </p>
        </div>
        
        {/* Clickable Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg text-white border",
              pdfDownloaded
                ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-500/40 shadow-emerald-600/30"
                : "bg-blue-600 hover:bg-blue-700 border-blue-500/40 shadow-blue-600/30"
            )}
            title="Download comprehensive PDF report with scores, strengths, and improvements"
          >
            {pdfDownloaded ? (
              <>
                <Check size={16} className="text-white" />
                <span>PDF Downloaded!</span>
              </>
            ) : downloadingPdf ? (
              <>
                <FileText size={16} className="animate-pulse" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText size={16} />
                <span>Download PDF Report</span>
              </>
            )}
          </button>

          <button 
            onClick={handleDownloadReport}
            className="glass px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-white/10 transition-colors border border-white/10 text-gray-300"
            title="Download report as markdown"
          >
            <Download size={14} /> Markdown
          </button>

          <button 
            onClick={() => navigate('/history')}
            className="glass px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/10 text-gray-300"
          >
            <History size={15} /> History
          </button>

          <button 
            onClick={handleRetake}
            className="glass px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/10 text-gray-200"
          >
            <RotateCcw size={14} /> Retake Test
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Overall Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 glass p-8 sm:p-10 rounded-[36px] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden border border-white/10 shadow-xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Trophy size={120} />
          </div>
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96" cy="96" r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className={isDark ? "text-white/5" : "text-slate-200"}
              />
              <circle
                cx="96" cy="96" r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={553}
                strokeDashoffset={553 - (553 * avgScore) / 100}
                className="text-blue-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black">{avgScore}</span>
              <span className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-1">Overall Score</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full pt-2">
             <div className="glass p-3.5 rounded-2xl border border-white/5">
                <div className="text-emerald-400 font-black text-2xl">{(avgScore * 0.9).toFixed(1)}%</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Readiness</div>
             </div>
             <div className="glass p-3.5 rounded-2xl border border-white/5">
                <div className="text-purple-400 font-black text-2xl">{totalFiller}</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Filler Words</div>
             </div>
          </div>
        </motion.div>

        {/* Charts Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="glass p-6 rounded-[36px] space-y-4 border border-white/10">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
               <Target size={15} /> SKILL BREAKDOWN
             </div>
             <div className="h-[240px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                   <PolarGrid stroke="rgba(255,255,255,0.1)" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                   <Radar
                     name="Performance"
                     dataKey="A"
                     stroke="#3B82F6"
                     fill="#3B82F6"
                     fillOpacity={0.4}
                   />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="glass p-6 rounded-[36px] space-y-4 border border-white/10">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
               <Activity size={15} /> SCORE PER QUESTION
             </div>
             <div className="h-[240px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                   <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={12} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                   />
                   <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Action shortcuts banner */}
      <div className="mb-12 glass p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <Terminal size={22} />
          </div>
          <div>
            <h4 className="font-bold text-base">Ready for the Live Coding Assessment?</h4>
            <p className="text-xs text-gray-400">Put your algorithmic and problem-solving skills to the test with real code execution.</p>
          </div>
        </div>
        <Link
          to="/coding"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition-all shadow-md shadow-purple-600/30 shrink-0"
        >
          Open Coding Round
        </Link>
      </div>

      {/* Questions Review Section */}
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Hash size={22} className="text-blue-500" /> Question-by-Question Analysis
      </h3>

      <div className="space-y-6">
        {session.responses.map((resp, idx) => {
          const q = session.questions.find(q => q.id === resp.questionId);
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 sm:p-8 rounded-[32px] space-y-6 border border-white/10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-black text-blue-400 uppercase flex items-center gap-2 font-mono">
                    <Hash size={12} /> Question {idx + 1} • {q?.category || 'Technical'}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold leading-snug">"{q?.text}"</h4>
                </div>
                <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-lg font-black border border-white/10 shrink-0">
                  <span className="text-blue-400">{resp.analysis?.score}</span>
                  <span className="text-xs text-gray-400 uppercase">/ 100</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 glass p-4 rounded-2xl border border-white/5">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">YOUR RESPONSE</div>
                  <p className="text-gray-200 text-sm leading-relaxed italic">
                    "{resp.transcript || 'No transcript captured for this answer.'}"
                  </p>
                </div>
                <div className="space-y-2 glass p-4 rounded-2xl border border-white/5">
                   <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">KEYWORD & REASONING SIGNALS</div>
                   <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                         {resp.analysis?.strengths.map((s, i) => (
                           <div key={i} className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                             <CheckCircle2 size={11} /> {s}
                           </div>
                         ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                         {resp.analysis?.weaknesses.map((w, i) => (
                           <div key={i} className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                             <XCircle size={11} /> {w}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-3 text-sm">
                  <Activity size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-300">Detailed Feedback: </span>
                    <span className="text-gray-200">{resp.analysis?.feedback}</span>
                    <div className="text-xs text-gray-400 mt-2 font-mono">
                      Expected Keywords: {q?.expectedKeywords.join(', ')}
                    </div>
                  </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
