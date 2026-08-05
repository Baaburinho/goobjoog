// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Users, Home, MessageSquare, Database, Check, X, RefreshCw, Trash2, 
  UserPlus, Key, Edit, ShieldAlert, UserCheck, UserX, Search, Lock, Mail, Smartphone, Volume2
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
  const t = translations[lang];
  const isArabic = lang === 'ar';

  // Search & Filtering Users
  const [userSearch, setUserSearch] = useState('');
  
  // Role Claims editing states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempRoles, setTempRoles] = useState<string[]>([]);
  
  // Change credentials form
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [newPassword, setNewPassword] = useState('');

  // Register staff form
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffUser, setStaffUser] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [staffRole, setStaffRole] = useState<'administrator' | 'accountant'>('accountant');

  // Complaint state
  const [complaintNotes, setComplaintNotes] = useState<Record<string, string>>({});

  // Localized Format Helpers
  const formatNumber = (num: number) => {
    if (lang === 'ar') {
      return new Intl.NumberFormat('ar-SA').format(num);
    }
    return new Intl.NumberFormat('en-US').format(num);
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

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername) {
      alert("Username cannot be empty.");
      return;
    }
    onUpdateCredentials(currentUser.id, newUsername, newPassword || undefined);
    setNewPassword('');
    alert(lang === 'so' ? "Macluumaadka gudaha waa la cusbooneysiiyey!" : lang === 'ar' ? "تم تحديث بيانات الدخول بنجاح!" : "Admin credentials updated successfully!");
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffPhone || !staffUser || !staffPass) {
      alert("Please fill in all required fields.");
      return;
    }

    const exists = users.find(u => u.username.toLowerCase() === staffUser.toLowerCase());
    if (exists) {
      alert("Username is already taken.");
      return;
    }

    const newStaff: UserProfile = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      fullName: staffName,
      email: staffEmail,
      phone: staffPhone,
      username: staffUser,
      password: staffPass,
      roles: [staffRole],
      upgradeStatus: 'none',
      isVerified: true
    };

    onRegisterUser(newStaff);
    alert(`Successfully registered new ${staffRole.toUpperCase()} member: ${staffName}!`);
    
    setStaffName('');
    setStaffPhone('');
    setStaffEmail('');
    setStaffUser('');
    setStaffPass('');
  };

  const safeUsers = users || [];
  const safeHouses = houses || [];
  const safeComplaints = complaints || [];
  const safeAudits = audits || [];

  // Filter users based on search
  const filteredUsers = safeUsers.filter(u => {
    if (!u) return false;
    const term = userSearch.toLowerCase();
    const rolesStr = (u.roles || []).join(', ').toLowerCase();
    return (
      (u.fullName || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term) ||
      (u.phone || '').includes(term) ||
      rolesStr.includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* SYSTEM METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-card shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-brand-primary rounded-full">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'so' ? 'Macaamiisha' : lang === 'ar' ? 'مستخدمي النظام' : 'System Users'}</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">{formatNumber(safeUsers.length)} {lang === 'so' ? 'Kiciyey' : lang === 'ar' ? 'نشط' : 'Active'}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-card shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-full">
            <Home size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{t.listedProperties}</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">{formatNumber(safeHouses.length)} {lang === 'so' ? 'Guri' : lang === 'ar' ? 'منزل' : 'Houses'}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-card shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-full">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'so' ? 'Cawashooyinka' : lang === 'ar' ? 'الشكاوى والطلبات' : 'Complaints Lodged'}</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">{formatNumber(safeComplaints.length)} {lang === 'so' ? 'Tikidh' : lang === 'ar' ? 'تذاكر' : 'Tickets'}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-card shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-full">
            <Database size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{t.dashboard}</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">{formatNumber(safeAudits.length)} {lang === 'so' ? 'Diiwaan' : lang === 'ar' ? 'سجل' : 'Logs'}</div>
          </div>
        </div>
      </div>

      {/* PENDING LANDLORD UPGRADE REQUESTS PANEL */}
      {safeUsers.filter(u => u && u.upgradeStatus === 'pending').length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-card shadow-sm animate-pulse-subtle">
          <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>⏳</span> 
            {lang === 'so' 
              ? `Codsiyada Dalacsiinta Mulkiilayaasha (${formatNumber(safeUsers.filter(u => u && u.upgradeStatus === 'pending').length)})`
              : lang === 'ar'
              ? `طلبات ترقية الحساب إلى مالك عقار (${formatNumber(safeUsers.filter(u => u && u.upgradeStatus === 'pending').length)})`
              : `Landlord Onboarding Verification Desk (${formatNumber(safeUsers.filter(u => u && u.upgradeStatus === 'pending').length)})`}
          </h3>
          <div className="flex flex-col gap-3">
            {safeUsers.filter(u => u && u.upgradeStatus === 'pending').map(user => (
              <div key={user.id} className="bg-white dark:bg-slate-900 border border-amber-200 p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.fullName}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono mt-0.5">@{user.username} | {user.phone}</p>
                  <p className="text-[9px] text-amber-700 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200/50 mt-1.5 inline-block font-bold">
                    {lang === 'so' ? 'Ujeeddo: Noqo Mulkiile Guri' : lang === 'ar' ? 'الغاية: امتلاك وإدراج عقار' : 'Intent: Become Property Homeowner'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onApproveUpgrade(user.id);
                    alert(lang === 'so' ? `Waad ogolaatay codsigii ${user.fullName}!` : lang === 'ar' ? `تمت الموافقة على طلب ${user.fullName}!` : `Approved ${user.fullName} to list and rent properties on GoobJoog!`);
                  }}
                  className="bg-brand-secondary hover:bg-brand-secondary-dark text-white text-xs font-black px-4 py-2 rounded-lg transition shadow-sm"
                >
                  ✓ {lang === 'so' ? 'Ogolaansho & Dalacsiin' : lang === 'ar' ? 'موافقة وترقية' : 'Approve & Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: USER CLAIMS & MODERATION */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* USER MANAGEMENT LAYOUT */}
          <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/50 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'so' ? 'Diiwaanka Macaamiisha' : lang === 'ar' ? 'دليل حسابات المستخدمين' : 'User Accounts Directory'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'so' ? 'Maamul xuquuqda doorka iyo hubinta aqoonsiyada.' : lang === 'ar' ? 'إدارة الصلاحيات والمطالبات الأمنية والحظر.' : 'Manage claims, verification scopes, and account locks'}
                </p>
              </div>
              
              {/* Search user bar */}
              <div className="relative w-full md:w-64">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'so' ? 'Raadi magac, taleefan...' : lang === 'ar' ? 'بحث عن مستخدم، هاتف...' : 'Search user, phone...'}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 dark:border-slate-800 rounded-input focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Cards layout representing users */}
            <div className="flex flex-col gap-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No system users matching search term.
                </div>
              ) : (
                filteredUsers.map(u => {
                  const firstLetter = u.fullName.charAt(0).toUpperCase();
                  const primaryRole = u.roles[0] || 'tenant';
                  
                  // Role colors
                  const roleStyle = 
                    primaryRole === 'administrator' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    primaryRole === 'accountant' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    primaryRole === 'homeowner' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200';

                  const avatarStyle =
                    primaryRole === 'administrator' ? 'bg-rose-500 text-white' :
                    primaryRole === 'accountant' ? 'bg-amber-500 text-white' :
                    primaryRole === 'homeowner' ? 'bg-blue-500 text-white' :
                    'bg-emerald-500 text-white';

                  return (
                    <div 
                      key={u.id}
                      className="p-4 rounded-xl border border-slate-150 bg-white dark:bg-slate-900 hover:border-slate-300 transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Avatar + Details */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${avatarStyle}`}>
                          {firstLetter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{u.fullName}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2.5 mt-1 text-[10px] text-slate-500 dark:text-slate-500">
                            <span className="flex items-center gap-0.5">📞 {u.phone}</span>
                            {u.email && <span className="flex items-center gap-0.5">✉️ {u.email}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions and Roles dropdown */}
                      <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 pt-2.5 md:pt-0">
                        
                        {/* Interactive Role Badge / Select */}
                        <div>
                          {editingUserId === u.id ? (
                            <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-950/50 p-2 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                              <div className="flex gap-2">
                                {['tenant', 'homeowner', 'accountant', 'administrator'].map(r => (
                                  <label key={r} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={tempRoles.includes(r)}
                                      onChange={() => {
                                        setTempRoles(prev => 
                                          prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
                                        );
                                      }}
                                      className="rounded border-slate-350 accent-brand-primary"
                                    />
                                    <span className="uppercase text-[9px]">{r === 'homeowner' ? 'owner' : r}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex gap-2 justify-end mt-1">
                                <button 
                                  onClick={() => handleRoleChangeSubmit(u.id)} 
                                  className="p-1 text-emerald-600 hover:text-emerald-700 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-sm font-bold flex items-center gap-0.5"
                                >
                                  <Check size={11} />
                                </button>
                                <button 
                                  onClick={() => setEditingUserId(null)} 
                                  className="p-1 text-slate-400 hover:text-slate-650 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-sm font-bold flex items-center gap-0.5"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${roleStyle}`}>
                                {u.roles.map((r: string) => r === 'homeowner' ? 'owner' : r).join(', ')}
                              </span>
                              <button 
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setTempRoles(u.roles);
                                }}
                                className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-500 hover:text-brand-primary transition"
                                title="Edit Roles"
                              >
                                <Edit size={12} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Verification toggle */}
                        <button
                          onClick={() => onToggleUserVerification(u.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase transition border ${
                            u.isVerified 
                              ? 'bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-700 border-emerald-200 hover:border-rose-200' 
                              : 'bg-slate-50 dark:bg-slate-950/50 hover:bg-emerald-50 text-slate-500 dark:text-slate-500 hover:text-emerald-700 border-slate-200 dark:border-slate-800 hover:border-emerald-200'
                          }`}
                        >
                          {u.isVerified ? <UserCheck size={12} /> : <UserX size={12} />}
                          {u.isVerified ? (lang === 'so' ? 'Hubo' : lang === 'ar' ? 'مؤكد' : 'Verified') : (lang === 'so' ? 'Dilaa' : lang === 'ar' ? 'غير مؤكد' : 'Unverified')}
                        </button>

                        {/* Delete User */}
                        {currentUser.id !== u.id && (
                          <button
                            onClick={() => {
                              if (confirm(lang === 'so' ? "Ma xaqiiqsaday in la tirtiro akoonkan?" : lang === 'ar' ? "هل أنت متأكد من حذف هذا الحساب؟" : "Are you sure you want to delete this user?")) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ESCALATIONS MAINTENANCE CONTROL */}
          <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-2">
              🚨 {lang === 'so' ? 'Cawashooyinka Guriyeynta' : lang === 'ar' ? 'التذاكر والشكاوى الفنية المفتوحة' : 'Escalation Maintenance Tickets'}
            </h3>

            <div className="flex flex-col gap-4">
              {complaints.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No active maintenance complaints.</div>
              ) : (
                complaints.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.title}</h4>
                        <span className="text-[10px] text-slate-400">Reporter: {c.reporterName} ({c.reporterPhone})</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        c.status === 'open' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-650 leading-relaxed font-medium bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-150">{c.details}</p>

                    {c.status === 'open' ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          placeholder={lang === 'so' ? 'Qor faahfaahinta xalka...' : lang === 'ar' ? 'أدخل ملاحظات الحل هنا...' : 'Enter resolution actions taken...'}
                          value={complaintNotes[c.id] || ''}
                          onChange={(e) => setComplaintNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                          rows={2}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900"
                        />
                        <button
                          onClick={() => {
                            if (!complaintNotes[c.id]) {
                              alert("Please input resolution details.");
                              return;
                            }
                            onResolveComplaint(c.id, complaintNotes[c.id]);
                          }}
                          className="self-end bg-brand-primary hover:bg-brand-primary-dark text-white text-[11px] font-bold py-1 px-3 rounded shadow transition"
                        >
                          Resolve Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-50/50 border-l-2 border-emerald-500 p-2.5 rounded text-[10px] text-emerald-800">
                        <strong>Resolution Notes:</strong> {c.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: AUDITS & BACKUPS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* STAFF REGISTRATION DESK */}
          <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-800/50 pb-2 flex items-center gap-1">
              <UserPlus size={16} className="text-brand-primary" />
              {t.registerStaff}
            </h3>
            <form onSubmit={handleStaffSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Staff Name *</label>
                <input
                  type="text"
                  placeholder="Eng. Huda"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Scope Mobile *</label>
                <input
                  type="text"
                  placeholder="+25261XXXXXXX"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Username *</label>
                  <input
                    type="text"
                    value={staffUser}
                    onChange={(e) => setStaffUser(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Password *</label>
                  <input
                    type="password"
                    value={staffPass}
                    onChange={(e) => setStaffPass(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-slate-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Scope claim *</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded focus:outline-none bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="accountant">ACCOUNTANT</option>
                  <option value="administrator">ADMINISTRATOR</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2 rounded shadow transition mt-1.5 flex items-center justify-center gap-1.5"
              >
                <Key size={13} />
                Register Staff
              </button>
            </form>
          </div>

          {/* AUDIT LOG TIMELINE */}
          <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-800/50 pb-2">
              🖥️ System Audit Logs
            </h3>
            
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto mb-4 border border-slate-200 dark:border-slate-800 rounded p-2.5 bg-slate-50 dark:bg-slate-950/50 font-mono text-[9px]">
              {audits.map(log => (
                <div key={log.id} className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-500 text-[8px] mb-1">
                    <span>{formatDate(log.timestamp)}</span>
                    <span>IP: {log.ipAddress}</span>
                  </div>
                  <p className="text-emerald-700 font-bold text-[8px]">{log.action}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[8px] mt-0.5 leading-normal">{log.details}</p>
                </div>
              ))}
            </div>

            <button
              onClick={onClearLogs}
              className="w-full bg-slate-800 hover:bg-slate-750 text-white font-semibold py-1.5 rounded text-xs transition"
            >
              Clear Terminal Log
            </button>
          </div>

          {/* BACKUP SNAPSHOTS */}
          <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-800/50 pb-2">
              System Backup Snapshots
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">Run full database snapshot backup and save logs to cloud backups bucket.</p>
            
            <button
              onClick={() => {
                triggerBackup();
                alert("Cloud Spanner snapshots generated and backups written securely.");
              }}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold py-2 rounded-input transition flex items-center justify-center gap-1.5 shadow"
            >
              <RefreshCw size={13} />
              Run DB Backup snapshot
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
