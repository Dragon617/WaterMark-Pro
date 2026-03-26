import { useRef, useCallback, useState } from 'react';
import type { WatermarkConfig, WatermarkPosition, BlendMode } from '../types';

interface Props {
  watermark: WatermarkConfig;
  onChange: (updates: Partial<WatermarkConfig>) => void;
}

// ─── Sub-components ────────────────────────────────────

const SliderRow = ({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center gap-3 py-1">
    <label className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{label}</label>
    <input type="range" min={min} max={max} step={step} value={value}
      className="flex-1 slider-track bg-gray-200 dark:bg-slate-600"
      style={{ background: `linear-gradient(to right, #2563eb ${((value-min)/(max-min))*100}%, transparent ${((value-min)/(max-min))*100}%)` }}
      onChange={e => onChange(parseFloat(e.target.value))} />
    <input type="number" min={min} max={max} step={step} value={value}
      className="w-14 text-xs text-center input-field px-1 py-1"
      onChange={e => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
      }} />
    {unit && <span className="text-xs text-gray-400 w-4">{unit}</span>}
  </div>
);

const SelectRow = ({ label, value, options, onChange }: {
  label: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-3 py-1">
    <label className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="flex-1 input-field text-xs py-1.5">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const ColorRow = ({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-3 py-1">
    <label className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{label}</label>
    <div className="flex items-center gap-2 flex-1">
      <input type="color" value={value.startsWith('rgba') ? rgbaToHex(value) : value}
        className="w-8 h-7 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer bg-transparent p-0.5"
        onChange={e => {
          const hex = e.target.value;
          // Preserve alpha from rgba if present
          if (value.startsWith('rgba')) {
            const alpha = parseFloat(value.match(/[\d.]+(?=\))/)?.[0] ?? '1');
            onChange(`rgba(${hexToRgb(hex).join(',')},${alpha})`);
          } else {
            onChange(hex);
          }
        }} />
      <input type="text" value={value}
        className="flex-1 input-field text-xs py-1"
        onChange={e => onChange(e.target.value)} />
    </div>
  </div>
);

const ToggleRow = ({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-1">
    <label className="text-xs text-gray-500 dark:text-gray-400">{label}</label>
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
                  ${value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                        ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

// ─── Color helpers ──────────────────────────────────────
const hexToRgb = (hex: string): number[] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const rgbaToHex = (rgba: string): string => {
  const match = rgba.match(/\d+/g);
  if (!match || match.length < 3) return '#ffffff';
  return '#' + match.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
};

// ─── Position grid ──────────────────────────────────────
const POSITIONS: { value: WatermarkPosition; icon: string }[] = [
  { value: 'top-left', icon: '↖' },
  { value: 'top-center', icon: '↑' },
  { value: 'top-right', icon: '↗' },
  { value: 'middle-left', icon: '←' },
  { value: 'center', icon: '·' },
  { value: 'middle-right', icon: '→' },
  { value: 'bottom-left', icon: '↙' },
  { value: 'bottom-center', icon: '↓' },
  { value: 'bottom-right', icon: '↘' },
];

const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'source-over', label: '正常' },
  { value: 'multiply', label: '正片叠底' },
  { value: 'screen', label: '滤色' },
  { value: 'overlay', label: '叠加' },
  { value: 'darken', label: '变暗' },
  { value: 'lighten', label: '变亮' },
  { value: 'color-burn', label: '颜色加深' },
  { value: 'hard-light', label: '强光' },
  { value: 'soft-light', label: '柔光' },
];

const FONT_FAMILIES = [
  { value: 'Alibaba PuHuiTi', label: '阿里巴巴普惠体' },
  { value: 'Noto Sans SC', label: '思源黑体' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Arial Black', label: 'Arial Black' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'PingFang SC', label: '苹方 (PingFang)' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'SimHei', label: '黑体' },
  { value: 'SimSun', label: '宋体' },
  { value: 'KaiTi', label: '楷体' },
  { value: 'FangSong', label: '仿宋' },
];

// ─── Section wrapper ────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }: { 
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-slate-700/50">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left
                   hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
};

// ─── Main component ─────────────────────────────────────
export function WatermarkPanel({ watermark: wm, onChange }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const updateText = useCallback((updates: Partial<typeof wm.textConfig>) => {
    onChange({ textConfig: { ...wm.textConfig, ...updates } });
  }, [wm.textConfig, onChange]);

  const updateImage = useCallback((updates: Partial<typeof wm.imageConfig>) => {
    onChange({ imageConfig: { ...wm.imageConfig, ...updates } });
  }, [wm.imageConfig, onChange]);

  const handleWatermarkImageLoad = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      updateImage({
        src: url,
        width: Math.min(img.naturalWidth, 300),
        height: wm.imageConfig.keepAspectRatio 
          ? Math.round(Math.min(img.naturalWidth, 300) * img.naturalHeight / img.naturalWidth)
          : img.naturalHeight,
      });
    };
    img.src = url;
  };

  return (
    <div className="animate-slide-up">
      {/* ── Type switch ── */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/50">
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
          {(['text', 'image'] as const).map(type => (
            <button
              key={type}
              onClick={() => onChange({ type })}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                          ${wm.type === type 
                            ? 'bg-white dark:bg-slate-600 shadow text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
            >
              {type === 'text' ? '📝 文字水印' : '🖼 图片水印'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Text settings ── */}
      {wm.type === 'text' && (
        <Section title="文字内容">
          <div className="mb-2">
            <textarea
              value={wm.textConfig.text}
              onChange={e => updateText({ text: e.target.value })}
              placeholder="输入水印文字，支持换行..."
              rows={2}
              className="input-field text-sm resize-none"
            />
          </div>
          <SelectRow label="字体" value={wm.textConfig.fontFamily} 
            options={FONT_FAMILIES} onChange={v => updateText({ fontFamily: v })} />
          <SliderRow label="字号" value={wm.textConfig.fontSize} min={8} max={200} step={1} unit="px"
            onChange={v => updateText({ fontSize: v })} />
          <SelectRow label="粗细" value={wm.textConfig.fontWeight}
            options={[
              { value: 'normal', label: '正常' }, { value: 'bold', label: '粗体' },
              { value: '300', label: '细' }, { value: '500', label: '中等' }, 
              { value: '700', label: '粗' }, { value: '900', label: '超粗' },
            ]}
            onChange={v => updateText({ fontWeight: v as any })} />
          <SelectRow label="样式" value={wm.textConfig.fontStyle}
            options={[{ value: 'normal', label: '正常' }, { value: 'italic', label: '斜体' }]}
            onChange={v => updateText({ fontStyle: v as any })} />
        </Section>
      )}

      {/* ── Text color & stroke ── */}
      {wm.type === 'text' && (
        <Section title="颜色与描边" defaultOpen={false}>
          <ColorRow label="颜色" value={wm.textConfig.color} onChange={v => updateText({ color: v })} />
          
          {/* Color presets */}
          <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
            {[
              'rgba(255,255,255,0.8)', 'rgba(0,0,0,0.6)', 'rgba(255,255,255,0.4)',
              'rgba(0,0,0,0.3)', '#ff4444', '#2563eb', '#16a34a', '#d97706',
            ].map(c => (
              <button key={c} title={c}
                onClick={() => updateText({ color: c })}
                className={`w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110
                            ${wm.textConfig.color === c ? 'border-primary-500' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>

          <SliderRow label="描边宽度" value={wm.textConfig.strokeWidth} min={0} max={10} step={0.5}
            onChange={v => updateText({ strokeWidth: v })} />
          {wm.textConfig.strokeWidth > 0 && (
            <ColorRow label="描边色" value={wm.textConfig.strokeColor} 
              onChange={v => updateText({ strokeColor: v })} />
          )}
          <SliderRow label="字间距" value={wm.textConfig.letterSpacing} min={-5} max={20} step={0.5} unit="px"
            onChange={v => updateText({ letterSpacing: v })} />
          <SliderRow label="行高" value={wm.textConfig.lineHeight} min={0.8} max={3} step={0.05}
            onChange={v => updateText({ lineHeight: v })} />
          <SelectRow label="装饰线" value={wm.textConfig.textDecoration}
            options={[
              { value: 'none', label: '无' }, { value: 'underline', label: '下划线' },
              { value: 'line-through', label: '删除线' },
            ]}
            onChange={v => updateText({ textDecoration: v as any })} />
        </Section>
      )}

      {/* ── Text shadow ── */}
      {wm.type === 'text' && (
        <Section title="文字阴影" defaultOpen={false}>
          <ToggleRow label="启用阴影" value={wm.textConfig.shadow}
            onChange={v => updateText({ shadow: v })} />
          {wm.textConfig.shadow && (
            <>
              <ColorRow label="阴影颜色" value={wm.textConfig.shadowColor}
                onChange={v => updateText({ shadowColor: v })} />
              <SliderRow label="模糊半径" value={wm.textConfig.shadowBlur} min={0} max={30} step={1}
                onChange={v => updateText({ shadowBlur: v })} />
              <SliderRow label="水平偏移" value={wm.textConfig.shadowOffsetX} min={-20} max={20} step={1} unit="px"
                onChange={v => updateText({ shadowOffsetX: v })} />
              <SliderRow label="垂直偏移" value={wm.textConfig.shadowOffsetY} min={-20} max={20} step={1} unit="px"
                onChange={v => updateText({ shadowOffsetY: v })} />
            </>
          )}
        </Section>
      )}

      {/* ── Image watermark source ── */}
      {wm.type === 'image' && (
        <Section title="水印图片">
          <div className="mb-3">
            {wm.imageConfig.src ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 mb-2">
                <img src={wm.imageConfig.src} alt="watermark"
                  className="w-full h-24 object-contain" />
                <button
                  onClick={() => updateImage({ src: '' })}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white 
                             flex items-center justify-center text-xs hover:bg-red-600">
                  ×
                </button>
              </div>
            ) : (
              <div className="upload-zone h-20 text-xs cursor-pointer mb-2"
                onClick={() => imageInputRef.current?.click()}>
                <svg width="20" height="20" className="text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/>
                </svg>
                <span className="text-gray-400">选择水印图片</span>
              </div>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleWatermarkImageLoad(e.target.files[0]); }} />
          </div>
          <SliderRow label="宽度" value={wm.imageConfig.width} min={10} max={800} step={1} unit="px"
            onChange={v => {
              if (wm.imageConfig.keepAspectRatio && wm.imageConfig.src) {
                const img = new Image();
                img.src = wm.imageConfig.src;
                const ratio = img.naturalHeight / img.naturalWidth;
                updateImage({ width: v, height: Math.round(v * ratio) });
              } else {
                updateImage({ width: v });
              }
            }} />
          <SliderRow label="高度" value={wm.imageConfig.height} min={10} max={800} step={1} unit="px"
            onChange={v => updateImage({ height: v })} />
          <ToggleRow label="保持比例" value={wm.imageConfig.keepAspectRatio}
            onChange={v => updateImage({ keepAspectRatio: v })} />
        </Section>
      )}

      {/* ── Position ── */}
      <Section title="位置与对齐">
        {/* Position grid */}
        <div className="mb-3">
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {POSITIONS.map(p => (
              <button
                key={p.value}
                onClick={() => onChange({ position: p.value })}
                className={`h-9 text-sm rounded-xl border transition-all duration-150 font-mono
                            ${wm.position === p.value 
                              ? 'bg-primary-600 text-white border-primary-600 shadow-md' 
                              : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:border-primary-300'
                            }`}
                title={p.value}
              >
                {p.icon}
              </button>
            ))}
            <button
              onClick={() => onChange({ position: 'tile' })}
              className={`h-9 text-xs rounded-xl border transition-all duration-150
                          ${wm.position === 'tile'
                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                            : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:border-primary-300'
                          }`}
              title="平铺"
            >
              ⊞ 铺
            </button>
            <button
              onClick={() => onChange({ position: 'custom' })}
              className={`h-9 text-xs rounded-xl border transition-all duration-150
                          ${wm.position === 'custom'
                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                            : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:border-primary-300'
                          }`}
              title="自定义"
            >
              ⊕ 自定
            </button>
          </div>
        </div>

        {wm.position === 'custom' && (
          <>
            <SliderRow label="X 位置" value={wm.customX} min={0} max={100} step={0.5} unit="%"
              onChange={v => onChange({ customX: v })} />
            <SliderRow label="Y 位置" value={wm.customY} min={0} max={100} step={0.5} unit="%"
              onChange={v => onChange({ customY: v })} />
          </>
        )}

        {wm.position !== 'tile' && wm.position !== 'custom' && (
          <>
            <SliderRow label="X 偏移" value={wm.offsetX} min={-100} max={200} step={1} unit="px"
              onChange={v => onChange({ offsetX: v })} />
            <SliderRow label="Y 偏移" value={wm.offsetY} min={-100} max={200} step={1} unit="px"
              onChange={v => onChange({ offsetY: v })} />
          </>
        )}

        {wm.position === 'tile' && (
          <>
            <SliderRow label="水平间距" value={wm.tileSpacingX} min={0} max={300} step={1} unit="px"
              onChange={v => onChange({ tileSpacingX: v })} />
            <SliderRow label="垂直间距" value={wm.tileSpacingY} min={0} max={300} step={1} unit="px"
              onChange={v => onChange({ tileSpacingY: v })} />
            <SliderRow label="平铺角度" value={wm.tileAngle} min={-90} max={90} step={1} unit="°"
              onChange={v => onChange({ tileAngle: v })} />
          </>
        )}
      </Section>

      {/* ── Transform ── */}
      <Section title="变换与样式">
        <SliderRow label="不透明度" value={Math.round(wm.opacity * 100)} min={1} max={100} step={1} unit="%"
          onChange={v => onChange({ opacity: v / 100 })} />
        <SliderRow label="旋转角度" value={wm.rotation} min={-180} max={180} step={1} unit="°"
          onChange={v => onChange({ rotation: v })} />
        <SliderRow label="整体缩放" value={wm.scale} min={0.1} max={5} step={0.05}
          onChange={v => onChange({ scale: v })} />
        <SelectRow label="混合模式" value={wm.blendMode} options={BLEND_MODES}
          onChange={v => onChange({ blendMode: v as BlendMode })} />
        
        {/* Flip */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onChange({ flipX: !wm.flipX })}
            className={`flex-1 py-1.5 text-xs rounded-xl border transition-all
                        ${wm.flipX ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300' 
                                  : 'border-gray-200 dark:border-slate-600 text-gray-500 hover:border-gray-300'}`}
          >
            ↔ 水平翻转
          </button>
          <button
            onClick={() => onChange({ flipY: !wm.flipY })}
            className={`flex-1 py-1.5 text-xs rounded-xl border transition-all
                        ${wm.flipY ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                                  : 'border-gray-200 dark:border-slate-600 text-gray-500 hover:border-gray-300'}`}
          >
            ↕ 垂直翻转
          </button>
        </div>

        {/* Rotation presets */}
        <div className="flex flex-wrap gap-1 mt-2">
          {[-45, -30, -15, 0, 15, 30, 45].map(deg => (
            <button key={deg} onClick={() => onChange({ rotation: deg })}
              className={`px-2 py-1 text-xs rounded-lg border transition-all
                          ${wm.rotation === deg 
                            ? 'bg-primary-600 text-white border-primary-600' 
                            : 'border-gray-200 dark:border-slate-600 text-gray-500 hover:border-primary-300'}`}>
              {deg}°
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
