import type { WatermarkConfig } from '../types';

interface Props {
  watermarks: WatermarkConfig[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: 'text' | 'image') => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}

export function WatermarkLayerList({
  watermarks, activeId, onSelect, onAdd, onRemove, onDuplicate, onToggleVisible, onMove
}: Props) {
  return (
    <div className="border-b border-gray-100 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="section-title mb-0">水印图层</span>
        <div className="flex gap-1">
          <button onClick={() => onAdd('text')} 
            className="btn-ghost px-2 py-1 text-xs flex items-center gap-1"
            title="添加文字水印">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
            </svg>
            文字
          </button>
          <button onClick={() => onAdd('image')} 
            className="btn-ghost px-2 py-1 text-xs flex items-center gap-1"
            title="添加图片水印">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            图片
          </button>
        </div>
      </div>
      
      {/* Layer list */}
      <div className="px-2 pb-2 space-y-1 max-h-40 overflow-y-auto">
        {watermarks.length === 0 && (
          <div className="text-center py-3 text-xs text-gray-400 dark:text-slate-500">
            点击上方按钮添加水印
          </div>
        )}
        {watermarks.map((wm, idx) => (
          <div
            key={wm.id}
            onClick={() => onSelect(wm.id)}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer
                        transition-all duration-150
                        ${activeId === wm.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/50'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-transparent'
                        }`}
          >
            {/* Type icon */}
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
                            bg-gray-100 dark:bg-slate-700">
              {wm.type === 'text' ? (
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" className="text-gray-500 dark:text-gray-400">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                </svg>
              ) : (
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-500 dark:text-gray-400">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              )}
            </div>
            
            {/* Label */}
            <span className="flex-1 text-xs truncate text-gray-700 dark:text-gray-300">
              {wm.type === 'text' 
                ? (wm.textConfig.text || '(空文字)') 
                : (wm.imageConfig.src ? '图片水印' : '(未选择图片)')
              }
            </span>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onMove(wm.id, 'up'); }}
                disabled={idx === 0}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-colors">
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="18,15 12,9 6,15"/>
                </svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onMove(wm.id, 'down'); }}
                disabled={idx === watermarks.length - 1}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-colors">
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onToggleVisible(wm.id); }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title={wm.visible ? '隐藏' : '显示'}>
                {wm.visible ? (
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDuplicate(wm.id); }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" title="复制">
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onRemove(wm.id); }}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors" title="删除">
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
