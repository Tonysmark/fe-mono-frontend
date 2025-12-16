export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface RequestErrorShape {
  name: "RequestError";
  message: string;
  code?: string;
  url?: string;
  method?: HttpMethod;
  status?: number;
  data?: unknown;
  cause?: unknown;
}

export class RequestError extends Error implements RequestErrorShape {
  override name = "RequestError" as const;
  code?: string;
  url?: string;
  method?: HttpMethod;
  status?: number;
  data?: unknown;

  constructor(init: Omit<RequestErrorShape, "name">) {
    super(init.message);
    this.code = init.code;
    this.url = init.url;
    this.method = init.method;
    this.status = init.status;
    this.data = init.data;
    if ("cause" in init) {
      // `cause` 在较新的 TS lib 中已存在，这里做兼容赋值
      (this as { cause?: unknown }).cause = init.cause;
    }
  }
}

export type InternalResponse<T> =
  | {
      ok: true;
      status: number;
      data: T;
      headers?: Record<string, string>;
    }
  | {
      ok: false;
      status: number;
      error: RequestErrorShape;
      headers?: Record<string, string>;
    };


