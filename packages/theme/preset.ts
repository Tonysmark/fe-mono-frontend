import type { Preset, Rule, Shortcut } from "unocss";
import { tokens, unoTheme } from "./theme";

export const repoThemeRules: Rule[] = [
  [
    "safe-area-b",
    {
      paddingBottom: "env(safe-area-inset-bottom)",
    },
  ],
  [
    "safe-area-t",
    {
      paddingTop: "env(safe-area-inset-top)",
    },
  ],
  [
    "tap-transparent",
    {
      WebkitTapHighlightColor: "transparent",
    },
  ],
  [
    /^text-truncate(?:-(\d+))?$/,
    ([, lines]) => {
      if (lines) {
        return {
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        };
      }
      return {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      };
    },
  ],
];

export const repoThemeShortcuts: Shortcut[] = [
  [
    "text-default",
    "text-[color:var(--c-text,theme(colors.text))] dark:text-[color:var(--c-text,theme(colors.gray.100))]",
  ],
  [
    "text-muted",
    "text-[color:var(--c-text-muted,theme(colors.textMuted))] dark:text-[color:var(--c-text-muted,theme(colors.gray.400))]",
  ],
  [
    "bg-surface",
    "bg-[color:var(--c-surface,theme(colors.surface))] dark:bg-[color:var(--c-surface,theme(colors.gray.900))]",
  ],
  [
    "bg-surface2",
    "bg-[color:var(--c-surface2,theme(colors.surface2))] dark:bg-[color:var(--c-surface2,theme(colors.gray.800))]",
  ],
  [
    "border-line",
    "border-[color:var(--c-line,theme(colors.line))] dark:border-[color:var(--c-line,theme(colors.gray.700))]",
  ],

  // components
  [
    "card",
    "bg-surface border border-line rounded-lg shadow-sm p-4",
  ],
  [
    "btn",
    [
      "inline-flex items-center justify-center gap-2",
      "h-9 px-3 rounded-md font-medium",
      "select-none tap-transparent",
      "transition-colors duration-200",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ].join(" "),
  ],
  [
    "btn-primary",
    [
      "btn",
      "bg-brand-600 text-white",
      "hover:bg-brand-700 active:bg-brand-800",
      "focus-visible:(outline-none ring-2 ring-brand-400 ring-offset-2 ring-offset-white)",
      "dark:focus-visible:(ring-offset-gray-900)",
    ].join(" "),
  ],
  [
    "btn-ghost",
    [
      "btn",
      "bg-transparent text-default",
      "hover:bg-gray-100 active:bg-gray-200",
      "dark:hover:bg-gray-800 dark:active:bg-gray-700",
    ].join(" "),
  ],
];

export interface RepoThemePresetOptions {
  /**
   * 允许覆盖 tokens（例如品牌色/暗色语义等）
   * - 只需要传你想改的部分（浅合并）
   */
  tokens?: Partial<typeof tokens>;
}

/**
 * UnoCSS preset（必须生成）
 * - 提供可复用 theme tokens 映射 + repo 级 rules/shortcuts
 */
export function presetRepoTheme(options: RepoThemePresetOptions = {}): Preset {
  // 当前实现用浅合并即可满足大部分主题“按模块覆盖”的需求
  const mergedTokens = {
    ...tokens,
    ...(options.tokens ?? {}),
    colors: {
      ...tokens.colors,
      ...(options.tokens?.colors ?? {}),
    },
    spacing: {
      ...tokens.spacing,
      ...(options.tokens?.spacing ?? {}),
    },
    radius: {
      ...tokens.radius,
      ...(options.tokens?.radius ?? {}),
    },
    zIndex: {
      ...tokens.zIndex,
      ...(options.tokens?.zIndex ?? {}),
    },
    shadow: {
      ...tokens.shadow,
      ...(options.tokens?.shadow ?? {}),
    },
  } as const;

  return {
    name: "@repo/theme",
    theme: {
      ...unoTheme,
      colors: mergedTokens.colors,
      spacing: mergedTokens.spacing,
      // Wind3/Wind4 主题键兼容：radius/borderRadius
      borderRadius: mergedTokens.radius,
      radius: mergedTokens.radius,
      zIndex: mergedTokens.zIndex,
      // Wind3/Wind4 主题键兼容：shadow/boxShadow
      boxShadow: mergedTokens.shadow,
      shadow: mergedTokens.shadow,
    },
    rules: repoThemeRules,
    shortcuts: repoThemeShortcuts,
  };
}


