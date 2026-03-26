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
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 checker-bg">
        {!image ? (
          <div className={`w-full max-w-lg mx-auto upload-zone h-72 gap-3 transition-all duration-300
                          ${isDragOver ? 'drag-over' : ''}`}
               onClick={() => {
                 const input = document.querySelector<HTMLInputElement>('input[type="file"]');
                 if (input) input.click();
               }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 
                            dark:from-primary-900/50 dark:to-primary-800/50
                            flex items-center justify-center">
              <svg width="32" height="32" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 font-medium">拖入图片或点击上传</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">支持 JPG、PNG、WEBP、GIF 等格式，可批量添加</p>
            </div>
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
