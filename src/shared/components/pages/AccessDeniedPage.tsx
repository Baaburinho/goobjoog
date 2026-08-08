import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../../app/context/LanguageContext';
import { translations } from '../../../lib/translations';

export const AccessDeniedPage: React.FC = () => {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={40} className="text-rose-500" />
      </div>
      <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">{t.accessDeniedTitle}</h1>
      <p className="text-slate-500 max-w-sm mb-8 text-sm">{t.accessDeniedDesc}</p>
      <Link to="/" className="bg-slate-800 dark:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-900 transition active:scale-95">
        {t.backToDashboardBtn}
      </Link>
    </div>
  );
};
