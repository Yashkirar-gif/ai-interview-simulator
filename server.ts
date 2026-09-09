import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, TestSessionRecord } from './server/db';
import { analyzeResumeWithGemini } from './server/resumeAnalyzer';
import { extractTextFromDocument } from './server/documentParser';
import { generateQuestionsWithGemini } from './server/questionGenerator';

const app = express();
const PORT = 3000;
const ADMIN_PASSCODE = process.env.ADMIN_KEY || 'admin123';

// Support larger payloads up to 50MB for resume files and documents
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper to verify admin credentials
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const providedKey = req.headers['x-admin-key'] || req.query.adminKey;
  if (providedKey === ADMIN_PASSCODE) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid Admin Security Key' });
  }
}

// ------------------- API ROUTES ------------------- //

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now(), mode: process.env.NODE_ENV || 'development' });
});

// 2. Track Device Visit (Records how many times each device has visited)
app.post('/api/track-visit', (req: Request, res: Response) => {
  try {
    const { deviceId, userAgent, userId, userName, userEmail } = req.body;
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const device = db.trackDeviceVisit(deviceId, userAgent || req.headers['user-agent'] || '', {
      userId,
      userName,
      userEmail
    });

    res.json({
      success: true,
      device: {
        id: device.id,
        visitCount: device.visitCount,
        firstSeen: device.firstSeen,
        lastSeen: device.lastSeen,
        testsTaken: device.testsTaken,
        freeTestUsed: device.freeTestUsed,
        userName: device.userName,
        userEmail: device.userEmail
      }
    });
  } catch (err: any) {
    console.error('Error tracking visit:', err);
    res.status(500).json({ error: 'Failed to record device visit' });
  }
});

// 3. Get Device Status
app.get('/api/device/:deviceId', (req: Request, res: Response) => {
  try {
    const device = db.getDevice(req.params.deviceId);
    if (!device) {
      return res.json({
        exists: false,
        visitCount: 1,
        testsTaken: 0,
        freeTestUsed: false
      });
    }
    res.json({
      exists: true,
      ...device
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to lookup device' });
  }
});

// 4. Candidate Authentication (Login / Register)
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, name, deviceId } = req.body;
    if (!email && !name) {
      return res.status(400).json({ error: 'Email or name is required' });
    }

    const lookupEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@candidate.dev`;
    let user = db.findUserByEmail(lookupEmail);

    const now = new Date().toISOString();
    if (!user) {
      user = {
        id: `usr-${Math.random().toString(36).substring(2, 10)}`,
        name: name || lookupEmail.split('@')[0],
        email: lookupEmail,
        createdAt: now,
        lastLogin: now,
        role: 'candidate'
      };
      db.saveUser(user);
    } else {
      user.lastLogin = now;
      if (name) user.name = name;
      db.saveUser(user);
    }

    // Attach user to device
    if (deviceId) {
      db.trackDeviceVisit(deviceId, req.headers['user-agent'] || '', {
        userId: user.id,
        userName: user.name,
        userEmail: user.email
      });
    }

    res.json({
      success: true,
      user,
      token: `token-${user.id}-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 5. Save Test Session (Enforces: 1 free test for guest, unlimited for logged in)
app.post('/api/sessions', (req: Request, res: Response) => {
  try {
    const { session, deviceId, user } = req.body;
    if (!session || !session.id) {
      return res.status(400).json({ error: 'Session data is required' });
    }

    // Calculate average score from responses
    const responses = session.responses || [];
    const avgScore = responses.length > 0
      ? Math.round(responses.reduce((sum: number, r: any) => sum + (r.analysis?.score || 0), 0) / responses.length)
      : 0;

    const isGuest = !user || !user.id;
    const sessionRecord: TestSessionRecord = {
      id: session.id,
      deviceId: deviceId || 'anonymous-device',
      userId: user?.id || null,
      userName: user?.name || 'Guest Candidate',
      userEmail: user?.email || `guest@device-${(deviceId || 'unknown').slice(0, 8)}`,
      isGuest,
      role: session.role || 'frontend',
      difficulty: session.difficulty || 'beginner',
      interviewType: session.interviewType || 'technical',
      score: avgScore,
      startTime: session.startTime || Date.now(),
      endTime: session.endTime || Date.now(),
      questions: session.questions || [],
      responses: responses
    };

    const saved = db.saveSession(sessionRecord);
    res.json({ success: true, session: saved });
  } catch (err: any) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Failed to record test session' });
  }
});

// 5b. Candidate Progress Metrics endpoint
app.get('/api/progress', (req: Request, res: Response) => {
  try {
    const deviceId = (req.query.deviceId as string) || '';
    const userId = (req.query.userId as string) || '';

    if (!deviceId && !userId) {
      return res.json({ sessions: [], stats: null });
    }

    const sessions = db.getSessionsForDevice(deviceId, userId);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress metrics' });
  }
});

// 6. Candidate History (Isolated: only returns tests for THIS device or user)
app.get('/api/history', (req: Request, res: Response) => {
  try {
    const deviceId = (req.query.deviceId as string) || '';
    const userId = (req.query.userId as string) || '';

    if (!deviceId && !userId) {
      return res.json({ history: [] });
    }

    const sessions = db.getSessionsForDevice(deviceId, userId);
    res.json({ history: sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 7. Clear History for THIS device / user only
app.delete('/api/history', (req: Request, res: Response) => {
  try {
    const deviceId = (req.query.deviceId as string) || '';
    const userId = (req.query.userId as string) || '';

    if (deviceId || userId) {
      db.clearHistoryForDevice(deviceId, userId);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear device history' });
  }
});

// 8a. Document Text Extraction from PDF, DOCX, TXT
app.post('/api/resume/extract-text', async (req: Request, res: Response) => {
  try {
    const { fileBase64, fileName, mimeType } = req.body;
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ error: 'fileBase64 data is required for document extraction' });
    }

    // Strip data URL prefix if present e.g. "data:application/pdf;base64,"
    const base64Data = fileBase64.includes(';base64,')
      ? fileBase64.split(';base64,')[1]
      : fileBase64;

    const buffer = Buffer.from(base64Data, 'base64');
    const result = await extractTextFromDocument(buffer, fileName || 'resume.pdf', mimeType);

    res.json({
      success: true,
      text: result.text,
      wordCount: result.wordCount,
      charCount: result.charCount,
      info: result.info
    });
  } catch (err: any) {
    console.error('Document extraction error:', err);
    res.status(500).json({
      error: 'Unable to extract text from document. You can copy and paste plain text directly into the editor.'
    });
  }
});

// 8b. AI ATS Resume Analysis
app.post('/api/resume/analyze', async (req: Request, res: Response) => {
  try {
    const { resumeText, targetRole, jobDescription } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Valid resume text content (at least 20 characters) is required for ATS analysis.' });
    }

    // Protect against oversized binary dumps or stream corruption (cap at 35,000 characters ~7,000 words)
    const sanitizedResumeText = resumeText.slice(0, 35000).trim();
    const sanitizedJobDescription = jobDescription ? String(jobDescription).slice(0, 15000).trim() : undefined;

    const analysis = await analyzeResumeWithGemini(
      sanitizedResumeText,
      targetRole || 'Full Stack Developer',
      sanitizedJobDescription
    );

    res.json({
      success: true,
      analysis
    });
  } catch (err: any) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze resume. Please try again.' });
  }
});

// 8c. AI Dynamic Interview Question Generation
app.post('/api/generate-questions', async (req: Request, res: Response) => {
  try {
    const { 
      role = 'frontend', 
      difficulty = 'intermediate', 
      interviewType = 'technical', 
      count = 3, 
      excludedQuestions = [] 
    } = req.body;

    const questions = await generateQuestionsWithGemini({
      role,
      difficulty,
      interviewType,
      count: Math.min(Math.max(1, Number(count) || 3), 10),
      excludedQuestions: Array.isArray(excludedQuestions) ? excludedQuestions : []
    });

    res.json({
      success: true,
      questions,
      source: 'gemini'
    });
  } catch (err: any) {
    console.warn('AI question generation unavailable or failed:', err.message);
    res.status(503).json({ 
      error: err.message || 'AI question generation unavailable',
      fallbackRequired: true 
    });
  }
});

// ------------------- ADMIN PANEL API ------------------- //

// Verify Admin Passcode
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { adminKey } = req.body;
  if (adminKey === ADMIN_PASSCODE) {
    res.json({ success: true, authorized: true });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect Admin Key' });
  }
});

// Admin Overview & Metrics (Who came, how many visits per device, which tests taken)
app.get('/api/admin/overview', requireAdmin, (req: Request, res: Response) => {
  try {
    const devices = db.getAllDevices();
    const sessions = db.getAllSessions();
    const users = db.getAllUsers();

    const totalUniqueDevices = devices.length;
    const totalVisits = devices.reduce((sum, d) => sum + (d.visitCount || 1), 0);
    const totalTests = sessions.length;
    const guestTests = sessions.filter(s => s.isGuest).length;
    const registeredTests = sessions.filter(s => !s.isGuest).length;

    const avgScore = totalTests > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalTests)
      : 0;

    // Track distribution
    const trackCounts: Record<string, number> = { frontend: 0, react: 0, fullstack: 0 };
    const difficultyCounts: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };

    sessions.forEach(s => {
      if (trackCounts[s.role] !== undefined) trackCounts[s.role] += 1;
      if (difficultyCounts[s.difficulty] !== undefined) difficultyCounts[s.difficulty] += 1;
    });

    res.json({
      metrics: {
        totalUniqueDevices,
        totalVisits,
        totalTests,
        totalUsers: users.length,
        guestTests,
        registeredTests,
        avgScore,
        trackCounts,
        difficultyCounts
      },
      devices: devices.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()),
      sessions: sessions.sort((a, b) => (b.endTime || b.startTime) - (a.endTime || a.startTime)),
      users
    });
  } catch (err: any) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Failed to generate admin report' });
  }
});

// Admin Delete Test Session
app.delete('/api/admin/session/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const success = db.deleteSession(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Global error handling middleware for API routes and payload limits
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      error: 'File or text content is too large. Please upload or paste a document under 25MB.'
    });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload received.' });
  }
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error occurred.' });
});

// ------------------- VITE SERVER / STATIC SERVE ------------------- //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Interview Sim full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
