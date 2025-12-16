import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import { presetRepoTheme, repoThemeRules, repoThemeShortcuts } from "./preset";

/**
 * 默认 UnoCSS 配置（可直接被 apps 引用/extend）
 *
 * 用法示例：
 * - apps/web/unocss.config.ts:
 *   export { default } from "@repo/theme/unocss";
 */
export default defineConfig({
  presets: [
    // 基础工具集：使用 Wind4（对齐 Tailwind 4 语义，且与 Wind3 有迁移兼容考虑）
    presetWind4(),
    presetAttributify(),
    presetIcons(),
    presetRepoTheme(),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],

  // 这里显式放 rules/shortcuts，满足“提供 unocss.config.ts（预设、规则、shortcuts）”要求
  rules: [
    ...repoThemeRules,
    [
      "content-visibility-auto",
      {
        contentVisibility: "auto",
      },
    ],
  ],
  shortcuts: [
    ...repoThemeShortcuts,
    [
      "page-container",
      "mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8",
    ],
  ],
});


