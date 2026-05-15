"use client";

import type { AuthUserResponse } from "@/lib/api/types";
import * as authApi from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/client";
import { getMyProfile } from "@/lib/api/users";
import {
  setUnauthorizedHandler,
} from "@/lib/auth/session";
import {
  clearStoredAccessToken,
  clearStoredAuthUser,
  getStoredAccessToken,
  getStoredAuthUser,
  setStoredAccessToken,
  setStoredAuthUser,
  syncAccessTokenCookieFromStorage,
} from "@/lib/auth/storage";
import { profileToAuthUser } from "@/lib/auth/user-map";
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

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path === "/login" || path === "/register") return;
  const next = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.assign(`/login?next=${next}`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [isReady, setIsReady] = useState(false);

  const logout = useCallback(() => {
    clearStoredAccessToken();
    clearStoredAuthUser();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredAccessToken();
      clearStoredAuthUser();
      setUser(null);
      redirectToLogin();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getStoredAccessToken();
      if (!token) {
        clearStoredAuthUser();
        setUser(null);
        setIsReady(true);
        return;
      }

      syncAccessTokenCookieFromStorage();

      try {
        const profile = await getMyProfile();
        if (cancelled) return;
        const authUser = profileToAuthUser(profile);
        if (!profile.isActive) {
          clearStoredAccessToken();
          clearStoredAuthUser();
          setUser(null);
          return;
        }
        setStoredAuthUser(authUser);
        setUser(authUser);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiRequestError && err.status === 401) {
          clearStoredAccessToken();
          clearStoredAuthUser();
          setUser(null);
        } else {
          const stored = getStoredAuthUser();
          if (stored) setUser(stored);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    void bootstrap();
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
