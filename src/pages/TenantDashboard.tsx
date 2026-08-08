import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Home, DollarSign, User, Percent, 
  Clock, Check, X, Plus, Trash2, Heart, 
  Download, Smartphone, CheckCircle2, RefreshCw, MessageSquare, Navigation
} from 'lucide-react';
import type { House, Application, Transaction, Complaint, UserProfile } from '../domain/entities';
import { PaymentStatus, UserRole } from '../domain/enums';
import { SomaliMap } from '../components/SomaliMap';
import { translations } from '../lib/translations';

interface TenantDashboardProps {
  houses: House[];
  applications: Application[];
  transactions: Transaction[];
  favorites: string[];
  currentTenant: UserProfile;
  onApply: (house: House, e: React.FormEvent) => void;
  onCancelApplication: (appId: string) => void;
  onToggleFavorite: (houseId: string, e: React.MouseEvent) => void;
  onAddReview: (houseId: string, rating: number, comment: string) => void;
  onAddComplaint: (houseId: string, title: string, details: string) => void;
  onPaymentCreate: (tx: Transaction) => void;
  onPaymentProcess: (txId: string) => void;
  onPaymentComplete: (txId: string, isSuccess: boolean, reason?: string, telecomRef?: string) => void;
  addAuditLog: (action: string, details: string) => void;
  lang: 'en' | 'so' | 'ar';
  activeLayout: 'tenant' | 'homeowner' | 'accountant' | 'administrator';
  setActiveLayout: (layout: 'tenant' | 'homeowner' | 'accountant' | 'administrator') => void;
  onUpgradeToLandlord: () => void;
  selectedHouse: House | null;
  setSelectedHouse: (house: House | null) => void;
  onOpenSettings?: () => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  houses,
  applications,
  transactions,
  favorites,
  currentTenant,
  onApply,
  onCancelApplication,
  onToggleFavorite,
  onAddReview,
  onAddComplaint,
  onPaymentCreate,
  onPaymentProcess,
  onPaymentComplete,
  addAuditLog,
  lang,
  activeLayout,
  setActiveLayout,
  onUpgradeToLandlord,
  selectedHouse,
  setSelectedHouse,
  onOpenSettings
}) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  // Localized Format Helpers
  const formatNumber = (num: number, decimals: number = 0) => {
    const options = decimals > 0 ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : {};
    if (lang === 'ar') {
      return new Intl.NumberFormat('ar-SA', options).format(num);
    }
    return new Intl.NumberFormat('en-US', options).format(num);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const locale = lang === 'ar' ? 'ar-SA' : lang === 'so' ? 'so-SO' : 'en-US';
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
    } catch (e) {
      return dateStr;
    }
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

  const getHouseDescription = (house: House | null | undefined): string => {
    if (!house) return '';
    if (lang === 'ar') {
      if (house.id === 'h1') return 'فيلا راقية ٤ غرف نوم مع حراسة أمنية ممتازة بالقرب من شارع المطار وشارع مكة المكرمة.';
      if (house.id === 'h2') return 'شقة مريحة غرفتي نوم مع ماء نقي وكهرباء بالطاقة الشمسية على مدار ٢٤ ساعة.';
      if (house.id === 'h3') return 'مسكن مثالي للعائلات الكبيرة في حي هودمان الهادئ في غاروي. يشمل شبكة فايبر سريعة وخزان مياه احتياطي.';
      if (house.id === 'h4') return 'بناء صومالي تقليدي مميز مع نسيم بحري عليل وتدفق مياه مستمر بالقرب من مركز علنلي والشاطئ.';
      if (house.id === 'h5') return 'منزل عائلي تم تجديده حديثاً في حي إسحا السكني الهادئ في بيدوا مع موقف سيارات آمن وواي فاي.';
      if (house.id === 'h6') return 'فيلا جميلة ومؤمنة في حي هودان بمقديشو مع كهرباء احتياطية ومياه متوفرة باستمرار.';
    } else if (lang === 'so') {
      if (house.id === 'h1') return 'Villa 4 qol ah oo aad u qurux badan, amni la isku halleyn karo, una dhaw waddada KM4 iyo Maka Al-Mukarama.';
      if (house.id === 'h2') return 'Dabaq waasac ah oo 2 qol ah oo leh biyo joogto ah iyo koronto ku shaqeysa cadceedda.';
      if (house.id === 'h3') return 'Guri aad ugu habboon qoysaska ballaaran oo ku yaala degmada deggan ee Hodman ee Garoowe.';
      if (house.id === 'h4') return 'Guri qaab-dhismeed dhaqameed qurux badan, neecawda badda, iyo biyo joogto ah oo ku yaala Calanley, Kismaayo.';
      if (house.id === 'h5') return 'Guri qoys oo dhawaan la dayactiray oo ku yaala aagga deggan ee Isha, Baydhabo.';
      if (house.id === 'h6') return 'Guri aad u qurux badan oo ku yaala degmada Hodan ee Muqdisho oo leh amni buuxa.';
    }
    return house.description;
  };

  // Navigation / Filter States
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'apps' | 'saved' | 'payments' | 'profile'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterPrice, setFilterPrice] = useState(700);
  const [filterRooms, setFilterRooms] = useState('all');

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedHouse]);
  
  // Checkout flow states (USSD Simulation)
  const [checkoutApp, setCheckoutApp] = useState<Application | null>(null);
  const [paymentPhone, setPaymentPhone] = useState(currentTenant.phone);
  const [paymentGateway, setPaymentGateway] = useState<'evc_plus' | 'zaad' | 'sahal'>('evc_plus');
  const [showPhoneSimulator, setShowPhoneSimulator] = useState(false);
  const [phoneScreenState, setPhoneScreenState] = useState<'prompt' | 'processing' | 'success' | 'failed'>('prompt');
  const [enteredPin, setEnteredPin] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Rating and review states
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const [newComplaintTitle, setNewComplaintTitle] = useState('');
  const [newComplaintDetails, setNewComplaintDetails] = useState('');
  const [newComplaintHouseId, setNewComplaintHouseId] = useState('');
  const [copiedUSSD, setCopiedUSSD] = useState(false);

  const getUSSDCode = () => {
    if (!checkoutApp) return '';
    const house = houses.find(h => h.id === checkoutApp.houseId);
    if (!house) return '';
    const landlordPhone = house.landlordPhone.replace(/\+/g, '').replace(/\s/g, '').trim();
    if (paymentGateway === 'evc_plus') {
      return `*712*${landlordPhone}*${house.pricePerMonth}#`;
    } else if (paymentGateway === 'zaad') {
      return `*212*3*${landlordPhone}*${house.pricePerMonth}#`;
    } else { // Sahal
      return `*912*${landlordPhone}*${house.pricePerMonth}#`;
    }
  };

  const handleCopyUSSD = () => {
    const code = getUSSDCode();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedUSSD(true);
      setTimeout(() => setCopiedUSSD(false), 2000);
      addAuditLog('USSD_COPY', `Tenant copied dial command: ${code}`);
    }
  };

  // Calculations
  const cityCounts = React.useMemo(() => {
    const counts: Record<string, number> = { Mogadishu: 0, Hargeisa: 0, Garowe: 0, Kismayo: 0 };
    houses.forEach(h => {
      if (h.status === 'available') {
        counts[h.city] = (counts[h.city] || 0) + 1;
      }
    });
    return counts;
  }, [houses]);

  const filteredHouses = houses.filter(house => {
    const matchesSearch = house.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          house.district.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          house.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity ? house.city.toLowerCase() === filterCity.toLowerCase() : true;
    const matchesPrice = house.pricePerMonth <= filterPrice;
    const matchesRooms = filterRooms === 'all' ? true : house.roomsCount === parseInt(filterRooms);
    const isAvailable = house.status === 'available';
    
    return matchesSearch && matchesCity && matchesPrice && matchesRooms && isAvailable;
  });

  const handleApplyWrapper = (house: House, e: React.FormEvent) => {
    onApply(house, e);
    setSelectedHouse(null);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse) return;
    onAddReview(selectedHouse.id, ratingVal, ratingComment);
    if (selectedHouse) {
      setSelectedHouse({
        ...selectedHouse,
        ratingSum: selectedHouse.ratingSum + ratingVal,
        ratingCount: selectedHouse.ratingCount + 1,
        reviews: [{ author: currentTenant.fullName, rating: ratingVal, comment: ratingComment, date: new Date().toISOString().split('T')[0] }, ...selectedHouse.reviews]
      });
    }
    setRatingComment('');
    alert(lang === 'so' ? 'Waad ku mahadsan tahay qiimeyntaada!' : lang === 'ar' ? 'شكراً لك على تقييمك!' : 'Thank you for your rating!');
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaintHouseId || !newComplaintTitle || !newComplaintDetails) {
      alert(t.fillRequiredMsg);
      return;
    }
    onAddComplaint(newComplaintHouseId, newComplaintTitle, newComplaintDetails);
    setNewComplaintTitle('');
    setNewComplaintDetails('');
    setNewComplaintHouseId('');
    alert(lang === 'so' ? 'Cabashadaada waa la gudbiyey waana lala soconayaa.' : lang === 'ar' ? 'تم إرسال الشكوى الرسمية ومتابعتها مع الإدارة.' : 'Your complaint has been submitted and escalated to support.');
  };

  const triggerPaymentFlow = (app: Application) => {
    setCheckoutApp(app);
    setPaymentPhone(currentTenant.phone);
    setPhoneScreenState('prompt');
    setEnteredPin('');
    setShowPhoneSimulator(true);
  };

  const closePhoneSimulator = () => {
    setShowPhoneSimulator(false);
    setCheckoutApp(null);
  };

  const handleKeypadPress = (num: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + num);
    }
  };

  const handleKeypadDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const submitUSSDPayment = () => {
    if (enteredPin.length < 4) {
      alert(lang === 'so' ? 'Fadlan geli 4 lambar oo PIN ah.' : lang === 'ar' ? 'يرجى إدخال رمز سري مكون من ٤ أرقام.' : 'Please enter a 4-digit PIN.');
      return;
    }
    
    const house = houses.find(h => h.id === checkoutApp?.houseId);
    if (!house || !checkoutApp) return;

    const amount = house.pricePerMonth;
    const comm = parseFloat((amount * 0.1).toFixed(2));
    const payout = parseFloat((amount * 0.9).toFixed(2));
    const txId = 'tx-' + Math.random().toString(36).substr(2, 9);
    
    const newTx: Transaction = {
      id: txId,
      tenantPhone: paymentPhone,
      landlordName: house.landlordName,
      houseTitle: house.title,
      amountTotal: amount,
      commissionAmount: comm,
      payoutAmount: payout,
      currency: 'USD',
      paymentMethod: paymentGateway === 'evc_plus' ? 'evc_plus' : paymentGateway === 'zaad' ? 'zaad' : 'sahal',
      paymentStatus: PaymentStatus.Pending,
      requestTime: new Date().toISOString(),
      rentalObligationId: checkoutApp.id,
      obligationType: 'Application',
      date: new Date().toISOString(),
      verified: false
    };

    onPaymentCreate(newTx);
    onPaymentProcess(txId);
    setPhoneScreenState('processing');
    
    setTimeout(() => {
      const isSuccess = enteredPin === '1234' || enteredPin === '4321';
      
      if (isSuccess) {
        const refPrefix = paymentGateway === 'evc_plus' ? 'WAAFI-EVC' : paymentGateway === 'zaad' ? 'TX-ZAAD' : 'GOLIS-SHL';
        const reference = `${refPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;

        onPaymentComplete(txId, true, undefined, reference);
        setTransactionRef(reference);
        setPhoneScreenState('success');
      } else {
        onPaymentComplete(txId, false, lang === 'so' ? 'Furaha PIN-ka waa khalad' : lang === 'ar' ? 'رمز السداد غير صحيح' : 'Invalid PIN');
        setPhoneScreenState('failed');
      }
    }, 1800);
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

  return (
    <div className="relative min-h-screen pb-28 lg:pb-12 bg-slate-50 dark:bg-slate-950 transition-colors" dir={isArabic ? 'rtl' : 'ltr'}>
      
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SEARCH PANEL & LISTINGS */}
        <div className={`lg:col-span-8 flex-col gap-6 ${['home', 'search'].includes(activeTab) ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* QUICK ACTIONS BAR (Mobile Home) */}
        <div className={`grid grid-cols-4 gap-2 lg:hidden ${activeTab === 'home' ? 'flex' : 'hidden'}`}>
          <button onClick={() => setActiveTab('search')} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition">
            <Search size={20} className="text-blue-600" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">{t.search}</span>
          </button>
          <button onClick={() => setActiveTab('apps')} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">{t.navApplications}</span>
          </button>
          <button onClick={() => setActiveTab('payments')} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition">
            <DollarSign size={20} className="text-blue-600" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">{t.navPayments}</span>
          </button>
          <button onClick={onUpgradeToLandlord} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition">
            <Home size={20} className="text-amber-500" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">{t.navLandlord}</span>
          </button>
        </div>

        {/* TOP BAR SEARCH CONTROLS */}
        <div className={`glass-panel p-5 rounded-2xl shadow-sm flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${activeTab === 'search' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {lang === 'so' ? 'Raadi Gurigaaga Xiga' : lang === 'ar' ? 'ابحث عن منزلك القادم' : 'Find Your Next Home'}
            </h2>
            <button onClick={() => setActiveTab('home')} className="lg:hidden p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
              <X size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Keyword */}
            <div className="md:col-span-5 relative">
              <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-2.5 text-slate-400`} size={16} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isArabic ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100`}
              />
            </div>

            {/* City Select */}
            <div className="md:col-span-3">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
              >
                <option value="">{t.allCities}</option>
                <option value="Mogadishu">{getCityName('Mogadishu')}</option>
                <option value="Hargeisa">{getCityName('Hargeisa')}</option>
                <option value="Garowe">{getCityName('Garowe')}</option>
                <option value="Kismayo">{getCityName('Kismayo')}</option>
                <option value="Baidoa">{getCityName('Baidoa')}</option>
                <option value="Galkayo">{getCityName('Galkayo')}</option>
                <option value="Bosaso">{getCityName('Bosaso')}</option>
                <option value="Burao">{getCityName('Burao')}</option>
                <option value="Beledweyne">{getCityName('Beledweyne')}</option>
                <option value="Dhusamareb">{getCityName('Dhusamareb')}</option>
                <option value="Jowhar">{getCityName('Jowhar')}</option>
                <option value="Berbera">{getCityName('Berbera')}</option>
              </select>
            </div>

            {/* Rooms Select */}
            <div className="md:col-span-2">
              <select
                value={filterRooms}
                onChange={(e) => setFilterRooms(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
              >
                <option value="all">{t.anyBed}</option>
                <option value="1">{t.bed1}</option>
                <option value="2">{t.bed2}</option>
                <option value="3">{t.bed3}</option>
                <option value="4">{t.bed4}</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCity('');
                  setFilterPrice(700);
                  setFilterRooms('all');
                }}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 rounded-xl transition"
              >
                {t.clear}
              </button>
            </div>
          </div>

          {/* Price Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">{t.maxMonthlyRent}</span>
              <span className="font-bold text-blue-600">${formatNumber(filterPrice)} {t.perMonth}</span>
            </div>
            <input
              type="range"
              min="150"
              max="800"
              step="20"
              value={filterPrice}
              onChange={(e) => setFilterPrice(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* LISTINGS CONTAINER */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'so' ? `Guryaha Diyaarka ah (${formatNumber(filteredHouses.length)})` :
               lang === 'ar' ? `العقارات المتاحة (${formatNumber(filteredHouses.length)})` :
               `Available Listings (${filteredHouses.length})`}
            </h3>
            {filterCity && (
              <span className="text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium animate-fade-in">
                {t.availablePropertiesIn} {getCityName(filterCity)}
              </span>
            )}
          </div>

          {filteredHouses.length === 0 ? (
            <div className="glass-panel text-center py-16 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 shadow-sm">
              <Home className="text-slate-300" size={48} />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">{t.noHousesFound}</h3>
              <p className="text-xs text-slate-500 max-w-sm">{t.tryClearingFilters}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHouses.map((house) => {
                const avgRating = house.ratingCount > 0 
                  ? formatNumber(parseFloat((house.ratingSum / house.ratingCount).toFixed(1)), 1) 
                  : (lang === 'ar' ? 'جديد' : lang === 'so' ? 'Cusub' : 'New');
                const isFavorited = favorites.includes(house.id);
                return (
                  <div
                    key={house.id}
                    onClick={() => setSelectedHouse(house)}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover-lift shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={house.imageUrl}
                        alt={getHouseTitle(house)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      <div className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} flex flex-col gap-1.5 items-start`}>
                        <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                          ✓ {t.verified}
                        </span>
                      </div>

                      <div className={`absolute top-3 ${isArabic ? 'left-3' : 'right-3'} flex flex-col gap-1.5 items-end`}>
                        <div className="bg-white/95 text-slate-800 dark:bg-slate-900 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <MapPin size={9} className="text-blue-600" />
                          {getCityName(house.city)}
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => onToggleFavorite(house.id, e)}
                        className={`absolute bottom-3 ${isArabic ? 'left-3' : 'right-3'} p-2 rounded-full shadow-md backdrop-blur-md transition active:scale-90 ${
                          isFavorited ? 'bg-rose-500 text-white' : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 hover:text-rose-500'
                        }`}
                        aria-label="Save Favorite"
                      >
                        <Heart size={14} className={isFavorited ? 'fill-current' : ''} />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-blue-600 transition ${isArabic ? 'text-right' : 'text-left'}`}>
                            {getHouseTitle(house)}
                          </h4>
                        </div>
                        <p className={`text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed ${isArabic ? 'text-right' : 'text-left'}`}>
                          {getHouseDescription(house)}
                        </p>
                      </div>

                      {/* Infrastructure Tags */}
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {house.facilities.water_24_7 && (
                          <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            💧 {t.water}
                          </span>
                        )}
                        {house.facilities.wifi && (
                          <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            📶 {t.wifi}
                          </span>
                        )}
                        {house.facilities.parking && (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            🚗 {t.parking}
                          </span>
                        )}
                      </div>

                      {/* Pricing & Actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 font-medium block">{t.monthlyRentField}</span>
                          <span className="text-base font-black text-blue-600">
                            ${formatNumber(house.pricePerMonth)} <span className="text-[10px] font-normal text-slate-400">{t.perMonth}</span>
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">
                            {formatNumber(house.roomsCount)} {t.rooms} • {formatNumber(house.bathroomsCount)} {t.bathrooms}
                          </span>
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 justify-end">
                            ⭐ {avgRating} ({formatNumber(house.ratingCount)})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        </div>

        {/* RIGHT INTERACTIVE SOMALI MAP & PROMOTION PANEL */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Somali Interactive Geographic Map */}
          <div className="h-[420px] rounded-2xl overflow-hidden shadow-sm">
            <SomaliMap
              selectedCity={filterCity}
              onSelectCity={(city) => {
                setFilterCity(city === filterCity ? '' : city);
                setActiveTab('search');
              }}
              cityCounts={cityCounts}
              lang={lang}
            />
          </div>

          {/* Landlord Promotion or Switcher Banner */}
          {(currentTenant.roles || []).includes('homeowner') || (currentTenant.roles || []).includes('landlord' as any) ? (
            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider">🏡 {t.switchLandlordMode}</h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                {t.switchLandlordSub}
              </p>
              <button
                onClick={() => setActiveLayout('homeowner')}
                className="w-full py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow transition active:scale-95"
              >
                💼 {t.switchLandlordMode}
              </button>
            </div>
          ) : currentTenant.upgradeStatus === 'pending' ? (
            <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-2xl shadow-sm space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <span>⏳</span> {t.upgradePendingBanner}
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {t.upgradePendingSub}
              </p>
            </div>
          ) : (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                🌟 {t.landlordBannerTitle}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.landlordBannerSub}
              </p>
              <button
                onClick={() => {
                  onUpgradeToLandlord();
                  alert(lang === 'so' ? 'Codsigaagii waa la gudbiyey! Maamulaha ayaa eegaya.' : lang === 'ar' ? 'تم إرسال طلب الترقية للمسؤول للمراجعة.' : 'Upgrade request submitted to Admin.');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
              >
                ⚡ {t.applyLandlordBtn}
              </button>
            </div>
          )}

        </div>

        </div>

      </div>

      {/* HOUSE DETAILS MODAL */}
      {selectedHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            
            <button
              onClick={() => setSelectedHouse(null)}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              <X size={20} />
            </button>

            {/* Photo & Title Header */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedHouse.imageUrl}
                alt={selectedHouse.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/70 backdrop-blur-md p-3 rounded-xl text-white flex justify-between items-center" dir={isArabic ? 'rtl' : 'ltr'}>
                <div>
                  <h3 className="text-base font-bold">{getHouseTitle(selectedHouse)}</h3>
                  <span className="text-xs text-slate-300">{selectedHouse.district}, {getCityName(selectedHouse.city)}</span>
                </div>
                <div className={isArabic ? 'text-left' : 'text-right'}>
                  <span className="text-xl font-black text-emerald-400">${formatNumber(selectedHouse.pricePerMonth)}</span>
                  <span className="text-[10px] text-slate-300 block">{t.perMonth}</span>
                </div>
              </div>
            </div>

            {/* Description & Specifications */}
            <div className="space-y-3" dir={isArabic ? 'rtl' : 'ltr'}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.propertyDescriptionField}</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {getHouseDescription(selectedHouse)}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <span className="text-xs text-slate-400 block">{t.rooms}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(selectedHouse.roomsCount)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <span className="text-xs text-slate-400 block">{t.bathrooms}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(selectedHouse.bathroomsCount)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <span className="text-xs text-slate-400 block">{t.deposit}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${formatNumber(selectedHouse.depositAmount)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <span className="text-xs text-slate-400 block">{t.status}</span>
                  <span className="font-bold text-emerald-600">{t.available}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Apply, WhatsApp, Complaint */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={(e) => handleApplyWrapper(selectedHouse, e)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                {t.applyNow}
              </button>

              <a
                href={`https://wa.me/${selectedHouse.landlordPhone.replace(/\+/g, '')}?text=${encodeURIComponent(
                  lang === 'so' 
                    ? `Asc Mulkiile, waxaan xiiseynayaa gurigaaga: ${selectedHouse.title} ee ku yaal ${selectedHouse.city}.` 
                    : lang === 'ar' 
                    ? `مرحباً، أنا مهتم باستئجار عقارك: ${selectedHouse.title} في ${getCityName(selectedHouse.city)}.` 
                    : `Hello, I am interested in renting your property: ${selectedHouse.title} in ${selectedHouse.city}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setNewComplaintHouseId(selectedHouse.id);
                  setNewComplaintTitle(`Issue regarding ${selectedHouse.title}`);
                }}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
              >
                {t.reportIssueBtn}
              </button>
            </div>

            {/* Write Review Section */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{t.writeReview}</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{t.ratingLabel}:</span>
                  <select
                    value={ratingVal}
                    onChange={(e) => setRatingVal(parseInt(e.target.value))}
                    className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={1}>⭐ (1)</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder={t.reviewCommentLabel}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                >
                  {t.submitReviewBtn}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* COMPLAINT SUBMISSION MODAL */}
      {newComplaintHouseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setNewComplaintHouseId('')}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.reportIssueBtn}</h3>
            
            <form onSubmit={handleComplaintSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.complaintTitleLabel}</label>
                <input
                  type="text"
                  value={newComplaintTitle}
                  onChange={(e) => setNewComplaintTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.complaintDetailsLabel}</label>
                <textarea
                  rows={3}
                  value={newComplaintDetails}
                  onChange={(e) => setNewComplaintDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                {t.submitComplaintBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USSD CHECKOUT & PHONE SIMULATOR MODAL */}
      {showPhoneSimulator && checkoutApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            
            <button
              onClick={closePhoneSimulator}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.ussdCheckoutTitle}</h3>

            {/* Gateway Selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentGateway('evc_plus')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                  paymentGateway === 'evc_plus' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.evcPlus}
              </button>
              <button
                onClick={() => setPaymentGateway('zaad')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                  paymentGateway === 'zaad' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.zaad}
              </button>
              <button
                onClick={() => setPaymentGateway('sahal')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                  paymentGateway === 'sahal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.sahal}
              </button>
            </div>

            {/* USSD Dial Code Display */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{t.dialUssdCommand}</span>
                <code className="text-xs font-bold text-blue-600">{getUSSDCode()}</code>
              </div>
              <button
                onClick={handleCopyUSSD}
                className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow transition"
              >
                {copiedUSSD ? t.copied : t.copy}
              </button>
            </div>

            {/* Phone Screen Simulated State */}
            {phoneScreenState === 'prompt' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{t.enterPinPrompt}</p>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-lg font-bold"
                    >
                      {enteredPin[i] ? '•' : ''}
                    </div>
                  ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        if (k === 'C') setEnteredPin('');
                        else if (k === '⌫') handleKeypadDelete();
                        else handleKeypadPress(k);
                      }}
                      className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-xl transition active:scale-95"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <button
                  onClick={submitUSSDPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {t.confirm} (PIN: 1234)
                </button>
              </div>
            )}

            {phoneScreenState === 'processing' && (
              <div className="py-10 text-center space-y-3">
                <RefreshCw className="animate-spin text-blue-600 mx-auto" size={32} />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.simulatingNetwork}</p>
              </div>
            )}

            {phoneScreenState === 'success' && (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="text-emerald-500 mx-auto" size={48} />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.paymentCompletedSuccess}</h4>
                <span className="text-xs text-slate-400 font-mono block">Ref: {transactionRef}</span>
                <button
                  onClick={closePhoneSimulator}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  {t.gotIt}
                </button>
              </div>
            )}

            {phoneScreenState === 'failed' && (
              <div className="py-6 text-center space-y-3">
                <X className="text-rose-500 mx-auto" size={48} />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.paymentFailedReason}</h4>
                <button
                  onClick={() => setPhoneScreenState('prompt')}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  {t.retryPaymentBtn}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 py-2 px-4 flex justify-between items-center safe-pb shadow-lg" dir={isArabic ? 'rtl' : 'ltr'}>
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Home size={18} />
          <span className="text-[10px] font-bold">{t.navHouses}</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'search' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Search size={18} />
          <span className="text-[10px] font-bold">{t.navExplorer}</span>
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'apps' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <CheckCircle2 size={18} />
          <span className="text-[10px] font-bold">{t.navApplications}</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'payments' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <DollarSign size={18} />
          <span className="text-[10px] font-bold">{t.navPayments}</span>
        </button>

        <button
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            else setActiveTab('profile');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <User size={18} />
          <span className="text-[10px] font-bold">{t.navProfile}</span>
        </button>
      </div>

    </div>
  );
};
