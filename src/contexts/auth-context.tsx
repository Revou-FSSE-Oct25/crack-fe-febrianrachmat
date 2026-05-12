"use client";

import type { AuthUserResponse } from "@/lib/api/types";
import * as authApi from "@/lib/api/auth";
import {
  clearStoredAccessToken,
  clearStoredAuthUser,
  getStoredAccessToken,
  getStoredAuthUser,
  setStoredAccessToken,
  setStoredAuthUser,
  syncAccessTokenCookieFromStorage,
} from "@/lib/auth/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  user: AuthUserResponse | null;
  isReady: boolean;
  login: (body: authApi.LoginBody) => Promise<void>;
  register: (body: authApi.RegisterBody) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Hindari setState sinkron di body effect (react-hooks/set-state-in-effect).
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const token = getStoredAccessToken();
      const stored = getStoredAuthUser();
      if (token && stored) {
        setUser(stored);
        syncAccessTokenCookieFromStorage();
      } else if (!token) {
        clearStoredAuthUser();
        setUser(null);
      }
      setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (body: authApi.LoginBody) => {
    const data = await authApi.login(body);
    setStoredAccessToken(data.accessToken);
    setStoredAuthUser(data.user);
    setUser(data.user);
  }, []);

  const register = useCallback(async (body: authApi.RegisterBody) => {
    const data = await authApi.register(body);
    setStoredAccessToken(data.accessToken);
    setStoredAuthUser(data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredAccessToken();
    clearStoredAuthUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      login,
      register,
      logout,
    }),
    [user, isReady, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return ctx;
}
