"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import AuthService from "../services/authService";
import { User, LoginData, RegisterData } from "../types/auth";
import { TokenValidator } from "../utils/tokenValidator";
import {
  persistAuthUser,
  loadPersistedAuthUser,
  clearPersistedAuthUser,
} from "../utils/authStorage";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginData) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await AuthService.checkAuth();
      if (!result.ok) {
        if (result.shouldClearTokens) {
          setUser(null);
          clearPersistedAuthUser();
        }
        return;
      }

      setUser(result.user!);
      persistAuthUser(result.user!);
    } catch {
      setUser(null);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    TokenValidator.cleanupInvalidTokens();
    const cachedUser = loadPersistedAuthUser();
    if (cachedUser) {
      setUser(cachedUser);
    }
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await AuthService.login(data);
      setUser(res.user);
      persistAuthUser(res.user);
      return res.user;
    } catch (e: any) {
      setError(e?.message || "Erreur login");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await AuthService.register(data);
      setUser(res.user);
      persistAuthUser(res.user);
      return res.user;
    } catch (e: any) {
      setError(e?.message || "Erreur register");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    clearPersistedAuthUser();
    window.location.href = "/";
  };

  const clearError = () => setError(null);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      register,
      logout,
      checkAuthStatus,
      clearError,
    }),
    [user, isAuthenticated, isLoading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
