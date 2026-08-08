import React, { useState } from 'react';
import { ArrowLeft, Bell, Trash2 } from 'lucide-react';
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
        { id: 1, title: 'Lacag Bixintii Waa La Oggolaaday', message: 'Lacagtii kirada ee bishan $350 si toos ah ayaa loo xaqiijiyey.', time: '10 daqiiqo ka hor', read: false },
        { id: 2, title: 'Guri Cusub oo Diyaar ah', message: 'Guri 3 qol ah oo ku yaala Hodan ayaa hadda la soo galiyey.', time: '2 saac ka hor', read: false },
        { id: 3, title: 'Codsigaagii Waa La Aqbalay', message: 'Mulkiilaha guriga Hodan wuxuu aqbalay codsigaaga kireysiga!', time: '1 maalin ka hor', read: true }
      ];
    } else if (lang === 'ar') {
      return [
        { id: 1, title: 'تمت الموافقة على سداد الإيجار', message: 'تم استلام وتأكيد سداد الإيجار الشهري بمبلغ 350$ بنجاح.', time: 'منذ ١٠ دقائق', read: false },
        { id: 2, title: 'عقار جديد متاح للإيجار', message: 'تم إدراج فيلا راقية ٣ غرف نوم في حي هودان بمقديشو.', time: 'منذ ساعتين', read: false },
        { id: 3, title: 'تم قبول طلب الاستئجار', message: 'وافق مالك العقار على طلب استئجار الشقة السكنية بنجاح!', time: 'منذ يوم واحد', read: true }
      ];
    } else {
      return [
        { id: 1, title: 'Payment Approved', message: 'Your monthly rent payment of $350 has been approved.', time: '10 mins ago', read: false },
        { id: 2, title: 'New Property Available', message: 'A new 3-bedroom villa in Hodan is now available.', time: '2 hours ago', read: false },
        { id: 3, title: 'Application Accepted', message: 'Your application for the Hodan apartment was accepted!', time: '1 day ago', read: true }
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
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
            <ArrowLeft size={20} className={isArabic ? 'rotate-180' : ''} />
          </button>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <span>{t.notificationsModalTitle}</span>
          </h2>
        </div>
        <button onClick={markAllRead} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition px-3 py-1.5 bg-blue-50 dark:bg-blue-950 rounded-xl">
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
