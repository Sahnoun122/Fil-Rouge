import { User } from "@/src/types/auth";

const STORAGE_KEY = "marketplan:auth-user";

export function persistAuthUser(user: User) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore storage failures in strict environments
  }
}

export function loadPersistedAuthUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
}

export function clearPersistedAuthUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
