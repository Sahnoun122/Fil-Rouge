export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data: any) {
    super(message);
    this.name = "ApiError";
  }
}

class TokenManager {
  private static ACCESS_TOKEN_KEY = "accessToken";
  private static LEGACY_REFRESH_TOKEN_KEY = "refreshToken";

  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setTokens(accessToken: string): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.removeItem(this.LEGACY_REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.LEGACY_REFRESH_TOKEN_KEY);
  }

  static diagnose(): {
    accessToken: string | null;
    hasWindow: boolean;
  } {
    const hasWindow = typeof window !== "undefined";
    const accessToken = this.getAccessToken();

    const snapshot = { accessToken, hasWindow };
    if (hasWindow) {
      console.log("[TokenManager] diagnose", snapshot);
    }

    return snapshot;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

export async function fetcher<T = any>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { requireAuth = false, headers = {}, ...rest } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = TokenManager.getAccessToken();
    if (!token) throw new Error("Token d'acces requis");
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers: requestHeaders,
    ...rest,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && requireAuth) {
    TokenManager.clearTokens();
    throw new ApiError(res.status, data?.message || "Session expirée", data);
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || `HTTP ${res.status}`, data);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, requireAuth = false) =>
    fetcher<T>(endpoint, { method: "GET", requireAuth }),

  post: <T>(endpoint: string, body?: any, requireAuth = false) =>
    fetcher<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      requireAuth,
    }),

  put: <T>(endpoint: string, body?: any, requireAuth = false) =>
    fetcher<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      requireAuth,
    }),

  delete: <T>(endpoint: string, requireAuth = false) =>
    fetcher<T>(endpoint, { method: "DELETE", requireAuth }),
};

export { TokenManager };
