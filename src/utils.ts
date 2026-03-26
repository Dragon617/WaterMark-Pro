import type { WatermarkConfig, ProcessedImage, ExportConfig } from './types';

// ─── 唯一ID生成 ────────────────────────────────────────
export const genId = (): string => 
  Math.random().toString(36).slice(2) + Date.now().toString(36);

// ─── 默认水印配置 ──────────────────────────────────────
export const createDefaultWatermark = (type: 'text' | 'image' = 'text'): WatermarkConfig => ({
  id: genId(),
  type,
  textConfig: {
    text: '水印文字',
    fontSize: 36,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: 'rgba(255,255,255,0.8)',
    strokeColor: 'rgba(0,0,0,0.3)',
    strokeWidth: 0,
    letterSpacing: 2,
    lineHeight: 1.4,
    textDecoration: 'none',
    shadow: false,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  },
  imageConfig: {
    src: '',
    width: 150,
    height: 80,
    keepAspectRatio: true,
  },
  position: 'bottom-right',
  customX: 50,
  customY: 50,
  offsetX: 20,
  offsetY: 20,
  rotation: -30,
  opacity: 0.6,
  blendMode: 'source-over',
  tileSpacingX: 120,
  tileSpacingY: 100,
  tileAngle: -30,
  scale: 1,
  flipX: false,
  flipY: false,
  visible: true,
});

// ─── 默认导出配置 ──────────────────────────────────────
export const createDefaultExport = (): ExportConfig => ({
  format: 'png',
  quality: 0.92,
  scale: 1,
  filename: 'watermarked_{name}',
});

// ─── Canvas 水印渲染引擎 ───────────────────────────────
export const renderWatermarks = async (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | HTMLCanvasElement,
  watermarks: WatermarkConfig[]
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Draw base image
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(image, 0, 0, W, H);

  for (const wm of watermarks) {
    if (!wm.visible) continue;

    ctx.save();
    ctx.globalAlpha = wm.opacity;
    ctx.globalCompositeOperation = wm.blendMode as GlobalCompositeOperation;

    if (wm.position === 'tile') {
      await drawTileWatermark(ctx, wm, W, H);
    } else {
      const { x, y } = getWatermarkPosition(wm, W, H, await measureWatermark(ctx, wm));
      await drawSingleWatermark(ctx, wm, x, y, W, H);
    }

    ctx.restore();
  }
};

// ─── 测量水印尺寸 ─────────────────────────────────────
const measureWatermark = async (
  ctx: CanvasRenderingContext2D,
  wm: WatermarkConfig
): Promise<{ w: number; h: number }> => {
  if (wm.type === 'text') {
    ctx.save();
    applyTextStyle(ctx, wm);
    const lines = wm.textConfig.text.split('\n');
    let maxW = 0;
    for (const line of lines) {
      const m = ctx.measureText(line);
      if (m.width > maxW) maxW = m.width;
    }
    const h = wm.textConfig.fontSize * wm.textConfig.lineHeight * lines.length * wm.scale;
    ctx.restore();
    return { w: maxW * wm.scale, h };
  } else {
    return {
      w: wm.imageConfig.width * wm.scale,
      h: wm.imageConfig.height * wm.scale,
    };
  }
};

// ─── 计算水印位置 ─────────────────────────────────────
const getWatermarkPosition = (
  wm: WatermarkConfig,
  W: number,
  H: number,
  size: { w: number; h: number }
): { x: number; y: number } => {
  const { w, h } = size;
  const ox = wm.offsetX;
  const oy = wm.offsetY;

  const positions: Record<string, { x: number; y: number }> = {
    'top-left':       { x: ox,           y: oy },
    'top-center':     { x: W/2 - w/2,    y: oy },
    'top-right':      { x: W - w - ox,   y: oy },
    'middle-left':    { x: ox,           y: H/2 - h/2 },
    'center':         { x: W/2 - w/2,    y: H/2 - h/2 },
    'middle-right':   { x: W - w - ox,   y: H/2 - h/2 },
    'bottom-left':    { x: ox,           y: H - h - oy },
    'bottom-center':  { x: W/2 - w/2,    y: H - h - oy },
    'bottom-right':   { x: W - w - ox,   y: H - h - oy },
    'custom':         { x: wm.customX / 100 * W - w/2, y: wm.customY / 100 * H - h/2 },
  };

  return positions[wm.position] ?? positions['center'];
};

// ─── 应用文字样式 ─────────────────────────────────────
const applyTextStyle = (ctx: CanvasRenderingContext2D, wm: WatermarkConfig) => {
  const tc = wm.textConfig;
  ctx.font = `${tc.fontStyle} ${tc.fontWeight} ${tc.fontSize * wm.scale}px ${tc.fontFamily}`;
  ctx.fillStyle = tc.color;
  ctx.strokeStyle = tc.strokeColor;
  ctx.lineWidth = tc.strokeWidth * wm.scale;
  ctx.letterSpacing = `${tc.letterSpacing}px`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  
  if (tc.shadow) {
    ctx.shadowColor = tc.shadowColor;
    ctx.shadowBlur = tc.shadowBlur;
    ctx.shadowOffsetX = tc.shadowOffsetX;
    ctx.shadowOffsetY = tc.shadowOffsetY;
  }
};

// ─── 绘制单个水印 ─────────────────────────────────────
const drawSingleWatermark = async (
  ctx: CanvasRenderingContext2D,
  wm: WatermarkConfig,
  x: number,
  y: number,
  _W: number,
  _H: number
) => {
  const size = await measureWatermark(ctx, wm);
  const cx = x + size.w / 2;
  const cy = y + size.h / 2;

  ctx.translate(cx, cy);
  ctx.rotate((wm.rotation * Math.PI) / 180);
  if (wm.flipX) ctx.scale(-1, 1);
  if (wm.flipY) ctx.scale(1, -1);
  ctx.translate(-cx, -cy);

  if (wm.type === 'text') {
    await drawTextWatermark(ctx, wm, x, y);
  } else if (wm.type === 'image' && wm.imageConfig.src) {
    await drawImageWatermark(ctx, wm, x, y);
  }
};

// ─── 绘制平铺水印 ─────────────────────────────────────
const drawTileWatermark = async (
  ctx: CanvasRenderingContext2D,
  wm: WatermarkConfig,
  W: number,
  H: number
) => {
  const size = await measureWatermark(ctx, wm);
  const spacingX = wm.tileSpacingX + size.w;
  const spacingY = wm.tileSpacingY + size.h;
  const angle = (wm.tileAngle * Math.PI) / 180;

  // Calculate tile grid based on diagonal
  const diagonal = Math.sqrt(W * W + H * H);
  const cols = Math.ceil(diagonal / spacingX) + 2;
  const rows = Math.ceil(diagonal / spacingY) + 2;

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(angle);

  for (let row = -rows; row <= rows; row++) {
    for (let col = -cols; col <= cols; col++) {
      const tx = col * spacingX + (row % 2 === 0 ? 0 : spacingX / 2);
      const ty = row * spacingY;
      
      ctx.save();
      ctx.translate(tx, ty);
      if (wm.type === 'text') {
        await drawTextWatermark(ctx, wm, -size.w / 2, -size.h / 2);
      } else if (wm.imageConfig.src) {
        await drawImageWatermark(ctx, wm, -size.w / 2, -size.h / 2);
      }
      ctx.restore();
    }
  }
  ctx.restore();
};

// ─── 绘制文字水印 ─────────────────────────────────────
const drawTextWatermark = async (
  ctx: CanvasRenderingContext2D,
  wm: WatermarkConfig,
  x: number,
  y: number
) => {
  applyTextStyle(ctx, wm);
  const tc = wm.textConfig;
  const lines = tc.text.split('\n');
  const lineH = tc.fontSize * wm.scale * tc.lineHeight;
  
  lines.forEach((line, i) => {
    const ly = y + i * lineH;
    if (tc.strokeWidth > 0) {
      ctx.strokeText(line, x, ly);
    }
    ctx.fillText(line, x, ly);
    
    if (tc.textDecoration !== 'none') {
      const m = ctx.measureText(line);
      const lineY = tc.textDecoration === 'underline' 
        ? ly + tc.fontSize * wm.scale + 2
        : ly + (tc.fontSize * wm.scale) / 2;
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + m.width, lineY);
      ctx.strokeStyle = tc.color;
      ctx.lineWidth = Math.max(1, tc.fontSize * wm.scale * 0.06);
      ctx.stroke();
    }
  });
};

// ─── 绘制图片水印 ─────────────────────────────────────
const imageCache = new Map<string, HTMLImageElement>();

const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { imageCache.set(src, img); resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
};

const drawImageWatermark = async (
  ctx: CanvasRenderingContext2D,
  wm: WatermarkConfig,
  x: number,
  y: number
) => {
  try {
    const img = await loadImage(wm.imageConfig.src);
    ctx.drawImage(
      img,
      x, y,
      wm.imageConfig.width * wm.scale,
      wm.imageConfig.height * wm.scale
    );
  } catch (e) {
    console.warn('Failed to load watermark image:', e);
  }
};

// ─── 将图片文件转为可用于Canvas的Image对象 ────────────
export const fileToImage = (file: File): Promise<{ img: HTMLImageElement; url: string }> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = reject;
    img.src = url;
  });
};

// ─── 处理并导出单张图片 ───────────────────────────────
export const processImage = async (
  processed: ProcessedImage,
  watermarks: WatermarkConfig[],
  exportCfg: ExportConfig
): Promise<string> => {
  const { img, url } = await fileToImage(processed.originalFile);
  URL.revokeObjectURL(url);

  const canvas = document.createElement('canvas');
  canvas.width = processed.width * exportCfg.scale;
  canvas.height = processed.height * exportCfg.scale;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Scale watermarks proportionally
  const scaledWatermarks = watermarks.map(wm => ({
    ...wm,
    scale: wm.scale * exportCfg.scale,
    offsetX: wm.offsetX * exportCfg.scale,
    offsetY: wm.offsetY * exportCfg.scale,
    tileSpacingX: wm.tileSpacingX * exportCfg.scale,
    tileSpacingY: wm.tileSpacingY * exportCfg.scale,
    textConfig: {
      ...wm.textConfig,
      fontSize: wm.textConfig.fontSize,
    },
    imageConfig: {
      ...wm.imageConfig,
      width: wm.imageConfig.width * exportCfg.scale,
      height: wm.imageConfig.height * exportCfg.scale,
    }
  }));

  await renderWatermarks(canvas, img, scaledWatermarks as WatermarkConfig[]);

  const mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
  return canvas.toDataURL(mimeMap[exportCfg.format], exportCfg.quality);
};

// ─── 下载DataURL ──────────────────────────────────────
export const downloadDataURL = (dataUrl: string, filename: string) => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
};

// ─── 文件大小格式化 ───────────────────────────────────
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// ─── 图片尺寸读取 ─────────────────────────────────────
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to read image')); };
    img.src = url;
  });
};
