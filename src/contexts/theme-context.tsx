"use client";

import {
  applyThemeClass,
  readStoredTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/theme/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedDark: boolean;
  setPreference: (next: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialPreference(): ThemePreference {
  return readStoredTheme() ?? "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(getInitialPreference);
  const [resolvedDark, setResolvedDark] = useState(false);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    const dark = applyThemeClass(next);
    setResolvedDark(dark);
  }, []);

  const toggle = useCallback(() => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    setPreference(currentlyDark ? "light" : "dark");
  }, [setPreference]);

  useEffect(() => {
    const dark = applyThemeClass(preference);
    queueMicrotask(() => setResolvedDark(dark));

    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const nextDark = applyThemeClass("system");
      setResolvedDark(nextDark);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const value = useMemo(
    () => ({ preference, resolvedDark, setPreference, toggle }),
    [preference, resolvedDark, setPreference, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme harus dipakai di dalam ThemeProvider.");
  }
  return ctx;
}
