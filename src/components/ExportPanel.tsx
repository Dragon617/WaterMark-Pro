import type { ProcessedImage, ExportConfig, ExportFormat } from '../types';

interface Props {
  images: ProcessedImage[];
  exportConfig: ExportConfig;
  onExportConfigChange: (cfg: ExportConfig) => void;
  onProcessCurrent: () => void;
  onProcessAll: () => void;
  onDownload: (id: string) => void;
  onDownloadAll: () => void;
  isProcessingAll: boolean;
  processProgress: number;
  selectedImageId: string | null;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: 'png', label: 'PNG', desc: '无损，适合透明背景' },
  { value: 'jpeg', label: 'JPEG', desc: '小体积，适合照片' },
  { value: 'webp', label: 'WebP', desc: '现代格式，最小体积' },
];

export function ExportPanel({
  images, exportConfig, onExportConfigChange,
  onProcessCurrent, onProcessAll, onDownload, onDownloadAll,
  isProcessingAll, processProgress, selectedImageId
}: Props) {
  const update = (updates: Partial<ExportConfig>) => 
    onExportConfigChange({ ...exportConfig, ...updates });

  const doneCount = images.filter(i => i.status === 'done').length;
  const selectedImage = images.find(i => i.id === selectedImageId);

  return (
    <div className="p-4 space-y-5 animate-slide-up">
      {/* Format selection */}
      <div>
        <div className="section-title">导出格式</div>
        <div className="grid grid-cols-3 gap-2">
          {FORMAT_OPTIONS.map(f => (
            <button key={f.value}
              onClick={() => update({ format: f.value })}
              className={`p-2.5 rounded-xl border text-center transition-all duration-150
                          ${exportConfig.format === f.value
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                          }`}
            >
              <div className={`text-sm font-bold ${exportConfig.format === f.value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {f.label}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality (for jpeg/webp) */}
      {exportConfig.format !== 'png' && (
        <div>
          <div className="section-title">图片质量</div>
          <div className="flex items-center gap-3">
            <input type="range" min={10} max={100} step={5}
              value={Math.round(exportConfig.quality * 100)}
              className="flex-1"
              style={{ background: `linear-gradient(to right, #2563eb ${exportConfig.quality * 100}%, transparent ${exportConfig.quality * 100}%)` }}
              onChange={e => update({ quality: parseInt(e.target.value) / 100 })} />
            <span className="text-xs font-mono text-gray-600 dark:text-gray-300 w-10 text-right">
              {Math.round(exportConfig.quality * 100)}%
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>低质量</span>
            <span>高质量</span>
          </div>
        </div>
      )}

      {/* Output scale */}
      <div>
        <div className="section-title">输出尺寸</div>
        <div className="grid grid-cols-4 gap-1.5">
          {[0.5, 1, 1.5, 2].map(s => (
            <button key={s}
              onClick={() => update({ scale: s })}
              className={`py-2 text-xs rounded-xl border transition-all
                          ${exportConfig.scale === s
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                          }`}
            >
              {s}×
            </button>
          ))}
        </div>
        {selectedImage && (
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5">
            输出尺寸: {Math.round(selectedImage.width * exportConfig.scale)} × {Math.round(selectedImage.height * exportConfig.scale)} px
          </p>
        )}
      </div>

      {/* Filename template */}
      <div>
        <div className="section-title">文件名模板</div>
        <input
          type="text"
          value={exportConfig.filename}
          onChange={e => update({ filename: e.target.value })}
          className="input-field text-xs"
          placeholder="watermarked_{name}"
        />
        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
          使用 <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">{'{name}'}</code> 代表原文件名
        </p>
      </div>

      {/* Process actions */}
      <div className="space-y-2">
        <div className="section-title">处理</div>
        
        <button
          onClick={onProcessCurrent}
          disabled={!selectedImageId}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          处理当前图片
        </button>

        <button
          onClick={onProcessAll}
          disabled={images.length === 0 || isProcessingAll}
          className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
        >
          {isProcessingAll ? (
            <>
              <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              处理中... {Math.round(processProgress)}%
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              批量处理全部 ({images.length} 张)
            </>
          )}
        </button>

        {/* Progress bar */}
        {isProcessingAll && (
          <div className="bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${processProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Download */}
      {doneCount > 0 && (
        <div className="space-y-2">
          <div className="section-title">下载 ({doneCount} 张已处理)</div>
          
          {selectedImage?.status === 'done' && (
            <button
              onClick={() => selectedImageId && onDownload(selectedImageId)}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              下载当前图片
            </button>
          )}
          
          {doneCount > 1 && (
            <button
              onClick={onDownloadAll}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 17v3h18v-3M8 12l4 4 4-4M12 4v12"/>
              </svg>
              下载全部 ({doneCount} 张)
            </button>
          )}
        </div>
      )}

      {/* Status summary */}
      {images.length > 0 && (
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
          <div className="section-title">图片状态</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: '总计', value: images.length, color: 'text-gray-600 dark:text-gray-300' },
              { label: '待处理', value: images.filter(i => i.status === 'pending').length, color: 'text-gray-400' },
              { label: '已完成', value: doneCount, color: 'text-green-600 dark:text-green-400' },
              { label: '失败', value: images.filter(i => i.status === 'error').length, color: 'text-red-500' },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-gray-400">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
