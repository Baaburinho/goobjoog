import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Home, DollarSign, User, Percent, 
  Clock, Check, X, Plus, Trash2, Heart, 
  Download, Smartphone, CheckCircle2, RefreshCw, MessageSquare, Navigation
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
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
  const t = translations[lang];

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
  // Navigation / Filter States
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'apps' | 'saved' | 'payments' | 'profile'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
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
    // Update local selectedHouse rating display
    if (selectedHouse) {
      setSelectedHouse({
        ...selectedHouse,
        ratingSum: selectedHouse.ratingSum + ratingVal,
        ratingCount: selectedHouse.ratingCount + 1,
        reviews: [{ author: currentTenant.fullName, rating: ratingVal, comment: ratingComment, date: new Date().toISOString().split('T')[0] }, ...selectedHouse.reviews]
      });
    }
    setRatingComment('');
    alert("Thank you for your rating!");
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaintHouseId || !newComplaintTitle || !newComplaintDetails) {
      alert("Please fill in all complaint details.");
      return;
    }
    onAddComplaint(newComplaintHouseId, newComplaintTitle, newComplaintDetails);
    setNewComplaintTitle('');
    setNewComplaintDetails('');
    setNewComplaintHouseId('');
    alert("Your complaint has been submitted and escalated to the support desk.");
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
      alert("Please enter a 4-digit PIN.");
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
        onPaymentComplete(txId, false, 'Invalid PIN');
        setPhoneScreenState('failed');
      }
    }, 1800);
  };

  return (
    <div className="relative min-h-screen pb-28 lg:pb-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SEARCH PANEL & LISTINGS */}
        <div className={`lg:col-span-8 flex-col gap-6 ${['home', 'search'].includes(activeTab) ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* QUICK ACTIONS BAR (Mobile Home) */}
        <div className={`grid grid-cols-4 gap-2 lg:hidden ${activeTab === 'home' ? 'flex' : 'hidden'}`}>
          <button onClick={() => setActiveTab('search')} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition">
            <Search size={20} className="text-brand-primary" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Find<br/>Houses</span>
          </button>
          <button onClick={() => setActiveTab('apps')} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">My<br/>Apps</span>
          </button>
          <button onClick={() => setActiveTab('payments')} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition">
            <DollarSign size={20} className="text-blue-600" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Pay<br/>Rent</span>
          </button>
          <button onClick={onUpgradeToLandlord} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition">
            <Home size={20} className="text-amber-500" />
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Post<br/>Property</span>
          </button>
        </div>

        {/* TOP BAR SEARCH CONTROLS */}
        <div className={`glass-panel p-5 rounded-card shadow-sm flex-col gap-4 ${activeTab === 'search' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Find Your Next Home</h2>
            <button onClick={() => setActiveTab('home')} className="lg:hidden p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-500">
              <X size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Keyword */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search district, villa, amenities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {/* City Select */}
            <div className="md:col-span-3">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">{lang === 'so' ? 'Magaalo kasta' : lang === 'ar' ? 'كل المدن' : 'All Cities'}</option>
                <option value="Mogadishu">{lang === 'so' ? 'Muqdisho' : lang === 'ar' ? 'مقديشو' : 'Mogadishu'}</option>
                <option value="Hargeisa">{lang === 'so' ? 'Hargeysa' : lang === 'ar' ? 'هرجيسا' : 'Hargeisa'}</option>
                <option value="Garowe">{lang === 'so' ? 'Garoowe' : lang === 'ar' ? 'غاروي' : 'Garowe'}</option>
                <option value="Kismayo">{lang === 'so' ? 'Kismaayo' : lang === 'ar' ? 'كيسمايو' : 'Kismayo'}</option>
                <option value="Baidoa">{lang === 'so' ? 'Baydhabo' : lang === 'ar' ? 'بيدوا' : 'Baidoa'}</option>
                <option value="Galkayo">{lang === 'so' ? 'Gaalkacayo' : lang === 'ar' ? 'جالكعيو' : 'Galkayo'}</option>
                <option value="Bosaso">{lang === 'so' ? 'Boosaaso' : lang === 'ar' ? 'بوساسو' : 'Bosaso'}</option>
                <option value="Burao">{lang === 'so' ? 'Burco' : lang === 'ar' ? 'برعو' : 'Burao'}</option>
                <option value="Beledweyne">{lang === 'so' ? 'Beledweyne' : lang === 'ar' ? 'بلدوين' : 'Beledweyne'}</option>
                <option value="Dhusamareb">{lang === 'so' ? 'Dhuusamareeb' : lang === 'ar' ? 'دوسمريب' : 'Dhusamareb'}</option>
                <option value="Jowhar">{lang === 'so' ? 'Jowhar' : lang === 'ar' ? 'جوهر' : 'Jowhar'}</option>
                <option value="Berbera">{lang === 'so' ? 'Berbera' : lang === 'ar' ? 'بربرة' : 'Berbera'}</option>
              </select>
            </div>

            {/* Rooms Select */}
            <div className="md:col-span-2">
              <select
                value={filterRooms}
                onChange={(e) => setFilterRooms(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="all">{lang === 'so' ? 'Qol kasta' : lang === 'ar' ? 'أي غرف' : 'Any Bed'}</option>
                <option value="1">{lang === 'so' ? '1 Qol' : lang === 'ar' ? 'غرفة واحدة' : '1 Bed'}</option>
                <option value="2">{lang === 'so' ? '2 Qolal' : lang === 'ar' ? 'غرفتان' : '2 Beds'}</option>
                <option value="3">{lang === 'so' ? '3 Qolal' : lang === 'ar' ? '٣ غرف' : '3 Beds'}</option>
                <option value="4">{lang === 'so' ? '4 Qolal' : lang === 'ar' ? '٤ غرف' : '4 Beds'}</option>
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
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 rounded-input transition"
              >
                {lang === 'so' ? 'Nadiifi' : lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            </div>
          </div>

          {/* Price Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-500 font-medium">{lang === 'so' ? 'Kirada ugu badan (USD)' : lang === 'ar' ? 'الحد الأقصى للإيجار (USD)' : 'Max Monthly Rent (USD)'}</span>
              <span className="font-bold text-brand-primary">${formatNumber(filterPrice)} {lang === 'so' ? '/ bishii' : lang === 'ar' ? '/ شهرياً' : '/ month'}</span>
            </div>
            <input
              type="range"
              min="150"
              max="800"
              step="20"
              value={filterPrice}
              onChange={(e) => setFilterPrice(parseInt(e.target.value))}
              className="w-full accent-brand-primary cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* LISTINGS CONTAINER */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
              Available Listings ({filteredHouses.length})
            </h3>
            {filterCity && (
              <span className="text-xs bg-brand-primary-light/10 text-brand-primary px-2.5 py-1 rounded-full font-medium animate-fade-in">
                Showing results for {filterCity}
              </span>
            )}
          </div>

          {filteredHouses.length === 0 ? (
            <div className="glass-panel text-center py-16 rounded-card border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 shadow-sm">
              <Home className="text-slate-300" size={48} />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No House Listings Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm">Try broadening your filters, lowering pricing limitations, or selecting another district.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHouses.map((house) => {
                const avgRating = house.ratingCount > 0 ? (house.ratingSum / house.ratingCount).toFixed(1) : 'N/A';
                const isFavorited = favorites.includes(house.id);
                return (
                  <div
                    key={house.id}
                    onClick={() => setSelectedHouse(house)}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card overflow-hidden hover-lift shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {/* SKELETON PLACEHOLDER */}
                      <div className="absolute inset-0 bg-slate-200 animate-pulse" style={{ display: house.imageUrl ? 'none' : 'block' }}></div>
                      
                      <img
                        src={house.imageUrl}
                        alt={house.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.previousElementSibling && (target.previousElementSibling as HTMLElement).style.setProperty('display', 'none');
                        }}
                      />
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">✅ Verified</span>
                        {house.pricePerMonth > 500 && <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">⭐ Featured</span>}
                        {house.pricePerMonth < 400 && <span className="bg-blue-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">🔥 New</span>}
                      </div>

                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                        <div className="bg-white/95 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <MapPin size={9} className="text-brand-primary" />
                          {house.city}
                        </div>
                      </div>
                    </div>

                    {/* Info area */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-brand-primary transition pr-2">
                            {house.title}
                          </h4>
                          <span className="font-black text-brand-primary text-sm shrink-0">${formatNumber(house.pricePerMonth)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 line-clamp-2">{house.description}</p>
                      </div>

                      {/* Property Specs */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-semibold bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">{formatNumber(house.roomsCount)} Beds</span>
                        <span className="text-[9px] font-semibold bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">{formatNumber(house.bathroomsCount)} Baths</span>
                        {house.facilities.wifi && <span className="text-[9px] font-semibold bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">Internet</span>}
                        {house.facilities.water_24_7 && <span className="text-[9px] font-semibold bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">Water</span>}
                        {house.facilities.parking && <span className="text-[9px] font-semibold bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/50">Parking</span>}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-3 text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><span className="text-amber-400">⭐</span> {avgRating === 'N/A' ? avgRating : formatNumber(Number(avgRating), 1)}</span>
                          <span className="flex items-center gap-1">👁 {formatNumber(Math.floor(Math.random() * 500) + 50)}</span>
                          <span className="flex items-center gap-1">🕒 2d ago</span>
                        </div>
                        <button
                          onClick={(e) => onToggleFavorite(house.id, e)}
                          className="p-1 rounded-full text-slate-400 hover:text-red-500 transition"
                        >
                          <Heart size={16} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR (INTERACTIVE MAP & SUBMISSIONS STATUS) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Map Discovery */}
        <div className={activeTab === 'home' ? 'block' : 'hidden lg:block'}>
          <div className="h-[400px]">
          <SomaliMap
            selectedCity={filterCity}
            onSelectCity={setFilterCity}
            cityCounts={cityCounts}
            lang={lang}
          />
        </div>
        </div>

        {/* Profile / Admin Actions */}
        <div className={activeTab === 'profile' ? 'flex flex-col gap-6' : 'hidden lg:flex lg:flex-col lg:gap-6'}>
        {/* Become a Landlord CTA or Switcher */}
        {currentTenant.roles.includes(UserRole.Homeowner) ? (
          <div className="bg-gradient-to-br from-brand-primary to-brand-primary-dark p-5 rounded-card text-white shadow-md flex flex-col gap-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider">🏡 {lang === 'so' ? 'Dashboard-ka Ganacsiga' : lang === 'ar' ? 'لوحة تحكم المالك' : 'Homeowner Console'}</h4>
            <p className="text-[10px] text-blue-150 leading-relaxed font-medium">
              {lang === 'so' ? 'Waxaad leedahay labada door ee Kireyste iyo Mulkiile. Guji si aad u maamusho guryahaaga.' : lang === 'ar' ? 'لديك صلاحيات المالك والمستأجر معاً. اضغط للانتقال للوحة التحكم.' : 'You have both Tenant and Landlord roles. Switch to manage your properties.'}
            </p>
            <button
              onClick={() => setActiveLayout('homeowner')}
              className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-950/50 text-brand-primary font-bold py-2 rounded-input text-xs shadow-sm transition"
            >
              💼 {lang === 'so' ? 'U gudub Qaybta Mulkiilaha' : lang === 'ar' ? 'الانتقال إلى لوحة المالك' : 'Switch to Landlord Mode'}
            </button>
          </div>
        ) : currentTenant.upgradeStatus === 'pending' ? (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-card text-slate-800 dark:text-slate-200 shadow-sm flex flex-col gap-2.5 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>⏳</span> {lang === 'so' ? 'Codsigaaga waa la eegayaa' : lang === 'ar' ? 'طلب الترقية قيد المراجعة' : 'Upgrade Pending'}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
              {lang === 'so' ? 'Maamulaha ayaa eegaya aqoonsigaada si laguugu daro doorka Mulkiile.' : lang === 'ar' ? 'يقوم مدير النظام بمراجعة بياناتك لترقية حسابك إلى مالك عقار.' : 'The administrator is verifying your profile to grant Homeowner access.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-5 rounded-card text-slate-800 dark:text-slate-200 shadow-sm flex flex-col gap-2.5 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">🌟 {lang === 'so' ? 'Ma leedahay guri? Noqo Milkiile' : lang === 'ar' ? 'هل تملك عقاراً؟ كن مالكاً' : 'Own a Property? List it!'}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
              {lang === 'so' ? 'Diiwaangeli guryahaaga si aad u hesho dakhli joogto ah oo ku dhacaya EVC Plus.' : lang === 'ar' ? 'قم بإدراج وتأجير منازلك لتلقي الإيجار مباشرة عبر الهواتف.' : 'Register your properties on GoobJoog to collect rent directly via mobile money.'}
            </p>
            <button
              onClick={() => {
                onUpgradeToLandlord();
                alert(lang === 'so' ? "Codsigaagii waa la gudbiyey! Maamulaha ayaa eegaya." : lang === 'ar' ? "تم إرسال طلب الترقية للمسؤول." : "Upgrade request submitted to Admin.");
              }}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2 rounded-input text-xs shadow-sm transition"
            >
              ⚡ {lang === 'so' ? 'Codso in laguu dalaco' : lang === 'ar' ? 'طلب ترقية الحساب' : 'Apply to Become Owner'}
            </button>
          </div>
        )}

        </div>

        {/* Favorites shortcut */}
        <div className={activeTab === 'saved' ? 'block' : 'hidden lg:block'}>
        {favorites.length > 0 ? (
          <div className="glass-panel p-4 rounded-card shadow-sm bg-white dark:bg-slate-900">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">Saved Favorites ({favorites.length})</h3>
            <div className="flex flex-col gap-2">
              {favorites.map(id => {
                const h = houses.find(house => house.id === id);
                if (!h) return null;
                return (
                  <div key={id} onClick={() => setSelectedHouse(h)} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:border-slate-800 cursor-pointer transition bg-white dark:bg-slate-900 shadow-sm">
                    <img src={h.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{h.title}</h4>
                      <p className="text-[10px] text-brand-primary font-medium">${h.pricePerMonth}/mo</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-card shadow-sm bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950/50 rounded-full flex items-center justify-center">
              <Heart size={24} className="text-slate-300" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">No saved properties yet</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 max-w-[200px]">Keep track of your favorite homes here.</p>
            </div>
            <button onClick={() => setActiveTab('home')} className="mt-2 bg-slate-800 text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-slate-900 transition active:scale-95 shadow-sm">
              Browse Houses
            </button>
          </div>
        )}

        </div>

        {/* SUBMISSIONS & RENTAL APPLICATIONS DESK */}
        <div className={activeTab === 'apps' ? 'block' : 'hidden lg:block'}>
        <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-3">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Your Rental Desk</h3>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">({applications.filter(a => a.tenantId === currentTenant.id).length} active)</span>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            {applications.filter(a => a.tenantId === currentTenant.id).length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50/50">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={24} className="text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">No applications submitted</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 max-w-[200px]">When you apply for a property, it will appear here.</p>
                </div>
                <button onClick={() => setActiveTab('home')} className="mt-2 bg-brand-primary text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-brand-primary-dark transition active:scale-95 shadow-sm">
                  Find a House
                </button>
              </div>
            ) : (
              applications.filter(a => a.tenantId === currentTenant.id).map((app) => {
                return (
                  <div key={app.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{app.houseTitle}</h4>
                        <p className="text-[9px] text-slate-400">Date: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      {app.status === 'pending' && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200 uppercase">Pending</span>
                      )}
                      {app.status === 'approved' && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200 uppercase animate-pulse">Approved</span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="text-[9px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-200 uppercase">Rejected</span>
                      )}
                      {app.status === 'rented' && (
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200 uppercase">Active Rent</span>
                      )}
                    </div>

                    {app.status === 'rejected' && app.landlordFeedback && (
                      <div className="bg-rose-50/50 border-l-2 border-rose-400 p-2 rounded text-[10px] text-rose-800">
                        <strong>Feedback:</strong> {app.landlordFeedback}
                      </div>
                    )}

                    {app.status === 'rejected' && (() => {
                      const h = houses.find(house => house.id === app.houseId);
                      if (!h) return null;
                      const landlordPhone = h.landlordPhone.replace(/\+/g, '').replace(/\s/g, '').trim();
                      const whatsappMsg = lang === 'so' 
                        ? `Asc, waxaan ka xumahay in codsigeygii guriga "${app.houseTitle}" la diiday. Ma ka wada hadli karnaa?`
                        : lang === 'ar'
                        ? `مرحباً، لقد رأيت أن طلب استئجار "${app.houseTitle}" تم رفضه. هل يمكننا مناقشة الأمر؟`
                        : `Hello, I saw my application for "${app.houseTitle}" was rejected. Can we discuss this?`;
                      const waLink = `https://wa.me/${landlordPhone}?text=${encodeURIComponent(whatsappMsg)}`;
                      return (
                        <div className="flex gap-2 mt-1">
                          <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 flex-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-lg hover:bg-emerald-100 transition decoration-none border border-emerald-200">
                            <MessageSquare size={12} /> WhatsApp
                          </a>
                          <a href={`tel:${h.landlordPhone}`} className="flex items-center justify-center gap-1.5 flex-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 py-1.5 rounded-lg hover:bg-slate-200 transition decoration-none border border-slate-200 dark:border-slate-800">
                            <Smartphone size={12} /> Call
                          </a>
                        </div>
                      );
                    })()}

                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/50 pt-2.5">
                      {app.status === 'pending' && (
                        <button
                          onClick={() => onCancelApplication(app.id)}
                          className="text-[10px] text-rose-600 hover:underline font-semibold"
                        >
                          Cancel Request
                        </button>
                      )}

                      {app.status === 'approved' && (
                        <button
                          onClick={() => triggerPaymentFlow(app)}
                          className="w-full bg-brand-secondary hover:bg-brand-secondary-dark text-white text-xs font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <Smartphone size={13} />
                          Pay Rent Online
                        </button>
                      )}

                      {app.status === 'rented' && (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">Rent Settled</span>
                          <button
                            onClick={() => {
                              const tx = transactions.find(t => t.tenantPhone === app.tenantPhone && t.houseTitle === app.houseTitle);
                              if (tx) {
                                setTransactionRef(tx.telecomReference || '');
                                setPhoneScreenState('success');
                                setCheckoutApp(app);
                                setShowPhoneSimulator(true);
                              } else {
                                alert("Mock receipt downloaded!");
                              }
                            }}
                            className="text-[10px] text-brand-primary hover:underline font-semibold flex items-center gap-1"
                          >
                            <Download size={10} />
                            Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        </div>

        {/* PROFILE & SETTINGS LAUNCHER WIDGET */}
        <div className={activeTab === 'profile' ? 'block' : 'hidden lg:block'}>
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 mb-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow">
                {currentTenant.fullName ? currentTenant.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {currentTenant.fullName}
                  {currentTenant.isVerified && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-500">{currentTenant.phone} • {currentTenant.email || 'GoobJoog User'}</p>
              </div>
            </div>

            <button
              onClick={() => onOpenSettings && onOpenSettings()}
              className="w-full mt-3 flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-extrabold text-xs transition active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <Smartphone size={16} />
                <span>{lang === 'so' ? 'Qalabeynta & Nidaamka App-ka (Settings Page)' : 'Open Full App Settings'}</span>
              </span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Gudaha gal</span>
            </button>
          </div>

        <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/50 pb-2 flex items-center gap-1.5">
            <MessageSquare size={13} className="text-brand-primary" />
            Tenant Maintenance Desk
          </h3>
          <form onSubmit={handleComplaintSubmit} className="flex flex-col gap-3 mt-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Select Rented Property</label>
              <select
                value={newComplaintHouseId}
                onChange={(e) => setNewComplaintHouseId(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">-- Choose Rented House --</option>
                {applications.filter(a => a.tenantId === currentTenant.id && a.status === 'rented').map(a => (
                  <option key={a.houseId} value={a.houseId}>{a.houseTitle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Issue Title</label>
              <input
                type="text"
                placeholder="e.g. Broken water pump, lock issue"
                value={newComplaintTitle}
                onChange={(e) => setNewComplaintTitle(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Details of the support needed..."
                value={newComplaintDetails}
                onChange={(e) => setNewComplaintDetails(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2 rounded transition"
            >
              Submit Escalation
            </button>
          </form>
        </div>

        </div>

        {/* TRANSACTION HISTORY */}
        <div className={activeTab === 'payments' ? 'block' : 'hidden lg:block'}>
        <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/50 pb-2">
            Payment Transaction History
          </h3>
          <div className="flex flex-col gap-2 mt-3 max-h-64 overflow-y-auto">
            {transactions.filter(t => t.tenantPhone === currentTenant.phone).length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50/50">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm">
                  <DollarSign size={24} className="text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">No payments yet</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 max-w-[200px]">Your rent and application payments will show here.</p>
                </div>
                <button onClick={() => setActiveTab('apps')} className="mt-2 bg-slate-800 text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-slate-900 transition active:scale-95 shadow-sm">
                  View Available Rentals
                </button>
              </div>
            ) : (
              transactions.filter(t => t.tenantPhone === currentTenant.phone).map(tx => (
                <div key={tx.id} className="flex flex-col gap-1 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/50 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(tx.requestTime || tx.date).toLocaleDateString()}</span>
                    <span className="font-bold">${tx.amountTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-500">
                    <span className="uppercase text-[9px] font-bold text-slate-400">{tx.paymentMethod.replace('_', ' ')}</span>
                    <span>
                      {tx.paymentStatus === 'successful' && <span className="text-emerald-600 font-bold">✅ Successful</span>}
                      {tx.paymentStatus === 'failed' && <span className="text-rose-600 font-bold">❌ Failed</span>}
                      {tx.paymentStatus === 'pending' && <span className="text-amber-600 font-bold">⏳ Pending</span>}
                      {tx.paymentStatus === 'processing' && <span className="text-blue-600 font-bold">⚙️ Processing</span>}
                      {['cancelled', 'expired', 'refunded'].includes(tx.paymentStatus) && <span className="text-slate-500 dark:text-slate-500 font-bold capitalize">{tx.paymentStatus}</span>}
                    </span>
                  </div>
                  {tx.paymentStatus === 'failed' && tx.failureReason && (
                    <div className="text-[9px] text-rose-500 mt-1">Reason: {tx.failureReason}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        </div>
      </div>
      </div>

 

      {/* ==========================================
          MODAL: HOUSE DETAIL DRAWER
          ========================================== */}
      {selectedHouse && (() => {
        const allImages = [selectedHouse.imageUrl, ...(selectedHouse.additionalImages || [])];
        const currentImage = allImages[activeImageIndex] || selectedHouse.imageUrl;
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col justify-between">
              <div className="relative h-64">
                <img src={currentImage} alt="" className="w-full h-full object-cover animate-fade-in" />
                <button
                  onClick={() => setSelectedHouse(null)}
                  className="absolute top-4 right-4 bg-white/95 text-slate-700 dark:text-slate-300 hover:text-black p-2 rounded-full shadow-lg transition"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 left-4 bg-brand-primary text-white font-black text-sm px-3.5 py-2 rounded-xl shadow-lg">
                  ${formatNumber(selectedHouse.pricePerMonth)} / month
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-5">
                {/* Clickable gallery thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 mt-0 border-b border-slate-100 dark:border-slate-800/50">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeImageIndex === idx ? 'border-brand-primary scale-105 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-brand-primary text-white text-[6px] font-bold text-center py-0.2 uppercase">Cover</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              <div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wide">
                  <MapPin size={11} className="text-brand-primary" />
                  <span>{selectedHouse.city} - {selectedHouse.district} district</span>
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{selectedHouse.title}</h2>
              </div>

              <div className="grid grid-cols-4 gap-2 py-3 border-t border-b border-slate-100 dark:border-slate-800/50 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-normal">{lang === 'so' ? 'Qolal' : lang === 'ar' ? 'الغرف' : 'Rooms'}</div>
                  <div className="mt-0.5">{formatNumber(selectedHouse.roomsCount)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-normal">{lang === 'so' ? 'Musqul' : lang === 'ar' ? 'الحمامات' : 'Baths'}</div>
                  <div className="mt-0.5">{formatNumber(selectedHouse.bathroomsCount)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-normal">WiFi</div>
                  <div className="mt-0.5">{selectedHouse.facilities.wifi ? 'Yes' : 'No'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-normal">Water</div>
                  <div className="mt-0.5">{selectedHouse.facilities.water_24_7 ? '24/7' : 'Standard'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1.5">Description</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{selectedHouse.description}</p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                    <MapPin size={12} /> Location & Navigation
                  </h4>
                </div>
                <div className="relative h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 mb-3 z-0">
                  <MapContainer 
                    center={[selectedHouse.coordinates.lat, selectedHouse.coordinates.lng]} 
                    zoom={15} 
                    scrollWheelZoom={false} 
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[selectedHouse.coordinates.lat, selectedHouse.coordinates.lng]} />
                  </MapContainer>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row items-center justify-between">
                  <span className="text-[9px] font-bold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded w-full sm:w-auto text-center">
                    Source: {selectedHouse.locationSource === 'GPS_VERIFIED' ? '📍 GPS Verified' : '🗺️ Map Location'}
                  </span>
                  
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHouse.coordinates.lat},${selectedHouse.coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto bg-[#4285F4] hover:bg-[#3367d6] text-white text-[11px] font-bold px-4 py-2 rounded flex items-center justify-center gap-2 shadow-md transition animate-pulse"
                  >
                    <Navigation size={14} /> Open in Google Maps
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-150 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Property Landlord</div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedHouse.landlordName}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">{selectedHouse.landlordPhone}</span>
                </div>
                <span className="bg-brand-primary-light/10 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-primary">
                  Verified Owner
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4">
                <form onSubmit={(e) => handleApplyWrapper(selectedHouse, e)}>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Rental Terms</h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-500 mb-1">Standard Deposit</label>
                      <input
                        type="text"
                        disabled
                        value={`$${formatNumber(selectedHouse.depositAmount)} USD`}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-500 mb-1">Rent Cost</label>
                      <input
                        type="text"
                        disabled
                        value={`$${formatNumber(selectedHouse.pricePerMonth)} USD`}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition"
                  >
                    Submit Rental Application Request
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Tenant Reviews ({selectedHouse.reviews.length})</h4>
                <div className="flex flex-col gap-3 mb-4">
                  {selectedHouse.reviews.length === 0 ? (
                    <p className="text-xs text-slate-400">No ratings yet for this listed home.</p>
                  ) : (
                    selectedHouse.reviews.map((rev: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-950/50/50 p-3 rounded-lg border border-slate-150 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-slate-800 dark:text-slate-200">{rev.author}</strong>
                          <span className="text-amber-500 font-bold flex items-center gap-0.5">{rev.rating} ★</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{rev.comment}</p>
                        <span className="text-[9px] text-slate-400 block mt-1">{rev.date}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">Write a Review</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">Your Rating:</span>
                    <select
                      value={ratingVal}
                      onChange={(e) => setRatingVal(parseInt(e.target.value))}
                      className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 focus:outline-none"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Comment on facilities, water supply, security..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded transition self-start"
                  >
                    Post Review
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    })()}

      {/* ==========================================
          USSD GATEWAY MOBILE MONEY SIMULATOR
          ========================================== */}
      {showPhoneSimulator && checkoutApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-3xl w-full">
            
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-card p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-slate-200">GoobJoog Invoice</h2>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Mogadishu, Somalia</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-500 font-mono">Invoice #GJO-{(checkoutApp.id).substring(4, 9).toUpperCase()}</span>
                </div>

                <div className="py-4 border-b border-slate-150 flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Tenant Payer:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{checkoutApp.tenantName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-mono text-slate-850">{paymentPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Landlord:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{houses.find(h => h.id === checkoutApp.houseId)?.landlordName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Property:</span>
                    <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{checkoutApp.houseTitle}</strong>
                  </div>
                </div>

                <div className="py-4 flex flex-col gap-2 text-xs font-semibold">
                  <div className="flex justify-between text-slate-550 font-medium">
                    <span>First Month Rent (USD):</span>
                    <span>${houses.find(h => h.id === checkoutApp.houseId)?.pricePerMonth}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-800 dark:text-slate-200 font-black text-sm border-t border-slate-100 dark:border-slate-800/50 pt-3.5 mt-2">
                    <span>Total Charged:</span>
                    <span>${houses.find(h => h.id === checkoutApp.houseId)?.pricePerMonth}.00 USD</span>
                  </div>
                </div>
              </div>

              {phoneScreenState === 'success' && (
                <div className="bg-emerald-50 p-4 border border-emerald-200 rounded-lg flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 size={16} />
                    <span>Transaction Authorized</span>
                  </div>
                  <p className="text-[10px] text-emerald-700">Rent funds processed and ledger updated.</p>
                  <button
                    onClick={() => alert("Mock PDF receipt printed successfully.")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded text-[11px] transition shadow"
                  >
                    Print / Download PDF Receipt
                  </button>

                  {(() => {
                    const house = houses.find(h => h.id === checkoutApp.houseId);
                    if (!house) return null;
                    const landlordPhone = house.landlordPhone.replace(/\+/g, '').replace(/\s/g, '').trim();
                    const whatsappMsg = lang === 'so' 
                      ? `Asc, waxaan ahay kireystaha gurigaada ku yaala ${house.city}. Waxaan nidaamka GoobJoog ku shubay lacagta kirada oo dhan $${house.pricePerMonth}.00. Fadlan hubi.` 
                      : lang === 'ar'
                      ? `مرحباً، أنا المستأجر. لقد قمت بدفع مبلغ الإيجار وقدره $${house.pricePerMonth}.00 لعقارك في ${house.city} عبر نظام جوب جوج. يرجى التحقق.`
                      : `Hello, I am the tenant. I have paid the rent of $${house.pricePerMonth}.00 for your property in ${house.city} via GoobJoog. Please check the ledger.`;
                    const waLink = `https://wa.me/${landlordPhone}?text=${encodeURIComponent(whatsappMsg)}`;
                    
                    return (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 rounded text-[11px] transition shadow flex items-center justify-center gap-1.5 mt-1 text-center decoration-none"
                      >
                        <span>💬</span> {t.sendWhatsApp}
                      </a>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={closePhoneSimulator}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded text-xs transition"
                >
                  Close Invoice
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="w-[280px] h-[550px] bg-slate-900 rounded-[36px] p-3 border-4 border-slate-800 relative shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="h-6 w-full flex justify-center items-center relative z-20">
                  <div className="w-16 h-2.5 bg-black rounded-full"></div>
                </div>

                <div className="flex-grow bg-[#1c1d22] rounded-[24px] overflow-hidden flex flex-col justify-between p-4 relative text-white">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mb-2">
                    <span>Waafi Push API</span>
                    <span>100% 🔋</span>
                  </div>

                  {phoneScreenState === 'prompt' && (
                    <div className="flex-grow flex flex-col justify-between py-4">
                      <div className="flex flex-col gap-3 text-center">
                        <Smartphone size={32} className="text-brand-secondary mx-auto animate-bounce" />
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">USSD Direct push</h4>
                        
                        <div className="bg-[#2a2b30] p-3 rounded-lg border border-slate-700 flex flex-col gap-2 text-left text-xs font-medium">
                          <div className="grid grid-cols-3 gap-1">
                            {['evc_plus', 'zaad', 'sahal'].map(gateway => (
                              <button
                                key={gateway}
                                type="button"
                                onClick={() => setPaymentGateway(gateway as any)}
                                className={`py-1 rounded text-[9px] font-bold uppercase transition border ${
                                  paymentGateway === gateway ? 'bg-brand-primary border-brand-primary-light text-white' : 'bg-slate-800 border-slate-700 text-slate-350'
                                }`}
                              >
                                {gateway.replace('_', ' ')}
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-slate-700 mt-2 pt-2 text-[9px] text-slate-300 leading-relaxed font-sans">
                            <strong className="block text-slate-100 font-bold mb-1 uppercase tracking-wide">
                              {paymentGateway === 'evc_plus' ? 'Hormuud waafipay' : paymentGateway === 'zaad' ? 'Zaad merchant' : 'Sahal merchant'}
                            </strong>
                            Authorize GoobJoog Rent billing for 
                            <strong className="text-white"> ${houses.find(h => h.id === checkoutApp.houseId)?.pricePerMonth}.00 USD</strong>? 
                            Enter Wallet PIN:
                          </div>

                          <div className="bg-slate-900 p-2 rounded text-[10px] text-brand-secondary font-mono border border-slate-750 text-center font-bold break-all select-all">
                            {getUSSDCode()}
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleCopyUSSD}
                            className="w-full bg-slate-800 hover:bg-slate-750 text-white py-1 rounded text-[8px] font-black tracking-wider uppercase border border-slate-700 transition"
                          >
                            {copiedUSSD ? t.copied : t.copyUSSD}
                          </button>

                          <div className="bg-black/45 p-1.5 rounded border border-slate-750 flex items-center justify-center gap-1.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full border-2 ${
                                  enteredPin.length > i ? 'bg-white dark:bg-slate-900 border-white' : 'border-slate-650 bg-transparent'
                                } transition-all`}
                              ></div>
                            ))}
                          </div>
                          
                          <span className="text-[8px] text-amber-500 font-bold text-center block">
                            Demo PIN: 1234
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 px-4 mt-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                          <button
                            key={num}
                            onClick={() => handleKeypadPress(num)}
                            className="h-8 w-8 mx-auto rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-650 font-mono text-xs font-bold flex items-center justify-center transition"
                          >
                            {num}
                          </button>
                        ))}
                        <button
                          onClick={handleKeypadDelete}
                          className="h-8 w-8 mx-auto rounded-full bg-rose-950/40 text-rose-500 font-bold text-[10px] flex items-center justify-center transition"
                        >
                          DEL
                        </button>
                        <button
                          onClick={() => handleKeypadPress('0')}
                          className="h-8 w-8 mx-auto rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-650 font-mono text-xs font-bold flex items-center justify-center transition"
                        >
                          0
                        </button>
                        <button
                          onClick={submitUSSDPayment}
                          className="h-8 w-8 mx-auto rounded-full bg-emerald-950/80 text-emerald-400 font-bold text-[10px] flex items-center justify-center transition"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  )}

                  {phoneScreenState === 'processing' && (
                    <div className="flex-grow flex flex-col justify-center items-center gap-4 text-center">
                      <div className="spinner"></div>
                      <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-widest animate-pulse">Processing Payment</h4>
                      <p className="text-[9px] text-slate-400 max-w-xs px-2">Initiating merchant webhook updates...</p>
                    </div>
                  )}

                  {phoneScreenState === 'success' && (
                    <div className="flex-grow flex flex-col justify-between py-6 text-center">
                      <div></div>
                      <div className="flex flex-col gap-2">
                        <div className="w-10 h-10 bg-brand-secondary text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                          <Check size={20} />
                        </div>
                        <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest">Completed</h3>
                        <div className="bg-[#2a2b30] p-2 rounded mx-2 text-left font-mono text-[8px] text-slate-350 mt-2">
                          <span>Ref: {transactionRef}</span><br />
                          <span>Status: Completed</span>
                        </div>
                      </div>
                      <button
                        onClick={closePhoneSimulator}
                        className="mx-4 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold py-1.5 rounded text-xs transition"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  )}

                  {phoneScreenState === 'failed' && (
                    <div className="flex-grow flex flex-col justify-between py-6 text-center">
                      <div></div>
                      <div className="flex flex-col gap-2">
                        <div className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <X size={20} />
                        </div>
                        <h3 className="text-xs font-black text-slate-100 uppercase">Incorrect PIN</h3>
                      </div>
                      <button
                        onClick={() => setPhoneScreenState('prompt')}
                        className="mx-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 rounded text-xs transition"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  <div className="h-1 w-16 bg-slate-700 rounded-full mx-auto mt-2"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FACEBOOK STYLE MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
            activeTab === 'home' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Home size={20} />
          <span className="text-[10px]">{lang === 'so' ? 'Feed' : 'Feed'}</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
            activeTab === 'search' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Search size={20} />
          <span className="text-[10px]">{lang === 'so' ? 'Guryaha' : 'Explore'}</span>
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition relative ${
            activeTab === 'apps' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <CheckCircle2 size={20} />
          {applications.length > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
          )}
          <span className="text-[10px]">{lang === 'so' ? 'Codsiyada' : 'Apps'}</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
            activeTab === 'payments' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <DollarSign size={20} />
          <span className="text-[10px]">{lang === 'so' ? 'Bixinta' : 'Payments'}</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
            activeTab === 'profile' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <User size={20} />
          <span className="text-[10px]">{lang === 'so' ? 'Profile' : 'Menu'}</span>
        </button>
      </div>

      </div>
    </div>
  );
};
