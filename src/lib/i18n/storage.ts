export type Language = "id" | "en";

export const LANGUAGE_STORAGE_KEY = "kinova-lang";

export const DEFAULT_LANGUAGE: Language = "id";

export function readStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw === "id" || raw === "en") return raw;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Bahasa aktif yang dipakai untuk header `x-lang` ke backend.
 * Dipakai juga oleh API client (di luar React) sehingga harus sinkron.
 */
export function getActiveLanguage(): Language {
  return readStoredLanguage() ?? DEFAULT_LANGUAGE;
}

export function storeLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}
