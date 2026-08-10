import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, User, Shield, LogOut, CheckCircle2, 
  Globe, Moon, Sun, Bell, Database, Lock, Smartphone, 
  HelpCircle, FileText, RefreshCw, Key, Laptop, AlertTriangle, 
  Check, ChevronRight, Mail, Phone, DollarSign, MapPin, ShieldCheck, HardDrive, Fingerprint,
  Camera, Upload, Trash2
} from 'lucide-react';
import type { UserProfile } from '../domain/entities';
import { checkBiometricHardwareSupport, authenticateWithFingerprint } from '../shared/utils/biometrics';
import { translations } from '../lib/translations';

interface SettingsPageProps {
  currentUser: UserProfile;
  onLogout: () => void;
  lang: 'en' | 'so' | 'ar';
  setLang: (lang: 'en' | 'so' | 'ar') => void;
  onClose: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  addAuditLog?: (action: string, details: string) => void;
  activeLayout?: 'tenant' | 'homeowner' | 'administrator' | 'financial_ledger';
  setActiveLayout?: (layout: 'tenant' | 'homeowner' | 'administrator' | 'financial_ledger') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onLogout,
  lang,
  setLang,
  onClose,
  onUpdateUser,
  addAuditLog,
  activeLayout,
  setActiveLayout
}) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'notifications' | 'system' | 'support'>('profile');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email || '');

  // File & Camera Avatar Upload Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(lang === 'so' ? 'Fadlan dooro sawir (JPEG/PNG)' : lang === 'ar' ? 'يرجى اختيار ملف صورة صالح (JPEG/PNG)' : 'Please select an image file', true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(lang === 'so' ? 'Sawirku waa inuu ka yaryahay 5MB' : lang === 'ar' ? 'حجم الصورة يجب ألا يتجاوز ٥ ميجابايت' : 'Image size must be less than 5MB', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && onUpdateUser) {
        onUpdateUser({ avatarUrl: dataUrl });
        if (addAuditLog) {
          addAuditLog('AVATAR_UPDATE', `User updated profile picture`);
        }
        showToast(lang === 'so' ? 'Sawirka profile-kaaga waa la cusbooneysiiyay!' : lang === 'ar' ? 'تم تحديث الصورة الشخصية بنجاح!' : 'Profile picture updated successfully!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    if (onUpdateUser) {
      onUpdateUser({ avatarUrl: '' });
      showToast(lang === 'so' ? 'Sawirka profile-ka waa la tirtiray' : lang === 'ar' ? 'تمت إزالة الصورة الشخصية' : 'Profile picture removed');
    }
  };

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Security Toggles
  const [hasBiometricHardware, setHasBiometricHardware] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricLockEnabled, setBiometricLockEnabled] = useState(() => {
    return localStorage.getItem('goobjoog_biometric_lock_enabled') !== 'false';
  });

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      // Test biometric verification before enabling
      const success = await authenticateWithFingerprint(currentUser.username || currentUser.fullName);
      if (!success) {
        showToast(
          lang === 'so' ? 'Xaqiijinta farta waa la diiday ama waa la joojiyay.' :
          lang === 'ar' ? 'فشل التحقق من البصمة.' :
          'Biometric verification failed or cancelled.',
          true
        );
        return;
      }
    }

    setBiometricLockEnabled(enabled);
    localStorage.setItem('goobjoog_biometric_lock_enabled', enabled ? 'true' : 'false');
    if (addAuditLog) {
      addAuditLog('BIOMETRIC_LOCK_TOGGLE', `User set biometric lock to ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }
    showToast(
      enabled
        ? (lang === 'so' ? 'Qufida farta (Biometric) waa la daaray!' : lang === 'ar' ? 'تم تفعيل قفل التطبيق بالبصمة!' : 'Biometric App Lock enabled!')
        : (lang === 'so' ? 'Qufida farta waa la demiyay' : lang === 'ar' ? 'تم إيقاف قفل التطبيق بالبصمة' : 'Biometric App Lock disabled')
    );
  };

  useEffect(() => {
    checkBiometricHardwareSupport().then(supported => {
      setHasBiometricHardware(supported || true);
    });
  }, []);

  // Notification Toggles
  const [rentReminders, setRentReminders] = useState(true);
  const [appStatusAlerts, setAppStatusAlerts] = useState(true);
  const [newListingsAlerts, setNewListingsAlerts] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const handleThemeChange = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      showToast(lang === 'so' ? 'Muuqaalka Madow ah waa la shiday' : lang === 'ar' ? 'تم تفعيل الوضع الداكن' : 'Dark mode enabled');
    } else {
      document.documentElement.classList.remove('dark');
      showToast(lang === 'so' ? 'Muuqaalka Ifka ah waa la shiday' : lang === 'ar' ? 'تم تفعيل الوضع الفاتح' : 'Light mode enabled');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      showToast(t.fillRequiredMsg, true);
      return;
    }

    if (onUpdateUser) {
      onUpdateUser({ fullName, phone, email });
    }
    showToast(lang === 'so' ? 'Xogtaada si guul leh ayaa loo kaydiyay!' : lang === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast(lang === 'so' ? 'Geli erayga sirta ah ee hadda' : lang === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter current password', true);
      return;
    }
    if (newPassword.length < 6) {
      showToast(lang === 'so' ? 'Furaha cusub waa inuu ka badnaadaa 6 xaraf' : lang === 'ar' ? 'كلمة المرور يجب ألا تقل عن ٦ أحرف' : 'Password must be at least 6 characters', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(lang === 'so' ? 'Furayaasha cusub isma leha' : lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', true);
      return;
    }

    if (onUpdateUser) {
      onUpdateUser({ password: newPassword });
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast(lang === 'so' ? 'Furaha sirta ah waa la beddelay!' : lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!');
  };

  const handleClearSession = () => {
    if (confirm(lang === 'so' ? 'Ma hubtaa inaad dib u cusbooneysiiso nidaamka?' : lang === 'ar' ? 'هل أنت متأكد من رغبتك في إعادة تعيين الجلسة والذاكرة المؤقتة؟' : 'Are you sure you want to reset your session?')) {
      localStorage.removeItem('goobjoog_users');
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `goobjoog_profile_${currentUser.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(lang === 'so' ? 'Xogtaada JSON ahaan ayaa loo soo dejiyey' : lang === 'ar' ? 'تم تصدير بياناتك الشخصية كملف JSON بنجاح' : 'Personal data exported as JSON');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Toast Notification Bar */}
      {message && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-rose-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-shake">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label={t.back}
            >
              <ArrowLeft size={20} className={isArabic ? 'rotate-180' : ''} />
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Settings size={18} className="text-blue-600" />
                {t.settingsTitle}
              </h1>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            {t.gotIt}
          </button>
        </div>
      </div>

      {/* MAIN BODY CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT SETTINGS TABS NAVIGATION */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <User size={16} />
            <span>{t.profileTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
              activeTab === 'preferences'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <Globe size={16} />
            <span>{t.preferencesTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <Shield size={16} />
            <span>{t.securityTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <Bell size={16} />
            <span>{t.notificationsTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
              activeTab === 'system'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <HardDrive size={16} />
            <span>{t.systemTab}</span>
          </button>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="md:col-span-8 lg:col-span-9">
          
          {/* 1. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold">{t.profileTab}</h3>
                <p className="text-xs text-slate-400">{t.personalInfo}</p>
              </div>

              {/* Avatar Photo Area */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-inner">
                    {currentUser.fullName.charAt(0)}
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <span className="text-xs font-bold block">{t.profilePictureTitle}</span>
                  <p className="text-[10px] text-slate-400">{t.photoRequirements}</p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      {t.uploadPhotoBtn}
                    </button>
                    {currentUser.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition"
                      >
                        {t.removePhotoBtn}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account View Mode Switcher (Tenant vs Landlord Mode) */}
              {setActiveLayout && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-3">
                  <div>
                    <span className="text-xs font-black text-blue-900 dark:text-blue-200 block">
                      🔀 {lang === 'so' ? 'Habka Muuqaalka Akoonka (Account View Mode)' : 'Account View Mode Switcher'}
                    </span>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      {lang === 'so' ? 'U beddel muuqaalka Kireystaha ama Mulkiilaha ee nidaamka:' : 'Switch between Tenant experience and Landlord management workspace:'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLayout('tenant');
                        showToast(lang === 'so' ? 'U beddelay habka Kireystaha (Tenant Mode)' : 'Switched to Tenant View');
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                        activeLayout === 'tenant'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>🏠</span>
                      <span>{t.navHouses || 'Tenant View'}</span>
                    </button>

                    {((currentUser?.roles || []).includes('homeowner') || (currentUser?.roles || []).includes('landlord' as any) || currentUser?.upgradeStatus === 'approved' || (currentUser?.roles || []).includes('administrator') || (currentUser?.roles || []).includes('admin' as any)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLayout('homeowner');
                          showToast(lang === 'so' ? 'U beddelay habka Mulkiilaha (Landlord Mode)' : 'Switched to Landlord View');
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                          activeLayout === 'homeowner'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <span>🏡</span>
                        <span>{t.navLandlord || 'Landlord View'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.fullName} *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.phone} *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.email}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {t.save}
                </button>
              </form>
            </div>
          )}

          {/* 2. PREFERENCES TAB (LANGUAGE & THEME) */}
          {activeTab === 'preferences' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold">{t.languageDisplayTitle}</h3>
                <p className="text-xs text-slate-400">{t.chooseLanguageSub}</p>
              </div>

              {/* Language Selection */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe size={14} /> {t.systemLanguageLabel}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setLang('so')}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                      lang === 'so'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-lg block mb-0.5">🇸🇴</span>
                      <span className="text-xs font-bold block">Af-Soomaali</span>
                      <span className="text-[10px] text-slate-400">Somali Language</span>
                    </div>
                    {lang === 'so' && <Check size={16} className="text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLang('ar')}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                      lang === 'ar'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-lg block mb-0.5">🇸🇦</span>
                      <span className="text-xs font-bold block">العربية</span>
                      <span className="text-[10px] text-slate-400">Arabic (RTL)</span>
                    </div>
                    {lang === 'ar' && <Check size={16} className="text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                      lang === 'en'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-lg block mb-0.5">🇬🇧</span>
                      <span className="text-xs font-bold block">English</span>
                      <span className="text-[10px] text-slate-400">Global Edition</span>
                    </div>
                    {lang === 'en' && <Check size={16} className="text-blue-600" />}
                  </button>
                </div>
              </div>

              {/* Theme Mode Toggle */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.themeModeLabel}</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleThemeChange(false)}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                      !isDarkMode
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sun size={20} className="text-amber-500" />
                    <div>
                      <span className="text-xs font-bold block">{t.lightMode}</span>
                      <span className="text-[10px] text-slate-400">{t.lightModeDesc}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange(true)}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                      isDarkMode
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Moon size={20} className="text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold block">{t.darkMode}</span>
                      <span className="text-[10px] text-slate-400">{t.darkModeDesc}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold">{t.passwordSecurityTitle}</h3>
                <p className="text-xs text-slate-400">{t.biometricDesc}</p>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.currentPassword} *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.newPassword} *</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.confirmPassword} *</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {t.updatePasswordBtn}
                </button>
              </form>

              {/* App lock / Unlock with biometric matching WhatsApp style screenshot */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Fingerprint size={18} className="text-blue-600 dark:text-blue-400" />
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {lang === 'so' ? 'Ku fur farta (Unlock with biometric)' : lang === 'ar' ? 'إلغاء القفل بالبصمة (Unlock with biometric)' : 'Unlock with biometric'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                        {lang === 'so'
                          ? 'Marka la daaro, waxaad u baahan doontaa inaad isticmaasho farahaaga, wejigaaga ama calaamad kale oo gaar ah si aad u furto GoobJoog. Waxaad weli ka jawaabi kartaa ogeysiisyada marka GoobJoog la qufo.'
                          : lang === 'ar'
                          ? 'عند التفعيل، ستحتاج إلى استخدام بصمة الإصبع أو الوجه أو المعرفات الحيوية لفتح GoobJoog. ستتمكن من الرد على الإشعارات والمكالمات حتى لو كان GoobJoog مقفلاً.'
                          : "When enabled, you'll need to use fingerprint, face or other unique identifiers to open GoobJoog. You can still answer calls / notifications if GoobJoog is locked."}
                      </p>
                    </div>

                    {/* WhatsApp / iOS Style Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={biometricLockEnabled}
                        onChange={(e) => handleBiometricToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{t.twoFactorAuthTitle}</span>
                    <p className="text-[11px] text-slate-400">{t.twoFactorDesc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold">{t.notificationPreferencesTitle}</h3>
                <p className="text-xs text-slate-400">{t.notificationsTab}</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.rentRemindersLabel}</span>
                  <input
                    type="checkbox"
                    checked={rentReminders}
                    onChange={(e) => setRentReminders(e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.appAlertsLabel}</span>
                  <input
                    type="checkbox"
                    checked={appStatusAlerts}
                    onChange={(e) => setAppStatusAlerts(e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.newListingsAlertsLabel}</span>
                  <input
                    type="checkbox"
                    checked={newListingsAlerts}
                    onChange={(e) => setNewListingsAlerts(e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 5. SYSTEM & STORAGE TAB */}
          {activeTab === 'system' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold">{t.systemTab}</h3>
                <p className="text-xs text-slate-400">{t.systemResetDesc}</p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-900 dark:text-amber-200 text-xs space-y-1">
                <span className="font-bold block">⚠️ {t.databaseSandboxTitle}</span>
                <p>{t.sandboxAlert}</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClearSession}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {t.resetSessionBtn}
                </button>

                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  {t.exportDataBtn}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
