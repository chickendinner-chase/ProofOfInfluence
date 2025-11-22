import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, SupportedLocale } from './config';
import { Messages } from './types';
import { en } from './locales/en';
import { zhCN } from './locales/zh-CN';
import { zhTW } from './locales/zh-TW';
import { es } from './locales/es';

const translations: Record<SupportedLocale, Messages> = {
  [SUPPORTED_LOCALES.EN]: en,
  [SUPPORTED_LOCALES.ZH_CN]: zhCN,
  [SUPPORTED_LOCALES.ZH_TW]: zhTW,
  [SUPPORTED_LOCALES.ES]: es,
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    const saved = localStorage.getItem('poi-locale');
    return (saved as SupportedLocale) || DEFAULT_LOCALE;
  });

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('poi-locale', newLocale);
  }, []);

  const t = useCallback((path: string): string => {
    const keys = path.split('.');
    let current: any = translations[locale];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to default locale (EN) if key not found
        let fallback: any = translations[DEFAULT_LOCALE];
        for (const fallbackKey of keys) {
           if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
             fallback = fallback[fallbackKey];
           } else {
             return path; // Return key if not found anywhere
           }
        }
        return fallback || path;
      }
    }

    return typeof current === 'string' ? current : path;
  }, [locale]);

  const value = {
    locale,
    setLocale,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
