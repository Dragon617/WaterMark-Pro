# WaterMark Pro

> 专业的浏览器端图片批量水印工具 — 所有处理均在本地完成，无需上传服务器，保护你的隐私。

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 功能特性

### 水印类型
- **文字水印** — 支持自定义字体、字号、颜色、描边、阴影、行间距、字间距
- **图片水印** — 支持上传 Logo / 签名图片，自动保持宽高比

### 位置与布局
- **9 宫格定位** — 左上 / 居上 / 右上 / 居左 / 居中 / 居右 / 左下 / 居下 / 右下
- **平铺模式** — 全图平铺，支持调整横纵间距和平铺角度
- **自定义坐标** — 百分比坐标自由拖放
- **偏移量调整** — X/Y 方向像素偏移

### 样式控制
- **透明度** — 0%–100% 任意调节
- **旋转** — -180° 至 180°
- **缩放** — 0.1× 至 5×
- **水平/垂直翻转**
- **混合模式** — 支持 source-over、multiply、screen、overlay、darken、lighten、color-burn、hard-light、soft-light

### 多层水印
- 支持同时添加多个水印层（文字 + 图片混合）
- 图层列表支持显示/隐藏、上移/下移、复制、删除

### 批量导出
- 支持同时导入多张图片（拖拽 / 点击上传）
- 一键批量处理所有图片
- 导出格式：**PNG**（无损）/ **JPEG**（小体积）/ **WebP**（现代格式）
- 可设置导出质量（JPEG/WebP）和输出尺寸倍率
- 自定义输出文件名模板（支持 `{name}` 占位符）

### 其他
- **亮色 / 暗色 / 跟随系统** 三种主题，记忆用户偏好
- 实时预览，所见即所得
- 完全本地处理，零数据上传

---

## 快速开始

### 方式一：一键启动（推荐 Windows 用户）

```bash
# 双击项目根目录下的
deploy.bat         # 开发模式启动（带热更新）
deploy-prod.bat    # 生产模式部署
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

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 项目结构

```
watermark-pro/
├── src/
│   ├── components/
│   │   ├── Header.tsx            # 顶部导航栏（主题切换）
│   │   ├── ImageList.tsx         # 左侧图片列表面板
│   │   ├── PreviewCanvas.tsx     # 中央实时预览画布
│   │   ├── WatermarkLayerList.tsx # 水印图层管理列表
│   │   ├── WatermarkPanel.tsx    # 水印参数编辑面板
│   │   └── ExportPanel.tsx       # 导出配置与批量处理面板
│   ├── types.ts                  # TypeScript 类型定义
│   ├── utils.ts                  # Canvas 水印渲染引擎 & 工具函数
│   ├── App.tsx                   # 根组件 & 全局状态管理
│   ├── App.css                   # 全局自定义样式
│   └── main.tsx                  # 应用入口
├── public/                       # 静态资源
├── deploy.bat                    # Windows 一键开发启动脚本
├── deploy-prod.bat               # Windows 一键生产部署脚本
├── vite.config.ts                # Vite 构建配置
├── tailwind.config.js            # Tailwind CSS 配置
└── package.json                  # 项目依赖
```

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev/) | 19 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | 类型安全 |
| [Vite](https://vite.dev/) | 8.0 | 构建工具 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | 样式框架 |
| HTML5 Canvas API | — | 水印渲染引擎 |

---

## 核心架构说明

### 水印渲染引擎（`utils.ts`）

所有水印渲染基于原生 **HTML5 Canvas API** 实现，支持：

- **多层渲染**：按图层顺序依次绘制，支持任意混合模式
- **平铺算法**：基于对角线计算覆盖范围，确保全图无死角
- **图片缓存**：`imageCache` Map 避免重复加载图片水印
- **导出缩放**：输出时按 `scale` 倍率等比缩放所有水印参数，保证高分辨率质量

### 状态管理

使用 React 内置的 `useState` + `useCallback` 管理全局状态，所有逻辑集中在 `App.tsx`：

- `images` — 图片列表（含处理状态）
- `watermarks` — 水印图层配置数组
- `activeWatermarkId` — 当前编辑的水印层
- `exportConfig` — 导出参数

---

## 使用流程

```
1. 拖拽或点击上传图片（支持批量）
      ↓
2. 在右侧「水印设置」面板配置水印样式
      ↓
3. 中央预览区实时查看效果
      ↓
4. 切换到「导出」面板，选择格式和质量
      ↓
5. 点击「处理全部」→「下载全部」
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
