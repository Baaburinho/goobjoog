// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Home, Check, X, Camera, Image, Monitor, Smartphone, 
  MapPin, Navigation, Crosshair, DollarSign, Calendar, Clock, FileText, 
  CheckCircle2, AlertCircle, Eye, ChevronRight, Layers
} from 'lucide-react';
import type { House, Application, UserProfile, Expense, HouseTour } from '../domain/entities';
import { HouseStatus } from '../domain/enums';
import { translations } from '../lib/translations';
import { MapPicker } from '../components/MapPicker';
import { requestAndGetCurrentLocation } from '../shared/utils/geolocation';

interface LandlordDashboardProps {
  houses: House[];
  applications: Application[];
  tours?: HouseTour[];
  currentLandlord: UserProfile;
  expenses?: Expense[];
  onRegisterHouse: (newHouse: House) => void;
  onDeleteHouse: (houseId: string) => void;
  onApproveApplication: (appId: string) => void;
  onRejectApplication: (appId: string, feedback: string) => void;
  onUpdateTourStatus?: (tourId: string, status: string) => void;
  onAddExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  addAuditLog: (action: string, details: string) => void;
  lang: 'en' | 'so' | 'ar';
  activeLayout: 'tenant' | 'homeowner' | 'administrator' | 'financial_ledger';
  setActiveLayout: (layout: 'tenant' | 'homeowner' | 'administrator' | 'financial_ledger') => void;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
  houses,
  applications,
  tours = [],
  currentLandlord,
  expenses = [],
  onRegisterHouse,
  onDeleteHouse,
  onApproveApplication,
  onRejectApplication,
  onUpdateTourStatus,
  onAddExpense,
  onDeleteExpense,
  addAuditLog,
  lang,
  activeLayout,
  setActiveLayout
}) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  // Strictly 3 Sub-Tabs: 'properties' | 'add_property' | 'tours_apps'
  const [activeSubTab, setActiveSubTab] = useState<'properties' | 'add_property' | 'tours_apps'>('properties');

  // Form State for Listing New Property
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [newRooms, setNewRooms] = useState('2');
  const [newBaths, setNewBaths] = useState('1');
  const [newCity, setNewCity] = useState('Baidoa');
  const [newDistrict, setNewDistrict] = useState('');
  const [newWifi, setNewWifi] = useState(true);
  const [newWater, setNewWater] = useState(true);
  const [newParking, setNewParking] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedHashes, setUploadedHashes] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [newLat, setNewLat] = useState<number | null>(null);
  const [newLng, setNewLng] = useState<number | null>(null);
  const [newLocationSource, setNewLocationSource] = useState<'GPS_VERIFIED' | 'MAP_SELECTED' | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Application Rejection Feedback Modal
  const [rejectionAppId, setRejectionAppId] = useState<string | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchScreen = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setIsMobile(isMobileUA || (isTouchScreen && window.innerWidth <= 768));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const landlordId = currentLandlord?.id || '';
  const landlordPhone = currentLandlord?.phone || '';
  const myHouses = (houses || []).filter(h => (landlordId && h.landlordId === landlordId) || (landlordPhone && h.landlordPhone === landlordPhone));
  const myHouseIds = myHouses.map(h => h.id);
  const pendingApplications = (applications || []).filter(a => myHouseIds.includes(a.houseId) && a.status === 'pending');
  const pendingToursCount = tours.filter(t => t.status === 'pending').length;

  const computeSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const processFiles = async (files: FileList) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isValidExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
      
      if (!validTypes.includes(file.type.toLowerCase()) && !isValidExt) {
        alert(lang === 'so' ? "Keliya sawirada JPG, JPEG, PNG, iyo WebP ayaa la ogol yahay." :
              lang === 'ar' ? "الصيغ المدعومة فقط هي: JPG, JPEG, PNG, WebP." :
              "Only JPG, JPEG, PNG, and WebP images are allowed.");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(lang === 'so' ? "Sawirku waa inuu ka yaryahay 5 MB." : "Image size exceeds 5MB.");
        continue;
      }

      const hash = await computeSHA256(file);
      if (uploadedHashes.includes(hash)) {
        alert(lang === 'so' ? "Sawirkan mar hore ayaa la soo geliyey." : "Duplicate image detected.");
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setUploadedImages(prev => [...prev, result]);
          setUploadedHashes(prev => [...prev, hash]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setUploadedHashes(prev => prev.filter((_, i) => i !== index));
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const coords = await requestAndGetCurrentLocation();
      setNewLat(coords.latitude);
      setNewLng(coords.longitude);
      setNewLocationSource('GPS_VERIFIED');
      setIsGettingLocation(false);
      alert(lang === 'so' ? `Goobta GPS-ka waa la xaqiijiyey: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` :
            `GPS location captured: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } catch (error) {
      setIsGettingLocation(false);
      alert(lang === 'so' ? "Lama heli karo goobtaada GPS-ka. Fadlan ka dooro khariidada." :
            `Unable to retrieve location. Please select manually on the map.`);
    }
  };

  const formatNumber = (num: number, decimals: number = 0) => {
    const safeNum = (typeof num === 'number' && !isNaN(num) && isFinite(num)) ? num : 0;
    const options = decimals > 0 ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : {};
    if (lang === 'ar') {
      return new Intl.NumberFormat('ar-SA', options).format(safeNum);
    }
    return new Intl.NumberFormat('en-US', options).format(safeNum);
  };

  const getCityName = (city: string) => {
    switch (city) {
      case 'Mogadishu': return lang === 'so' ? 'Muqdisho' : lang === 'ar' ? 'مقديشو' : 'Mogadishu';
      case 'Hargeisa': return lang === 'so' ? 'Hargeysa' : lang === 'ar' ? 'هرجيسا' : 'Hargeisa';
      case 'Garowe': return lang === 'so' ? 'Garoowe' : lang === 'ar' ? 'غاروي' : 'Garowe';
      case 'Kismayo': return lang === 'so' ? 'Kismaayo' : lang === 'ar' ? 'كيسمايو' : 'Kismayo';
      case 'Baidoa': return lang === 'so' ? 'Baydhabo' : lang === 'ar' ? 'بيدوا' : 'Baidoa';
      case 'Galkayo': return lang === 'so' ? 'Gaalkacayo' : lang === 'ar' ? 'جالكعيو' : 'Galkayo';
      case 'Bosaso': return lang === 'so' ? 'Boosaaso' : lang === 'ar' ? 'بوساسو' : 'Bosaso';
      default: return city;
    }
  };

  const handleCreateHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newDeposit || !newDistrict) {
      alert(t.fillRequiredMsg);
      return;
    }

    const price = parseFloat(newPrice);
    const deposit = parseFloat(newDeposit);
    const rooms = parseInt(newRooms);
    const baths = parseInt(newBaths);

    if (isNaN(price) || isNaN(deposit) || isNaN(rooms) || isNaN(baths)) {
      alert(lang === 'so' ? "Fadlan geli lambarro sax ah qiimaha iyo qolalka." : "Please enter valid numeric values.");
      return;
    }

    const finalImage = uploadedImages.length > 0
      ? uploadedImages[0]
      : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80';

    const newHouse: House = {
      id: `h_${Date.now()}`,
      landlordId: currentLandlord?.id || 'u1',
      landlordName: currentLandlord?.fullName || 'Landlord',
      landlordPhone: currentLandlord?.phone || '',
      title: newTitle,
      description: newDesc || (lang === 'so' ? 'Guri casri ah oo ku yaala meel amni ah.' : 'Modern family property in a secure neighborhood.'),
      pricePerMonth: price,
      depositAmount: deposit,
      roomsCount: rooms,
      bathroomsCount: baths,
      city: newCity,
      district: newDistrict,
      facilities: {
        wifi: newWifi,
        water_24_7: newWater,
        parking: newParking
      },
      coordinates: {
        lat: newLat || 3.113,
        lng: newLng || 43.650
      },
      status: HouseStatus.Available,
      imageUrl: finalImage,
      ratingSum: 0,
      ratingCount: 0,
      reviews: []
    };

    onRegisterHouse(newHouse);
    addAuditLog('HOUSE_REGISTER', `Landlord registered new property: ${newTitle} in ${newCity}`);
    
    // Reset Form & Jump to My Properties
    setNewTitle('');
    setNewDesc('');
    setNewPrice('');
    setNewDeposit('');
    setNewDistrict('');
    setUploadedImages([]);
    setUploadedHashes([]);
    setNewLat(null);
    setNewLng(null);
    setNewLocationSource(null);
    setActiveSubTab('properties');

    alert(lang === 'so' ? '🎉 Gurigaaga cusub si guul leh ayaa loo diiwaangeliyey!' : '🎉 Property listed successfully!');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* LANDLORD HEADER & HERO BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <Home size={280} />
        </div>

        <div className="z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/30 text-blue-200 uppercase tracking-widest border border-blue-400/30 backdrop-blur-md">
              {t.landlord} Workspace
            </span>
            {currentLandlord?.isVerified && (
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-400 text-emerald-950 uppercase">
                ✓ {t.verified}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {lang === 'so' ? `Ku Soo Dhowow, ${currentLandlord?.fullName || 'Mulkiile'}` :
             lang === 'ar' ? `مرحباً بك، ${currentLandlord?.fullName || 'المالك'}` :
             `Welcome, ${currentLandlord?.fullName || 'Landlord'}`} 🏡
          </h1>
          <p className="text-xs text-blue-200/80 max-w-xl">
            {lang === 'so' ? 'Diiwaangeli guryahaaga cusub, kormeer guryahaaga diiwaangashan, oo maamul ballamaha booqashada kireystayaasha.' :
             'List your properties, manage listings, and confirm house viewing tour appointments.'}
          </p>
        </div>
      </div>

      {/* DASHBOARD 3 ESSENTIAL SUB-TAB BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('properties')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition shadow-sm ${
            activeSubTab === 'properties'
              ? 'bg-blue-600 text-white font-black shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <span>🏡</span>
          <span>{lang === 'so' ? 'Guryahayga' : 'My Properties'} ({myHouses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('add_property')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition shadow-sm ${
            activeSubTab === 'add_property'
              ? 'bg-blue-600 text-white font-black shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <Plus size={16} />
          <span>{t.registerPropertyTitle || 'List New Property'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tours_apps')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition shadow-sm relative ${
            activeSubTab === 'tours_apps'
              ? 'bg-blue-600 text-white font-black shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <span>📅</span>
          <span>{lang === 'so' ? 'Booqashooyinka & Codsiyada' : 'Tours & Applications'}</span>
          {(pendingToursCount > 0 || pendingApplications.length > 0) && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingToursCount + pendingApplications.length}
            </span>
          )}
        </button>
      </div>

      {/* MODULE 1: MY PROPERTIES */}
      {activeSubTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'so' ? `Guryahaaga Diiwaangashan (${myHouses.length})` : `Your Listed Properties (${myHouses.length})`}
            </h3>

            <button
              onClick={() => setActiveSubTab('add_property')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={15} />
              <span>{t.registerPropertyTitle || 'Add Property'}</span>
            </button>
          </div>

          {myHouses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <Home size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">
                {lang === 'so' ? 'Weli guri ma diiwaangelin' : 'No properties listed yet'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {lang === 'so' ? 'Geli gurigaaga cusub si kireystayaashu u kireystaan ama ay ballan booqasho uga qabsadaan.' : 'List your property to receive viewing tours and tenant applications.'}
              </p>
              <button
                onClick={() => setActiveSubTab('add_property')}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition"
              >
                + {t.registerPropertyTitle || 'List Property Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myHouses.map(house => (
                <div key={house.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                      <img src={house.imageUrl} alt={house.title} className="w-full h-full object-cover" />
                      
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${
                          house.status === HouseStatus.Available ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'
                        }`}>
                          {house.status.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteHouse(house.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition shadow-md"
                        title="Delete Property"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{house.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{house.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-2 font-medium">
                        <span>📍 {getCityName(house.city)}, {house.district}</span>
                        <span>•</span>
                        <span>🛏️ {formatNumber(house.roomsCount)} {t.rooms}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.monthlyRentField}</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">${formatNumber(house.pricePerMonth)}</span>
                    </div>

                    <span className="text-xs font-bold text-slate-500">
                      Deposit: ${formatNumber(house.depositAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: REGISTER NEW PROPERTY */}
      {activeSubTab === 'add_property' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.registerPropertyTitle}</h3>
              <p className="text-xs text-slate-500">{t.landlordBannerSub}</p>
            </div>
          </div>

          <form onSubmit={handleCreateHouse} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{t.propertyTitleField} *</label>
                <input
                  type="text"
                  placeholder={lang === 'so' ? 'Tusaale: Villa Casri ah oo 3 Qol ah Isha Baydhabo' : 'e.g. Modern 3-Bedroom Villa'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{t.cityField} *</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Baidoa">{getCityName('Baidoa')}</option>
                  <option value="Mogadishu">{getCityName('Mogadishu')}</option>
                  <option value="Hargeisa">{getCityName('Hargeisa')}</option>
                  <option value="Kismayo">{getCityName('Kismayo')}</option>
                  <option value="Garowe">{getCityName('Garowe')}</option>
                  <option value="Bosaso">{getCityName('Bosaso')}</option>
                  <option value="Galkayo">{getCityName('Galkayo')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{t.districtField} *</label>
                <input
                  type="text"
                  placeholder={lang === 'so' ? 'Tusaale: Isha, Wadajir, Hodan' : 'e.g. Isha, Wadajir'}
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{t.monthlyRentField} ($ USD) *</label>
                <input
                  type="number"
                  placeholder="350"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{t.depositAmountField} ($ USD) *</label>
                <input
                  type="number"
                  placeholder="350"
                  value={newDeposit}
                  onChange={(e) => setNewDeposit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{t.roomsCountField}</label>
                  <input
                    type="number"
                    value={newRooms}
                    onChange={(e) => setNewRooms(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{t.bathroomsCountField}</label>
                  <input
                    type="number"
                    value={newBaths}
                    onChange={(e) => setNewBaths(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{t.propertyDescField}</label>
              <textarea
                rows={3}
                placeholder={lang === 'so' ? 'Qor faahfaahin buuxda oo ku saabsan guriga, shuruudaha, iyo agagaarka...' : 'Describe property details, security, and surroundings...'}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Facilities Checkboxes */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="block text-xs font-bold text-slate-600 dark:text-slate-400">{t.facilities}</span>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newWifi} onChange={(e) => setNewWifi(e.target.checked)} className="rounded text-blue-600" />
                  <span>📶 {t.wifi}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newWater} onChange={(e) => setNewWater(e.target.checked)} className="rounded text-blue-600" />
                  <span>💧 {t.water}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newParking} onChange={(e) => setNewParking(e.target.checked)} className="rounded text-blue-600" />
                  <span>🚗 {t.parking}</span>
                </label>
              </div>
            </div>

            {/* Photos Upload Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">{t.uploadPhotos} (JPG, PNG, WebP)</label>
              
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500 transition bg-slate-50/50 dark:bg-slate-950/50">
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Camera size={32} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Taabo ama halkan ku soo jiid sawirada guriga</span>
                  <span className="text-[10px] text-slate-400">Max size: 5MB per photo</span>
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full text-[10px]"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location GPS Capture */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">📍 Goobta GPS-ka Guriga</span>
                <span className="text-[11px] text-slate-400">
                  {newLat && newLng ? `GPS: ${newLat.toFixed(4)}, ${newLng.toFixed(4)}` : 'Halkan ka xaqiiji GPS-ka ama ka dooro khariidada.'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
                >
                  <Navigation size={14} className={isGettingLocation ? 'animate-spin' : ''} />
                  <span>{isGettingLocation ? 'Ogaanaya...' : 'GPS Verified'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
                >
                  <MapPin size={14} />
                  <span>Khariidada</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg transition active:scale-[0.99]"
            >
              + {t.registerPropertyBtn || 'Diiwaangeli Guriga Cusub'}
            </button>
          </form>
        </div>
      )}

      {/* MODULE 3: TOURS & APPLICATIONS */}
      {activeSubTab === 'tours_apps' && (
        <div className="space-y-6">
          {/* HOUSE TOURS SECTION */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>📅</span>
                <span>{lang === 'so' ? 'Codsiyada Booqashada Guryaha (House Tours)' : 'Incoming House Viewing Tours'}</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                {tours.length} {lang === 'so' ? 'Coddso' : 'Requests'}
              </span>
            </div>

            {tours.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                {lang === 'so' ? 'Weli ma jiraan codsiyo booqasho oo cusub.' : 'No house tour requests received yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tours.map((tour) => (
                  <div key={tour.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tour.houseTitle}</h4>
                        <p className="text-xs text-slate-500 font-medium">👤 {tour.tenantName} ({tour.tenantPhone})</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tour.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {tour.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-medium">
                      <p>📅 Taariikhda: <span className="font-bold text-blue-600">{tour.tourDate}</span> ({tour.tourTimeSlot})</p>
                      <p>📍 Nooca: {tour.tourType === 'video_call' ? 'Live Video Tour' : 'In-Person Visit'}</p>
                      {tour.notes && <p className="italic text-slate-500 text-[11px]">"{tour.notes}"</p>}
                    </div>

                    {tour.status === 'pending' && onUpdateTourStatus && (
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => onUpdateTourStatus(tour.id, 'confirmed')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          ✓ Ansixi Ballanta (Confirm)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TENANT RENTAL APPLICATIONS SECTION */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>📄</span>
                <span>{lang === 'so' ? 'Codsiyada Kireysiga (Rental Applications)' : 'Tenant Applications'}</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                {pendingApplications.length} {t.pending}
              </span>
            </div>

            {pendingApplications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                {lang === 'so' ? 'Weli ma jiraan codsiyo kireysi oo sugaya.' : 'No pending tenant applications.'}
              </p>
            ) : (
              <div className="space-y-3">
                {pendingApplications.map(app => (
                  <div key={app.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.houseTitle}</h4>
                      <p className="text-xs text-slate-500">👤 {app.tenantName} ({app.tenantPhone}) • Start: {app.proposedStartDate}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onApproveApplication(app.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        ✓ {t.approve}
                      </button>
                      <button
                        onClick={() => setRejectionAppId(app.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        ✕ {t.decline}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAP PICKER MODAL */}
      {showMapPicker && (
        <MapPicker
          initialLat={newLat || 3.113}
          initialLng={newLng || 43.650}
          onSelectLocation={(lat, lng) => {
            setNewLat(lat);
            setNewLng(lng);
            setNewLocationSource('MAP_SELECTED');
            setShowMapPicker(false);
          }}
          onClose={() => setShowMapPicker(false)}
          lang={lang}
        />
      )}
    </div>
  );
};
