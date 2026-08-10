import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound, LogOut, CheckCircle2, User } from 'lucide-react';
import type { UserProfile } from '../domain/entities';
import { authenticateWithBiometrics } from '../shared/utils/biometrics';
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
  const hasAutoPrompted = useRef(false);

  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const handleBiometricUnlock = useCallback(async () => {
    if (isAuthenticating || successAnim) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const result = await authenticateWithBiometrics(savedUser.username || savedUser.fullName);
      if (result.success) {
        setSuccessAnim(true);
        setTimeout(() => {
          onUnlockSuccess(savedUser);
        }, 500);
      } else {
        let msg = lang === 'so' ? 'Aqoonsiga farta waa la diiday ama waa la joojiyay.' : 'Biometric verification failed or cancelled.';
        if (result.errorCode === 'cancelled') {
          msg = lang === 'so' ? 'Waad joojisay scan-ka farta.' : 'Scan cancelled.';
        } else if (result.errorCode === 'lockout') {
          msg = lang === 'so' ? 'Faraha waa la xanibay. Fadlan geli Password-kaaga.' : 'Biometrics temporarily locked out. Use Password.';
        }
        setAuthError(msg);
      }
    } catch (err) {
      setAuthError(
        lang === 'so'
          ? 'Khalad ayaa dhacay intii lagu jiray baaritaanka farta.'
          : 'An error occurred during biometric scan.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, lang, onUnlockSuccess, savedUser, successAnim]);

  // Automatically trigger native prompt on mount
  useEffect(() => {
    if (hasAutoPrompted.current) return;
    hasAutoPrompted.current = true;

    const timer = setTimeout(() => {
      handleBiometricUnlock();
    }, 450);

    return () => clearTimeout(timer);
  }, [handleBiometricUnlock]);

  return (
    <div 
      className="min-h-screen w-full bg-slate-400/30 dark:bg-slate-950 backdrop-blur-md flex flex-col items-center justify-between p-6 select-none animate-fadeIn relative overflow-hidden"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Top Subtle Status Bar */}
      <div className="w-full max-w-sm flex items-center justify-center pt-8">
        <span className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Unlock
        </span>
      </div>

      {/* Floating System-Style Biometric Modal Sheet Card */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[36px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 flex flex-col items-center text-center space-y-6 animate-scaleUp my-auto">
        
        {/* App Emblem Badge */}
        <div className="flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 shadow-lg shadow-blue-500/30 flex items-center justify-center">
            <img 
              src="/goobjoog_logo.png" 
              alt="GoobJoog" 
              className="w-full h-full object-contain filter drop-shadow"
              onError={(e) => {
                // Fallback icon if image doesn't load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-xl">🏠</span>
          </div>
          <span className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-200 mt-1">
            GoobJoog
          </span>
        </div>

        {/* Title & Subtitle matching the specification mockup */}
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'so' ? 'Ku fur GoobJoog fartaada' : lang === 'ar' ? 'افتح تطبيق GoobJoog' : 'Unlock to use GoobJoog'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'so' ? 'Taabo dareemaha scan-ka farta' : lang === 'ar' ? 'المس مستشعر بصمة الإصبع' : 'Touch the fingerprint sensor'}
          </p>
        </div>

        {/* Center Circular Fingerprint Sensor Target Zone */}
        <div className="relative py-3">
          <button
            type="button"
            onClick={handleBiometricUnlock}
            disabled={isAuthenticating || successAnim}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-md ${
              successAnim
                ? 'bg-emerald-600 text-white scale-105'
                : isAuthenticating
                ? 'bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-600 text-blue-600 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-600 hover:text-blue-600'
            }`}
            aria-label="Touch Fingerprint Sensor"
          >
            {/* Ripple wave when scanning */}
            {isAuthenticating && !successAnim && (
              <>
                <span className="absolute -inset-2 rounded-full border border-blue-400 animate-ping opacity-30"></span>
                <span className="absolute -inset-4 rounded-full border border-blue-500/20 animate-pulse"></span>
              </>
            )}

            {successAnim ? (
              <CheckCircle2 size={36} className="text-white animate-scaleUp" />
            ) : (
              <Fingerprint size={38} strokeWidth={1.75} className="transition-transform duration-200" />
            )}
          </button>
        </div>

        {/* Status / Error Toast Notice */}
        {authError && (
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-3.5 py-1.5 rounded-xl animate-shake">
            {authError}
          </div>
        )}

        {/* User Account Capsule */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-[11px] font-mono">
          <User size={12} />
          <span>{savedUser.fullName} (@{savedUser.username})</span>
        </div>

        {/* Bottom Actions Row matching "Use Password" and "Log Out" */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onUsePassword}
            className="text-xs font-black text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline transition active:scale-95 flex items-center gap-1"
          >
            <KeyRound size={13} />
            <span>{lang === 'so' ? 'Geli Password' : 'Use Password'}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition active:scale-95 flex items-center gap-1"
          >
            <LogOut size={13} />
            <span>{lang === 'so' ? 'Ka bax' : 'Log Out'}</span>
          </button>
        </div>

      </div>

      {/* Bottom Hardware Enclave Privacy Notice */}
      <div className="w-full max-w-sm text-center pb-4">
        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>Biometric authentication protected by on-device hardware</span>
        </div>
      </div>

    </div>
  );
};
