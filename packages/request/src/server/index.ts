import type { HttpMethod, InternalResponse } from "../shared";
import {
  createTimeoutSignal,
  headersToRecord,
  mergeHeaders,
  readBodySafe,
  resolveURL,
  toRequestError,
} from "../shared";

export interface ServerRequestOptions {
  baseURL?: string;
  headers?: HeadersInit;
  timeout?: number;
  /**
   * 自动透传 cookies / token（Next.js）
   * - Next.js 13+（App Router）下会尝试从 `next/headers` 读取 cookies
   */
  withAuth?: boolean;
}

type FetchInit = Omit<RequestInit, "method" | "headers" | "body" | "signal"> & {
  headers?: HeadersInit;
  signal?: AbortSignal;
};

async function getNextCookiesHeader(): Promise<string | undefined> {
  try {
    // IMPORTANT:
    // 不能使用 `import("next/headers")`（即便是动态 import），因为 TS 在未安装 next 时会报 TS2307。
    // 这里用运行时动态 import，避免对 next 的编译期依赖。
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const importer = new Function("m", "return import(m)") as (m: string) => Promise<unknown>;
    const mod = (await importer("next/headers")) as {
      cookies?: () => { toString?: () => string; getAll?: () => Array<{ name: string; value: string }> };
    };
    const ck = mod.cookies?.();
    if (!ck) return undefined;
    if (typeof ck.toString === "function") {
      const s = ck.toString();
      return s || undefined;
    }
    if (typeof ck.getAll === "function") {
      const all = ck.getAll();
      if (!all?.length) return undefined;
      return all.map((i) => `${i.name}=${i.value}`).join("; ");
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function getNextAuthorizationHeader(): Promise<string | undefined> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const importer = new Function("m", "return import(m)") as (m: string) => Promise<unknown>;
    const mod = (await importer("next/headers")) as {
      headers?: () => { get?: (k: string) => string | null };
    };
    const h = mod.headers?.();
    const auth = h?.get?.("authorization") ?? null;
    return auth || undefined;
  } catch {
    return undefined;
  }
}

function normalizeMethod(method: HttpMethod): HttpMethod {
  return method.toUpperCase() as HttpMethod;
}

async function request<T>(
  method: HttpMethod,
  url: string,
  body: unknown,
  options: ServerRequestOptions,
  init?: FetchInit
): Promise<InternalResponse<T>> {
  const m = normalizeMethod(method);
  const { signal: timeoutSignal, cancel } = createTimeoutSignal(options.timeout);
  const controller = new AbortController();

  const signals: AbortSignal[] = [];
  if (timeoutSignal) signals.push(timeoutSignal);
  if (init?.signal) signals.push(init.signal);
  // 合并 signal：任意一个 abort 都会触发
  for (const s of signals) {
    if (s.aborted) controller.abort();
    s.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let mergedHeaders = mergeHeaders(options.headers, init?.headers);
  if (options.withAuth) {
    const cookie = await getNextCookiesHeader();
    if (cookie && !mergedHeaders.has("cookie")) {
      mergedHeaders.set("cookie", cookie);
    }
    const authorization = await getNextAuthorizationHeader();
    if (authorization && !mergedHeaders.has("authorization")) {
      mergedHeaders.set("authorization", authorization);
    }
  }

  // JSON body 默认处理
  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null && m !== "GET" && m !== "HEAD") {
    if (body instanceof FormData) {
      payload = body;
      // FormData 时让浏览器/运行时自行设置 boundary
      mergedHeaders.delete("content-type");
    } else if (typeof body === "string") {
      payload = body;
      if (!mergedHeaders.has("content-type")) mergedHeaders.set("content-type", "text/plain;charset=UTF-8");
    } else {
      payload = JSON.stringify(body);
      if (!mergedHeaders.has("content-type")) mergedHeaders.set("content-type", "application/json");
    }
  }

  try {
    const res = await fetch(url, {
      ...init,
      method: m,
      headers: mergedHeaders,
      body: payload,
      signal: controller.signal,
    });
    cancel?.();

    const headers = headersToRecord(res.headers);
    const data = await readBodySafe(res);

    if (!res.ok) {
      const err = toRequestError({
        message: `Request failed: ${res.status} ${res.statusText}`,
        url,
        method: m,
        status: res.status,
        data,
      });
      return { ok: false, status: res.status, error: err, headers };
    }

    return { ok: true, status: res.status, data: data as T, headers };
  } catch (cause) {
    cancel?.();
    const err = toRequestError({
      message: cause instanceof Error ? cause.message : "Network error",
      code: "NETWORK_ERROR",
      url,
      method: m,
      status: 0,
      cause,
    });
    return { ok: false, status: 0, error: err };
  }
}

export interface ServerClient {
  get<T>(path: string, options?: ServerRequestOptions & { init?: FetchInit }): Promise<InternalResponse<T>>;
  post<T>(path: string, body?: unknown, options?: ServerRequestOptions & { init?: FetchInit }): Promise<InternalResponse<T>>;
  put<T>(path: string, body?: unknown, options?: ServerRequestOptions & { init?: FetchInit }): Promise<InternalResponse<T>>;
  patch<T>(path: string, body?: unknown, options?: ServerRequestOptions & { init?: FetchInit }): Promise<InternalResponse<T>>;
  delete<T>(path: string, options?: ServerRequestOptions & { init?: FetchInit }): Promise<InternalResponse<T>>;
}

export function createServerClient(baseURL?: string, defaultOptions: ServerRequestOptions = {}): ServerClient {
  const defaults: ServerRequestOptions = {
    baseURL,
    withAuth: true,
    ...defaultOptions,
  };

  const make = (method: HttpMethod) => {
    return async <T>(path: string, bodyOrOptions?: unknown, maybeOptions?: ServerRequestOptions & { init?: FetchInit }) => {
      const hasBody = method !== "GET" && method !== "DELETE" && method !== "HEAD" && method !== "OPTIONS";
      const body = hasBody ? bodyOrOptions : undefined;
      const opt = (hasBody ? maybeOptions : (bodyOrOptions as (ServerRequestOptions & { init?: FetchInit }) | undefined)) ?? {};
      const merged: ServerRequestOptions = {
        ...defaults,
        ...opt,
        headers: mergeHeaders(defaults.headers, opt.headers),
        baseURL: opt.baseURL ?? defaults.baseURL,
      };

      const url = resolveURL(merged.baseURL, path);
      return request<T>(method, url, body, merged, opt.init);
    };
  };

  return {
    get: (path, options) => make("GET")(path, options),
    post: (path, body, options) => make("POST")(path, body, options),
    put: (path, body, options) => make("PUT")(path, body, options),
    patch: (path, body, options) => make("PATCH")(path, body, options),
    delete: (path, options) => make("DELETE")(path, options),
  };
}


