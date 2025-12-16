# Poster Studio

只用于**生成电子版海报**的独立应用（编辑 + 导出 PNG）。

## 技术栈选择（为什么这样选）

- **Next.js（App Router）+ React 19**：作为壳与路由/部署方案，和仓库现有 `mobile-ssr` 保持一致。
- **Konva / react-konva（Canvas 图层编辑）**：更适合“拖拽、缩放、对齐、图层”这类海报编辑需求，相比纯 HTML/CSS 更稳定可控。
- **Tailwind CSS**：快速搭建操作面板 UI。

## 本地运行

在仓库根目录执行：

```bash
pnpm --filter poster-studio dev
```

## 当前能力（MVP）

- 选择画布尺寸（竖版/横版）
- 编辑标题/副标题、背景色
- 上传封面图（可拖拽、缩放）
- 一键导出 PNG（默认 2× 清晰度）
