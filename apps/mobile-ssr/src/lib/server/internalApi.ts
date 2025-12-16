import { headers } from "next/headers";

/**
 * 在 Server Component / Route Handler 的服务端环境下，构造当前请求的绝对 origin，
 * 以便用 fetch 请求本应用内部 API（/api/...）。
 */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) {
    // 兜底：本地开发通常会有 host，这里仅防御性处理
    return `${proto}://localhost:3000`;
  }
  return `${proto}://${host}`;
}


