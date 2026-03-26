import type { Theme } from '../types';

interface Props {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

const ThemeIcon = ({ theme }: { theme: Theme }) => {
  if (theme === 'light') return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
    </svg>
  );
  if (theme === 'dark') return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
    </svg>
  );
  return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4a8 8 0 110 16z"/>
    </svg>
  );
};

export function Header({ theme, onThemeChange }: Props) {
  const cycleTheme = () => {
    const order: Theme[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    onThemeChange(order[(idx + 1) % order.length]);
  };

  const themeLabel = { light: '浅色', dark: '深色', system: '跟随系统' }[theme];

  return (
    <header className="h-14 flex items-center px-4 gap-3 border-b border-gray-200 dark:border-slate-700 
                       bg-white dark:bg-slate-800 flex-shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl 
                        flex items-center justify-center shadow-md">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white leading-tight text-sm">
            WaterMark <span className="text-primary-600">Pro</span>
          </div>
          <div className="text-[10px] text-gray-400 leading-tight">多功能水印工具</div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Stats */}
      <div className="hidden md:flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          专业图片水印
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="16,18 22,12 16,6"/>
            <polyline points="8,6 2,12 8,18"/>
          </svg>
          文字 / 图片水印
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          批量导出
        </span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={cycleTheme}
        className="btn-ghost flex items-center gap-1.5 text-sm"
        title={`当前: ${themeLabel}`}
      >
        <ThemeIcon theme={theme} />
        <span className="hidden sm:block text-xs">{themeLabel}</span>
      </button>
    </header>
  );
}
