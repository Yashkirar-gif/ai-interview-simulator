import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Download, 
  Copy, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  PlusCircle, 
  MinusCircle, 
  Sliders, 
  ShieldCheck, 
  Target, 
  Briefcase, 
  Search,
  ExternalLink,
  ChevronDown,
  Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { ResumeAnalysisResult } from '../types';
import { SAMPLE_RESUMES } from '../data/sampleResumes';
import { downloadResumeATSPDF } from '../utils/pdfGenerator';
import { useInterview } from '../InterviewContext';

const ROLE_OPTIONS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Engineer',
  'React / UI Specialist',
  'DevOps & Cloud Engineer',
  'Mobile Developer (iOS/Android)',
  'Data Engineer / AI Engineer',
  'General Software Engineer'
];

export default function ResumeCheckerPage() {
  const { currentUser } = useInterview();

  // Form states
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showJobDescInput, setShowJobDescInput] = useState(false);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [fileSuccessInfo, setFileSuccessInfo] = useState<string | null>(null);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI interaction states
  const [activeTab, setActiveTab] = useState<'improve' | 'add' | 'remove' | 'keywords' | 'sections'>('improve');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysisSteps = [
    'Parsing resume structure & extracting text...',
    'Matching technical keywords against ATS dictionaries...',
    'Auditing impact density & metric formulation (Google XYZ formula)...',
    'Detecting formatting pitfalls, tables & fluff buzzwords...',
    'Synthesizing actionable ATS score and optimization plan...'
  ];

  // Handle file drop/upload with server-side document parsing
  const handleFileProcess = async (file: File) => {
    setFileName(file.name);
    setErrorMsg(null);
    setFileSuccessInfo(null);

    // Guard against massive files
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File exceeds 25MB. Please upload a smaller document or paste text directly.');
      return;
    }

    const lowerName = file.name.toLowerCase();

    // 1. Instant client-side text parsing for plain text formats
    if (
      file.type === 'text/plain' ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.json') ||
      lowerName.endsWith('.rtf')
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || '';
        setResumeText(content);
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        setFileSuccessInfo(`Loaded "${file.name}" (${wordCount} words). Ready for ATS audit.`);
      };
      reader.readAsText(file);
      return;
    }

    // 2. Binary documents (PDF, Word DOCX) using server-side extraction
    setIsExtractingFile(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const fileDataUrl = (e.target?.result as string) || '';

        const res = await fetch('/api/resume/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: fileDataUrl,
            fileName: file.name,
            mimeType: file.type
          })
        });

        if (!res.ok) {
          let errorText = 'Unable to extract document text';
          try {
            const errJson = await res.json();
            if (errJson.error) errorText = errJson.error;
          } catch {
            const txt = await res.text().catch(() => '');
            if (txt.includes('PayloadTooLargeError') || txt.includes('too large')) {
              errorText = 'File is too large for upload. Please paste plain text or upload a smaller file.';
            }
          }
          throw new Error(errorText);
        }

        const data = await res.json();
        if (data.text && data.text.length > 20) {
          setResumeText(data.text);
          setFileSuccessInfo(data.info || `Successfully extracted text from "${file.name}" (${data.wordCount} words).`);
        } else {
          throw new Error('Extracted text was too short. Please copy and paste resume text directly.');
        }
      } catch (err: any) {
        console.warn('Document extraction error:', err);
        setErrorMsg(`${err.message || 'Could not parse document.'} You can paste plain text directly into the box below.`);
      } finally {
        setIsExtractingFile(false);
      }
    };

    reader.onerror = () => {
      setIsExtractingFile(false);
      setErrorMsg('Failed to read file from your device. Please paste text directly.');
    };

    reader.readAsDataURL(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_RESUMES.find(s => s.id === sampleId);
    if (sample) {
      setResumeText(sample.content);
      setTargetRole(sample.role);
      setFileName(`${sample.title.toLowerCase().replace(/\s+/g, '-')}.txt`);
      setFileSuccessInfo(`Loaded sample profile: ${sample.title}`);
      setErrorMsg(null);
    }
  };

  // Submit Analysis
  const handleAnalyze = async () => {
    const trimmedResume = resumeText.trim();
    if (!trimmedResume || trimmedResume.length < 30) {
      setErrorMsg('Please paste or upload resume text with at least 30 characters.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep(0);

    // Step progress timer animation
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      // Protect against overly long payloads by capping at 35,000 chars (~7,000 words)
      const sanitizedText = trimmedResume.slice(0, 35000);
      const sanitizedJobDesc = jobDescription.trim() ? jobDescription.trim().slice(0, 10000) : undefined;

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeText: sanitizedText,
          targetRole,
          jobDescription: sanitizedJobDesc
        })
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        let serverError = 'Server error during resume analysis';
        try {
          const errorData = await res.json();
          if (errorData.error) serverError = errorData.error;
        } catch {
          const textBody = await res.text().catch(() => '');
          if (textBody.includes('PayloadTooLargeError') || res.status === 413) {
            serverError = 'Resume content is too large. Please use a document under 25MB or paste text.';
          } else if (textBody && textBody.length < 250 && !textBody.includes('<!DOCTYPE')) {
            serverError = textBody;
          }
        }
        throw new Error(serverError);
      }

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        // Scroll smoothly to results
        setTimeout(() => {
          const resultsEl = document.getElementById('ats-results-view');
          if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        throw new Error('No analysis data received from server');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Failed to examine resume. Please check server connectivity.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!analysisResult) return;
    setPdfGenerating(true);
    const success = downloadResumeATSPDF(analysisResult, currentUser?.name || 'Candidate');
    setTimeout(() => setPdfGenerating(false), 1200);
  };

  const handleCopyImprovements = () => {
    if (!analysisResult) return;
    const text = [
      `=== ATS RESUME AUDIT REPORT ===`,
      `ATS Score: ${analysisResult.atsScore}/100 - ${analysisResult.verdict}`,
      `Target Role: ${analysisResult.targetRole}`,
      ``,
      `--- WHAT TO IMPROVE ---`,
      ...analysisResult.whatToImprove.map(
        (item, i) => `${i + 1}. [${item.area}] Issue: ${item.issue}\n   Fix: ${item.suggestion}${item.exampleAfter ? `\n   Example: "${item.exampleAfter}"` : ''}`
      ),
      ``,
      `--- WHAT TO ADD ---`,
      ...analysisResult.whatToAdd.map((add, i) => `+ ${add.item} (${add.priority.toUpperCase()}): ${add.reason}`),
      ``,
      `--- WHAT TO REMOVE ---`,
      ...analysisResult.whatToRemove.map((rem, i) => `- ${rem.item} [${rem.severity.toUpperCase()}]: ${rem.reason}`),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (score >= 70) return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return { label: 'High ATS Pass Rate', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (score >= 70) return { label: 'Competitive with Gaps', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    if (score >= 50) return { label: 'Requires Optimization', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'High Risk of ATS Filter', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 selection:bg-blue-500/30 pt-24 pb-20 px-4 sm:px-6">
      <Navbar />

      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-blue-600/10 blur-[140px] rounded-full -z-10 pointer-events-none" />

      <main className="max-w-6xl mx-auto w-full space-y-10">
        {/* Header Title Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs font-semibold text-blue-400 border border-blue-500/30">
            <Sparkles size={14} className="text-blue-400" />
            <span>Enterprise ATS Screening Simulation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
            ATS Resume <span className="gradient-text">Checker & Optimizer</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
            Examine your resume against automated ATS algorithms (Workday, Greenhouse, Lever).
            Get an objective score out of 100, bullet rewrites, high-impact additions, and elements to purge immediately.
          </p>
        </div>

        {/* Input Card Container */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          {/* Target Role & Controls Bar */}
          <div className="grid sm:grid-cols-2 gap-4 pb-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <Briefcase size={14} className="text-blue-400" /> Target Technical Role
              </label>
              <div className="relative">
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-blue-500 appearance-none transition-colors"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#101015] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Target size={14} className="text-purple-400" /> Job Description Match (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowJobDescInput(!showJobDescInput)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  {showJobDescInput ? 'Hide' : '+ Add Target Job Post'}
                </button>
              </div>
              {showJobDescInput ? (
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste specific job requirements or tech stack from the company posting..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              ) : (
                <div 
                  onClick={() => setShowJobDescInput(true)}
                  className="w-full bg-white/[0.02] border border-dashed border-white/10 rounded-xl px-4 py-3 text-xs text-gray-500 cursor-pointer hover:border-purple-500/40 hover:text-gray-400 transition-colors flex items-center justify-between"
                >
                  <span>Click to paste target job posting for custom keyword gap analysis...</span>
                  <PlusCircle size={14} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Preload Sample Resumes */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <Sliders size={13} /> Try Sample Resume:
              </span>
              {SAMPLE_RESUMES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleLoadSample(sample.id)}
                  className="px-3 py-1.5 rounded-lg glass text-xs font-medium text-gray-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-600/10 border border-white/10 transition-all"
                  title={sample.description}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop File Area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isExtractingFile && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                : isExtractingFile
                ? 'border-emerald-500/50 bg-emerald-500/5 cursor-wait'
                : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.rtf,.pdf,.docx"
              onChange={onFileInputChange}
              className="hidden"
              disabled={isExtractingFile}
            />
            <div className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-xl ${isExtractingFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-600/20 text-blue-400'}`}>
                {isExtractingFile ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              <p className="text-sm font-bold text-gray-200">
                {isExtractingFile ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                    Extracting & parsing text from document...
                  </span>
                ) : fileName ? (
                  <span className="text-blue-400 flex items-center justify-center gap-1.5">
                    <FileText size={16} /> Loaded: {fileName}
                  </span>
                ) : (
                  'Click to upload or drag & drop your resume'
                )}
              </p>
              <p className="text-xs text-gray-400">
                {isExtractingFile 
                  ? 'Cleaning text streams, removing binary objects & formatting for ATS engine...'
                  : 'Supports PDF, Word (.docx), TXT, or Markdown • Or paste directly into the box below'
                }
              </p>
            </div>
          </div>

          {/* File Success Notice */}
          {fileSuccessInfo && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{fileSuccessInfo}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setFileSuccessInfo(null)}
                className="text-emerald-400 hover:text-emerald-200 text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Resume Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <label className="font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <FileText size={14} className="text-blue-400" /> Resume Content (Plain Text)
              </label>
              <span className="font-mono">
                {resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words • ${resumeText.length.toLocaleString()} chars` : '0 words'}
              </span>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Paste your complete resume text here (Header, Summary, Skills, Experience, Education, Projects)..."
              rows={9}
              className="w-full bg-[#0a0a0f] border border-white/15 rounded-2xl p-4 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>100% Confidential • In-memory analysis with zero data retention</span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={16} className="animate-spin text-white" />
                  <span>Examining Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-blue-200" />
                  <span>Run ATS Audit & Scoring</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Progress State */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-3xl border border-blue-500/30 text-center space-y-5 shadow-2xl"
          >
            <div className="p-4 bg-blue-600/20 text-blue-400 rounded-full w-fit mx-auto animate-pulse">
              <Sparkles size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Auditing Your Resume for {targetRole}</h3>
              <p className="text-xs text-gray-400 font-mono">
                {analysisSteps[analysisStep]}
              </p>
            </div>
            <div className="w-full max-w-md mx-auto bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-500"
                style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {analysisResult && !isAnalyzing && (
          <div id="ats-results-view" className="space-y-8 scroll-mt-28">
            {/* Top Score Card */}
            <div className="glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                {/* Score Dial / Hero */}
                <div className="flex items-center gap-6">
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center border-2 shadow-xl ${getScoreColor(analysisResult.atsScore)}`}>
                    <span className="text-3xl sm:text-4xl font-black">{analysisResult.atsScore}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">out of 100</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-gray-400">ATS Verdict:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreBadge(analysisResult.atsScore).color}`}>
                        {getScoreBadge(analysisResult.atsScore).label}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {analysisResult.atsScore >= 85 ? 'Optimized for Enterprise ATS' : analysisResult.atsScore >= 70 ? 'Promising Profile with Critical Gaps' : 'Requires Structural Optimization'}
                    </h2>
                    <p className="text-xs text-gray-400">
                      Target Role: <strong className="text-gray-200">{analysisResult.targetRole}</strong> • Audited against Workday, Greenhouse & Lever parser specs
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfGenerating}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    {pdfGenerating ? 'Building PDF...' : 'Download ATS Report (PDF)'}
                  </button>

                  <button
                    onClick={handleCopyImprovements}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl glass hover:bg-white/10 border border-white/10 text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedNotification ? (
                      <>
                        <Check size={15} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        <span>Copy Action Items</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4 Dimension Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>Content & Impact</span>
                    <span className="font-bold text-white">{analysisResult.scoreBreakdown.contentAndImpact}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${analysisResult.scoreBreakdown.contentAndImpact}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">XYZ formula, scale & metrics</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>Skills & Keywords</span>
                    <span className="font-bold text-white">{analysisResult.scoreBreakdown.skillsAndKeywords}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${analysisResult.scoreBreakdown.skillsAndKeywords}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">Target technical match</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>Formatting & Structure</span>
                    <span className="font-bold text-white">{analysisResult.scoreBreakdown.formattingAndStructure}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${analysisResult.scoreBreakdown.formattingAndStructure}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">Headers & ATS parsability</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>Brevity & Clarity</span>
                    <span className="font-bold text-white">{analysisResult.scoreBreakdown.brevityAndClarity}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${analysisResult.scoreBreakdown.brevityAndClarity}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">Zero fluff & active voice</p>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Executive ATS Evaluation
                </span>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>
            </div>

            {/* Interactive Tabs Header */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveTab('improve')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'improve'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'glass text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                <Sliders size={14} />
                <span>What to Improve ({analysisResult.whatToImprove?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'add'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'glass text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                <PlusCircle size={14} />
                <span>What to Add ({analysisResult.whatToAdd?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('remove')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'remove'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                    : 'glass text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                <MinusCircle size={14} />
                <span>What to Remove ({analysisResult.whatToRemove?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('keywords')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'keywords'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'glass text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                <Target size={14} />
                <span>Keywords & Gaps ({analysisResult.keywordAnalysis?.matchPercentage || 0}%)</span>
              </button>

              <button
                onClick={() => setActiveTab('sections')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'sections'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'glass text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                <FileText size={14} />
                <span>Section Health Check ({analysisResult.sectionReviews?.length || 0})</span>
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="space-y-4">
              {/* TAB 1: WHAT TO IMPROVE */}
              {activeTab === 'improve' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sliders size={18} className="text-amber-400" />
                        Specific Areas to Upgrade with Before & After Rewrites
                      </h3>
                      <p className="text-xs text-gray-400">
                        Convert passive responsibility bullets into metric-backed accomplishments using Google's XYZ formula.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {analysisResult.whatToImprove.map((item, index) => (
                      <div
                        key={index}
                        className="glass p-5 rounded-2xl border border-white/10 space-y-4 hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                              [Priority {index + 1}] {item.area}
                            </span>
                            <h4 className="text-sm font-bold text-gray-200">{item.issue}</h4>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
                          <strong className="text-amber-300">Actionable Fix: </strong> {item.suggestion}
                        </div>

                        {(item.exampleBefore || item.exampleAfter) && (
                          <div className="grid sm:grid-cols-2 gap-3 pt-1">
                            {item.exampleBefore && (
                              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
                                  <XCircle size={13} /> Original / Weak Formulation:
                                </span>
                                <p className="text-xs text-gray-300 font-mono italic">
                                  "{item.exampleBefore}"
                                </p>
                              </div>
                            )}

                            {item.exampleAfter && (
                              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                                  <CheckCircle2 size={13} /> ATS-Optimized Metric Formulation:
                                </span>
                                <p className="text-xs text-gray-200 font-mono font-medium">
                                  "{item.exampleAfter}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: WHAT TO ADD */}
              {activeTab === 'add' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <PlusCircle size={18} className="text-emerald-400" />
                      Critical Missing Elements to Add
                    </h3>
                    <p className="text-xs text-gray-400">
                      These keywords, portfolio links, and quantitative credentials represent direct gaps in your current ATS parse.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {analysisResult.whatToAdd.map((add, idx) => (
                      <div
                        key={idx}
                        className="glass p-5 rounded-2xl border border-white/10 space-y-3 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-gray-400 uppercase">
                              {add.category || 'Competency'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                add.priority === 'high'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {add.priority} Priority
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white flex items-start gap-2">
                            <PlusCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span>{add.item}</span>
                          </h4>

                          <p className="text-xs text-gray-300 leading-relaxed">
                            {add.reason}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                          <Check size={13} /> Recommended for immediate inclusion
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WHAT TO REMOVE */}
              {activeTab === 'remove' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MinusCircle size={18} className="text-rose-400" />
                      Elements to Purge & Remove Immediately
                    </h3>
                    <p className="text-xs text-gray-400">
                      Unprovable buzzwords, outdated technologies, and parsing traps that lower keyword density and risk ATS filtering.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {analysisResult.whatToRemove.map((rem, idx) => (
                      <div
                        key={idx}
                        className="glass p-5 rounded-2xl border border-white/10 space-y-3 hover:border-rose-500/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-gray-400 uppercase">
                              Hazard #{idx + 1}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                rem.severity === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {rem.severity} Severity
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-rose-300 flex items-start gap-2">
                            <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                            <span>{rem.item}</span>
                          </h4>

                          <p className="text-xs text-gray-300 leading-relaxed">
                            <strong className="text-gray-200">Why it hurts: </strong> {rem.reason}
                          </p>

                          {rem.replacement && (
                            <div className="p-2.5 bg-white/5 rounded-xl text-xs text-gray-300">
                              <strong className="text-blue-400">Upgrade: </strong> {rem.replacement}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/5 text-[11px] text-rose-400 font-semibold flex items-center gap-1.5">
                          <MinusCircle size={13} /> Remove from your draft
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: KEYWORDS & ATS MATCH */}
              {activeTab === 'keywords' && (
                <div className="glass p-6 rounded-3xl border border-white/10 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target size={18} className="text-blue-400" />
                        Keyword Density & Skill Match Matrix
                      </h3>
                      <p className="text-xs text-gray-400">
                        ATS scanners count exact text matches against industry job descriptions.
                      </p>
                    </div>

                    <div className="px-3.5 py-1.5 glass rounded-xl text-xs font-bold text-blue-400 border border-blue-500/30">
                      {analysisResult.keywordAnalysis?.matchPercentage || 0}% Keywords Matched
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Matched Keywords Found ({analysisResult.keywordAnalysis?.matchedKeywords?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywordAnalysis?.matchedKeywords?.map((kw, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-1.5"
                        >
                          <Check size={12} /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Critical Missing Keywords for {targetRole} ({analysisResult.keywordAnalysis?.missingKeywords?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywordAnalysis?.missingKeywords?.map((kw, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300 flex items-center gap-1.5"
                        >
                          <PlusCircle size={12} /> {kw}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 pt-1">
                      Tip: Integrate these missing technologies into your Skills section or within relevant work project bullets if you have hands-on experience with them.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: SECTION-BY-SECTION HEALTH */}
              {activeTab === 'sections' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText size={18} className="text-purple-400" />
                      Section-by-Section Structural Audit
                    </h3>
                    <p className="text-xs text-gray-400">
                      Standard section naming and linear hierarchy ensure automated document parsing engines don't mangle text.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {analysisResult.sectionReviews?.map((sec, idx) => (
                      <div
                        key={idx}
                        className="glass p-5 rounded-2xl border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className={`p-1.5 rounded-lg text-xs font-bold ${
                              sec.status === 'pass'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : sec.status === 'warning'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {sec.score}%
                            </span>
                            <h4 className="text-sm font-bold text-white">{sec.sectionName}</h4>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sec.status === 'pass'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : sec.status === 'warning'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}>
                            {sec.status === 'pass' ? 'Strong' : sec.status === 'warning' ? 'Needs Attention' : 'Critical Issue'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed">
                          {sec.feedback}
                        </p>

                        {sec.tips && sec.tips.length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1">
                            {sec.tips.map((tip, tIdx) => (
                              <div key={tIdx} className="text-xs text-gray-400 flex items-start gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Universal ATS Golden Rules */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <ShieldCheck size={16} /> Universal ATS Optimization Guidelines
              </span>
              <div className="grid sm:grid-cols-2 gap-3">
                {analysisResult.quickAtsTips?.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 font-bold">{idx + 1}.</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset / Rescan CTA */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl glass hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white border border-white/10 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} /> Scan Another Resume or Edit Text
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
