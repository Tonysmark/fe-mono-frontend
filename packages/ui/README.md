# @repo/ui

仓库内共享 UI 组件（供 `apps/*` 复用）。

> 本包通过 `exports` 直接暴露 `src/*.tsx` 源码给 workspace 内消费（适用于 monorepo 内部使用）。

## 导出

目前示例组件：

- `@repo/ui/button`
- `@repo/ui/card`
- `@repo/ui/code`

## Demo（Next.js App Router）

```tsx
// apps/xxx/src/app/page.tsx
import { Button } from "@repo/ui/button";

export default function Page() {
  return (
    <main>
      <Button appName="mobile-ssr" className="px-3 py-2 rounded bg-zinc-900 text-white">
        Click me
      </Button>
    </main>
  );
}
```



