// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Home, MessageSquare, Check, X, Trash2, 
  UserPlus, Edit, Search, Lock, Activity, CheckCircle2,
  MapPin, RefreshCw, Send, Shield
} from 'lucide-react';
import type { UserProfile, House, Complaint, AuditLog } from '../domain/entities';

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

type TabType = 'approvals' | 'users' | 'houses' | 'support';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  houses,
  currentUser,
  onToggleUserVerification,
  onRemoveListing,
  onChangeUserRoles,
  onDeleteUser,
  triggerBackup,
  onRegisterUser,
  onUpdateCredentials,
  lang,
  onApproveUpgrade
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('approvals');
  const [searchUser, setSearchUser] = useState('');
  const [searchHouse, setSearchHouse] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  
  // Role Edit state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempRoles, setTempRoles] = useState<string[]>([]);
  
  // Register staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffUser, setStaffUser] = useState('');
  const [staffPass, setStaffPass] = useState('');

  // Password rotation state
  const [adminUsername, setAdminUsername] = useState(currentUser.username);
  const [adminPassword, setAdminPassword] = useState('');

  // Live Support Tickets
  const [tickets, setTickets] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('goobjoog_support_tickets') || '[]');
    } catch {
      return [];
    }
  });

  const loadTickets = () => {
    try {
      setTickets(JSON.parse(localStorage.getItem('goobjoog_support_tickets') || '[]'));
    } catch {}
  };

  useEffect(() => {
    const handleSync = () => loadTickets();
    window.addEventListener('goobjoog_chat_sync', handleSync);
    return () => window.removeEventListener('goobjoog_chat_sync', handleSync);
  }, []);

  const pendingUpgrades = useMemo(() => {
    return users.filter(u => u.upgradeStatus === 'pending');
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchUser.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => 
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q)
    );
  }, [users, searchUser]);

  const filteredHouses = useMemo(() => {
    const q = searchHouse.trim().toLowerCase();
    return houses.filter(h => {
      const matchesSearch = !q || (h.title || '').toLowerCase().includes(q) || (h.district || '').toLowerCase().includes(q);
      const matchesCity = cityFilter === 'all' || (h.city || '').toLowerCase() === cityFilter.toLowerCase();
      return matchesSearch && matchesCity;
    });
  }, [houses, searchHouse, cityFilter]);

  const handleRoleSave = (userId: string) => {
    if (tempRoles.length === 0) {
      alert(lang === 'so' ? 'Dooro ugu yaraan hal door' : 'Select at least one role');
      return;
    }
    onChangeUserRoles(userId, tempRoles);
    setEditingUserId(null);
  };

  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffPhone || !staffUser || !staffPass) {
      alert(lang === 'so' ? 'Fadlan buuxi meelaha banaan' : 'Please fill all fields');
      return;
    }
    onRegisterUser({
      id: `staff_${Date.now()}`,
      fullName: staffName,
      phone: staffPhone,
      email: `${staffUser}@goobjoog.so`,
      username: staffUser.toLowerCase().trim(),
      password: staffPass,
      roles: ['administrator'],
      isVerified: true,
      upgradeStatus: 'none'
    });
    setShowStaffModal(false);
    setStaffName('');
    setStaffPhone('');
    setStaffUser('');
    setStaffPass('');
    alert(lang === 'so' ? 'Shaqaalaha cusub waa la diiwaangeliyey!' : 'Staff registered successfully!');
  };

  const handleReplyTicket = (ticket: any, idx: number) => {
    const reply = prompt(lang === 'so' ? `U dir jawaab ${ticket.userName}:` : `Reply to ${ticket.userName}:`);
    if (reply && reply.trim()) {
      try {
        const chat = JSON.parse(localStorage.getItem('goobjoog_support_chat') || '[]');
        chat.push({
          id: `msg_admin_${Date.now()}`,
          sender: 'admin',
          senderName: 'Admin: ' + (currentUser?.fullName || 'GoobJoog Support'),
          text: reply.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem('goobjoog_support_chat', JSON.stringify(chat));

        // Mark as resolved
        ticket.status = 'resolved';
        localStorage.setItem('goobjoog_support_tickets', JSON.stringify(tickets));
        window.dispatchEvent(new Event('goobjoog_chat_sync'));
        loadTickets();
        alert(lang === 'so' ? 'Jawaabtaada waa la diray!' : 'Reply sent successfully!');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-2 text-slate-800 dark:text-slate-100">
      
      {/* 1. CLEAN TOP BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            🛡️
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {lang === 'so' ? 'Maamulka GoobJoog' : 'GoobJoog Admin Panel'}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>👥 {users.length} {lang === 'so' ? 'Isticmaale' : 'Users'}</span>
              <span>•</span>
              <span>🏡 {houses.length} {lang === 'so' ? 'Guri' : 'Houses'}</span>
              <span>•</span>
              <span>💬 {tickets.length} {lang === 'so' ? 'Fariimood' : 'Tickets'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => {
              triggerBackup();
              alert(lang === 'so' ? 'Snapshot-ka xogta waa la qaatay!' : 'Backup snapshot taken successfully!');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition active:scale-95"
          >
            💾 Backup
          </button>
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95 flex items-center gap-1.5"
          >
            <UserPlus size={14} />
            <span>{lang === 'so' ? 'Kudar Shaqaale' : 'Add Staff'}</span>
          </button>
        </div>
      </div>

      {/* 2. FRIENDLY NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>🌟 {lang === 'so' ? 'Codsiyada Mulkiilaha' : 'Approvals'}</span>
          {pendingUpgrades.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {pendingUpgrades.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users size={14} />
          <span>{lang === 'so' ? 'Isticmaaleyaasha' : 'Users'}</span>
        </button>

        <button
          onClick={() => setActiveTab('houses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'houses'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Home size={14} />
          <span>{lang === 'so' ? 'Guryaha Dalka' : 'Houses'}</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'support'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <MessageSquare size={14} />
          <span>{lang === 'so' ? 'Taageerada & Chat' : 'Support Chat'}</span>
          {tickets.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">
              {tickets.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingUpgrades.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <span className="text-3xl block">✓</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {lang === 'so' ? 'Wax codsi ah oo sugaya ma jiraan' : 'No pending landlord requests'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'so' ? 'Dhammaan dalacsiinta mulkiilayaasha waa la xaqiijiyay.' : 'All homeowner upgrade requests are up to date.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingUpgrades.map(u => (
                <div key={u.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{u.fullName}</h4>
                    <span className="text-[11px] font-mono text-slate-400">@{u.username} • 📱 {u.phone}</span>
                  </div>
                  <button
                    onClick={() => {
                      onApproveUpgrade(u.id);
                      alert(lang === 'so' ? 'Mulkiilaha waa la aqbalay!' : 'Landlord upgrade approved!');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    <Check size={14} />
                    <span>{lang === 'so' ? 'Aqbal' : 'Approve'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'so' ? 'Raadi magac ama tel...' : 'Search user or phone...'}
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-2">Magaca</th>
                  <th className="pb-2">Xiriirka</th>
                  <th className="pb-2">Doorka (Roles)</th>
                  <th className="pb-2">Xaqiijinta</th>
                  <th className="pb-2 text-right">Tirtir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {u.fullName} <span className="text-[10px] text-slate-400 font-normal">(@{u.username})</span>
                    </td>
                    <td className="py-3 font-mono">{u.phone}</td>
                    <td className="py-3">
                      {editingUserId === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] flex items-center gap-1">
                            <input 
                              type="checkbox" 
                              checked={tempRoles.includes('administrator')}
                              onChange={(e) => {
                                if (e.target.checked) setTempRoles([...tempRoles, 'administrator']);
                                else setTempRoles(tempRoles.filter(r => r !== 'administrator'));
                              }}
                            /> Admin
                          </label>
                          <label className="text-[10px] flex items-center gap-1">
                            <input 
                              type="checkbox" 
                              checked={tempRoles.includes('homeowner') || tempRoles.includes('landlord')}
                              onChange={(e) => {
                                if (e.target.checked) setTempRoles([...tempRoles, 'homeowner']);
                                else setTempRoles(tempRoles.filter(r => r !== 'homeowner' && r !== 'landlord'));
                              }}
                            /> Landlord
                          </label>
                          <button onClick={() => handleRoleSave(u.id)} className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px]">OK</button>
                          <button onClick={() => setEditingUserId(null)} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">X</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {(u.roles || []).map(r => (
                            <span key={r} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase">
                              {r}
                            </span>
                          ))}
                          <button onClick={() => { setEditingUserId(u.id); setTempRoles(u.roles || []); }} className="text-slate-400 hover:text-blue-600 p-0.5">
                            <Edit size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => onToggleUserVerification(u.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          u.isVerified ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {u.isVerified ? '✓ Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${u.fullName}?`)) onDeleteUser(u.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={13} />
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

      {/* TAB 3: HOUSES */}
      {activeTab === 'houses' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'so' ? 'Raadi guri ama degmo...' : 'Search house...'}
                value={searchHouse}
                onChange={(e) => setSearchHouse(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
            >
              <option value="all">Dhammaan Magaalooyinka</option>
              <option value="Baydhabo">Baydhabo</option>
              <option value="Muqdisho">Muqdisho</option>
              <option value="Hargeysa">Hargeysa</option>
              <option value="Kismaayo">Kismaayo</option>
              <option value="Garoowe">Garoowe</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredHouses.map(h => (
              <div key={h.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      📍 {h.city} • {h.district}
                    </span>
                    <span className="font-black text-xs text-emerald-600">
                      ${h.priceMonthly}/mo
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-1">{h.title}</h4>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400">🛏️ {h.rooms} qol</span>
                  <button
                    onClick={() => {
                      if (confirm(`Remove listing: ${h.title}?`)) onRemoveListing(h.id);
                    }}
                    className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                  >
                    <Trash2 size={11} />
                    <span>Tirtir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT CHAT */}
      {activeTab === 'support' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              💬 {lang === 'so' ? 'Fariimaha Macaamiisha (Live Support Tickets)' : 'Live Support Inbox'}
            </h3>
            <button
              onClick={loadTickets}
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg font-bold hover:bg-slate-200 flex items-center gap-1"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              Ma jiraan fariimo cusub. Macaamiishu markay soo diraan halkan ayay ka muuqan doonaan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tickets.map((st, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs">👤 {st.userName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{st.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      "{st.message}"
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleReplyTicket(st, idx)}
                      className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                    >
                      💬 Ka Jawaab
                    </button>
                    <button
                      onClick={() => {
                        const filtered = tickets.filter((_, i) => i !== idx);
                        localStorage.setItem('goobjoog_support_tickets', JSON.stringify(filtered));
                        window.dispatchEvent(new Event('goobjoog_chat_sync'));
                        loadTickets();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      ✓ Xalliyey
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REGISTER STAFF MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl relative">
            <button
              onClick={() => setShowStaffModal(false)}
              className="absolute top-3 right-3 text-slate-400 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X size={16} />
            </button>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <UserPlus size={16} className="text-blue-600" />
              <span>Diiwaangeli Shaqaale Cusub</span>
            </h3>
            <form onSubmit={handleRegisterStaff} className="space-y-2.5">
              <input
                type="text"
                placeholder="Magaca oo buuxa *"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                required
              />
              <input
                type="text"
                placeholder="Taleefanka *"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                required
              />
              <input
                type="text"
                placeholder="Username *"
                value={staffUser}
                onChange={(e) => setStaffUser(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono"
                required
              />
              <input
                type="password"
                placeholder="Password *"
                value={staffPass}
                onChange={(e) => setStaffPass(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Diiwaangeli
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
