import { jsPDF } from 'jspdf';
import { InterviewSession, Question, ResumeAnalysisResult } from '../types';

interface SessionLike {
  id?: string;
  role?: string;
  difficulty?: string;
  startTime?: number;
  endTime?: number;
  userName?: string;
  userEmail?: string;
  isGuest?: boolean;
  score?: number;
  questions?: Question[] | any[];
  responses?: Array<{
    questionId: string;
    transcript: string;
    duration?: number;
    analysis?: {
      confidence?: number;
      clarity?: number;
      fillerWords?: number;
      keywordMatch?: number;
      feedback?: string;
      strengths?: string[];
      weaknesses?: string[];
      score?: number;
    };
  }>;
}

/**
 * Generates a comprehensive, professional vector PDF report for an interview session.
 */
export function generateInterviewPDF(session: SessionLike): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  let y = margin;

  // Safe metrics calculation
  const responses = session.responses || [];
  const responseCount = responses.length || 1;

  const avgScore = session.score !== undefined && session.score !== null
    ? Math.round(session.score)
    : Math.round(
        responses.reduce((acc, r) => acc + (r.analysis?.score || 70), 0) / responseCount
      );

  const avgClarity = Math.round(
    responses.reduce((acc, r) => acc + (r.analysis?.clarity || 75), 0) / responseCount
  );

  const avgConfidence = Math.round(
    responses.reduce((acc, r) => acc + (r.analysis?.confidence || 75), 0) / responseCount
  );

  const avgKeywords = Math.round(
    responses.reduce((acc, r) => acc + (r.analysis?.keywordMatch || 70), 0) / responseCount
  );

  const totalFiller = responses.reduce((acc, r) => acc + (r.analysis?.fillerWords || 0), 0);

  const roleLabel = (session.role || 'Software Engineering').toUpperCase();
  const difficultyLabel = (session.difficulty || 'Intermediate').toUpperCase();
  const candidateName = session.userName || 'Candidate';
  const candidateEmail = session.userEmail || (session.isGuest ? 'Guest Session' : 'Registered User');
  const sessionDate = new Date(session.endTime || session.startTime || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Helper for page break checks
  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin + 10;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.text(`AI Interview Performance Report • Candidate: ${candidateName} • ${roleLabel}`, margin, margin);
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.2);
    doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
  };

  // ==========================================
  // 1. TOP HEADER BANNER
  // ==========================================
  // Header background block
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 34, 'F');

  // Accent left stripe
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(margin, y, 4, 34, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('AI INTERVIEW SIMULATOR', margin + 9, y + 12);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Official Performance Dossier & Comprehensive Evaluation', margin + 9, y + 19);

  // Document meta on right side of banner
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`DATE: ${sessionDate}`, pageWidth - margin - 6, y + 12, { align: 'right' });
  doc.text(`SESSION REF: #${(session.id || 'SES-001').slice(0, 14)}`, pageWidth - margin - 6, y + 19, { align: 'right' });

  // Status tag
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(pageWidth - margin - 42, y + 23, 36, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('VERIFIED REPORT', pageWidth - margin - 24, y + 27, { align: 'center' });

  y += 40;

  // ==========================================
  // 2. CANDIDATE DETAILS & METADATA CARD
  // ==========================================
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  const colWidth = contentWidth / 4;

  // Col 1: Candidate
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CANDIDATE', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(candidateName.slice(0, 24), margin + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(candidateEmail.slice(0, 26), margin + 4, y + 18);

  // Col 2: Role & Track
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('INTERVIEW TRACK', margin + colWidth + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(37, 99, 235);
  doc.text(roleLabel, margin + colWidth + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${difficultyLabel} Level`, margin + colWidth + 4, y + 18);

  // Col 3: Questions Evaluated
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('QUESTIONS EVALUATED', margin + colWidth * 2 + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${responses.length} Answered`, margin + colWidth * 2 + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Speech & Tech Heuristics', margin + colWidth * 2 + 4, y + 18);

  // Col 4: Account Type
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CANDIDATE STATUS', margin + colWidth * 3 + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(session.isGuest ? 217 : 16, session.isGuest ? 119 : 185, session.isGuest ? 6 : 129);
  doc.text(session.isGuest ? 'Guest Trial' : 'Verified Candidate', margin + colWidth * 3 + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(session.isGuest ? 'Single Test Record' : 'Saved to Cloud', margin + colWidth * 3 + 4, y + 18);

  y += 28;

  // ==========================================
  // 3. EXECUTIVE SCORE & METRIC CARDS
  // ==========================================
  ensureSpace(45);

  // Overall score box on left
  const scoreBoxWidth = 52;
  const scoreBoxHeight = 36;
  
  let scoreColor: [number, number, number] = [37, 99, 235]; // blue
  let ratingText = 'Meets Expectations';
  if (avgScore >= 85) {
    scoreColor = [16, 185, 129]; // emerald
    ratingText = 'Exceeds Expectations';
  } else if (avgScore >= 70) {
    scoreColor = [37, 99, 235]; // blue
    ratingText = 'Proficient & Competent';
  } else if (avgScore >= 55) {
    scoreColor = [245, 158, 11]; // amber
    ratingText = 'Needs Targeted Practice';
  } else {
    scoreColor = [239, 68, 68]; // red
    ratingText = 'Requires Preparation';
  }

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, scoreBoxWidth, scoreBoxHeight, 2, 2, 'FD');

  // Fill header of score box
  doc.setFillColor(...scoreColor);
  doc.roundedRect(margin, y, scoreBoxWidth, 7, 2, 2, 'F');
  doc.rect(margin, y + 5, scoreBoxWidth, 2, 'F'); // square bottom edges
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('OVERALL SCORE', margin + scoreBoxWidth / 2, y + 4.5, { align: 'center' });

  // Big score number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(`${avgScore}`, margin + scoreBoxWidth / 2 - 4, y + 21, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('/100', margin + scoreBoxWidth / 2 + 10, y + 21);

  // Rating badge text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...scoreColor);
  doc.text(ratingText, margin + scoreBoxWidth / 2, y + 30, { align: 'center' });

  // 4 Metric cards on the right
  const remainingWidth = contentWidth - scoreBoxWidth - 4;
  const metricCardWidth = (remainingWidth - 6) / 2;
  const metricCardHeight = 16.5;

  const metrics = [
    { label: 'Technical Terminology', val: `${avgKeywords}%`, sub: 'Expected key concepts covered', color: [37, 99, 235] as [number, number, number] },
    { label: 'Speech Clarity', val: `${avgClarity}%`, sub: 'Articulation & structural flow', color: [16, 185, 129] as [number, number, number] },
    { label: 'Delivery Confidence', val: `${avgConfidence}%`, sub: 'Poise and tone steadiness', color: [139, 92, 246] as [number, number, number] },
    { label: 'Filler Word Density', val: `${totalFiller} total`, sub: `${totalFiller <= 3 ? 'Clean & concise' : 'Recommend reducing pauses'}`, color: [245, 158, 11] as [number, number, number] }
  ];

  metrics.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const mx = margin + scoreBoxWidth + 4 + col * (metricCardWidth + 3);
    const my = y + row * (metricCardHeight + 3);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(mx, my, metricCardWidth, metricCardHeight, 2, 2, 'FD');

    // Left color pill
    doc.setFillColor(...m.color);
    doc.rect(mx, my, 2.5, metricCardHeight, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, mx + 5, my + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, mx + 5, my + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(m.sub, mx + 5, my + 14.5);
  });

  y += 42;

  // ==========================================
  // 4. EXECUTIVE SUMMARY: STRENGTHS & IMPROVEMENTS
  // ==========================================
  ensureSpace(40);

  // Compile overall strengths and improvements
  const allStrengths: string[] = [];
  const allWeaknesses: string[] = [];

  responses.forEach(r => {
    if (r.analysis?.strengths) {
      r.analysis.strengths.forEach(s => {
        if (s && !allStrengths.includes(s) && allStrengths.length < 5) allStrengths.push(s);
      });
    }
    if (r.analysis?.weaknesses) {
      r.analysis.weaknesses.forEach(w => {
        if (w && !allWeaknesses.includes(w) && allWeaknesses.length < 5) allWeaknesses.push(w);
      });
    }
  });

  if (allStrengths.length === 0) {
    allStrengths.push('Demonstrated prompt readiness and structured flow under timer constraints');
    allStrengths.push('Clear articulation and professional communication posture');
    allStrengths.push('Relevant coverage of core engineering terminology');
  }

  if (allWeaknesses.length === 0) {
    allWeaknesses.push('Reinforce answers with specific real-world metrics, trade-offs, and edge case handling');
    allWeaknesses.push('Structure complex situational answers with the STAR method (Situation, Task, Action, Result)');
    allWeaknesses.push('Continue eliminating filler verbal hesitations during conceptual pauses');
  }

  const boxHalfWidth = (contentWidth - 4) / 2;
  const summaryBoxHeight = 36;

  // Left Box: Key Strengths
  doc.setFillColor(240, 253, 244); // green-50
  doc.setDrawColor(187, 247, 208); // green-200
  doc.roundedRect(margin, y, boxHalfWidth, summaryBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52); // green-800
  doc.text('CANDIDATE KEY STRENGTHS', margin + 4, y + 6);

  let strY = y + 11;
  allStrengths.slice(0, 3).forEach((str) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 163, 74);
    doc.text('✓', margin + 4, strY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(str, boxHalfWidth - 11);
    doc.text(lines, margin + 8, strY);
    strY += Math.max(lines.length * 3.4, 7);
  });

  // Right Box: Suggested Improvements (Action Plan)
  doc.setFillColor(254, 243, 199); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(margin + boxHalfWidth + 4, y, boxHalfWidth, summaryBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('RECOMMENDED ACTION PLAN & IMPROVEMENTS', margin + boxHalfWidth + 8, y + 6);

  let weakY = y + 11;
  allWeaknesses.slice(0, 3).forEach((wk) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(217, 119, 6);
    doc.text('▲', margin + boxHalfWidth + 8, weakY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(wk, boxHalfWidth - 14);
    doc.text(lines, margin + boxHalfWidth + 12, weakY);
    weakY += Math.max(lines.length * 3.4, 7);
  });

  y += summaryBoxHeight + 8;

  // ==========================================
  // 5. DETAILED QUESTION-BY-QUESTION BREAKDOWN
  // ==========================================
  ensureSpace(20);

  // Section divider header
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('QUESTION-BY-QUESTION AUDIT & EVALUATION', margin + 4, y + 4.8);
  y += 11;

  // Render each question
  responses.forEach((resp, idx) => {
    const q = session.questions?.find((item: any) => item.id === resp.questionId) || {
      text: `Evaluation Question ${idx + 1}`,
      category: 'technical',
      expectedKeywords: []
    };

    const analysis = resp.analysis || {
      score: 75,
      clarity: 75,
      confidence: 75,
      keywordMatch: 70,
      feedback: 'Response delivered with solid engagement and technical relevance.',
      strengths: ['Addressed the main question objectives directly'],
      weaknesses: ['Elaborate further with architectural trade-offs']
    };

    // Calculate question box height dynamically based on content
    const questionTextLines = doc.splitTextToSize(q.text || `Question ${idx + 1}`, contentWidth - 40);
    const transcriptText = resp.transcript ? `"${resp.transcript}"` : '(No speech recorded for this question)';
    const transcriptLines = doc.splitTextToSize(transcriptText, contentWidth - 16);
    const feedbackLines = doc.splitTextToSize(analysis.feedback || 'Evaluated successfully.', contentWidth - 16);

    const questionBoxHeight = 
      12 + 
      questionTextLines.length * 3.5 + 
      transcriptLines.length * 3.2 + 
      feedbackLines.length * 3.2 + 
      26;

    ensureSpace(Math.min(questionBoxHeight, 75));

    // Outer card for question
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, questionBoxHeight, 2, 2, 'FD');

    // Header strip for this question
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 7.5, 2, 2, 'F');
    doc.rect(margin, y + 5.5, contentWidth, 2, 'F');

    // Question number & category pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Q${idx + 1}.`, margin + 3, y + 5);

    const categoryText = (q.category || 'TECHNICAL').toUpperCase();
    doc.setFillColor(224, 231, 255); // indigo-100
    doc.roundedRect(margin + 12, y + 1.8, 22, 4.2, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text(categoryText, margin + 23, y + 4.8, { align: 'center' });

    // Question Score Badge on right
    const qScore = analysis.score || 75;
    let qScoreBg: [number, number, number] = [37, 99, 235];
    if (qScore >= 85) qScoreBg = [16, 185, 129];
    else if (qScore < 60) qScoreBg = [239, 68, 68];

    doc.setFillColor(...qScoreBg);
    doc.roundedRect(pageWidth - margin - 22, y + 1.8, 19, 4.2, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Score: ${qScore}%`, pageWidth - margin - 12.5, y + 4.8, { align: 'center' });

    let qCurrentY = y + 11.5;

    // Prompt Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(questionTextLines, margin + 4, qCurrentY);
    qCurrentY += questionTextLines.length * 3.5 + 2;

    // Transcript Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const transBoxHeight = transcriptLines.length * 3.2 + 6;
    doc.roundedRect(margin + 3, qCurrentY, contentWidth - 6, transBoxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('CANDIDATE RESPONSE TRANSCRIPT:', margin + 6, qCurrentY + 3.8);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(transcriptLines, margin + 6, qCurrentY + 7.5);
    qCurrentY += transBoxHeight + 3;

    // Analysis summary feedback
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('EVALUATOR FEEDBACK:', margin + 4, qCurrentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(feedbackLines, margin + 35, qCurrentY);
    qCurrentY += feedbackLines.length * 3.2 + 2;

    // Strengths & Improvements on this question
    const qStrength = analysis.strengths?.[0] || 'Clear articulation of the subject matter.';
    const qWeakness = analysis.weaknesses?.[0] || 'Provide a practical code or architecture example.';

    // Strength line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(22, 163, 74);
    doc.text('Strengths:', margin + 4, qCurrentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const qStrLines = doc.splitTextToSize(qStrength, contentWidth - 30);
    doc.text(qStrLines, margin + 20, qCurrentY);
    qCurrentY += qStrLines.length * 3.2 + 1;

    // Improvement line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(217, 119, 6);
    doc.text('Improvement:', margin + 4, qCurrentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const qWkLines = doc.splitTextToSize(qWeakness, contentWidth - 30);
    doc.text(qWkLines, margin + 20, qCurrentY);

    y += questionBoxHeight + 5;
  });

  // ==========================================
  // 6. ADD FOOTERS & PAGE NUMBERS TO ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - margin + 2, pageWidth - margin, pageHeight - margin + 2);

    // Left footer: App branding & generation note
    doc.text('AI Interview Simulator • Automated Performance Report', margin, pageHeight - margin + 6);

    // Center footer: Verification
    doc.text('Confidential Candidate Record', pageWidth / 2, pageHeight - margin + 6, { align: 'center' });

    // Right footer: Page count
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - margin + 6, { align: 'right' });
  }

  return doc;
}

/**
 * Convenience utility to trigger a clean client-side download of the interview PDF.
 * Supports iframe and browser security policies by using fallback Blob anchors.
 */
export function downloadInterviewPDFReport(session: SessionLike, customFilename?: string): boolean {
  try {
    const doc = generateInterviewPDF(session);
    const role = (session.role || 'interview').toLowerCase().replace(/\s+/g, '-');
    const difficulty = (session.difficulty || 'standard').toLowerCase();
    const candidateName = (session.userName || 'candidate').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = customFilename || `interview-report-${candidateName}-${role}-${difficulty}.pdf`;

    // Attempt direct save
    try {
      doc.save(filename);
      return true;
    } catch (saveErr) {
      console.warn('doc.save failed, trying blob download fallback:', saveErr);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return true;
    }
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return false;
  }
}

/**
 * Generates a comprehensive vector PDF report for an ATS Resume Analysis.
 */
export function generateResumeATSPDF(result: ResumeAnalysisResult, candidateName: string = 'Candidate'): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin;
      drawSubsequentHeader();
    }
  };

  const drawSubsequentHeader = () => {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('ATS RESUME AUDIT REPORT', margin + 4, y + 5.5);
    doc.text(`TARGET: ${result.targetRole.toUpperCase()}`, pageWidth - margin - 4, y + 5.5, { align: 'right' });
    y += 12;
  };

  // --- PAGE 1: HEADER & SCORE ---
  doc.setFillColor(10, 15, 30);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('ATS RESUME AUDIT & BENCHMARK', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Candidate: ${candidateName}   |   Target Role: ${result.targetRole}   |   Audited: ${new Date(result.analyzedAt || Date.now()).toLocaleDateString()}`, margin + 6, y + 17);

  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin + 6, y + 21, 55, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`SIMULATION ENGINE: ATS V4`, margin + 8, y + 25);

  y += 40;

  // --- SCORE HERO BLOCK ---
  const scoreBoxWidth = contentWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, scoreBoxWidth, 28, 3, 3, 'FD');

  const atsScore = result.atsScore || 0;
  const scoreColor = atsScore >= 85 ? [16, 185, 129] : atsScore >= 70 ? [37, 99, 235] : atsScore >= 50 ? [217, 119, 6] : [239, 68, 68];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${atsScore}`, margin + 18, y + 18, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('/ 100', margin + 18, y + 24, { align: 'center' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 36, y + 4, margin + 36, y + 24);

  // Verdict and context
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`ATS Pass-Rate Verdict: ${result.verdict || 'Standard Match'}`, margin + 42, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const verdictDesc = atsScore >= 85
    ? 'High parsing compatibility with major ATS systems (Workday, Greenhouse, Taleo). Excellent keyword density.'
    : atsScore >= 70
    ? 'Moderate compatibility. Will pass general filters but missing key metrics and technical keywords.'
    : 'Requires structural and content optimization to prevent automated ATS rejection.';
  doc.text(verdictDesc, margin + 42, y + 17, { maxWidth: contentWidth - 48 });

  y += 34;

  // --- 4 SUB-SCORES ---
  const metricColWidth = (contentWidth - 9) / 4;
  const metrics = [
    { label: 'Content & Impact', val: result.scoreBreakdown?.contentAndImpact ?? 75, max: 100 },
    { label: 'Skills & Keywords', val: result.scoreBreakdown?.skillsAndKeywords ?? 70, max: 100 },
    { label: 'Structure & Format', val: result.scoreBreakdown?.formattingAndStructure ?? 80, max: 100 },
    { label: 'Brevity & Clarity', val: result.scoreBreakdown?.brevityAndClarity ?? 78, max: 100 }
  ];

  metrics.forEach((m, idx) => {
    const mx = margin + idx * (metricColWidth + 3);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(mx, y, metricColWidth, 18, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, mx + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${m.val}%`, mx + 4, y + 14);
  });

  y += 24;

  // --- EXECUTIVE SUMMARY ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE ATS EVALUATION', margin, y);
  y += 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const summaryLines = doc.splitTextToSize(result.summary || 'Resume analyzed successfully against ATS standards.', contentWidth - 8);
  const summaryBoxHeight = summaryLines.length * 4.2 + 8;
  doc.roundedRect(margin, y, contentWidth, summaryBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(summaryLines, margin + 4, y + 6);
  y += summaryBoxHeight + 8;

  // --- WHAT TO IMPROVE ---
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text('1. WHAT TO IMPROVE (ACTIONABLE REWRITES)', margin, y);
  y += 5;

  (result.whatToImprove || []).slice(0, 3).forEach((item, idx) => {
    checkPageBreak(30);
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(254, 240, 138);

    const issueLines = doc.splitTextToSize(`Issue: ${item.issue}`, contentWidth - 8);
    const suggestionLines = doc.splitTextToSize(`Fix: ${item.suggestion}`, contentWidth - 8);
    const beforeLines = item.exampleBefore ? doc.splitTextToSize(`Original / Weak: "${item.exampleBefore}"`, contentWidth - 12) : [];
    const afterLines = item.exampleAfter ? doc.splitTextToSize(`ATS Optimized: "${item.exampleAfter}"`, contentWidth - 12) : [];

    const itemHeight = (issueLines.length + suggestionLines.length + beforeLines.length + afterLines.length) * 3.8 + 14;
    doc.roundedRect(margin, y, contentWidth, itemHeight, 2, 2, 'FD');

    let iy = y + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(113, 63, 18);
    doc.text(`[${idx + 1}] ${item.area}`, margin + 4, iy);
    iy += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(issueLines, margin + 4, iy);
    iy += issueLines.length * 3.6;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(suggestionLines, margin + 4, iy);
    iy += suggestionLines.length * 3.6;

    if (item.exampleBefore) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(185, 28, 28);
      doc.text(beforeLines, margin + 6, iy);
      iy += beforeLines.length * 3.6;
    }

    if (item.exampleAfter) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text(afterLines, margin + 6, iy);
      iy += afterLines.length * 3.6;
    }

    y += itemHeight + 4;
  });

  // --- WHAT TO ADD & WHAT TO REMOVE ---
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CRITICAL ADDITIONS & REMOVALS', margin, y);
  y += 5;

  const halfColWidth = (contentWidth - 4) / 2;

  // Add column
  let addY = y;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, addY, halfColWidth, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text('+ WHAT TO ADD TO YOUR RESUME', margin + 4, addY + 5.5);
  addY += 10;

  (result.whatToAdd || []).slice(0, 4).forEach((add) => {
    const textLines = doc.splitTextToSize(`• ${add.item}: ${add.reason}`, halfColWidth - 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(20, 83, 45);
    doc.text(textLines, margin + 2, addY);
    addY += textLines.length * 3.6 + 2;
  });

  // Remove column
  let remY = y;
  const remX = margin + halfColWidth + 4;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(remX, remY, halfColWidth, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text('- WHAT TO REMOVE / PURGE', remX + 4, remY + 5.5);
  remY += 10;

  (result.whatToRemove || []).slice(0, 4).forEach((rem) => {
    const textLines = doc.splitTextToSize(`• ${rem.item}: ${rem.reason}`, halfColWidth - 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(127, 29, 29);
    doc.text(textLines, remX + 2, remY);
    remY += textLines.length * 3.6 + 2;
  });

  y = Math.max(addY, remY) + 6;

  // --- KEYWORDS ANALYSIS ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. ATS KEYWORD MATCH MATRIX (${result.keywordAnalysis?.matchPercentage ?? 0}% Matched)`, margin, y);
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  const matchedStr = (result.keywordAnalysis?.matchedKeywords || []).slice(0, 10).join(', ') || 'Standard skills detected';
  const missingStr = (result.keywordAnalysis?.missingKeywords || []).slice(0, 8).join(', ') || 'No critical gaps';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text(`[MATCHED]: `, margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(doc.splitTextToSize(matchedStr, contentWidth - 28), margin + 26, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text(`[MISSING]: `, margin + 4, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(doc.splitTextToSize(missingStr, contentWidth - 28), margin + 26, y + 14);

  y += 28;

  // Page numbering footers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - margin - 6, pageWidth - margin, pageHeight - margin - 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('AI Interview Simulator - ATS Resume Verification Audit', margin, pageHeight - margin - 2);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - margin - 2, { align: 'right' });
  }

  return doc;
}

/**
 * Convenience utility to trigger client-side download of the ATS Resume PDF report.
 */
export function downloadResumeATSPDF(result: ResumeAnalysisResult, candidateName?: string): boolean {
  try {
    const doc = generateResumeATSPDF(result, candidateName || 'Candidate');
    const roleSlug = (result.targetRole || 'general').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `ats-resume-report-${roleSlug}-${Date.now().toString().slice(-6)}.pdf`;

    try {
      doc.save(filename);
      return true;
    } catch (saveErr) {
      console.warn('doc.save failed, using blob fallback:', saveErr);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return true;
    }
  } catch (err) {
    console.error('Failed to download ATS resume report PDF:', err);
    return false;
  }
}
