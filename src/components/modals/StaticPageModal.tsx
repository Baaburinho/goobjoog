import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface StaticPageModalProps {
  onClose: () => void;
  title: string;
  pageType: 'help' | 'about' | 'privacy' | 'terms';
}

export const StaticPageModal: React.FC<StaticPageModalProps> = ({ onClose, title, pageType }) => {
  const renderContent = () => {
    switch (pageType) {
      case 'help':
        return (
          <div className="flex flex-col gap-6">
            <div className="bg-brand-primary/10 p-4 rounded-xl">
              <h3 className="text-sm font-bold text-brand-primary mb-2">How can we help?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Search our knowledge base or contact our support team.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Frequently Asked Questions</h4>
              <div className="flex flex-col gap-2">
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">How do I pay rent using EVC Plus?</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">Go to the Payments tab, select your pending rent, and choose EVC Plus as the payment method. Enter your PIN when prompted on your phone.</span>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">How do I become a Landlord?</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">Go to your Profile tab and click "Apply to Become Owner". An administrator will verify your details.</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition">Contact Support Team</button>
              <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition">Report a Bug</button>
              <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition">Read User Guide</button>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <div className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <span className="text-white text-3xl font-black tracking-tighter">GJ</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">GoobJoog Rents</h3>
            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-mono">Version 2.4.1 (Build 8932)</span>
            
            <div className="mt-8 text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
              <p className="mb-4">GoobJoog Rents is the leading digital real estate platform in Somalia, connecting tenants and landlords with secure mobile money integration.</p>
              <p className="mb-4">Developed by GoobJoog Tech Team.</p>
              <p>&copy; 2026 GoobJoog Technologies. All rights reserved.</p>
            </div>
            <button className="text-[10px] text-brand-primary font-bold hover:underline mt-4">View Open-Source Licenses</button>
          </div>
        );
      case 'privacy':
      case 'terms':
        return (
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex flex-col gap-4">
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Last updated: August 2026</p>
            <p>This is a placeholder document for the GoobJoog {pageType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}. In a production environment, this would contain the full legal text outlining user rights, data collection policies, and platform responsibilities.</p>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-2">1. Data Collection</h4>
            <p>We collect essential data required to facilitate secure property rentals and verify identities. We do not sell your personal data to third parties.</p>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-2">2. Security</h4>
            <p>We use industry-standard encryption to protect your data. Biometric data is never stored on our servers; it is processed locally on your device's secure enclave.</p>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-2">3. Mobile Payments</h4>
            <p>All mobile money transactions are securely routed through certified telecom APIs (Hormuud EVC Plus, Telesom ZAAD). We do not store your PIN codes.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-fadeIn">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10 bg-white dark:bg-slate-950">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 pb-20">
        {renderContent()}
      </div>
    </div>
  );
};
