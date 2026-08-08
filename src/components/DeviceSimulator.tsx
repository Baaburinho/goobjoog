import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface DeviceSimulatorProps {
  children: ReactNode;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 overflow-hidden relative font-sans">
      {/* Background aesthetic decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Device Simulator Frame */}
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-[14px] ring-slate-800 z-10 flex flex-col overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
        style={{ width: '414px', height: '896px', maxHeight: '95vh' }}
      >
        {/* Hardware Notch / Dynamic Island */}
        <div className="absolute top-0 inset-x-0 h-7 z-50 flex justify-center pointer-events-none">
          <div className="w-36 h-6 bg-slate-800 rounded-b-2xl relative">
            <div className="absolute right-4 top-1.5 w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
              <div className="w-1 h-1 bg-blue-900/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Application Content */}
        <div className="w-full h-full overflow-hidden flex flex-col relative bg-slate-50 dark:bg-slate-950/50">
          {children}
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-50">
          <div className="w-32 h-1 bg-slate-800/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
