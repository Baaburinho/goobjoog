import React from 'react';
import { SettingsPage } from '../../pages/SettingsPage';
import type { UserProfile } from '../../domain/entities';

interface SettingsModalProps {
  onClose: () => void;
  currentUser: UserProfile;
  lang: 'en' | 'so' | 'ar';
  activeLayout?: 'tenant' | 'homeowner' | 'administrator' | 'financial_ledger';
  setActiveLayout?: (layout: 'tenant' | 'homeowner' | 'administrator' | 'financial_ledger') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, 
  currentUser, 
  lang,
  activeLayout,
  setActiveLayout 
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col animate-fadeIn overflow-y-auto">
      <SettingsPage
        currentUser={currentUser}
        onLogout={onClose}
        lang={lang}
        setLang={() => {}}
        onClose={onClose}
        activeLayout={activeLayout}
        setActiveLayout={setActiveLayout}
      />
    </div>
  );
};
