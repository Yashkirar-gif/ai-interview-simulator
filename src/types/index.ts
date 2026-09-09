export type Role = 'frontend' | 'fullstack' | 'react';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type InterviewType = 'technical' | 'hr' | 'behavioral' | 'coding';

export interface Question {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'coding' | 'hr';
  expectedKeywords: string[];
  tips: string;
  idealResponse: string;
  isAiGenerated?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: 'candidate' | 'admin';
}

export interface DeviceStats {
  deviceId: string;
  visitCount: number;
  testsTaken: number;
  freeTestUsed: boolean;
  firstSeen?: string;
  lastSeen?: string;
}

export interface InterviewSession {
  id: string;
  role: Role;
  difficulty: Difficulty;
  interviewType?: InterviewType;
  questions: Question[];
  currentQuestionIndex: number;
  startTime: number;
  endTime?: number;
  deviceId?: string;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
  isGuest?: boolean;
  score?: number;
  responses: Array<{
    questionId: string;
    transcript: string;
    duration: number;
    analysis?: ResponseAnalysis;
  }>;
}

export interface ResponseAnalysis {
  confidence: number;
  clarity: number;
  fillerWords: number;
  keywordMatch: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  score: number;
}

export interface ImprovementItem {
  area: string;
  issue: string;
  suggestion: string;
  exampleBefore?: string;
  exampleAfter?: string;
}

export interface AdditionItem {
  item: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
}

export interface RemovalItem {
  item: string;
  reason: string;
  replacement?: string;
  severity: 'critical' | 'moderate' | 'minor';
}

export interface SectionReview {
  sectionName: string;
  score: number;
  status: 'pass' | 'warning' | 'danger';
  feedback: string;
  tips: string[];
}

export interface ResumeAnalysisResult {
  atsScore: number;
  verdict: string;
  targetRole: string;
  summary: string;
  scoreBreakdown: {
    contentAndImpact: number;
    skillsAndKeywords: number;
    formattingAndStructure: number;
    brevityAndClarity: number;
  };
  whatToImprove: ImprovementItem[];
  whatToAdd: AdditionItem[];
  whatToRemove: RemovalItem[];
  keywordAnalysis: {
    matchedKeywords: string[];
    missingKeywords: string[];
    matchPercentage: number;
  };
  sectionReviews: SectionReview[];
  quickAtsTips: string[];
  analyzedAt: number;
}

export type ProgressFilter = '7d' | '30d' | '3m' | 'all';

export interface ProgressStats {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  totalQuestions: number;
  currentStreak: number;
  bestStreak: number;
  scoreDelta: number; // e.g. +12 or -4
  interviewsDelta: number;
  scoreTrend: 'improving' | 'declining' | 'stable';
}

export interface SkillScore {
  name: string;
  key: 'technical' | 'communication' | 'problemSolving' | 'confidence' | 'answerRelevance';
  score: number;
  level: 'Advanced' | 'Proficient' | 'Developing';
  insight: string;
}

export interface InterviewTypeStats {
  type: InterviewType;
  title: string;
  attempts: number;
  averageScore: number;
  bestScore: number;
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
  badgeLabel?: string;
}

export interface GoalProgress {
  targetScore: number;
  currentScore: number;
  progressPercent: number;
  remainingPercent: number;
  status: 'achieved' | 'on_track' | 'needs_work';
  deadlineDays?: number;
}

export interface ProgressSummaryData {
  summary: string;
  improvementPercentage: number;
  strongestSkill: string;
  strongestScore: number;
  weakestSkill: string;
  weakestScore: number;
  recommendedAction: string;
}

export interface EvaluatedInsight {
  id: string;
  title: string;
  category: 'strength' | 'improvement';
  frequency: number;
  scoreImpact: number;
  recommendation: string;
}

export interface CodingAttempt {
  id: string;
  timestamp: number;
  questionId: number;
  questionTitle: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  passedTests: number;
  totalTests: number;
  passRate: number; // 0 - 100
  allPassed: boolean;
  codeLength: number;
  durationMs?: number;
  errorType?: 'syntax' | 'runtime' | 'assertion' | 'missing_function' | null;
  errorMessage?: string;
  errorLine?: number | null;
}
