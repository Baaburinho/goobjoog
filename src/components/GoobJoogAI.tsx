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
  onOpenSettings?: () => void;
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
  onUpdatePreferences,
  onOpenSettings
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

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
      greeting = `Ku soo dhowow Caawiyaha Caqliga Badan ee GoobJoog! 🤖✨\n\nWaad salaaman tahay ${currentUser.fullName}. Waxaan diyaar u ahay inaan kaa caawiyo:\n• 📅 Qabsashada ballanta booqashada guryaha (House Tours)\n• 📍 Raadinta guryaha Baidoa, Muqdisho, Hargeysa, Garoowe, Kismaayo, jso\n• 🏡 Maareynta codsiyadaada iyo dalacsiinta Mulkiilaha\n\nFadlan ku qor su'aal kasta oo aad qabto ama dooro xulashooyinka hoose:`;
    } else if (lang === 'ar') {
      greeting = `مرحباً بك في مساعد GoobJoog الذكي الفائق! 🤖✨\n\nأهلاً بك يا ${currentUser.fullName}. أنا هنا لمساعدتك في كل ما يتعلق بالمنصة:\n• 📅 حجز مواعيد معاينة العقارات ومزيارات المنزل (House Tours)\n• 📍 استكشاف البيوت في بيدوا، مقديشو، هرجيسا، غاروي، كيسمايو وغيرها\n• 🏡 متابعة طلباتك أو ترقية حسابك إلى مالك عقار\n\nيرجى كتابة أي استفسار تريده أو الضغط على الخيارات السريعة أدناه:`;
    } else {
      greeting = `Welcome to GoobJoog Smart AI Assistant! 🤖✨\n\nHello, ${currentUser.fullName}. I can assist you with:\n• 📅 Booking house viewing tours & site visits\n• 📍 Searching properties in Baidoa, Mogadishu, Hargeisa, Garowe, etc.\n• 🏡 Tracking applications & upgrading to a Landlord account\n\nFeel free to ask me any question in natural language:`;
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

  const getHouseTitle = (house: House | null | undefined): string => {
    if (!house) return '';
    if (lang === 'ar') {
      if (house.id === 'h1') return 'فيلا صومالية فاخرة';
      if (house.id === 'h2') return 'شقة سكنية راقية';
      if (house.id === 'h3') return 'منزل عائلي فسيح ٤ غرف';
      if (house.id === 'h4') return 'منزل ساحلي قرب الميناء';
      if (house.id === 'h5') return 'فيلا حديثة ٣ غرف في إسحا';
      if (house.id === 'h6') return 'منزل عائلي مريح';
    } else if (lang === 'so') {
      if (house.id === 'h1') return 'Villa Casri ah oo Raaxo leh';
      if (house.id === 'h2') return 'Dabaq Caadi ah oo Qurux badan';
      if (house.id === 'h3') return 'Guri Qoys oo 4 Qol ah oo Waasac ah';
      if (house.id === 'h4') return 'Guri Xeebeed 2 Qol ah oo Dekedda u Dhaw';
      if (house.id === 'h5') return 'Villa Casri ah oo 3 Qol ah Isha';
      if (house.id === 'h6') return 'Guri Qoys oo Amni ah';
    }
    return house.title;
  };

  const getCityName = (city: string) => {
    switch (city) {
      case 'Mogadishu':
        return lang === 'so' ? 'Muqdisho' : lang === 'ar' ? 'مقديشو' : 'Mogadishu';
      case 'Hargeisa':
        return lang === 'so' ? 'Hargeysa' : lang === 'ar' ? 'هرجيسا' : 'Hargeisa';
      case 'Garowe':
        return lang === 'so' ? 'Garoowe' : lang === 'ar' ? 'غاروي' : 'Garowe';
      case 'Kismayo':
        return lang === 'so' ? 'Kismaayo' : lang === 'ar' ? 'كيسمايو' : 'Kismayo';
      case 'Baidoa':
        return lang === 'so' ? 'Baydhabo' : lang === 'ar' ? 'بيدوا' : 'Baidoa';
      case 'Galkayo':
        return lang === 'so' ? 'Gaalkacayo' : lang === 'ar' ? 'جالكعيو' : 'Galkayo';
      case 'Bosaso':
        return lang === 'so' ? 'Boosaaso' : lang === 'ar' ? 'بوساسو' : 'Bosaso';
      case 'Burao':
        return lang === 'so' ? 'Burco' : lang === 'ar' ? 'برعو' : 'Burao';
      case 'Beledweyne':
        return lang === 'so' ? 'Beledweyne' : lang === 'ar' ? 'بلدوين' : 'Beledweyne';
      case 'Dhusamareb':
        return lang === 'so' ? 'Dhuusamareeb' : lang === 'ar' ? 'دوسمريب' : 'Dhusamareb';
      case 'Jowhar':
        return lang === 'so' ? 'Jowhar' : lang === 'ar' ? 'جوهر' : 'Jowhar';
      case 'Berbera':
        return lang === 'so' ? 'Berbera' : lang === 'ar' ? 'بربرة' : 'Berbera';
      default:
        return city;
    }
  };

  // Comprehensive Natural Language Intent & Semantic Parser
  const parseNLPQuery = (rawInput: string) => {
    const text = rawInput.toLowerCase().trim();

    // 1. Social Greetings & Courtesies
    if (/^(salam|salaam|asc|marhaba|marhaban|ahlan|hey|hi|hello|مرحبا|أهلا|اهلا|السلام عليكم|صباح الخير|مساء الخير)/i.test(text)) {
      return { intent: 'Greeting' };
    }

    if (/^(how are you|iska warran|sidee tahay|keefak|kaif|كيف حالك|شخبارك|عساك طيب)/i.test(text)) {
      return { intent: 'HowAreYou' };
    }

    if (/(who are you|kumaad tahay|man anta|من أنت|من انت|ما وظيفتك|what can you do|maxaad qaban kartaa)/i.test(text)) {
      return { intent: 'BotIdentity' };
    }

    if (/(shukran|mahadsanid|thanks|thank you|مشكور|شكرا|شكراً|بارك الله فيك|تسلم)/i.test(text)) {
      return { intent: 'Gratitude' };
    }

    // 2. House Viewing Tours / Ballan Booqasho
    if (
      text.includes('tour') || text.includes('booqasho') || text.includes('ballan') || text.includes('viewing') ||
      text.includes('arag') || text.includes('sida loo arko') || text.includes('معاينة') || text.includes('زيارة') ||
      text.includes('موعد') || text.includes('حجز')
    ) {
      return { intent: 'TourBookingIntent' };
    }

    // 3. Payments & Direct Contact
    if (
      text.includes('pay') || text.includes('evc') || text.includes('zaad') || text.includes('sahal') ||
      text.includes('hormuud') || text.includes('telesom') || text.includes('golis') || text.includes('pin') ||
      text.includes('lacag') || text.includes('dhaf') || text.includes('bixi') || text.includes('bixinta') ||
      text.includes('kirada') || text.includes('دفع') || text.includes('سداد') || text.includes('تحويل') ||
      text.includes('طريقة الدفع') || text.includes('كيف ادفع')
    ) {
      return { intent: 'PaymentIntent' };
    }

    // 3. Landlord / Property Registration / Upgrade
    if (
      text.includes('upgrade') || text.includes('landlord') || text.includes('homeowner') ||
      text.includes('milkiile') || text.includes('mulkiile') || text.includes('diiwaan') ||
      text.includes('guri geli') || text.includes('guri i geli') || text.includes('dalacsiin') ||
      text.includes('مالك') || text.includes('صاحب عقار') || text.includes('ترقية') ||
      text.includes('تسجيل منزل') || text.includes('إضافة عقار') || text.includes('اضافة عقار') ||
      text.includes('تاجير عقاري') || text.includes('تأجير') || text.includes('اريد اعرض')
    ) {
      return { intent: 'LandlordUpgradeIntent' };
    }

    // 4. Applications / Leases / Tracking
    if (
      text.includes('application') || text.includes('track') || text.includes('status') ||
      text.includes('codsi') || text.includes('dalab') || text.includes('xaalada') ||
      text.includes('la soco') || text.includes('حالة') || text.includes('طلباتي') ||
      text.includes('متابعة') || text.includes('طلب') || text.includes('هل تم قبولي')
    ) {
      return { intent: 'TrackApplicationIntent' };
    }

    // 5. Maintenance / Complaints / Repairs
    if (
      text.includes('complaint') || text.includes('issue') || text.includes('problem') ||
      text.includes('broken') || text.includes('leak') || text.includes('repair') ||
      text.includes('tabasho') || text.includes('cabasho') || text.includes('dhib') ||
      text.includes('dayactir') || text.includes('biyo la\'aan') || text.includes('koronto') ||
      text.includes('شكوى') || text.includes('مشكلة') || text.includes('صيانة') ||
      text.includes('تسريب') || text.includes('كهرباء') || text.includes('عطل') || text.includes('تصليح')
    ) {
      return { intent: 'ComplaintIntent' };
    }

    // 6. Security Deposit / System Commission / Guarantee
    if (
      text.includes('deposit') || text.includes('commission') || text.includes('10%') ||
      text.includes('security') || text.includes('dhigaal') || text.includes('amni') ||
      text.includes('badbaado') || text.includes('تأمين') || text.includes('ضمان') ||
      text.includes('عمولة') || text.includes('١٠٪') || text.includes('امان') || text.includes('أمان')
    ) {
      return { intent: 'DepositSecurityIntent' };
    }

    // 7. Settings, Password, Languages & Theme
    if (
      text.includes('password') || text.includes('profile') || text.includes('theme') ||
      text.includes('dark mode') || text.includes('light mode') || text.includes('language') ||
      text.includes('sir') || text.includes('furaha') || text.includes('luuqad') ||
      text.includes('madow') || text.includes('iftiin') || text.includes('akoon') ||
      text.includes('كلمة السر') || text.includes('الملف الشخصي') || text.includes('اللغة') ||
      text.includes('الوضع الداكن') || text.includes('الوضع الفاتح') || text.includes('اعدادات') || text.includes('إعدادات')
    ) {
      return { intent: 'SettingsIntent' };
    }

    // 8. House Search / Discovery with Semantic Parameters
    // Catches words like: بدي / أريد / ابحث / بيت / شقة / فيلا / رخيص / جميل / jaban / raqiis / guri / villa / cheap / luxury
    const isSearchContext = (
      text.includes('house') || text.includes('villa') || text.includes('apartment') || text.includes('home') ||
      text.includes('rent') || text.includes('room') || text.includes('bedroom') || text.includes('cheap') ||
      text.includes('luxury') || text.includes('affordable') || text.includes('budget') ||
      text.includes('guri') || text.includes('qol') || text.includes('dabaq') || text.includes('jaban') ||
      text.includes('raqiis') || text.includes('raaxo') || text.includes('casri') || text.includes('qurux') ||
      text.includes('rabaa') || text.includes('doonayaa') || text.includes('tus') ||
      text.includes('بيت') || text.includes('منزل') || text.includes('شقة') || text.includes('شقق') ||
      text.includes('فيلا') || text.includes('بيوت') || text.includes('غرفة') || text.includes('غرف') ||
      text.includes('غرفتين') || text.includes('رخيص') || text.includes('جميل') || text.includes('حلو') ||
      text.includes('بدي') || text.includes('اريد') || text.includes('أريد') || text.includes('ابحث') ||
      text.includes('أبحث') || text.includes('عايز') || text.includes('محتاج') || text.includes('احتاج') ||
      text.includes('فاخر') || text.includes('راقي') || text.includes('مناسب') || text.includes('اقتصادي')
    );

    if (isSearchContext) {
      // Check City specificity
      let targetCity: string | undefined;
      if (text.includes('mogadishu') || text.includes('muqdisho') || text.includes('مقديشو')) targetCity = 'Mogadishu';
      else if (text.includes('hargeisa') || text.includes('hargeysa') || text.includes('هرجيسا')) targetCity = 'Hargeisa';
      else if (text.includes('garowe') || text.includes('garoowe') || text.includes('غاروي')) targetCity = 'Garowe';
      else if (text.includes('kismayo') || text.includes('kismaayo') || text.includes('كيسمايو')) targetCity = 'Kismayo';
      else if (text.includes('baidoa') || text.includes('baydhabo') || text.includes('بيدوا')) targetCity = 'Baidoa';
      else if (text.includes('bosaso') || text.includes('boosaaso') || text.includes('بوساسو')) targetCity = 'Bosaso';
      else if (text.includes('burao') || text.includes('burco') || text.includes('برعو')) targetCity = 'Burao';
      else if (text.includes('berbera') || text.includes('بربرة')) targetCity = 'Berbera';

      // Check Price Preference: Cheap vs Luxury
      const isCheap = (
        text.includes('cheap') || text.includes('budget') || text.includes('affordable') ||
        text.includes('jaban') || text.includes('raqiis') ||
        text.includes('رخيص') || text.includes('اقتصادي') || text.includes('منخفض')
      );

      const isLuxury = (
        text.includes('luxury') || text.includes('villa') || text.includes('premium') ||
        text.includes('raaxo') || text.includes('casri') || text.includes('qurux') ||
        text.includes('فاخر') || text.includes('راقي') || text.includes('فيلا') || text.includes('ممتاز')
      );

      // Check Rooms Count
      let roomsCount: number | undefined;
      if (text.includes('1') || text.includes('hal') || text.includes('one') || text.includes('غرفة واحدة')) roomsCount = 1;
      else if (text.includes('2') || text.includes('laba') || text.includes('two') || text.includes('غرفتين') || text.includes('غرفتان')) roomsCount = 2;
      else if (text.includes('3') || text.includes('sadex') || text.includes('saddex') || text.includes('three') || text.includes('٣') || text.includes('ثلاث')) roomsCount = 3;
      else if (text.includes('4') || text.includes('afar') || text.includes('four') || text.includes('٤') || text.includes('اربع') || text.includes('أربع')) roomsCount = 4;

      return {
        intent: 'SearchHouseIntent',
        city: targetCity,
        isCheap,
        isLuxury,
        rooms: roomsCount
      };
    }

    return { intent: 'GeneralQueryIntent' };
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
    }, 500);
  };

  const processResponse = (input: string) => {
    setIsTyping(false);
    const nlp = parseNLPQuery(input);

    let botReply = "";
    let matchedHouses: House[] = [];
    let actions: { label: string; onClick: () => void }[] = [];

    switch (nlp.intent) {
      case 'Greeting': {
        if (lang === 'so') {
          botReply = `Waad salaaman tahay ${currentUser.fullName}! 👋\nSideen maanta kuu caawin karaa? Ma waxaad doonaysaa inaad guri raadsato, kirada bixiso, mise inaad guri diiwaangeliso?`;
        } else if (lang === 'ar') {
          botReply = `أهلاً وسهلاً بك يا ${currentUser.fullName}! 👋\nكيف يمكنني مساعدتك اليوم؟ هل تبحث عن شقق أو بيوت للإيجار، أم تريد سداد الإيجار عبر الهاتف، أم ترغب في إضافة عقارك كمالك؟`;
        } else {
          botReply = `Hello ${currentUser.fullName}! 👋\nHow may I assist you today? Are you looking to find rental homes, pay monthly rent, or list a property?`;
        }
        break;
      }

      case 'HowAreYou': {
        if (lang === 'so') {
          botReply = `Waan fiicanahay, aad baadna ugu mahadsan tahay! 😊\nWaxaan diyaar u ahay inaan kugu caawiyo dhammaan adeegyada GoobJoog. Maxaan kuu qabtaa?`;
        } else if (lang === 'ar') {
          botReply = `أنا بأفضل حال، شكراً جزيلاً لسؤالك اللطيف! 😊\nأنا هنا وجاهز لخدمتك في أي وقت لاختيار أفضل العقارات أو تسهيل عملياتك المالية. كيف أساعدك الآن؟`;
        } else {
          botReply = `I am doing great, thank you for asking! 😊\nI am fully ready to help you discover properties and manage rental payments. What would you like to do?`;
        }
        break;
      }

      case 'BotIdentity': {
        if (lang === 'so') {
          botReply = `Waxaan ahay Caawiyaha Caqliga Badan ee GoobJoog (GoobJoog AI Assistant) 🤖.\nWaxaan kaa caawinayaa:\n1. Raadinta guryaha ku habboon miisaaniyaddaada\n2. Bixinta kirada ee EVC Plus, Zaad, iyo Sahal\n3. Xallinta tabashooyinka iyo maareynta akoonkaaga.`;
        } else if (lang === 'ar') {
          botReply = `أنا المساعد الذكي الرسمي لمنصة GoobJoog 🤖.\nوظيفتي هي تسهيل تجربة استئجار المنازل وإدارتها في الصومال:\n١. العثور على أفضل العقارات بأسعار منافسة\n٢. سداد الإيجار فوراً عبر المحافظ الإلكترونية (EVC Plus, Zaad, Sahal)\n٣. متابعة عقود الإيجار والصيانة ومساعدة الملّاك والمستأجرين.`;
        } else {
          botReply = `I am the official GoobJoog Smart AI Assistant 🤖.\nI help tenants and landlords in Somalia easily discover homes, automate mobile money rent payments, and manage property contracts securely.`;
        }
        break;
      }

      case 'Gratitude': {
        if (lang === 'so') {
          botReply = `Adaa mudan! 🙏 Waa farxad weyn inaan kuu adeego. Haddii aad wax kale u baahatid, mar kasta i weydii!`;
        } else if (lang === 'ar') {
          botReply = `على الرحب والسعة! تسعدني دائماً خدمتك ومساعدتك. إذا كان لديك أي استفسار آخر، أنا هنا دائماً! 🙏`;
        } else {
          botReply = `You are very welcome! It is my pleasure to assist you. Let me know if you need anything else! 🙏`;
        }
        break;
      }

      case 'SearchHouseIntent': {
        let available = houses.filter(h => h.status === 'available');

        // Filter by city if specified
        if (nlp.city) {
          available = available.filter(h => h.city.toLowerCase() === nlp.city?.toLowerCase());
        }

        // Filter by rooms if specified
        if (nlp.rooms) {
          available = available.filter(h => h.roomsCount === nlp.rooms);
        }

        // Sort by price if cheap requested
        if (nlp.isCheap) {
          available.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
        } else if (nlp.isLuxury) {
          available.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
        }

        matchedHouses = available.slice(0, 3);

        if (matchedHouses.length > 0) {
          if (lang === 'so') {
            botReply = `Halkan waxaan kuugu diyaariyey ${matchedHouses.length} guri oo aad u fiican oo buuxiyey shuruudaha aad raadinaysay:\n• Qiimaha wuxuu ka bilaabmayaa $${matchedHouses[0].pricePerMonth}/bishii.\nGuji guri kasta si aad u aragto sawirada iyo faahfaahinta:`;
          } else if (lang === 'ar') {
            botReply = `لقد اخترت لك بعناية ${matchedHouses.length} عقارات ممتازة تلبي طلبك تماماً:\n• الأسعار تبدأ من $${matchedHouses[0].pricePerMonth} شهرياً.\nيمكنك الضغط على أي عقار لعرض التفاصيل الكاملة أو التقديم:`;
          } else {
            botReply = `I found ${matchedHouses.length} great properties matching your exact criteria:\n• Prices starting from $${matchedHouses[0].pricePerMonth}/month.\nClick any card below to view details or apply:`;
          }
        } else {
          matchedHouses = houses.filter(h => h.status === 'available').slice(0, 3);
          if (lang === 'so') {
            botReply = `Ma helin guri sax ah oo buuxiya shuruudahaas adag, laakiin halkan waxaa kuugu jira guryaha ugu fiican ee hadda banaan:`;
          } else if (lang === 'ar') {
            botReply = `لم أعثر على عقار مطابق تماماً لهذا الفلتر المحدد، ولكن إليك أفضل العقارات المتاحة حالياً في النظام:`;
          } else {
            botReply = `I could not find an exact match for those specific filters, but here are the top available listings right now:`;
          }
        }
        break;
      }

      case 'TourBookingIntent': {
        if (lang === 'so') {
          botReply = `📅 Qabsashada Ballanta Booqashada Guriga (House Tour):\n\n1. Raadi ama taabo guriga aad rabto inaad aragto.\n2. Riix batoonka 'Ballan Ka Samayso Booqashada'.\n3. Dooro Taariikhda, Waqtiga (Subax, Galab, Habeen), iyo Nooca booqashada (In-Person ama Live Video Call Tour).\n4. La soco ballamahaaga qaybta **📅 Booqasho (Tours)** ee navigation bar-ka hoose.`;
        } else if (lang === 'ar') {
          botReply = `📅 حجز موعد معاينة منزل (House Viewing Tour):\n\n١. اختر المنزل الذي ترغب في زيارته.\n٢. اضغط على زر 'حجز موعد معاينة'.\n٣. حدد التاريخ، الوقت (صباحاً، عصراً، مساءً)، ونوع المعاينة (حضورية أو عبر فيديو مباشر).\n٤. يمكنك متابعة مواعيدك في تبويب **📅 زيارات (Tours)** بأسفل الشاشة.`;
        } else {
          botReply = `📅 Scheduling a House Viewing Tour:\n\n1. Pick the house you want to inspect.\n2. Click 'Book Viewing Tour'.\n3. Choose your Date, Time Slot (Morning, Afternoon, Evening), and Tour Type (In-Person or Live Video Call Tour).\n4. Manage all your appointments under the **📅 Tours** tab at the bottom bar.`;
        }
        break;
      }

      case 'PaymentIntent': {
        if (lang === 'so') {
          botReply = `Nidaamka GoobJoog hadda wuxuu diiradda saarayaa Ballanta Booqashada Guryaha (House Viewing Tours) iyo xiriirinta tooska ah ee Mulkiilaha:\n\n1. Dooro guriga aad xiisaynayso.\n2. Riix 'Ballan Ka Samayso Booqashada' si aad u doorato taariikhda & waqtiga.\n3. Marka mulkiiluhu ansixiyo, toos ayaad u kireysan kartaa iyadoo lagula xiriirayo WhatsApp/Phone.`;
        } else if (lang === 'ar') {
          botReply = `يركز نظام GoobJoog الآن على حجز مواعيد معاينة العقارات (House Tours) والتواصل المباشر مع المالك:\n\n١. اختر العقار الذي يعجبك.\n٢. اضغط على 'حجز موعد معاينة' وتحديد التاريخ والوقت المناسب.\n٣. بعد موافقة المالك، يتم التواصل المباشر معك عبر الواتساب أو الهاتف للاتفاق.`;
        } else {
          botReply = `GoobJoog platform focuses on direct House Viewing Tours and instant landlord communication:\n\n1. Select any property you like.\n2. Click 'Book Viewing Tour' to schedule a date & time slot.\n3. Once confirmed, you can inspect the house or communicate directly via WhatsApp/Phone.`;
        }
        break;
      }

      case 'LandlordUpgradeIntent': {
        if (lang === 'so') {
          botReply = `Ma doonaysaa inaad guryahaaga kireyso oo aad dakhli fiican hesho? 🏡\n\nFaa'iidooyinka Mulkiilaha:\n• Diiwaangeli guryo aan xad lahayn oo geli sawirro & GPS\n• Toos ugu hel lacagta kirada xisaabtaada Hormuud/Telesom\n• Aqbal ama diid codsiyada kireystayaasha adigoo hal gujinaya.\n\nGuji batoonka hoose si aad u codsato dalacsiinta mulkiilaha:`;
        } else if (lang === 'ar') {
          botReply = `هل تمتلك عقارات وترغب في إدراجها وتلقي الإيجار مباشرة؟ 🏡\n\nمزايا حساب مالك العقار:\n• إدراج عدد غير محدود من المنازل والشقق مع صور وإحداثيات GPS\n• استلام مبالغ الإيجار شهرياً مباشرة على محفظتك بدون تأخير\n• قبول أو رفض طلبات المستأجرين بنقرة واحدة وإدارة العقود.\n\nاضغط على الزر أدناه للتقدم بطلب ترقية الحساب:`;
        } else {
          botReply = `Looking to list properties and earn steady rental income? 🏡\n\nLandlord Benefits:\n• List unlimited properties with photo uploads & GPS location\n• Receive rent payouts directly to your mobile wallet\n• Review, approve, or decline tenant applications instantly.\n\nClick the button below to apply for a landlord account:`;
        }
        if (onUpgradeToLandlord) {
          actions.push({
            label: t.applyLandlordBtn,
            onClick: onUpgradeToLandlord
          });
        }
        break;
      }

      case 'TrackApplicationIntent': {
        const myApps = applications.filter(a => a.tenantId === currentUser.id || a.tenantPhone === currentUser.phone);
        if (lang === 'so') {
          botReply = `Waxaad leedahay **${myApps.length}** codsi kireysi:\n• ${myApps.filter(a => a.status === 'approved').length} La Oggolaaday\n• ${myApps.filter(a => a.status === 'pending').length} Sugaya\n• ${myApps.filter(a => a.status === 'rejected').length} La Diiday\n\nWaxaad ka eegi kartaa xaaladda oo buuxda qaybta Codsiyada (Applications).`;
        } else if (lang === 'ar') {
          botReply = `لديك حالياً **${myApps.length}** طلبات استئجار في النظام:\n• ${myApps.filter(a => a.status === 'approved').length} تمت الموافقة عليها\n• ${myApps.filter(a => a.status === 'pending').length} قيد المراجعة والانتظار\n• ${myApps.filter(a => a.status === 'rejected').length} تم رفضها\n\nيمكنك مراجعة جميع التفاصيل ومواعيد البدء في تبويب طلباتي.`;
        } else {
          botReply = `You have **${myApps.length}** rental applications in the system:\n• ${myApps.filter(a => a.status === 'approved').length} Approved\n• ${myApps.filter(a => a.status === 'pending').length} Pending\n• ${myApps.filter(a => a.status === 'rejected').length} Declined\n\nYou can track all your leases under the Applications tab.`;
        }
        break;
      }

      case 'ComplaintIntent': {
        if (lang === 'so') {
          botReply = `Waan ka xunnahay dhibaatada ama ciladda kugu timid! 🛠️\n\nSi aad u gudbiso tabasho ama codsi dayactir:\n1. Guji gurigaaga aad kireysatay.\n2. Riix batoonka 'Gudbi Tabasho / Report Issue'.\n3. Qor faahfaahinta ciladda (biyo, koronto, amni).\n\nMaamulka iyo mulkiiluhu waxay ku heli doonaan degdeg si loo xalliyo.`;
        } else if (lang === 'ar') {
          botReply = `نعتذر عن أي مشكلة أو عطل صيانة واجهته في العقار! 🛠️\n\nلتقديم بلاغ صيانة أو شكوى رسمية:\n١. افتح تفاصيل العقار الذي تقيم فيه.\n٢. اضغط على زر 'الإبلاغ عن شكوى / Report Issue'.\n٣. اكتب تفاصيل المشكلة (ماء، كهرباء، تسريب، أمان).\n\nسيتم إشعار إدارة النظام والمالك فوراً للتدخل وحل المشكلة.`;
        } else {
          botReply = `We apologize for any maintenance or facility issue you are facing! 🛠️\n\nTo file a maintenance ticket:\n1. Open your rented property details.\n2. Click 'Report Issue'.\n3. Describe the problem (water, power, plumbing).\n\nThe admin team and landlord will be notified immediately to resolve it.`;
        }
        break;
      }

      case 'DepositSecurityIntent': {
        if (lang === 'so') {
          botReply = `Amniga iyo Lacag Dhigaalka GoobJoog:\n\n• **Lacagta Dhigaalka (Deposit)**: Waa lacag damaanad ah oo aad dib u helayso marka aad guriga ka guurto iyadoo xaaladdiisu hagaagsan tahay.\n• **Kharashka Nidaamka**: Nidaamku wuxuu qaataa 10% komishan ah maamulka iyo xaqiijinta.\n• **Ilaalinta Xogta**: Lacagtaada iyo heshiisyadaada waxaa lagu ilaaliyaa hab sir ah oo casri ah.`;
        } else if (lang === 'ar') {
          botReply = `الضمانات المالية والأمان في GoobJoog:\n\n• **مبلغ التأمين (Deposit)**: هو مبلغ مسترد بالكامل عند انتهاء عقد الإيجار وتسليم العقار بحالته السليمة.\n• **عمولة النظام**: تحسم عمولة النظام (١٠٪) من مالك العقار لإدارة ومطابقة الحسابات.\n• **أمان المدفوعات**: جميع التحويلات المالية مشفرة وتتم إدارتها عبر بروتوكولات آمنة مع شركات الاتصالات.`;
        } else {
          botReply = `Security Deposit & Platform Guarantee:\n\n• **Security Deposit**: Fully refundable at the end of the tenancy upon property inspection.\n• **Platform Commission**: Standard 10% fee applied for ledger reconciliation & property verification.\n• **Financial Security**: All mobile transactions are encrypted directly with telecom networks.`;
        }
        break;
      }

      case 'SettingsIntent': {
        if (lang === 'so') {
          botReply = `Waxaad ka beddeli kartaa Qalabeynta akoonkaaga:\n• Beddelka Furaha Sirta ah & Biometrics\n• Doorashada Luuqadda (Carabi, Soomaali, Ingiriis)\n• Habka Madow (Dark Mode) iyo Ifka (Light Mode).\n\nGuji batoonka hoose si aad u furto Qalabeynta:`;
        } else if (lang === 'ar') {
          botReply = `يمكنك التحكم الكامل في إعدادات حسابك:\n• تغيير كلمة المرور وتفعيل البصمة البيومترية\n• تبديل لغة النظام (العربية، الصومالية، الإنجليزية)\n• التبديل بين الوضع الداكن والفاتح وتحديث البيانات الشخصية.\n\nاضغط على الزر أدناه لفتح صفحة الإعدادات:`;
        } else {
          botReply = `You can customize your account preferences:\n• Password & Biometric updates\n• System Language (Arabic, Somali, English)\n• Dark & Light theme modes.\n\nClick the button below to open Settings:`;
        }
        if (onOpenSettings) {
          actions.push({
            label: t.settings,
            onClick: onOpenSettings
          });
        }
        break;
      }

      default: {
        matchedHouses = houses.filter(h => h.status === 'available').slice(0, 3);
        if (lang === 'so') {
          botReply = `Waad ku mahadsan tahay su'aashaada! Waxaan kaa caawin karaa raadinta guryaha, bixinta kirada EVC/Zaad/Sahal, ama maareynta akoonkaaga.\n\nHalkan waxaa kuugu jira guryaha ugu caansan ee hadda diyaar ah:`;
        } else if (lang === 'ar') {
          botReply = `شكراً لتواصلك! يمكنني مساعدتك في استكشاف العقارات، سداد الإيجار عبر EVC/Zaad/Sahal، أو ترقية حسابك وإدارة الإعدادات.\n\nإليك بعضاً من أفضل العقارات المتاحة حالياً للإيجار:`;
        } else {
          botReply = `Thank you for your inquiry! I can assist you with property search, mobile money rent payments, and account preferences.\n\nHere are some of the top available listings right now:`;
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

  const suggestionChips = [
    lang === 'so' ? '📅 Ballan Booqasho' : lang === 'ar' ? '📅 حجز معاينة' : '📅 Book Viewing Tour',
    lang === 'so' ? '📍 Guryaha Baydhabo' : lang === 'ar' ? '📍 بيوت بيدوا' : '📍 Baidoa Homes',
    lang === 'so' ? '🏠 Guri Jaban' : lang === 'ar' ? '🏠 بيت رخيص' : '🏠 Affordable House',
    lang === 'so' ? '🏡 Noqo Mulkiile' : lang === 'ar' ? '🏡 ترقية كمالك' : '🏡 Become Landlord'
  ];

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
          className={`fixed bottom-20 lg:bottom-6 ${isArabic ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 w-[92vw] sm:w-96 h-[530px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp`}
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
            {suggestionChips.map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue(sug.replace(/^[^\s]+\s/, ''));
                }}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 shrink-0 transition active:scale-95"
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
                  className={`max-w-[88%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/50 dark:border-slate-700'
                  }`}
                  dir={isArabic ? 'rtl' : 'ltr'}
                >
                  {msg.text}
                </div>

                {/* Property Recommendation Cards in Chat */}
                {msg.houses && msg.houses.length > 0 && (
                  <div className="w-full space-y-2 mt-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    {msg.houses.map(h => (
                      <div
                        key={h.id}
                        onClick={() => onViewHouse && onViewHouse(h.id)}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 cursor-pointer flex gap-2.5 transition group"
                      >
                        <img src={h.imageUrl} alt={getHouseTitle(h)} className="w-14 h-14 rounded-lg object-cover group-hover:scale-105 transition shrink-0" />
                        <div className="flex-1 flex flex-col justify-between overflow-hidden">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px] block line-clamp-1 group-hover:text-blue-600 transition">
                              {getHouseTitle(h)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              📍 {getCityName(h.city)} • {formatNumber(h.roomsCount)} {t.rooms}
                            </span>
                          </div>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-black">
                            ${formatNumber(h.pricePerMonth)} <span className="text-[9px] font-normal text-slate-400">{t.perMonth}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    {msg.actions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={act.onClick}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-xl shadow transition active:scale-95"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[8px] text-slate-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2" dir={isArabic ? 'rtl' : 'ltr'}>
            <input
              type="text"
              placeholder={t.aiInputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className={`flex-1 px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100 ${
                isArabic ? 'text-right' : 'text-left'
              }`}
            />
            <button
              onClick={handleSend}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition active:scale-95"
              aria-label={t.submit}
            >
              <Send size={15} className={isArabic ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
