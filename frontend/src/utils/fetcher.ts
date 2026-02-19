export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

class TokenManager {
  private static ACCESS_TOKEN_KEY = "accessToken";
  private static REFRESH_TOKEN_KEY = "refreshToken";

  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) return false;

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();

    if (data?.success && data?.accessToken && data?.refreshToken) {
      TokenManager.setTokens(data.accessToken, data.refreshToken);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

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

  // ✅ إذا requireAuth و ماكاينش token => error فقط
  if (requireAuth) {
    const token = TokenManager.getAccessToken();
    if (!token) throw new Error("Token d'accès requis");
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers: requestHeaders,
    ...rest,
  });

  // ✅ 401: حاول refresh و retry، بلا redirect هنا
  if (res.status === 401 && requireAuth) {
    const ok = await refreshAccessToken();
    if (!ok) throw new Error("Session expirée");

    const token = TokenManager.getAccessToken();
    if (!token) throw new Error("Session expirée");

    const retryRes = await fetch(url, {
      headers: { ...requestHeaders, Authorization: `Bearer ${token}` },
      ...rest,
    });

    const retryData = await retryRes.json().catch(() => ({}));

    if (!retryRes.ok)
      throw new Error(retryData?.message || `HTTP ${retryRes.status}`);
    return retryData;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

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
