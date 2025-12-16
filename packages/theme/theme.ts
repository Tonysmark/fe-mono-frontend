export const tokens = {
  colors: {
    brand: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    gray: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1f2937",
      900: "#0f172a",
      950: "#020617",
    },
    success: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#022c22",
    },
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
    },
    danger: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
      950: "#450a0a",
    },

    // semantic
    surface: "#ffffff",
    surface2: "#f8fafc",
    surface3: "#f1f5f9",
    text: "#0f172a",
    textMuted: "#475569",
    line: "#e2e8f0",
  },

  spacing: {
    0: "0px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },

  radius: {
    none: "0px",
    xs: "0.125rem",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },

  zIndex: {
    base: 0,
    sticky: 10,
    dropdown: 1000,
    overlay: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
    toast: 1500,
  },

  shadow: {
    xs: "0 1px 2px 0 rgba(2, 6, 23, 0.05)",
    sm: "0 1px 3px 0 rgba(2, 6, 23, 0.08), 0 1px 2px -1px rgba(2, 6, 23, 0.06)",
    md: "0 4px 6px -1px rgba(2, 6, 23, 0.08), 0 2px 4px -2px rgba(2, 6, 23, 0.08)",
    lg: "0 10px 15px -3px rgba(2, 6, 23, 0.10), 0 4px 6px -4px rgba(2, 6, 23, 0.10)",
    xl: "0 20px 25px -5px rgba(2, 6, 23, 0.12), 0 8px 10px -6px rgba(2, 6, 23, 0.12)",
  },

  durations: {
    fast: "120ms",
    normal: "180ms",
    slow: "240ms",
  },

  easings: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  },
} as const;

export type ThemeTokens = typeof tokens;

/**
 * UnoCSS 主题映射（可被 preset/config 复用）
 * - colors/spacing/borderRadius/zIndex/boxShadow/fontFamily 等
 */
export const unoTheme = {
  colors: tokens.colors,
  spacing: tokens.spacing,
  /**
   * Wind3/Wind4 主题键兼容
   * - Wind3 常见：borderRadius / boxShadow / breakpoints / fontFamily
   * - Wind4 文档中有 key 调整（radius/shadow/breakpoint/font 等），同时官方也尽量保持迁移兼容
   * 这里同时提供两套键，避免切换 preset 后工具类映射失效。
   */
  borderRadius: tokens.radius,
  radius: tokens.radius,
  zIndex: tokens.zIndex,
  boxShadow: tokens.shadow,
  shadow: tokens.shadow,
  fontFamily: {
    sans: [
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "PingFang SC",
      "Noto Sans CJK SC",
      "Microsoft YaHei",
      "sans-serif",
    ].join(","),
    mono: [
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "Courier New",
      "monospace",
    ].join(","),
  },
  // Wind4 可能使用 `font` 作为 key
  font: {
    sans: [
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "PingFang SC",
      "Noto Sans CJK SC",
      "Microsoft YaHei",
      "sans-serif",
    ].join(","),
    mono: [
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "Courier New",
      "monospace",
    ].join(","),
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  breakpoint: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;


