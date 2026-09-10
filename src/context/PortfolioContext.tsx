import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Theme, LocalizedString, LocalizedStringArray } from '../types';

interface PortfolioContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (val: LocalizedString | undefined) => string;
  tArr: (val: LocalizedStringArray | undefined) => string[];
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('dark');

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mi_portfolio_lang') as Language;
      if (saved === 'en' || saved === 'id') return saved;
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith('id')) return 'id';
    }
    return 'en';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('mi_portfolio_theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // Light mode is currently disabled / not available yet
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mi_portfolio_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => {
      const next = prev === 'en' ? 'id' : 'en';
      localStorage.setItem('mi_portfolio_lang', next);
      return next;
    });
  };

  const t = (val: LocalizedString | undefined): string => {
    if (!val) return '';
    return val[language] || val.en || '';
  };

  const tArr = (val: LocalizedStringArray | undefined): string[] => {
    if (!val) return [];
    return val[language] || val.en || [];
  };

  return (
    <PortfolioContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
        tArr,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
