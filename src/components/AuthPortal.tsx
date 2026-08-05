import React, { useState, useEffect } from 'react';
import { User, Shield, Smartphone, Key, Mail, Lock, ArrowRight, Fingerprint, CheckCircle2, Eye, EyeOff } from 'lucide-react';
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
      // If window.PublicKeyCredential or native authenticator available
      setHasBiometricHardware(supported || true); // Supported on mobile devices
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

    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      alert(lang === 'so' ? "Magacaan waa la qaatay. Dooro mid kale." : lang === 'ar' ? "اسم المستخدم مستخدم بالفعل. اختر اسماً آخر." : "Username is already taken. Choose another.");
      return;
    }

    const assignedRoles = isStaff ? [staffRole] : [intentRole];

    const newUser: UserProfile = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      fullName,
      email,
      phone,
      username,
      password,
      roles: assignedRoles,
      upgradeStatus: 'none',
      isVerified: isStaff ? true : false
    };

    onRegisterUser(newUser);
    
    const successMsg = lang === 'so' ? `Akoonka waa la diiwaangeliyey! Hada waad soo geli kartaa.` :
                       lang === 'ar' ? `تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.` :
                       `Account registered successfully! Log in using your new credentials.`;
    alert(successMsg);
    
    setFullName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPassword('');
    setActiveMode('login');
    setSignupStep('intent');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Dynamic database fallback notice */}
      {!isSupabaseConfigured && (
        <div className="max-w-md w-full bg-amber-50/80 backdrop-blur-md border border-amber-200/50 text-amber-900 text-xs px-4 py-3.5 rounded-2xl shadow-sm flex flex-col gap-1.5 leading-relaxed font-sans">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <span>⚠️</span> {lang === 'so' ? 'Diiwaanka Sandbox Active' : lang === 'ar' ? 'وضع قاعدة البيانات الاحتياطية مفعل' : 'Database Fallback Active'}
          </div>
          <p>
            {lang === 'so' 
              ? 'Nidaamku wuxuu ku shaqaynayaa localStorage sababtoo ah Supabase laguma habeyn `.env`.'
              : lang === 'ar'
              ? 'النظام يعمل على قاعدة بيانات محلية مؤقتة لعدم وجود إعدادات ملف البيئة لـ Supabase.'
              : 'The system is running on a local-only database sandbox because Supabase parameters are not configured in .env.'}
          </p>
        </div>
      )}

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden animate-fade-in relative">
        
        {/* Branding header */}
        <div className="bg-gradient-to-br from-brand-primary to-indigo-600 text-white p-10 text-center relative overflow-hidden">
          {/* Abstract circles for premium look */}
          <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-white/95 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-brand-primary-light/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-white/30">
              <span className="text-3xl">🏠</span>
            </div>
            <span className="text-3xl font-black tracking-wider text-white flex items-center justify-center gap-1.5 select-none drop-shadow-md">
              GoobJoog
            </span>
            <p className="text-xs text-blue-100 font-medium tracking-wide opacity-90">{t.subtitle}</p>
          </div>
        </div>

        {/* Tab Toggle */}
        {activeMode !== 'register_staff' && (
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setActiveMode('login');
                setSignupStep('intent');
              }}
              className={`flex-1 py-3.5 text-xs font-bold transition uppercase tracking-wider border-b-2 ${
                activeMode === 'login' ? 'border-brand-primary text-brand-primary bg-slate-50 dark:bg-slate-950/50/50' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.login}
            </button>
            <button
              onClick={() => {
                setActiveMode('register_public');
                setSignupStep('intent');
              }}
              className={`flex-1 py-3.5 text-xs font-bold transition uppercase tracking-wider border-b-2 ${
                activeMode === 'register_public' ? 'border-brand-primary text-brand-primary bg-slate-50 dark:bg-slate-950/50/50' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.registerCustomer}
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          
          {/* LOGIN FORM */}
          {activeMode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {lang === 'so' ? 'Giriita nidaamka' : lang === 'ar' ? 'تسجيل الدخول للنظام' : 'Access System Workspace'}
              </h3>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.username}</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder={lang === 'so' ? 'Magacaaga' : lang === 'ar' ? 'اسم المستخدم الخاص بك' : 'e.g. tenant, admin'}
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm border-0 bg-slate-50 dark:bg-slate-950/50 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all shadow-inner text-slate-800 dark:text-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">{t.password}</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-sm border-0 bg-slate-50 dark:bg-slate-950/50 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all shadow-inner text-slate-800 dark:text-slate-200 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-700 dark:text-slate-300 transition"
                    aria-label="Toggle Password Visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-primary to-indigo-500 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-brand-primary/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4 text-sm tracking-wide"
              >
                {t.login}
              </button>

              {/* FINGERPRINT BIOMETRIC LOGIN BUTTON (ALWAYS VISIBLE) */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 my-1">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {lang === 'so' ? 'ama farta/wajiga ku soo gal' : lang === 'ar' ? 'أو بالبصمة/الوجه' : 'or login with face/fingerprint'}
                  </span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <button
                  type="button"
                  onClick={handleFingerprintAuth}
                  disabled={biometricLoading}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 font-black text-xs flex items-center justify-center gap-3 transition active:scale-95 shadow-md group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                    <Fingerprint size={18} />
                  </div>
                  <span className="tracking-wide">
                    {biometricLoading
                      ? (lang === 'so' ? 'Hubinayaa...' : 'Scanning...')
                      : (lang === 'so' ? 'Soo Gal Farta/Wajiga (Biometric Login)' : lang === 'ar' ? 'تسجيل الدخول بالبصمة/الوجه' : 'Biometric Login')}
                  </span>
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded p-3 text-[10px] text-slate-500 dark:text-slate-500 flex flex-col gap-1 mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">{lang === 'so' ? 'Koontooyinka Tijaabada (Demo):' : lang === 'ar' ? 'حسابات تجريبية سريعة:' : 'Quick Demo Accounts (Username / Pass):'}</span>
                <span>👤 {t.tenant}: <code className="bg-slate-200 px-1 rounded text-slate-800 dark:text-slate-200 font-mono">tenant</code> / <code className="bg-slate-200 px-1 rounded text-slate-800 dark:text-slate-200 font-mono">tenant123</code></span>
                <span>🏡 {t.landlord}: <code className="bg-slate-200 px-1 rounded text-slate-800 dark:text-slate-200 font-mono">landlord</code> / <code className="bg-slate-200 px-1 rounded text-slate-800 dark:text-slate-200 font-mono">landlord123</code></span>
                <span>📊 {t.accountant}: <code className="bg-slate-200 px-1 rounded text-slate-800 dark:text-slate-200 font-mono">accountant</code> / <code className="bg-slate-200 px-1 rounded text-slate-800 dark:text-slate-200 font-mono">accountant123</code></span>
                <span>🛡️ {t.admin}: <code className="bg-slate-200 px-1 rounded text-slate-800 dark:text-slate-200 font-mono">admin</code> / <code className="bg-slate-200 px-1 rounded text-slate-800 dark:text-slate-200 font-mono">admin123</code></span>
              </div>
            </form>
          )}

          {/* PUBLIC SIGN UP (GOAL-BASED ONBOARDING) */}
          {activeMode === 'register_public' && (
            <div className="flex flex-col gap-3">
              
              {/* STEP 1: INTENT SELECTION SCREENS */}
              {signupStep === 'intent' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider text-center mb-1">
                    {lang === 'so' ? 'Maxay tahay ujeeddadaadu?' : lang === 'ar' ? 'ما هي غايتك الرئيسية؟' : 'What is your primary goal?'}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Card 1: Homeowner (Waxaan leeyahay guri) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIntentRole('homeowner');
                        setSignupStep('form');
                        window.speechSynthesis.cancel();
                      }}
                      className="p-5 border-2 border-slate-200 dark:border-slate-800 hover:border-brand-primary bg-slate-50 dark:bg-slate-950/50 hover:bg-brand-primary-light/5 rounded-xl transition text-left flex items-start gap-4 focus:outline-none shadow-sm"
                    >
                      <span className="text-3xl">🏠</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {lang === 'so' ? 'Waxaan leeyahay guri' : lang === 'ar' ? 'أملك عقاراً سكنياً' : 'I own a property'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-500 leading-normal font-medium">
                          {lang === 'so' ? 'Waxaan rabaa inaan kiraysi geliyo.' : lang === 'ar' ? 'أرغب في إدراجه للتأجير واستلام أموال الكراء.' : 'I want to list it for rent and manage collections.'}
                        </span>
                      </div>
                    </button>

                    {/* Card 2: Tenant (Waxaan raadinayaa guri) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIntentRole('tenant');
                        setSignupStep('form');
                        window.speechSynthesis.cancel();
                      }}
                      className="p-5 border-2 border-slate-200 dark:border-slate-800 hover:border-brand-primary bg-slate-50 dark:bg-slate-950/50 hover:bg-brand-primary-light/5 rounded-xl transition text-left flex items-start gap-4 focus:outline-none shadow-sm"
                    >
                      <span className="text-3xl">🔍</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {lang === 'so' ? 'Waxaan raadinayaa guri' : lang === 'ar' ? 'أبحث عن منزل للإيجار' : 'I am looking for a home'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-500 leading-normal font-medium">
                          {lang === 'so' ? 'Waxaan rabaa inaan kiraysto.' : lang === 'ar' ? 'أرغب في البحث واستئجار guri kumeelgaar ah.' : 'I want to discover listings and pay online.'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DETAILS REGISTRATION FORM (NO TECH ROLE SELECTOR) */}
              {signupStep === 'form' && (
                <form onSubmit={(e) => handleRegister(e, false)} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-2 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {lang === 'so' ? 'Diiwaangelinta Xogtaada' : lang === 'ar' ? 'استكمال البيانات الشخصية' : 'Personal Information Setup'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignupStep('intent')}
                      className="text-[9px] text-slate-500 dark:text-slate-500 hover:text-rose-600 underline font-bold"
                    >
                      {lang === 'so' ? 'Dib u Laabo' : lang === 'ar' ? 'رجوع للخلف' : 'Go Back'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.fullName} *</label>
                    <input
                      type="text"
                      placeholder="Abdi Omar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2 text-slate-400" size={14} />
                      <input
                        type="email"
                        placeholder="name@example.so"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.phone} *</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="252XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800/50 pt-2 mt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.username} *</label>
                      <input
                        type="text"
                        placeholder="abdi"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.password} *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2 rounded shadow transition mt-2 text-xs flex items-center justify-center gap-1"
                  >
                    <span>{t.signup}</span>
                    <ArrowRight size={12} />
                  </button>
                </form>
              )}

            </div>
          )}

          {/* STAFF SIGN UP */}
          {activeMode === 'register_staff' && (
            <form onSubmit={(e) => handleRegister(e, true)} className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-2 mb-1">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Shield className="text-brand-primary" size={14} />
                  {t.registerStaff}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveMode('login')}
                  className="text-[10px] text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 underline font-semibold"
                >
                  {lang === 'so' ? 'Dib u laabo' : lang === 'ar' ? 'رجوع' : 'Back'}
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.fullName} *</label>
                <input
                  type="text"
                  placeholder="Eng. Huda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2 text-slate-400" size={14} />
                  <input
                    type="email"
                    placeholder="huda@goobjoog.so"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.phone} *</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="+25261XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.role} *</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                  >
                    <option value="accountant">{t.accountant}</option>
                    <option value="administrator">{t.admin}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800/50 pt-2 mt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.username} *</label>
                  <input
                    type="text"
                    placeholder="huda_admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">{t.password} *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:ring-1 focus:ring-brand-primary focus:outline-none bg-white dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary-dark hover:bg-slate-900 text-white font-bold py-2 rounded shadow transition mt-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Key size={13} />
                {lang === 'so' ? 'Diiwaangeli Hawl-wadeenka' : lang === 'ar' ? 'تسجيل الموظف الجديد' : 'Register Staff Member'}
              </button>
            </form>
          )}

        </div>

        {/* RESTRICTED INTERNAL SIGNUP LINK */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-t border-slate-200 dark:border-slate-800 text-center">
          {activeMode !== 'register_staff' ? (
            <button
              onClick={() => {
                setActiveMode('register_staff');
                window.speechSynthesis.cancel();
              }}
              className="text-[10px] text-slate-500 dark:text-slate-500 hover:text-brand-primary transition font-semibold"
            >
              🔒 {lang === 'so' ? 'Albaabka Hawl-wadeenada (Admins)' : lang === 'ar' ? 'بوابة المدراء والمشرفين الخاصة' : 'Administrative Staff Portal Sign-Up'}
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveMode('login');
                window.speechSynthesis.cancel();
              }}
              className="text-[10px] text-slate-500 dark:text-slate-500 hover:text-brand-primary transition font-semibold"
            >
              👤 {lang === 'so' ? 'Ku laabo Diiwaanka Macmiilka' : lang === 'ar' ? 'الرجوع لتسجيل المستأجرين' : 'Return to Customer Sign In'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
