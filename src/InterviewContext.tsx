import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { InterviewSession, Role, Difficulty, InterviewType, UserProfile, DeviceStats, Question } from './types';
import { 
  getRandomQuestions, 
  recordSeenQuestionIds, 
  getSingleUnseenQuestion, 
  resetSeenQuestionHistory 
} from './data/questions';
import { getOrCreateDeviceId, trackDeviceVisit, fetchDeviceStatus } from './utils/device';

interface InterviewContextType {
  session: InterviewSession | null;
  setSession: (session: InterviewSession | null) => void;
  startNewSession: (role: Role, difficulty: Difficulty, interviewType?: InterviewType) => InterviewSession | null;
  swapCurrentQuestion: (categoryPreference?: 'technical' | 'behavioral' | 'hr') => Promise<Question | null>;
  history: InterviewSession[];
  saveCompletedSession: (session: InterviewSession) => Promise<void>;
  clearHistory: () => Promise<void>;
  currentUser: UserProfile | null;
  loginUser: (name: string, email?: string) => Promise<UserProfile>;
  logoutUser: () => void;
  deviceStats: DeviceStats;
  canTakeTest: boolean;
  authGateOpen: boolean;
  setAuthGateOpen: (open: boolean) => void;
  promptAuthGate: () => void;
  refreshDeviceData: () => Promise<void>;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider = ({ children }: { children: ReactNode }) => {
  const deviceId = getOrCreateDeviceId();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);

  // Candidate Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('ais_user_profile');
      if (stored) return JSON.parse(stored);
      const name = localStorage.getItem('ais_user_name');
      if (name) {
        return {
          id: `usr-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@candidate.dev`,
          role: 'candidate'
        };
      }
    } catch (e) {
      // fallback
    }
    return null;
  });

  // Device Telemetry State (tracks how many times device visited and tests taken)
  const [deviceStats, setDeviceStats] = useState<DeviceStats>(() => {
    const localCount = parseInt(localStorage.getItem(`ais_device_visits_${deviceId}`) || '1', 10);
    const localTests = parseInt(localStorage.getItem(`ais_device_tests_${deviceId}`) || '0', 10);
    return {
      deviceId,
      visitCount: Math.max(1, localCount),
      testsTaken: localTests,
      freeTestUsed: localTests > 0
    };
  });

  // Isolated History: strictly for THIS device / user only
  const [history, setHistory] = useState<InterviewSession[]>(() => {
    try {
      const stored = localStorage.getItem(`ais_device_history_${deviceId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Refresh server telemetry & fetch isolated history
  const refreshDeviceData = useCallback(async () => {
    try {
      const telemetry = await trackDeviceVisit({
        userId: currentUser?.id,
        userName: currentUser?.name,
        userEmail: currentUser?.email
      });

      if (telemetry) {
        setDeviceStats({
          deviceId: telemetry.id,
          visitCount: telemetry.visitCount,
          testsTaken: telemetry.testsTaken,
          freeTestUsed: telemetry.freeTestUsed,
          firstSeen: telemetry.firstSeen,
          lastSeen: telemetry.lastSeen
        });
        localStorage.setItem(`ais_device_visits_${deviceId}`, telemetry.visitCount.toString());
        localStorage.setItem(`ais_device_tests_${deviceId}`, telemetry.testsTaken.toString());
      }

      // Fetch isolated history from server
      const query = new URLSearchParams({
        deviceId,
        ...(currentUser?.id ? { userId: currentUser.id } : {})
      });
      const historyRes = await fetch(`/api/history?${query.toString()}`);
      if (historyRes.ok) {
        const data = await historyRes.json();
        if (Array.isArray(data.history)) {
          setHistory(data.history);
          localStorage.setItem(`ais_device_history_${deviceId}`, JSON.stringify(data.history));
        }
      }
    } catch (err) {
      console.warn('Telemetry sync error:', err);
    }
  }, [deviceId, currentUser]);

  // Initial load sync
  useEffect(() => {
    refreshDeviceData();
  }, [refreshDeviceData]);

  // Candidate rule:
  // Logged-in users get unlimited tests.
  // Anonymous / Guest users get exactly 1 free test.
  const canTakeTest = !!currentUser || (deviceStats.testsTaken === 0 && !deviceStats.freeTestUsed);

  const promptAuthGate = () => {
    setAuthGateOpen(true);
  };

  const loginUser = async (name: string, email?: string): Promise<UserProfile> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, deviceId })
      });
      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = data.user;
        setCurrentUser(profile);
        localStorage.setItem('ais_user_profile', JSON.stringify(profile));
        localStorage.setItem('ais_user_name', profile.name);
        setAuthGateOpen(false);
        // Refresh server data with user context
        setTimeout(() => refreshDeviceData(), 100);
        return profile;
      }
    } catch (err) {
      console.error('Login error:', err);
    }

    // Local fallback if offline
    const fallbackProfile: UserProfile = {
      id: `usr-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@candidate.dev`,
      role: 'candidate'
    };
    setCurrentUser(fallbackProfile);
    localStorage.setItem('ais_user_profile', JSON.stringify(fallbackProfile));
    localStorage.setItem('ais_user_name', fallbackProfile.name);
    setAuthGateOpen(false);
    return fallbackProfile;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('ais_user_profile');
    localStorage.removeItem('ais_user_name');
    refreshDeviceData();
  };

  const startNewSession = (role: Role, difficulty: Difficulty, interviewType: InterviewType = 'technical'): InterviewSession | null => {
    // Check if free test rule is satisfied
    if (!canTakeTest) {
      setAuthGateOpen(true);
      return null;
    }

    // Collect all past question IDs from history so far for deduplication
    const pastIds: string[] = [];
    history.forEach(s => {
      if (Array.isArray(s.questions)) s.questions.forEach(q => pastIds.push(q.id));
      if (Array.isArray(s.responses)) s.responses.forEach(r => pastIds.push(r.questionId));
    });

    const questions = getRandomQuestions(role, difficulty, 3, interviewType, deviceId, pastIds);
    const newSession: InterviewSession = {
      id: `sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      role,
      difficulty,
      interviewType,
      questions,
      currentQuestionIndex: 0,
      startTime: Date.now(),
      deviceId,
      userId: currentUser?.id || null,
      userName: currentUser?.name || 'Guest Candidate',
      userEmail: currentUser?.email || `guest@device-${deviceId.slice(0, 8)}`,
      isGuest: !currentUser,
      responses: []
    };
    setSession(newSession);

    // Background enhancement: Try fetching completely novel AI-generated questions from Gemini
    const pastTexts = history.flatMap(s => s.questions?.map(q => q.text) || []).filter(Boolean);
    fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        difficulty,
        interviewType,
        count: 3,
        excludedQuestions: pastTexts.slice(-20)
      })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.success && Array.isArray(data.questions) && data.questions.length >= 2) {
          setSession(curr => {
            // Only swap in AI questions if the candidate is still on the first question and hasn't submitted an answer yet
            if (curr && curr.id === newSession.id && curr.responses.length === 0 && curr.currentQuestionIndex === 0) {
              recordSeenQuestionIds(data.questions.map((q: Question) => q.id), deviceId);
              return {
                ...curr,
                questions: data.questions
              };
            }
            return curr;
          });
        }
      })
      .catch(() => {
        // Fallback to our curated deduplicated question bank
      });

    return newSession;
  };

  const swapCurrentQuestion = async (categoryPreference?: 'technical' | 'behavioral' | 'hr'): Promise<Question | null> => {
    if (!session || !session.questions || session.questions.length === 0) return null;
    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) return null;

    const currentIds = session.questions.map(q => q.id);

    // Try AI generation for an immediate fresh question replacement first
    try {
      const pastTexts = [
        ...history.flatMap(s => s.questions?.map(q => q.text) || []),
        ...session.questions.map(q => q.text)
      ];

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: session.role,
          difficulty: session.difficulty,
          interviewType: (categoryPreference === 'behavioral' || categoryPreference === 'hr') ? categoryPreference : (session.interviewType || 'technical'),
          count: 1,
          excludedQuestions: pastTexts.slice(-20)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          const aiQuestion: Question = data.questions[0];
          recordSeenQuestionIds([aiQuestion.id], deviceId);
          const updatedQuestions = [...session.questions];
          updatedQuestions[session.currentQuestionIndex] = aiQuestion;
          setSession({
            ...session,
            questions: updatedQuestions
          });
          return aiQuestion;
        }
      }
    } catch (e) {
      // Fallback to local bank below
    }

    // Fallback: pick next unseen question from local bank
    const replacement = getSingleUnseenQuestion(
      session.role,
      session.difficulty,
      session.interviewType || 'technical',
      currentIds,
      categoryPreference || currentQ.category,
      deviceId
    );

    if (replacement) {
      const updatedQuestions = [...session.questions];
      updatedQuestions[session.currentQuestionIndex] = replacement;
      setSession({
        ...session,
        questions: updatedQuestions
      });
      return replacement;
    }
    return null;
  };

  const saveCompletedSession = async (completedSession: InterviewSession) => {
    const sessionWithMeta: InterviewSession = {
      ...completedSession,
      deviceId,
      userId: currentUser?.id || null,
      userName: currentUser?.name || 'Guest Candidate',
      userEmail: currentUser?.email || `guest@device-${deviceId.slice(0, 8)}`,
      isGuest: !currentUser
    };

    // Calculate score
    const totalScore = sessionWithMeta.responses.reduce((sum, r) => sum + (r.analysis?.score || 0), 0);
    sessionWithMeta.score = sessionWithMeta.responses.length > 0 
      ? Math.round(totalScore / sessionWithMeta.responses.length)
      : 0;

    // Record question IDs as permanently seen
    recordSeenQuestionIds(sessionWithMeta.questions.map(q => q.id), deviceId);

    // Update local state immediately
    setHistory(prev => {
      const filtered = prev.filter(s => s.id !== sessionWithMeta.id);
      const updated = [sessionWithMeta, ...filtered];
      localStorage.setItem(`ais_device_history_${deviceId}`, JSON.stringify(updated));
      return updated;
    });

    const newTestsCount = deviceStats.testsTaken + 1;
    setDeviceStats(prev => ({
      ...prev,
      testsTaken: newTestsCount,
      freeTestUsed: true
    }));
    localStorage.setItem(`ais_device_tests_${deviceId}`, newTestsCount.toString());

    // Post to full-stack Express API
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionWithMeta,
          deviceId,
          user: currentUser
        })
      });
    } catch (err) {
      console.warn('Server session save failed:', err);
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    try {
      resetSeenQuestionHistory(deviceId);
      localStorage.removeItem(`ais_device_history_${deviceId}`);
      localStorage.setItem(`ais_device_tests_${deviceId}`, '0');
      setDeviceStats(prev => ({
        ...prev,
        testsTaken: 0,
        freeTestUsed: false
      }));

      const query = new URLSearchParams({
        deviceId,
        ...(currentUser?.id ? { userId: currentUser.id } : {})
      });
      await fetch(`/api/history?${query.toString()}`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
  };

  return (
    <InterviewContext.Provider value={{
      session,
      setSession,
      startNewSession,
      swapCurrentQuestion,
      history,
      saveCompletedSession,
      clearHistory,
      currentUser,
      loginUser,
      logoutUser,
      deviceStats,
      canTakeTest,
      authGateOpen,
      setAuthGateOpen,
      promptAuthGate,
      refreshDeviceData
    }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) throw new Error('useInterview must be used within InterviewProvider');
  return context;
};
