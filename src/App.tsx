import React from 'react';
import LegacyApp from './LegacyApp';
import { AuthProvider } from './app/context/AuthContext';
import { ThemeProvider } from './app/context/ThemeContext';
import { LanguageProvider } from './app/context/LanguageContext';
import { ToastProvider } from './app/context/ToastContext';
import { DialogProvider } from './app/context/DialogContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <DialogProvider>
            <AuthProvider>
              <LegacyApp />
            </AuthProvider>
          </DialogProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
