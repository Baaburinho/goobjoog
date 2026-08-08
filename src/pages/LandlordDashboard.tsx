// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Home, Check, X, Camera, Image, Monitor, Smartphone, MapPin, Navigation, Crosshair } from 'lucide-react';
import type { House, Application, UserProfile, Expense, Transaction } from '../domain/entities';
import { HouseStatus, UserRole } from '../domain/enums';
import { translations } from '../lib/translations';
import { MapPicker } from '../components/MapPicker';
import { requestAndGetCurrentLocation } from '../shared/utils/geolocation';

interface LandlordDashboardProps {
  houses: House[];
  applications: Application[];
  payoutAmount: number;
  currentLandlord: UserProfile;
  expenses?: Expense[];
  transactions?: Transaction[];
  onRegisterHouse: (newHouse: House) => void;
  onDeleteHouse: (houseId: string) => void;
  onApproveApplication: (appId: string) => void;
  onRejectApplication: (appId: string, feedback: string) => void;
  onAddExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  addAuditLog: (action: string, details: string) => void;
  lang: 'en' | 'so' | 'ar';
  activeLayout: 'tenant' | 'homeowner' | 'administrator';
  setActiveLayout: (layout: 'tenant' | 'homeowner' | 'administrator') => void;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
  houses,
  applications,
  payoutAmount,
  currentLandlord,
  expenses = [],
  transactions = [],
  onRegisterHouse,
  onDeleteHouse,
  onApproveApplication,
  onRejectApplication,
  onAddExpense,
  onDeleteExpense,
  addAuditLog,
  lang,
  activeLayout,
  setActiveLayout
}) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  // Local Forms state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [newRooms, setNewRooms] = useState('2');
  const [newBaths, setNewBaths] = useState('1');
  const [newCity, setNewCity] = useState('Mogadishu');
  const [newDistrict, setNewDistrict] = useState('');
  const [newWifi, setNewWifi] = useState(false);
  const [newWater, setNewWater] = useState(false);
  const [newParking, setNewParking] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedHashes, setUploadedHashes] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [newLat, setNewLat] = useState<number | null>(null);
  const [newLng, setNewLng] = useState<number | null>(null);
  const [newLocationSource, setNewLocationSource] = useState<'GPS_VERIFIED' | 'MAP_SELECTED' | null>(null);
  // Financial & Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<'maintenance' | 'utilities' | 'taxes' | 'renovation' | 'management' | 'other'>('maintenance');
  const [expAmount, setExpAmount] = useState('');
  const [expHouseId, setExpHouseId] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expDesc) {
      alert(t.fillRequiredMsg);
      return;
    }
    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0) {
      alert(lang === 'so' ? 'Geli lacag sax ah' : 'Please enter a valid amount');
      return;
    }

    const targetHouse = houses.find(h => h.id === expHouseId);

    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      landlordId: currentLandlord?.id || 'u1',
      houseId: expHouseId || undefined,
      houseTitle: targetHouse ? targetHouse.title : undefined,
      category: expCategory,
      amount: amt,
      description: expDesc,
      date: new Date().toISOString().split('T')[0]
    };

    if (onAddExpense) {
      onAddExpense(newExp);
    }
    addAuditLog('EXPENSE_LOG', `Logged expense of $${amt} for category: ${expCategory}`);
    setShowExpenseModal(false);
    setExpAmount('');
    setExpDesc('');
  };

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

  // Application Rejection Feedbacks
  const [rejectionAppId, setRejectionAppId] = useState<string | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  // Computes a SHA-256 hash/fingerprint of the file content for duplicate detection
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
        alert(lang === 'so' ? "Sawirku waa inuu ka yaryahay 5 MB." :
              lang === 'ar' ? "حجم الصورة يتجاوز الحد الأقصى (٥ ميجابايت)." :
              "The selected image exceeds the maximum size of 5 MB.");
        continue;
      }

      const hash = await computeSHA256(file);
      if (uploadedHashes.includes(hash)) {
        alert(lang === 'so' ? "Sawirkan mar hore ayaa la soo geliyey." :
              lang === 'ar' ? "هذه الصورة تم تحميلها مسبقاً." :
              "Duplicate image detected. This photo was already uploaded.");
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setUploadedHashes(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setUploadedImages([]);
    setUploadedHashes([]);
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
            lang === 'ar' ? `تم تحديد موقعك بدقة عبر GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` :
            `GPS location captured: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } catch (error) {
      setIsGettingLocation(false);
      alert(lang === 'so' ? "Lama heli karo goobtaada GPS-ka. Fadlan u ogolaaw app-ka location permission ama ka dooro khariidada." :
            lang === 'ar' ? "تعذر جلب موقع GPS. يمكنك تحديده يدوياً من الخريطة." :
            `Unable to retrieve your location. Please check location permissions or select it on the map.`);
    }
  };

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
      alert(lang === 'so' ? "Fadlan geli lambarro sax ah qiimaha iyo qolalka." : lang === 'ar' ? "يرجى إدخال أرقام صحيحة للأسعار والغرف." : "Please enter valid numeric values.");
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
      description: newDesc || (lang === 'so' ? 'Guri casri ah oo ku yaala meel amni ah.' : lang === 'ar' ? 'عقار سكني حديث في موقع آمن ومميز.' : 'Modern family property in a secure neighborhood.'),
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
        lat: newLat || (newCity === 'Hargeisa' ? 9.562 : newCity === 'Garowe' ? 8.406 : newCity === 'Kismayo' ? -0.358 : 2.042),
        lng: newLng || (newCity === 'Hargeisa' ? 44.065 : newCity === 'Garowe' ? 48.482 : newCity === 'Kismayo' ? 42.545 : 45.318)
      },
      status: HouseStatus.Available,
      imageUrl: finalImage,
      ratingSum: 0,
      ratingCount: 0,
      reviews: []
    };

    onRegisterHouse(newHouse);
    addAuditLog('HOUSE_REGISTER', `Landlord registered new property: ${newTitle} in ${newCity}`);
    
    // Clear forms
    setNewTitle('');
    setNewDesc('');
    setNewPrice('');
    setNewDeposit('');
    setNewDistrict('');
    setNewWifi(false);
    setNewWater(false);
    setNewParking(false);
    setUploadedImages([]);
    setUploadedHashes([]);
    setNewLat(null);
    setNewLng(null);
    setNewLocationSource(null);

    alert(lang === 'so' ? 'Gurigaaga cusub si guul leh ayaa loo diiwaangeliyey!' : lang === 'ar' ? 'تم إدراج عقارك الجديد بنجاح في النظام!' : 'Property listed successfully!');
  };

  const landlordId = currentLandlord?.id || '';
  const landlordPhone = currentLandlord?.phone || '';
  const myHouses = (houses || []).filter(h => (landlordId && h.landlordId === landlordId) || (landlordPhone && h.landlordPhone === landlordPhone));
  const myHouseIds = myHouses.map(h => h.id);
  const pendingApplications = (applications || []).filter(a => myHouseIds.includes(a.houseId) && a.status === 'pending');
  const myExpenses = (expenses || []).filter(e => landlordId && e.landlordId === landlordId);
  const totalExpenseAmount = myExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = (payoutAmount || 0) - totalExpenseAmount;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* HEADER & ROLE SWITCHER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            🏡 {lang === 'so' ? 'Qeybta Mulkiilaha & Xisaabaadka' : lang === 'ar' ? 'لوحة المالك والحسابات' : 'Landlord Dashboard & Ledger'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'so' ? 'Maamul guryahaaga, eeg dakhliga kireystayaasha, oo diiwaangeli kharashadka.' :
             lang === 'ar' ? 'إدارة عقاراتك ومتابعة الإيرادات وتسجيل المصروفات.' :
             'Manage your properties, track rental income, and log expenses.'}
          </p>
        </div>

        {setActiveLayout && (
          <button
            onClick={() => setActiveLayout('tenant')}
            className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs rounded-xl transition flex items-center gap-2 border border-blue-200 dark:border-blue-800 active:scale-95 shadow-sm"
          >
            <span>🏠</span>
            <span>{t.switchToTenantMode || 'Switch to Tenant View'}</span>
          </button>
        )}
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.listedProperties}</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{formatNumber(myHouses.length)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-xl">
            🏠
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.totalIncome}</span>
            <span className="text-2xl font-black text-emerald-600">${formatNumber(payoutAmount)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            💵
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.totalExpenses || 'Total Expenses'}</span>
            <span className="text-2xl font-black text-rose-600">${formatNumber(totalExpenseAmount)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold text-xl">
            🛠️
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.netProfit || 'Net Profit'}</span>
            <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
              ${formatNumber(netProfit)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-xl">
            📈
          </div>
        </div>
      </div>

      {/* FINANCIAL ACCOUNTING & EXPENSE LEDGER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              📊 {t.financialLedgerTab || 'Financial Ledger & Accounting'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'so' ? 'Dakhliga kireystayaasha, kharashadka guryaha, iyo faa\'iidada net-ka ah' :
               lang === 'ar' ? 'متابعة الإيرادات والمصروفات وصافي الأرباح' :
               'Rental revenue, property maintenance expenses, and net profit analysis.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus size={16} />
            <span>{t.logNewExpenseBtn || 'Log New Expense'}</span>
          </button>
        </div>

        {/* LOGGED EXPENSES TABLE */}
        <div className="pt-1">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {lang === 'so' ? 'Diiwaanka Kharashadka Guryaha' : lang === 'ar' ? 'سجل مصروفات العقارات' : 'Logged Property Expenses'}
          </h4>

          {myExpenses.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
              {t.noExpensesLogged || 'No expenses recorded yet. Click "Log New Expense" above.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">{t.expenseCategory || 'Category'}</th>
                    <th className="p-3">{t.propertyTitleCol || 'Property'}</th>
                    <th className="p-3">{t.expenseDescription || 'Description'}</th>
                    <th className="p-3">{t.expenseDate || 'Date'}</th>
                    <th className="p-3">{t.expenseAmount || 'Amount'}</th>
                    {onDeleteExpense && <th className="p-3 text-right"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                        {exp.category === 'maintenance' ? '🛠️ ' + (t.maintenanceCat || 'Maintenance') :
                         exp.category === 'utilities' ? '💧⚡ ' + (t.utilitiesCat || 'Utilities') :
                         exp.category === 'taxes' ? '🏛️ ' + (t.taxesCat || 'Taxes') :
                         exp.category === 'renovation' ? '🔨 ' + (t.renovationCat || 'Renovation') :
                         exp.category === 'management' ? '👔 ' + (t.managementCat || 'Management') :
                         '📦 ' + (t.otherCat || 'Other')}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{exp.houseTitle || 'All Properties'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{exp.description}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{exp.date}</td>
                      <td className="p-3 font-bold text-rose-600">-${formatNumber(exp.amount)}</td>
                      {onDeleteExpense && (
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* REGISTER NEW PROPERTY FORM */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            <Plus size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.registerPropertyTitle}</h3>
            <p className="text-xs text-slate-400">{t.landlordBannerSub}</p>
          </div>
        </div>

        <form onSubmit={handleCreateHouse} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t.propertyTitleField} *</label>
              <input
                type="text"
                placeholder={lang === 'so' ? 'Tusaale: Villa Casri ah oo 3 Qol ah' : lang === 'ar' ? 'مثال: فيلا راقية ٣ غرف نوم' : 'e.g. Modern 3-Bedroom Luxury Villa'}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t.cityField} *</label>
              <select
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              >
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t.districtField} *</label>
              <input
                type="text"
                placeholder={lang === 'so' ? 'Tusaale: Hodan, Wadajir' : lang === 'ar' ? 'مثال: حي هودان، ودجير' : 'e.g. Hodan, 26 June'}
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t.monthlyRentField} *</label>
              <input
                type="number"
                placeholder="450"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t.depositAmountField} *</label>
              <input
                type="number"
                placeholder="900"
                value={newDeposit}
                onChange={(e) => setNewDeposit(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t.roomsField}</label>
              <select
                value={newRooms}
                onChange={(e) => setNewRooms(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              >
                <option value="1">{t.bed1}</option>
                <option value="2">{t.bed2}</option>
                <option value="3">{t.bed3}</option>
                <option value="4">{t.bed4}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t.bathroomsField}</label>
              <select
                value={newBaths}
                onChange={(e) => setNewBaths(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Amenities toggles */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">{t.infrastructureField}</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newWater}
                  onChange={(e) => setNewWater(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>💧 {t.water}</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newWifi}
                  onChange={(e) => setNewWifi(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>📶 {t.wifi}</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newParking}
                  onChange={(e) => setNewParking(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>🚗 {t.parking}</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">{t.propertyDescriptionField}</label>
            <textarea
              rows={2}
              placeholder={lang === 'so' ? 'Faahfaahin ku saabsan biyaha, korontada, amniga iyo xaaladda guriga...' : lang === 'ar' ? 'تفاصيل إضافية حول الماء والكهرباء والحراسة الأمنية...' : 'Additional details regarding security, power backups, and facilities...'}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Photo Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500">{t.propertyImageUpload}</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition ${
                isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Camera size={32} className="text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.dragImagesHere}</p>
              <p className="text-[10px] text-slate-400 mb-3">{t.imageFormatsGuidance}</p>
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition">
                {t.chooseImageFiles}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(i)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GPS Coordinates & Interactive Map Location */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{t.gpsCoordinatesTitle}</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Navigation size={14} />
                <span>{isGettingLocation ? t.loading : t.getGpsLocationBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="px-3 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <MapPin size={14} />
                <span>{t.selectOnMapBtn}</span>
              </button>
            </div>

            {newLat && newLng && (
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                ✓ {t.gpsDetected}: {newLat.toFixed(4)}, {newLng.toFixed(4)}
              </div>
            )}

            {showMapPicker && (
              <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <MapPicker
                  initialPosition={newLat && newLng ? { lat: newLat, lng: newLng } : { lat: 2.0469, lng: 45.3182 }}
                  onPositionSelect={(lat, lng) => {
                    setNewLat(lat);
                    setNewLng(lng);
                    setNewLocationSource('MAP_SELECTED');
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            {t.submitPropertyBtn}
          </button>
        </form>
      </div>

      {/* MY PROPERTIES TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.myPropertiesTable}</h3>

        {myHouses.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">{t.noPropertiesYet}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-3">{t.propertyTitleField}</th>
                  <th className="pb-3">{t.cityField}</th>
                  <th className="pb-3">{t.monthlyRentField}</th>
                  <th className="pb-3">{t.status}</th>
                  <th className="pb-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myHouses.map(h => (
                  <tr key={h.id} className="text-slate-800 dark:text-slate-200">
                    <td className="py-3 font-bold flex items-center gap-2">
                      <img src={h.imageUrl} alt={h.title} className="w-8 h-8 rounded-lg object-cover" />
                      <span>{h.title}</span>
                    </td>
                    <td className="py-3">{getCityName(h.city)}</td>
                    <td className="py-3 font-bold text-blue-600">${formatNumber(h.pricePerMonth)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {h.status === 'available' ? t.available : t.rented}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onDeleteHouse(h.id)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TENANT APPLICATIONS SECTION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.tenantApplicationsTable}</h3>

        {pendingApplications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            {lang === 'so' ? 'Ma jiraan codsiyo kireysi oo cusub hadda.' : lang === 'ar' ? 'لا توجد طلبات استئجار معلقة حالياً.' : 'No pending tenant applications at this time.'}
          </p>
        ) : (
          <div className="space-y-3">
            {pendingApplications.map(app => (
              <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">{app.tenantName}</span>
                  <span className="text-xs text-slate-500 block">{app.tenantPhone}</span>
                  <span className="text-xs text-blue-600 font-medium block mt-1">{app.houseTitle}</span>
                  <span className="text-[10px] text-slate-400 block">{t.proposedDate}: {formatDate(app.proposedStartDate)}</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onApproveApplication(app.id);
                      alert(lang === 'so' ? 'Codsiga kireysiga waa la oggolaaday!' : lang === 'ar' ? 'تمت الموافقة على طلب المستأجر بنجاح!' : 'Application approved successfully!');
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    {t.approveApplicationBtn}
                  </button>

                  <button
                    onClick={() => setRejectionAppId(app.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    {t.rejectApplicationBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectionAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setRejectionAppId(null)}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.rejectionReasonModalTitle}</h3>
            
            <textarea
              rows={3}
              placeholder={t.rejectionReasonPlaceholder}
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            />

            <button
              onClick={() => {
                onRejectApplication(rejectionAppId, rejectionFeedback);
                setRejectionAppId(null);
                setRejectionFeedback('');
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {t.confirmDeclineBtn}
            </button>
          </div>
        </div>
      )}

      {/* LOG NEW EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowExpenseModal(false)}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🛠️</span> {t.logNewExpenseBtn || 'Log New Expense'}
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.expenseCategory || 'Category'} *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                >
                  <option value="maintenance">🛠️ {t.maintenanceCat || 'Maintenance & Repairs'}</option>
                  <option value="utilities">💧⚡ {t.utilitiesCat || 'Utilities & Bills'}</option>
                  <option value="taxes">🏛️ {t.taxesCat || 'Taxes & Govt Fees'}</option>
                  <option value="renovation">🔨 {t.renovationCat || 'Renovation & Upgrades'}</option>
                  <option value="management">👔 {t.managementCat || 'Management & Agent Fees'}</option>
                  <option value="other">📦 {t.otherCat || 'Other Expenses'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.propertyTitleCol || 'Property'} (Optional)</label>
                <select
                  value={expHouseId}
                  onChange={(e) => setExpHouseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                >
                  <option value="">{lang === 'so' ? 'Dhammaan Guryaha' : 'All Properties'}</option>
                  {myHouses.map(h => (
                    <option key={h.id} value={h.id}>{h.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.expenseAmount || 'Amount ($)'} *</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.expenseDescription || 'Description'} *</label>
                <input
                  type="text"
                  placeholder="e.g. Fixed plumbing leak in bathroom"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                {t.logNewExpenseBtn || 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
