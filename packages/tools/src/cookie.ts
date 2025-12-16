export type SameSite = "lax" | "strict" | "none";

export interface CookieSerializeOptions {
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: SameSite;
}

export function parseCookieString(cookie: string | null | undefined): Record<string, string> {
  if (!cookie) return {};
  const out: Record<string, string> = {};
  for (const part of cookie.split(";")) {
    const p = part.trim();
    if (!p) continue;
    const eq = p.indexOf("=");
    if (eq < 0) continue;
    const k = p.slice(0, eq).trim();
    const v = p.slice(eq + 1).trim();
    if (!k) continue;
    // 宽松处理：cookie 值可能未 encode
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

export function serializeCookie(name: string, value: string, options: CookieSerializeOptions = {}): string {
  const encoded = encodeURIComponent(value);
  const parts: string[] = [`${name}=${encoded}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.secure) parts.push("Secure");
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) {
    const s = options.sameSite;
    parts.push(`SameSite=${s.toUpperCase()}`);
  }
  return parts.join("; ");
}

export interface CookieManager {
  get(name: string): string | undefined;
  getAll(): Record<string, string>;
  set(name: string, value: string, options?: CookieSerializeOptions): void;
  remove(name: string, options?: Omit<CookieSerializeOptions, "maxAge">): void;
}

export interface CookieManagerAdapter {
  /**
   * 获取当前 cookie 字符串（浏览器：document.cookie；服务端：Cookie header）
   */
  getCookieString(): string | undefined;
  /**
   * 写入 cookie（浏览器：document.cookie = "..."; 服务端：push 到 Set-Cookie）
   */
  setCookieString(setCookie: string): void;
}

export function createBrowserCookieAdapter(): CookieManagerAdapter {
  return {
    getCookieString() {
      if (typeof document === "undefined") return undefined;
      return document.cookie;
    },
    setCookieString(setCookie: string) {
      if (typeof document === "undefined") return;
      document.cookie = setCookie;
    },
  };
}

export function createServerCookieAdapter(cookieHeader?: string): {
  adapter: CookieManagerAdapter;
  /**
   * 服务端场景下通过 `Set-Cookie` 头写回响应
   */
  getSetCookieHeaders(): string[];
} {
  const setCookies: string[] = [];
  return {
    adapter: {
      getCookieString: () => cookieHeader,
      setCookieString: (v) => setCookies.push(v),
    },
    getSetCookieHeaders: () => [...setCookies],
  };
}

export function createCookieManager(adapter: CookieManagerAdapter = createBrowserCookieAdapter()): CookieManager {
  const readAll = () => parseCookieString(adapter.getCookieString());

  return {
    get(name) {
      return readAll()[name];
    },
    getAll() {
      return readAll();
    },
    set(name, value, options) {
      adapter.setCookieString(serializeCookie(name, value, options));
    },
    remove(name, options) {
      adapter.setCookieString(
        serializeCookie(name, "", {
          ...options,
          maxAge: 0,
          expires: new Date(0),
        }),
      );
    },
  };
}


