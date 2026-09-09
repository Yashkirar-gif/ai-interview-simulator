import { CodingAttempt } from '../types';

const STORAGE_KEY = 'ais_coding_attempts';

// Realistic multi-attempt initial dataset demonstrating candidate progression over time
const DEFAULT_INITIAL_ATTEMPTS: CodingAttempt[] = [
  {
    id: 'code-att-1',
    timestamp: Date.now() - 4 * 86400000 - 3600000 * 5,
    questionId: 1,
    questionTitle: 'Array Intersection',
    category: 'Algorithms',
    difficulty: 'Easy',
    passedTests: 0,
    totalTests: 3,
    passRate: 0,
    allPassed: false,
    codeLength: 84,
    durationMs: 42,
    errorType: 'syntax',
    errorMessage: "Unexpected token ')' on line 3",
    errorLine: 3
  },
  {
    id: 'code-att-2',
    timestamp: Date.now() - 4 * 86400000 - 3600000 * 3,
    questionId: 1,
    questionTitle: 'Array Intersection',
    category: 'Algorithms',
    difficulty: 'Easy',
    passedTests: 1,
    totalTests: 3,
    passRate: 33,
    allPassed: false,
    codeLength: 142,
    durationMs: 28,
    errorType: 'assertion',
    errorMessage: 'Expected [9, 4] but got [9, 4, 9, 8, 4] (duplicate values not deduplicated)',
    errorLine: 4
  },
  {
    id: 'code-att-3',
    timestamp: Date.now() - 4 * 86400000,
    questionId: 1,
    questionTitle: 'Array Intersection',
    category: 'Algorithms',
    difficulty: 'Easy',
    passedTests: 3,
    totalTests: 3,
    passRate: 100,
    allPassed: true,
    codeLength: 168,
    durationMs: 19,
    errorType: null
  },
  {
    id: 'code-att-4',
    timestamp: Date.now() - 3 * 86400000 - 3600000 * 4,
    questionId: 2,
    questionTitle: 'Two Sum',
    category: 'Hash Maps',
    difficulty: 'Easy',
    passedTests: 1,
    totalTests: 3,
    passRate: 33,
    allPassed: false,
    codeLength: 110,
    durationMs: 35,
    errorType: 'assertion',
    errorMessage: 'Expected [1, 2] but got undefined for target 6',
    errorLine: 5
  },
  {
    id: 'code-att-5',
    timestamp: Date.now() - 3 * 86400000 - 3600000 * 2,
    questionId: 2,
    questionTitle: 'Two Sum',
    category: 'Hash Maps',
    difficulty: 'Easy',
    passedTests: 2,
    totalTests: 3,
    passRate: 67,
    allPassed: false,
    codeLength: 195,
    durationMs: 24,
    errorType: 'assertion',
    errorMessage: 'Failed on duplicate numbers: [3, 3] target 6',
    errorLine: 7
  },
  {
    id: 'code-att-6',
    timestamp: Date.now() - 2 * 86400000 - 3600000 * 6,
    questionId: 2,
    questionTitle: 'Two Sum',
    category: 'Hash Maps',
    difficulty: 'Easy',
    passedTests: 3,
    totalTests: 3,
    passRate: 100,
    allPassed: true,
    codeLength: 248,
    durationMs: 14,
    errorType: null
  },
  {
    id: 'code-att-7',
    timestamp: Date.now() - 2 * 86400000 - 3600000 * 1,
    questionId: 3,
    questionTitle: 'Valid Anagram',
    category: 'Strings',
    difficulty: 'Easy',
    passedTests: 2,
    totalTests: 3,
    passRate: 67,
    allPassed: false,
    codeLength: 130,
    durationMs: 31,
    errorType: 'assertion',
    errorMessage: 'Failed when strings have different lengths ("rat", "car")',
    errorLine: 4
  },
  {
    id: 'code-att-8',
    timestamp: Date.now() - 1 * 86400000 - 3600000 * 4,
    questionId: 3,
    questionTitle: 'Valid Anagram',
    category: 'Strings',
    difficulty: 'Easy',
    passedTests: 3,
    totalTests: 3,
    passRate: 100,
    allPassed: true,
    codeLength: 215,
    durationMs: 16,
    errorType: null
  },
  {
    id: 'code-att-9',
    timestamp: Date.now() - 1 * 86400000,
    questionId: 4,
    questionTitle: 'Debounce Implementation',
    category: 'JavaScript',
    difficulty: 'Medium',
    passedTests: 1,
    totalTests: 3,
    passRate: 33,
    allPassed: false,
    codeLength: 140,
    durationMs: 55,
    errorType: 'runtime',
    errorMessage: 'clearTimeout is not clearing previous timer reference',
    errorLine: 6
  },
  {
    id: 'code-att-10',
    timestamp: Date.now() - 3600000 * 2,
    questionId: 4,
    questionTitle: 'Debounce Implementation',
    category: 'JavaScript',
    difficulty: 'Medium',
    passedTests: 3,
    totalTests: 3,
    passRate: 100,
    allPassed: true,
    codeLength: 230,
    durationMs: 21,
    errorType: null
  }
];

export function getCodingAttempts(deviceId?: string): CodingAttempt[] {
  try {
    const key = deviceId ? `${STORAGE_KEY}_${deviceId}` : STORAGE_KEY;
    const raw = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed default attempts so the visualization has meaningful multi-attempt progress
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_ATTEMPTS));
      if (deviceId) {
        localStorage.setItem(`${STORAGE_KEY}_${deviceId}`, JSON.stringify(DEFAULT_INITIAL_ATTEMPTS));
      }
      return DEFAULT_INITIAL_ATTEMPTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_INITIAL_ATTEMPTS;
  } catch (e) {
    return DEFAULT_INITIAL_ATTEMPTS;
  }
}

export function saveCodingAttempt(
  attempt: Omit<CodingAttempt, 'id' | 'timestamp'>,
  deviceId?: string
): CodingAttempt {
  const newAttempt: CodingAttempt = {
    ...attempt,
    id: `code-att-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now()
  };

  try {
    const existing = getCodingAttempts(deviceId);
    const updated = [...existing, newAttempt];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (deviceId) {
      localStorage.setItem(`${STORAGE_KEY}_${deviceId}`, JSON.stringify(updated));
    }

    // Trigger reactive window event for components
    window.dispatchEvent(new CustomEvent('ais_coding_attempt_saved', { detail: newAttempt }));
  } catch (e) {
    console.warn('Failed to save coding attempt to localStorage:', e);
  }

  return newAttempt;
}

export function clearCodingAttempts(deviceId?: string): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (deviceId) {
      localStorage.removeItem(`${STORAGE_KEY}_${deviceId}`);
    }
    window.dispatchEvent(new CustomEvent('ais_coding_attempt_saved'));
  } catch (e) {
    // ignore
  }
}
