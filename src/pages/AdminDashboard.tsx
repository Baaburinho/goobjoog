// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Users, Home, MessageSquare, Database, Check, X, RefreshCw, Trash2, 
  UserPlus, Key, Edit, ShieldAlert, UserCheck, UserX, Search, Lock, Mail, 
  Smartphone, Volume2, Shield, Activity, FileText, CheckCircle2, ChevronRight
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

type AdminTab = 'overview' | 'users' | 'listings' | 'support' | 'security';

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

  // Active Modular Sub-Page / Tab (Default: Overview)
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Search & Filtering Users
  const [userSearch, setUserSearch] = useState('');
  const [houseSearch, setHouseSearch] = useState('');
  
  // Role Claims editing states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempRoles, setTempRoles] = useState<string[]>([]);
  
  // Change credentials form
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
      alert(lang === 'so' ? "Fadlan dooro ugu yaraan hal door." : lang === 'ar' ? "يرجى تحديد دور واحد على الأقل." : "Please select at least one role.");
      return;
    }
    onChangeUserRoles(userId, tempRoles);
    setEditingUserId(null);
    alert(lang === 'so' ? "Xuquuqda isticmaalaha waa la cusbooneysiiyey!" : lang === 'ar' ? "تم تحديث صلاحيات المستخدم بنجاح!" : "User system credentials claims updated successfully!");
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
    alert(lang === 'so' ? 'Hawl-wadeenka cusub si guul leh ayaa loo diiwaangeliyey!' : lang === 'ar' ? 'تم تسجيل الموظف الجديد بنجاح!' : 'Staff member registered successfully!');
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

  const filteredHouses = houses.filter(h =>
    h.title.toLowerCase().includes(houseSearch.toLowerCase()) ||
    h.city.toLowerCase().includes(houseSearch.toLowerCase()) ||
    h.district.toLowerCase().includes(houseSearch.toLowerCase())
  );

  const pendingUpgrades = users.filter(u => u.upgradeStatus === 'pending');

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* EXECUTIVE ADMIN HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-rose-900/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm flex items-center gap-1">
              <Shield size={12} />
              <span>{lang === 'so' ? 'Maamul Sare' : 'Executive Console'}</span>
            </span>
            <span className="text-xs text-rose-200/80 font-mono">@{currentUser.username}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>🛡️</span>
            <span>{lang === 'so' ? 'Qunsulka Maamulka GoobJoog' : 'GoobJoog Executive Console'}</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {lang === 'so' 
              ? 'Xarunta dhexe ee ilaalinta, xaqiijinta mulkiilayaasha, guryaha dalka, iyo caawinta macaamiisha.' 
              : 'Central command for verified homeowners, nationwide housing governance, and real-time support.'}
          </p>
        </div>

        {/* Quick KPI summary badges */}
        <div className="flex items-center gap-2">
          {pendingUpgrades.length > 0 && (
            <button 
              onClick={() => setActiveTab('overview')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center gap-1.5 animate-bounce"
            >
              <span>🌟</span>
              <span>{pendingUpgrades.length} {lang === 'so' ? 'Codsi Dalacsiin' : 'Upgrades'}</span>
            </button>
          )}
          <button 
            onClick={() => setActiveTab('support')}
            className="px-3.5 py-2 bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs rounded-2xl border border-blue-400/30 shadow flex items-center gap-1.5"
          >
            <MessageSquare size={15} />
            <span>{supportTickets.length} {lang === 'so' ? 'Fariimo' : 'Tickets'}</span>
          </button>
        </div>
      </div>

      {/* MODULAR SUB-PAGE / TAB NAVIGATION (Organized by Priority) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'overview'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <span>🌟</span>
          <span>{lang === 'so' ? '1. Dulmar & Oggolaansho' : '1. Overview & Approvals'}</span>
          {pendingUpgrades.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {pendingUpgrades.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Users size={15} />
          <span>{lang === 'so' ? '2. Isticmaaleyaasha & Doorka' : '2. User Accounts & Roles'}</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'listings'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Home size={15} />
          <span>{lang === 'so' ? '3. Kormeerka Guryaha' : '3. Listings Governance'}</span>
          <span className="text-[10px] opacity-70">({houses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'support'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <MessageSquare size={15} />
          <span>{lang === 'so' ? '4. Caawinta & Live Chat' : '4. Support Helpdesk'}</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
            activeTab === 'security'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Activity size={15} />
          <span>{lang === 'so' ? '5. Amniga & Diiwaanka' : '5. Security & Audit'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & APPROVALS (Priority 1)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* PENDING LANDLORD UPGRADES ACTION BANNER */}
          {pendingUpgrades.length > 0 ? (
            <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span>🌟</span>
                  <span>
                    {lang === 'so' ? `Codsiyo Dalacsiin Mulkiile ah ayaa jira (${pendingUpgrades.length})` :
                     `Pending Landlord Upgrade Applications (${pendingUpgrades.length})`}
                  </span>
                </h3>
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black">
                  {lang === 'so' ? 'Mudnaanta 1aad' : 'Priority 1'}
                </span>
              </div>
              <p className="text-xs text-amber-100 leading-relaxed">
                {lang === 'so' 
                  ? 'Kireystayaasha hoos ku qoran waxay soo gudbiyeen xogtooda guryaha si ay Mulkiilayaal u noqdaan. Guji "Aqbal Mulkiilenimada" si aad ugu oggolaato kireynta guryaha.' 
                  : 'The tenants listed below submitted property verification to become Landlords. Click approve to grant homeowner listing privileges.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {pendingUpgrades.map(u => (
                  <div key={u.id} className="p-4 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-between gap-3 border border-white/20 shadow">
                    <div>
                      <span className="font-black text-sm block text-white">{u.fullName}</span>
                      <span className="text-xs text-amber-100 font-mono">@{u.username} • 📱 {u.phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onApproveUpgrade(u.id);
                        alert(lang === 'so' ? 'Dalacsiinta mulkiilaha waa la oggolaaday!' : 'Landlord upgrade approved successfully!');
                      }}
                      className="px-4 py-2 bg-white text-orange-800 hover:bg-amber-50 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>{t.approveLandlordUpgradeBtn || 'Aqbal Mulkiilenimada'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                    {lang === 'so' ? 'Dhammaan Codsiyada Waa La Xalliyey' : 'All Upgrade Applications Processed'}
                  </h4>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    {lang === 'so' ? 'Ma jiraan kireystayaal cusub oo sugaya dalacsiin mulkiile.' : 'No pending landlord upgrade requests at this time.'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                100% Cleared
              </span>
            </div>
          )}

          {/* HIGH-LEVEL METRIC TILES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.totalUsersStat}</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatNumber(users.length)}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-xl">
                👥
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.activeListingsStat}</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatNumber(houses.length)}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl">
                🏡
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{lang === 'so' ? 'Fariimaha Taageerada' : 'Live Support Tickets'}</span>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{formatNumber(supportTickets.length)}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold text-xl">
                💬
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.systemUptimeStat}</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg mt-1 inline-block">
                  ● 99.98% SLA
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-xl">
                🛡️
              </div>
            </div>
          </div>

          {/* QUICK LAUNCHPAD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span>
              <span>{lang === 'so' ? 'Tallaabooyinka Degdegga ah' : 'Quick Operations Launchpad'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('users')}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-xs text-slate-800 dark:text-slate-100 block">👥 {lang === 'so' ? 'Maamul Isticmaaleyaasha' : 'Manage Users'}</span>
                  <span className="text-[11px] text-slate-400">{users.length} {lang === 'so' ? 'akoonno' : 'registered'}</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('listings')}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-xs text-slate-800 dark:text-slate-100 block">🏡 {lang === 'so' ? 'Kormeer Guryaha Dalka' : 'Review City Properties'}</span>
                  <span className="text-[11px] text-slate-400">{houses.length} {lang === 'so' ? 'guryo diyaar ah' : 'listings'}</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('support')}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-slate-50 dark:bg-slate-800/40 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-xs text-slate-800 dark:text-slate-100 block">💬 {lang === 'so' ? 'Fur Helpdesk Chat' : 'Open Support Helpdesk'}</span>
                  <span className="text-[11px] text-slate-400">{supportTickets.length} {lang === 'so' ? 'fariimo' : 'inquiries'}</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER ACCOUNTS & ROLES (Priority 2)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                <span>{t.userManagementTable}</span>
              </h3>
              <p className="text-xs text-slate-400">{lang === 'so' ? 'Maamul isticmaaleyaasha, xuquuqaha, iyo oggolaanshaha dalacsiinta.' : 'Manage accounts, role claims, and landlord upgrade approvals.'}</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'so' ? 'Raadi magac ama taleefan...' : 'Search user, username, phone...'}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                onClick={() => setShowStaffModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 active:scale-95 whitespace-nowrap"
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
                  <tr key={user.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <span>{user.fullName}</span>
                            {user.isVerified && <CheckCircle2 size={12} className="text-blue-500" />}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <div>{user.phone}</div>
                      <div className="text-[10px] text-slate-400">{user.email || 'N/A'}</div>
                    </td>

                    <td className="py-3">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-[10px]">
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
                          <label className="flex items-center gap-1 text-[10px]">
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
                            className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingUserId(null)}
                            className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap">
                          {(user.roles || []).map(r => (
                            <span key={r} className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
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
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            title="Edit Roles"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3">
                      <button
                        onClick={() => onToggleUserVerification(user.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 ${
                          user.isVerified 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' 
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {user.isVerified ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                        <span>{user.isVerified ? t.verifiedBadge : t.unverifiedBadge}</span>
                      </button>
                    </td>

                    <td className="py-3 text-right">
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(lang === 'so' ? `Ma hubtaa inaad tirtirto ${user.fullName}?` : `Delete account for ${user.fullName}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
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
      {/* TAB 3: PROPERTIES GOVERNANCE (Priority 3)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Home size={18} className="text-emerald-600" />
                <span>{lang === 'so' ? 'Kormeerka Guryaha Dalka (Properties Governance)' : 'Properties & Listings Governance'}</span>
              </h3>
              <p className="text-xs text-slate-400">{lang === 'so' ? 'Kormeer dhammaan guryaha la galiyay nidaamka oo tirtir kuwa khaldan.' : 'Monitor all nationwide property listings and remove violations.'}</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'so' ? 'Raadi guri ama magaalo...' : 'Filter houses by city/title...'}
                value={houseSearch}
                onChange={(e) => setHouseSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredHouses.map(house => (
              <div key={house.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      📍 {house.city} • {house.district}
                    </span>
                    <span className="font-black text-emerald-600 text-sm">
                      ${house.priceMonthly}/mo
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">{house.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{house.description}</p>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                    <span>🛏️ {house.rooms} Qol</span>
                    <span>🚿 {house.bathrooms} Musqul</span>
                    <span>👤 Landlord ID: {house.landlordId.slice(0, 8)}...</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className={`text-[10px] font-black ${house.isVerified ? 'text-blue-600' : 'text-slate-400'}`}>
                    {house.isVerified ? '✓ Verified Listing' : 'Standard Listing'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(lang === 'so' ? `Ma hubtaa inaad tirtirto gurigan: ${house.title}?` : `Remove listing: ${house.title}?`)) {
                        onRemoveListing(house.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1 active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span>{lang === 'so' ? 'Tirtir Guriga' : 'Remove Listing'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUPPORT HELPDESK & LIVE CHAT (Priority 4)                           */}
      {/* ========================================================================= */}
      {activeTab === 'support' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                <span>{lang === 'so' ? 'Caawinta Tooska ah & Fariimaha Macaamiisha (Live Support Helpdesk)' : 'Customer Live Support Helpdesk'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'so' ? 'Halkan ka arag fariimaha tooska ah ee ay macaamiishu ka soo direen qaybta Caawinta (Help Center) oo toos uga jawaab.' :
                 'Review live support tickets and customer inquiries sent from the Help Center.'}
              </p>
            </div>
            <button
              type="button"
              onClick={refreshTickets}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1 active:scale-95"
            >
              <RefreshCw size={14} />
              <span>{lang === 'so' ? 'Dib u Cusbooneysii' : 'Refresh'}</span>
            </button>
          </div>

          {supportTickets.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 space-y-2">
              <span className="text-3xl block">🎧</span>
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                {lang === 'so' ? 'Weli ma jiraan fariimo cusub oo ka yimid macaamiisha.' : 'No active customer support tickets.'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {lang === 'so' ? 'Fariimaha ay macaamiishu ka soo diraan Qeybta Caawinta (Live Support Chat) halkan ayay toos ugu soo dhacayaan.' : 'Customer queries from the Help Center will appear here in real-time.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportTickets.map((st, idx) => (
                <div key={st.id || idx} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>👤</span>
                        <span>{st.userName}</span>
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">📱 {st.userPhone} • 🕒 {st.time}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      st.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {(st.status || 'OPEN').toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    "{st.message}"
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const reply = prompt(lang === 'so' ? `U dir jawaab ${st.userName}:` : `Send reply to ${st.userName}:`);
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
                          alert(lang === 'so' ? 'Jawaabtaadii toos ayaa loogu diray macaamiilka!' : 'Reply sent directly to customer live chat!');
                        }
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow transition active:scale-95 text-center"
                    >
                      💬 {lang === 'so' ? 'Ka Jawaab (Reply)' : 'Reply to User'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const filtered = supportTickets.filter((_, i) => i !== idx);
                        localStorage.setItem('goobjoog_support_tickets', JSON.stringify(filtered));
                        refreshTickets();
                        alert(lang === 'so' ? 'Tikidhka waa la xalliyay oo waa la saaray.' : 'Ticket resolved.');
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition active:scale-95"
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
      {/* TAB 5: SECURITY, AUDIT LOGS & BACKUPS (Priority 5)                         */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* CREDENTIALS UPDATE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Lock size={16} className="text-rose-600" />
              <span>{lang === 'so' ? 'Amniga Akoonka Admin-ka' : 'Administrator Security & Password'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">{t.username}</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">{lang === 'so' ? 'Furaha Cusub (Password)' : 'New Password'}</label>
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

          {/* AUDIT LOGS TABLE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
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
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
                >
                  {t.triggerBackupBtn}
                </button>

                <button
                  onClick={onClearLogs}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
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

            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{t.registerNewStaffBtn}</h3>

            <form onSubmit={handleRegisterStaffSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{t.fullName} *</label>
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
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{t.phone} *</label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{t.role} *</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  >
                    <option value="administrator">{t.admin}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{t.username} *</label>
                  <input
                    type="text"
                    value={staffUser}
                    onChange={(e) => setStaffUser(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{t.password} *</label>
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
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
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
