import React, { useState, useEffect } from 'react';
import { User, Shield, Smartphone, Key, Mail, Lock, ArrowRight, Fingerprint, CheckCircle2, Eye, EyeOff, ScanFace } from 'lucide-react';
import type { UserProfile } from '../domain/entities';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { translations } from '../lib/translations';
import { checkBiometricHardwareSupport, authenticateWithFingerprint } from '../shared/utils/biometrics';

interface AuthPortalProps {
  users: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterUser: (newUser: UserProfile) => void;
  lang: 'en' | 'so' | 'ar';
  setLang: (lang: 'en' | 'so' | 'ar') => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ 
  users, 
  onLoginSuccess, 
  onRegisterUser, 
  lang, 
  setLang
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register_public'>('login');
  const [hasBiometricHardware, setHasBiometricHardware] = useState<boolean>(true);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkBiometricHardwareSupport().then(supported => {
      setHasBiometricHardware(supported || true);
    });
  }, []);

  const handleFingerprintAuth = async () => {
    setBiometricLoading(true);
    try {
      const targetUsername = loginUsername || 'tenant';
      const success = await authenticateWithFingerprint(targetUsername);
      if (success) {
        const foundUser = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase()) || users[1] || users[0];
        onLoginSuccess(foundUser);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBiometricLoading(false);
    }
  };
  
  // Registration step states
  const [signupStep, setSignupStep] = useState<'intent' | 'form'>('intent');
  const [intentRole, setIntentRole] = useState<'tenant' | 'homeowner'>('tenant');

  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'administrator'>('administrator');

  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const handleLangChange = (targetLang: 'en' | 'so' | 'ar') => {
    setLang(targetLang);
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      alert(t.fillRequiredMsg);
      return;
    }
    
    const foundUser = users.find(
      u => u.username.toLowerCase() === loginUsername.toLowerCase() && u.password === loginPassword
    );
    
    if (foundUser) {
      onLoginSuccess(foundUser);
    } else {
      alert(`${t.loginFailedMsg}\n\nDemo seeds:\n- tenant / tenant123\n- landlord / landlord123`);
    }
  };

  const handleAutofill = (demoUser: string, demoPass: string) => {
    setLoginUsername(demoUser);
    setLoginPassword(demoPass);
  };

  const handleRegister = (e: React.FormEvent, isStaff: boolean) => {
    e.preventDefault();
    if (!fullName || !phone || !username || !password) {
      alert(t.fillRequiredMsg);
      return;
    }

    const assignedRole = isStaff 
      ? staffRole 
      : (intentRole === 'homeowner' ? 'landlord' : 'tenant');

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: username.toLowerCase(),
      password,
      roles: [assignedRole as any],
      fullName,
      email: email || `${username}@goobjoog.so`,
      phone,
      isVerified: true
    };

    onRegisterUser(newUser);
    alert(t.regSuccessMsg);
    
    setFullName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPassword('');
    setActiveMode('login');
    setSignupStep('intent');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 bg-[#edf2f7] dark:bg-slate-950 transition-colors" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Dynamic database fallback notice */}
      {!isSupabaseConfigured && (
        <div className="max-w-md md:max-w-4xl w-full mb-3 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs px-4 py-2 rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span>⚠️</span>
            <span>{t.sandboxWarning}</span>
          </div>
          <span className="text-[10px] opacity-75 hidden sm:inline">
            {t.sandboxAlert}
          </span>
        </div>
      )}

      {/* Main Responsive Container */}
      <div className="max-w-md md:max-w-4xl w-full bg-[#f4f7fb] dark:bg-slate-900 rounded-[2.5rem] shadow-[12px_12px_24px_#c5d0e0,-12px_-12px_24px_#ffffff] dark:shadow-none border border-white/80 dark:border-slate-800 overflow-hidden animate-fade-in relative grid grid-cols-1 md:grid-cols-2 p-3 sm:p-5 gap-4">
        
        {/* DESKTOP LEFT HERO PANEL WITH BACKGROUND VIDEO */}
        <div className="hidden md:flex flex-col justify-between p-8 lg:p-10 text-white rounded-[2rem] relative overflow-hidden shadow-lg group">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
          >
            <source src="/login-bg.mp4" type="video/mp4" />
          </video>

          {/* Gradient Overlay for Crisp Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-indigo-950/75 to-indigo-900/60 backdrop-blur-[2px] z-0"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 shadow-md">
                <span className="text-3xl">🏠</span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-wide text-white">{t.appName}</h1>
                <p className="text-xs text-blue-100 font-medium">{t.subtitle}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20">
                <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {lang === 'so' ? 'Guryaha & Kireynta Tooska ah' : lang === 'ar' ? 'البوابة العقارية المباشرة' : 'Direct Property Portals'}
                  </h4>
                  <p className="text-[11px] text-blue-100 leading-relaxed">
                    {lang === 'so' ? 'Isku xirka kireystayaasha, mulkiilayaasha, iyo maamulka Soomaaliya oo dhan.' :
                     lang === 'ar' ? 'ربط المستأجرين والملّاك وإدارة النظام بكل سلاسة وأمان عبر الصومال.' :
                     'Connecting tenants, landlords & admins seamlessly across Somalia.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20">
                <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {lang === 'so' ? 'Lacag Bixinta Mobile Money ee Soomaaliya' : lang === 'ar' ? 'التكامل مع محافظ الهاتف المحمول' : 'Somali Mobile Money Integration'}
                  </h4>
                  <p className="text-[11px] text-blue-100 leading-relaxed">
                    {lang === 'so' ? 'Lacag bixin degdeg ah oo toos ah oo maraysa EVC Plus, Sahal, Zaad, iyo Waafi.' :
                     lang === 'ar' ? 'سداد فوري وتلقائي للإيجار عبر EVC Plus و Zaad و Sahal و Waafi.' :
                     'Instant automated payments via Waafi, EVC Plus, Zaad, and Sahal.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20">
                <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {lang === 'so' ? 'Amniga Biometric-ga & Farta' : lang === 'ar' ? 'الأمان البيومتري المتقدم' : 'Biometric & WebAuthn Ready'}
                  </h4>
                  <p className="text-[11px] text-blue-100 leading-relaxed">
                    {lang === 'so' ? 'Gal adigoo isticmaalaya fartaada ama wajigaaga si degdeg ah oo ammaan ah.' :
                     lang === 'ar' ? 'تسجيل دخول سريع وآمن ببصمة الإصبع أو التعرف على الوجه دون كلمات مرور.' :
                     'Fast passwordless fingerprint and face identification for ultimate security.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-[11px] text-blue-100">
            <span>© {new Date().getFullYear()} {t.appName} Platform</span>
            <span className="font-semibold text-emerald-300">Somalia 🇸🇴</span>
          </div>
        </div>

        {/* NEUMORPHIC RIGHT FORM CONTAINER */}
        <div className="flex flex-col justify-between p-4 sm:p-6 bg-[#f4f7fb] dark:bg-slate-900 rounded-[2rem]">
          
          <div className="space-y-4">
            
            {/* Top Bar Header with Neumorphic Logo & Language Selector */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#f4f7fb] dark:bg-slate-800 flex items-center justify-center shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-none border border-white/95 dark:border-slate-700">
                  <span className="text-xl">🏠</span>
                </div>
                <span className="font-black text-slate-800 dark:text-slate-100 tracking-wide text-xl">{t.appName}</span>
              </div>

              {/* Language Pills */}
              <div className="flex items-center gap-1 bg-[#f4f7fb] dark:bg-slate-800 p-1.5 rounded-2xl shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] dark:shadow-none border border-slate-200/50 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleLangChange('so')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-xl transition ${
                    lang === 'so' ? 'bg-[#4873b8] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇸🇴 SO
                </button>
                <button
                  type="button"
                  onClick={() => handleLangChange('ar')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-xl transition ${
                    lang === 'ar' ? 'bg-[#4873b8] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇸🇦 AR
                </button>
                <button
                  type="button"
                  onClick={() => handleLangChange('en')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-xl transition ${
                    lang === 'en' ? 'bg-[#4873b8] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
            </div>

            {/* Inset Neumorphic Segmented Tab Toggle (Log In / Sign Up) */}
            <div className="flex bg-[#f4f7fb] dark:bg-slate-800 p-1.5 rounded-2xl shadow-[inset_3px_3px_6px_#c8d3e6,inset_-3px_-3px_6px_#ffffff] dark:shadow-none border border-slate-200/40 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    setSignupStep('intent');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                    activeMode === 'login' 
                      ? 'bg-[#4873b8] text-white shadow-md' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {t.login}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('register_public');
                    setSignupStep('intent');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                    activeMode === 'register_public' 
                      ? 'bg-[#4873b8] text-white shadow-md' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {t.registerCustomer}
                </button>
              </div>

            {/* LOGIN FORM */}
            {activeMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t.username}
                  </label>
                  <div className="relative flex items-center">
                    <User className={`absolute ${isArabic ? 'right-3.5' : 'left-3.5'} text-slate-400`} size={16} />
                    <input
                      type="text"
                      placeholder={lang === 'so' ? 'tusaale: tenant, landlord, admin' : lang === 'ar' ? 'مثال: tenant, landlord, admin' : 'e.g. tenant, landlord, admin'}
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className={`w-full ${isArabic ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-3 text-xs border border-slate-200/50 dark:border-slate-700 rounded-2xl bg-[#f4f7fb] dark:bg-slate-950 shadow-[inset_3px_3px_6px_#c8d3e6,inset_-3px_-3px_6px_#ffffff] dark:shadow-none focus:outline-none text-slate-800 dark:text-slate-100 font-medium`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t.password}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className={`absolute ${isArabic ? 'right-3.5' : 'left-3.5'} text-slate-400`} size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`w-full ${isArabic ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10 text-left'} py-3 text-xs border border-slate-200/50 dark:border-slate-700 rounded-2xl bg-[#f4f7fb] dark:bg-slate-950 shadow-[inset_3px_3px_6px_#c8d3e6,inset_-3px_-3px_6px_#ffffff] dark:shadow-none focus:outline-none text-slate-800 dark:text-slate-100 font-medium`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${isArabic ? 'left-3.5' : 'right-3.5'} text-slate-400 hover:text-slate-700 dark:text-slate-300 transition`}
                      aria-label="Toggle Password Visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Main Soft Raised Blue Log In Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#4873b8] to-[#3b63a0] hover:opacity-95 text-white font-bold py-3 rounded-2xl shadow-[5px_5px_12px_#c3cddc,-5px_-5px_12px_#ffffff] dark:shadow-none transition active:scale-98 text-sm tracking-wide mt-2"
                >
                  {t.login}
                </button>

                {/* DEMO ACCOUNTS CARD */}
                <div className="bg-[#f4f7fb] dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-700 shadow-[inset_2px_2px_5px_#c8d3e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-none space-y-2 mt-4">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 text-[11px] block text-center uppercase tracking-wider">
                    {t.demoAccounts}
                  </span>

                  <div className="space-y-2">
                    {/* Tenant row */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">👤</span>
                        <span>{t.tenant} (tenant)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutofill('tenant', 'tenant123')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#4873b8] hover:bg-[#3b63a0] text-white text-[11px] font-bold shadow transition active:scale-95"
                      >
                        {t.autofill}
                      </button>
                    </div>

                    {/* Landlord row */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">🏡</span>
                        <span>{t.landlord} (landlord)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutofill('landlord', 'landlord123')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#4873b8] hover:bg-[#3b63a0] text-white text-[11px] font-bold shadow transition active:scale-95"
                      >
                        {t.autofill}
                      </button>
                    </div>

                  </div>
                </div>

              </form>
            )}

            {/* PUBLIC SIGN UP */}
            {activeMode === 'register_public' && (
              <div className="space-y-3 pt-1">
                {signupStep === 'intent' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                      {t.intentQuestion}
                    </h3>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIntentRole('homeowner');
                          setSignupStep('form');
                        }}
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 hover:border-[#4873b8] bg-white dark:bg-slate-950 rounded-2xl transition text-left flex items-start gap-3 shadow-sm group"
                      >
                        <span className="text-2xl">🏠</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#4873b8] block">
                            {t.intentOwnerTitle}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {t.intentOwnerSub}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIntentRole('tenant');
                          setSignupStep('form');
                        }}
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 hover:border-[#4873b8] bg-white dark:bg-slate-950 rounded-2xl transition text-left flex items-start gap-3 shadow-sm group"
                      >
                        <span className="text-2xl">🔍</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#4873b8] block">
                            {t.intentTenantTitle}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {t.intentTenantSub}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {signupStep === 'form' && (
                  <form onSubmit={(e) => handleRegister(e, false)} className="space-y-2.5">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {t.personalInfo}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSignupStep('intent')}
                        className="text-[10px] text-[#4873b8] hover:underline font-bold"
                      >
                        {t.back}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.fullName} *</label>
                      <input
                        type="text"
                        placeholder="Abdi Omar Ali"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-[#4873b8] focus:outline-none text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.email}</label>
                        <input
                          type="email"
                          placeholder="name@example.so"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-[#4873b8] focus:outline-none text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.phone} *</label>
                        <input
                          type="text"
                          placeholder="+25261XXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-[#4873b8] focus:outline-none text-slate-800 dark:text-slate-100"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.username} *</label>
                        <input
                          type="text"
                          placeholder="abdi"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-[#4873b8] focus:outline-none text-slate-800 dark:text-slate-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.password} *</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:ring-2 focus:ring-[#4873b8] focus:outline-none text-slate-800 dark:text-slate-100"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#4873b8] hover:bg-[#3b63a0] text-white font-bold py-2.5 rounded-xl shadow transition mt-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>{t.signup}</span>
                      <ArrowRight size={14} className={isArabic ? 'rotate-180' : ''} />
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
