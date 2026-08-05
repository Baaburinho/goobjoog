import React, { useState } from 'react';
import { User, LogOut, Menu, X, Globe, ShieldCheck, Moon, Sun, Download, Bell, Settings, HelpCircle, Info, Shield, FileText, ChevronRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import type { UserProfile } from '../domain/entities';
import { NotificationsModal } from './modals/NotificationsModal';
import { SettingsModal } from './modals/SettingsModal';
import { StaticPageModal } from './modals/StaticPageModal';

interface NavbarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  lang: 'en' | 'so' | 'ar';
  setLang: (lang: 'en' | 'so' | 'ar') => void;
  onOpenSettings?: () => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser, 
  onLogout, 
  lang, 
  setLang,
  onOpenSettings,
  onGoHome
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenuModal, setActiveMenuModal] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };
  const isArabic = lang === 'ar';
  const logoutText = lang === 'so' ? 'Ka Bax' : lang === 'ar' ? 'تسجيل الخروج' : 'Logout';
  const verifiedText = lang === 'so' ? 'La Hubiyey' : lang === 'ar' ? 'مؤكد' : 'Verified';

  return (
    <>
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm safe-pt transition-colors" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left side: Hamburger (Mobile) + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 focus:outline-none transition active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo - Interactive Navigation */}
          <button onClick={() => onGoHome && onGoHome()} className="flex items-center gap-2 text-left focus:outline-none cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md tracking-tighter group-hover:scale-105 transition">
              g
            </div>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight flex items-center gap-1.5 select-none">
              <span>GoobJoog</span>
            </span>
          </button>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-3">
          
          {!isNative && (
            <div className="flex items-center gap-2">
              <a
                href="/app-debug.apk"
                download="GoobJoog-Android.apk"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 touch-target"
                title="Download Android App"
              >
                <Download size={14} />
                Android
              </a>
              <a
                href="/GoobJoog-iOS.ipa"
                download="GoobJoog-iOS.ipa"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition active:scale-95 touch-target"
                title="Download iOS App"
              >
                <Download size={14} />
                iOS
              </a>
            </div>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Selector Flags */}
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-50 dark:bg-slate-800 shadow-inner">
            <button
              onClick={() => setLang('so')}
              className={`text-[10px] font-black px-2 py-1 rounded transition ${
                lang === 'so' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              🇸🇴 SO
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`text-[10px] font-black px-2 py-1 rounded transition ${
                lang === 'ar' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              🇸🇦 AR
            </button>
            <button
              onClick={() => setLang('en')}
              className={`text-[10px] font-black px-2 py-1 rounded transition ${
                lang === 'en' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
          
          {/* User Badge */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 dark:bg-slate-800/90 pl-3 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
            <div className="flex flex-wrap gap-1">
              {currentUser.roles.map((r: string) => {
                const roleStyle = 
                  r === 'administrator' ? 'bg-rose-500 text-white' :
                  r === 'accountant' ? 'bg-amber-500 text-white' :
                  r === 'homeowner' || r === 'landlord' ? 'bg-blue-600 text-white' :
                  'bg-emerald-600 text-white';

                const roleLabel =
                  lang === 'so' && r === 'tenant' ? 'Kireyste' :
                  lang === 'so' && (r === 'homeowner' || r === 'landlord') ? 'Mulkiile' :
                  lang === 'so' && r === 'accountant' ? 'Xisaabiye' :
                  lang === 'so' && r === 'administrator' ? 'Maamule' :
                  lang === 'ar' && r === 'tenant' ? 'مستأجر' :
                  lang === 'ar' && (r === 'homeowner' || r === 'landlord') ? 'مالك' :
                  lang === 'ar' && r === 'accountant' ? 'محاسب' :
                  lang === 'ar' && r === 'administrator' ? 'مدير' :
                  r === 'homeowner' ? 'owner' : r;
                
                return (
                  <span key={r} className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${roleStyle}`}>
                    {roleLabel}
                  </span>
                );
              })}
            </div>
            
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <User size={13} className="text-slate-500 dark:text-slate-500" />
              {currentUser.fullName}
            </span>

            {currentUser.isVerified && (
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded border border-emerald-200">
                ✓ {verifiedText}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else setActiveMenuModal('settings');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm transition active:scale-95 touch-target"
            title="Settings & System Configuration"
          >
            <Settings size={14} />
            <span>{lang === 'so' ? 'Qalabeynta' : lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm transition active:scale-95 touch-target"
          >
            <LogOut size={14} />
            {logoutText}
          </button>
        </div>
        </div>
    </header>

      {/* Mobile Drawer Overlay & Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="relative w-[85%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slideInLeft">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-black text-lg text-slate-800 dark:text-white">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-2 justify-between">
                {!isNative && (
                  <div className="flex-1 flex gap-2">
                    <a
                      href="/app-debug.apk"
                      download="GoobJoog-Android.apk"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95"
                    >
                      <Download size={14} />
                      Android
                    </a>
                    <a
                      href="/GoobJoog-iOS.ipa"
                      download="GoobJoog-iOS.ipa"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition active:scale-95"
                      title="Download iOS App"
                    >
                      <Download size={14} />
                      iOS
                    </a>
                  </div>
                )}

                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              {/* User Info Card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    <User size={16} className="text-blue-600 dark:text-blue-400" />
                    {currentUser.fullName}
                  </span>
                  {currentUser.isVerified && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck size={12} /> {verifiedText}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {currentUser.roles.map((r: string) => {
                    const roleStyle = 
                      r === 'administrator' ? 'bg-rose-500 text-white' :
                      r === 'accountant' ? 'bg-amber-500 text-white' :
                      r === 'homeowner' || r === 'landlord' ? 'bg-blue-600 text-white' :
                      'bg-emerald-600 text-white';

                    const roleLabel =
                      lang === 'so' && r === 'tenant' ? 'Kireyste' :
                      lang === 'so' && (r === 'homeowner' || r === 'landlord') ? 'Mulkiile' :
                      lang === 'so' && r === 'accountant' ? 'Xisaabiye' :
                      lang === 'so' && r === 'administrator' ? 'Maamule' :
                      lang === 'ar' && r === 'tenant' ? 'مستأجر' :
                      lang === 'ar' && (r === 'homeowner' || r === 'landlord') ? 'مالك' :
                      lang === 'ar' && r === 'accountant' ? 'محاسب' :
                      lang === 'ar' && r === 'administrator' ? 'مدير' :
                      r === 'homeowner' ? 'owner' : r;

                    return (
                      <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${roleStyle}`}>
                        {roleLabel}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Links */}
              <div className="flex flex-col gap-1">
                <button onClick={() => { setActiveMenuModal('notifications'); setMobileMenuOpen(false); }} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3"><Bell size={18} className="text-slate-400" /><span className="text-sm font-bold">Notifications</span></div>
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">5</span>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </button>
                <button onClick={() => { 
                  if (onOpenSettings) onOpenSettings();
                  else setActiveMenuModal('settings'); 
                  setMobileMenuOpen(false); 
                }} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3"><Settings size={18} className="text-blue-600 dark:text-blue-400" /><span className="text-sm font-bold">{lang === 'so' ? 'Qalabeynta & Nidaamka' : lang === 'ar' ? 'الإعدادات والنظام' : 'Settings'}</span></div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button onClick={() => { setActiveMenuModal('help'); setMobileMenuOpen(false); }} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3"><HelpCircle size={18} className="text-slate-400" /><span className="text-sm font-bold">Help Center</span></div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button onClick={() => { setActiveMenuModal('about'); setMobileMenuOpen(false); }} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3"><Info size={18} className="text-slate-400" /><span className="text-sm font-bold">About</span></div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button onClick={() => { setActiveMenuModal('privacy'); setMobileMenuOpen(false); }} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3"><Shield size={18} className="text-slate-400" /><span className="text-sm font-bold">Privacy Policy</span></div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button onClick={() => { setActiveMenuModal('terms'); setMobileMenuOpen(false); }} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3"><FileText size={18} className="text-slate-400" /><span className="text-sm font-bold">Terms</span></div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

              {/* Language Selector Bar */}
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 pl-1">
                  <Globe size={14} /> Language:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLang('so')}
                    className={`text-xs font-extrabold px-2 py-1 rounded-lg transition ${
                      lang === 'so' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    🇸🇴 SO
                  </button>
                  <button
                    onClick={() => setLang('ar')}
                    className={`text-xs font-extrabold px-2 py-1 rounded-lg transition ${
                      lang === 'ar' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    🇸🇦 AR
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`text-xs font-extrabold px-2 py-1 rounded-lg transition ${
                      lang === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
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
                {logoutText}
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
      {['help', 'about', 'privacy', 'terms'].includes(activeMenuModal || '') && (
        <StaticPageModal 
          onClose={() => setActiveMenuModal(null)} 
          pageType={activeMenuModal as 'help' | 'about' | 'privacy' | 'terms'}
          title={
            activeMenuModal === 'help' ? 'Help Center' :
            activeMenuModal === 'about' ? 'About GoobJoog' :
            activeMenuModal === 'privacy' ? 'Privacy Policy' :
            'Terms & Conditions'
          }
        />
      )}
    </>
  );
};
