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
  
  // Conversational Memory Context
  const [searchContext, setSearchContext] = useState<{
    city?: string;
    price?: number;
    rooms?: number;
    wifi?: boolean;
    parking?: boolean;
    water?: boolean;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Seed greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      triggerGreeting();
    }
  }, [isOpen]);

  const triggerGreeting = () => {
    let greeting = "";
    if (lang === 'so') {
      greeting = `Ku soo dhowow GoobJoog AI Assistant! 👋\nWaan ku salaamay ${currentUser.fullName}. Waxaan diyaar u ahay inaan kaa caawiyo raadinta guryaha, kireynta, iyo maaraynta dakhligaaga. Fadlan dooro ama ku qor mid ka mid ah doorashooyinka hoose:`;
    } else if (lang === 'ar') {
      greeting = `مرحباً بك في مساعد GoobJoog الذكي! 👋\nأهلاً بك يا ${currentUser.fullName}. أنا هنا لمساعدتك في العثور على العقارات المناسبة، إدارة الإيجارات، وتتبع الأرباح. يرجى اختيار خيار أو كتابة استفسارك:`;
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

  // Helper to format numbers dynamically
  const formatNumber = (num: number) => {
    if (lang === 'ar') {
      return new Intl.NumberFormat('ar-EG').format(num);
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Intent Classifier Engine
  const parseIntent = (message: string): string => {
    const msg = message.toLowerCase();
    
    if (msg.includes('house') || msg.includes('guri') || msg.includes('qol') || msg.includes('rooms') || msg.includes('rent') || msg.includes('kira') || msg.includes('shaqqa') || msg.includes('منزل') || msg.includes('غرفة') || msg.includes('إيجار')) {
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

  // Permission Checker Gate
  const checkPermission = (intent: string): boolean => {
    const roles = currentUser.roles;
    if (intent === 'LandlordAnalyticsIntent' || intent === 'AddHouseIntent') {
      return roles.includes('homeowner') || roles.includes('administrator');
    }
    if (intent === 'VerificationIntent' && intent.includes('approve')) {
      return roles.includes('administrator');
    }
    return true;
  };

  // Natural Language Search Compiler
  const compileSearchCriteria = (msg: string) => {
    // Rooms
    let rooms = searchContext.rooms;
    if (msg.includes('1 qol') || msg.includes('1 bed') || msg.includes('one bed') || msg.includes('غرفة واحدة') || msg.includes('غرفه واحده')) rooms = 1;
    else if (msg.includes('2 qol') || msg.includes('2 bed') || msg.includes('two bed') || msg.includes('غرفتين') || msg.includes('غرفتان')) rooms = 2;
    else if (msg.includes('3 qol') || msg.includes('3 bed') || msg.includes('three bed') || msg.includes('ثلاث غرف') || msg.includes('٣ غرف')) rooms = 3;
    else if (msg.includes('4 qol') || msg.includes('4 bed') || msg.includes('four bed') || msg.includes('أربع غرف') || msg.includes('٤ غرف')) rooms = 4;

    // Price Limit
    let price = searchContext.price;
    const priceMatch = msg.match(/(?:under|less than|ka yar|qiimo|less|dolar|usd|\$|تحت|أقل من)\s*(\d+)/) || msg.match(/(\d+)\s*(?:dolar|usd|\$|doolar)/);
    if (priceMatch && priceMatch[1]) {
      price = parseInt(priceMatch[1]);
    }

    // Cities
    let city = searchContext.city;
    const cities = [
      'mogadishu', 'muqdisho', 'مقديشو',
      'hargeisa', 'hargeysa', 'هرجيسا',
      'garowe', 'garoowe', 'غاروي',
      'kismayo', 'kismaayo', 'كيسمايو',
      'baidoa', 'baydhabo', 'بيدوا',
      'galkayo', 'gaalkacayo', 'جالكعيو',
      'bosaso', 'boosaaso', 'بوساسو',
      'burao', 'burco', 'برعو',
      'beledweyne', 'بلدوين',
      'dhusamareb', 'dhuusamareeb', 'دوسمريب',
      'jowhar', 'جوهر',
      'berbera', 'بربرة'
    ];
    for (const c of cities) {
      if (msg.includes(c)) {
        if (c === 'muqdisho' || c === 'مقديشو') city = 'Mogadishu';
        else if (c === 'hargeysa' || c === 'هرجيسا') city = 'Hargeisa';
        else if (c === 'garoowe' || c === 'غاروي') city = 'Garowe';
        else if (c === 'kismaayo' || c === 'كيسمايو') city = 'Kismayo';
        else if (c === 'baydhabo' || c === 'بيدوا') city = 'Baidoa';
        else if (c === 'gaalkacayo' || c === 'جالكعيو') city = 'Galkayo';
        else if (c === 'boosaaso' || c === 'بوساسو') city = 'Bosaso';
        else if (c === 'burco' || c === 'برعو') city = 'Burao';
        else if (c === 'بلدوين') city = 'Beledweyne';
        else if (c === 'dhuusamareeb' || c === 'دوسمريب') city = 'Dhusamareb';
        else if (c === 'جوهر') city = 'Jowhar';
        else if (c === 'بربرة') city = 'Berbera';
        else city = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // Amenities
    let wifi = searchContext.wifi || msg.includes('wifi') || msg.includes('internet') || msg.includes('intarnet');
    let parking = searchContext.parking || msg.includes('parking') || msg.includes('baabuur') || msg.includes('موقف');
    let water = searchContext.water || msg.includes('water') || msg.includes('biyo') || msg.includes('ماء') || msg.includes('24/7');

    const updatedContext = { city, price, rooms, wifi, parking, water };
    setSearchContext(updatedContext);
    return updatedContext;
  };

  // Main input submission handler
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

    // Humanized response delay simulation
    setTimeout(() => {
      processResponse(input);
    }, 850);
  };

  const detectLanguage = (text: string): 'so' | 'ar' | 'en' => {
    const lower = text.toLowerCase();
    
    // Arabic script detection is 100% accurate
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar';
    }
    
    // Somali keywords detection
    const somaliKeywords = [
      'guri', 'qol', 'kir', 'hel', 'diiwaan', 'kirey', 'kireyso', 'ma ', 'jira', 'lacag', 
      'fadlan', 'caawo', 'halkee', 'kuyaal', 'muqdisho', 'hargeysa', 'garowe', 'tabasho', 
      'dhib', 'ii ', 'soo ', 'haddii', 'aan ', 'wax ', 'kaan ', 'ee ', 'oo ', 'uu ', 'aan '
    ];
    if (somaliKeywords.some(word => lower.includes(word))) {
      return 'so';
    }
    
    // English keywords detection
    const englishKeywords = [
      'house', 'room', 'rent', 'show', 'find', 'save', 'favorite', 'track', 'status', 
      'payout', 'earning', 'upgrade', 'complaint', 'profile', 'who ', 'how ', 'help',
      'please', 'less', 'under', 'more', 'than'
    ];
    if (englishKeywords.some(word => lower.includes(word))) {
      return 'en';
    }
    
    // Fallback to the current system language
    return lang;
  };

  const processResponse = (input: string) => {
    setIsTyping(false);
    const detectedLang = detectLanguage(input);
    const intent = parseIntent(input);

    // Permission Verification Gate
    if (!checkPermission(intent)) {
      let failMsg = "";
      if (detectedLang === 'so') {
        failMsg = "❌ Khalad: Doorkaada hadda kuu ogolaan maayo inaad hesho macluumaadkan ama aad fuliso ficilkan.";
      } else if (detectedLang === 'ar') {
        failMsg = "❌ خطأ: دورك الحالي لا يسمح لك بالوصول إلى هذه المعلومات أو تنفيذ هذا الإجراء.";
      } else {
        failMsg = "❌ Access Denied: Your current role is unauthorized to perform this action.";
      }
      setMessages(prev => [...prev, { sender: 'bot', text: failMsg, timestamp: new Date() }]);
      return;
    }

    // Action Router & Intent Dispatcher
    switch (intent) {
      case 'SearchHouseIntent':
        handleSearchIntent(input, detectedLang);
        break;
      case 'FavoriteHouseIntent':
        handleFavoriteIntent(input, detectedLang);
        break;
      case 'RentApplicationIntent':
        handleApplyIntent(input, detectedLang);
        break;
      case 'TrackApplicationIntent':
        handleTrackIntent(detectedLang);
        break;
      case 'PaymentIntent':
        handlePaymentIntent(detectedLang);
        break;
      case 'LandlordAnalyticsIntent':
        handleLandlordAnalytics(detectedLang);
        break;
      case 'AddHouseIntent':
        handleAddHouseIntent(detectedLang);
        break;
      case 'VerificationIntent':
        handleVerificationIntent(detectedLang);
        break;
      case 'ComplaintIntent':
        handleComplaintIntent(input, detectedLang);
        break;
      case 'ProfileIntent':
        handleProfileIntent(detectedLang);
        break;
      default:
        handleGeneralQuery(input, detectedLang);
    }
  };

  // Intent Handlers
  const handleSearchIntent = (input: string, responseLang: 'en' | 'so' | 'ar') => {
    const filters = compileSearchCriteria(input);
    
    // Filter live houses state (Zero Hallucination Policy)
    let filtered = houses.filter(h => h.status === 'available');

    if (filters.city) {
      filtered = filtered.filter(h => h.city.toLowerCase() === filters.city!.toLowerCase() || h.district.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters.rooms) {
      filtered = filtered.filter(h => h.roomsCount === filters.rooms);
    }
    if (filters.price) {
      filtered = filtered.filter(h => h.pricePerMonth <= filters.price!);
    }
    if (filters.wifi) {
      filtered = filtered.filter(h => h.facilities.wifi);
    }
    if (filters.parking) {
      filtered = filtered.filter(h => h.facilities.parking);
    }
    if (filters.water) {
      filtered = filtered.filter(h => h.facilities.water_24_7);
    }

    // Trigger Preference Updater (AI Recommendation Engine)
    if (onUpdatePreferences && (filters.city || filters.price || filters.rooms)) {
      onUpdatePreferences({ city: filters.city, price: filters.price, rooms: filters.rooms });
    }

    let responseText = "";
    if (filtered.length === 0) {
      if (responseLang === 'so') {
        responseText = `Maba helin wax guryo ah oo ku habboon shaandhadaada hadda (${filters.city || 'Magaalo kasta'}, ${filters.rooms ? filters.rooms + ' qolal' : 'Qolal kasta'}, qiimo ka yar $${filters.price || 'kasta'}). Isku day inaad bedesho miisaaniyadaada.`;
      } else if (responseLang === 'ar') {
        responseText = `لم أجد أي عقارات تطابق بحثك حالياً (${filters.city || 'جميع المدن'}، ${filters.rooms ? filters.rooms + ' غرف' : 'أي غرف'}، سعر أقل من $${filters.price || 'أي سعر'}). يرجى تجربة خيارات أخرى.`;
      } else {
        responseText = `I could not find any available houses matching your exact filters (${filters.city || 'All Cities'}, ${filters.rooms ? filters.rooms + ' rooms' : 'Any Rooms'}, price under $${filters.price || 'Any'}). Try widening your price scope.`;
      }
    } else {
      if (responseLang === 'so') {
        responseText = `Waxaan helay ${filtered.length} guri oo ku habboon dookhaaga! Guryaha hoos ku taxan waa kuwo dhab ah oo yaal database-ka:`;
      } else if (responseLang === 'ar') {
        responseText = `لقد وجدت ${filtered.length} عقاراً يطابق خياراتك! هذه العقارات مدرجة حالياً في النظام:`;
      } else {
        responseText = `I found ${filtered.length} listings matching your parameters! Below are the verified properties available:`;
      }
    }

    setMessages(prev => [...prev, {
      sender: 'bot',
      text: responseText,
      timestamp: new Date(),
      houses: filtered.slice(0, 3) // Expose up to 3 interactive cards
    }]);
  };

  const handleFavoriteIntent = (input: string, responseLang: 'en' | 'so' | 'ar') => {
    // Identify if user is referring to a specific house
    const houseIdMatch = input.match(/id\s*(\d+)/i) || input.match(/house\s*(\d+)/i) || input.match(/guriga\s*(\d+)/i);
    let targetHouse = houses[0];
    if (houseIdMatch && houseIdMatch[1]) {
      const matched = houses.find(h => h.id === 'h' + houseIdMatch[1]);
      if (matched) targetHouse = matched;
    }

    if (!targetHouse) {
      let noHouse = responseLang === 'so' ? "Fadlan sheeg guriga aad rabto inaad ku darto jecelka (tusaale: 'Kaydi guriga 1')." : responseLang === 'ar' ? "يرجى تحديد العقار الذي ترغب في إضافته للمفضلة." : "Please specify the listing you wish to favorite.";
      setMessages(prev => [...prev, { sender: 'bot', text: noHouse, timestamp: new Date() }]);
      return;
    }

    if (onToggleFavorite) {
      onToggleFavorite(targetHouse.id, { stopPropagation: () => {} } as any);
      const isFav = favorites.includes(targetHouse.id);
      let text = "";
      if (responseLang === 'so') {
        text = isFav 
          ? `💔 Guriga ${targetHouse.title} waa laga saaray liiska guryaha aad jeceshahay.` 
          : `❤️ Guriga ${targetHouse.title} waxaa lagu daray liiska guryaha aad jeceshahay.`;
      } else if (responseLang === 'ar') {
        text = isFav 
          ? `💔 تم إزالة ${targetHouse.title} من مفضلتك.` 
          : `❤️ تم إضافة ${targetHouse.title} إلى مفضلتك بنجاح.`;
      } else {
        text = isFav 
          ? `💔 Removed ${targetHouse.title} from your favorites.` 
          : `❤️ Added ${targetHouse.title} to your favorites!`;
      }
      setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
    }
  };

  const handleApplyIntent = (input: string, responseLang: 'en' | 'so' | 'ar') => {
    const houseIdMatch = input.match(/id\s*(\d+)/i) || input.match(/house\s*(\d+)/i) || input.match(/guriga\s*(\d+)/i);
    let targetHouse = houses.find(h => h.status === 'available');
    if (houseIdMatch && houseIdMatch[1]) {
      const matched = houses.find(h => h.id === 'h' + houseIdMatch[1]);
      if (matched) targetHouse = matched;
    }

    if (!targetHouse) {
      let noHouse = responseLang === 'so' ? "Ma helin guri diyaar ah si aad u kireysato hadda." : responseLang === 'ar' ? "لم أجد أي منزل متاح للإيجار حالياً." : "I found no available property for renting.";
      setMessages(prev => [...prev, { sender: 'bot', text: noHouse, timestamp: new Date() }]);
      return;
    }

    let text = "";
    if (responseLang === 'so') {
      text = `📝 Waxaan kuu furayaa foomka kireysiga ee guriga: **${targetHouse.title}**. Fadlan ku buuxi macluumaadkaaga foomka modal-ka ee shaashada ka soo muuqday.`;
    } else if (responseLang === 'ar') {
      text = `📝 سأقوم بفتح نموذج طلب الاستئجار لعقار **${targetHouse.title}** حالاً. يرجى إدخال بياناتك في النافذة المنبثقة.`;
    } else {
      text = `📝 Opening the rental application form for **${targetHouse.title}**. Please provide your terms in the pop-up modal.`;
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);

    if (onOpenApplyModal) {
      onOpenApplyModal(targetHouse);
    }
  };

  const handleTrackIntent = (responseLang: 'en' | 'so' | 'ar') => {
    const myApps = applications.filter(a => a.tenantId === currentUser.id);
    let text = "";

    if (myApps.length === 0) {
      if (responseLang === 'so') {
        text = "Ma jiraan wax codsiyo ah oo aad hadda u gudbisay nidaamka.";
      } else if (responseLang === 'ar') {
        text = "ليس لديك أي طلبات استئجار مقدمة في الوقت الحالي.";
      } else {
        text = "You haven't submitted any rental applications yet.";
      }
    } else {
      if (responseLang === 'so') {
        text = `Waxaan helay ${myApps.length} codsi oo aad gudbisay. Waa kuwan xaaladooda dhabta ah:\n\n`;
      } else if (responseLang === 'ar') {
        text = `لقد عثرت على ${myApps.length} طلبات مقدمة من قبلك. إليك تفاصيل حالتها:\n\n`;
      } else {
        text = `I found ${myApps.length} applications from you. Here are their live statuses:\n\n`;
      }

      myApps.forEach(a => {
        const h = houses.find(house => house.id === a.houseId);
        const statusIcon = a.status === 'approved' ? '✅ Approved' : a.status === 'rejected' ? '❌ Rejected' : '⏳ Pending Approval';
        text += `• **${h ? h.title : 'Property'}**: Status: ${statusIcon} (Rent: $${formatNumber(a.monthlyRent || 350)}/mo)\n`;
      });
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
  };

  const handlePaymentIntent = (responseLang: 'en' | 'so' | 'ar') => {
    const myApproved = applications.filter(a => a.tenantId === currentUser.id && a.status === 'approved');
    let text = "";

    if (myApproved.length === 0) {
      if (responseLang === 'so') {
        text = "Si aad lacag kireed u bixiso, waa in marka hore uu maamulaha ama milkiilaha guriga kaa ogolaado codsigaaga kirada.";
      } else if (responseLang === 'ar') {
        text = "لسداد الإيجار، يجب أن تتم الموافقة على طلب استئجارك أولاً من قبل المالك.";
      } else {
        text = "To make a payment, you must first have an approved rental application.";
      }
    } else {
      if (responseLang === 'so') {
        text = `Waxaad leedahay ${myApproved.length} guri oo lagugu ogolaaday. Si aad u bixiso kireynta:\n\n`;
      } else if (responseLang === 'ar') {
        text = `لديك ${myApproved.length} عقارات معتمدة للدفع. لإجراء عملية السداد:\n\n`;
      } else {
        text = `You have ${myApproved.length} approved rentals. To make a payment:\n\n`;
      }

      myApproved.forEach(a => {
        const h = houses.find(house => house.id === a.houseId);
        text += `👉 **${h ? h.title : 'Property'}**: Rent due is $${formatNumber(a.monthlyRent || 350)}. Under the property info card, select 'Pay Rent' to trigger EVC Plus, Sahal, or Zaad USSD codes.\n`;
      });
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
  };

  const handleLandlordAnalytics = (responseLang: 'en' | 'so' | 'ar') => {
    const myHouses = houses.filter(h => h.landlordId === currentUser.id);
    const rented = myHouses.filter(h => h.status === 'rented');
    const myRevenue = transactions.filter(t => t.landlordName === currentUser.fullName && t.paymentStatus === 'successful').reduce((sum, t) => sum + t.payoutAmount, 0);

    let text = "";
    if (responseLang === 'so') {
      text = `📊 **Warbixinta Dakhligaaga & Guryahaaga**:\n\n` +
             `• **Guryaha kuu diiwaan gashan**: ${myHouses.length} unug\n` +
             `• **Kuwa hadda kireysan**: ${rented.length} unug\n` +
             `• **Dakhliga guud ee kuu soo xarootay**: $${formatNumber(myRevenue)}\n\n` +
             `Guryaha ugu caansan waa kuwa leh WiFi iyo biyaha joogtada ah.`;
    } else if (responseLang === 'ar') {
      text = `📊 **تحليلات المالك والإيرادات**:\n\n` +
             `• **العقارات المدرجة باسمك**: ${myHouses.length} وحدات\n` +
             `• **العقارات المؤجرة حالياً**: ${rented.length} وحدات\n` +
             `• **إجمالي الأرباح المستلمة**: $${formatNumber(myRevenue)}\n\n` +
             `عقاراتك الأكثر طلباً هي العقارات التي تحتوي على خدمات متكاملة كالمياه والإنترنت.`;
    } else {
      text = `📊 **Landlord Revenue & Occupancy Report**:\n\n` +
             `• **Your Registered Properties**: ${myHouses.length} units\n` +
             `• **Currently Occupied**: ${rented.length} units\n` +
             `• **Total Payout Earnings**: $${formatNumber(myRevenue)}\n\n` +
             `Note: Listings in high-demand cities generate higher conversion rates.`;
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
  };

  const handleAddHouseIntent = (responseLang: 'en' | 'so' | 'ar') => {
    let text = "";
    if (responseLang === 'so') {
      text = "🏡 Waxaan shaashada u rogi doonaa qaybta Diiwaangelinta Guriga Cusub. Waxaad u baahantahay:\n1. Magaca guriga iyo faahfaahinta qolalka.\n2. Soo geli sawir dhab ah oo cad.\n3. Buuxi goobaha wada jira ee xiddigta leh (*).";
    } else if (responseLang === 'ar') {
      text = "🏡 سأقوم بتوجيهك إلى نموذج إدراج عقار جديد. المتطلبات الأساسية:\n1. عنوان العقار ووصف تفصيلي.\n2. تحميل صور واضحة وغير مشوشة.\n3. ملء كافة الحقول الإجبارية (*).";
    } else {
      text = "🏡 Navigating to the New Property Registration block. Essential checklist:\n1. Property title and bedroom structure.\n2. High-quality cover photo.\n3. Complete all required fields marked with (*).";
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
    
    // Smooth scroll to the form container
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
      formElement.classList.add('ring-2', 'ring-brand-primary', 'ring-offset-2');
      setTimeout(() => formElement.classList.remove('ring-2', 'ring-brand-primary', 'ring-offset-2'), 3000);
    }
  };

  const handleVerificationIntent = (responseLang: 'en' | 'so' | 'ar') => {
    let text = "";
    const isLandlord = currentUser.roles.includes('homeowner');
    
    if (isLandlord) {
      if (responseLang === 'so') {
        text = "✓ Waxaad tahay Mulkiile la xaqiijiyey! Waxaad si toos ah u soo gelin kartaa guryahaaga adiga oo aan u baahnayn maamule mar kale.";
      } else if (responseLang === 'ar') {
        text = "✓ حسابك كمالك موثق ومؤكد بالفعل! يمكنك إدراج عقاراتك مباشرة دون الحاجة لموافقة إضافية.";
      } else {
        text = "✓ You are already a verified Landlord/Homeowner. You can list houses directly.";
      }
    } else {
      if (responseLang === 'so') {
        text = "⏳ Waxaan kuu gudbinayaa codsiga Noqoshada Mulkiilaha (Upgrade to Landlord). Guji badhanka 'Noqo Milkiile' ee ku yaal dhinaca bidix ee dashboard-kaaga si aad u gudbiso codsi hubin.";
      } else if (responseLang === 'ar') {
        text = "⏳ لتحديث صلاحياتك إلى مالك عقار، يرجى النقر على زر 'طلب ترقية لمالك' في القائمة الجانبية.";
      } else {
        text = "⏳ To upgrade your role, click the 'Become Landlord' trigger inside your dashboard sidebar to notify our admins.";
      }
      if (onUpgradeToLandlord) {
        onUpgradeToLandlord();
      }
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
  };

  const handleComplaintIntent = (input: string, responseLang: 'en' | 'so' | 'ar') => {
    let text = "";
    const myComplaints = complaints.filter(c => c.reporterPhone === currentUser.phone);

    if (myComplaints.length === 0) {
      if (responseLang === 'so') {
        text = "Ma jiraan wax tabashooyin ah oo aad hadda u gudbisay nidaamka. Si aad u gudbiso dhib, fadlan guji 'Report Issue' ee ku yaal kaarka guriga.";
      } else if (responseLang === 'ar') {
        text = "ليس لديك أي شكاوى مسجلة حالياً. للإبلاغ عن مشكلة، انقر فوق خيار 'الإبلاغ عن شكوى' في بطاقة العقار.";
      } else {
        text = "You don't have any registered complaints. To report an issue, click the 'Report Issue' tab under a house.";
      }
    } else {
      if (responseLang === 'so') {
        text = `Waxaan helay ${myComplaints.length} tabasho oo dhab ah oo aad gudbisay:\n\n`;
      } else if (responseLang === 'ar') {
        text = `لديك ${myComplaints.length} شكاوى نشطة في النظام:\n\n`;
      } else {
        text = `I found ${myComplaints.length} registered issues from you:\n\n`;
      }

      myComplaints.forEach(c => {
        const resolvedText = c.status === 'resolved' ? '✅ Resolved' : '⏳ Pending Review';
        text += `• **${c.title}**: Status: ${resolvedText} (Details: ${c.details})\n`;
      });
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
  };

  const handleProfileIntent = (responseLang: 'en' | 'so' | 'ar') => {
    let text = "";
    if (responseLang === 'so') {
      text = `👤 **Macluumaadka Akoonkaaga GoobJoog**:\n\n` +
             `• **Magaca oo buuxa**: ${currentUser.fullName}\n` +
             `• **Magaca isticmaalaha**: @${currentUser.username}\n` +
             `• **Phone**: ${currentUser.phone}\n` +
             `• **Doorkaada**: ${currentUser.roles.join(', ')}\n` +
             `• **Account Status**: ${currentUser.isVerified ? '✓ Verified Customer' : 'Standard User'}`;
    } else if (responseLang === 'ar') {
      text = `👤 **تفاصيل حسابك الشخصي**:\n\n` +
             `• **الاسم الكامل**: ${currentUser.fullName}\n` +
             `• **اسم المستخدم**: @${currentUser.username}\n` +
             `• **رقم الهاتف**: ${currentUser.phone}\n` +
             `• **الصلاحيات**: ${currentUser.roles.join(', ')}\n` +
             `• **حالة الحساب**: ${currentUser.isVerified ? '✓ حساب موثق' : 'حساب عادي'}`;
    } else {
      text = `👤 **GoobJoog Profile Overview**:\n\n` +
             `• **Full Name**: ${currentUser.fullName}\n` +
             `• **Username**: @${currentUser.username}\n` +
             `• **Phone Number**: ${currentUser.phone}\n` +
             `• **Assigned Roles**: ${currentUser.roles.join(', ')}\n` +
             `• **Trust Status**: ${currentUser.isVerified ? '✓ Verified Account' : 'Standard Profile'}`;
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
  };

  const handleGeneralQuery = (input: string, responseLang: 'en' | 'so' | 'ar') => {
    let text = "";
    const msg = input.toLowerCase();

    // Security check: Never leak internal user list details
    if (msg.includes('user') || msg.includes('password') || msg.includes('email') || msg.includes('credentials') || msg.includes('furaha') || msg.includes('kelme')) {
      if (responseLang === 'so') {
        text = "🔒 Security Enforcer: Fadlan ogow in nidaamku aanu marnaba wadaagi karin furayaasha sirta ah ama emails-ka dadka kale.";
      } else if (responseLang === 'ar') {
        text = "🔒 السياسة الأمنية: يرجى العلم بأنه لا يمكن مشاركة كلمات المرور أو البريد الإلكتروني لأي مستخدم آخر لأسباب أمنية.";
      } else {
        text = "🔒 Security Shield: Passwords and sensitive customer accounts cannot be exposed or searched.";
      }
      setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
      return;
    }

    if (msg.includes('how to upload') || msg.includes('sida loo galiyo') || msg.includes('كيفية إدراج')) {
      if (responseLang === 'so') {
        text = "Si aad guri cusub u soo geliso, dooro doorka Mulkiilaha (Homeowner), dabadeed buuxi foomka 'Register Property' adoo raacaya shuruudaha sawirada cad-cad.";
      } else if (responseLang === 'ar') {
        text = "لإدراج عقار جديد، قم بالتبديل إلى حساب المالك، ثم املأ نموذج 'تسجيل عقار جديد' مع إرفاق صور واضحة.";
      } else {
        text = "To list a property, switch to Homeowner Console, fill in the Register Property details, and drag/drop at least one clear property image.";
      }
    } else if (msg.includes('ussd') || msg.includes('money') || msg.includes('evc')) {
      if (responseLang === 'so') {
        text = "GoobJoog wuxuu leeyahay Mobile Money Ledger oo isku xidha EVC Plus (*712#), Sahal (*120#), iyo Zaad (*202#).";
      } else if (responseLang === 'ar') {
        text = "يدعم GoobJoog الدفع عبر الهاتف المحمول في الصومال مثل EVC Plus (*712#) و Sahal (*120#) و Zaad (*202#) لتسوية الإيجارات.";
      } else {
        text = "GoobJoog integrates Somalia mobile money ledger commands (EVC Plus, Sahal, Zaad) directly into rent processing flows.";
      }
    } else {
      if (responseLang === 'so') {
        text = "Ma aqbali karo su'aashaada hadda. Waxaad i weydiin kartaa guryo raadin ku habboon (tusaale: 'Ii hel guri 2 qol ah oo Hodan ah'), xaalada codsiyadaada, ama dakhligaaga.";
      } else if (responseLang === 'ar') {
        text = "عذراً، لم أفهم سؤالك بشكل صحيح. يمكنك سؤالي عن العقارات المتوفرة (مثال: 'ابحث عن شقة غرفتين في هودن')، أو حالة طلباتك، أو الأرباح.";
      } else {
        text = "I am unsure about your query. You can ask me to search properties (e.g. 'Show 2 bedroom houses in Mogadishu'), track application approvals, or pull payout records.";
      }
    }

    setMessages(prev => [...prev, { sender: 'bot', text, timestamp: new Date() }]);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 font-sans">
      
      {/* Floating Chat Bubble with Micro-animation */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-brand-primary to-brand-primary-dark text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all group duration-300 ring-4 ring-brand-primary-light/20 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[8px] font-bold items-center justify-center text-white">AI</span>
          </span>
        </button>
      )}

      {/* Main Glassmorphic Chat Window */}
      {isOpen && (
        <div className="w-full max-w-[95vw] sm:w-[410px] h-[80vh] sm:h-[550px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white p-4 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/95 rounded-full flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wide flex items-center gap-1">
                  GoobJoog AI Assistant <Sparkles size={11} className="text-amber-300" />
                </span>
                <span className="text-[9px] text-blue-100 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
                  Online • Database Sandbox
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/95 p-1.5 rounded-full transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-slate-50 dark:bg-slate-950/50/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center shrink-0 border border-brand-primary/20 select-none">
                    <Bot size={14} />
                  </div>
                )}
                
                <div className="flex flex-col gap-1.5 max-w-[80%]">
                  <div 
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm font-medium whitespace-pre-line ${
                      m.sender === 'user' 
                        ? 'bg-brand-primary text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {m.text}

                    {/* Render Real interactive houses inside feed */}
                    {m.houses && m.houses.length > 0 && (
                      <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                        {m.houses.map(h => (
                          <div key={h.id} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex gap-2 items-center hover:bg-slate-100 dark:bg-slate-800 transition shadow-sm">
                            {h.imageUrl && (
                              <img src={h.imageUrl} alt={h.title} className="w-12 h-12 object-cover rounded-lg border border-slate-300/40 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">{h.title}</h4>
                              <div className="flex items-center gap-1 text-[8px] text-slate-500 dark:text-slate-500 font-bold mt-0.5">
                                <MapPin size={8} /> {h.district}, {h.city}
                              </div>
                              <span className="text-[10px] font-black text-brand-primary mt-1 block">
                                ${formatNumber(h.pricePerMonth)} / mo
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              {onViewHouse && (
                                <button
                                  onClick={() => onViewHouse(h.id)}
                                  className="text-[8px] bg-brand-primary hover:bg-brand-primary-dark text-white font-black px-2 py-1 rounded transition cursor-pointer"
                                >
                                  View
                                </button>
                              )}
                              {onToggleFavorite && (
                                <button
                                  onClick={(e) => onToggleFavorite(h.id, e)}
                                  className={`p-1 rounded border transition cursor-pointer ${
                                    favorites.includes(h.id) ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500'
                                  }`}
                                >
                                  <Heart size={10} fill={favorites.includes(h.id) ? 'currentColor' : 'none'} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[8px] text-slate-400 font-bold self-end px-1">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center border border-brand-primary/20">
                  <Bot size={14} />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Panel (Role-based shortcut pills) */}
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2.5 flex flex-wrap gap-1.5 select-none">
            {currentUser.roles.includes('tenant') && (
              <>
                <button
                  onClick={() => {
                    setInputValue("Show me houses in Mogadishu under $300");
                  }}
                  className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary hover:text-white text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full transition border border-slate-200 dark:border-slate-800/60 cursor-pointer"
                >
                  🏠 Find Houses
                </button>
                <button
                  onClick={() => {
                    setInputValue("Show my favorite houses");
                  }}
                  className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary hover:text-white text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full transition border border-slate-200 dark:border-slate-800/60 cursor-pointer"
                >
                  ❤️ Favorites
                </button>
                <button
                  onClick={() => {
                    setInputValue("Track my application status");
                  }}
                  className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary hover:text-white text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full transition border border-slate-200 dark:border-slate-800/60 cursor-pointer"
                >
                  📄 Applications
                </button>
              </>
            )}

            {currentUser.roles.includes('homeowner') && (
              <>
                <button
                  onClick={() => {
                    setInputValue("How do I register a house?");
                  }}
                  className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary hover:text-white text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full transition border border-slate-200 dark:border-slate-800/60 cursor-pointer"
                >
                  ➕ Add House
                </button>
                <button
                  onClick={() => {
                    setInputValue("Show my total earnings report");
                  }}
                  className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary hover:text-white text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full transition border border-slate-200 dark:border-slate-800/60 cursor-pointer"
                >
                  📊 Earnings
                </button>
              </>
            )}

            {currentUser.roles.includes('administrator') && (
              <>
                <button
                  onClick={() => {
                    setInputValue("Expose platform statistics");
                  }}
                  className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary hover:text-white text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full transition border border-slate-200 dark:border-slate-800/60 cursor-pointer"
                >
                  🛡️ Admin Stats
                </button>
              </>
            )}
          </div>

          {/* Text Input Panel */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={lang === 'so' ? 'Qor farriin...' : lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
              className="flex-1 px-3 py-2 text-xs border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary bg-slate-50 dark:bg-slate-950/50/50 text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleSend}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white p-2 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
