import React, { useState } from 'react';
import { User, LogOut, Menu, X, Globe, ShieldCheck, Moon, Sun, Download, Bell, Settings, HelpCircle, Info, Shield, FileText, ChevronRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import type { UserProfile } from '../domain/entities';
import { NotificationsModal } from './modals/NotificationsModal';
import { SettingsModal } from './modals/SettingsModal';
import { StaticPageModal } from './modals/StaticPageModal';
import { translations } from '../lib/translations';

interface NavbarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  lang: 'en' | 'so' | 'ar';
  setLang: (lang: 'en' | 'so' | 'ar') => void;
  onOpenSettings?: () => void;
  onGoHome?: () => void;
  activeLayout?: 'tenant' | 'homeowner' | 'administrator';
  setActiveLayout?: (layout: 'tenant' | 'homeowner' | 'administrator') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser, 
  onLogout, 
  lang, 
  setLang,
  onOpenSettings,
  onGoHome,
  activeLayout,
  setActiveLayout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenuModal, setActiveMenuModal] = useState<'notifications' | 'settings' | 'help' | 'about' | 'privacy' | 'terms' | null>(null);
  const [showIosModal, setShowIosModal] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrator':
      case 'admin':
        return t.admin;
      case 'homeowner':
      case 'landlord':
        return t.landlord;
      case 'tenant':
      default:
        return t.tenant;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm safe-pt transition-colors" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left side: Hamburger (Mobile) + Logo + Navigation Role Tabs */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition active:scale-95"
                aria-label={t.menu}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Brand Logo */}
            <button 
              onClick={() => onGoHome && onGoHome()} 
              className="flex items-center gap-2 text-left focus:outline-none cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md tracking-tighter group-hover:scale-105 transition">
                🏠
              </div>
              <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight flex items-center gap-1.5 select-none">
                <span>{t.appName}</span>
              </span>
            </button>

            {/* Navigation Role Tabs (Strictly localized) */}
            {setActiveLayout && currentUser && (
              <div className={`hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 ${isArabic ? 'mr-3' : 'ml-3'}`}>
                {((currentUser.roles || []).includes('administrator') || (currentUser.roles || []).includes('admin' as any)) && (
                  <button
                    onClick={() => setActiveLayout('administrator')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                      activeLayout === 'administrator' 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Shield size={13} />
                    <span>{t.navAdmin}</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveLayout('tenant')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                    activeLayout === 'tenant' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>🏠 {t.navHouses}</span>
                </button>

                {((currentUser.roles || []).includes('homeowner') || (currentUser.roles || []).includes('landlord' as any) || (currentUser.roles || []).includes('administrator') || (currentUser.roles || []).includes('admin' as any)) && (
                  <button
                    onClick={() => setActiveLayout('homeowner')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                      activeLayout === 'homeowner' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🏡 {t.navLandlord}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center gap-3">
            
            {!isNative && (
              <div className="flex items-center gap-2">
                <a
                  href="/GoobJoog-Android.apk"
                  download="GoobJoog-Android.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 touch-target"
                  title={t.androidApp}
                >
                  <Download size={14} />
                  <span>{t.androidApp}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowIosModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition active:scale-95 touch-target"
                  title={t.iosApp}
                >
                  <Download size={14} />
                  <span>{t.iosApp}</span>
                </button>
              </div>
            )}

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
              aria-label={isDarkMode ? t.lightMode : t.darkMode}
              title={isDarkMode ? t.lightMode : t.darkMode}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Selector Pills */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800 shadow-inner">
              <button
                onClick={() => setLang('so')}
                className={`text-[10px] font-black px-2 py-1 rounded-lg transition ${
                  lang === 'so' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                🇸🇴 SO
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`text-[10px] font-black px-2 py-1 rounded-lg transition ${
                  lang === 'ar' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                🇸🇦 AR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`text-[10px] font-black px-2 py-1 rounded-lg transition ${
                  lang === 'en' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
            
            {/* User Profile Badge */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(currentUser?.roles) ? currentUser.roles : [(currentUser as any)?.role || 'tenant']).map((r: string) => {
                  const roleStyle = 
                    r === 'administrator' || r === 'admin' ? 'bg-rose-500 text-white' :
                    r === 'homeowner' || r === 'landlord' ? 'bg-blue-600 text-white' :
                    'bg-emerald-600 text-white';

                  return (
                    <span key={r} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${roleStyle}`}>
                      {getRoleLabel(r)}
                    </span>
                  );
                })}
              </div>
              
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.fullName} 
                    className="w-5 h-5 rounded-full object-cover border border-blue-500 shadow-sm" 
                  />
                ) : (
                  <User size={13} className="text-slate-500" />
                )}
                {currentUser.fullName}
              </span>

              {currentUser.isVerified && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100/70 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  ✓ {t.verified}
                </span>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                else setActiveMenuModal('settings');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm transition active:scale-95 touch-target"
              title={t.settings}
            >
              <Settings size={14} />
              <span>{t.settings}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition active:scale-95 touch-target"
            >
              <LogOut size={14} />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex" dir={isArabic ? 'rtl' : 'ltr'}>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="relative w-[85%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slideInLeft">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
                🏠 {t.appName}
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* App Downloads & Theme Bar */}
              <div className="flex items-center gap-2 justify-between">
                {!isNative && (
                  <div className="flex-1 flex gap-2">
                    <a
                      href="/GoobJoog-Android.apk"
                      download="GoobJoog-Android.apk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95"
                    >
                      <Download size={14} />
                      {t.androidApp}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setShowIosModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition active:scale-95"
                    >
                      <Download size={14} />
                      {t.iosApp}
                    </button>
                  </div>
                )}

                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              {/* User Info Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                    <User size={16} className="text-blue-600 dark:text-blue-400" />
                    {currentUser.fullName}
                  </span>
                  {currentUser.isVerified && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <ShieldCheck size={12} /> {t.verified}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {(currentUser.roles || ['tenant']).map((r: string) => {
                    const roleStyle = 
                      r === 'administrator' || r === 'admin' ? 'bg-rose-500 text-white' :
                      r === 'homeowner' || r === 'landlord' ? 'bg-blue-600 text-white' :
                      'bg-emerald-600 text-white';

                    return (
                      <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${roleStyle}`}>
                        {getRoleLabel(r)}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Drawer Links */}
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => { setActiveMenuModal('notifications'); setMobileMenuOpen(false); }} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-slate-400" />
                    <span className="text-sm font-bold">{t.notifications}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">3</span>
                    <ChevronRight size={16} className={`text-slate-300 ${isArabic ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <button 
                  onClick={() => { 
                    if (onOpenSettings) onOpenSettings();
                    else setActiveMenuModal('settings'); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={18} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-bold">{t.settings}</span>
                  </div>
                  <ChevronRight size={16} className={`text-slate-300 ${isArabic ? 'rotate-180' : ''}`} />
                </button>

                <button 
                  onClick={() => { setActiveMenuModal('help'); setMobileMenuOpen(false); }} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-slate-400" />
                    <span className="text-sm font-bold">{t.helpCenter}</span>
                  </div>
                  <ChevronRight size={16} className={`text-slate-300 ${isArabic ? 'rotate-180' : ''}`} />
                </button>

                <button 
                  onClick={() => { setActiveMenuModal('about'); setMobileMenuOpen(false); }} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <Info size={18} className="text-slate-400" />
                    <span className="text-sm font-bold">{t.about}</span>
                  </div>
                  <ChevronRight size={16} className={`text-slate-300 ${isArabic ? 'rotate-180' : ''}`} />
                </button>

                <button 
                  onClick={() => { setActiveMenuModal('privacy'); setMobileMenuOpen(false); }} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-slate-400" />
                    <span className="text-sm font-bold">{t.privacyPolicy}</span>
                  </div>
                  <ChevronRight size={16} className={`text-slate-300 ${isArabic ? 'rotate-180' : ''}`} />
                </button>

                <button 
                  onClick={() => { setActiveMenuModal('terms'); setMobileMenuOpen(false); }} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400" />
                    <span className="text-sm font-bold">{t.terms}</span>
                  </div>
                  <ChevronRight size={16} className={`text-slate-300 ${isArabic ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>

              {/* Language Selector Bar */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Globe size={15} /> {t.systemLanguageLabel}:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLang('so')}
                    className={`text-xs font-extrabold px-2 py-1 rounded-lg transition ${
                      lang === 'so' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    🇸🇴 SO
                  </button>
                  <button
                    onClick={() => setLang('ar')}
                    className={`text-xs font-extrabold px-2 py-1 rounded-lg transition ${
                      lang === 'ar' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    🇸🇦 AR
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`text-xs font-extrabold px-2 py-1 rounded-lg transition ${
                      lang === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>
            </div>
            
            {/* Drawer Footer (Logout) */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/50 shadow-sm transition active:scale-[0.98] text-sm"
              >
                <LogOut size={16} />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {activeMenuModal === 'notifications' && (
        <NotificationsModal onClose={() => setActiveMenuModal(null)} lang={lang} />
      )}
      {activeMenuModal === 'settings' && (
        <SettingsModal onClose={() => setActiveMenuModal(null)} currentUser={currentUser} lang={lang} />
      )}
      {activeMenuModal && activeMenuModal !== 'notifications' && activeMenuModal !== 'settings' && (
        <StaticPageModal 
          onClose={() => setActiveMenuModal(null)} 
          title={
            activeMenuModal === 'help' ? t.helpCenter :
            activeMenuModal === 'about' ? t.about :
            activeMenuModal === 'privacy' ? t.privacyPolicy : t.terms
          }
          pageType={activeMenuModal}
          lang={lang}
        />
      )}

      {/* iOS App Installation Guide Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowIosModal(false)}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                📱
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {t.iosGuideTitle}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t.iosGuideSub}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 space-y-2">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 block text-xs">
                  {t.iosOption1}
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-indigo-800 dark:text-indigo-200">
                  <li>{t.iosStep1}</li>
                  <li>{t.iosStep2}</li>
                  <li>{t.iosStep3}</li>
                  <li>{t.iosStep4}</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  {t.iosOption2}
                </span>
                <p className="text-[11px] text-slate-500">
                  .IPA file download for Apple TestFlight or developer installations.
                </p>
                <a
                  href="/GoobJoog-iOS.ipa"
                  download="GoobJoog-iOS.ipa"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition mt-1"
                >
                  <Download size={14} />
                  <span>{t.downloadIpaBtn}</span>
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {t.gotIt}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
