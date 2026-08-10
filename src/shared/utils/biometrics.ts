import { Capacitor } from '@capacitor/core';
import { BiometricAuth, AndroidBiometryStrength } from '@aparajita/capacitor-biometric-auth';

export interface BiometricStatus {
  isSupported: boolean;
  hasEnrolledFingerprint: boolean;
  reason?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  errorCode?: 'cancelled' | 'not_enrolled' | 'not_available' | 'passcode_not_set' | 'lockout' | 'system_error';
  errorMessage?: string;
}

interface BiometricLockUser {
  id?: string;
  username?: string;
  fullName?: string;
}

const BIOMETRIC_LOCK_KEY_PREFIX = 'goobjoog_biometric_lock_enabled';

const getBiometricUserKey = (user: BiometricLockUser): string => {
  const rawKey = user.id || user.username || user.fullName || 'unknown_user';
  return encodeURIComponent(rawKey.trim().toLowerCase());
};

export const getBiometricLockPreferenceKey = (user: BiometricLockUser): string => {
  return `${BIOMETRIC_LOCK_KEY_PREFIX}:${getBiometricUserKey(user)}`;
};

export const isBiometricLockEnabledForUser = (user: BiometricLockUser | null | undefined): boolean => {
  if (!user || typeof localStorage === 'undefined') return false;
  return localStorage.getItem(getBiometricLockPreferenceKey(user)) === 'true';
};

export const setBiometricLockEnabledForUser = (user: BiometricLockUser, enabled: boolean): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(getBiometricLockPreferenceKey(user), enabled ? 'true' : 'false');
};

const isLocalDevelopmentHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
};

const canUseDevelopmentFallback = (): boolean => {
  return !Capacitor.isNativePlatform() && (import.meta.env.DEV || isLocalDevelopmentHost());
};

export const checkBiometricStatus = async (): Promise<BiometricStatus> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await BiometricAuth.checkBiometry();
      return {
        isSupported: info.biometryTypes.length > 0,
        hasEnrolledFingerprint: info.isAvailable,
        reason: info.reason,
      };
    } catch (e: any) {
      return {
        isSupported: false,
        hasEnrolledFingerprint: false,
        reason: e?.message || 'Biometric check failed.',
      };
    }
  }

  if (typeof window !== 'undefined' && window.PublicKeyCredential) {
    try {
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return {
        isSupported: isAvailable || canUseDevelopmentFallback(),
        hasEnrolledFingerprint: isAvailable || canUseDevelopmentFallback(),
      };
    } catch (e) {
      console.warn('Biometric availability check error:', e);
    }
  }

  const fallbackEnabled = canUseDevelopmentFallback();
  return {
    isSupported: fallbackEnabled,
    hasEnrolledFingerprint: fallbackEnabled,
    reason: fallbackEnabled ? undefined : 'No biometric authenticator is available on this browser.',
  };
};

export const checkBiometricHardwareSupport = async (): Promise<boolean> => {
  const status = await checkBiometricStatus();
  return status.hasEnrolledFingerprint;
};

export const authenticateWithBiometrics = async (username: string): Promise<BiometricAuthResult> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await BiometricAuth.checkBiometry();
      if (!info.isAvailable) {
        return {
          success: false,
          errorCode: 'not_available',
          errorMessage: info.reason || 'Biometrics not available or not enrolled.'
        };
      }

      await BiometricAuth.authenticate({
        reason: `Unlock GoobJoog as @${username}`,
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use Passcode',
        androidTitle: 'GoobJoog biometric unlock',
        androidSubtitle: `Confirm @${username}`,
        androidConfirmationRequired: false,
        androidBiometryStrength: AndroidBiometryStrength.weak,
      });
      return { success: true };
    } catch (err: any) {
      const errMsg = (err?.message || '').toLowerCase();
      let errorCode: BiometricAuthResult['errorCode'] = 'system_error';
      if (errMsg.includes('cancel') || errMsg.includes('user_cancel') || errMsg.includes('user cancelled')) {
        errorCode = 'cancelled';
      } else if (errMsg.includes('lockout')) {
        errorCode = 'lockout';
      } else if (errMsg.includes('not enrolled')) {
        errorCode = 'not_enrolled';
      }
      return {
        success: false,
        errorCode,
        errorMessage: err?.message || 'Biometric authentication failed.'
      };
    }
  }

  const isHardwareAvailable = await checkBiometricHardwareSupport();

  if (isHardwareAvailable && window.PublicKeyCredential) {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required',
      };
      const hostname = window.location.hostname;
      if (hostname && !isLocalDevelopmentHost() && !/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
        publicKey.rpId = hostname;
      }

      const credential = await navigator.credentials.get({
        publicKey,
      });

      if (credential) {
        return { success: true };
      }
      return { success: false, errorCode: 'cancelled' };
    } catch (err: any) {
      const errMsg = (err?.message || '').toLowerCase();
      let errorCode: BiometricAuthResult['errorCode'] = 'system_error';
      if (errMsg.includes('abort') || errMsg.includes('cancel') || errMsg.includes('notallowederror')) {
        errorCode = 'cancelled';
      }
      return { success: false, errorCode, errorMessage: err?.message };
    }
  }

  if (!canUseDevelopmentFallback()) {
    return {
      success: false,
      errorCode: 'not_available',
      errorMessage: 'WebAuthn is not supported in this environment.'
    };
  }

  return new Promise((resolve) => {
    const confirmMsg = `[Biometric Fingerprint Sensor]\n\nScan your registered fingerprint sensor for user @${username}?`;
    const success = window.confirm(confirmMsg);
    if (success) {
      resolve({ success: true });
    } else {
      resolve({ success: false, errorCode: 'cancelled', errorMessage: 'Scan cancelled by user.' });
    }
  });
};

export const authenticateWithFingerprint = async (username: string): Promise<boolean> => {
  const res = await authenticateWithBiometrics(username);
  return res.success;
};
