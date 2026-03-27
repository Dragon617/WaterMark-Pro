import { useEffect, useRef, useState, useCallback } from 'react';
import type { WatermarkConfig, ProcessedImage } from '../types';
import { renderWatermarks } from '../utils';

interface Props {
  image: ProcessedImage | null;
  watermarks: WatermarkConfig[];
  onAddImages: (files: File[]) => void;
}

export function PreviewCanvas({ image, watermarks, onAddImages }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const renderTimerRef = useRef<number>(0);

  const renderPreview = useCallback(async () => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const img = new Image();
    img.src = image.originalUrl;
    
    await new Promise<void>(res => {
      if (img.complete) { res(); return; }
      img.onload = () => res();
    });

    canvas.width = image.width;
    canvas.height = image.height;
    
    await renderWatermarks(canvas, img, watermarks);
  }, [image, watermarks]);

  // Debounced render
  useEffect(() => {
    clearTimeout(renderTimerRef.current);
    renderTimerRef.current = window.setTimeout(() => {
      renderPreview();
    }, 80);
    return () => clearTimeout(renderTimerRef.current);
  }, [renderPreview]);

  // Auto-fit zoom
  useEffect(() => {
    if (!image || !containerRef.current) return;
    const container = containerRef.current;
    const padding = 48;
    const maxW = container.clientWidth - padding;
    const maxH = container.clientHeight - padding;
    const scaleW = maxW / image.width;
    const scaleH = maxH / image.height;
    const fitZoom = Math.min(scaleW, scaleH, 1);
    setZoom(fitZoom);
  }, [image]);

  const zoomIn = () => setZoom(z => Math.min(z * 1.25, 4));
  const zoomOut = () => setZoom(z => Math.max(z / 1.25, 0.1));
  const zoomFit = () => {
    if (!image || !containerRef.current) return;
    const container = containerRef.current;
    const padding = 48;
    const maxW = container.clientWidth - padding;
    const maxH = container.clientHeight - padding;
    setZoom(Math.min(maxW / image.width, maxH / image.height, 1));
  };
  const zoom100 = () => setZoom(1);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onAddImages(Array.from(e.dataTransfer.files));
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col overflow-hidden relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Toolbar */}
      {image && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-slate-700 
                        bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex-shrink-0">
          <button onClick={zoomOut} className="btn-ghost p-1.5" title="缩小">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button onClick={zoomFit} className="btn-ghost px-2 py-1 text-xs font-mono" title="适配窗口">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={zoomIn} className="btn-ghost p-1.5" title="放大">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button onClick={zoom100} className="btn-ghost px-2 py-1 text-xs" title="100%">1:1</button>
          
          <div className="flex-1" />
          
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {image.width} × {image.height} px
          </span>
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6">
        {!image ? (
          <div 
            className={`w-full max-w-xl mx-auto upload-zone-new h-80 relative overflow-hidden group
                            ${isDragOver ? 'drag-over' : ''}`}
               onClick={() => {
                 const input = document.querySelector<HTMLInputElement>('input[type="file"]');
                 if (input) input.click();
               }}>
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900" />
            
            {/* 装饰性圆形 */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-100 dark:bg-purple-900/30 rounded-full blur-2xl" />
            
            {/* 主内容 */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-5">
              {/* 上传图标容器 */}
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-primary-500 to-purple-500 
                              dark:from-blue-600 dark:via-primary-600 dark:to-purple-600
                              flex items-center justify-center shadow-xl shadow-blue-500/25 dark:shadow-blue-500/20
                              transform transition-all duration-300 ${isDragOver ? 'scale-110' : 'group-hover:scale-110'}`}>
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
              </div>
              
              {/* 文字说明 */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  点击上传图片
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  或将图片拖放到此处
                </p>
              </div>
              
              {/* 格式提示 */}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full">
                  JPG
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full">
                  PNG
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full">
                  WEBP
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full">
                  GIF
                </span>
              </div>
              
              {/* 特色提示 */}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                支持批量添加，最多 50 张图片
              </p>
            </div>
            
            {/* 悬停光效边框 */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 transition-colors duration-300 pointer-events-none" />
          </div>
        ) : (
          <div 
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease'
            }}
          >
            <canvas
              ref={canvasRef}
              className="shadow-2xl rounded-lg"
              style={{ display: 'block' }}
            />
          </div>
        )}
        
        {isDragOver && (
          <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-400/10 
                          border-2 border-dashed border-primary-500 rounded-lg
                          flex items-center justify-center pointer-events-none">
            <div className="text-primary-600 dark:text-primary-400 text-lg font-semibold">
              松开鼠标添加图片
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
