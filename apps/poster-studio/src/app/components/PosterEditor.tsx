"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";

import { useElementSize } from "./useElementSize";
import { useHtmlImage } from "./useHtmlImage";

type CanvasPresetId = "portrait-1080x1920" | "landscape-1920x1080";

type CanvasPreset = {
  id: CanvasPresetId;
  name: string;
  width: number;
  height: number;
};

type PosterModel = {
  presetId: CanvasPresetId;
  background: string;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  cover?: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  titlePos: { x: number; y: number };
  subtitlePos: { x: number; y: number };
};

const PRESETS: CanvasPreset[] = [
  { id: "portrait-1080x1920", name: "竖版 1080×1920", width: 1080, height: 1920 },
  { id: "landscape-1920x1080", name: "横版 1920×1080", width: 1920, height: 1080 },
];

const EXPORT_PIXEL_RATIO = 2;

export function PosterEditor() {
  const [model, setModel] = useState<PosterModel>(() => ({
    presetId: "portrait-1080x1920",
    background: "#0b1220",
    title: "活动主标题",
    subtitle: "时间 · 地点 · 关键词",
    titleColor: "#ffffff",
    subtitleColor: "rgba(255,255,255,0.75)",
    cover: undefined,
    titlePos: { x: 72, y: 1180 },
    subtitlePos: { x: 72, y: 1340 },
  }));

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === model.presetId) ?? PRESETS[0],
    [model.presetId],
  );

  const stageRef = useRef<import("konva/lib/Stage").Stage | null>(null);
  const transformerRef = useRef<import("konva/lib/shapes/Transformer").Transformer | null>(null);

  const [selected, setSelected] = useState<"cover" | null>(null);

  const [canvasHostRef, canvasHostSize] = useElementSize<HTMLDivElement>();
  const canvasScale = useMemo(() => {
    const w = Math.max(1, canvasHostSize.width);
    const h = Math.max(1, canvasHostSize.height);
    return Math.min(w / preset.width, h / preset.height);
  }, [canvasHostSize.height, canvasHostSize.width, preset.height, preset.width]);

  const coverImage = useHtmlImage(model.cover?.src);

  const attachTransformer = useCallback(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    if (selected === "cover") {
      const node = stage.findOne("#cover");
      if (node) {
        transformer.nodes([node]);
        transformer.getLayer()?.batchDraw();
        return;
      }
    }

    transformer.nodes([]);
    transformer.getLayer()?.batchDraw();
  }, [selected]);

  useEffect(() => {
    attachTransformer();
  }, [attachTransformer]);

  const onUploadCover: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setModel((m) => ({
      ...m,
      cover: {
        src: url,
        x: 72,
        y: 120,
        width: preset.width - 144,
        height: Math.round((preset.width - 144) * 0.56),
      },
    }));
    setSelected("cover");
    e.currentTarget.value = "";
  }, [preset.width]);

  const exportPng = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const safeScale = Math.max(0.0001, canvasScale);
    const dataUrl = stage.toDataURL({
      pixelRatio: EXPORT_PIXEL_RATIO / safeScale,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `poster-${model.presetId}.png`;
    a.click();
  }, [canvasScale, model.presetId]);

  const onPresetChange: React.ChangeEventHandler<HTMLSelectElement> = useCallback((e) => {
    const presetId = e.target.value as CanvasPresetId;
    const nextPreset = PRESETS.find((p) => p.id === presetId);
    if (!nextPreset) return;

    setModel((m) => {
      const keepCover = m.cover
        ? {
            ...m.cover,
            x: 72,
            y: 120,
            width: nextPreset.width - 144,
            height: Math.round((nextPreset.width - 144) * 0.56),
          }
        : undefined;

      return {
        ...m,
        presetId,
        cover: keepCover,
        titlePos: { x: 72, y: Math.round(nextPreset.height * 0.62) },
        subtitlePos: { x: 72, y: Math.round(nextPreset.height * 0.70) },
      };
    });
    setSelected(null);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="h-14 border-b border-zinc-200 bg-white px-4 flex items-center gap-3">
        <div className="font-semibold tracking-tight">Poster Studio</div>
        <div className="text-xs text-zinc-500">电子版海报生成器（编辑 + 导出 PNG）</div>
        <div className="ml-auto flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm"
            value={model.presetId}
            onChange={onPresetChange}
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800"
            onClick={exportPng}
          >
            导出 PNG
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[320px] shrink-0 border-r border-zinc-200 bg-white p-4 overflow-auto">
          <div className="text-sm font-semibold mb-3">内容</div>

          <label className="block text-xs font-medium text-zinc-700 mb-1">主标题</label>
          <input
            className="mb-3 h-9 w-full rounded-md border border-zinc-200 px-3 text-sm"
            value={model.title}
            onChange={(e) => setModel((m) => ({ ...m, title: e.target.value }))}
          />

          <label className="block text-xs font-medium text-zinc-700 mb-1">副标题</label>
          <input
            className="mb-3 h-9 w-full rounded-md border border-zinc-200 px-3 text-sm"
            value={model.subtitle}
            onChange={(e) => setModel((m) => ({ ...m, subtitle: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">背景色</label>
              <input
                type="color"
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2"
                value={model.background}
                onChange={(e) => setModel((m) => ({ ...m, background: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">标题色</label>
              <input
                type="color"
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2"
                value={model.titleColor}
                onChange={(e) => setModel((m) => ({ ...m, titleColor: e.target.value }))}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-zinc-700 mb-1">封面图</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm"
              onChange={onUploadCover}
            />
            <div className="mt-2 text-xs text-zinc-500">
              提示：点击画布中的图片可选中，拖拽移动；四角可缩放。
            </div>
          </div>

          <div className="text-xs text-zinc-500 leading-5">
            导出清晰度：默认 2×。如果你把浏览器窗口缩得很小，仍会按原始尺寸导出。
          </div>
        </aside>

        <main className="flex-1 min-w-0 bg-zinc-100 p-4">
          <div
            ref={canvasHostRef}
            className="h-full w-full flex items-center justify-center rounded-xl border border-zinc-200 bg-white overflow-hidden"
          >
            <Stage
              width={preset.width}
              height={preset.height}
              scaleX={canvasScale}
              scaleY={canvasScale}
              ref={(node) => {
                stageRef.current = node;
              }}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) setSelected(null);
              }}
              onTouchStart={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) setSelected(null);
              }}
              className="shadow-sm"
            >
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={preset.width}
                  height={preset.height}
                  fill={model.background}
                />

                {model.cover && coverImage ? (
                  <KonvaImage
                    id="cover"
                    image={coverImage}
                    x={model.cover.x}
                    y={model.cover.y}
                    width={model.cover.width}
                    height={model.cover.height}
                    draggable
                    onClick={() => {
                      setSelected("cover");
                    }}
                    onTap={() => {
                      setSelected("cover");
                    }}
                    onDragEnd={(e) => {
                      const node = e.target;
                      setModel((m) =>
                        m.cover
                          ? { ...m, cover: { ...m.cover, x: node.x(), y: node.y() } }
                          : m,
                      );
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      node.scaleX(1);
                      node.scaleY(1);

                      setModel((m) =>
                        m.cover
                          ? {
                              ...m,
                              cover: {
                                ...m.cover,
                                x: node.x(),
                                y: node.y(),
                                width: Math.max(16, node.width() * scaleX),
                                height: Math.max(16, node.height() * scaleY),
                              },
                            }
                          : m,
                      );
                    }}
                  />
                ) : null}

                <Text
                  text={model.title}
                  x={model.titlePos.x}
                  y={model.titlePos.y}
                  width={preset.width - 144}
                  fontSize={96}
                  fontStyle="bold"
                  fill={model.titleColor}
                  draggable
                  onDragEnd={(e) =>
                    setModel((m) => ({ ...m, titlePos: { x: e.target.x(), y: e.target.y() } }))
                  }
                />
                <Text
                  text={model.subtitle}
                  x={model.subtitlePos.x}
                  y={model.subtitlePos.y}
                  width={preset.width - 144}
                  fontSize={44}
                  fill={model.subtitleColor}
                  draggable
                  onDragEnd={(e) =>
                    setModel((m) => ({
                      ...m,
                      subtitlePos: { x: e.target.x(), y: e.target.y() },
                    }))
                  }
                />

                <Transformer
                  ref={(node) => {
                    transformerRef.current = node;
                  }}
                  rotateEnabled={false}
                  enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                  onTransformStart={() => {
                    // no-op: keeps transformer stable for touch/drag
                  }}
                />
              </Layer>
            </Stage>
          </div>
        </main>
      </div>
    </div>
  );
}

