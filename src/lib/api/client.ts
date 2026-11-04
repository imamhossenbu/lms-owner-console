import { endConsoleSession, getConsoleToken } from "@/components/console/shell/consoleSession";

/** EduPro API base URL (lms-ai-backend). */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

/** An API failure with a friendly English `message` (safe to show in a toast) plus the HTTP status / error code. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const NETWORK_MESSAGE = "Can't reach the EduPro API. Check your connection and try again.";
const SERVER_MESSAGE = "Something went wrong on our side. Please try again in a moment.";

function friendlyMessage(status: number, body: unknown): string {
  if (status >= 500) return SERVER_MESSAGE;
  const raw = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(raw) && raw.length) return raw.map(String).join(" · ");
  if (typeof raw === "string" && raw.trim()) return raw;
  if (status === 401) return "Your session has ended. Sign in again.";
  if (status === 403) return "Only platform owners can do this.";
  if (status === 404) return "This item no longer exists.";
  return "The request couldn't be completed. Please try again.";
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  query?: Query;
  /** Send without the session token (sign-in calls). */
  anonymous?: boolean;
  /** Use this token instead of the session's (right after sign-in, before the session is stored). */
  token?: string;
}

/** JSON request to the API with the console session token. A 401 ends the session (the shell redirects to /login). */
export async function apiRequest<T>(method: string, path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(API_URL + path);
  Object.entries(opts.query ?? {}).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && url.searchParams.set(k, String(v)));
  const token = opts.token ?? (opts.anonymous ? null : getConsoleToken());

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    if (res.status === 401 && token && !opts.token) endConsoleSession();
    throw new ApiError(friendlyMessage(res.status, data), res.status, (data as { code?: string } | null)?.code);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => apiRequest<T>("GET", path, undefined, { query }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>("POST", path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>("PATCH", path, body ?? {}),
  put: <T>(path: string, body?: unknown) => apiRequest<T>("PUT", path, body ?? {}),
  delete: <T>(path: string) => apiRequest<T>("DELETE", path),
};

interface Page<T> {
  data: T[];
  meta: { page: number; totalPages: number };
}

/** Reads every page of a `{ data, meta }` list (100 per page). */
export async function fetchAllPages<T>(path: string, query: Query = {}): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; ; page++) {
    const res = await api.get<Page<T>>(path, { ...query, page, limit: 100 });
    rows.push(...res.data);
    if (page >= res.meta.totalPages || page >= 50) return rows;
  }
}
