# @repo/tools

仓库内通用工具集合（独立构建，产物输出到 `dist/`）。

## 导出

- Cookie Manager
- LocalStorage Manager
- Native Events Manager（用于 JS <-> Native 通信：同步/异步/并发不串扰）

## 使用说明 & Demo

### Cookie Manager

浏览器直接使用：

```ts
import { createCookieManager } from "@repo/tools";

const cm = createCookieManager();
cm.set("token", "abc", { path: "/", sameSite: "lax" });
console.log(cm.get("token"));
cm.remove("token", { path: "/" });
```

服务端（例如 Next.js Route Handler）使用：

```ts
import { createCookieManager, createServerCookieAdapter } from "@repo/tools";

const { adapter, getSetCookieHeaders } = createServerCookieAdapter(request.headers.get("cookie") ?? "");
const cm = createCookieManager(adapter);
cm.set("sid", "1", { path: "/", httpOnly: true, sameSite: "lax" });

// 将 getSetCookieHeaders() 写入响应的 Set-Cookie
```

### LocalStorage Manager

```ts
import { createLocalStorageManager } from "@repo/tools";

const ls = createLocalStorageManager();
ls.setJSON("profile", { name: "alice" });
console.log(ls.getJSON<{ name: string }>("profile"));
```

### Native Events Manager

WebView 场景（以 `window.ReactNativeWebView.postMessage` 为例）：

```ts
import { createNativeEventsManager } from "@repo/tools";

const mgr = createNativeEventsManager({
  send(message) {
    // 发送给 Native；Native 收到后应回传 response/event 给 JS
    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  },
});

// 接收 Native 回传（不同 WebView 平台接入点不同，这里仅示意）
window.addEventListener("message", (e) => mgr.handleMessage(e.data));

// 并发调用：不会串扰（按 id 关联）
const [a, b] = await Promise.all([
  mgr.invoke<string>("getToken"),
  mgr.invoke<number>("getVersion"),
]);

// 同步调用：要求 Native 侧“同步返回”
// const token = mgr.invokeSync<string>("getTokenSync");
```
