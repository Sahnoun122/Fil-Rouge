import { api, TokenManager, ApiError } from "../utils/fetcher";
import { LoginData, RegisterData, User } from "../types/auth";

const normalizeUser = (payload: any): User => {
  const rawId = payload?.id || payload?._id;
  const id = typeof rawId === "string" ? rawId : rawId?.toString?.() || "";

  const createdAt = payload?.createdAt
    ? new Date(payload.createdAt).toISOString()
    : new Date().toISOString();
  const updatedAt = payload?.updatedAt
    ? new Date(payload.updatedAt).toISOString()
    : createdAt;

  return {
    id,
    fullName: payload?.fullName || payload?.name || "",
    email: payload?.email || "",
    role: payload?.role === "admin" ? "admin" : "user",
    isActive: payload?.isActive ?? true,
    emailVerified: payload?.emailVerified ?? false,
    phone: payload?.phone,
    companyName: payload?.companyName,
    industry: payload?.industry,
    lastLoginAt: payload?.lastLoginAt
      ? new Date(payload.lastLoginAt).toISOString()
      : undefined,
    createdAt,
    updatedAt,
  };
};

export class AuthService {
  static async login(data: LoginData) {
    const res: any = await api.post("/auth/login", data, false);

    if (!res.success)
      throw new Error(res.message || "Erreur lors de la connexion");

    const user = normalizeUser(res.user || res.data?.user);
    const tokens = res.tokens || res.data?.tokens;

    if (!tokens?.accessToken || !tokens?.refreshToken)
      throw new Error("Tokens invalides");

    TokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

    return { user, tokens };
  }

  static async register(data: RegisterData) {
    const res: any = await api.post("/auth/register", data, false);

    if (!res.success)
      throw new Error(res.message || "Erreur lors de l'inscription");

    const user = normalizeUser(res.user || res.data?.user);
    const tokens = res.tokens || res.data?.tokens;

    if (!tokens?.accessToken || !tokens?.refreshToken)
      throw new Error("Tokens invalides");

    TokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

    return { user, tokens };
  }

  static async logout() {
    try {
      await api.post("/auth/logout", {}, true);
    } catch {
      // ignore
    } finally {
      TokenManager.clearTokens();
    }
  }

  static async getCurrentUser(): Promise<User> {
    const res: any = await api.get("/users/profile", true);
    if (!res.success) throw new Error(res.message || "Erreur profil");
    return normalizeUser(res.data);
  }

  static async checkAuth(): Promise<{ ok: boolean; user?: User; shouldClearTokens: boolean }> {
    const token = TokenManager.getAccessToken();
    const refresh = TokenManager.getRefreshToken();
    if (!token || !refresh) return { ok: false, shouldClearTokens: false };

    try {
      const me = await this.getCurrentUser();
      return { ok: true, user: me, shouldClearTokens: false };
    } catch (error) {
      if (this.isUnauthorized(error)) {
        TokenManager.clearTokens();
        return { ok: false, shouldClearTokens: true };
      }
      return this.trySecondCheck();
    }
  }

  private static isUnauthorized(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
  }

  private static async trySecondCheck(): Promise<{ ok: boolean; user?: User; shouldClearTokens: boolean }> {
    try {
      const me = await this.getCurrentUser();
      return { ok: true, user: me, shouldClearTokens: false };
    } catch (error) {
      const shouldClear = this.isUnauthorized(error);
      if (shouldClear) {
        TokenManager.clearTokens();
      }
      return { ok: false, shouldClearTokens: shouldClear };
    }
  }
}

export default AuthService;
