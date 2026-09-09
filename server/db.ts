import fs from 'fs';
import path from 'path';

export interface DeviceRecord {
  id: string;
  visitCount: number;
  firstSeen: string;
  lastSeen: string;
  userAgent: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  testsTaken: number;
  freeTestUsed: boolean;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  lastLogin: string;
  role: 'candidate' | 'admin';
}

export interface TestSessionRecord {
  id: string;
  deviceId: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  isGuest: boolean;
  role: string;
  difficulty: string;
  interviewType?: string;
  score: number;
  startTime: number;
  endTime: number;
  questions: any[];
  responses: any[];
}

interface DatabaseSchema {
  devices: Record<string, DeviceRecord>;
  users: Record<string, UserRecord>;
  sessions: TestSessionRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'interview_db.json');

// Initial seed data so Admin Panel shows rich live analytics immediately
const SEED_DATA: DatabaseSchema = {
  devices: {
    'dev-demo-mac-01': {
      id: 'dev-demo-mac-01',
      visitCount: 14,
      firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0.0.0 Safari/537.36',
      userId: 'usr-alex',
      userName: 'Alex Rivers',
      userEmail: 'alex.rivers@techdev.io',
      testsTaken: 3,
      freeTestUsed: true
    },
    'dev-demo-win-02': {
      id: 'dev-demo-win-02',
      visitCount: 8,
      firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/122.0.0.0 Chrome/122.0.0.0 Safari/537.36',
      userId: 'usr-jordan',
      userName: 'Jordan Chen',
      userEmail: 'jordan.chen@cloudstack.net',
      testsTaken: 2,
      freeTestUsed: true
    },
    'dev-guest-phoenix-03': {
      id: 'dev-guest-phoenix-03',
      visitCount: 3,
      firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      lastSeen: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      userId: null,
      userName: 'Guest Candidate',
      userEmail: 'guest@device-dev-guest-phoenix-03',
      testsTaken: 1,
      freeTestUsed: true
    },
    'dev-guest-austin-04': {
      id: 'dev-guest-austin-04',
      visitCount: 1,
      firstSeen: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      lastSeen: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/125.0',
      userId: null,
      userName: 'Anonymous Visitor',
      userEmail: 'guest@device-dev-guest-austin-04',
      testsTaken: 0,
      freeTestUsed: false
    }
  },
  users: {
    'usr-alex': {
      id: 'usr-alex',
      name: 'Alex Rivers',
      email: 'alex.rivers@techdev.io',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      role: 'candidate'
    },
    'usr-jordan': {
      id: 'usr-jordan',
      name: 'Jordan Chen',
      email: 'jordan.chen@cloudstack.net',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      role: 'candidate'
    }
  },
  sessions: [
    {
      id: 'sess-seed-01',
      deviceId: 'dev-demo-mac-01',
      userId: 'usr-alex',
      userName: 'Alex Rivers',
      userEmail: 'alex.rivers@techdev.io',
      isGuest: false,
      role: 'frontend',
      difficulty: 'intermediate',
      score: 88,
      startTime: Date.now() - 1000 * 60 * 60 * 24 * 3,
      endTime: Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 190,
      questions: [
        {
          id: 'q1',
          text: 'Describe the browser critical rendering path from HTML parsing to pixel paint.',
          category: 'technical'
        },
        {
          id: 'q2',
          text: 'Explain Event Delegation in JavaScript and how event bubbling enables it.',
          category: 'technical'
        },
        {
          id: 'q3',
          text: 'How do you handle disagreements with a teammate regarding a technical architecture decision?',
          category: 'behavioral'
        }
      ],
      responses: [
        {
          questionId: 'q1',
          transcript: 'The browser parses HTML to generate the DOM tree, then compiles CSS into CSSOM. Then builds the render tree, calculates layout positions, and finally paints to the screen.',
          duration: 45,
          analysis: { score: 90, confidence: 92, clarity: 88, feedback: 'Strong explanation of CRP stages.' }
        },
        {
          questionId: 'q2',
          transcript: 'Event delegation allows attaching a single event listener to a parent node to manage events from children via event bubbling.',
          duration: 40,
          analysis: { score: 86, confidence: 85, clarity: 88, feedback: 'Good conceptual clarity on bubbling and memory optimization.' }
        },
        {
          questionId: 'q3',
          transcript: 'I focus on clear communication, creating minimal POCs to compare trade-offs objectively, and keeping user experience at the center.',
          duration: 52,
          analysis: { score: 88, confidence: 86, clarity: 90, feedback: 'Constructive teamwork and problem-solving mentality.' }
        }
      ]
    },
    {
      id: 'sess-seed-02',
      deviceId: 'dev-demo-win-02',
      userId: 'usr-jordan',
      userName: 'Jordan Chen',
      userEmail: 'jordan.chen@cloudstack.net',
      isGuest: false,
      role: 'fullstack',
      difficulty: 'advanced',
      score: 92,
      startTime: Date.now() - 1000 * 60 * 60 * 24 * 2,
      endTime: Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 220,
      questions: [
        { id: 'q1', text: 'How do you architect an idempotent payment processing webhook pipeline in Node.js?', category: 'technical' },
        { id: 'q2', text: 'Explain horizontal database sharding vs read-replica replication for a high-write microservice.', category: 'technical' },
        { id: 'q3', text: 'Describe an occasion where a production outage was caused by a deployment and how you orchestrated recovery.', category: 'behavioral' }
      ],
      responses: [
        {
          questionId: 'q1',
          transcript: 'I use unique idempotent keys stored in Redis with distributed locks, record transactions in an atomic ledger, and process events with retry queues.',
          duration: 58,
          analysis: { score: 94, confidence: 95, clarity: 92, feedback: 'Senior-level understanding of distributed systems idempotency.' }
        }
      ]
    },
    {
      id: 'sess-seed-03',
      deviceId: 'dev-guest-phoenix-03',
      userId: null,
      userName: 'Guest Candidate',
      userEmail: 'guest@device-dev-guest-phoenix-03',
      isGuest: true,
      role: 'react',
      difficulty: 'beginner',
      score: 82,
      startTime: Date.now() - 1000 * 60 * 60 * 18,
      endTime: Date.now() - 1000 * 60 * 60 * 18 + 1000 * 175,
      questions: [
        { id: 'q1', text: 'What is the Virtual DOM and how does React reconciliation update the UI efficiently?', category: 'technical' },
        { id: 'q2', text: 'Explain the rules of React Hooks and why they cannot be called inside loops.', category: 'technical' }
      ],
      responses: [
        {
          questionId: 'q1',
          transcript: 'The virtual DOM is a lightweight copy of the real DOM. React diffs the trees and only modifies the changed nodes.',
          duration: 44,
          analysis: { score: 82, confidence: 80, clarity: 84, feedback: 'Clear definition of reconciliation.' }
        }
      ]
    }
  ]
};

function ensureDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
      return SEED_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read/init DB file, using in-memory seed:', err);
    return SEED_DATA;
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB file:', err);
  }
}

export const db = {
  getSnapshot(): DatabaseSchema {
    return ensureDb();
  },

  trackDeviceVisit(deviceId: string, userAgent: string, userMeta?: { userId?: string; userName?: string; userEmail?: string }) {
    const data = ensureDb();
    const now = new Date().toISOString();
    
    let device = data.devices[deviceId];
    if (!device) {
      device = {
        id: deviceId,
        visitCount: 1,
        firstSeen: now,
        lastSeen: now,
        userAgent: userAgent || 'Unknown Device',
        userId: userMeta?.userId || null,
        userName: userMeta?.userName || null,
        userEmail: userMeta?.userEmail || null,
        testsTaken: 0,
        freeTestUsed: false
      };
    } else {
      device.visitCount += 1;
      device.lastSeen = now;
      if (userAgent) device.userAgent = userAgent;
      if (userMeta?.userId) device.userId = userMeta.userId;
      if (userMeta?.userName) device.userName = userMeta.userName;
      if (userMeta?.userEmail) device.userEmail = userMeta.userEmail;
    }

    data.devices[deviceId] = device;
    saveDb(data);
    return device;
  },

  getDevice(deviceId: string): DeviceRecord | null {
    const data = ensureDb();
    return data.devices[deviceId] || null;
  },

  saveUser(user: UserRecord): UserRecord {
    const data = ensureDb();
    data.users[user.id] = user;
    saveDb(data);
    return user;
  },

  findUserByEmail(email: string): UserRecord | null {
    const data = ensureDb();
    const normalized = email.toLowerCase().trim();
    return Object.values(data.users).find(u => u.email.toLowerCase() === normalized) || null;
  },

  saveSession(sessionRecord: TestSessionRecord): TestSessionRecord {
    const data = ensureDb();
    
    // Check if session already exists to avoid duplicates
    const index = data.sessions.findIndex(s => s.id === sessionRecord.id);
    if (index >= 0) {
      data.sessions[index] = sessionRecord;
    } else {
      data.sessions.unshift(sessionRecord);
    }

    // Update device record
    if (sessionRecord.deviceId) {
      let device = data.devices[sessionRecord.deviceId];
      if (!device) {
        const now = new Date().toISOString();
        device = {
          id: sessionRecord.deviceId,
          visitCount: 1,
          firstSeen: now,
          lastSeen: now,
          userAgent: 'Active Candidate Browser',
          userId: sessionRecord.userId,
          userName: sessionRecord.userName,
          userEmail: sessionRecord.userEmail,
          testsTaken: 1,
          freeTestUsed: true
        };
      } else {
        device.testsTaken += (index >= 0 ? 0 : 1);
        device.freeTestUsed = true;
        if (sessionRecord.userId) device.userId = sessionRecord.userId;
        if (sessionRecord.userName) device.userName = sessionRecord.userName;
        if (sessionRecord.userEmail) device.userEmail = sessionRecord.userEmail;
      }
      data.devices[sessionRecord.deviceId] = device;
    }

    saveDb(data);
    return sessionRecord;
  },

  getSessionsForDevice(deviceId: string, userId?: string | null): TestSessionRecord[] {
    const data = ensureDb();
    return data.sessions.filter(s => {
      if (userId && s.userId === userId) return true;
      if (deviceId && s.deviceId === deviceId) return true;
      return false;
    });
  },

  clearHistoryForDevice(deviceId: string, userId?: string | null) {
    const data = ensureDb();
    data.sessions = data.sessions.filter(s => {
      if (userId && s.userId === userId) return false;
      if (deviceId && s.deviceId === deviceId) return false;
      return true;
    });
    if (data.devices[deviceId]) {
      data.devices[deviceId].testsTaken = 0;
      data.devices[deviceId].freeTestUsed = false;
    }
    saveDb(data);
  },

  getAllSessions(): TestSessionRecord[] {
    const data = ensureDb();
    return data.sessions;
  },

  getAllDevices(): DeviceRecord[] {
    const data = ensureDb();
    return Object.values(data.devices);
  },

  getAllUsers(): UserRecord[] {
    const data = ensureDb();
    return Object.values(data.users);
  },

  deleteSession(id: string): boolean {
    const data = ensureDb();
    const initialLen = data.sessions.length;
    data.sessions = data.sessions.filter(s => s.id !== id);
    saveDb(data);
    return data.sessions.length < initialLen;
  }
};
