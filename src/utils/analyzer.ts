import { ResponseAnalysis } from '../types';

const FILLER_WORDS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of'];

export const analyzeTranscript = (
  transcript: string, 
  expectedKeywords: string[],
  duration: number
): ResponseAnalysis => {
  const normalizedTranscript = transcript.toLowerCase();
  const words = normalizedTranscript.split(/\s+/).filter(w => w.length > 0);
  
  // 1. Keyword analysis & Missed Jargon
  const matchedKeywords = expectedKeywords.filter(k => 
    normalizedTranscript.includes(k.toLowerCase())
  );
  const missedKeywords = expectedKeywords.filter(k => 
    !normalizedTranscript.includes(k.toLowerCase())
  );
  const keywordScore = (matchedKeywords.length / expectedKeywords.length) * 100;

  // 2. Filler words count
  const fillerCount = words.filter(w => FILLER_WORDS.includes(w)).length;
  
  // 3. Confidence score (heuristic based on word density and filler count)
  const wpm = words.length > 0 ? (words.length / (duration / 1000)) * 60 : 0;
  const speedScore = Math.max(0, 100 - Math.abs(130 - wpm) * 0.4);
  const fillerPenalty = words.length > 0 ? (fillerCount / words.length) * 400 : 0;
  const confidenceScore = Math.max(0, Math.min(100, speedScore - fillerPenalty));

  // 4. Clarity & Sentence Structure
  // Basic heuristic: common transition words indicate better structure
  const transitionWords = ['however', 'therefore', 'furthermore', 'because', 'specifically', 'initially', 'consequently'];
  const transitionCount = words.filter(w => transitionWords.includes(w)).length;
  const structureBonus = Math.min(20, transitionCount * 5);
  const clarityScore = Math.min(100, ((words.length / 40) * 80) + structureBonus);

  // 5. Overall Score
  const overallScore = (keywordScore * 0.45) + (confidenceScore * 0.35) + (clarityScore * 0.2);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let detailedFeedback = '';

  if (keywordScore > 75) strengths.push('Strong technical accuracy');
  if (transitionCount > 2) strengths.push('Good logical progression');
  if (confidenceScore > 80) strengths.push('Highly confident pacing');

  if (missedKeywords.length > 0) {
    weaknesses.push(`Missed jargon: ${missedKeywords.slice(0, 2).join(', ')}`);
  }
  if (fillerCount > words.length * 0.08) weaknesses.push('High filler word frequency');
  if (wpm < 80) weaknesses.push('Speech pace is too slow');

  if (overallScore > 85) {
    detailedFeedback = 'Excellent! You demonstrated deep understanding and professional articulation.';
  } else if (missedKeywords.length > 0) {
    detailedFeedback = `Solid start, but try to incorporate terms like "${missedKeywords[0]}" to sound more authoritative.`;
  } else {
    detailedFeedback = 'Good attempt. Focus on reducing hesitation and expanding on your logic.';
  }

  return {
    confidence: Math.round(confidenceScore),
    clarity: Math.round(clarityScore),
    fillerWords: fillerCount,
    keywordMatch: Math.round(keywordScore),
    score: Math.round(overallScore),
    feedback: detailedFeedback,
    strengths,
    weaknesses
  };
};
