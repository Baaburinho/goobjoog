import React, { useState } from 'react';
import { ArrowLeft, Bell, CheckCircle2, Trash2 } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
  lang: 'en' | 'so' | 'ar';
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose, lang }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Payment Approved', message: 'Your monthly rent payment of $350 has been approved.', time: '10 mins ago', read: false, type: 'payment' },
    { id: 2, title: 'New Property Available', message: 'A new 3-bedroom villa in Hodan is now available.', time: '2 hours ago', read: false, type: 'house' },
    { id: 3, title: 'Application Accepted', message: 'Your application for the Hodan apartment was accepted!', time: '1 day ago', read: true, type: 'app' },
    { id: 4, title: 'Owner Replied', message: 'The landlord replied to your maintenance request.', time: '2 days ago', read: true, type: 'msg' },
    { id: 5, title: 'Payment Due', message: 'Your next rent payment is due in 3 days.', time: '3 days ago', read: true, type: 'payment' },
  ]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  
  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col animate-fadeIn">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bell size={18} className="text-brand-primary" />
            {lang === 'so' ? 'Ogeysiisyada' : lang === 'ar' ? 'الإشعارات' : 'Notifications'}
          </h2>
        </div>
        <button onClick={markAllRead} className="text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition px-2 py-1 bg-brand-primary/10 rounded-lg">
          {lang === 'so' ? 'Wada Akhris' : 'Mark all read'}
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Bell size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 dark:text-slate-500 font-medium">No new notifications</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`relative p-4 rounded-xl border flex gap-3 transition ${notif.read ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-brand-primary/5 border-brand-primary/20'}`}>
              <div className="flex-1">
                <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-brand-primary'}`}>{notif.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                <span className="text-[9px] text-slate-400 font-bold mt-2 block">{notif.time}</span>
              </div>
              <button 
                onClick={() => deleteNotification(notif.id)}
                className="self-center p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition"
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
