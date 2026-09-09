import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AuthGateModal from '../components/AuthGateModal';
import QuickStartModal from '../components/QuickStartModal';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import PerformanceCards from '../components/dashboard/PerformanceCards';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import SkillPerformanceSection from '../components/dashboard/SkillPerformanceSection';
import InterviewTypePerformance from '../components/dashboard/InterviewTypePerformance';
import RecentInterviewsTable from '../components/dashboard/RecentInterviewsTable';
import StrengthsWeaknessesSection from '../components/dashboard/StrengthsWeaknessesSection';
import ProgressSummaryCard from '../components/dashboard/ProgressSummaryCard';
import AchievementsSection from '../components/dashboard/AchievementsSection';
import ImprovementGoalCard from '../components/dashboard/ImprovementGoalCard';
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState';
import CodingProgressSection from '../components/dashboard/CodingProgressSection';
import { useInterview } from '../InterviewContext';
import { ProgressFilter, InterviewSession, InterviewType } from '../types';
import { 
  filterSessionsByPeriod, 
  calculateTopStats, 
  calculateSkillScores, 
  calculateInterviewTypeStats, 
  generateStrengthsAndWeaknesses, 
  generateProgressSummary, 
  calculateAchievements 
} from '../utils/progressCalculator';

export default function ProgressDashboardPage() {
  const navigate = useNavigate();
  const { history, setSession, refreshDeviceData } = useInterview();

  const [filter, setFilter] = useState<ProgressFilter>('30d');
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync on initial mount
  useEffect(() => {
    refreshDeviceData();
  }, [refreshDeviceData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDeviceData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Filter sessions by selected time period
  const { current: currentSessions, prior: priorSessions } = useMemo(() => {
    return filterSessionsByPeriod(history, filter);
  }, [history, filter]);

  // Compute stats for current period
  const stats = useMemo(() => {
    return calculateTopStats(currentSessions, priorSessions, history);
  }, [currentSessions, priorSessions, history]);

  // Use current period sessions if available, otherwise fall back to all sessions for diagnostics
  const evaluationSessions = useMemo(() => {
    return currentSessions.length > 0 ? currentSessions : history;
  }, [currentSessions, history]);

  // 5-Skill scores
  const skills = useMemo(() => {
    return calculateSkillScores(evaluationSessions);
  }, [evaluationSessions]);

  // Interview type performance (Technical, HR, Behavioral, Coding)
  const typeStats = useMemo(() => {
    return calculateInterviewTypeStats(evaluationSessions);
  }, [evaluationSessions]);

  // Dynamic Strengths & Weaknesses
  const { strengths, weaknesses } = useMemo(() => {
    return generateStrengthsAndWeaknesses(evaluationSessions);
  }, [evaluationSessions]);

  // AI Progress Summary Narrative
  const progressSummary = useMemo(() => {
    return generateProgressSummary(evaluationSessions, skills, stats);
  }, [evaluationSessions, skills, stats]);

  // Verifiable achievements
  const achievements = useMemo(() => {
    return calculateAchievements(history, stats);
  }, [history, stats]);

  // Navigate to session detail in ResultsPage
  const handleSelectSession = (sessionItem: InterviewSession) => {
    setSession(sessionItem);
    navigate(`/results?id=${sessionItem.id}`);
  };

  // Start new interview
  const handleStartNew = () => {
    setQuickStartOpen(true);
  };

  const handlePracticeType = (type: InterviewType) => {
    if (type === 'coding') {
      navigate('/coding');
    } else {
      setQuickStartOpen(true);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 w-full max-w-7xl mx-auto space-y-8">
      <Navbar />
      <AuthGateModal />
      <QuickStartModal isOpen={quickStartOpen} onClose={() => setQuickStartOpen(false)} />

      {/* Dashboard Header */}
      <DashboardHeader
        filter={filter}
        onFilterChange={setFilter}
        onStartNew={handleStartNew}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {history.length === 0 ? (
        /* Empty State */
        <div className="space-y-8 w-full">
          <DashboardEmptyState onStartFirst={handleStartNew} />
          {/* Always provide the Coding Progress Recharts visualization */}
          <CodingProgressSection onOpenCoding={() => navigate('/coding')} />
        </div>
      ) : (
        /* Populated Dashboard Content */
        <div className="space-y-8 w-full">
          {/* 1. Top 5 Performance Cards */}
          <PerformanceCards stats={stats} />

          {/* 2. AI Progress Summary Card */}
          <ProgressSummaryCard 
            data={progressSummary} 
            onTakeAction={handleStartNew} 
          />

          {/* 3. Performance Over Time Line Chart */}
          <PerformanceChart
            sessions={evaluationSessions}
            scoreTrend={stats.scoreTrend}
            scoreDelta={stats.scoreDelta}
          />

          {/* 4. Live Coding Progress & Attempts Visualizer (Recharts) */}
          <CodingProgressSection onOpenCoding={() => navigate('/coding')} />

          {/* 5. Skill Performance (5 Dimensions: Radar + Progress Bars) */}
          <SkillPerformanceSection
            skills={skills}
            totalSessions={evaluationSessions.length}
          />

          {/* 5. Interview Type Performance (Technical, HR, Behavioral, Coding) */}
          <InterviewTypePerformance
            stats={typeStats}
            onPracticeType={handlePracticeType}
          />

          {/* 6. Improvement Goal Tracking */}
          <ImprovementGoalCard
            currentScore={stats.averageScore}
          />

          {/* 7. Dynamic Strengths & Needs Improvement */}
          <StrengthsWeaknessesSection
            strengths={strengths}
            weaknesses={weaknesses}
          />

          {/* 8. Verifiable Milestones & Achievements */}
          <AchievementsSection
            achievements={achievements}
          />

          {/* 9. Recent Interviews Table with Direct Details Link */}
          <RecentInterviewsTable
            sessions={currentSessions.length > 0 ? currentSessions : history}
            onSelectSession={handleSelectSession}
            onStartNew={handleStartNew}
          />
        </div>
      )}
    </div>
  );
}
