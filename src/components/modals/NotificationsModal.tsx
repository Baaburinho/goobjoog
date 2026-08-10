import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Trash2, CheckCircle2, Calendar, Home, FileText } from 'lucide-react';
import { translations } from '../../lib/translations';

interface NotificationsModalProps {
  onClose: () => void;
  lang: 'en' | 'so' | 'ar';
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose, lang }) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const [notifications, setNotifications] = useState(() => {
    let custom: any[] = [];
    try {
      custom = JSON.parse(localStorage.getItem('goobjoog_inapp_notifications') || '[]');
    } catch {}

    const defaults = lang === 'so' ? [
      { id: 'def_1', title: '📅 Ballantii Booqashada Waa La Xaqiijiyey', message: 'Mulkiilaha guriga Isha Baydhabo wuxuu xaqiijiyey ballantaada booqashada guriga.', time: '5 daqiiqo ka hor', read: false, type: 'tour' },
      { id: 'def_2', title: '🏡 Guri Cusub oo Baydhabo ah', message: 'Villa casri ah oo 3 qol ah ayaa hadda lagu daray magaaladaada.', time: '1 saac ka hor', read: false, type: 'listing' },
      { id: 'def_3', title: '📄 Codsigaagii Kireysiga Waa La Aqbalay', message: 'Mulkiilaha wuxuu si guul leh u oggolaaday codsigaaga kireysiga!', time: '1 maalin ka hor', read: true, type: 'application' }
    ] : [
      { id: 'def_1', title: '📅 Viewing Tour Confirmed', message: 'The landlord confirmed your house viewing tour appointment.', time: '5 mins ago', read: false, type: 'tour' },
      { id: 'def_2', title: '🏡 New Property in Your City', message: 'A modern 3-bedroom villa was just listed in your city.', time: '1 hour ago', read: false, type: 'listing' },
      { id: 'def_3', title: '📄 Application Approved', message: 'Your rental application for the property was approved!', time: '1 day ago', read: true, type: 'application' }
    ];

    return [...custom, ...defaults];
  });

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      localStorage.setItem('goobjoog_inapp_notifications', JSON.stringify([]));
    } catch {}
  };
  
  const deleteNotification = (id: any) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col animate-fadeIn" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* HEADER */}
      <div className="flex items-center justify-between pt-12 sm:pt-4 pb-3.5 px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft size={19} className={isArabic ? 'rotate-180' : ''} />
          </button>
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <span>{t.notificationsModalTitle}</span>
          </h2>
        </div>
        <button onClick={markAllRead} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition px-3 py-1.5 bg-blue-50 dark:bg-blue-950 rounded-xl active:scale-95">
          {t.markAllReadBtn}
        </button>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full pb-20">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-slate-400 space-y-2">
            <span className="text-4xl block">🔔</span>
            <p className="text-sm font-bold">
              {lang === 'so' ? 'Ma jiraan ogeysiisyo cusub.' : lang === 'ar' ? 'لا توجد إشعارات جديدة.' : 'No new notifications.'}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 shadow-sm ${
                n.read 
                  ? 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 opacity-75' 
                  : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  n.type === 'tour' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' :
                  n.type === 'application' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                  'bg-blue-100 dark:bg-blue-950 text-blue-600'
                }`}>
                  {n.type === 'tour' ? <Calendar size={18} /> : n.type === 'application' ? <FileText size={18} /> : <Home size={18} />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block font-mono">{n.time}</span>
                </div>
              </div>

              <button 
                onClick={() => deleteNotification(n.id)}
                className="text-slate-300 hover:text-rose-500 p-1.5 transition rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
                aria-label="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
