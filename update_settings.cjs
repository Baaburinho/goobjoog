const fs = require('fs');
let c = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');

c = c.replace(/import \{ checkBiometricHardwareSupport \} from '\.\.\/shared\/utils\/biometrics';/, 
`import { checkBiometricHardwareSupport } from '../shared/utils/biometrics';
import { useBiometric, LockTimeout } from '../app/context/BiometricContext';`);

c = c.replace(/const \[fingerprintEnabled, setFingerprintEnabled\] = useState\(true\);\s*const \[hasBiometricHardware, setHasBiometricHardware\] = useState\(true\);\s*const \[faceEnabled, setFaceEnabled\] = useState\(false\);/, 
`const { 
    isBiometricEnabled, 
    setBiometricEnabled, 
    lockTimeout, 
    setLockTimeout, 
    usePasswordFallback, 
    setUsePasswordFallback 
  } = useBiometric();

  const [hasBiometricHardware, setHasBiometricHardware] = useState(true);`);

c = c.replace(/\{hasBiometricHardware \? \([\s\S]*?\) : \(/, 
`{hasBiometricHardware ? (
                    <div className="space-y-3 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                            <Fingerprint size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                              {lang === 'so' ? 'Qfulida App-ka (Biometric App Lock)' : 'Biometric App Lock'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-500">
                              {lang === 'so' ? 'Kaga ilaali app-ka farta ama wajiga' : 'Protect application access with biometrics'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBiometricEnabled(!isBiometricEnabled)}
                          className={\`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 \${\n                            isBiometricEnabled ? 'bg-emerald-600' : 'bg-slate-300'\n                          }\`}
                        >
                          <div className={\`w-4 h-4 rounded-full bg-white dark:bg-slate-900 transition-transform \${\n                            isBiometricEnabled ? 'translate-x-5' : 'translate-x-0'\n                          }\`} />
                        </button>
                      </div>

                      {isBiometricEnabled && (
                        <div className="pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                              {lang === 'so' ? 'Waqtiga La Qfulayo (Authentication Timeout)' : 'Authentication Timeout'}
                            </label>
                            <select
                              value={lockTimeout}
                              onChange={(e) => setLockTimeout(e.target.value as LockTimeout)}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none"
                            >
                              <option value="0">{lang === 'so' ? 'Isla markiiba' : 'Immediately'}</option>
                              <option value="60000">{lang === 'so' ? 'Ka dib 1 Daqiiqo' : 'After 1 Minute'}</option>
                              <option value="300000">{lang === 'so' ? 'Ka dib 5 Daqiiqo (Lagu taliyay)' : 'After 5 Minutes (Recommended)'}</option>
                              <option value="900000">{lang === 'so' ? 'Ka dib 15 Daqiiqo' : 'After 15 Minutes'}</option>
                              <option value="1800000">{lang === 'so' ? 'Ka dib 30 Daqiiqo' : 'After 30 Minutes'}</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                                {lang === 'so' ? 'U isticmaal Device Password Backup ahaan' : 'Use Device Password as Backup'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setUsePasswordFallback(!usePasswordFallback)}
                              className={\`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 \${\n                                usePasswordFallback ? 'bg-blue-600' : 'bg-slate-300'\n                              }\`}
                            >
                              <div className={\`w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 transition-transform \${\n                                usePasswordFallback ? 'translate-x-4' : 'translate-x-0'\n                              }\`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (`);

fs.writeFileSync('src/pages/SettingsPage.tsx', c);
