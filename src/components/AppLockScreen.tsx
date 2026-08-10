import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, ShieldCheck, ArrowRight, User, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../domain/entities';
import { authenticateWithFingerprint } from '../shared/utils/biometrics';
import { translations } from '../lib/translations';

interface AppLockScreenProps {
  savedUser: UserProfile;
  onUnlockSuccess: (user: UserProfile) => void;
  onUsePassword: () => void;
  onLogout: () => void;
  lang: 'en' | 'so' | 'ar';
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  savedUser,
  onUnlockSuccess,
  onUsePassword,
  onLogout,
  lang
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successAnim, setSuccessAnim] = useState(false);

  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  // Trigger biometric prompt automatically on screen load
  useEffect(() => {
    let timer = setTimeout(() => {
      handleBiometricUnlock();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleBiometricUnlock = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const success = await authenticateWithFingerprint(savedUser.username || savedUser.fullName);
      if (success) {
        setSuccessAnim(true);
        setTimeout(() => {
          onUnlockSuccess(savedUser);
        }, 500);
      } else {
        setAuthError(
          lang === 'so'
            ? 'Aqoonsiga farta waa la diiday ama waa la joojiyay.'
            : lang === 'ar'
            ? 'فشل التحقق من البصمة أو تم الإلغاء.'
            : 'Biometric verification cancelled or failed.'
        );
      }
    } catch (err) {
      setAuthError(
        lang === 'so'
          ? 'Khalad ayaa dhacay intii lagu jiray baaritaanka farta.'
          : lang === 'ar'
          ? 'حدث خطأ أثناء فحص البصمة.'
          : 'An error occurred during biometric scan.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 text-white flex flex-col items-center justify-between p-6 select-none animate-fadeIn"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Top Header */}
      <div className="w-full max-w-sm flex items-center justify-between pt-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/90 text-white flex items-center justify-center font-black text-lg shadow-lg overflow-hidden p-0.5 border border-blue-400/40">
            <img src="/goobjoog_logo.png" alt="GoobJoog Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">GoobJoog</span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition active:scale-95"
          title={lang === 'so' ? 'Ka bax' : lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
        >
          <LogOut size={14} />
          <span>{lang === 'so' ? 'Ka bax' : lang === 'ar' ? 'خروج' : 'Log Out'}</span>
        </button>
      </div>

      {/* Center Biometric Auth Content */}
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6 my-auto">
        {/* User Profile Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500/50 p-1 shadow-2xl flex items-center justify-center">
            {savedUser.avatarUrl ? (
              <img
                src={savedUser.avatarUrl}
                alt={savedUser.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                {savedUser.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
            <Lock size={12} className="text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black text-white">{savedUser.fullName}</h2>
          <span className="text-xs text-blue-300 font-mono">@{savedUser.username}</span>
        </div>

        {/* Lock Screen Title & Explanations */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-200">
            {lang === 'so'
              ? 'GoobJoog waa la qufay'
              : lang === 'ar'
              ? 'تطبيق GoobJoog مقفل'
              : 'GoobJoog is Locked'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs">
            {lang === 'so'
              ? 'Ku taabo fartaada ama dareemaha wejiga si aad toos ugu gasho akoonkaaga'
              : lang === 'ar'
              ? 'استخدم بصمة الإصبع أو الوجه لفتح التطبيق والانتقال فوراً للوحة التحكم'
              : 'Touch the biometric fingerprint sensor to unlock and open your dashboard'}
          </p>
        </div>

        {/* Interactive Biometric Sensor Touch Button */}
        <div className="relative py-2">
          <button
            onClick={handleBiometricUnlock}
            disabled={isAuthenticating}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 ${
              successAnim
                ? 'bg-emerald-600 scale-110'
                : isAuthenticating
                ? 'bg-blue-700 animate-pulse'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
            }`}
            aria-label="Unlock with Fingerprint"
          >
            {/* Pulsing Ripple Rings */}
            {!successAnim && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-40"></span>
                <span className="absolute -inset-2 rounded-full border border-blue-500/30 animate-pulse"></span>
              </>
            )}

            {successAnim ? (
              <CheckCircle2 size={44} className="text-white animate-scaleUp" />
            ) : (
              <Fingerprint size={48} className="text-white drop-shadow-md" />
            )}
          </button>
        </div>

        {/* Status / Error feedback */}
        {authError && (
          <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 px-3 py-1.5 rounded-xl animate-shake">
            {authError}
          </div>
        )}

        <button
          onClick={handleBiometricUnlock}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 transition"
        >
          {lang === 'so'
            ? '👉 Taabo si aad farta ugu furto'
            : lang === 'ar'
            ? '👉 اضغط للمسح بالبصمة'
            : '👉 Tap to scan biometric'}
        </button>
      </div>

      {/* Bottom Switch to Password option */}
      <div className="w-full max-w-sm pb-4 space-y-2">
        <button
          onClick={onUsePassword}
          className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
        >
          <KeyRound size={16} className="text-blue-400" />
          <span>
            {lang === 'so'
              ? 'Geli Furaha Sirta ah (Password)'
              : lang === 'ar'
              ? 'تسجيل الدخول بكلمة المرور'
              : 'Enter Password instead'}
          </span>
        </button>

        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>
            {lang === 'so'
              ? 'Amniga Biometric-ka waxaa lagu xaqiijiyay nidaamka taleefankaaga'
              : lang === 'ar'
              ? 'الأمان البيومتري مشفر ومدار بواسطة نظام جهازك'
              : 'Biometric security powered by on-device hardware enclave'}
          </span>
        </div>
      </div>
    </div>
  );
};
