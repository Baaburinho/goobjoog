// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Home, MessageSquare, Database, Check, X, RefreshCw, Trash2, 
  UserPlus, Key, Edit, ShieldAlert, UserCheck, UserX, Search, Lock, Mail, 
  Smartphone, Volume2, Shield, Activity, FileText, CheckCircle2, ChevronRight,
  TrendingUp, AlertCircle, Download, ShieldCheck, Sparkles, MapPin, Eye, Filter
} from 'lucide-react';
import type { UserProfile, House, Complaint, AuditLog } from '../domain/entities';
import { translations } from '../lib/translations';

interface AdminDashboardProps {
  users: UserProfile[];
  houses: House[];
  complaints: Complaint[];
  audits: AuditLog[];
  currentUser: UserProfile;
  onToggleUserVerification: (userId: string) => void;
  onRemoveListing: (houseId: string) => void;
  onResolveComplaint: (complaintId: string, notes: string) => void;
  onChangeUserRoles: (userId: string, newRoles: string[]) => void;
  onDeleteUser: (userId: string) => void;
  onClearLogs: () => void;
  triggerBackup: () => void;
  onRegisterUser: (newUser: UserProfile) => void;
  onUpdateCredentials: (userId: string, newUsername: string, newPassword?: string) => void;
  lang: 'en' | 'so' | 'ar';
  onApproveUpgrade: (userId: string) => void;
}

type AdminTab = 'mission_control' | 'users' | 'listings' | 'helpdesk' | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  houses,
  complaints,
  audits,
  currentUser,
  onToggleUserVerification,
  onRemoveListing,
  onResolveComplaint,
  onChangeUserRoles,
  onDeleteUser,
  onClearLogs,
  triggerBackup,
  onRegisterUser,
  onUpdateCredentials,
  lang,
  onApproveUpgrade
}) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  // Active Executive Modular Workspace
  const [activeTab, setActiveTab] = useState<AdminTab>('mission_control');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'landlord' | 'tenant'>('all');
  const [houseSearch, setHouseSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  
  // Role Claims editing states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempRoles, setTempRoles] = useState<string[]>([]);
  
  // Credentials rotation form
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [newPassword, setNewPassword] = useState('');

  // Register staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffUser, setStaffUser] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [staffRole, setStaffRole] = useState<'administrator'>('administrator');

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('goobjoog_support_tickets') || '[]');
    } catch (e) {
      return [];
    }
  });

  const refreshTickets = () => {
    try {
      setSupportTickets(JSON.parse(localStorage.getItem('goobjoog_support_tickets') || '[]'));
    } catch (e) {}
  };

  // Localized Format Helpers
  const formatNumber = (num: number) => {
    const safeNum = (typeof num === 'number' && !isNaN(num) && isFinite(num)) ? num : 0;
    if (lang === 'ar') {
      return new Intl.NumberFormat('ar-SA').format(safeNum);
    }
    return new Intl.NumberFormat('en-US').format(safeNum);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const locale = lang === 'ar' ? 'ar-SA' : lang === 'so' ? 'so-SO' : 'en-US';
      return new Intl.DateTimeFormat(locale, { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const handleRoleChangeSubmit = (userId: string) => {
    if (tempRoles.length === 0) {
      alert(lang === 'so' ? "Fadlan dooro ugu yaraan hal door." : "Please select at least one role.");
      return;
    }
    onChangeUserRoles(userId, tempRoles);
    setEditingUserId(null);
    alert(lang === 'so' ? "Xuquuqda isticmaalaha waa la cusbooneysiiyey!" : "User role claims updated successfully!");
  };

  const handleRegisterStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffPhone || !staffUser || !staffPass) {
      alert(t.fillRequiredMsg);
      return;
    }
    const newStaff: UserProfile = {
      id: `staff_${Date.now()}`,
      fullName: staffName,
      phone: staffPhone,
      email: staffEmail || `${staffUser}@goobjoog.so`,
      username: staffUser.toLowerCase(),
      password: staffPass,
      roles: [staffRole],
      isVerified: true,
      upgradeStatus: 'none'
    };
    onRegisterUser(newStaff);
    setShowStaffModal(false);
    setStaffName('');
    setStaffPhone('');
    setStaffEmail('');
    setStaffUser('');
    setStaffPass('');
    alert(lang === 'so' ? 'Hawl-wadeenka cusub si guul leh ayaa loo diiwaangeliyey!' : 'Executive staff registered successfully!');
  };

  // Filtered Collections
  const pendingUpgrades = useMemo(() => users.filter(u => u.upgradeStatus === 'pending'), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchQuery = 
        u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone.includes(userSearch);
      
      if (!matchQuery) return false;
      if (roleFilter === 'admin') return (u.roles || []).includes('administrator');
      if (roleFilter === 'landlord') return (u.roles || []).includes('homeowner') || (u.roles || []).includes('landlord');
      if (roleFilter === 'tenant') return !(u.roles || []).includes('administrator') && !(u.roles || []).includes('homeowner');
      return true;
    });
  }, [users, userSearch, roleFilter]);

  const filteredHouses = useMemo(() => {
    return houses.filter(h => {
      const matchQuery = 
        h.title.toLowerCase().includes(houseSearch.toLowerCase()) ||
        h.city.toLowerCase().includes(houseSearch.toLowerCase()) ||
        h.district.toLowerCase().includes(houseSearch.toLowerCase());
      
      if (!matchQuery) return false;
      if (cityFilter !== 'all') return h.city.toLowerCase() === cityFilter.toLowerCase();
      return true;
    });
  }, [houses, houseSearch, cityFilter]);

  // City Distribution Metrics
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Baydhabo': 0, 'Muqdisho': 0, 'Hargeysa': 0, 'Kismaayo': 0, 'Garoowe': 0 };
    houses.forEach(h => {
      const c = h.city || 'Baydhabo';
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [houses]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* TIER-1 EXECUTIVE HERO COMMAND BAR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl p-6 sm:p-8 text-white">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md flex items-center gap-1.5">
                <Shield size={13} />
                <span>Executive Command Console</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Production Cluster Active (99.98% SLA)</span>
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>GoobJoog Executive Ops</span>
              <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">v2.4.2</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'so'
                ? 'Xarunta dhexe ee maamulka guud ee guryaha dalka, xaqiijinta mulkiilayaasha, amniga xogta, iyo xallinta fariimaha macaamiisha.'
                : 'Central operations console for verified homeowner approvals, nationwide housing fleet governance, and real-time customer support.'}
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            {pendingUpgrades.length > 0 && (
              <button
                onClick={() => setActiveTab('mission_control')}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center gap-1.5 transition active:scale-95 animate-bounce"
              >
                <span>🌟</span>
                <span>{pendingUpgrades.length} {lang === 'so' ? 'Codsi Sugaya' : 'Pending Upgrades'}</span>
              </button>
            )}

            <button
              onClick={() => {
                triggerBackup();
                alert(lang === 'so' ? 'Snapshot-ka xogta waxaa lagu qoray cloud bucket.' : 'Cloud backup snapshot generated successfully.');
              }}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <Database size={14} className="text-blue-400" />
              <span>{lang === 'so' ? 'Qaad Backup' : 'Cloud Snapshot'}</span>
            </button>

            <button
              onClick={() => setShowStaffModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-lg transition flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus size={14} />
              <span>{lang === 'so' ? 'Kudar Shaqaale' : 'Add Staff'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEGMENTED PRIORITY WORKSPACE NAVIGATION PILLS */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar sticky top-14 z-20">
        <button
          onClick={() => setActiveTab('mission_control')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'mission_control'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>🌟</span>
          <span>{lang === 'so' ? '1. Mission Control & Oggolaansho' : '1. Mission Control & Approvals'}</span>
          {pendingUpgrades.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-sm">
              {pendingUpgrades.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users size={15} />
          <span>{lang === 'so' ? '2. Maamulka Akoonnada' : '2. User Governance'}</span>
          <span className="text-[10px] opacity-70 font-mono">({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'listings'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Home size={15} />
          <span>{lang === 'so' ? '3. Guryaha Dalka (Fleet)' : '3. Property Fleet'}</span>
          <span className="text-[10px] opacity-70 font-mono">({houses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('helpdesk')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'helpdesk'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare size={15} />
          <span>{lang === 'so' ? '4. Xarunta Taageerada & Chat' : '4. Support Helpdesk'}</span>
          {supportTickets.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">
              {supportTickets.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'security'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity size={15} />
          <span>{lang === 'so' ? '5. Amniga & Audit Logs' : '5. Security & Audit'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 WORKSPACE 1: MISSION CONTROL & URGENT APPROVALS (Priority 1)           */}
      {/* ========================================================================= */}
      {activeTab === 'mission_control' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* URGENT LANDLORD APPROVALS QUEUE */}
          {pendingUpgrades.length > 0 ? (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-2xl space-y-4 border border-amber-400/40">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center text-lg">🌟</span>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-white">
                      {lang === 'so' ? `Codsiyada Dalacsiinta Mulkiilayaasha (${pendingUpgrades.length} Sugaya)` : `Pending Landlord Approvals (${pendingUpgrades.length} In Queue)`}
                    </h3>
                    <p className="text-xs text-amber-100">
                      {lang === 'so' ? 'Kireystayaashan waxay soo gudbiyeen xogtooda guryaha. Hubi oo 1-click ku xaqiiji.' : 'Review property verification and approve homeowner listing privileges.'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase">
                  Action Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {pendingUpgrades.map(u => (
                  <div key={u.id} className="p-4 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 flex items-center justify-between gap-3 shadow-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-white">{u.fullName}</span>
                        <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-md">@{u.username}</span>
                      </div>
                      <p className="text-xs text-amber-100 font-mono">📱 {u.phone} • 📧 {u.email || 'N/A'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onApproveUpgrade(u.id);
                        alert(lang === 'so' ? 'Mulkiilaha si rasmi ah ayaa loo aqbalay!' : 'Landlord upgrade approved successfully!');
                      }}
                      className="px-4 py-2 bg-white text-orange-900 hover:bg-amber-50 font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      <Check size={16} />
                      <span>{t.approveLandlordUpgradeBtn || 'Aqbal Mulkiilenimada'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                    {lang === 'so' ? 'Dhammaan Codsiyadii Mulkiilayaasha Waa La Xaqiijiyay' : 'Zero Pending Landlord Approvals'}
                  </h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {lang === 'so' ? 'Ma jiraan kireystayaal cusub oo hadda sugaya dalacsiin mulkiile.' : 'All homeowner listing applications are up to date.'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                100% Cleared
              </span>
            </div>
          )}

          {/* HIGH-IMPACT EXECUTIVE TELEMETRY TILES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.totalUsersStat}</span>
                <span className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-lg">
                  👥
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatNumber(users.length)}
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> +12% active this week
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.activeListingsStat}</span>
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  🏡
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatNumber(houses.length)}
                </div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                  📍 Across 5 Somali cities
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === 'so' ? 'Fariimaha Taageerada' : 'Support Helpdesk'}</span>
                <span className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold text-lg">
                  💬
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatNumber(supportTickets.length)}
                </div>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                  ⚡ Real-time chat inbox
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.systemUptimeStat}</span>
                <span className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-lg">
                  🛡️
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  99.98%
                </div>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                  ● Zero downtime incidents
                </span>
              </div>
            </div>
          </div>

          {/* NATIONWIDE CITY DISTRIBUTION RADAR */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={18} className="text-rose-600" />
                  <span>{lang === 'so' ? 'Kormeerka Guryaha ee Magaalooyinka Soomaaliya' : 'Nationwide Somali Housing Distribution'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'so' ? 'Qaybsanaanta guryaha kirada ah ee diiwaangashan magaaladooda.' : 'Live distribution of rental fleet across major cities.'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('listings')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>{lang === 'so' ? 'Eeg Dhammaan' : 'View All'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(cityCounts).map(([cityName, count]) => (
                <div key={cityName} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 text-center space-y-1">
                  <span className="text-lg block">🏙️</span>
                  <span className="font-black text-xs text-slate-800 dark:text-slate-200 block">{cityName}</span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{count} {lang === 'so' ? 'Guri' : 'Houses'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👥 WORKSPACE 2: USER GOVERNANCE DIRECTORY (Priority 2)                    */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                <span>{t.userManagementTable}</span>
              </h3>
              <p className="text-xs text-slate-400">{lang === 'so' ? 'Maamul dhammaan akoonnada, doorka (Roles), iyo xaqiijinta aqoonsiga.' : 'Account registry, credential verification, and role privileges.'}</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'so' ? 'Raadi magac, username ama tel...' : 'Search user, username, phone...'}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
              >
                <option value="all">Dhammaan (All Roles)</option>
                <option value="admin">🛡️ Admin</option>
                <option value="landlord">🏡 Landlord</option>
                <option value="tenant">🏠 Tenant</option>
              </select>

              <button
                onClick={() => setShowStaffModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
              >
                <UserPlus size={14} />
                <span>{t.registerNewStaffBtn}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-3">{t.userHeader}</th>
                  <th className="pb-3">{t.contactHeader}</th>
                  <th className="pb-3">{t.rolesHeader}</th>
                  <th className="pb-3">{t.statusHeader}</th>
                  <th className="pb-3 text-right">{t.actionsHeader}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <span>{user.fullName}</span>
                            {user.isVerified && <CheckCircle2 size={13} className="text-blue-500" />}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">📱 {user.phone}</div>
                      <div className="text-[10px] text-slate-400">{user.email || 'N/A'}</div>
                    </td>

                    <td className="py-3">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[10px] font-bold">
                            <input 
                              type="checkbox" 
                              checked={tempRoles.includes('administrator')}
                              onChange={(e) => {
                                if (e.target.checked) setTempRoles([...tempRoles, 'administrator']);
                                else setTempRoles(tempRoles.filter(r => r !== 'administrator'));
                              }}
                            />
                            Admin
                          </label>
                          <label className="flex items-center gap-1 text-[10px] font-bold">
                            <input 
                              type="checkbox" 
                              checked={tempRoles.includes('homeowner') || tempRoles.includes('landlord')}
                              onChange={(e) => {
                                if (e.target.checked) setTempRoles([...tempRoles, 'homeowner']);
                                else setTempRoles(tempRoles.filter(r => r !== 'homeowner' && r !== 'landlord'));
                              }}
                            />
                            Landlord
                          </label>
                          <button 
                            onClick={() => handleRoleChangeSubmit(user.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black shadow"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingUserId(null)}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-[10px]"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(user.roles || []).map(r => (
                            <span key={r} className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              r === 'administrator' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                              r === 'homeowner' || r === 'landlord' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {r}
                            </span>
                          ))}
                          <button 
                            onClick={() => {
                              setEditingUserId(user.id);
                              setTempRoles(user.roles || []);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-lg"
                            title="Edit Roles"
                          >
                            <Edit size={13} />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3">
                      <button
                        onClick={() => onToggleUserVerification(user.id)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black transition flex items-center gap-1 shadow-sm ${
                          user.isVerified 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {user.isVerified ? <CheckCircle2 size={13} /> : <ShieldAlert size={13} />}
                        <span>{user.isVerified ? t.verifiedBadge : t.unverifiedBadge}</span>
                      </button>
                    </td>

                    <td className="py-3 text-right">
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(lang === 'so' ? `Ma hubtaa inaad tirtirto akoonka ${user.fullName}?` : `Delete account for ${user.fullName}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition active:scale-95"
                          title={t.deleteUserBtn}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏡 WORKSPACE 3: NATIONWIDE PROPERTY FLEET (Priority 3)                     */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Home size={18} className="text-emerald-600" />
                <span>{lang === 'so' ? 'Kormeerka Guryaha Dalka (Properties Fleet)' : 'Nationwide Property Fleet Governance'}</span>
              </h3>
              <p className="text-xs text-slate-400">{lang === 'so' ? 'Kormeer guryaha magaalo kasta ku yaalla oo 1-click ku tirtir kuwa khaldan.' : 'Review active rental inventory and take down violating posts.'}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'so' ? 'Raadi guri ama degmo...' : 'Search property title, district...'}
                  value={houseSearch}
                  onChange={(e) => setHouseSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
              >
                <option value="all">Dhammaan Magaalooyinka</option>
                <option value="Baydhabo">Baydhabo</option>
                <option value="Muqdisho">Muqdisho</option>
                <option value="Hargeysa">Hargeysa</option>
                <option value="Kismaayo">Kismaayo</option>
                <option value="Garoowe">Garoowe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {filteredHouses.map(house => (
              <div key={house.id} className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 rounded-xl text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                      <MapPin size={11} />
                      <span>{house.city} • {house.district}</span>
                    </span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                      ${house.priceMonthly}/mo
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">{house.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{house.description}</p>
                  
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                    <span>🛏️ {house.rooms} Rooms</span>
                    <span>🚿 {house.bathrooms} Baths</span>
                    <span>👤 Landlord: {house.landlordId.slice(0, 8)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
                  <span className={`text-[11px] font-black ${house.isVerified ? 'text-blue-600' : 'text-slate-400'}`}>
                    {house.isVerified ? '✓ Verified Listing' : 'Standard Post'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(lang === 'so' ? `Ma hubtaa inaad tirtirto gurigan: ${house.title}?` : `Remove listing: ${house.title}?`)) {
                        onRemoveListing(house.id);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <Trash2 size={13} />
                    <span>{lang === 'so' ? 'Tirtir Guriga' : 'Takedown'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💬 WORKSPACE 4: LIVE SUPPORT HELPDESK & CHAT (Priority 4)                 */}
      {/* ========================================================================= */}
      {activeTab === 'helpdesk' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                <span>{lang === 'so' ? 'Xarunta Caawinta & Fariimaha Macaamiisha (Live Support Helpdesk)' : 'Customer Live Support Helpdesk'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'so' ? 'Halkan ka arag fariimaha tooska ah ee ay macaamiishu ka soo direen qaybta Caawinta (Help Center) oo toos uga jawaab.' :
                 'Review live customer tickets and send real-time responses to user chats.'}
              </p>
            </div>
            <button
              type="button"
              onClick={refreshTickets}
              className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <RefreshCw size={14} />
              <span>{lang === 'so' ? 'Dib u Cusbooneysii' : 'Refresh Inbox'}</span>
            </button>
          </div>

          {supportTickets.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 space-y-2">
              <span className="text-3xl block">🎧</span>
              <p className="font-black text-sm text-slate-700 dark:text-slate-200">
                {lang === 'so' ? 'Weli ma jiraan fariimo cusub oo ka yimid macaamiisha.' : 'No active customer support tickets.'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {lang === 'so' ? 'Fariimaha ay macaamiishu ka soo diraan Qeybta Caawinta (Live Support Chat) halkan ayay toos ugu soo dhacayaan.' : 'Customer queries from the Help Center will appear here in real-time.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportTickets.map((st, idx) => (
                <div key={st.id || idx} className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 space-y-3 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>👤</span>
                          <span>{st.userName}</span>
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">📱 {st.userPhone} • 🕒 {st.time}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        st.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {(st.status || 'OPEN').toUpperCase()}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      "{st.message}"
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const reply = prompt(lang === 'so' ? `U dir jawaab toos ah ${st.userName}:` : `Send direct response to ${st.userName}:`);
                        if (reply) {
                          const chat = JSON.parse(localStorage.getItem('goobjoog_support_chat') || '[]');
                          chat.push({
                            id: `msg_admin_${Date.now()}`,
                            sender: 'admin',
                            senderName: 'Admin: ' + (currentUser?.fullName || 'GoobJoog Support'),
                            text: reply,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          });
                          localStorage.setItem('goobjoog_support_chat', JSON.stringify(chat));

                          // Mark resolved
                          st.status = 'resolved';
                          localStorage.setItem('goobjoog_support_tickets', JSON.stringify(supportTickets));
                          refreshTickets();
                          alert(lang === 'so' ? 'Jawaabtaadii toos ayaa loogu diray macaamiilka!' : 'Reply transmitted to user live chat!');
                        }
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 text-center"
                    >
                      💬 {lang === 'so' ? 'Ka Jawaab (Reply)' : 'Reply to User'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const filtered = supportTickets.filter((_, i) => i !== idx);
                        localStorage.setItem('goobjoog_support_tickets', JSON.stringify(filtered));
                        refreshTickets();
                        alert(lang === 'so' ? 'Tikidhka waa la xalliyay.' : 'Ticket resolved.');
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95"
                    >
                      ✓ {lang === 'so' ? 'Xalliyey' : 'Resolve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛡️ WORKSPACE 5: SECURITY ENCLAVE & AUDIT LOGS (Priority 5)                */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* CREDENTIALS ROTATION */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Lock size={16} className="text-rose-600" />
              <span>{lang === 'so' ? 'Amniga Akoonka & Beddelka Furaha' : 'Administrator Security & Password Rotation'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.username}</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'so' ? 'Furaha Cusub (Password)' : 'New Password'}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCredentials(currentUser.id, newUsername, newPassword || undefined);
                    alert(lang === 'so' ? 'Xogta amniga Admin-ka waa la cusbooneysiiyey!' : 'Admin credentials updated successfully!');
                    setNewPassword('');
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
                >
                  {t.updateCredentialsBtn}
                </button>
              </div>
            </div>
          </div>

          {/* AUDIT LOG TABLE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Activity size={18} className="text-rose-600" />
                  <span>{t.systemAuditLogsTable}</span>
                </h3>
                <p className="text-xs text-slate-400">{lang === 'so' ? 'Diiwaanka dhammaan ficillada amniga iyo dhacdooyinka nidaamka.' : 'Real-time security and operations audit log trail.'}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    triggerBackup();
                    alert(lang === 'so' ? 'Snapshot-ka xogta waxaa lagu qoray cloud bucket.' : 'Backup snapshot generated and synced.');
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
                >
                  {t.triggerBackupBtn}
                </button>

                <button
                  onClick={onClearLogs}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  {t.clearAuditLogsBtn}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {audits.map(a => (
                    <tr key={a.id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-2.5 font-bold text-blue-600">{a.action}</td>
                      <td className="py-2.5 font-sans text-xs">{a.details}</td>
                      <td className="py-2.5 text-slate-400">{formatDate(a.timestamp)}</td>
                      <td className="py-2.5 text-slate-400">{a.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER STAFF MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowStaffModal(false)}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600" />
              <span>{t.registerNewStaffBtn}</span>
            </h3>

            <form onSubmit={handleRegisterStaffSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.fullName} *</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.phone} *</label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.role} *</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="administrator">{t.admin}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.username} *</label>
                  <input
                    type="text"
                    value={staffUser}
                    onChange={(e) => setStaffUser(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{t.password} *</label>
                  <input
                    type="password"
                    value={staffPass}
                    onChange={(e) => setStaffPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-95"
              >
                {t.submit}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
