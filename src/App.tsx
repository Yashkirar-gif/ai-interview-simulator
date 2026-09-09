import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { InterviewProvider } from './InterviewContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import LandingPage from './pages/LandingPage';
import InterviewPage from './pages/InterviewPage';
import ResultsPage from './pages/ResultsPage';
import CodingPage from './pages/CodingPage';
import HistoryPage from './pages/HistoryPage';
import ProgressDashboardPage from './pages/ProgressDashboardPage';
import AdminPage from './pages/AdminPage';
import ResumeCheckerPage from './pages/ResumeCheckerPage';
import AuthGateModal from './components/AuthGateModal';

function AppShell() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-[#f8fafc] text-slate-900 selection:bg-blue-500/20'
          : 'bg-[#050505] text-gray-100 selection:bg-blue-500/30'
      }`}
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/coding" element={<CodingPage />} />
        <Route path="/progress" element={<ProgressDashboardPage />} />
        <Route path="/dashboard" element={<ProgressDashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/resume" element={<ResumeCheckerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <AuthGateModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <InterviewProvider>
        <Router>
          <AppShell />
        </Router>
      </InterviewProvider>
    </ThemeProvider>
  );
}
