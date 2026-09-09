import { useState, MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, Terminal, History, Menu, X, User, Sparkles, FileCheck, TrendingUp } from 'lucide-react';
import LoginModal from './LoginModal';
import QuickStartModal from './QuickStartModal';
import ThemeToggle from './ThemeToggle';
import { useInterview } from '../InterviewContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [quickStartOpen, setQuickStartOpen] = useState(false);

  const { currentUser, loginUser, logoutUser, canTakeTest, promptAuthGate } = useInterview();

  const handleLogin = async (name: string, email?: string) => {
    await loginUser(name, email);
  };

  const handleLogout = () => {
    logoutUser();
  };

  const handlePlatformClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartFreeClick = () => {
    if (!canTakeTest) {
      promptAuthGate();
      return;
    }
    if (location.pathname === '/') {
      const tracksEl = document.getElementById('tracks');
      if (tracksEl) {
        tracksEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    setQuickStartOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass px-5 sm:px-6 py-3 rounded-2xl border border-white/10 shadow-lg shadow-black/20">
          <Link to="/" onClick={handlePlatformClick} className="flex items-center gap-2 group flex-shrink-0">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:rotate-12 transition-transform shadow-md shadow-blue-600/30">
              <Bot size={22} className="text-white" />
            </div>
            <span className="font-bold text-base sm:text-xl tracking-tight uppercase italic whitespace-nowrap">
              AI Interview <span className="text-blue-500 font-black">Sim</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-gray-400">
            <Link
              to="/"
              onClick={handlePlatformClick}
              className={`hover:text-white transition-colors ${
                location.pathname === '/' ? 'text-white font-semibold' : ''
              }`}
            >
              Platform
            </Link>
            <Link
              to="/progress"
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                location.pathname === '/progress' || location.pathname === '/dashboard' ? 'text-white font-semibold' : ''
              }`}
            >
              <TrendingUp size={15} className="text-blue-400" /> Progress
            </Link>
            <Link
              to="/coding"
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                location.pathname === '/coding' ? 'text-white font-semibold' : ''
              }`}
            >
              <Terminal size={15} /> Coding Round
            </Link>
            <Link
              to="/history"
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                location.pathname === '/history' ? 'text-white font-semibold' : ''
              }`}
            >
              <History size={15} /> History
            </Link>
            <Link
              to="/resume"
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                location.pathname === '/resume' ? 'text-white font-semibold' : ''
              }`}
            >
              <FileCheck size={15} className="text-emerald-400" /> Resume Checker
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setLoginModalOpen(true)}
              className={`text-sm font-semibold px-3.5 py-2 transition-colors flex items-center gap-1.5 glass rounded-xl border hover:bg-white/5 ${
                currentUser ? 'border-blue-500/40 text-white' : 'border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <User size={15} className={currentUser ? "text-blue-400" : ""} />
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </button>
            <button
              onClick={handleStartFreeClick}
              className="bg-white text-black px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-1.5"
            >
              <Sparkles size={15} className="text-blue-600" />
              {canTakeTest ? 'Start Free' : 'Sign In to Test'}
            </button>
          </div>

          {/* Mobile Menu Button & Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle className="!px-2.5 !py-1.5" />
            <button
              onClick={handleStartFreeClick}
              className="bg-white text-black px-3 py-1.5 rounded-xl text-xs font-bold"
            >
              {canTakeTest ? 'Start' : 'Sign In'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 glass rounded-xl text-gray-300 hover:text-white"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 glass p-4 rounded-2xl border border-white/10 space-y-3 shadow-2xl">
            <Link
              to="/"
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="block py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/5"
            >
              Platform
            </Link>
            <Link
              to="/progress"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/5 text-blue-400"
            >
              <TrendingUp size={16} /> Progress
            </Link>
            <Link
              to="/coding"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/5"
            >
              <Terminal size={16} /> Coding Round
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/5"
            >
              <History size={16} /> History
            </Link>
            <Link
              to="/resume"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/5 text-emerald-400"
            >
              <FileCheck size={16} /> Resume Checker
            </Link>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between px-1">
              <span className="text-xs text-gray-400 font-medium">Appearance</span>
              <ThemeToggle showLabel className="!text-xs !py-1 !px-2.5" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLoginModalOpen(true);
                }}
                className="flex-1 py-2 rounded-xl glass text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <User size={14} />
                {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleStartFreeClick();
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                {canTakeTest ? 'Start Free' : 'Sign In'}
              </button>
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        currentUser={currentUser?.name || null}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <QuickStartModal
        isOpen={quickStartOpen}
        onClose={() => setQuickStartOpen(false)}
      />
    </>
  );
}
