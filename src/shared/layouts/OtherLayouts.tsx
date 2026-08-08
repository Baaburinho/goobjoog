import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../app/context/AuthContext';
import { useLanguage } from '../../app/context/LanguageContext';

export const HomeownerLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { lang, setLang } = useLanguage();

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 lg:pb-0 flex flex-col">
      <Navbar currentUser={currentUser} onLogout={logout} lang={lang} setLang={setLang} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 animate-fadeIn">
        <Outlet />
      </main>
    </div>
  );
};


export const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { lang, setLang } = useLanguage();

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 lg:pb-0 flex flex-col">
      <Navbar currentUser={currentUser} onLogout={logout} lang={lang} setLang={setLang} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 animate-fadeIn">
        <Outlet />
      </main>
    </div>
  );
};
