# @repo/eslint-config

仓库内共享 ESLint 配置集合（用于 apps/packages 统一代码风格与质量门槛）。

## 导出

- `@repo/eslint-config/base`：通用基础规则（TS + Prettier + turbo）
- `@repo/eslint-config/next-js`：Next.js 项目规则（在 base 上叠加 next 相关）
- `@repo/eslint-config/react-internal`：React 组件库/内部 React 项目规则

## 使用说明

本仓库统一使用 **Flat Config**（`eslint.config.mjs`）。

### Demo：packages/* 使用 base

```js
// packages/xxx/eslint.config.mjs
import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default config;
```

### Demo：apps/*（Next.js）使用 next-js

```js
// apps/xxx/eslint.config.mjs
import { config } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default config;
```
