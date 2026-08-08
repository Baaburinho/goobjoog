import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useLanguage } from '../../../app/context/LanguageContext';
import { translations } from '../../../lib/translations';

export const SessionExpiredPage: React.FC = () => {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mb-6">
        <Clock size={40} className="text-amber-500" />
      </div>
      <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">{t.sessionExpiredTitle}</h1>
      <p className="text-slate-500 max-w-sm mb-8 text-sm">{t.sessionExpiredDesc}</p>
      <Link to="/login" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition active:scale-95">
        {t.loginAgainBtn}
      </Link>
    </div>
  );
};
