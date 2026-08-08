import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'so' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('goobjoog_lang');
    if (saved === 'ar' || saved === 'so' || saved === 'en') {
      return saved as Language;
    }
    return 'so'; // Default to Somali or user preference
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('goobjoog_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (lang === 'ar') {
      document.body.classList.add('rtl-layout');
    } else {
      document.body.classList.remove('rtl-layout');
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isArabic: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
