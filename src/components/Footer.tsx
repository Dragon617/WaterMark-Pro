import { useState, useEffect } from 'react';

export function Footer() {
  const [networkTime, setNetworkTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkTime = async () => {
      try {
        // 使用 worldtimeapi 获取网络时间
        const res = await fetch('https://worldtimeapi.org/api/ip', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const d = new Date(data.datetime);
          setNetworkTime(d.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }));
        }
      } catch {
        // 网络获取失败时降级为本地时间
        const d = new Date();
        setNetworkTime(d.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }));
      }
    };
    fetchNetworkTime();
  }, []);

  return (
    <footer className="h-9 flex items-center justify-center border-t border-gray-200/60 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md">
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 select-none">
        <span>©{new Date().getFullYear()} LONGSHAO</span>
        <span className="text-gray-300 dark:text-slate-600">|</span>
        <span>本站由</span>
        <a
          href="https://www.openclaw.cn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          OpenClaw龙虾
        </a>
        <span>编写</span>
        <span className="text-gray-300 dark:text-slate-600">|</span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {networkTime ?? '同步中...'}
        </span>
      </div>
    </footer>
  );
}
