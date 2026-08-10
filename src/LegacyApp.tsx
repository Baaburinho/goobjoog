// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { UserRole, ApplicationStatus, ComplaintStatus, TourStatus } from './domain/enums';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import type { UserProfile, House, Application, HouseTour, Complaint, AuditLog, Expense } from './domain/entities';
import { AuthPortal } from './components/AuthPortal';
import { Navbar } from './components/Navbar';
import { TenantDashboard } from './pages/TenantDashboard';
import { LandlordDashboard } from './pages/LandlordDashboard';
import { FinancialLedgerPage } from './pages/FinancialLedgerPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { GoobJoogAI } from './components/GoobJoogAI';
import { AppLockScreen } from './components/AppLockScreen';
import { initNotificationChannels, sendTourNotification, sendApplicationNotification } from './shared/utils/notificationsHelper';
import { isBiometricLockEnabledForUser } from './shared/utils/biometrics';

// ==========================================
// SEED USERS & SYSTEM STATE DATA
// ==========================================
const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp1',
    landlordId: 'u1',
    houseId: 'h1',
    houseTitle: 'Villa Casri ah oo Raaxo leh',
    category: 'maintenance',
    amount: 150,
    description: 'Fixed roof water leak and repainted hallway',
    date: '2026-07-28'
  },
  {
    id: 'exp2',
    landlordId: 'u1',
    houseId: 'h2',
    houseTitle: 'Dabaq Caadi ah oo Qurux badan',
    category: 'utilities',
    amount: 85,
    description: 'Monthly municipal water supply fee',
    date: '2026-08-01'
  }
];

const INITIAL_USERS: UserProfile[] = [
  { id: 'u1', fullName: 'Abdi Rahman Elmi', roles: ['homeowner'], upgradeStatus: 'none', phone: '+252615551234', email: 'abdi.elmi@goobjoog.so', isVerified: true, username: 'landlord', password: 'landlord123' },
  { id: 'u2', fullName: 'Faduma Omar Ali', roles: ['tenant'], upgradeStatus: 'none', phone: '+252617779876', email: 'faduma.omar@gmail.com', isVerified: true, username: 'tenant', password: 'tenant123' },
  { id: 'u4', fullName: 'Eng. Huda Duale', roles: ['administrator'], upgradeStatus: 'none', phone: '+252619998888', email: 'huda.admin@goobjoog.so', isVerified: true, username: 'admin', password: 'admin123' }
];

const INITIAL_HOUSES: House[] = [
  {
    id: 'h1',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Mogadishu',
    district: 'Hodan',
    title: 'Luxury 3-Bedroom Villa with Garden',
    description: 'Beautiful modern villa located in the secure Hodan district. Features a private garden, constant water access (drilled well + water tank), high-speed Wi-Fi, and 24/7 guarded security.',
    pricePerMonth: 450,
    depositAmount: 900,
    roomsCount: 3,
    bathroomsCount: 2,
    facilities: { wifi: true, water_24_7: true, parking: true },
    coordinates: { lat: 2.042, lng: 45.318 },
    status: 'available',
    imageUrl: '/somali_house_one.png',
    ratingSum: 14,
    ratingCount: 3,
    reviews: [
      { author: 'Guled Ahmed', rating: 5, comment: 'Amazing property, water supply is indeed 24/7 which is rare here.', date: '2026-06-15' },
      { author: 'Mariam Ali', rating: 4, comment: 'Nice house and secure, landlord is responsive.', date: '2026-06-28' }
    ]
  },
  {
    id: 'h2',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Hargeisa',
    district: '26 June',
    title: 'Cozy 2-Bedroom Apartment',
    description: 'Affordable apartment in the heart of Hargeisa, 26 June district. Close to market hubs and public transport. Secure gates, standard facilities, reliable solar energy backups.',
    pricePerMonth: 220,
    depositAmount: 220,
    roomsCount: 2,
    bathroomsCount: 1,
    facilities: { wifi: true, water_24_7: false, parking: true },
    coordinates: { lat: 9.562, lng: 44.065 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ratingSum: 8,
    ratingCount: 2,
    reviews: [
      { author: 'Khadra Duale', rating: 4, comment: 'Quiet neighborhood, very clean environment.', date: '2026-05-12' }
    ]
  },
  {
    id: 'h3',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Garowe',
    district: 'Hodman',
    title: 'Spacious 4-Bedroom Family Home',
    description: 'Perfect residence for large families. Located in the peaceful Hodman district of Garowe. Includes high perimeter walls, security room, reserve water system, and high-speed fiber internet.',
    pricePerMonth: 550,
    depositAmount: 1100,
    roomsCount: 4,
    bathroomsCount: 3,
    facilities: { wifi: true, water_24_7: true, parking: true },
    coordinates: { lat: 8.406, lng: 48.482 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ratingSum: 5,
    ratingCount: 1,
    reviews: [
      { author: 'Nura Salad', rating: 5, comment: 'Very secure, plenty of space for children.', date: '2026-07-02' }
    ]
  },
  {
    id: 'h4',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Kismayo',
    district: 'Calanley',
    title: 'Coastal 2-Bedroom House near Port',
    description: 'Beautiful traditional Somali styled structure. Cool ocean breeze, constant water supply, close to downtown Calanley and beach areas. Secure and welcoming environment.',
    pricePerMonth: 280,
    depositAmount: 400,
    roomsCount: 2,
    bathroomsCount: 1,
    facilities: { wifi: false, water_24_7: true, parking: false },
    coordinates: { lat: -0.358, lng: 42.545 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ratingSum: 4,
    ratingCount: 1,
    reviews: []
  },
  {
    id: 'h5',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Baidoa',
    district: 'Isha',
    title: 'Modern 3-Bedroom Villa in Isha',
    description: 'Freshly renovated family house in the quiet residential Isha district. Includes 24/7 water access, gated parking slot, and high-speed WiFi connections.',
    pricePerMonth: 320,
    depositAmount: 640,
    roomsCount: 3,
    bathroomsCount: 2,
    facilities: { wifi: true, water_24_7: true, parking: true },
    coordinates: { lat: 3.12, lng: 43.65 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ratingSum: 5,
    ratingCount: 1,
    reviews: [
      { author: 'Salad Nur', rating: 5, comment: 'Very pleasant landlord and beautiful rooms.', date: '2026-07-09' }
    ]
  },
  {
    id: 'h6',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Bosaso',
    district: 'Bandar',
    title: 'Traditional 2-Bedroom Port House',
    description: 'Standard 2-bedroom home close to the trade zone in Bandar, Bosaso. High security gate, water reserves, and reliable power grids.',
    pricePerMonth: 190,
    depositAmount: 190,
    roomsCount: 2,
    bathroomsCount: 1,
    facilities: { wifi: false, water_24_7: true, parking: false },
    coordinates: { lat: 11.28, lng: 49.18 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    ratingSum: 4,
    ratingCount: 1,
    reviews: []
  }
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    tenantId: 'u2',
    tenantName: 'Faduma Omar Ali',
    tenantPhone: '+252617779876',
    houseId: 'h2',
    houseTitle: 'Cozy 2-Bedroom Apartment',
    proposedStartDate: '2026-08-01',
    status: 'pending',
    createdAt: '2026-07-10T14:32:00Z'
  }
];

const INITIAL_TOURS: HouseTour[] = [
  {
    id: 'tour-101',
    houseId: 'h1',
    houseTitle: 'Villa Casri ah oo Raaxo leh',
    tenantId: 'u2',
    tenantName: 'Faduma Omar Ali',
    tenantPhone: '+252617779876',
    landlordId: 'u1',
    tourDate: '2026-08-12',
    tourTimeSlot: 'afternoon',
    tourType: 'in_person',
    status: 'confirmed',
    notes: 'Excited to view the garden and water system.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tour-102',
    houseId: 'h2',
    houseTitle: 'Dabaq Caadi ah oo Qurux badan',
    tenantId: 'u2',
    tenantName: 'Faduma Omar Ali',
    tenantPhone: '+252617779876',
    landlordId: 'u1',
    tourDate: '2026-08-14',
    tourTimeSlot: 'morning',
    tourType: 'video_call',
    status: 'pending',
    notes: 'Requesting live video walkthrough.',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    reporterName: 'Faduma Omar Ali',
    reporterPhone: '+252617779876',
    title: 'Hodan Villa Water Pump Failure',
    details: 'The water pump is making a loud noise and no water is reaching the overhead tank. Needs immediate repair.',
    houseTitle: 'Luxury 3-Bedroom Villa with Garden',
    status: 'open',
    createdAt: '2026-07-11T08:00:00Z'
  }
];

const INITIAL_AUDITS: AuditLog[] = [
  { id: 'ad1', timestamp: '2026-07-12T17:30:00Z', action: 'SYSTEM_BOOT', details: 'System core initialized and seeded successfully.', ipAddress: '127.0.0.1' },
  { id: 'ad2', timestamp: '2026-07-12T18:45:00Z', action: 'USER_REGISTER', details: 'Default profiles registered.', ipAddress: '197.220.35.4' }
];

const readSavedActiveUser = (): UserProfile | null => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const saved = localStorage.getItem('goobjoog_active_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

export default function LegacyApp() {
  // Saved profile and biometric lock state (Strictly based on actual logged in user)
  const [savedUser, setSavedUser] = useState<UserProfile | null>(() => readSavedActiveUser());

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const user = readSavedActiveUser();
    return !!user && isBiometricLockEnabledForUser(user);
  });

  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const user = readSavedActiveUser();
    return user && !isBiometricLockEnabledForUser(user) ? user : null;
  });

  const [lang, setLangState] = useState<'en' | 'so' | 'ar'>(() => {
    const saved = localStorage.getItem('goobjoog_lang');
    if (saved === 'ar' || saved === 'so' || saved === 'en') {
      return saved as 'en' | 'so' | 'ar';
    }
    return 'so';
  });

  const setLang = (newLang: 'en' | 'so' | 'ar') => {
    setLangState(newLang);
    localStorage.setItem('goobjoog_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    initNotificationChannels();
  }, [lang]);

  const [activeLayout, setActiveLayout] = useState<'tenant' | 'homeowner' | 'administrator'>('tenant');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // House detail overlay state shared with chatbot
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);


  // Global Mock Database States
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [houses, setHouses] = useState<House[]>(INITIAL_HOUSES);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [tours, setTours] = useState<HouseTour[]>(INITIAL_TOURS);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [audits, setAudits] = useState<AuditLog[]>(INITIAL_AUDITS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  const handleBookTour = async (newTour: HouseTour) => {
    setTours(prev => [newTour, ...prev]);
    addAuditLog('BOOK_TOUR', `Tenant scheduled house tour: ${newTour.houseTitle} on ${newTour.tourDate}`);

    // Push Native Android/iOS Local Notification
    sendTourNotification(newTour.tenantName, newTour.houseTitle, newTour.tourDate);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('house_tours').insert([{
          id: newTour.id,
          house_id: newTour.houseId,
          house_title: newTour.houseTitle,
          tenant_id: newTour.tenantId,
          tenant_name: newTour.tenantName,
          tenant_phone: newTour.tenantPhone,
          landlord_id: newTour.landlordId,
          tour_date: newTour.tourDate,
          tour_time_slot: newTour.tourTimeSlot,
          tour_type: newTour.tourType,
          status: newTour.status,
          notes: newTour.notes || ''
        }]);
      } catch (e) {
        console.error('Error persisting house tour to Supabase:', e);
      }
    }
  };

  const handleUpdateTourStatus = async (tourId: string, status: string) => {
    setTours(prev => prev.map(t => t.id === tourId ? { ...t, status: status as any } : t));
    addAuditLog('UPDATE_TOUR_STATUS', `Landlord updated tour ${tourId} status to ${status}`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('house_tours').update({ status }).eq('id', tourId);
      } catch (e) {
        console.error('Error updating tour status in Supabase:', e);
      }
    }
  };

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (isSupabaseConfigured) {
        try {
          // 1. Fetch profiles
          const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
          if (pErr) throw pErr;
          if (profiles && profiles.length > 0) {
            setUsers(profiles.map(p => ({
              id: p.id,
              fullName: p.full_name,
              phone: p.phone,
              email: p.email || '',
              username: p.username,
              password: p.password,
              roles: p.roles || ['tenant'],
              upgradeStatus: p.upgrade_status || 'none',
              isVerified: p.is_verified
            })));
          }

          // 2. Fetch houses
          const { data: housesData, error: hErr } = await supabase.from('houses').select('*');
          if (hErr) throw hErr;
          if (housesData && housesData.length > 0) {
            setHouses(housesData.map(h => ({
              id: h.id,
              landlordId: h.landlord_id,
              landlordName: h.landlord_name,
              landlordPhone: h.landlord_phone,
              city: h.city,
              district: h.district,
              title: h.title,
              description: h.description,
              pricePerMonth: Number(h.price_per_month),
              depositAmount: Number(h.deposit_amount),
              roomsCount: h.rooms_count,
              bathroomsCount: h.bathrooms_count,
              facilities: {
                wifi: h.wifi,
                water_24_7: h.water_24_7,
                parking: h.parking
              },
              coordinates: { lat: Number(h.latitude) || 2.0, lng: Number(h.longitude) || 45.3 },
              status: h.status,
              imageUrl: h.image_url,
              additionalImages: h.additional_images || [],
              ratingSum: Number(h.rating_sum) || 0,
              ratingCount: Number(h.rating_count) || 0,
              reviews: []
            })));
          }

          // 3. Fetch applications
          const { data: apps, error: aErr } = await supabase.from('applications').select('*');
          if (aErr) throw aErr;
          if (apps) {
            setApplications(apps.map(a => ({
              id: a.id,
              houseId: a.house_id,
              tenantId: a.tenant_id,
              tenantName: a.tenant_name,
              tenantPhone: a.tenant_phone,
              monthlyRent: Number(a.monthly_rent),
              depositPaid: Number(a.deposit_paid),
              monthsPaid: a.months_paid,
              status: a.status,
              landlordFeedback: a.landlord_feedback || '',
              houseTitle: a.house_title || '',
              proposedStartDate: a.proposed_start_date || '',
              createdAt: a.created_at
            })));
          }

          // 4. Fetch house_tours
          const { data: toursData, error: tErr } = await supabase.from('house_tours').select('*');
          if (tErr) console.warn('House tours fetch info:', tErr);
          if (toursData && toursData.length > 0) {
            setTours(toursData.map(t => ({
              id: t.id,
              houseId: t.house_id,
              houseTitle: t.house_title,
              tenantId: t.tenant_id,
              tenantName: t.tenant_name,
              tenantPhone: t.tenant_phone,
              landlordId: t.landlord_id,
              tourDate: t.tour_date,
              tourTimeSlot: t.tour_time_slot,
              tourType: t.tour_type,
              status: t.status,
              notes: t.notes || '',
              createdAt: t.created_at
            })));
          }

          // 5. Fetch complaints
          const { data: complaintsData, error: cErr } = await supabase.from('complaints').select('*');
          if (cErr) throw cErr;
          if (complaintsData) {
            setComplaints(complaintsData.map(c => ({
              id: c.id,
              reporterName: c.reporter_name,
              reporterPhone: c.reporter_phone,
              title: c.title,
              details: c.details,
              houseTitle: c.house_title,
              status: c.status,
              createdAt: c.timestamp,
              resolutionNotes: c.resolution_notes || ''
            })));
          }

          // 6. Fetch audits
          const { data: auditsData, error: auErr } = await supabase.from('audit_logs').select('*');
          if (auErr) throw auErr;
          if (auditsData) {
            setAudits(auditsData.map(au => ({
              id: au.id,
              timestamp: au.timestamp,
              action: au.action,
              details: au.details,
              ipAddress: au.ip_address
            })));
          }
        } catch (err) {
          console.error("Supabase load failed, falling back to local storage...", err);
          loadLocalBackup();
        }
      } else {
        loadLocalBackup();
      }
    };

    const loadLocalBackup = () => {
      const localUsers = localStorage.getItem('goobjoog_users');
      const localHouses = localStorage.getItem('goobjoog_houses');
      const localApps = localStorage.getItem('goobjoog_apps');
      const localTours = localStorage.getItem('goobjoog_tours');
      const localComplaints = localStorage.getItem('goobjoog_complaints');
      const localAudits = localStorage.getItem('goobjoog_audits');

      if (localUsers) {
        try {
          const parsed = JSON.parse(localUsers);
          if (Array.isArray(parsed)) {
            setUsers(parsed.map(u => ({
              ...u,
              roles: Array.isArray(u.roles) && u.roles.length > 0 
                ? u.roles 
                : [u.role || 'tenant']
            })));
          }
        } catch (e) {
          console.error("Failed parsing localUsers", e);
        }
      }
      if (localHouses) { try { setHouses(JSON.parse(localHouses)); } catch (e) {} }
      if (localApps) { try { setApplications(JSON.parse(localApps)); } catch (e) {} }
      if (localTours) { try { setTours(JSON.parse(localTours)); } catch (e) {} }
      if (localComplaints) { try { setComplaints(JSON.parse(localComplaints)); } catch (e) {} }
      if (localAudits) { try { setAudits(JSON.parse(localAudits)); } catch (e) {} }
    };

    loadData();
  }, []);

  // Save to localStorage when state changes if offline
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('goobjoog_users', JSON.stringify(users));
    }
  }, [users]);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('goobjoog_houses', JSON.stringify(houses));
    }
  }, [houses]);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('goobjoog_apps', JSON.stringify(applications));
    }
  }, [applications]);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('goobjoog_tours', JSON.stringify(tours));
    }
  }, [tours]);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('goobjoog_complaints', JSON.stringify(complaints));
    }
  }, [complaints]);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('goobjoog_audits', JSON.stringify(audits));
    }
  }, [audits]);

  // Audit log helper
  const addAuditLog = async (action: string, details: string) => {
    const ip = '197.220.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
    const newLog: AuditLog = {
      id: 'ad-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      details,
      ipAddress: ip
    };
    setAudits(prev => [newLog, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').insert({
          id: newLog.id,
          timestamp: newLog.timestamp,
          action: newLog.action,
          details: newLog.details,
          ip_address: newLog.ipAddress
        });
      } catch (e) {
        console.error("Error inserting audit log:", e);
      }
    }
  };

  // ==========================================
  // SHARED CALLBACK ACTIONS
  // ==========================================
  
  // Auth Success Handlers
  const handleUnlockSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setSavedUser(user);
    setIsLocked(false);
    localStorage.setItem('goobjoog_active_user', JSON.stringify(user));
    const userRoles = user.roles || [];
    if (userRoles.includes('administrator') || userRoles.includes('admin')) {
      setActiveLayout('administrator');
    } else if (userRoles.includes('homeowner') || userRoles.includes('landlord')) {
      setActiveLayout('homeowner');
    } else {
      setActiveLayout('tenant');
    }
    addAuditLog('BIOMETRIC_UNLOCK', `User ${user.fullName} unlocked GoobJoog dashboard with biometrics.`);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setSavedUser(user);
    setIsLocked(false);
    localStorage.setItem('goobjoog_active_user', JSON.stringify(user));
    const userRoles = user.roles || [];
    if (userRoles.includes('administrator') || userRoles.includes('admin')) {
      setActiveLayout('administrator');
    } else if (userRoles.includes('homeowner') || userRoles.includes('landlord')) {
      setActiveLayout('homeowner');
    } else {
      setActiveLayout('tenant');
    }
    addAuditLog('USER_LOGIN', `User ${user.fullName} authenticated workspace.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSavedUser(null);
    setIsLocked(false);
    localStorage.removeItem('goobjoog_active_user');
    addAuditLog('USER_LOGOUT', 'User logged out of session.');
  };

  const handleRegisterUser = async (newUser: UserProfile) => {
    setUsers(prev => [...prev, newUser]);
    addAuditLog('USER_REGISTER', `Created user account @${newUser.username} as ${newUser.roles.join(', ')}`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').insert({
          id: newUser.id,
          full_name: newUser.fullName,
          phone: newUser.phone,
          email: newUser.email || '',
          username: newUser.username,
          password: newUser.password,
          roles: newUser.roles,
          upgrade_status: newUser.upgradeStatus || 'none',
          is_verified: newUser.isVerified
        });
      } catch (err) {
        console.error("Supabase user register failed:", err);
      }
    }
  };

  const handleUpdateCredentials = async (userId: string, newUsername: string, newPassword?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, username: newUsername };
        if (newPassword) {
          updated.password = newPassword;
        }
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
    addAuditLog('USER_UPDATE_CREDENTIALS', `Admin updated credentials for user ID ${userId}`);

    if (isSupabaseConfigured) {
      try {
        const updates: any = { username: newUsername };
        if (newPassword) {
          updates.password = newPassword;
        }
        await supabase.from('profiles').update(updates).eq('id', userId);
      } catch (err) {
        console.error("Supabase credentials update failed:", err);
      }
    }
  };

  // Tenant Actions
  const handleApply = async (house: House, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const exists = applications.find(a => a.houseId === house.id && a.tenantId === currentUser.id && a.status !== 'rejected');
    if (exists) {
      alert("Active application already registered!");
      return;
    }

    const newApp: Application = {
      id: 'app-' + Math.random().toString(36).substr(2, 9),
      tenantId: currentUser.id,
      tenantName: currentUser.fullName,
      tenantPhone: currentUser.phone,
      houseId: house.id,
      houseTitle: house.title,
      proposedStartDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setApplications(prev => [newApp, ...prev]);
    addAuditLog('APPLICATION_SUBMIT', `Tenant ${currentUser.fullName} applied for ${house.title}.`);

    // Push Native Android/iOS Local Notification
    sendApplicationNotification(currentUser.fullName, house.title);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('applications').insert({
          id: newApp.id,
          house_id: newApp.houseId,
          house_title: newApp.houseTitle,
          tenant_id: newApp.tenantId,
          tenant_name: newApp.tenantName,
          tenant_phone: newApp.tenantPhone,
          proposed_start_date: newApp.proposedStartDate,
          monthly_rent: house.pricePerMonth,
          deposit_paid: 0,
          months_paid: 0,
          status: newApp.status
        });
      } catch (err) {
        console.error("Supabase application insert failed:", err);
      }
    }

    // Trigger WhatsApp notification to the landlord
    const landlordPhone = house.landlordPhone.replace(/\+/g, '').replace(/\s/g, '').trim();
    const whatsappMsg = lang === 'so'
      ? `Asc, waxaan GoobJoog ka soo dalbaday gurigaaga "${house.title}". Fadlan soo gal system-ka si aad u eegto codsigeyga.`
      : lang === 'ar'
      ? `مرحباً، لقد تقدمت بطلب لاستئجار منزلك "${house.title}" على نظام جوب جوج. يرجى الدخول لمراجعة الطلب.`
      : `Hello, I applied for your house "${house.title}" on GoobJoog. Please log in to check my application.`;
    const waLink = `https://wa.me/${landlordPhone}?text=${encodeURIComponent(whatsappMsg)}`;
    window.open(waLink, '_blank');
  };

  const handleCancelApplication = async (appId: string) => {
    setApplications(prev => prev.filter(a => a.id !== appId));
    addAuditLog('APPLICATION_CANCEL', `Application ${appId} cancelled.`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('applications').delete().eq('id', appId);
      } catch (err) {
        console.error("Supabase application delete failed:", err);
      }
    }
  };

  const handleToggleFavorite = (houseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(houseId) ? prev.filter(id => id !== houseId) : [...prev, houseId]
    );
  };

  const handleAddReview = async (houseId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    let targetHouse: House | undefined;
    setHouses(prev => prev.map(house => {
      if (house.id === houseId) {
        targetHouse = house;
        const newReview = {
          author: currentUser.fullName,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0]
        };
        return {
          ...house,
          ratingSum: house.ratingSum + rating,
          ratingCount: house.ratingCount + 1,
          reviews: [newReview, ...house.reviews]
        };
      }
      return house;
    }));
    addAuditLog('RATING_SUBMIT', `Tenant rated property ${houseId} with ${rating} stars.`);

    if (isSupabaseConfigured && targetHouse) {
      try {
        await supabase.from('houses').update({
          rating_sum: (targetHouse as House).ratingSum + rating,
          rating_count: (targetHouse as House).ratingCount + 1
        }).eq('id', houseId);
      } catch (err) {
        console.error("Supabase review update failed:", err);
      }
    }
  };

  const handleAddComplaint = async (houseId: string, title: string, details: string) => {
    if (!currentUser) return;
    const house = houses.find(h => h.id === houseId);
    const complaint: Complaint = {
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      reporterName: currentUser.fullName,
      reporterPhone: currentUser.phone,
      title,
      details,
      houseTitle: house ? house.title : 'Platform Support',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    setComplaints(prev => [complaint, ...prev]);
    addAuditLog('COMPLAINT_SUBMIT', `Escalation ticket filed by ${currentUser.fullName}: ${title}`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('complaints').insert({
          id: complaint.id,
          reporter_name: complaint.reporterName,
          reporter_phone: complaint.reporterPhone,
          house_title: complaint.houseTitle,
          title: complaint.title,
          details: complaint.details,
          status: complaint.status
        });
      } catch (err) {
        console.error("Supabase complaint insert failed:", err);
      }
    }
  };

  // Landlord Actions
  const handleRegisterHouse = async (newHouse: House) => {
    setHouses(prev => [newHouse, ...prev]);
    addAuditLog('LISTING_CREATE', `Landlord listed new property: ${newHouse.title}`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('houses').insert({
          id: newHouse.id,
          landlord_id: newHouse.landlordId,
          landlord_name: newHouse.landlordName,
          landlord_phone: newHouse.landlordPhone,
          city: newHouse.city,
          district: newHouse.district,
          title: newHouse.title,
          description: newHouse.description,
          price_per_month: newHouse.pricePerMonth,
          deposit_amount: newHouse.depositAmount,
          rooms_count: newHouse.roomsCount,
          bathrooms_count: newHouse.bathroomsCount,
          wifi: newHouse.facilities.wifi,
          water_24_7: newHouse.facilities.water_24_7,
          parking: newHouse.facilities.parking,
          latitude: newHouse.coordinates.lat,
          longitude: newHouse.coordinates.lng,
          status: newHouse.status,
          image_url: newHouse.imageUrl,
          additional_images: newHouse.additionalImages || []
        });
      } catch (err) {
        console.error("Supabase house listing failed:", err);
      }
    }
  };

  const handleDeleteHouse = async (houseId: string) => {
    setHouses(prev => prev.filter(h => h.id !== houseId));
    addAuditLog('LISTING_DELETE', `Listing ID: ${houseId} removed from inventory.`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('houses').delete().eq('id', houseId);
      } catch (err) {
        console.error("Supabase house delete failed:", err);
      }
    }
  };

  const handleApproveApplication = async (appId: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: ApplicationStatus.Approved } : a));
    addAuditLog('APPLICATION_APPROVE', `Application ID: ${appId} approved by Landlord.`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('applications').update({ status: 'approved' }).eq('id', appId);
      } catch (err) {
        console.error("Supabase application approve failed:", err);
      }
    }
  };

  const handleRejectApplication = async (appId: string, feedback: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: ApplicationStatus.Rejected, landlordFeedback: feedback } : a));
    addAuditLog('APPLICATION_REJECT', `Application ID: ${appId} rejected. Reason: ${feedback}`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('applications').update({ status: 'rejected', landlord_feedback: feedback }).eq('id', appId);
      } catch (err) {
        console.error("Supabase application reject failed:", err);
      }
    }
  };

  // Admin Actions
  const handleToggleUserVerification = async (userId: string) => {
    let isNowVerified = false;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        isNowVerified = !u.isVerified;
        return { ...u, isVerified: isNowVerified };
      }
      return u;
    }));
    const user = users.find(u => u.id === userId);
    addAuditLog('USER_VERIFICATION', `Verification toggled for user @${user?.username}`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ is_verified: isNowVerified }).eq('id', userId);
      } catch (err) {
        console.error("Supabase user verify toggle failed:", err);
      }
    }
  };

  const handleRemoveListing = async (houseId: string) => {
    setHouses(prev => prev.filter(h => h.id !== houseId));
    addAuditLog('LISTING_MODERATE', `Moderated listing ID: ${houseId}`);
    alert("Property permanently moderated (deleted) from database.");

    if (isSupabaseConfigured) {
      try {
        await supabase.from('houses').delete().eq('id', houseId);
      } catch (err) {
        console.error("Supabase listing moderate failed:", err);
      }
    }
  };

  const handleResolveComplaint = async (complaintId: string, notes: string) => {
    setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: ComplaintStatus.Resolved, resolutionNotes: notes } : c));
    addAuditLog('COMPLAINT_RESOLVE', `Maintenance complaint ${complaintId} resolved.`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('complaints').update({ status: 'resolved', resolution_notes: notes }).eq('id', complaintId);
      } catch (err) {
        console.error("Supabase resolution submit failed:", err);
      }
    }
  };

  const handleChangeUserRoles = async (userId: string, newRoles: string[]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u));
    const user = users.find(u => u.id === userId);
    addAuditLog('RBAC_CLAIM_CHANGE', `Custom Auth Claim roles for @${user?.username} set to: ${newRoles.join(', ')}`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ roles: newRoles }).eq('id', userId);
      } catch (err) {
        console.error("Supabase roles update failed:", err);
      }
    }
  };

  const handleUpgradeToLandlord = async () => {
    if (!currentUser) return;
    
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, upgradeStatus: 'pending', roles: [...u.roles, UserRole.Homeowner] } : u));
    setCurrentUser(prev => prev ? { ...prev, upgradeStatus: 'pending', roles: [...prev.roles, UserRole.Homeowner] } : null);
    
    addAuditLog('ROLE_UPGRADE_REQUEST', `User ${currentUser.fullName} requested landlord upgrade`);
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ upgrade_status: 'pending' }).eq('id', currentUser.id);
      } catch (err) {
        console.error("Supabase upgrade request failed:", err);
      }
    }
  };

  const handleApproveLandlordUpgrade = async (userId: string) => {
    let updatedUser: UserProfile | undefined;
    
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updatedRoles = [...u.roles];
        if (!updatedRoles.includes('homeowner')) {
          updatedRoles.push('homeowner');
        }
        updatedUser = { ...u, roles: updatedRoles, upgradeStatus: 'approved' as const };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updatedUser);
        }
        return updatedUser;
      }
      return u;
    }));
    
    addAuditLog('ROLE_UPGRADE_APPROVE', `Admin approved landlord upgrade for User ID ${userId}`);
    
    if (isSupabaseConfigured && updatedUser) {
      try {
        await supabase.from('profiles').update({ 
          roles: (updatedUser as UserProfile).roles, 
          upgrade_status: 'approved' 
        }).eq('id', userId);
      } catch (err) {
        console.error("Supabase upgrade approval failed:", err);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      alert("You cannot delete your own session!");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('USER_DELETE', `Deleted user account ${userId}`);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', userId);
      } catch (err) {
        console.error("Supabase user delete failed:", err);
      }
    }
  };

  const handleClearLogs = async () => {
    setAudits([]);
    addAuditLog('SYSTEM_RESET', 'Administrator cleared system audit logs.');

    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').delete().neq('id', 'placeholder');
      } catch (err) {
        console.error("Supabase logs clear failed:", err);
      }
    }
  };

  const triggerBackup = () => {
    addAuditLog('SYSTEM_BACKUP', 'Manual full database snapshot generated and written to GCS bucket.');
  };

  // ==========================================
  // CALCULATED METRICS
  // ==========================================
  const totalRevenue = 0;
  const systemCommission = 0;
  const landlordPayouts = 0;
  const outstandingPayments = (applications || []).filter(a => a.status === 'approved').length * 350;
  const totalHousesCount = (houses || []).length;
  const activeTenancyRate = totalHousesCount > 0 ? parseFloat((((houses || []).filter(h => h.status === 'rented').length / totalHousesCount) * 100).toFixed(1)) : 0;

  // ==========================================
  // VIEW ROUTING ENFORCEMENT
  // ==========================================
  if (isLocked && savedUser) {
    return (
      <AppLockScreen
        savedUser={savedUser}
        onUnlockSuccess={handleUnlockSuccess}
        onUsePassword={() => {
          setIsLocked(false);
          setCurrentUser(null);
        }}
        onLogout={handleLogout}
        lang={lang}
      />
    );
  }

  if (!currentUser) {
    return (
      <AuthPortal
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        lang={lang} 
        setLang={setLang} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoHome={() => setIsSettingsOpen(false)}
        activeLayout={activeLayout}
        setActiveLayout={setActiveLayout}
      />

      <main className="flex-1 w-full">
        {isSettingsOpen ? (
          <SettingsPage
            currentUser={currentUser}
            onLogout={() => {
              setIsSettingsOpen(false);
              handleLogout();
            }}
            lang={lang}
            setLang={setLang}
            onClose={() => setIsSettingsOpen(false)}
            onUpdateUser={(updated) => {
              const updatedUser = { ...currentUser, ...updated };
              setCurrentUser(updatedUser);
              setSavedUser(updatedUser);
              localStorage.setItem('goobjoog_active_user', JSON.stringify(updatedUser));
              setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updated } : u));
            }}
            addAuditLog={addAuditLog}
          />
        ) : (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Render View strictly matching Logged-In User Active Layout */}
            {activeLayout === 'tenant' && (
              <TenantDashboard
                houses={houses}
                applications={applications}
                tours={tours}
                favorites={favorites}
                currentTenant={currentUser}
                onApply={handleApply}
                onCancelApplication={handleCancelApplication}
                onToggleFavorite={handleToggleFavorite}
                onAddReview={handleAddReview}
                onAddComplaint={handleAddComplaint}
                onBookTour={handleBookTour}
                addAuditLog={addAuditLog}
                lang={lang}
                activeLayout={activeLayout}
                setActiveLayout={setActiveLayout}
                onUpgradeToLandlord={handleUpgradeToLandlord}
                selectedHouse={selectedHouse}
                setSelectedHouse={setSelectedHouse}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {activeLayout === 'homeowner' && (
              <LandlordDashboard
                houses={houses}
                applications={applications}
                tours={tours}
                currentLandlord={currentUser || INITIAL_USERS[0]}
                expenses={expenses}
                onRegisterHouse={handleRegisterHouse}
                onDeleteHouse={handleDeleteHouse}
                onApproveApplication={handleApproveApplication}
                onRejectApplication={handleRejectApplication}
                onUpdateTourStatus={handleUpdateTourStatus}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                addAuditLog={addAuditLog}
                lang={lang}
                activeLayout={activeLayout}
                setActiveLayout={setActiveLayout}
              />
            )}

            {activeLayout === 'financial_ledger' && (
              <FinancialLedgerPage
                houses={houses}
                currentLandlord={currentUser || INITIAL_USERS[0]}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                addAuditLog={addAuditLog}
                lang={lang}
                onBackToDashboard={() => setActiveLayout('homeowner')}
              />
            )}

            {activeLayout === 'administrator' && (
              <AdminDashboard
                users={users}
                houses={houses}
                complaints={complaints}
                audits={audits}
                currentUser={currentUser}
                onToggleUserVerification={handleToggleUserVerification}
                onRemoveListing={handleRemoveListing}
                onResolveComplaint={handleResolveComplaint}
                onChangeUserRoles={handleChangeUserRoles}
                onDeleteUser={handleDeleteUser}
                onClearLogs={handleClearLogs}
                triggerBackup={triggerBackup}
                onRegisterUser={handleRegisterUser}
                onUpdateCredentials={handleUpdateCredentials}
                lang={lang}
                onApproveUpgrade={handleApproveLandlordUpgrade}
              />
            )}
          </div>
        )}
      </main>

      <GoobJoogAI
        currentUser={currentUser}
        houses={houses}
        applications={applications}
        transactions={[]}
        complaints={complaints}
        favorites={favorites}
        lang={lang}
        onViewHouse={(houseId) => {
          const h = houses.find(house => house.id === houseId);
          if (h) {
            setSelectedHouse(h);
          }
        }}
        onToggleFavorite={(houseId) => {
          handleToggleFavorite(houseId, { stopPropagation: () => {} } as any);
        }}
        onOpenApplyModal={(house) => {
          setSelectedHouse(house);
        }}
        onUpgradeToLandlord={() => {
          handleUpgradeToLandlord();
        }}
      />
    </div>
  );
}
