import { useMemo } from "react";
import type {
  DefaultError,
  MutationKey,
  MutationOptions,
  QueryKey,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { HttpMethod, InternalResponse } from "../shared";
import {
  createTimeoutSignal,
  mergeHeaders,
  readBodySafe,
  resolveURL,
  toRequestError,
} from "../shared";

export interface BrowserClientOptions {
  baseURL?: string;
  headers?: HeadersInit;
  timeout?: number;
}

export interface BrowserClient {
  get<T>(path: string, init?: RequestInit): Promise<InternalResponse<T>>;
  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<InternalResponse<T>>;
  put<T>(path: string, body?: unknown, init?: RequestInit): Promise<InternalResponse<T>>;
  patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<InternalResponse<T>>;
  delete<T>(path: string, init?: RequestInit): Promise<InternalResponse<T>>;
}

async function browserRequest<T>(
  method: HttpMethod,
  url: string,
  body: unknown,
  options: BrowserClientOptions,
  init?: RequestInit
): Promise<InternalResponse<T>> {
  const { signal: timeoutSignal, cancel } = createTimeoutSignal(options.timeout);
  const controller = new AbortController();

  if (timeoutSignal) {
    if (timeoutSignal.aborted) controller.abort();
    timeoutSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  if (init?.signal) {
    if (init.signal.aborted) controller.abort();
    init.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const headers = mergeHeaders(options.headers, init?.headers);

  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null && method !== "GET" && method !== "HEAD") {
    if (body instanceof FormData) {
      payload = body;
      headers.delete("content-type");
    } else if (typeof body === "string") {
      payload = body;
      if (!headers.has("content-type")) headers.set("content-type", "text/plain;charset=UTF-8");
    } else {
      payload = JSON.stringify(body);
      if (!headers.has("content-type")) headers.set("content-type", "application/json");
    }
  }

  try {
    const res = await fetch(url, {
      ...init,
      method,
      headers,
      body: payload,
      signal: controller.signal,
      credentials: init?.credentials ?? "include",
    });
    cancel?.();

    const data = await readBodySafe(res);
    const headerRecord: Record<string, string> = {};
    res.headers.forEach((v, k) => (headerRecord[k] = v));

    if (!res.ok) {
      const err = toRequestError({
        message: `Request failed: ${res.status} ${res.statusText}`,
        url,
        method,
        status: res.status,
        data,
      });
      return { ok: false, status: res.status, error: err, headers: headerRecord };
    }

    return { ok: true, status: res.status, data: data as T, headers: headerRecord };
  } catch (cause) {
    cancel?.();
    const err = toRequestError({
      message: cause instanceof Error ? cause.message : "Network error",
      code: "NETWORK_ERROR",
      url,
      method,
      status: 0,
      cause,
    });
    return { ok: false, status: 0, error: err };
  }
}

export function createBrowserClient(baseURL?: string, defaultOptions: BrowserClientOptions = {}): BrowserClient {
  const defaults: BrowserClientOptions = { baseURL, ...defaultOptions };
  const make =
    (method: HttpMethod) =>
    async <T>(path: string, bodyOrInit?: unknown, maybeInit?: RequestInit): Promise<InternalResponse<T>> => {
      const hasBody = method !== "GET" && method !== "DELETE" && method !== "HEAD" && method !== "OPTIONS";
      const body = hasBody ? bodyOrInit : undefined;
      const init = (hasBody ? maybeInit : (bodyOrInit as RequestInit | undefined)) ?? undefined;
      const url = resolveURL(defaults.baseURL, path);
      return browserRequest<T>(method, url, body, defaults, init);
    };

  return {
    get: (path, init) => make("GET")(path, init),
    post: (path, body, init) => make("POST")(path, body, init),
    put: (path, body, init) => make("PUT")(path, body, init),
    patch: (path, body, init) => make("PATCH")(path, body, init),
    delete: (path, init) => make("DELETE")(path, init),
  };
}

/**
 * 轻量封装 react-query 的 useQuery
 * - 默认：缓存 30s、重试 1 次、窗口聚焦不自动 refetch
 */
export function useRequest<TData = unknown, TError = DefaultError, TQueryKey extends QueryKey = QueryKey>(
  key: TQueryKey,
  fetcherFn: () => Promise<InternalResponse<TData>>,
  options?: Omit<UseQueryOptions<InternalResponse<TData>, TError, InternalResponse<TData>, TQueryKey>, "queryKey" | "queryFn">
): UseQueryResult<InternalResponse<TData>, TError> {
  return useQuery({
    queryKey: key,
    queryFn: fetcherFn,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * 变更请求封装（useMutation）
 */
export function useMutationRequest<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<InternalResponse<TData>>,
  options?: MutationOptions<InternalResponse<TData>, TError, TVariables, TContext> & { mutationKey?: MutationKey }
): UseMutationResult<InternalResponse<TData>, TError, TVariables, TContext> {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * 小工具：让 client 在组件里稳定（避免每次 render 重新创建）
 */
export function useBrowserClient(baseURL?: string, defaultOptions?: BrowserClientOptions): BrowserClient {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => createBrowserClient(baseURL, defaultOptions), [baseURL]);
}


