import { useState, useCallback, useEffect } from 'react';
import type { WatermarkConfig, ProcessedImage, ExportConfig, Theme } from './types';
import { 
  createDefaultWatermark, createDefaultExport, genId,
  getImageDimensions, processImage, downloadDataURL, formatFileSize
} from './utils';
import { WatermarkPanel } from './components/WatermarkPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ImageList } from './components/ImageList';
import { ExportPanel } from './components/ExportPanel';
import { Header } from './components/Header';
import { WatermarkLayerList } from './components/WatermarkLayerList';

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('wm-theme') as Theme;
    return saved || 'system';
  });
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [watermarks, setWatermarks] = useState<WatermarkConfig[]>([createDefaultWatermark('text')]);
  const [activeWatermarkId, setActiveWatermarkId] = useState<string | null>(() => {
    const wm = createDefaultWatermark('text');
    return wm.id;
  });
  const [exportConfig, setExportConfig] = useState<ExportConfig>(createDefaultExport);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'watermark' | 'export'>('watermark');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  
  // Initialize with same watermark id
  useEffect(() => {
    if (watermarks.length > 0 && !activeWatermarkId) {
      setActiveWatermarkId(watermarks[0].id);
    }
  }, []);

  // Theme management
  useEffect(() => {
    const applyTheme = (t: Theme) => {
      const isDark = t === 'dark' || 
        (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme(theme);
    localStorage.setItem('wm-theme', theme);
    
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  // ─── Image management ──────────────────────────────
  const addImages = useCallback(async (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    const newImages: ProcessedImage[] = await Promise.all(
      validFiles.map(async file => {
        const dims = await getImageDimensions(file).catch(() => ({ width: 0, height: 0 }));
        const url = URL.createObjectURL(file);
        const id = genId();
        return {
          id,
          name: file.name,
          originalFile: file,
          originalUrl: url,
          processedUrl: null,
          width: dims.width,
          height: dims.height,
          status: 'pending' as const,
        };
      })
    );
    setImages(prev => [...prev, ...newImages]);
    if (newImages.length > 0 && !selectedImageId) {
      setSelectedImageId(newImages[0].id);
    }
  }, [selectedImageId]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.originalUrl) URL.revokeObjectURL(img.originalUrl);
      if (img?.processedUrl) URL.revokeObjectURL(img.processedUrl);
      return prev.filter(i => i.id !== id);
    });
    setSelectedImageId(prev => prev === id ? null : prev);
  }, []);

  const clearAllImages = useCallback(() => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
    });
    setImages([]);
    setSelectedImageId(null);
  }, [images]);

  // ─── Watermark management ──────────────────────────
  const addWatermark = useCallback((type: 'text' | 'image' = 'text') => {
    const wm = createDefaultWatermark(type);
    setWatermarks(prev => [...prev, wm]);
    setActiveWatermarkId(wm.id);
  }, []);

  const removeWatermark = useCallback((id: string) => {
    setWatermarks(prev => {
      const filtered = prev.filter(w => w.id !== id);
      if (activeWatermarkId === id && filtered.length > 0) {
        setActiveWatermarkId(filtered[filtered.length - 1].id);
      } else if (filtered.length === 0) {
        setActiveWatermarkId(null);
      }
      return filtered;
    });
  }, [activeWatermarkId]);

  const updateWatermark = useCallback((id: string, updates: Partial<WatermarkConfig>) => {
    setWatermarks(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const duplicateWatermark = useCallback((id: string) => {
    const wm = watermarks.find(w => w.id === id);
    if (!wm) return;
    const newWm = { ...wm, id: genId(), offsetX: wm.offsetX + 15, offsetY: wm.offsetY + 15 };
    setWatermarks(prev => [...prev, newWm]);
    setActiveWatermarkId(newWm.id);
  }, [watermarks]);

  const moveWatermarkOrder = useCallback((id: string, dir: 'up' | 'down') => {
    setWatermarks(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }, []);

  // ─── Processing ────────────────────────────────────
  const processCurrentImage = useCallback(async () => {
    if (!selectedImageId) return;
    const img = images.find(i => i.id === selectedImageId);
    if (!img) return;

    setImages(prev => prev.map(i => i.id === selectedImageId 
      ? { ...i, status: 'processing' } : i));

    try {
      const dataUrl = await processImage(img, watermarks, exportConfig);
      setImages(prev => prev.map(i => i.id === selectedImageId
        ? { ...i, status: 'done', processedUrl: dataUrl } : i));
    } catch (e) {
      setImages(prev => prev.map(i => i.id === selectedImageId
        ? { ...i, status: 'error', error: String(e) } : i));
    }
  }, [selectedImageId, images, watermarks, exportConfig]);

  const processAllImages = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessingAll(true);
    setProcessProgress(0);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      setImages(prev => prev.map(im => im.id === img.id 
        ? { ...im, status: 'processing' } : im));
      try {
        const dataUrl = await processImage(img, watermarks, exportConfig);
        setImages(prev => prev.map(im => im.id === img.id
          ? { ...im, status: 'done', processedUrl: dataUrl } : im));
      } catch (e) {
        setImages(prev => prev.map(im => im.id === img.id
          ? { ...im, status: 'error', error: String(e) } : im));
      }
      setProcessProgress(((i + 1) / images.length) * 100);
    }
    setIsProcessingAll(false);
  }, [images, watermarks, exportConfig]);

  const downloadProcessed = useCallback((id: string) => {
    const img = images.find(i => i.id === id);
    if (!img?.processedUrl) return;
    const name = exportConfig.filename
      .replace('{name}', img.name.replace(/\.[^.]+$/, ''))
      + '.' + exportConfig.format;
    downloadDataURL(img.processedUrl, name);
  }, [images, exportConfig]);

  const downloadAll = useCallback(() => {
    const done = images.filter(i => i.status === 'done' && i.processedUrl);
    done.forEach(img => downloadProcessed(img.id));
  }, [images, downloadProcessed]);

  const activeWatermark = watermarks.find(w => w.id === activeWatermarkId) ?? null;
  const selectedImage = images.find(i => i.id === selectedImageId) ?? null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header theme={theme} onThemeChange={setTheme} />
      
      <div className="flex flex-1 overflow-hidden p-3 gap-3">
        {/* ── Left Panel: Image List ── */}
        <div className="w-56 flex-shrink-0 rounded-2xl glass-card flex flex-col overflow-hidden">
          <ImageList
            images={images}
            selectedId={selectedImageId}
            onSelect={setSelectedImageId}
            onAdd={addImages}
            onRemove={removeImage}
            onClearAll={clearAllImages}
            formatFileSize={formatFileSize}
          />
        </div>

        {/* ── Center: Preview Canvas ── */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl glass-card">
          <PreviewCanvas
            image={selectedImage}
            watermarks={watermarks}
            onAddImages={addImages}
          />
        </div>

        {/* ── Right Panel: Controls ── */}
        <div className="w-80 flex-shrink-0 rounded-2xl glass-card flex flex-col overflow-hidden">
          {/* Tab switcher */}
          <div className="flex gap-2 p-3 border-b border-gray-100 dark:border-slate-700/50">
            <button 
              className={`tab-btn flex-1 ${activeTab === 'watermark' ? 'active' : ''}`}
              onClick={() => setActiveTab('watermark')}
            >
              水印设置
            </button>
            <button 
              className={`tab-btn flex-1 ${activeTab === 'export' ? 'active' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              导出
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'watermark' ? (
              <>
                {/* Watermark layer list */}
                <WatermarkLayerList
                  watermarks={watermarks}
                  activeId={activeWatermarkId}
                  onSelect={setActiveWatermarkId}
                  onAdd={addWatermark}
                  onRemove={removeWatermark}
                  onDuplicate={duplicateWatermark}
                  onToggleVisible={(id) => {
                    const wm = watermarks.find(w => w.id === id);
                    if (wm) updateWatermark(id, { visible: !wm.visible });
                  }}
                  onMove={moveWatermarkOrder}
                />
                
                {/* Active watermark editor */}
                {activeWatermark && (
                  <WatermarkPanel
                    watermark={activeWatermark}
                    onChange={(updates) => updateWatermark(activeWatermark.id, updates)}
                  />
                )}
              </>
            ) : (
              <ExportPanel
                images={images}
                exportConfig={exportConfig}
                onExportConfigChange={setExportConfig}
                onProcessCurrent={processCurrentImage}
                onProcessAll={processAllImages}
                onDownload={downloadProcessed}
                onDownloadAll={downloadAll}
                isProcessingAll={isProcessingAll}
                processProgress={processProgress}
                selectedImageId={selectedImageId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
