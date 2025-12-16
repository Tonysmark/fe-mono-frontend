# @repo/typescript-config

仓库内共享 TypeScript `tsconfig` 集合（统一编译目标、严格度与常用选项）。

## 导出

- `@repo/typescript-config/base.json`：基础配置（严格模式 + ES2022 + DOM lib 等）
- `@repo/typescript-config/nextjs.json`：Next.js 应用配置（在 base 上按 Next 需求扩展）
- `@repo/typescript-config/react-library.json`：React 组件库配置（在 base 上开启 `jsx: react-jsx`）

## Demo

### Demo：packages/*（纯 TS 工具包）

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Demo：packages/*（React 组件库）

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```



