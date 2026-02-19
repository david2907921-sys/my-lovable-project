
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';
import { t, tc } from '../translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  tc: (content: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  const translate = (key: string) => t(key, lang);
  const translateContent = (content: any) => tc(content, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translate, tc: translateContent }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
