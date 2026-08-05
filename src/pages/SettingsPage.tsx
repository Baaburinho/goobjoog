import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Settings, User, Shield, LogOut, CheckCircle2, 
  Globe, Moon, Sun, Bell, Database, Lock, Smartphone, 
  HelpCircle, FileText, RefreshCw, Key, Laptop, AlertTriangle, 
  Check, ChevronRight, Mail, Phone, DollarSign, MapPin, ShieldCheck, HardDrive, Fingerprint
} from 'lucide-react';
import type { UserProfile } from '../domain/entities';
import { checkBiometricHardwareSupport } from '../shared/utils/biometrics';

interface SettingsPageProps {
  currentUser: UserProfile;
  onLogout: () => void;
  lang: 'en' | 'so' | 'ar';
  setLang: (lang: 'en' | 'so' | 'ar') => void;
  onClose: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  addAuditLog?: (action: string, details: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onLogout,
  lang,
  setLang,
  onClose,
  onUpdateUser,
  addAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'notifications' | 'system' | 'support'>('profile');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email || '');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Security Toggles

  const [hasBiometricHardware, setHasBiometricHardware] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);

  useEffect(() => {
    checkBiometricHardwareSupport().then(supported => {
      setHasBiometricHardware(supported || true);
    });
  }, []);

  // Notification Toggles
  const [rentReminders, setRentReminders] = useState(true);
  const [appStatusAlerts, setAppStatusAlerts] = useState(true);
  const [newListingsAlerts, setNewListingsAlerts] = useState(true);
  const [paymentReceiptsAlerts, setPaymentReceiptsAlerts] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);

  // System Preference States
  const [currency, setCurrency] = useState<'USD' | 'SOS'>('USD');
  const [defaultCity, setDefaultCity] = useState('Mogadishu');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
      showToast(lang === 'so' ? 'Muuqalka Ifka ah waa la shiday' : 'Light mode enabled');
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
      showToast(lang === 'so' ? 'Muuqalka Madow ah waa la shiday' : 'Dark mode enabled');
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast(lang === 'so' ? 'Fadlan buuxi magaca iyo taleefanka' : 'Please fill full name and phone number', true);
      return;
    }
    if (onUpdateUser) {
      onUpdateUser({ fullName, phone, email });
    }
    if (addAuditLog) {
      addAuditLog('PROFILE_UPDATE', `User updated profile information: ${fullName}`);
    }
    showToast(lang === 'so' ? 'Xogtaada si guul leh ayaa loo kaydiyay!' : 'Profile updated successfully!');
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast(lang === 'so' ? 'Geli erayga sirta ah ee hadda' : 'Enter current password', true);
      return;
    }
    if (newPassword.length < 6) {
      showToast(lang === 'so' ? 'Erayga sirta ah ee cusub waa inuu ka badan yahay 6 xaraf' : 'Password must be at least 6 characters', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(lang === 'so' ? 'Erayada sirta ah ee cusub iskuma mid ahan!' : "New passwords don't match!", true);
      return;
    }

    if (addAuditLog) {
      addAuditLog('PASSWORD_CHANGE', `User changed security credentials.`);
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast(lang === 'so' ? 'Erayga sirta ah si guul leh ayaa loo baddalay!' : 'Password updated successfully!');
  };

  const handleClearCache = () => {
    if (window.confirm(lang === 'so' ? 'Ma hubtaa inaad nadiifiso kaydka ku meel gaarka ah ee app-ka?' : 'Are you sure you want to clear system cache and refresh?')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        showToast(lang === 'so' ? 'Kaydkii waa la nadiifiyay. Bogga dib ayaa loo soo cusboonaysiinayaa...' : 'Cache cleared successfully. Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        showToast('Failed to clear cache', true);
      }
    }
  };

  const isArabic = lang === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* STICKY TOP PAGE HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">{lang === 'so' ? 'Dib u noqo' : lang === 'ar' ? 'رجوع' : 'Back'}</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings size={20} className="text-blue-600 dark:text-blue-400" />
                <span>{lang === 'so' ? 'Qalabeynta & Nidaamka' : lang === 'ar' ? 'الإعدادات والنظام' : 'System Settings'}</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {lang === 'so' ? 'Maamul profile-kaaga, amniga, ogaysysiinta iyo nidaamka GoobJoog' : 'Manage your profile, security, notifications and platform settings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition active:scale-95"
            >
              <LogOut size={15} />
              <span>{lang === 'so' ? 'Ka Bax' : lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ALERT NOTIFICATIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {message && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-800 font-black">✕</button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl p-3.5 text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800 font-black">✕</button>
          </div>
        )}
      </div>

      {/* USER QUICK BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl border-2 border-white/30 shadow-inner">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black">{currentUser.fullName}</h2>
                {currentUser.isVerified && (
                  <span className="bg-emerald-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-3 mt-1">
                <span>📧 {currentUser.email || 'no-email@goobjoog.so'}</span>
                <span>📞 {currentUser.phone}</span>
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentUser.roles.map(r => (
                  <span key={r} className="bg-white/95 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs">
            <HardDrive size={16} className="text-blue-200" />
            <div>
              <span className="font-bold block text-[11px]">{lang === 'so' ? 'System Status' : 'System Status'}</span>
              <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Online & Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SETTINGS CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SIDEBAR TABS */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <User size={18} />
              <span>{lang === 'so' ? 'Muuqalka Profile' : lang === 'ar' ? 'الملف الشخصي' : 'Profile Info'}</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                activeTab === 'preferences'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Globe size={18} />
              <span>{lang === 'so' ? 'Doorashooyinka (App)' : lang === 'ar' ? 'تفضيلات التطبيق' : 'App Preferences'}</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Shield size={18} />
              <span>{lang === 'so' ? 'Amniga & Erayga Sirta' : lang === 'ar' ? 'الأمان وكلمة السر' : 'Security & Password'}</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Bell size={18} />
              <span>{lang === 'so' ? 'Ogaysysiinta & Fariimaha' : lang === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications'}</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                activeTab === 'system'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Database size={18} />
              <span>{lang === 'so' ? 'Nidaamka & Kaydka' : lang === 'ar' ? 'النظام وقواعد البيانات' : 'System & Diagnostics'}</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                activeTab === 'support'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <HelpCircle size={18} />
              <span>{lang === 'so' ? 'Caawimaad & Shuruuc' : lang === 'ar' ? 'الدعم والشروط' : 'Help & Terms'}</span>
            </button>
          </div>

          {/* TAB PANELS CONTAINER */}
          <div className="lg:col-span-9">
            
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <User size={20} className="text-blue-600" />
                      <span>{lang === 'so' ? 'Xogta Shaqsiga ah' : 'Personal Profile Information'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {lang === 'so' ? 'Cusboonaysii magacaaga, taleefankaaga, iyo emaylkaaga ku xiran GoobJoog' : 'Update your official account details and contact information'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  
                  {/* Photo Change Mock */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow">
                      {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{lang === 'so' ? 'Sawirka Profile-ka' : 'Profile Avatar'}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-2">PNG or JPG up to 5MB</p>
                      <button 
                        type="button" 
                        onClick={() => showToast(lang === 'so' ? 'Sawirka si guul leh ayaa loo dooraday!' : 'Avatar feature updated!')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition"
                      >
                        {lang === 'so' ? 'Baddal Sawirka' : 'Upload New Photo'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <User size={14} className="text-slate-400" />
                        {lang === 'so' ? 'Magaca Dhameystiran' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                        placeholder="e.g. Abdi Rahman Elmi"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Phone size={14} className="text-slate-400" />
                        {lang === 'so' ? 'Taleefanka' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                        placeholder="+252 61..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Mail size={14} className="text-slate-400" />
                      {lang === 'so' ? 'Emaylka' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
                    >
                      <Check size={16} />
                      <span>{lang === 'so' ? 'Kaydi Cusuobnaanta' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" />
                    <span>{lang === 'so' ? 'Doorashooyinka Lughada & Muuqalka' : 'Language & Display Preferences'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'so' ? 'Doorata lughada aad ku isticmaalayso app-ka iyo midabka (Light/Dark)' : 'Choose your preferred system language and color theme'}
                  </p>
                </div>

                {/* Language Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    🌐 {lang === 'so' ? 'Lughada App-ka (Language)' : 'System Language'}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setLang('so')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-extrabold text-xs transition ${
                        lang === 'so'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xl">🇸🇴</span>
                      <span>Somali</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-extrabold text-xs transition ${
                        lang === 'en'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xl">🇬🇧</span>
                      <span>English</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLang('ar')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-extrabold text-xs transition ${
                        lang === 'ar'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xl">🇸🇦</span>
                      <span>العربية</span>
                    </button>
                  </div>
                </div>

                {/* Dark Mode Switch */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === 'so' ? 'Muuqalka Madow (Dark Mode)' : 'Dark Color Mode'}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {lang === 'so' ? 'U baddal shaashada midab madow si aad u yarayso culayska indhaha' : 'Toggle low-light aesthetic color scheme'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                      isDarkMode ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Currency Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1">
                    <DollarSign size={16} className="text-emerald-600" />
                    {lang === 'so' ? 'Lacagta Lacag bixinta (Default Currency)' : 'Display Currency'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setCurrency('USD'); showToast('USD currency selected'); }}
                      className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                        currency === 'USD'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-mono text-base">$</span>
                      <span>USD Dollar ($)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setCurrency('SOS'); showToast('Somali Shilling selected'); }}
                      className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                        currency === 'SOS'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-mono text-base">Sh.So</span>
                      <span>Somali Shilling</span>
                    </button>
                  </div>
                </div>

                {/* Preferred City Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MapPin size={15} className="text-rose-500" />
                    {lang === 'so' ? 'Magaalada Ugu Muhiimsan' : 'Default Preferred City'}
                  </label>
                  <select
                    value={defaultCity}
                    onChange={(e) => { setDefaultCity(e.target.value); showToast(`Default city set to ${e.target.value}`); }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Mogadishu">Mogadishu (Muqdisho)</option>
                    <option value="Hargeisa">Hargeisa (Hargeysa)</option>
                    <option value="Garowe">Garowe (Garoowe)</option>
                    <option value="Kismayo">Kismayo (Kismaayo)</option>
                    <option value="Baidoa">Baidoa (Baydhabo)</option>
                    <option value="Galkayo">Galkayo (Gaalkacayo)</option>
                  </select>
                </div>

              </div>
            )}

            {/* 3. SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lock size={20} className="text-blue-600" />
                    <span>{lang === 'so' ? 'Amniga Account-ka & Erayga Sirta' : 'Account Security & Authentication'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'so' ? 'Baddal eraygaaga sirta ah, fur biometrics ama 2-Factor Authentication' : 'Change password, manage login credentials and biometrics'}
                  </p>
                </div>

                {/* Password Form */}
                <form onSubmit={handlePasswordSave} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Key size={16} className="text-blue-600" />
                    {lang === 'so' ? 'Baddal Erayga Sirta ah' : 'Change Password'}
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {lang === 'so' ? 'Erayga Sirta ee Hadda' : 'Current Password'}
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {lang === 'so' ? 'Erayga Sirta ah ee Cusub' : 'New Password'}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {lang === 'so' ? 'Xaqiiji Erayga Cusub' : 'Confirm New Password'}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 px-4 py-2 bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-lg transition active:scale-95"
                  >
                    {lang === 'so' ? 'Cusboonaysii Erayga Sirta' : 'Update Password'}
                  </button>
                </form>

                {/* Biometrics & Security Options */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {lang === 'so' ? 'Hababka Amniga Dheeriga ah' : 'Advanced Authentication Options'}
                  </h4>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {lang === 'so' ? '2-Factor Authentication (2FA via SMS)' : 'Two-Factor Authentication (2FA)'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500">Require an SMS code when logging in from new devices</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                        twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                        twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>



                </div>

                {/* Logged in Sessions */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Laptop size={16} className="text-slate-500 dark:text-slate-500" />
                    {lang === 'so' ? 'Taleefanada & PC-yada kugu xiran' : 'Active Logged-in Devices'}
                  </h4>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                        {lang === 'so' ? 'Taleefankan ama Computer-kan Hadda (Current Device)' : 'Current Device'}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Web App • Active Session • Mogadishu, SO</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded">Active</span>
                  </div>
                </div>

              </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell size={20} className="text-blue-600" />
                    <span>{lang === 'so' ? 'Ogaysysiinta System-ka' : 'Notification Preferences'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'so' ? 'Maamul fariimaha SMS-ka ama app-ka ee ku soo gaaraya' : 'Choose what types of updates you receive via Push & SMS'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === 'so' ? 'Fariimaha Kirada Bisheeda (Rent Reminders)' : 'Monthly Rent Payment Reminders'}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500">Get automatic SMS reminders 3 days before rent due date</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRentReminders(!rentReminders)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                        rentReminders ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                        rentReminders ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === 'so' ? 'Jawaabaha Codsiyada Guriga (Application Status)' : 'House Application Approval Alerts'}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500">Instant notification when landlord approves your request</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppStatusAlerts(!appStatusAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                        appStatusAlerts ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                        appStatusAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === 'so' ? 'Guryaha Cusub ee la Soo dhigo (New Listings Alert)' : 'New House Listings in Preferred City'}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500">Receive alert when new verified properties are listed</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewListingsAlerts(!newListingsAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                        newListingsAlerts ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                        newListingsAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SYSTEM DIAGNOSTICS TAB */}
            {activeTab === 'system' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database size={20} className="text-blue-600" />
                    <span>{lang === 'so' ? 'Xaalada Nidaamka & Connectivity' : 'System Status & Technical Diagnostics'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'so' ? 'Fiiri xaalada ku xirnaanshaha database-ka, nadiifi kaydka kumeel gaarka ah' : 'Review system health, database connection, clear application cache'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Database Layer</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Supabase PostgreSQL Cloud
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">Status: Active & Synchronized</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Platform Version</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">GoobJoog v2.4.0 Production</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">Build: 2026.08.05 Production Release</p>
                  </div>
                </div>

                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">
                      {lang === 'so' ? 'Nadiifi Kaydka Ku Meel Gaarka ah (Clear System Cache)' : 'Clear Application Storage & Cache'}
                    </h4>
                    <p className="text-[10px] text-rose-700 dark:text-rose-400">
                      {lang === 'so' ? 'Fadlan isticmaal haddii aad dareento in shaashadu dib u dhacayso' : 'Clear cached session files to reset system state'}
                    </p>
                  </div>

                  <button
                    onClick={handleClearCache}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Nadiifi</span>
                  </button>
                </div>

              </div>
            )}

            {/* 6. SUPPORT TAB */}
            {activeTab === 'support' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle size={20} className="text-blue-600" />
                    <span>{lang === 'so' ? 'Xarunta Caawimaada & Shuruucda' : 'Help Desk & Legal Policy'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'so' ? 'Nala soo xiriir 24/7 ama akhriso shuruucda kireynta' : 'Contact GoobJoog support team or view platform terms'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                    <Phone className="text-blue-600" size={24} />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">Taageerada Taleefanka</h4>
                      <p className="text-xs font-black text-blue-700 dark:text-blue-400">+252 61 500 0000</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                    <Mail className="text-emerald-600" size={24} />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Emaylka Taageerada</h4>
                      <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">support@goobjoog.so</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button 
                    onClick={() => alert("GoobJoog Terms & Conditions: All property listings are verified. Rentals adhere to Somali civil lease standards.")}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 transition text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-xs font-bold">{lang === 'so' ? 'Shuruudaha & Heshiisyada (Terms of Service)' : 'Terms of Service'}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>

                  <button 
                    onClick={() => alert("GoobJoog Privacy Policy: Your mobile wallet & personal data are encrypted.")}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-800 transition text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-slate-400" />
                      <span className="text-xs font-bold">{lang === 'so' ? 'Siyasada Amniga & Dahsanaanta (Privacy Policy)' : 'Privacy Policy'}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};
