# WaterMark Pro

> 专业的浏览器端图片批量水印工具 — 所有处理均在本地完成，无需上传服务器，保护你的隐私。

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 功能特性

### 水印类型

- **文字水印** — 自定义字体、字号、字重、斜体、颜色、描边、阴影、行间距、字间距、下划线/删除线
- **图片水印** — 上传 Logo / 签名图，自动保持宽高比

### 位置与布局

- **9 宫格定位** — 左上 / 居上 / 右上 / 居左 / 居中 / 居右 / 左下 / 居下 / 右下
- **平铺模式** — 全图平铺，间距与角度可调
- **自定义坐标** — 百分比自由定位（拖放）
- **偏移量** — X / Y 方向像素级偏移

### 样式控制

- **透明度** — 0–100% 任意调节
- **旋转** — -180° 至 180°
- **缩放** — 0.1× 至 5×
- **水平 / 垂直翻转**
- **混合模式** — source-over / multiply / screen / overlay / darken / lighten / color-burn / hard-light / soft-light

### 多层水印

- 支持同时添加多个水印层（文字 + 图片混合）
- 图层列表支持：显示/隐藏、复制、删除、上移/下移

### 批量导出

- 拖拽或点击批量导入多张图片
- 一键处理全部 / 处理当前
- 进度条实时追踪处理进度
- 导出格式：**PNG**（无损）/ **JPEG**（小体积）/ **WebP**（现代格式）
- 可调导出质量（JPEG/WebP）、输出尺寸倍率（0.5× / 1× / 2× / 3×）
- 自定义输出文件名模板（`{name}` 占位符，自动保留原扩展名）

### 其他

- **亮色 / 暗色 / 跟随系统** 三种主题，自动记忆偏好
- 实时预览，所见即所得
- 完全本地处理，零数据上传

---

## 快速开始

### 方式一：Windows 一键脚本（推荐）

```bash
deploy.bat        # 开发模式（热更新）
deploy-prod.bat  # 生产模式构建并启动
```

### 方式二：手动启动

**环境要求：** Node.js ≥ 18

```bash
# 克隆仓库
git clone https://github.com/Dragon617/WaterMark-Pro.git
cd WaterMark-Pro

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:5173

# 生产构建
npm run build

# 预览生产版本
npm run preview
```

---

## 项目结构

```
watermark-pro/
├── src/
│   ├── assets/                   # 静态资源
│   ├── components/
│   │   ├── Header.tsx            # 顶部导航栏（主题切换按钮）
│   │   ├── ImageList.tsx         # 左侧图片列表面板（上传/删除/清空）
│   │   ├── PreviewCanvas.tsx     # 中央实时预览画布
│   │   ├── WatermarkLayerList.tsx # 水印图层管理（增删/显隐/排序/复制）
│   │   ├── WatermarkPanel.tsx    # 水印参数编辑面板
│   │   └── ExportPanel.tsx       # 导出配置与批量处理面板
│   ├── App.tsx                   # 根组件 & 全局状态管理
│   ├── App.css                   # 全局自定义样式
│   ├── index.css                 # Tailwind 入口 & 全局 CSS 变量
│   ├── types.ts                  # TypeScript 类型定义
│   ├── utils.ts                  # Canvas 水印渲染引擎 & 工具函数
│   └── main.tsx                  # 应用入口
├── public/                      # 静态公共资源
├── index.html                   # HTML 入口
├── vite.config.ts               # Vite 构建配置
├── tailwind.config.js           # Tailwind CSS 配置
├── postcss.config.js            # PostCSS 配置
├── eslint.config.js             # ESLint 配置
├── deploy.bat                   # Windows 开发模式启动脚本
├── deploy-prod.bat              # Windows 生产模式脚本
└── package.json                 # 项目依赖
```

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev/) | 19.2 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | 类型安全 |
| [Vite](https://vite.dev/) | 8.0 | 构建工具 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | 样式框架 |
| HTML5 Canvas API | — | 水印渲染引擎 |

---

## 核心架构

### 水印渲染引擎（`utils.ts`）

基于原生 HTML5 Canvas API 实现，核心函数为 `processImage()`，支持：

- **多层渲染**：按图层数组顺序依次绘制，支持任意混合模式
- **平铺算法**：基于对角线覆盖范围计算，确保全图无死角
- **图片缓存**：`imageCache` Map 避免重复加载同一图片水印
- **导出缩放**：按 `exportConfig.scale` 倍率等比缩放所有水印参数，保证高分辨率输出
- **文件名模板**：解析 `{name}` 占位符，自动拼接目标格式扩展名

### 状态管理（`App.tsx`）

使用 React `useState` + `useCallback` 管理所有状态，无外部依赖：

| 状态 | 类型 | 说明 |
|------|------|------|
| `images` | `ProcessedImage[]` | 已导入图片列表（含尺寸/状态） |
| `watermarks` | `WatermarkConfig[]` | 水印图层配置数组 |
| `activeWatermarkId` | `string \| null` | 当前编辑的水印层 ID |
| `exportConfig` | `ExportConfig` | 导出格式/质量/倍率/文件名模板 |
| `selectedImageId` | `string \| null` | 当前选中的预览图片 ID |
| `activeTab` | `'watermark' \| 'export'` | 右侧面板当前 Tab |
| `isProcessingAll` | `boolean` | 是否正在批量处理 |
| `processProgress` | `number` | 批量处理进度（0–100） |

---

## 使用流程

```
1. 拖拽或点击上传图片（支持批量）
      ↓
2. 切换右侧「水印设置」Tab
   → 添加水印层，配置文字/图片样式
   → 拖动预览图中的水印调整位置
      ↓
3. 中央预览区实时查看效果
      ↓
4. 切换右侧「导出」Tab
   → 选择格式（PNG/JPEG/WebP）
   → 调整质量、倍率、文件名模板
      ↓
5. 点击「处理全部」→ 等待进度条完成
   → 点击「下载全部」
```

---

## 开发脚本

```bash
npm run dev      # 启动开发服务器（热更新）
npm run build    # TypeScript 编译 + Vite 生产构建
npm run preview  # 预览生产构建结果
npm run lint     # ESLint 代码检查
```

---

## License

[MIT](LICENSE) © 2026 Dragon617
