// ─── 水印核心类型定义 ────────────────────────────────

export type WatermarkType = 'text' | 'image';
export type WatermarkPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'tile' | 'custom';
export type BlendMode = 
  | 'source-over' | 'multiply' | 'screen' | 'overlay' 
  | 'darken' | 'lighten' | 'color-burn' | 'hard-light' | 'soft-light';
export type ExportFormat = 'png' | 'jpeg' | 'webp';
export type Theme = 'light' | 'dark' | 'system';

export interface TextWatermarkConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  strokeColor: string;
  strokeWidth: number;
  letterSpacing: number;
  lineHeight: number;
  textDecoration: 'none' | 'underline' | 'line-through';
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface ImageWatermarkConfig {
  src: string;
  width: number;
  height: number;
  keepAspectRatio: boolean;
}

export interface WatermarkConfig {
  id: string;
  type: WatermarkType;
  
  // Text config
  textConfig: TextWatermarkConfig;
  
  // Image config
  imageConfig: ImageWatermarkConfig;
  
  // Position & Layout
  position: WatermarkPosition;
  customX: number;      // percentage 0-100
  customY: number;      // percentage 0-100
  offsetX: number;      // pixels offset from position
  offsetY: number;
  rotation: number;     // -180 to 180 degrees
  
  // Style
  opacity: number;      // 0-1
  blendMode: BlendMode;
  
  // Tile options
  tileSpacingX: number; // pixels between tiles
  tileSpacingY: number;
  tileAngle: number;    // tile rotation angle
  
  // Scale
  scale: number;        // 0.1 to 5
  
  // Flip
  flipX: boolean;
  flipY: boolean;
  
  // Visibility
  visible: boolean;
}

export interface ProcessedImage {
  id: string;
  name: string;
  originalFile: File;
  originalUrl: string;
  processedUrl: string | null;
  width: number;
  height: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

export interface ExportConfig {
  format: ExportFormat;
  quality: number;    // 0-1 for jpeg/webp
  scale: number;      // output scale multiplier
  filename: string;
}

export interface AppState {
  theme: Theme;
  images: ProcessedImage[];
  watermarks: WatermarkConfig[];
  activeWatermarkId: string | null;
  exportConfig: ExportConfig;
  previewMode: 'original' | 'watermarked' | 'split';
}
