import React, { useState, useEffect } from 'react';
import { User, Shield, Smartphone, Key, Mail, Lock, ArrowRight, Fingerprint, CheckCircle2, Eye, EyeOff, Globe } from 'lucide-react';
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
  const [activeMode, setActiveMode] = useState<'login' | 'register_public' | 'register_staff'>('login');
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
  const [staffRole, setStaffRole] = useState<'administrator' | 'accountant'>('accountant');

  const t = translations[lang];
  const isArabic = lang === 'ar';

  const handleLangChange = (targetLang: 'en' | 'so' | 'ar') => {
    setLang(targetLang);
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      alert(lang === 'so' ? "Fadlan buuxi dhammaan meelaha banaan." : lang === 'ar' ? "يرجى ملء جميع الحقول." : "Please fill in both fields.");
      return;
    }
    
    const foundUser = users.find(
      u => u.username.toLowerCase() === loginUsername.toLowerCase() && u.password === loginPassword
    );
    
    if (foundUser) {
      onLoginSuccess(foundUser);
    } else {
      const errMessage = lang === 'so' ? "Giriita wuu guuldareystay! Magaca ama furaha sirta ah ayaa khaldan." :
                         lang === 'ar' ? "فشل تسجيل الدخول! اسم المستخدم أو كلمة المرور غير صحيحة." :
                         "Authentication failed! Invalid username or password.";
      alert(`${errMessage}\n\nDemo seeds:\n- tenant / tenant123\n- landlord / landlord123\n- accountant / accountant123\n- admin / admin123`);
    }
  };

  const handleRegister = (e: React.FormEvent, isStaff: boolean) => {
    e.preventDefault();
    if (!fullName || !phone || !username || !password) {
      alert(lang === 'so' ? "Fadlan buuxi dhammaan meelaha rasmiga ah." : lang === 'ar' ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    const assignedRole = isStaff 
      ? staffRole 
      : (intentRole === 'homeowner' ? 'landlord' : 'tenant');

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: username.toLowerCase(),
      password,
      role: assignedRole,
      fullName,
      email: email || `${username}@goobjoog.so`,
      phone,
    };

    onRegisterUser(newUser);
    alert(
      lang === 'so'
        ? `Waad ku guuleysatay diiwaangelinta! Ku soo dhowaw GoobJoog.`
        : lang === 'ar'
        ? `تم التسجيل بنجاح! مرحباً بك في GoobJoog.`
        : `Registration successful! Welcome to GoobJoog.`
    );
    
    // Reset form
    setFullName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPassword('');
    setActiveMode('login');
    setSignupStep('intent');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-100 dark:bg-slate-950 transition-colors" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Dynamic database fallback notice */}
      {!isSupabaseConfigured && (
        <div className="max-w-md md:max-w-4xl w-full mb-3 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span>⚠️</span>
            <span>
              {lang === 'so' 
                ? 'Sandbox Database Active (Local Storage)' 
                : lang === 'ar' 
                ? 'وضع قاعدة البيانات المحلية مفعل' 
                : 'Local Database Sandbox Active'}
            </span>
          </div>
          <span className="text-[10px] opacity-75 hidden sm:inline">
            {lang === 'so' ? 'Supabase laguma habeyn .env' : 'Supabase parameters unconfigured'}
          </span>
        </div>
      )}

      {/* Main Responsive Split Card Container */}
      <div className="max-w-md md:max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-fade-in relative grid grid-cols-1 md:grid-cols-2">
        
        {/* DESKTOP LEFT HERO PANEL */}
        <div className="hidden md:flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white relative overflow-hidden">
          {/* Abstract backdrop glows */}
          <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wide text-white">GoobJoog</h1>
                <p className="text-xs text-indigo-200 font-medium">House Renting System in Somalia</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Property Portals</h4>
                  <p className="text-[11px] text-indigo-200 leading-relaxed">
                    Connecting tenants, landlords, accountants & admins seamlessly across Somalia.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-white">Somali Mobile Money Integration</h4>
                  <p className="text-[11px] text-indigo-200 leading-relaxed">
                    Instant automated payments via Waafi, EVC Plus, Zaad, and Sahal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-white">Biometric & WebAuthn Ready</h4>
                  <p className="text-[11px] text-indigo-200 leading-relaxed">
                    Fast passwordless fingerprint and face identification for ultimate security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note inside left panel */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200">
            <span>© {new Date().getFullYear()} GoobJoog Platform</span>
            <span className="font-semibold text-emerald-300">Somalia 🇸🇴</span>
          </div>
        </div>

        {/* MOBILE & DESKTOP RIGHT FORM CONTAINER */}
        <div className="flex flex-col justify-between p-5 sm:p-8 bg-white dark:bg-slate-900">
          
          {/* Top Bar: Language Selector & Mobile Brand */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              {/* Mobile Brand Title */}
              <div className="flex items-center gap-2 md:hidden">
                <span className="text-xl">🏠</span>
                <span className="font-black text-slate-800 dark:text-slate-100 tracking-wide text-base">GoobJoog</span>
              </div>
              
              <div className="hidden md:block text-xs font-semibold text-slate-400">
                {activeMode === 'login' 
                  ? (lang === 'so' ? 'Giriita' : 'Welcome back') 
                  : (lang === 'so' ? 'Akaun cusub' : 'Create account')}
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleLangChange('so')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                    lang === 'so' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  🇸🇴 SO
                </button>
                <button
                  type="button"
                  onClick={() => handleLangChange('en')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                    lang === 'en' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  🇬🇧 EN
                </button>
                <button
                  type="button"
                  onClick={() => handleLangChange('ar')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                    lang === 'ar' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  🇸🇦 AR
                </button>
              </div>
            </div>

            {/* Tab Toggle */}
            {activeMode !== 'register_staff' && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    setSignupStep('intent');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    activeMode === 'login' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
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
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    activeMode === 'register_public' 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {t.registerCustomer}
                </button>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t.username}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder={lang === 'so' ? 'Magacaaga (e.g. tenant, admin)' : 'e.g. tenant, admin'}
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t.password}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 text-slate-400" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-slate-800 dark:text-slate-200 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-700 dark:text-slate-300 transition"
                      aria-label="Toggle Password Visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition active:scale-98 text-xs tracking-wide mt-2"
                >
                  {t.login}
                </button>

                {/* BIOMETRIC LOGIN */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {lang === 'so' ? 'ama farta/wajiga' : 'or biometric'}
                    </span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFingerprintAuth}
                    disabled={biometricLoading}
                    className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
                  >
                    <Fingerprint size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {biometricLoading
                        ? (lang === 'so' ? 'Hubinayaa...' : 'Scanning...')
                        : (lang === 'so' ? 'Biometric Login (Farta/Wajiga)' : 'Biometric Login')}
                    </span>
                  </button>
                </div>

                {/* DEMO ACCOUNTS BOX */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {lang === 'so' ? 'Koontooyinka Tijaabada (Demo):' : 'Quick Demo Credentials:'}
                  </span>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                    <div>👤 tenant / tenant123</div>
                    <div>🏡 landlord / landlord123</div>
                    <div>📊 accountant / accountant123</div>
                    <div>🛡️ admin / admin123</div>
                  </div>
                </div>
              </form>
            )}

            {/* PUBLIC SIGN UP */}
            {activeMode === 'register_public' && (
              <div className="space-y-3">
                {signupStep === 'intent' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                      {lang === 'so' ? 'Maxay tahay ujeeddadaadu?' : 'What is your primary goal?'}
                    </h3>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIntentRole('homeowner');
                          setSignupStep('form');
                        }}
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 rounded-2xl transition text-left flex items-start gap-3 group"
                      >
                        <span className="text-2xl">🏠</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block">
                            {lang === 'so' ? 'Waxaan leeyahay guri' : 'I own a property'}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {lang === 'so' ? 'Waxaan rabaa inaan kiraysi geliyo.' : 'List it for rent and collect payments.'}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIntentRole('tenant');
                          setSignupStep('form');
                        }}
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 rounded-2xl transition text-left flex items-start gap-3 group"
                      >
                        <span className="text-2xl">🔍</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block">
                            {lang === 'so' ? 'Waxaan raadinayaa guri' : 'I am looking for a home'}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {lang === 'so' ? 'Waxaan rabaa inaan kiraysto.' : 'Discover houses and pay rent online.'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {signupStep === 'form' && (
                  <form onSubmit={(e) => handleRegister(e, false)} className="space-y-2.5">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {lang === 'so' ? 'Diiwaangelinta Xogtaada' : 'Personal Information'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSignupStep('intent')}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                      >
                        {lang === 'so' ? 'Dib u Laabo' : 'Go Back'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.fullName} *</label>
                      <input
                        type="text"
                        placeholder="Abdi Omar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.email}</label>
                        <input
                          type="email"
                          placeholder="name@example.so"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.phone} *</label>
                        <input
                          type="text"
                          placeholder="25261XXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.username} *</label>
                        <input
                          type="text"
                          placeholder="abdi"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.password} *</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl shadow transition mt-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>{t.signup}</span>
                      <ArrowRight size={14} />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* STAFF SIGN UP */}
            {activeMode === 'register_staff' && (
              <form onSubmit={(e) => handleRegister(e, true)} className="space-y-2.5">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Shield className="text-indigo-600" size={14} />
                    {t.registerStaff}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMode('login')}
                    className="text-[10px] text-slate-500 dark:text-slate-400 hover:underline font-bold"
                  >
                    {lang === 'so' ? 'Dib u laabo' : 'Back'}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.fullName} *</label>
                  <input
                    type="text"
                    placeholder="Eng. Huda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.phone} *</label>
                    <input
                      type="text"
                      placeholder="25261XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.role} *</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="accountant">{t.accountant}</option>
                      <option value="administrator">{t.admin}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.username} *</label>
                    <input
                      type="text"
                      placeholder="huda_admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.password} *</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold py-2 rounded-xl shadow transition mt-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <Key size={14} />
                  {lang === 'so' ? 'Diiwaangeli Hawl-wadeenka' : 'Register Staff Member'}
                </button>
              </form>
            )}

          </div>

          {/* Bottom Footer Switcher */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            {activeMode !== 'register_staff' ? (
              <button
                type="button"
                onClick={() => {
                  setActiveMode('register_staff');
                }}
                className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition font-semibold"
              >
                🔒 {lang === 'so' ? 'Albaabka Hawl-wadeenada (Staff Portal)' : 'Administrative Staff Portal'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveMode('login');
                }}
                className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition font-semibold"
              >
                👤 {lang === 'so' ? 'Ku laabo Diiwaanka Macmiilka' : 'Return to Customer Sign In'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
