import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export const SessionExpiredPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mb-6">
        <Clock size={40} className="text-amber-500" />
      </div>
      <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Session Expired</h1>
      <p className="text-slate-500 max-w-sm mb-8 text-sm">For your security, your session has timed out due to inactivity. Please log in again.</p>
      <Link to="/login" className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-primary-dark transition active:scale-95">
        Log In Again
      </Link>
    </div>
  );
};
