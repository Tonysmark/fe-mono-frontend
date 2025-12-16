# @repo/request

一个在 monorepo 内可复用的请求层，支持：

- **Next.js / Node.js**：服务端内部请求（SSR Internal Fetch）
- **React / Preact**：浏览器端 AJAX（CSR，基于 `@tanstack/react-query`）

对外分层导出：

- `@repo/request/server`
- `@repo/request/client`
- `@repo/request/shared`

## 安装

在 workspace 根目录执行依赖安装即可（本包依赖 `@tanstack/react-query`，可选 `undici`）。

## Shared（类型 & 工具）

```ts
import type { InternalResponse } from "@repo/request/shared";
```

- `InternalResponse<T>`：统一返回结构
- `RequestError` / `RequestErrorShape`
- `mergeHeaders` / `resolveURL` 等工具

## Server（SSR 内部请求工具）

特点：

- 使用原生 `fetch`（无 axios）
- 自动拼接 `baseURL`
- 统一错误结构（返回 `InternalResponse<T>`）
- Next.js 13+ 自动透传 `cookies` / `authorization`（可通过 `withAuth` 控制）
- `timeout` 支持（基于 `AbortController`）

```ts
import { createServerClient } from "@repo/request/server";

const api = createServerClient("https://api.example.com", { timeout: 8_000, withAuth: true });

const res = await api.get<{ id: string; name: string }>("/user");
if (res.ok) console.log(res.data);
```

### Next.js Route Handler 示例

见 `examples/next-route-handler.ts`

## Client（CSR 请求工具：react-query）

```ts
import { createBrowserClient, useRequest, useMutationRequest } from "@repo/request/client";

const client = createBrowserClient("/api");

const { data, isLoading } = useRequest(["user", id], () => client.get(`/user/${id}`));

const mutation = useMutationRequest((payload: any) => client.post("/collect", payload));
```

默认策略：

- `staleTime: 30s`
- `retry: 1`
- `refetchOnWindowFocus: false`
- 默认 `console.error` 输出错误（可在 options.onError 覆盖）

### React 页面示例

见 `examples/react-page.tsx`

### Preact + react-query 示例

见 `examples/preact-react-query.tsx`

> Preact 通过 `preact/compat` 兼容 react-query：在 bundler 中 alias `react` / `react-dom` 到 `preact/compat`。

## 构建

```bash
pnpm -C packages/request build
```

产物输出到 `dist/`，并包含 d.ts：

- `dist/server/index.js` + `dist/server/index.d.ts`
- `dist/client/index.js` + `dist/client/index.d.ts`
- `dist/shared/index.js` + `dist/shared/index.d.ts`

## Demo：Next.js Server Component 请求内部 API

```tsx
import { createServerClient } from "@repo/request/server";
import { headers } from "next/headers";

async function getOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export default async function Page() {
  const api = createServerClient(await getOrigin(), { withAuth: true });
  const res = await api.get<{ ok: boolean }>("/api/health");
  return <pre>{JSON.stringify(res, null, 2)}</pre>;
}
```


