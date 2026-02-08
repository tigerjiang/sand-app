import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import type { ApiResponse } from "./types";
import { getAccessToken } from "./tokenStore";

export class ApiError extends Error {
  code: number;
  traceId?: string;
  status?: number;

  constructor(message: string, opts: { code: number; status?: number; traceId?: string }) {
    super(message);
    this.code = opts.code;
    this.status = opts.status;
    this.traceId = opts.traceId;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? API_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (options.auth !== false) {
      const token = await getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // 非 JSON（例如 nginx/网关错误页）
      json = null;
    }

    // 约定：后端返回统一 envelope：{ code, message, data, traceId }
    const envelope: ApiResponse<T> | null =
      json && typeof json === "object" && "code" in json && "message" in json ? (json as ApiResponse<T>) : null;

    if (!res.ok) {
      const msg =
        envelope?.message ||
        (typeof json?.message === "string" ? json.message : "") ||
        `HTTP ${res.status}`;
      throw new ApiError(msg, { code: (envelope?.code as number) || res.status, status: res.status, traceId: envelope?.traceId });
    }

    if (!envelope) {
      // 允许后端直接返回 data（不包 envelope）
      return json as T;
    }

    if (envelope.code !== 0) {
      throw new ApiError(envelope.message || "请求失败", {
        code: envelope.code,
        status: res.status,
        traceId: envelope.traceId,
      });
    }

    return envelope.data;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new ApiError("请求超时", { code: 408 });
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

