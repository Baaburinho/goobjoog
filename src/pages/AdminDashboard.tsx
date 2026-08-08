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
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  // Search & Filtering Users
  const [userSearch, setUserSearch] = useState('');
  
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
  const pendingUpgrades = users.filter(u => u.upgradeStatus === 'pending');

  return (
    <div className="flex flex-col gap-6 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* PENDING LANDLORD UPGRADES ALERT BANNER FOR ADMIN */}
      {pendingUpgrades.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <span>🌟</span>
              <span>
                {lang === 'so' ? `Codsiyo Dalacsiin Mulkiile ah ayaa jira (${pendingUpgrades.length})` :
                 lang === 'ar' ? `طلبات ترقية إلى مالك عقار معلقة (${pendingUpgrades.length})` :
                 `Pending Landlord Upgrade Applications (${pendingUpgrades.length})`}
              </span>
            </h3>
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-bold">
              {lang === 'so' ? 'U baahan Aqbalaad' : lang === 'ar' ? 'يتطلب موافقة' : 'Action Required'}
            </span>
          </div>
          <p className="text-xs text-amber-100 leading-relaxed">
            {lang === 'so' ? 'Kireystayaasha hoos ku qoran waxay soo gudbiyeen xogtooda guryaha si ay Mulkiilayaal u noqdaan. Guji "Aqbal Mulkiilenimada" si aad ugu oggolaato kireynta guryaha.' :
             lang === 'ar' ? 'قام المستأجرون المذكورون أدناه بتقديم بيانات عقاراتهم للتحول إلى مالكي عقارات. اضغط على "قبول الترقية" للموافقة.' :
             'The tenants listed below submitted property proof to list their houses. Click "Approve Landlord Upgrade" to grant homeowner dashboard access.'}
          </p>
          <div className="space-y-2 pt-1">
            {pendingUpgrades.map(u => (
              <div key={u.id} className="p-3 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs block">{u.fullName}</span>
                  <span className="text-[10px] text-amber-100 font-mono">@{u.username} • {u.phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onApproveUpgrade(u.id);
                    alert(lang === 'so' ? 'Dalacsiinta mulkiilaha waa la oggolaaday!' : lang === 'ar' ? 'تمت الموافقة على ترقية الحساب إلى مالك عقار بنجاح!' : 'Landlord upgrade approved successfully!');
                  }}
                  className="px-3 py-1.5 bg-white text-orange-700 hover:bg-amber-50 font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1"
                >
                  <Check size={14} />
                  <span>{t.approveLandlordUpgradeBtn || 'Aqbal Mulkiilenimada'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SYSTEM STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.totalUsersStat}</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{formatNumber(users.length)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-xl">
            👥
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.activeListingsStat}</span>
            <span className="text-2xl font-black text-emerald-600">{formatNumber(houses.length)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            🏠
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.openComplaintsStat}</span>
            <span className="text-2xl font-black text-rose-600">{formatNumber(complaints.filter(c => c.status === 'open').length)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold text-xl">
            ⚠️
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.systemUptimeStat}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md mt-1 inline-block">
              ● 99.98% SLA
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
        </div>
      </div>

      {/* USER MANAGEMENT & PRIVILEGES TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.userManagementTable}</h3>
            <p className="text-xs text-slate-400">{lang === 'so' ? 'Maamul isticmaaleyaasha, xuquuqaha, iyo oggolaanshaha dalacsiinta.' : lang === 'ar' ? 'إدارة حسابات المستخدمين وصلاحيات الأدوار وقبول طلبات الترقية.' : 'Manage accounts, role claims, and landlord upgrade approvals.'}</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-2.5 text-slate-400`} size={14} />
              <input
                type="text"
                placeholder={t.searchUsersPlaceholder}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={`w-full ${isArabic ? 'pr-8 pl-3 text-right' : 'pl-8 pr-3 text-left'} py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100`}
              />
            </div>

            <button
              onClick={() => setShowStaffModal(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">{t.registerNewStaffBtn}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="pb-3">{t.userCol}</th>
                <th className="pb-3">{t.rolesCol}</th>
                <th className="pb-3">{t.verificationCol}</th>
                <th className="pb-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 font-medium">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold block">{u.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{u.username} • {u.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map(r => (
                        <span key={r} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                          {r === 'administrator' || r === 'admin' ? t.admin : r === 'homeowner' || r === 'landlord' ? t.landlord : t.tenant}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3">
                    <button
                      onClick={() => onToggleUserVerification(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                        u.isVerified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}
                    >
                      {u.isVerified ? `✓ ${t.verified}` : t.unverified}
                    </button>
                  </td>

                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.upgradeStatus === 'pending' && (
                        <button
                          onClick={() => {
                            onApproveUpgrade(u.id);
                            alert(lang === 'so' ? 'Dalacsiinta mulkiilaha waa la oggolaaday!' : lang === 'ar' ? 'تمت ترقية الحساب إلى مالك عقار بنجاح!' : 'Landlord upgrade approved successfully!');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow"
                        >
                          {t.approveLandlordUpgradeBtn}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingUserId(u.id);
                          setTempRoles([...u.roles]);
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition"
                        title={t.editRolesBtn}
                      >
                        <Edit size={13} />
                      </button>

                      <button
                        onClick={() => {
                          if (currentUser.id === u.id) {
                            alert(t.cannotDeleteSelfMsg);
                            return;
                          }
                          if (confirm(lang === 'so' ? `Ma hubtaa inaad tirtirto akoonka ${u.fullName}?` : lang === 'ar' ? `هل أنت متأكد من رغبتك في حذف حساب ${u.fullName}؟` : `Are you sure you want to delete user ${u.fullName}?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        title={t.deleteUserBtn}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ROLES MODAL */}
      {editingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setEditingUserId(null)}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.editRolesBtn}</h3>

            <div className="space-y-2">
              {['tenant', 'homeowner', 'administrator'].map(roleOption => (
                <label key={roleOption} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <input
                    type="checkbox"
                    checked={tempRoles.includes(roleOption)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempRoles(prev => [...prev, roleOption]);
                      } else {
                        setTempRoles(prev => prev.filter(r => r !== roleOption));
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>
                    {roleOption === 'administrator' ? t.admin : roleOption === 'homeowner' ? t.landlord : t.tenant}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={() => handleRoleChangeSubmit(editingUserId)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}

      {/* COMPLAINTS RESOLUTION SECTION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.complaintsResolutionTitle}</h3>

        {complaints.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            {lang === 'so' ? 'Ma jiraan wax tabashooyin ah oo furan.' : lang === 'ar' ? 'لا توجد شكاوى معلقة حالياً.' : 'No open complaints in the system.'}
          </p>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">{c.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.details}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {t.complaintFrom}: {c.reporterName} ({c.reporterPhone}) • {c.houseTitle}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onResolveComplaint(c.id, complaintNotes[c.id] || 'Resolved by admin');
                    alert(lang === 'so' ? 'Tabashada si guul leh ayaa loo xalliyey!' : lang === 'ar' ? 'تم حل الشكوى وإغلاق البلاغ بنجاح!' : 'Complaint marked as resolved.');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {t.resolveComplaintBtn}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SYSTEM AUDIT LOGS TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.systemAuditLogsTable}</h3>
            <p className="text-xs text-slate-400">{lang === 'so' ? 'Diiwaanka dhammaan ficillada amniga iyo dhacdooyinka nidaamka.' : lang === 'ar' ? 'سجل تتبع تدقيق أمان النظام والعمليات الإدارية.' : 'Real-time security and operations audit log trail.'}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                triggerBackup();
                alert(lang === 'so' ? 'Snapshot-ka xogta waxaa lagu qoray cloud bucket.' : lang === 'ar' ? 'تم أخذ نسخة احتياطية سحابية للنظام بنجاح.' : 'Backup snapshot generated and synced.');
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

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.registerNewStaffBtn}</h3>

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
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
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
