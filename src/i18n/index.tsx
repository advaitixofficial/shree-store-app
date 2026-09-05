// ============================================================
// Shree Stores - i18n System
// ============================================================

import React, { createContext, useContext, useCallback } from 'react';
import { en, type TranslationKey } from './en';
import { hi } from './hi';
import type { Language } from '@/types';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  hi,
};

interface I18nContextType {
  language: Language;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  t: (key: TranslationKey) => en[key],
  setLanguage: () => {},
});

interface I18nProviderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  children: React.ReactNode;
}

export function I18nProvider({ language, setLanguage, children }: I18nProviderProps) {
  const t = useCallback(
    (key: TranslationKey) => {
      return translations[language]?.[key] ?? en[key] ?? key;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

export { type TranslationKey };
