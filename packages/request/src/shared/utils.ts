import type { HttpMethod } from "./types";
import { RequestError } from "./types";

export function mergeHeaders(...inputs: Array<HeadersInit | undefined>): Headers {
  const h = new Headers();
  for (const input of inputs) {
    if (!input) continue;
    const next = new Headers(input);
    next.forEach((value, key) => {
      h.set(key, value);
    });
  }
  return h;
}

export function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

export function resolveURL(baseURL: string | undefined, path: string): string {
  // 如果传入绝对 URL，直接返回
  if (/^https?:\/\//i.test(path)) return path;
  if (!baseURL) return path;

  // baseURL 可能是 "/api"，也可能是 "https://xx.com"
  const base = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function createTimeoutSignal(timeoutMs?: number): {
  signal?: AbortSignal;
  cancel?: () => void;
} {
  if (!timeoutMs || timeoutMs <= 0) return {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}

export async function readBodySafe(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

export function toRequestError(init: {
  message: string;
  code?: string;
  url?: string;
  method?: HttpMethod;
  status?: number;
  data?: unknown;
  cause?: unknown;
}): RequestError {
  return new RequestError({
    message: init.message,
    code: init.code,
    url: init.url,
    method: init.method,
    status: init.status,
    data: init.data,
    cause: init.cause,
  });
}


