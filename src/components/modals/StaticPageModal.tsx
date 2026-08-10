// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Send, MessageSquare, Headphones, CheckCircle2, 
  HelpCircle, Shield, FileText, User, Sparkles, AlertCircle 
} from 'lucide-react';
import { translations } from '../../lib/translations';
import type { UserProfile } from '../../domain/entities';

interface StaticPageModalProps {
  onClose: () => void;
  title: string;
  pageType: 'help' | 'about' | 'privacy' | 'terms';
  lang?: 'en' | 'so' | 'ar';
  currentUser?: UserProfile;
}

interface SupportMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  time: string;
}

export const StaticPageModal: React.FC<StaticPageModalProps> = ({ 
  onClose, 
  title, 
  pageType, 
  lang = 'en',
  currentUser 
}) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  // Live Support Chat State
  const [messages, setMessages] = useState<SupportMessage[]>(() => {
    const saved = localStorage.getItem('goobjoog_support_chat');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'msg_welcome',
        sender: 'admin',
        senderName: 'GoobJoog Support Team',
        text: lang === 'so'
          ? 'Asc! Ku soo dhowow xarunta caawinta tooska ah ee GoobJoog. Sideen maanta kuu caawin karnaa?'
          : lang === 'ar'
          ? 'مرحباً بك في مركز الدعم المباشر لتطبيق GoobJoog! كيف يمكننا مساعدتك اليوم؟'
          : 'Hello! Welcome to GoobJoog Live Customer Support. How can we help you today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('goobjoog_support_chat', JSON.stringify(messages));
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('goobjoog_support_chat') || '[]');
        if (saved && saved.length > 0) {
          setMessages(saved);
        }
      } catch {}
    };
    window.addEventListener('goobjoog_chat_sync', handleSync);
    return () => window.removeEventListener('goobjoog_chat_sync', handleSync);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg: SupportMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      senderName: currentUser?.fullName || (lang === 'so' ? 'Macaamiil' : 'User'),
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    setIsSending(true);

    // Save ticket in Admin Support Storage
    try {
      const tickets = JSON.parse(localStorage.getItem('goobjoog_support_tickets') || '[]');
      tickets.unshift({
        id: `ticket_${Date.now()}`,
        userName: currentUser?.fullName || 'Customer',
        userPhone: currentUser?.phone || 'N/A',
        userId: currentUser?.id || 'guest',
        message: userMsg.text,
        time: userMsg.time,
        status: 'open'
      });
      localStorage.setItem('goobjoog_support_tickets', JSON.stringify(tickets));
      window.dispatchEvent(new Event('goobjoog_chat_sync'));
    } catch (e) {}

    // Simulated instant agent reply
    setTimeout(() => {
      setIsSending(false);
      const replyMsg: SupportMessage = {
        id: `msg_reply_${Date.now()}`,
        sender: 'admin',
        senderName: 'GoobJoog Support Agent',
        text: lang === 'so'
          ? 'Mahadsanid fariintaada! Kooxda taageerada GoobJoog ayaa hadda dib u eegaysa codsigaaga, isla markaana xallin doonta.'
          : lang === 'ar'
          ? 'شكراً لتواصلك! يقوم فريق الدعم بمراجعة طلبك وسيتم الرد عليك في أقرب وقت.'
          : 'Thank you for reaching out! Our GoobJoog support team has received your ticket and is assisting you.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1200);
  };

  const renderContent = () => {
    switch (pageType) {
      case 'help':
        return (
          <div className="flex flex-col h-full gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
            
            {/* LIVE SUPPORT HERO BANNER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-3xl text-white shadow-md flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Headphones size={20} className="text-blue-200" />
                  <h3 className="text-sm font-black tracking-wide">
                    {lang === 'so' ? 'Caawinta Tooska ah (Live Support Chat)' : 'Real-Time Customer Support'}
                  </h3>
                </div>
                <p className="text-xs text-blue-100/90 leading-relaxed">
                  {lang === 'so' ? 'La hadal kooxdayada taageerada haddii aad wax su’aalo ah ka qabto ballamaha, guryaha, ama diiwaangelinta.' :
                   'Chat with our support specialists for assistance with house tours, listings, or account verification.'}
                </p>
              </div>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            {/* REAL-TIME SUPPORT CHAT CONSOLE */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between min-h-[360px] shadow-sm">
              <div className="overflow-y-auto space-y-3 pr-1 max-h-[380px]">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">{m.senderName} • {m.time}</span>
                      <div className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser 
                          ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-md' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                {isSending && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 italic">
                    <span className="animate-pulse">● ● ●</span>
                    <span>{lang === 'so' ? 'Kooxda ayaa qoraysa...' : 'Support typing...'}</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* MESSAGE INPUT BAR */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'so' ? 'Qor fariintaada ama dhibaatada aad qabto...' : lang === 'ar' ? 'اكتب رسالتك أو استفسارك هنا...' : 'Type your question or issue...'}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center gap-1 active:scale-95"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">{lang === 'so' ? 'Dir' : 'Send'}</span>
                </button>
              </form>
            </div>

            {/* FREQUENTLY ASKED QUESTIONS */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t.faqTitle}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {lang === 'so' ? 'Sideen ballan booqasho guri u qabsan karaa?' : 'How do I book a house viewing tour?'}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {lang === 'so' ? 'Dooro guriga aad xiisaynayso, guji "📅 Qabso Ballan Booqasho", dooro taariikhda iyo nooca (In-Person ama Live Video).' :
                     'Select any property, tap "📅 Book Viewing Tour", and choose your preferred date and visit type.'}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {lang === 'so' ? 'Sideen guri ugu diiwaangelin karaa Mulkiile ahaan?' : 'How do I list my property as a Landlord?'}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {lang === 'so' ? 'Guji batoonka "Codso In Laguu Dalaco Mulkiile" ee bogga hore ama tag Dashboard-ka Mulkiilaha si aad sawirada iyo GPS-ka u geliso.' :
                     'Request Landlord upgrade or navigate to your Landlord Workspace to register properties with GPS coordinates.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center max-w-lg mx-auto" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl text-white text-3xl font-black mb-2">
              🏠
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">GoobJoog</h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full font-bold">
              Somali Housing & Property Viewing Network
            </span>
            
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-3 pt-2">
              <p>
                {lang === 'so'
                  ? 'GoobJoog waa nidaamka ugu horreeya ee kireynta guryaha iyo qabsashada ballamaha booqashada tooska ah ee Soomaaliya. Waxaan isku xirnaa kireystayaasha, mulkiilayaasha guryaha, iyo maamulka magaalooyinka Baydhabo, Muqdisho, Hargeysa, Kismaayo, Garoowe, iyo Boosaaso.'
                  : lang === 'ar'
                  ? 'منصة GoobJoog هي المنصة الرائدة في الصومال لاستئجار المنازل وحجز مواعيد معاينة العقارات حضورياً أو عبر الفيديو المباشر عبر جميع المدن الصومالية.'
                  : 'GoobJoog is Somalia’s leading property rental and viewing tour platform connecting tenants and verified landlords with GPS location intelligence across Baidoa, Mogadishu, Hargeisa, and Somali cities.'}
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">✨ {lang === 'so' ? 'Astaamaha Muhiimka ah' : 'Core Features'}:</span>
                <p>✓ {lang === 'so' ? 'Ballamaha booqashada guryaha (House Tours)' : 'House viewing tours & calendar bookings'}</p>
                <p>✓ {lang === 'so' ? 'Ogaanshaha goobta dhabta ah ee GPS-ka' : 'GPS location intelligence & city filtering'}</p>
                <p>✓ {lang === 'so' ? 'Amniga furaha farta (Biometric Protection)' : 'Biometric fingerprint app lock security'}</p>
              </div>
              <p className="font-bold text-blue-600">Somalia 🇸🇴</p>
              <p>&copy; {new Date().getFullYear()} GoobJoog Technologies. All rights reserved.</p>
            </div>
          </div>
        );

      case 'privacy':
      case 'terms':
        return (
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex flex-col gap-4 max-w-2xl mx-auto" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <span className="font-black text-sm text-blue-700 dark:text-blue-300 block mb-0.5">
                {pageType === 'privacy' ? 'Ilaalinta Xogta & Xasaanadda (Privacy Policy)' : 'Shuruudaha Adeegga (Terms of Service)'}
              </span>
              <span className="text-[11px] text-slate-500">
                {lang === 'so' ? 'Taariikhda dib u eegista: August 2026' : 'Last revised: August 2026'}
              </span>
            </div>

            <p>
              {lang === 'so' ? 'GoobJoog waxay si buuxda u dhowreysaa xogta shakhsi ahaaneed ee isticmaaleyaasha, mulkiilayaasha, iyo kireystayaasha iyadoo la raacayo shuruucda ilaalinta xogta ee dalka.' :
               'GoobJoog is committed to safeguarding the privacy, identity, and security of all tenants, landlords, and platform users in accordance with applicable data protection guidelines.'}
            </p>

            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">
              {lang === 'so' ? '1. Xogta Goobta GPS-ka' : '1. GPS Location Data & Privacy'}
            </h4>
            <p>
              {lang === 'so' ? 'Goobtaada GPS-ka waxaa loo isticmaalaa keliya in lagu tuso guryaha ku yaalla magaaladaada aad joogto (sida Baydhabo ama Muqdisho). Xogtaada meesha aad joogto lama wadaago cid saddexaad.' :
               'Your device GPS coordinates are strictly utilized on-device to filter and show rental properties located within your current city (e.g. Baidoa or Mogadishu).'}
            </p>

            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">
              {lang === 'so' ? '2. Ballamaha Booqashada Guryaha (House Tours)' : '2. House Viewing Tours Etiquette'}
            </h4>
            <p>
              {lang === 'so' ? 'Kireystayaasha qabsanaya ballan booqasho waa inay ilaaliyaan waqtiga ballanta. Mulkiiluhuna waa inuu guriga ku diyaariyaa xilliga ballanta la xaqiijiyey.' :
               'Tenants booking viewing tours agree to adhere to confirmed schedule slots. Landlords agree to ensure verified property access during confirmed appointments.'}
            </p>

            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">
              {lang === 'so' ? '3. Amniga Qufida Farta (Biometric Security)' : '3. Biometric Security & App Lock'}
            </h4>
            <p>
              {lang === 'so' ? 'Aqoonsiga farta (Biometric) waxaa lagu xaqiijiyaa qalabka taleefankaaga hoostiisa (Hardware Enclave). Furayaasha farta marna lama soo geliyaan server-ka.' :
               'Biometric fingerprint and face authentication are processed securely within your device hardware enclave and are never transmitted to external servers.'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-fadeIn" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* HEADER */}
      <div className="flex items-center gap-3 pt-12 sm:pt-4 pb-3.5 px-4 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
        <button 
          onClick={onClose} 
          className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft size={19} className={isArabic ? 'rotate-180' : ''} />
        </button>
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 pb-20">
        {renderContent()}
      </div>
    </div>
  );
};
