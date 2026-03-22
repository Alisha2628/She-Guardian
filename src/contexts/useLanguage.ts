// src/contexts/useLanguage.ts
import { useContext } from 'react';
import { LanguageContext, type LanguageContextType } from './LanguageContext';

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
