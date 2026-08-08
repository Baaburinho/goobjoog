import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, 
  MapPin, Heart, CheckCircle2, DollarSign, Eye, AlertTriangle, ShieldCheck
} from 'lucide-react';
import type { UserProfile, House, Transaction, Complaint, Application } from '../domain/entities';
import { translations } from '../lib/translations';

interface GoobJoogAIProps {
  currentUser: UserProfile;
  houses: House[];
  applications: Application[];
  transactions: Transaction[];
  complaints: Complaint[];
  favorites: string[];
  lang: 'en' | 'so' | 'ar';
  onViewHouse?: (houseId: string) => void;
  onToggleFavorite?: (houseId: string, e: any) => void;
  onOpenApplyModal?: (house: House) => void;
  onUpgradeToLandlord?: () => void;
  onUpdatePreferences?: (prefs: { city?: string; price?: number; rooms?: number }) => void;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  houses?: House[];
  actions?: { label: string; onClick: () => void }[];
}

export const GoobJoogAI: React.FC<GoobJoogAIProps> = ({
  currentUser,
  houses,
  applications,
  transactions,
  complaints,
  favorites,
  lang,
  onViewHouse,
  onToggleFavorite,
  onOpenApplyModal,
  onUpgradeToLandlord,
  onUpdatePreferences
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const [searchContext, setSearchContext] = useState<{
    city?: string;
    price?: number;
    rooms?: number;
    wifi?: boolean;
    parking?: boolean;
    water?: boolean;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      triggerGreeting();
    }
  }, [isOpen, lang]);

  const triggerGreeting = () => {
    let greeting = "";
    if (lang === 'so') {
      greeting = `Ku soo dhowow Caawiyaha Caqliga Badan ee GoobJoog! 👋\nWaad salaaman tahay ${currentUser.fullName}. Waxaan diyaar u ahay inaan kaa caawiyo raadinta guryaha, kireynta, iyo maaraynta dakhligaaga. Fadlan dooro ama ku qor su'aashaada:`;
    } else if (lang === 'ar') {
      greeting = `مرحباً بك في مساعد جوب جوج الذكي! 👋\nأهلاً بك يا ${currentUser.fullName}. أنا هنا لمساعدتك في العثور على العقارات المناسبة، إدارة الإيجارات، وتتبع الأرباح. يرجى اختيار خيار أو كتابة استفسارك:`;
    } else {
      greeting = `Welcome to GoobJoog AI Assistant! 👋\nHello, ${currentUser.fullName}. I am here to help you search properties, manage applications, and track payments. Please select an action below or type your question:`;
    }
    
    setMessages([
      {
        sender: 'bot',
        text: greeting,
        timestamp: new Date()
      }
    ]);
  };

  const formatNumber = (num: number) => {
    if (lang === 'ar') {
      return new Intl.NumberFormat('ar-SA').format(num);
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  const parseIntent = (message: string): string => {
    const msg = message.toLowerCase();
    
    if (msg.includes('house') || msg.includes('guri') || msg.includes('qol') || msg.includes('rooms') || msg.includes('rent') || msg.includes('kira') || msg.includes('shaqqa') || msg.includes('منزل') || msg.includes('غرفة') || msg.includes('إيجار') || msg.includes('عقار')) {
      if (msg.includes('add') || msg.includes('register') || msg.includes('upload') || msg.includes('diiwaan') || msg.includes('تسجيل') || msg.includes('إضافة')) {
        return 'AddHouseIntent';
      }
      if (msg.includes('favorite') || msg.includes('save') || msg.includes('jecel') || msg.includes('kaydi') || msg.includes('مفضل') || msg.includes('حفظ')) {
        return 'FavoriteHouseIntent';
      }
      return 'SearchHouseIntent';
    }
    
    if (msg.includes('apply') || msg.includes('application') || msg.includes('kireyso') || msg.includes('codsi') || msg.includes('طلب') || msg.includes('تقديم')) {
      return 'RentApplicationIntent';
    }

    if (msg.includes('track') || msg.includes('status') || msg.includes('la soco') || msg.includes('xaalada') || msg.includes('حالة') || msg.includes('متابعة')) {
      return 'TrackApplicationIntent';
    }

    if (msg.includes('pay') || msg.includes('evc') || msg.includes('sahal') || msg.includes('zaad') || msg.includes('lacag') || msg.includes('dhaf') || msg.includes('دفع') || msg.includes('سداد')) {
      return 'PaymentIntent';
    }

    if (msg.includes('payout') || msg.includes('earning') || msg.includes('income') || msg.includes('revenue') || msg.includes('dakhli') || msg.includes('faaiido') || msg.includes('أرباح') || msg.includes('عائدات')) {
      return 'LandlordAnalyticsIntent';
    }

    if (msg.includes('verify') || msg.includes('upgrade') || msg.includes('noqo milkiile') || msg.includes('ترقية') || msg.includes('تحقق')) {
      return 'VerificationIntent';
    }

    if (msg.includes('complaint') || msg.includes('tabasho') || msg.includes('dhib') || msg.includes('شكوى') || msg.includes('مشكلة')) {
      return 'ComplaintIntent';
    }

    if (msg.includes('profile') || msg.includes('akoon') || msg.includes('who am i') || msg.includes('malf') || msg.includes('حسابي')) {
      return 'ProfileIntent';
    }

    return 'GeneralQueryIntent';
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const input = inputValue;
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      processResponse(input);
    }, 700);
  };

  const processResponse = (input: string) => {
    setIsTyping(false);
    const intent = parseIntent(input);

    let botReply = "";
    let matchedHouses: House[] = [];
    let actions: { label: string; onClick: () => void }[] = [];

    switch (intent) {
      case 'SearchHouseIntent': {
        matchedHouses = houses.filter(h => h.status === 'available').slice(0, 3);
        if (lang === 'so') {
          botReply = `Waxaan kuu helay ${matchedHouses.length} guri oo diyaar ah oo ku yaala magaalooyinka kala duwan. Guji si aad u eegto faahfaahinta:`;
        } else if (lang === 'ar') {
          botReply = `لقد عثرت لك على ${matchedHouses.length} عقارات مميزة ومتاحة للإيجار حالياً. اضغط على أي عقار لعرض التفاصيل الكاملة:`;
        } else {
          botReply = `I found ${matchedHouses.length} available properties matching your interest. Click below to view full details:`;
        }
        break;
      }
      case 'PaymentIntent': {
        if (lang === 'so') {
          botReply = `Si aad kirada ugu bixiso EVC Plus, Sahal, ama Zaad:\n1. Tag qaybta Bixinta (Payments)\n2. Dooro dalabkaaga kireysiga\n3. Geli 4-ta lambar ee sirta ah ee PIN-kaaga si toos ah.`;
        } else if (lang === 'ar') {
          botReply = `لسداد الإيجار الشهري عبر EVC Plus أو Zaad أو Sahal:\n١. انتقل إلى تبويب المدفوعات (Payments)\n٢. اختر العقار أو الطلب المعتمد\n٣. أدخل رمز الدفع السري المكون من ٤ أرقام لإتمام التحويل الفوري.`;
        } else {
          botReply = `To pay rent using EVC Plus, Zaad, or Sahal:\n1. Go to the Payments tab\n2. Select your approved rental obligation\n3. Enter your 4-digit mobile money PIN to authorize the payment.`;
        }
        break;
      }
      case 'VerificationIntent': {
        if (lang === 'so') {
          botReply = `Waxaad codsan kartaa inaad noqoto Mulkiile si aad guryahaaga ugu diiwaangeliso GoobJoog una hesho dakhli toos ah.`;
        } else if (lang === 'ar') {
          botReply = `يمكنك التقدم بطلب ترقية حسابك إلى مالك عقار لإدراج منازلك وتلقي الإيجار مباشرة على محفظتك المالية.`;
        } else {
          botReply = `You can apply to become a verified Landlord on GoobJoog to list properties and collect rent directly.`;
        }
        if (onUpgradeToLandlord) {
          actions.push({
            label: t.applyLandlordBtn,
            onClick: onUpgradeToLandlord
          });
        }
        break;
      }
      case 'ComplaintIntent': {
        if (lang === 'so') {
          botReply = `Waan ka xunnahay dhibaatada ku soo gaadhay. Fadlan tag faahfaahinta gurigaaga oo riix 'Gudbi Tabasho' si maamulku toos u xalliyo.`;
        } else if (lang === 'ar') {
          botReply = `نأسف لأي إزعاج أو مشكلة صيانة تواجهها. يمكنك الانتقال لصفحة تفاصيل العقار والضغط على 'الإبلاغ عن شكوى' لتتم معالجتها فوراً من قبل الإدارة.`;
        } else {
          botReply = `We apologize for the inconvenience. Please open the house details and click 'Report Issue' to submit an official maintenance ticket.`;
        }
        break;
      }
      case 'ProfileIntent': {
        if (lang === 'so') {
          botReply = `Magacaaga: ${currentUser.fullName}\nTaleefanka: ${currentUser.phone}\nDoorka: ${currentUser.roles.join(', ')}`;
        } else if (lang === 'ar') {
          botReply = `الاسم الكامل: ${currentUser.fullName}\nرقم الهاتف: ${currentUser.phone}\nالأدوار والصلاحيات: ${currentUser.roles.join('، ')}`;
        } else {
          botReply = `Full Name: ${currentUser.fullName}\nPhone: ${currentUser.phone}\nRole Privileges: ${currentUser.roles.join(', ')}`;
        }
        break;
      }
      default: {
        if (lang === 'so') {
          botReply = `Waad ku mahadsan tahay weydiintaada. Waxaan kaa caawin karaa raadinta guryaha, bixinta kirada, iyo maaraynta akoonkaaga.`;
        } else if (lang === 'ar') {
          botReply = `شكراً لتواصلك معنا. يمكنني مساعدتك في استكشاف العقارات، سداد الإيجار الشهري، أو إدارة حسابك وخدماتك.`;
        } else {
          botReply = `Thank you for your question. I can assist you with property discovery, rent transactions, and account preferences.`;
        }
        break;
      }
    }

    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: botReply,
        timestamp: new Date(),
        houses: matchedHouses.length > 0 ? matchedHouses : undefined,
        actions: actions.length > 0 ? actions : undefined
      }
    ]);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 lg:bottom-6 ${isArabic ? 'left-6' : 'right-6'} z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-all duration-300 group`}
          aria-label={t.aiButtonLabel}
        >
          <div className="relative">
            <Bot size={22} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
          <span className="font-extrabold text-xs tracking-wide hidden sm:inline">{t.aiButtonLabel}</span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-20 lg:bottom-6 ${isArabic ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 w-[92vw] sm:w-96 h-[520px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp`}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg shadow-inner">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-xs">{t.aiAssistantTitle}</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {t.aiOnlineStatus}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label={t.close}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {[t.aiSuggestion1, t.aiSuggestion2, t.aiSuggestion3, t.aiSuggestion4].map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue(sug);
                }}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 shrink-0 transition"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Message History Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/50 dark:border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Property Recommendation Cards in Chat */}
                {msg.houses && msg.houses.length > 0 && (
                  <div className="w-full space-y-2 mt-2">
                    {msg.houses.map(h => (
                      <div
                        key={h.id}
                        onClick={() => onViewHouse && onViewHouse(h.id)}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 cursor-pointer flex gap-2.5 transition"
                      >
                        <img src={h.imageUrl} alt={h.title} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px] block line-clamp-1">{h.title}</span>
                          <span className="text-[10px] text-blue-600 font-black">${formatNumber(h.pricePerMonth)} {t.perMonth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.actions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={act.onClick}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow transition active:scale-95"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              placeholder={t.aiInputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition active:scale-95"
              aria-label={t.submit}
            >
              <Send size={16} className={isArabic ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
