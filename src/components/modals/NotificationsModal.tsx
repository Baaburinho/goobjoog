import React, { useState } from 'react';
import { ArrowLeft, Bell, Trash2, CheckCircle2, Calendar, Home } from 'lucide-react';
import { translations } from '../../lib/translations';

interface NotificationsModalProps {
  onClose: () => void;
  lang: 'en' | 'so' | 'ar';
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose, lang }) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const [notifications, setNotifications] = useState(() => {
    if (lang === 'so') {
      return [
        { id: 1, title: '📅 Ballantii Booqashada Waa La Xaqiijiyey', message: 'Mulkiilaha guriga Isha Baydhabo wuxuu xaqiijiyey ballantaada booqashada guriga.', time: '5 daqiiqo ka hor', read: false, type: 'tour' },
        { id: 2, title: '🏡 Guri Cusub oo Baydhabo ah', message: 'Villa casri ah oo 3 qol ah ayaa hadda lagu daray magaaladaada.', time: '1 saac ka hor', read: false, type: 'listing' },
        { id: 3, title: '📄 Codsigaagii Kireysiga Waa La Aqbalay', message: 'Mulkiilaha wuxuu si guul leh u oggolaaday codsigaaga kireysiga!', time: '1 maalin ka hor', read: true, type: 'application' }
      ];
    } else if (lang === 'ar') {
      return [
        { id: 1, title: '📅 تم تأكيد موعد المعاينة', message: 'قام مالك العقار في بيدوا بتأكيد موعد زيارة ومعاينة المنزل بنجاح.', time: 'منذ ٥ دقائق', read: false, type: 'tour' },
        { id: 2, title: '🏡 عقار جديد متاح في مدينتك', message: 'تم إدراج فيلا راقية ٣ غرف نوم في منطقتك.', time: 'منذ ساعة', read: false, type: 'listing' },
        { id: 3, title: '📄 تم قبول طلب الاستئجار', message: 'وافق مالك العقار على طلب استئجار العقار بنجاح!', time: 'منذ يوم واحد', read: true, type: 'application' }
      ];
    } else {
      return [
        { id: 1, title: '📅 Viewing Tour Confirmed', message: 'The landlord confirmed your house viewing tour appointment.', time: '5 mins ago', read: false, type: 'tour' },
        { id: 2, title: '🏡 New Property in Your City', message: 'A modern 3-bedroom villa was just listed in your city.', time: '1 hour ago', read: false, type: 'listing' },
        { id: 3, title: '📄 Application Approved', message: 'Your rental application for the property was approved!', time: '1 day ago', read: true, type: 'application' }
      ];
    }
  });

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  
  const deleteNotification = (id: number) => {
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

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Bell size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-xs">{t.noNotificationsYet}</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`relative p-4 rounded-2xl border flex gap-3 transition ${notif.read ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'}`}>
              <div className="flex-1">
                <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-blue-600 dark:text-blue-400'}`}>{notif.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                <span className="text-[9px] text-slate-400 font-bold mt-2 block">{notif.time}</span>
              </div>
              <button 
                onClick={() => deleteNotification(notif.id)}
                className="self-center p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
