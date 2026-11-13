import { BACKEND_BASE_URL } from "@/lib/fetch/backend-url";
import {
  ClientError,
  type ErrorResponse,
  type IGenericResponse,
} from "@/lib/fetch/types";

export interface IRequestOptions<TData = unknown> {
  /** Path on the backend, e.g. `/rooms`. */
  url: string;
  data?: TData;
  headers?: Record<string, string>;
  /** Next.js fetch cache options (server only). */
  nextConfig?: NextFetchRequestConfig;
  cache?: RequestCache;
  /** Milliseconds before the request is aborted. Default 15s. */
  timeout?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Typed fetch for the backend's `{ message, data }` responses. Works in
 * server components, server actions and the browser. Throws `ClientError`
 * on a non-2xx response.
 */
class FetchClient {
  private async request<TResponse, TData>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    options: IRequestOptions<TData>,
  ): Promise<IGenericResponse<TResponse>> {
    const url = `${BACKEND_BASE_URL}/${options.url.replace(/^\/+/, "")}`;
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(options.data !== undefined ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body: options.data !== undefined ? JSON.stringify(options.data) : undefined,
      cache: options.cache,
      next: options.nextConfig,
      signal: AbortSignal.timeout(options.timeout ?? DEFAULT_TIMEOUT_MS),
    });
    const body = (await response.json().catch(() => ({
      message: response.statusText || "Request failed",
    }))) as IGenericResponse<TResponse> | ErrorResponse;
    if (!response.ok) {
      throw new ClientError(response.status, body);
    }
    return body as IGenericResponse<TResponse>;
  }

  get = <TResponse>(options: IRequestOptions<never>) =>
    this.request<TResponse, never>("GET", options);

  post = <TResponse, TData = unknown>(options: IRequestOptions<TData>) =>
    this.request<TResponse, TData>("POST", options);

  put = <TResponse, TData = unknown>(options: IRequestOptions<TData>) =>
    this.request<TResponse, TData>("PUT", options);

  delete = <TResponse>(options: IRequestOptions<never>) =>
    this.request<TResponse, never>("DELETE", options);
}

export const fetchClient = new FetchClient();
