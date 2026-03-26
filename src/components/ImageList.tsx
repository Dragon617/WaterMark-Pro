import { useRef, useCallback, useState } from 'react';
import type { ProcessedImage } from '../types';

interface Props {
  images: ProcessedImage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  formatFileSize?: (bytes: number) => string;
}

const StatusDot = ({ status }: { status: ProcessedImage['status'] }) => {
  const colors = {
    pending: 'bg-gray-300 dark:bg-slate-500',
    processing: 'bg-yellow-400 animate-pulse',
    done: 'bg-green-400',
    error: 'bg-red-400',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} />;
};

export function ImageList({ images, selectedId, onSelect, onAdd, onRemove, onClearAll }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    onAdd(Array.from(files));
  }, [onAdd]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-slate-700">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          图片列表 ({images.length})
        </span>
        {images.length > 0 && (
          <button onClick={onClearAll} className="text-xs text-red-400 hover:text-red-500 transition-colors">
            清空
          </button>
        )}
      </div>

      {/* Drop zone / Add button */}
      <div
        className={`mx-2 mt-2 h-16 upload-zone text-xs ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <svg width="20" height="20" className="text-gray-400 dark:text-slate-500 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/>
        </svg>
        <span className="text-gray-400 dark:text-slate-500 text-center px-2">
          点击或拖入图片
        </span>
        <input 
          ref={inputRef}
          type="file" 
          accept="image/*" 
          multiple 
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Image list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {images.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-400 dark:text-slate-500">
            暂无图片
          </div>
        )}
        {images.map(img => (
          <div
            key={img.id}
            onClick={() => onSelect(img.id)}
            className={`group relative flex items-center gap-2 p-2 rounded-xl cursor-pointer
                        transition-all duration-150
                        ${selectedId === img.id 
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/50' 
                          : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-transparent'
                        }`}
          >
            {/* Thumbnail */}
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-slate-600">
              <img 
                src={img.processedUrl || img.originalUrl} 
                alt={img.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{img.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <StatusDot status={img.status} />
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {img.width}×{img.height}
                </span>
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg 
                         hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400
                         transition-all duration-150"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
