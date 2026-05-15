export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "kinova-theme";

export function readStoredTheme(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    // ignore
  }
  return null;
}

export function resolveDark(preference: ThemePreference): boolean {
  if (preference === "dark") return true;
  if (preference === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeClass(preference: ThemePreference): boolean {
  const dark = resolveDark(preference);
  document.documentElement.classList.toggle("dark", dark);
  return dark;
}
