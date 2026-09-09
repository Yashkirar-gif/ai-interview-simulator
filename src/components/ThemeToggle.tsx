import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      id="theme-switcher-toggle"
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun size={15} className="text-amber-400 transition-transform hover:rotate-45" />
        ) : (
          <Moon size={15} className="text-indigo-600 transition-transform -rotate-12" />
        )}
      </div>
      {showLabel ? (
        <span>{isDark ? 'High Contrast Light' : 'Dark Mode'}</span>
      ) : (
        <span className="hidden xl:inline text-[11px] font-mono tracking-tight opacity-80">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
