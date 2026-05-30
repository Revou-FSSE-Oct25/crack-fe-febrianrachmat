"use client";

import { translate } from "@/lib/i18n/dictionary";
import {
  DEFAULT_LANGUAGE,
  readStoredLanguage,
  storeLanguage,
  type Language,
} from "@/lib/i18n/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LanguageContextValue = {
  language: Language;
  setLanguage: (next: Language) => void;
  toggle: () => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = readStoredLanguage();
    if (stored && stored !== language) {
      setLanguageState(stored);
    }
    // hanya saat mount: sinkronkan dari localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    storeLanguage(next);
  }, []);

  const toggle = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === "id" ? "en" : "id";
      storeLanguage(next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string) => translate(language, key),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggle, t }),
    [language, setLanguage, toggle, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Fallback ketika dipakai di luar `LanguageProvider` (mis. unit test yang
 * merender komponen secara terisolasi). Mengembalikan bahasa default tanpa
 * melempar error sehingga komponen tetap dapat dirender.
 */
const fallbackLanguageContext: LanguageContextValue = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  toggle: () => {},
  t: (key: string) => translate(DEFAULT_LANGUAGE, key),
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext) ?? fallbackLanguageContext;
}
