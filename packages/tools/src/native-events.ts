export type NativeErrorShape = {
  message: string;
  code?: string;
  data?: unknown;
};

export class NativeError extends Error {
  code?: string;
  data?: unknown;
  constructor(init: NativeErrorShape) {
    super(init.message);
    this.name = "NativeError";
    this.code = init.code;
    this.data = init.data;
  }
}

type NativeRequestMessage = {
  __nativeEvents: true;
  type: "request";
  id: string;
  method: string;
  params?: unknown;
};

type NativeResponseMessage =
  | {
      __nativeEvents: true;
      type: "response";
      id: string;
      ok: true;
      result: unknown;
    }
  | {
      __nativeEvents: true;
      type: "response";
      id: string;
      ok: false;
      error: NativeErrorShape;
    };

type NativeEventMessage = {
  __nativeEvents: true;
  type: "event";
  name: string;
  payload?: unknown;
};

export type NativeMessage = NativeRequestMessage | NativeResponseMessage | NativeEventMessage;

export interface NativeTransport {
  /**
   * 发送消息给 Native。
   * - 同步场景：可直接返回 result 或 NativeResponseMessage
   * - 异步场景：通常返回 void，Native 会通过回调/事件再把 response 发回 JS
   */
  send(message: NativeRequestMessage): unknown | NativeResponseMessage | Promise<unknown | NativeResponseMessage> | void;
}

export interface NativeEventsManagerOptions {
  timeoutMs?: number;
  idFactory?: () => string;
}

type Pending = {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
  timer?: ReturnType<typeof setTimeout>;
};

function defaultIdFactory() {
  // 优先使用标准 randomUUID；否则退化到时间戳+递增
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  defaultIdFactory._c = (defaultIdFactory._c ?? 0) + 1;
  return `${Date.now()}-${defaultIdFactory._c}`;
}
defaultIdFactory._c = 0 as number;

function parseMaybeJSON(input: unknown): unknown {
  if (typeof input !== "string") return input;
  const s = input.trim();
  if (!s) return input;
  if (!(s.startsWith("{") || s.startsWith("["))) return input;
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return input;
  }
}

function isNativeMessage(m: unknown): m is NativeMessage {
  return (
    typeof m === "object" &&
    m !== null &&
    "__nativeEvents" in m &&
    (m as { __nativeEvents?: unknown }).__nativeEvents === true &&
    "type" in m
  );
}

export interface NativeEventsManager {
  /**
   * 处理来自 Native 的消息（建议在 WebView message 回调里调用）。
   * 支持 string(JSON) / object 两种形态。
   */
  handleMessage(message: unknown): void;

  /**
   * 异步调用（并发安全：用 id 关联 response，不会串扰）。
   */
  invoke<T>(method: string, params?: unknown, options?: { timeoutMs?: number }): Promise<T>;

  /**
   * 同步调用：要求 transport.send 立即返回结果（或 NativeResponseMessage）。
   * 若返回 Promise 或未返回值，则抛错。
   */
  invokeSync<T>(method: string, params?: unknown): T;

  /**
   * 订阅 Native 主动推送事件。
   */
  on<TPayload = unknown>(eventName: string, handler: (payload: TPayload) => void): () => void;

  /**
   * 释放：拒绝所有 pending。
   */
  destroy(reason?: string): void;
}

export function createNativeEventsManager(
  transport: NativeTransport,
  options: NativeEventsManagerOptions = {},
): NativeEventsManager {
  const timeoutMsDefault = options.timeoutMs ?? 10_000;
  const idFactory = options.idFactory ?? defaultIdFactory;

  const pending = new Map<string, Pending>();
  const listeners = new Map<string, Set<(payload: unknown) => void>>();

  const settle = (id: string, msg: NativeResponseMessage) => {
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);
    if (p.timer) clearTimeout(p.timer);
    if (msg.ok) p.resolve(msg.result);
    else p.reject(new NativeError(msg.error));
  };

  return {
    handleMessage(message: unknown) {
      const m = parseMaybeJSON(message);
      if (!isNativeMessage(m)) return;
      if (m.type === "response") {
        settle(m.id, m);
        return;
      }
      if (m.type === "event") {
        const set = listeners.get(m.name);
        if (!set?.size) return;
        for (const fn of set) fn(m.payload);
      }
    },

    async invoke<T>(method: string, params?: unknown, opts?: { timeoutMs?: number }): Promise<T> {
      const id = idFactory();
      const req: NativeRequestMessage = { __nativeEvents: true, type: "request", id, method, params };

      const timeoutMs = opts?.timeoutMs ?? timeoutMsDefault;
      const p = new Promise<unknown>((resolve, reject) => {
        const item: Pending = { resolve, reject };
        if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
          item.timer = setTimeout(() => {
            pending.delete(id);
            reject(new NativeError({ message: `Native invoke timeout: ${method}`, code: "TIMEOUT" }));
          }, timeoutMs);
        }
        pending.set(id, item);
      });

      try {
        const ret = transport.send(req);
        // 如果 transport 直接返回 response/result，也支持“立即完成”
        if (ret instanceof Promise) {
          const awaited = await ret;
          const msg = parseMaybeJSON(awaited);
          if (isNativeMessage(msg) && msg.type === "response" && msg.id === id) {
            settle(id, msg);
          } else if (awaited !== undefined) {
            // treat as direct result
            settle(id, { __nativeEvents: true, type: "response", id, ok: true, result: awaited });
          }
        } else if (ret !== undefined) {
          const msg = parseMaybeJSON(ret);
          if (isNativeMessage(msg) && msg.type === "response" && msg.id === id) {
            settle(id, msg);
          } else {
            settle(id, { __nativeEvents: true, type: "response", id, ok: true, result: ret });
          }
        }
      } catch (e) {
        pending.delete(id);
        throw e;
      }

      return (await p) as T;
    },

    invokeSync<T>(method: string, params?: unknown): T {
      const id = idFactory();
      const req: NativeRequestMessage = { __nativeEvents: true, type: "request", id, method, params };
      const ret = transport.send(req);
      if (ret instanceof Promise) {
        throw new NativeError({ message: `invokeSync received Promise for method: ${method}`, code: "NOT_SYNC" });
      }
      if (ret === undefined) {
        throw new NativeError({ message: `invokeSync got no return value for method: ${method}`, code: "NO_RETURN" });
      }
      const msg = parseMaybeJSON(ret);
      if (isNativeMessage(msg) && msg.type === "response") {
        if (msg.ok) return msg.result as T;
        throw new NativeError(msg.error);
      }
      return ret as T;
    },

    on<TPayload = unknown>(eventName: string, handler: (payload: TPayload) => void) {
      const set = listeners.get(eventName) ?? new Set<(payload: unknown) => void>();
      const fn = (payload: unknown) => handler(payload as TPayload);
      set.add(fn);
      listeners.set(eventName, set);
      return () => {
        const s = listeners.get(eventName);
        s?.delete(fn);
        if (s && s.size === 0) listeners.delete(eventName);
      };
    },

    destroy(reason?: string) {
      for (const [id, p] of pending.entries()) {
        if (p.timer) clearTimeout(p.timer);
        p.reject(new NativeError({ message: reason ?? "NativeEventsManager destroyed", code: "DESTROYED" }));
        pending.delete(id);
      }
      listeners.clear();
    },
  };
}


