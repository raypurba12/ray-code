import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Locale } from './translations';
export type { Locale };

type Translations = typeof translations;

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

function getNested(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return undefined;
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'id';
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved === 'id' || saved === 'en') return saved;
    const nav = navigator.language.toLowerCase();
    return nav.startsWith('en') ? 'en' : 'id';
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('locale', l);
      document.documentElement.lang = l;
      // also set cookie for backend if needed
      document.cookie = `locale=${l}; path=/; max-age=31536000`;
    } catch {}
  };

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {}
  }, [locale]);

  const t = (path: string): string => {
    const val = getNested(translations[locale], path);
    if (val !== undefined) return val;
    // fallback to id
    const fallback = getNested(translations.id, path);
    return fallback ?? path;
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}

export function useT() {
  const { t } = useI18n();
  return t;
}
