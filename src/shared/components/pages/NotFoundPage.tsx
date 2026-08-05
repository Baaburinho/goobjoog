import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl font-black text-brand-primary">404</span>
      </div>
      <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Page Not Found</h1>
      <p className="text-slate-500 max-w-sm mb-8 text-sm">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-primary-dark transition active:scale-95">
        Return Home
      </Link>
    </div>
  );
};
