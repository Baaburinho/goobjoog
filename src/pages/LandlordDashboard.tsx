// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Home, Check, X, Camera, Image, Monitor, Smartphone, MapPin, Navigation, Crosshair } from 'lucide-react';
import type { House, Application, UserProfile } from '../domain/entities';
import { HouseStatus, UserRole } from '../domain/enums';
import { translations } from '../lib/translations';
import { MapPicker } from '../components/MapPicker';

interface LandlordDashboardProps {
  houses: House[];
  applications: Application[];
  payoutAmount: number;
  currentLandlord: UserProfile;
  onRegisterHouse: (newHouse: House) => void;
  onDeleteHouse: (houseId: string) => void;
  onApproveApplication: (appId: string) => void;
  onRejectApplication: (appId: string, feedback: string) => void;
  addAuditLog: (action: string, details: string) => void;
  lang: 'en' | 'so' | 'ar';
  activeLayout: 'tenant' | 'homeowner' | 'accountant' | 'administrator';
  setActiveLayout: (layout: 'tenant' | 'homeowner' | 'accountant' | 'administrator') => void;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
  houses,
  applications,
  payoutAmount,
  currentLandlord,
  onRegisterHouse,
  onDeleteHouse,
  onApproveApplication,
  onRejectApplication,
  addAuditLog,
  lang,
  activeLayout,
  setActiveLayout
}) => {
  const t = translations[lang];
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
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
      // Validate format
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isValidExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
      
      if (!validTypes.includes(file.type.toLowerCase()) && !isValidExt) {
        alert("Only JPG, JPEG, PNG, and WebP images are allowed.");
        continue;
      }

      // Validate size (5 MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("The selected image exceeds the maximum size of 5 MB.");
        continue;
      }

      try {
        const fileHash = await computeSHA256(file);
        if (uploadedHashes.includes(fileHash)) {
          // Ignore duplicates silently
          continue;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setUploadedImages(prev => {
            if (prev.length >= 10) {
              alert("You may upload a maximum of 10 images per property.");
              return prev;
            }
            setUploadedHashes(hPrev => [...hPrev, fileHash]);
            return [...prev, base64];
          });
        };
        reader.readAsDataURL(file);
      } catch (err) {
        alert("The image could not be uploaded. Please try again.");
      }
    }
  };

  const handleGPSLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewLat(position.coords.latitude);
        setNewLng(position.coords.longitude);
        setNewLocationSource('GPS_VERIFIED');
        setIsGettingLocation(false);
        setShowMapPicker(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Please ensure you have granted location permissions.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setUploadedHashes(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newPrice || !newDistrict) {
      alert("Please fill in all required fields.");
      return;
    }

    if (uploadedImages.length === 0) {
      alert("Please upload at least one photo of the property before continuing.");
      return;
    }

    if (!newLat || !newLng || !newLocationSource) {
      alert("Please provide the exact location of the property using GPS or Map selection.");
      return;
    }

    const price = parseFloat(newPrice);
    const deposit = newDeposit ? parseFloat(newDeposit) : 0;

    const newHouseItem: House = {
      id: 'h-' + Math.random().toString(36).substr(2, 9),
      landlordId: currentLandlord.id,
      landlordName: currentLandlord.fullName,
      landlordPhone: currentLandlord.phone,
      city: newCity,
      district: newDistrict,
      title: newTitle,
      description: newDesc,
      pricePerMonth: price,
      depositAmount: deposit,
      roomsCount: parseInt(newRooms),
      bathroomsCount: parseInt(newBaths),
      facilities: {
        wifi: newWifi,
        water_24_7: newWater,
        parking: newParking
      },
      coordinates: { lat: newLat, lng: newLng },
      locationSource: newLocationSource,
      status: HouseStatus.Available,
      imageUrl: uploadedImages[0], // First image is cover
      additionalImages: uploadedImages.slice(1), // Rest are gallery
      ratingSum: 0,
      ratingCount: 0,
      reviews: []
    };

    onRegisterHouse(newHouseItem);
    
    // Reset Form
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
    setShowMapPicker(false);
    alert("Property listed successfully on GoobJoog!");
  };

  const submitRejection = () => {
    if (!rejectionAppId) return;
    onRejectApplication(rejectionAppId, rejectionFeedback);
    setRejectionAppId(null);
    setRejectionFeedback('');
    alert("Application rejected and feedback submitted.");
  };

  // Filter calculations
  const myHouses = houses.filter(h => h.landlordId === currentLandlord.id);
  const myApplications = applications.filter(a => {
    const h = houses.find(house => house.id === a.houseId);
    return h?.landlordId === currentLandlord.id;
  });

  const pendingAppsCount = myApplications.filter(a => a.status === 'pending').length;
  const rentedCount = myHouses.filter(h => h.status === HouseStatus.Rented).length;
  const occupancyRate = myHouses.length > 0 ? Math.round((rentedCount / myHouses.length) * 100) : 0;



  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Switch to Tenant Mode Header Trigger */}
      {currentLandlord.roles.includes(UserRole.Tenant) && (
        <div className="lg:col-span-12 flex justify-between items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-black text-slate-850">
              {lang === 'so' ? '💼 Dashboard-ka Maamulka Mulkiilaha' : lang === 'ar' ? 'لوحة تحكم إدارة المالك' : 'Homeowner Management Console'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold">
              {lang === 'so' ? 'Maamusho dakhliga iyo guryaha diiwaan-gashan.' : lang === 'ar' ? 'إدارة العقارات والتدفقات المالية الواردة.' : 'Coordinate rental income and registered properties.'}
            </span>
          </div>
          <button
            onClick={() => setActiveLayout('tenant')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <span>🔍</span> {lang === 'so' ? 'Raadi Guri (Tenant Mode)' : lang === 'ar' ? 'البحث عن مسكن (وضع المستأجر)' : 'Search for Property (Tenant Mode)'}
          </button>
        </div>
      )}
      
      {/* LANDLORD LEFT SIDEBAR & FORMS */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* NEW LISTING FORM */}
        <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            {t.registerProperty}
          </h3>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.propertyTitle} *</label>
              <input
                type="text"
                placeholder={lang === 'so' ? 'Hodan Villa, guri casri ah' : lang === 'ar' ? 'شقة عصرية، فيلا في هودن' : 'e.g. Modern Apartment, Hodan Villa'}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.description} *</label>
              <textarea
                rows={3}
                placeholder={lang === 'so' ? 'Faahfaahinta qolalka, biyaha, nabadgalyada, beerka...' : lang === 'ar' ? 'تفاصيل عن الغرف، حالة المياه، الأمن، الحديقة...' : 'Details about rooms, water state, security, garden...'}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.monthlyRent} *</label>
                <input
                  type="number"
                  placeholder="300"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.depositAmount}</label>
                <input
                  type="number"
                  placeholder="600"
                  value={newDeposit}
                  onChange={(e) => setNewDeposit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.rooms}</label>
                <select
                  value={newRooms}
                  onChange={(e) => setNewRooms(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none bg-white dark:bg-slate-900 text-slate-850 font-semibold"
                >
                  <option value="1">1 {lang === 'so' ? 'Qol' : lang === 'ar' ? 'غرفة' : 'Bed'}</option>
                  <option value="2">2 {lang === 'so' ? 'Qolal' : lang === 'ar' ? 'غرف' : 'Beds'}</option>
                  <option value="3">3 {lang === 'so' ? 'Qolal' : lang === 'ar' ? 'غرف' : 'Beds'}</option>
                  <option value="4">4 {lang === 'so' ? 'Qolal' : lang === 'ar' ? 'غرف' : 'Beds'}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.bathrooms}</label>
                <select
                  value={newBaths}
                  onChange={(e) => setNewBaths(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none bg-white dark:bg-slate-900 text-slate-850 font-semibold"
                >
                  <option value="1">1 {lang === 'so' ? 'Musqul' : lang === 'ar' ? 'حمام' : 'Bath'}</option>
                  <option value="2">2 {lang === 'so' ? 'Musqulo' : lang === 'ar' ? 'حمامات' : 'Baths'}</option>
                  <option value="3">3 {lang === 'so' ? 'Musqulo' : lang === 'ar' ? 'حمامات' : 'Baths'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.city}</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none bg-white dark:bg-slate-900 text-slate-850 font-semibold"
                >
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
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.district} *</label>
                <input
                  type="text"
                  placeholder={lang === 'so' ? 'Degmada Hodan, Calanley' : lang === 'ar' ? 'حي هودن، كالانلي' : 'e.g. Hodan, Calanley'}
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">{t.infrastructure}</label>
              <div className="flex flex-wrap gap-3 mt-1.5">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-bold">
                  <input type="checkbox" checked={newWifi} onChange={(e) => setNewWifi(e.target.checked)} className="rounded text-brand-primary" />
                  {t.wifi}
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-bold">
                  <input type="checkbox" checked={newWater} onChange={(e) => setNewWater(e.target.checked)} className="rounded text-brand-primary" />
                  {t.water}
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-bold">
                  <input type="checkbox" checked={newParking} onChange={(e) => setNewParking(e.target.checked)} className="rounded text-brand-primary" />
                  {t.parking}
                </label>
              </div>
            </div>

            {/* LOCATION PICKER SECTION */}
            <div className="border border-slate-200 dark:border-slate-800 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Property Location *</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={handleGPSLocation}
                  disabled={isGettingLocation}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded border transition shadow-sm ${newLocationSource === 'GPS_VERIFIED' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'}`}
                >
                  <Crosshair size={18} className={newLocationSource === 'GPS_VERIFIED' ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-[10px] font-bold">📍 I'm at the property</span>
                  <span className="text-[8px] text-slate-500 dark:text-slate-500">{isGettingLocation ? 'Acquiring...' : 'Use Current GPS Location'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded border transition shadow-sm ${newLocationSource === 'MAP_SELECTED' ? 'bg-brand-primary-light/10 border-brand-primary text-brand-primary' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-primary'}`}
                >
                  <MapPin size={18} className={newLocationSource === 'MAP_SELECTED' ? 'text-brand-primary' : 'text-slate-400'} />
                  <span className="text-[10px] font-bold">🗺️ I'm not at the property</span>
                  <span className="text-[8px] text-slate-500 dark:text-slate-500">Choose Property on Map</span>
                </button>
              </div>

              {showMapPicker && (
                <div className="mb-3 border-2 border-brand-primary rounded-lg overflow-hidden h-64 shadow-sm">
                  <MapPicker 
                    onPositionSelect={(lat, lng) => {
                      setNewLat(lat);
                      setNewLng(lng);
                      setNewLocationSource('MAP_SELECTED');
                    }} 
                  />
                  <div className="bg-brand-primary text-white text-[10px] font-bold p-1.5 text-center">
                    Drag the map to pinpoint the exact location
                  </div>
                </div>
              )}

              {(newLat && newLng) && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-2 rounded text-[9px] text-emerald-700 font-bold">
                  <Check size={12} className="text-emerald-600" />
                  Location successfully registered! 
                  ({newLat.toFixed(4)}, {newLng.toFixed(4)}) - {newLocationSource === 'GPS_VERIFIED' ? 'GPS Verified' : 'Map Selected'}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">{t.propertyImage} *</label>
                <span className="text-[8px] bg-brand-primary-light/10 text-brand-primary font-bold px-1.5 py-0.2 rounded uppercase">
                  {t.required} (1 - 10)
                </span>
              </div>
              
              <div className="text-[10px] text-slate-600 dark:text-slate-400 mb-2 font-medium bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/60">
                {lang === 'so' ? `📸 Soo geli sawir cad oo guriga ah ee ku yaala` :
                 lang === 'ar' ? `📸 يرجى تحميل صورة واضحة للعقار الموجود في` :
                 `📸 Upload a clear photo of the property located in`} <strong className="text-brand-primary">{
                   lang === 'so' && newCity === 'Mogadishu' ? 'Muqdisho' :
                   lang === 'so' && newCity === 'Hargeisa' ? 'Hargeysa' :
                   lang === 'so' && newCity === 'Garowe' ? 'Garoowe' :
                   lang === 'so' && newCity === 'Kismayo' ? 'Kismaayo' :
                   lang === 'so' && newCity === 'Baidoa' ? 'Baydhabo' :
                   lang === 'so' && newCity === 'Galkayo' ? 'Gaalkacayo' :
                   lang === 'so' && newCity === 'Bosaso' ? 'Boosaaso' :
                   lang === 'so' && newCity === 'Burao' ? 'Burco' :
                   lang === 'so' && newCity === 'Beledweyne' ? 'Beledweyne' :
                   lang === 'so' && newCity === 'Dhusamareb' ? 'Dhuusamareeb' :
                   lang === 'so' && newCity === 'Jowhar' ? 'Jowhar' :
                   lang === 'so' && newCity === 'Berbera' ? 'Berbera' :
                   lang === 'ar' && newCity === 'Mogadishu' ? 'مقديشو' :
                   lang === 'ar' && newCity === 'Hargeisa' ? 'هرجيسا' :
                   lang === 'ar' && newCity === 'Garowe' ? 'غاروي' :
                   lang === 'ar' && newCity === 'Kismayo' ? 'كيسمايو' :
                   lang === 'ar' && newCity === 'Baidoa' ? 'بيدوا' :
                   lang === 'ar' && newCity === 'Galkayo' ? 'جالكعيو' :
                   lang === 'ar' && newCity === 'Bosaso' ? 'بوساسو' :
                   lang === 'ar' && newCity === 'Burao' ? 'برعو' :
                   lang === 'ar' && newCity === 'Beledweyne' ? 'بلدوين' :
                   lang === 'ar' && newCity === 'Dhusamareb' ? 'دوسمريب' :
                   lang === 'ar' && newCity === 'Jowhar' ? 'جوهر' :
                   lang === 'ar' && newCity === 'Berbera' ? 'بربرة' :
                   newCity
                 }</strong>.
              </div>

              <div className="flex flex-col gap-3">
                {/* Drag and Drop Zone or Mobile camera snap buttons */}
                {isMobile ? (
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[8px] font-bold text-brand-primary uppercase flex items-center gap-1">
                      <Smartphone size={10} /> {lang === 'so' ? 'Qaabka Mobilada' : lang === 'ar' ? 'وضع الهاتف المحمول' : 'Mobile Mode'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-primary bg-white dark:bg-slate-900 cursor-pointer transition text-center shadow-sm">
                        <Camera className="text-brand-primary" size={20} />
                        <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">{lang === 'so' ? 'Kaamirada' : lang === 'ar' ? 'التقاط صورة' : 'Take Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      <label className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-primary bg-white dark:bg-slate-900 cursor-pointer transition text-center shadow-sm">
                        <Image className="text-emerald-600" size={20} />
                        <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">{lang === 'so' ? 'Galariiga' : lang === 'ar' ? 'معرض الصور' : 'Photo Gallery'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
                    <label 
                      className={`flex flex-col items-center justify-center gap-2.5 p-5 rounded-lg border-2 border-dashed transition text-center cursor-pointer shadow-sm ${
                        isDragActive ? 'border-brand-primary bg-blue-50/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-350'
                      }`}
                    >
                      <Monitor className="text-slate-400" size={22} />
                      <div className="text-xs">
                        <span className="text-brand-primary font-bold">{t.chooseFiles}</span> {t.dragHere}
                      </div>
                      <span className="text-[9px] text-slate-400">{t.formats}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Uploaded Images Gallery Grid */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                      {t.uploadedPhotos} ({uploadedImages.length} / 10)
                    </span>
                    {uploadedImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUploadedImages([])}
                        className="text-[8px] font-bold text-rose-600 hover:underline"
                      >
                        {t.clearAll}
                      </button>
                    )}
                  </div>

                  {uploadedImages.length === 0 ? (
                    <div className="text-slate-400 text-[10px] font-medium leading-relaxed italic text-center py-4">
                      {t.noImageYet}
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-brand-primary/90 text-white text-[7px] font-black text-center py-0.5 uppercase tracking-wide">
                              Cover
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition shadow"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold py-2 rounded-input transition flex items-center justify-center gap-1.5 shadow"
            >
              <Plus size={14} />
              {t.registerProperty}
            </button>
          </form>
        </div>

      </div>

      {/* LANDLORD MAIN METRICS & DATA GRIDS */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-card shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Income</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">${payoutAmount} USD</div>
            <div className="text-[9px] text-emerald-600 font-bold mt-1">90% Ledger Settled</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-card shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Listed Properties</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{myHouses.length} Houses</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-500 mt-1">Listed in database</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-card shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Rented Units</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{rentedCount} Units</div>
            <div className="text-[9px] text-brand-primary font-bold mt-1">Steady cash flow</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-card shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-400">Pending Requests</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{pendingAppsCount} Apps</div>
            <div className="text-[9px] text-amber-600 font-bold mt-1">Awaiting actions</div>
          </div>
        </div>

        {/* GOOBJOOG BUSINESS & OCCUPANCY ANALYTICS DESK */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-card shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💼</span>
              {lang === 'so' ? 'Qaybta Xisaabaadka & Kirada' : lang === 'ar' ? 'لوحة تحليلات العقارات والتدفقات' : 'Real Estate Business & Occupancy Analytics'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Circular Occupancy Ring */}
            <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/50 pb-6 md:pb-0 md:pr-6">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="transparent" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    className="text-brand-primary" 
                    strokeWidth="12" 
                    strokeDasharray="314.16" 
                    strokeDashoffset={314.16 - (314.16 * occupancyRate) / 100} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-800 dark:text-slate-200">{occupancyRate}%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'so' ? 'Kireysan' : lang === 'ar' ? 'مؤجر' : 'Occupied'}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 mt-2 text-center">{t.occupancyRate}</span>
            </div>

            {/* Monthly CSS Bar Chart */}
            <div className="md:col-span-7 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rental Income Trend (USD)</span>
              
              <div className="flex items-end justify-between h-24 pt-4 border-b border-slate-150 px-2 font-mono text-[9px] text-slate-500 dark:text-slate-500">
                <div className="flex flex-col items-center gap-1.5 w-10">
                  <div className="w-4 bg-slate-200 rounded-t hover:bg-slate-350 transition-all" style={{ height: '20px' }} title="Jan: $350"></div>
                  <span>Jan</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-10">
                  <div className="w-4 bg-slate-200 rounded-t hover:bg-slate-350 transition-all" style={{ height: '40px' }} title="Feb: $700"></div>
                  <span>Feb</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-10">
                  <div className="w-4 bg-slate-200 rounded-t hover:bg-slate-350 transition-all" style={{ height: '30px' }} title="Mar: $520"></div>
                  <span>Mar</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-10">
                  <div className="w-4 bg-slate-200 rounded-t hover:bg-slate-350 transition-all" style={{ height: '60px' }} title="Apr: $1050"></div>
                  <span>Apr</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-10">
                  <div className="w-4 bg-slate-200 rounded-t hover:bg-slate-350 transition-all" style={{ height: '75px' }} title="May: $1200"></div>
                  <span>May</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-10">
                  {/* Dynamic June bar matching total landlord payouts */}
                  <div 
                    className="w-4 bg-brand-primary rounded-t hover:bg-brand-primary-dark transition-all" 
                    style={{ height: `${Math.max(10, Math.min(90, Math.round((payoutAmount / 2000) * 100)))}px` }} 
                    title={`Jun: $${payoutAmount}`}
                  ></div>
                  <span className="text-brand-primary font-bold">Jun</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RENTAL APPLICATIONS DESK */}
        <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            Tenant Rental Requests
          </h3>

          <div className="flex flex-col gap-3">
            {myApplications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No applications received yet for your listed properties.</p>
            ) : (
              myApplications.map((app) => (
                <div key={app.id} className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{app.tenantName}</h4>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono">{app.tenantPhone}</span>
                    </div>
                    <p className="text-[11px] text-slate-650 font-medium mt-1">House: <strong className="text-brand-primary">{app.houseTitle}</strong></p>
                    <p className="text-[9px] text-slate-400">Start Date: {app.proposedStartDate}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'pending' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onApproveApplication(app.id)}
                          className="bg-brand-secondary hover:bg-brand-secondary-dark text-white text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectionAppId(app.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded transition border border-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        app.status === 'rented' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {app.status}
                      </span>
                    )}

                    {/* Real WhatsApp chat redirect link for applications */}
                    {(() => {
                      const tenantPhone = app.tenantPhone.replace(/\+/g, '').replace(/\s/g, '').trim();
                      const statusLabel = app.status === 'pending' ? 'Codsiga' : app.status === 'approved' ? 'La Ogolaaday' : app.status === 'rejected' ? 'La Diiday' : 'La Renteeyey';
                      const whatsappMsg = lang === 'so'
                        ? `Asc, waxaan ahay mulkiilaha guriga. Waxaan ku ogeysiinayaa inaan go'aan ka qaatay codsigaagii guri kireysiga ee GoobJoog: heerka codsigu hadda waa *${statusLabel}*.`
                        : lang === 'ar'
                        ? `مرحباً، أنا مالك العقار. أود إبلاغك بتحديث حالة طلب الإيجار الخاص بك على نظام جوب جوج: الحالة الآن هي *${app.status.toUpperCase()}*.`
                        : `Hello, I am the landlord. I would like to update you on your GoobJoog rent application status: it is now *${app.status.toUpperCase()}*.`;
                      const waLink = `https://wa.me/${tenantPhone}?text=${encodeURIComponent(whatsappMsg)}`;

                      return (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2 py-1.5 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-wide uppercase transition decoration-none shadow-sm"
                        >
                          <span>💬</span> SMS
                        </a>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LIST OF REGISTERED PROPERTIES */}
        <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            My Properties Inventory
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[9px] font-bold">
                  <th className="py-2.5">House Title</th>
                  <th className="py-2.5">Location</th>
                  <th className="py-2.5">Monthly Cost</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {myHouses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No properties listed. Complete the form to list your first home!</td>
                  </tr>
                ) : (
                  myHouses.map(house => (
                    <tr key={house.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:bg-slate-950/50 transition">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{house.title}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-500">{house.city}, {house.district}</td>
                      <td className="py-3 font-bold text-brand-primary">${house.pricePerMonth} / mo</td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          house.status === 'available' ? 'bg-emerald-50 text-emerald-700' :
                          house.status === 'rented' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {house.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onDeleteHouse(house.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* REJECTION FEEDBACK MODAL */}
      {rejectionAppId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-card max-w-sm w-full p-5 relative shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50 pb-2">Provide Rejection Reason</h3>
            <textarea
              rows={3}
              placeholder="e.g. Deposit check failed, dates conflict..."
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-brand-primary"
            />
            <div className="flex gap-2">
              <button onClick={submitRejection} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 rounded">
                Confirm Rejection
              </button>
              <button onClick={() => setRejectionAppId(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
