import { TokenManager } from "./fetcher";

export class TokenValidator {
  private static normalizeToken(token: string): string {
    return token.replace(/^Bearer\s+/i, "").trim();
  }

  private static decodePart(part: string): string | null {
    try {
      const base64Url = part.replace(/-/g, "+").replace(/_/g, "/");
      const pad = base64Url.length % 4;
      const normalized = base64Url + (pad ? "=".repeat(4 - pad) : "");
      if (typeof window === "undefined") return null;
      return window.atob(normalized);
    } catch {
      return null;
    }
  }

  private static payload(token: string): any | null {
    const clean = this.normalizeToken(token);
    const parts = clean.split(".");
    if (parts.length !== 3) return null;
    const decoded = this.decodePart(parts[1]);
    if (!decoded) return null;
    try {
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  static cleanupInvalidTokens(): void {
    const access = TokenManager.getAccessToken();
    const refresh = TokenManager.getRefreshToken();
    if (!access && !refresh) return;

    const looksJwt = (t: string | null) =>
      t && this.normalizeToken(t).split(".").length === 3;

    // ✅ غير إلا كان JWT فعلاً
    if (
      (access && looksJwt(access) && !this.payload(access)) ||
      (refresh && looksJwt(refresh) && !this.payload(refresh))
    ) {
      TokenManager.clearTokens();
    }
  }
}
