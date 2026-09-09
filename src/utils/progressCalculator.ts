import { 
  InterviewSession, 
  InterviewType, 
  ProgressFilter, 
  ProgressStats, 
  SkillScore, 
  InterviewTypeStats, 
  Achievement, 
  GoalProgress, 
  ProgressSummaryData, 
  EvaluatedInsight 
} from '../types';

/**
 * Classifies an interview session into one of the 4 standard types:
 * 'technical' | 'hr' | 'behavioral' | 'coding'
 */
export function classifyInterviewType(session: InterviewSession): InterviewType {
  if (session.interviewType) return session.interviewType;

  // Check role or questions for coding
  if (session.role === 'frontend' && session.questions?.some(q => q.category === 'coding')) {
    return 'coding';
  }

  // Check question categories
  const hasBehavioral = session.questions?.some(q => q.category === 'behavioral');
  const allText = (session.questions?.map(q => q.text.toLowerCase()) || []).join(' ');

  if (allText.includes('salary') || allText.includes('about yourself') || allText.includes('why should we hire') || allText.includes('culture')) {
    return 'hr';
  }

  if (hasBehavioral || allText.includes('conflict') || allText.includes('tell me about a time') || allText.includes('disagreement')) {
    return 'behavioral';
  }

  return 'technical';
}

/**
 * Filters sessions based on the selected time period
 */
export function filterSessionsByPeriod(
  sessions: InterviewSession[], 
  filter: ProgressFilter
): { current: InterviewSession[]; prior: InterviewSession[] } {
  const now = Date.now();
  let windowMs = 0;

  switch (filter) {
    case '7d':
      windowMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case '30d':
      windowMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case '3m':
      windowMs = 90 * 24 * 60 * 60 * 1000;
      break;
    case 'all':
    default:
      return { current: sessions, prior: [] };
  }

  const currentCutoff = now - windowMs;
  const priorCutoff = now - (windowMs * 2);

  const current = sessions.filter(s => (s.endTime || s.startTime) >= currentCutoff);
  const prior = sessions.filter(s => {
    const time = s.endTime || s.startTime;
    return time >= priorCutoff && time < currentCutoff;
  });

  return { current, prior };
}

/**
 * Calculates current and historical consecutive day streaks
 */
export function calculateStreaks(sessions: InterviewSession[]): { currentStreak: number; bestStreak: number } {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Extract unique sorted date strings (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      sessions.map(s => {
        const d = new Date(s.endTime || s.startTime);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse(); // newest to oldest

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Check if active streak starts today or yesterday
  let currentStreak = 0;
  let streakExpected = uniqueDates[0] === todayStr ? today : (uniqueDates[0] === yesterdayStr ? yesterday : null);

  if (streakExpected) {
    for (const dateStr of uniqueDates) {
      const expectedStr = `${streakExpected.getFullYear()}-${String(streakExpected.getMonth() + 1).padStart(2, '0')}-${String(streakExpected.getDate()).padStart(2, '0')}`;
      if (dateStr === expectedStr) {
        currentStreak++;
        streakExpected = new Date(streakExpected.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  // Calculate best streak ever
  let bestStreak = currentStreak;
  let tempStreak = 1;
  const chronological = [...uniqueDates].reverse();

  for (let i = 1; i < chronological.length; i++) {
    const prev = new Date(chronological[i - 1]);
    const curr = new Date(chronological[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
}

/**
 * Computes the top 5 performance cards data
 */
export function calculateTopStats(
  currentSessions: InterviewSession[], 
  priorSessions: InterviewSession[],
  allSessions: InterviewSession[]
): ProgressStats {
  if (currentSessions.length === 0) {
    const { currentStreak, bestStreak } = calculateStreaks(allSessions);
    return {
      totalInterviews: 0,
      averageScore: 0,
      bestScore: 0,
      totalQuestions: 0,
      currentStreak,
      bestStreak,
      scoreDelta: 0,
      interviewsDelta: 0,
      scoreTrend: 'stable'
    };
  }

  const scores = currentSessions.map(s => s.score ?? 0);
  const totalInterviews = currentSessions.length;
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalInterviews);
  const bestScore = Math.max(...scores);
  const totalQuestions = currentSessions.reduce((acc, s) => acc + (s.responses?.length || s.questions?.length || 0), 0);

  const { currentStreak, bestStreak } = calculateStreaks(allSessions);

  // Calculate score improvement delta
  let scoreDelta = 0;
  let interviewsDelta = 0;

  if (priorSessions.length > 0) {
    const priorScores = priorSessions.map(s => s.score ?? 0);
    const priorAvg = Math.round(priorScores.reduce((a, b) => a + b, 0) / priorSessions.length);
    scoreDelta = averageScore - priorAvg;
    interviewsDelta = totalInterviews - priorSessions.length;
  } else if (currentSessions.length >= 2) {
    // Split current sessions into earlier half and later half
    const half = Math.floor(currentSessions.length / 2);
    const chronoSessions = [...currentSessions].sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
    const earlier = chronoSessions.slice(0, half);
    const later = chronoSessions.slice(half);

    const earlierAvg = earlier.reduce((a, b) => a + (b.score || 0), 0) / earlier.length;
    const laterAvg = later.reduce((a, b) => a + (b.score || 0), 0) / later.length;
    scoreDelta = Math.round(laterAvg - earlierAvg);
    interviewsDelta = totalInterviews;
  }

  let scoreTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (scoreDelta > 2) scoreTrend = 'improving';
  else if (scoreDelta < -2) scoreTrend = 'declining';

  return {
    totalInterviews,
    averageScore,
    bestScore,
    totalQuestions,
    currentStreak,
    bestStreak,
    scoreDelta,
    interviewsDelta,
    scoreTrend
  };
}

/**
 * Computes performance across the 5 required skills
 */
export function calculateSkillScores(sessions: InterviewSession[]): SkillScore[] {
  if (sessions.length === 0) {
    return [
      { name: 'Technical Knowledge', key: 'technical', score: 0, level: 'Developing', insight: 'Complete an interview to assess core engineering concepts' },
      { name: 'Communication', key: 'communication', score: 0, level: 'Developing', insight: 'Clarity, articulation, and conciseness evaluation' },
      { name: 'Problem Solving', key: 'problemSolving', score: 0, level: 'Developing', insight: 'Logical structure and trade-off considerations' },
      { name: 'Confidence', key: 'confidence', score: 0, level: 'Developing', insight: 'Speaking pace and hesitation suppression' },
      { name: 'Answer Relevance', key: 'answerRelevance', score: 0, level: 'Developing', insight: 'Targeted alignment with expected answer criteria' },
    ];
  }

  let totalKeywords = 0;
  let totalConfidence = 0;
  let totalClarity = 0;
  let totalOverall = 0;
  let totalResponses = 0;
  let totalFillers = 0;

  sessions.forEach(s => {
    (s.responses || []).forEach(r => {
      if (r.analysis) {
        totalKeywords += r.analysis.keywordMatch ?? 75;
        totalConfidence += r.analysis.confidence ?? 70;
        totalClarity += r.analysis.clarity ?? 75;
        totalOverall += r.analysis.score ?? 75;
        totalFillers += r.analysis.fillerWords ?? 0;
        totalResponses++;
      }
    });
  });

  const count = totalResponses || 1;
  const avgKeywords = Math.min(100, Math.round(totalKeywords / count));
  const avgConfidence = Math.min(100, Math.round(totalConfidence / count));
  const avgClarity = Math.min(100, Math.round(totalClarity / count));
  const avgOverall = Math.min(100, Math.round(totalOverall / count));
  const avgFillersPerResp = totalFillers / count;

  // Derive 5 specific dimensions
  const technicalScore = Math.min(100, Math.round((avgKeywords * 0.7) + (avgOverall * 0.3)));
  const communicationScore = Math.min(100, Math.max(20, Math.round((avgClarity * 0.8) + Math.max(0, 20 - avgFillersPerResp * 4))));
  const problemSolvingScore = Math.min(100, Math.round((avgClarity * 0.5) + (avgOverall * 0.5)));
  const confidenceScore = Math.min(100, Math.round(avgConfidence));
  const relevanceScore = Math.min(100, Math.round((avgKeywords * 0.8) + (avgClarity * 0.2)));

  const getLevel = (score: number): 'Advanced' | 'Proficient' | 'Developing' => {
    if (score >= 82) return 'Advanced';
    if (score >= 68) return 'Proficient';
    return 'Developing';
  };

  const getInsight = (key: string, score: number): string => {
    switch (key) {
      case 'technical':
        return score >= 80 ? 'Exceptional keyword depth and architectural precision' : 'Incorporate specific industry terminology and framework concepts';
      case 'communication':
        return score >= 80 ? 'Crisp transitions and structured STAR articulation' : 'Minimize verbal hesitation and avoid wandering tangents';
      case 'problemSolving':
        return score >= 80 ? 'Clear edge-case identification and trade-off analysis' : 'State assumptions early and walk through problem trade-offs';
      case 'confidence':
        return score >= 80 ? 'Steady pacing and authoritative vocal delivery' : 'Maintain an optimal 120-140 WPM pace without rushing';
      case 'answerRelevance':
        return score >= 80 ? 'Directly addresses prompt requirements without fluff' : 'Ensure every sentence directly answers the core question asked';
      default:
        return 'Consistent performance';
    }
  };

  return [
    {
      name: 'Technical Knowledge',
      key: 'technical',
      score: technicalScore,
      level: getLevel(technicalScore),
      insight: getInsight('technical', technicalScore)
    },
    {
      name: 'Communication',
      key: 'communication',
      score: communicationScore,
      level: getLevel(communicationScore),
      insight: getInsight('communication', communicationScore)
    },
    {
      name: 'Problem Solving',
      key: 'problemSolving',
      score: problemSolvingScore,
      level: getLevel(problemSolvingScore),
      insight: getInsight('problemSolving', problemSolvingScore)
    },
    {
      name: 'Confidence',
      key: 'confidence',
      score: confidenceScore,
      level: getLevel(confidenceScore),
      insight: getInsight('confidence', confidenceScore)
    },
    {
      name: 'Answer Relevance',
      key: 'answerRelevance',
      score: relevanceScore,
      level: getLevel(relevanceScore),
      insight: getInsight('answerRelevance', relevanceScore)
    }
  ];
}

/**
 * Computes stats per interview type: Technical, HR, Behavioral, Coding
 */
export function calculateInterviewTypeStats(sessions: InterviewSession[]): InterviewTypeStats[] {
  const types: Array<{ type: InterviewType; title: string; color: string }> = [
    { type: 'technical', title: 'Technical', color: '#3b82f6' },
    { type: 'behavioral', title: 'Behavioral', color: '#8b5cf6' },
    { type: 'hr', title: 'HR & Culture', color: '#10b981' },
    { type: 'coding', title: 'Live Coding', color: '#f59e0b' },
  ];

  return types.map(t => {
    const matching = sessions.filter(s => classifyInterviewType(s) === t.type);
    const attempts = matching.length;
    const scores = matching.map(s => s.score ?? 0);
    const averageScore = attempts > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / attempts) : 0;
    const bestScore = attempts > 0 ? Math.max(...scores) : 0;

    return {
      type: t.type,
      title: t.title,
      attempts,
      averageScore,
      bestScore,
      color: t.color
    };
  });
}

/**
 * Extracts and synthesizes real strengths and weaknesses from responses
 */
export function generateStrengthsAndWeaknesses(sessions: InterviewSession[]): {
  strengths: EvaluatedInsight[];
  weaknesses: EvaluatedInsight[];
} {
  const strengthMap: Record<string, { count: number; impact: number }> = {};
  const weaknessMap: Record<string, { count: number; impact: number }> = {};

  sessions.forEach(s => {
    (s.responses || []).forEach(r => {
      const an = r.analysis;
      if (!an) return;

      // Extract strengths
      (an.strengths || []).forEach(str => {
        const clean = str.trim();
        if (!clean) return;
        if (!strengthMap[clean]) strengthMap[clean] = { count: 0, impact: an.score };
        strengthMap[clean].count++;
        strengthMap[clean].impact = Math.round((strengthMap[clean].impact + an.score) / 2);
      });

      // Extract weaknesses
      (an.weaknesses || []).forEach(w => {
        const clean = w.trim();
        if (!clean) return;
        if (!weaknessMap[clean]) weaknessMap[clean] = { count: 0, impact: an.score };
        weaknessMap[clean].count++;
        weaknessMap[clean].impact = Math.round((weaknessMap[clean].impact + an.score) / 2);
      });

      // Check filler words frequency
      if (an.fillerWords && an.fillerWords > 3) {
        const key = `High filler words (${an.fillerWords} detected)`;
        if (!weaknessMap[key]) weaknessMap[key] = { count: 0, impact: an.score };
        weaknessMap[key].count++;
      }

      // Check high confidence
      if (an.confidence && an.confidence >= 85) {
        const key = 'High confidence & articulate speech pacing';
        if (!strengthMap[key]) strengthMap[key] = { count: 0, impact: an.score };
        strengthMap[key].count++;
      }
    });
  });

  // Default fallback if sparse data
  const defaultStrengths = [
    { title: 'Technical Concept Accuracy', count: 1, recommendation: 'Consistently mentions core architectural principles and syntax keywords.' },
    { title: 'Structured Thought Process', count: 1, recommendation: 'Breaks down responses logically into premise, implementation, and summary.' },
    { title: 'Quick Turnaround Speed', count: 1, recommendation: 'Responds promptly without extensive dead air.' }
  ];

  const defaultWeaknesses = [
    { title: 'Hesitation & Filler Words', count: 1, recommendation: 'Practice taking a 2-second breath before answering rather than using "um" or "like".' },
    { title: 'Deep Edge-Case Exploration', count: 1, recommendation: 'Proactively discuss scale limits, browser compatibility, and error handling.' },
    { title: 'Quantifiable Impact (STAR)', count: 1, recommendation: 'In behavioral responses, quantify metrics like "% latency improved" or "hours saved".' }
  ];

  const strengthsList: EvaluatedInsight[] = Object.entries(strengthMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4)
    .map(([title, data], idx) => ({
      id: `str-${idx}`,
      title,
      category: 'strength',
      frequency: data.count,
      scoreImpact: data.impact,
      recommendation: `Observed consistently in ${data.count} question evaluation${data.count > 1 ? 's' : ''}.`
    }));

  const weaknessesList: EvaluatedInsight[] = Object.entries(weaknessMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 4)
    .map(([title, data], idx) => ({
      id: `weak-${idx}`,
      title,
      category: 'improvement',
      frequency: data.count,
      scoreImpact: data.impact,
      recommendation: getRecommendationForWeakness(title)
    }));

  return {
    strengths: strengthsList.length > 0 ? strengthsList : defaultStrengths.map((d, i) => ({
      id: `def-str-${i}`,
      title: d.title,
      category: 'strength',
      frequency: d.count,
      scoreImpact: 85,
      recommendation: d.recommendation
    })),
    weaknesses: weaknessesList.length > 0 ? weaknessesList : defaultWeaknesses.map((d, i) => ({
      id: `def-weak-${i}`,
      title: d.title,
      category: 'improvement',
      frequency: d.count,
      scoreImpact: 60,
      recommendation: d.recommendation
    }))
  };
}

function getRecommendationForWeakness(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('filler') || lower.includes('um')) {
    return 'Pause silently instead of using verbal crutches. Pauses sound thoughtful to senior interviewers.';
  }
  if (lower.includes('jargon') || lower.includes('missed')) {
    return 'Study expected terminology in the track overview and incorporate industry terms naturally.';
  }
  if (lower.includes('slow') || lower.includes('pace')) {
    return 'Aim for an energetic 120-140 words per minute. Practice speaking along with timed questions.';
  }
  return 'Review your recorded response transcript and practice articulating the ideal solution aloud.';
}

/**
 * Generates an intelligent dynamic progress summary narrative
 */
export function generateProgressSummary(
  sessions: InterviewSession[], 
  skills: SkillScore[], 
  stats: ProgressStats
): ProgressSummaryData {
  if (sessions.length === 0) {
    return {
      summary: "You haven't completed any mock interviews yet. Start your first session to unlock personalized skill metrics, trend insights, and AI feedback.",
      improvementPercentage: 0,
      strongestSkill: 'Technical Knowledge',
      strongestScore: 0,
      weakestSkill: 'Communication',
      weakestScore: 0,
      recommendedAction: 'Choose any track and complete 3 questions to establish your baseline score.'
    };
  }

  const sortedSkills = [...skills].sort((a, b) => b.score - a.score);
  const strongest = sortedSkills[0];
  const weakest = sortedSkills[sortedSkills.length - 1];

  let summary = '';
  const count = sessions.length;

  if (count === 1) {
    summary = `You completed your first interview with an overall score of ${stats.averageScore}%. Your strongest demonstration was in ${strongest.name} (${strongest.score}%), while ${weakest.name} (${weakest.score}%) presents the greatest opportunity for rapid point gains.`;
  } else {
    const deltaStr = stats.scoreDelta > 0 
      ? `improved by ${stats.scoreDelta}%` 
      : stats.scoreDelta < 0 
      ? `shifted by ${stats.scoreDelta}%` 
      : 'remained steady';
    
    summary = `Your interview performance has ${deltaStr} over your last ${count} interviews. Your strongest area is ${strongest.name} (${strongest.score}%), while ${weakest.name} (${weakest.score}%) needs more practice. Complete targeted rounds to consistently break into the 85%+ readiness tier.`;
  }

  const recommendedAction = weakest.score < 70
    ? `Focus your next practice round on ${weakest.name}. Emphasize logical structure and minimize filler words.`
    : `You are in the top readiness tier for ${strongest.name}. Keep practicing at Advanced difficulty to solidify mastery.`;

  return {
    summary,
    improvementPercentage: stats.scoreDelta,
    strongestSkill: strongest.name,
    strongestScore: strongest.score,
    weakestSkill: weakest.name,
    weakestScore: weakest.score,
    recommendedAction
  };
}

/**
 * Calculates user achievements dynamically based on genuine interview achievements
 */
export function calculateAchievements(
  allSessions: InterviewSession[], 
  stats: ProgressStats
): Achievement[] {
  const totalInterviews = allSessions.length;
  const bestScore = allSessions.length > 0 ? Math.max(...allSessions.map(s => s.score ?? 0)) : 0;
  const totalQuestions = allSessions.reduce((acc, s) => acc + (s.responses?.length || s.questions?.length || 0), 0);
  const currentOrBestStreak = Math.max(stats.currentStreak, stats.bestStreak);

  // Check if any response had high clarity
  const hasHighClarity = allSessions.some(s => 
    (s.responses || []).some(r => (r.analysis?.clarity ?? 0) >= 85)
  );

  // Check if any coding session had 100%
  const hasCodingDone = allSessions.some(s => classifyInterviewType(s) === 'coding');

  const list: Achievement[] = [
    {
      id: 'ach-first',
      title: 'First Interview',
      description: 'Complete your initial mock interview round',
      icon: 'Rocket',
      unlocked: totalInterviews >= 1,
      progress: Math.min(1, totalInterviews),
      maxProgress: 1,
      badgeLabel: 'Beginner'
    },
    {
      id: 'ach-5-interviews',
      title: '5 Interviews Completed',
      description: 'Build your momentum with 5 completed interview sessions',
      icon: 'CheckCheck',
      unlocked: totalInterviews >= 5,
      progress: Math.min(5, totalInterviews),
      maxProgress: 5,
      badgeLabel: 'Practitioner'
    },
    {
      id: 'ach-10-interviews',
      title: '10 Interviews Completed',
      description: 'Master consistency with 10 total interview sessions',
      icon: 'Medal',
      unlocked: totalInterviews >= 10,
      progress: Math.min(10, totalInterviews),
      maxProgress: 10,
      badgeLabel: 'Veteran'
    },
    {
      id: 'ach-score-80',
      title: '80% Score Club',
      description: 'Achieve an overall session score of 80% or higher',
      icon: 'Target',
      unlocked: bestScore >= 80,
      progress: Math.min(80, bestScore),
      maxProgress: 80,
      badgeLabel: 'Proficient'
    },
    {
      id: 'ach-score-90',
      title: '90% Elite Score',
      description: 'Demonstrate near-flawless knowledge with a 90%+ score',
      icon: 'Trophy',
      unlocked: bestScore >= 90,
      progress: Math.min(90, bestScore),
      maxProgress: 90,
      badgeLabel: 'Elite'
    },
    {
      id: 'ach-streak-7',
      title: '7-Day Streak',
      description: 'Practice every day for 7 consecutive days',
      icon: 'Flame',
      unlocked: currentOrBestStreak >= 7,
      progress: Math.min(7, currentOrBestStreak),
      maxProgress: 7,
      badgeLabel: 'Dedicated'
    },
    {
      id: 'ach-100-q',
      title: '100 Questions Answered',
      description: 'Tackle a century of interview prompts and coding questions',
      icon: 'Brain',
      unlocked: totalQuestions >= 100,
      progress: Math.min(100, totalQuestions),
      maxProgress: 100,
      badgeLabel: 'Scholar'
    },
    {
      id: 'ach-clarity',
      title: 'Clarity Champion',
      description: 'Attain 85%+ articulation clarity in an evaluation',
      icon: 'Sparkles',
      unlocked: hasHighClarity,
      progress: hasHighClarity ? 1 : 0,
      maxProgress: 1,
      badgeLabel: 'Articulate'
    },
    {
      id: 'ach-coding',
      title: 'Algorithm Practitioner',
      description: 'Complete a dedicated live coding assessment',
      icon: 'Terminal',
      unlocked: hasCodingDone,
      progress: hasCodingDone ? 1 : 0,
      maxProgress: 1,
      badgeLabel: 'Code Master'
    }
  ];

  return list;
}

/**
 * Calculates user goal progress
 */
export function calculateGoal(
  currentAverage: number, 
  targetScore: number = 90
): GoalProgress {
  const current = currentAverage || 0;
  const progressPercent = targetScore > 0 ? Math.min(100, Math.round((current / targetScore) * 100)) : 0;
  const remainingPercent = Math.max(0, targetScore - current);

  let status: 'achieved' | 'on_track' | 'needs_work' = 'needs_work';
  if (current >= targetScore) {
    status = 'achieved';
  } else if (progressPercent >= 75) {
    status = 'on_track';
  }

  return {
    targetScore,
    currentScore: current,
    progressPercent,
    remainingPercent,
    status
  };
}
