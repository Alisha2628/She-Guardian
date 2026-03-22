// src/contexts/LanguageContext.tsx
import { createContext, useState, useEffect, type ReactNode } from 'react';
import translations, { type Language, LANGUAGES } from '../lib/translations';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)[Language];
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'sheguardian_language';

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
  } catch {}
  const browserLang = navigator.language?.split('-')[0];
  const match = LANGUAGES.find(l => l.code === browserLang);
  return match ? match.code : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}
