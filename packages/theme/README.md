# @repo/theme

提供可复用的主题 tokens 与 UnoCSS preset/config。

## 导出

- `@repo/theme/theme`: `tokens` / `unoTheme`
- `@repo/theme/preset`: `presetRepoTheme`
- `@repo/theme/unocss`: 默认 `unocss.config.ts`

## 推荐用法

在 app 内直接复用配置：

```ts
// apps/xxx/unocss.config.ts
export { default } from "@repo/theme/unocss";
```

需要扩展：

```ts
// apps/xxx/unocss.config.ts
import base from "@repo/theme/unocss";
import { defineConfig } from "unocss";

export default defineConfig({
  ...base,
  shortcuts: [
    ...(base.shortcuts ?? []),
    ["app-root", "min-h-screen bg-surface text-default"],
  ],
});
```

## Demo：在页面中使用主题 shortcuts

```tsx
// apps/xxx/src/app/page.tsx
export default function Page() {
  return (
    <main className="page-container">
      <div className="card">
        <h1 className="text-default text-xl font-semibold">Hello</h1>
        <p className="text-muted mt-2">This card uses @repo/theme shortcuts.</p>
        <button className="btn btn-primary mt-4">Primary</button>
      </div>
    </main>
  );
}
```


