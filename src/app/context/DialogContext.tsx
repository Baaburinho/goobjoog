import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogConfig {
  title: string;
  content: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface DialogContextType {
  showDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);

  const showDialog = useCallback((newConfig: DialogConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setConfig(null), 300); // Wait for animation
  }, []);

  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}
      
      {isOpen && config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeDialog} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-in">
            <button 
              onClick={closeDialog}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 font-sans pr-8">
              {config.title}
            </h3>
            
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {config.content}
            </div>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={closeDialog}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {config.cancelText || 'Cancel'}
              </button>
              {config.onConfirm && (
                <button 
                  onClick={() => {
                    config.onConfirm!();
                    closeDialog();
                  }}
                  className={`flex-1 text-white font-bold py-3 rounded-xl transition ${
                    config.isDestructive 
                      ? 'bg-rose-500 hover:bg-rose-600' 
                      : 'bg-brand-primary hover:bg-brand-primary-dark'
                  }`}
                >
                  {config.confirmText || 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) throw new Error('useDialog must be used within a DialogProvider');
  return context;
};
