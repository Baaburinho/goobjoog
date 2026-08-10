// @ts-nocheck
import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Trash2, DollarSign, TrendingUp, 
  Calendar, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';
import type { House, UserProfile, Expense } from '../domain/entities';
import { translations } from '../lib/translations';

interface FinancialLedgerPageProps {
  houses: House[];
  currentLandlord: UserProfile;
  expenses?: Expense[];
  onAddExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  addAuditLog: (action: string, details: string) => void;
  lang: 'en' | 'so' | 'ar';
  onBackToDashboard: () => void;
}

export const FinancialLedgerPage: React.FC<FinancialLedgerPageProps> = ({
  houses,
  currentLandlord,
  expenses = [],
  onAddExpense,
  onDeleteExpense,
  addAuditLog,
  lang,
  onBackToDashboard
}) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<'maintenance' | 'utilities' | 'taxes' | 'renovation' | 'management' | 'other'>('maintenance');
  const [expAmount, setExpAmount] = useState('');
  const [expHouseId, setExpHouseId] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const landlordId = currentLandlord?.id || '';
  const landlordPhone = currentLandlord?.phone || '';
  const myHouses = (houses || []).filter(h => (landlordId && h.landlordId === landlordId) || (landlordPhone && h.landlordPhone === landlordPhone));
  const myExpenses = (expenses || []).filter(e => landlordId && e.landlordId === landlordId);

  const totalExpenseAmount = myExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const estimatedMonthlyIncome = myHouses.reduce((sum, h) => sum + (h.pricePerMonth || 0), 0);
  const netProfit = estimatedMonthlyIncome - totalExpenseAmount;

  const formatNumber = (num: number, decimals: number = 0) => {
    const safeNum = (typeof num === 'number' && !isNaN(num) && isFinite(num)) ? num : 0;
    const options = decimals > 0 ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : {};
    if (lang === 'ar') {
      return new Intl.NumberFormat('ar-SA', options).format(safeNum);
    }
    return new Intl.NumberFormat('en-US', options).format(safeNum);
  };

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-fade-in pb-16" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* PAGE HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft size={18} className={isArabic ? 'rotate-180' : ''} />
              <span className="hidden sm:inline">{lang === 'so' ? 'Dib Ugu Laabto Workspace' : 'Back to Workspace'}</span>
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                📊 {lang === 'so' ? 'Xisaabaadka & Dakhliga (Financial Ledger)' : 'Financial Accounting & Net Profit'}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={16} />
            <span>{t.logNewExpenseBtn || 'Log New Expense'}</span>
          </button>
        </div>
      </div>

      {/* HERO & METRICS CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.totalIncome}</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${formatNumber(estimatedMonthlyIncome)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{myHouses.length} Properties Listed</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
              💵
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.totalExpenses || 'Total Expenses'}</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">${formatNumber(totalExpenseAmount)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{myExpenses.length} Expenses Recorded</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xl">
              🛠️
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t.netProfit || 'Net Profit'}</span>
              <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                ${formatNumber(netProfit)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Estimated Revenue Minus Expenses</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
              📈
            </div>
          </div>
        </div>

        {/* LOGGED PROPERTY EXPENSES TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                📋 {lang === 'so' ? 'Diiwaanka Kharashadka Guryaha' : 'Logged Operational Expenses'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'so' ? 'Diiwaanka oo buuxa oo muujinaya dhammaan dayactirka, kharashka biyaha, cashuuraha iyo maaraynta.' :
                 'Detailed property ledger entries with category tracking and management.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Plus size={16} />
              <span>{t.logNewExpenseBtn || 'Log New Expense'}</span>
            </button>
          </div>

          {myExpenses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400 space-y-3">
              <p className="text-base font-bold text-slate-600 dark:text-slate-300">🛠️ {t.noExpensesLogged || 'No operational expenses recorded yet.'}</p>
              <button
                type="button"
                onClick={() => setShowExpenseModal(true)}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
              >
                + Log First Expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">{t.expenseCategory || 'Category'}</th>
                    <th className="p-3.5">{t.propertyTitleCol || 'Property'}</th>
                    <th className="p-3.5">{t.expenseDescription || 'Description'}</th>
                    <th className="p-3.5">{t.expenseDate || 'Date'}</th>
                    <th className="p-3.5">{t.expenseAmount || 'Amount'}</th>
                    {onDeleteExpense && <th className="p-3.5 text-right"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {exp.category === 'maintenance' ? '🛠️ ' + (t.maintenanceCat || 'Maintenance') :
                         exp.category === 'utilities' ? '💧⚡ ' + (t.utilitiesCat || 'Utilities') :
                         exp.category === 'taxes' ? '🏛️ ' + (t.taxesCat || 'Taxes') :
                         exp.category === 'renovation' ? '🔨 ' + (t.renovationCat || 'Renovation') :
                         exp.category === 'management' ? '👔 ' + (t.managementCat || 'Management') :
                         '📦 ' + (t.otherCat || 'Other')}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">{exp.houseTitle || 'All Properties'}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{exp.description}</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">{exp.date}</td>
                      <td className="p-3.5 font-black text-rose-600">-${formatNumber(exp.amount)}</td>
                      {onDeleteExpense && (
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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

      {/* LOG EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              🛠️ {t.logNewExpenseBtn || 'Log Property Expense'}
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">{t.expenseCategory || 'Category'}</label>
                <select
                  value={expCategory}
                  onChange={(e: any) => setExpCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                >
                  <option value="maintenance">🛠️ {t.maintenanceCat || 'Maintenance & Repairs'}</option>
                  <option value="utilities">💧⚡ {t.utilitiesCat || 'Utilities (Water/Electricity)'}</option>
                  <option value="taxes">🏛️ {t.taxesCat || 'Property Taxes'}</option>
                  <option value="renovation">🔨 {t.renovationCat || 'Renovation & Upgrades'}</option>
                  <option value="management">👔 {t.managementCat || 'Management & Staff'}</option>
                  <option value="other">📦 {t.otherCat || 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">{t.expenseAmount || 'Amount'} ($ USD)</label>
                <input
                  type="number"
                  placeholder="50"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">{t.expenseDescription || 'Description'}</label>
                <input
                  type="text"
                  placeholder="e.g. Water pump replacement"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
              >
                + {t.submit || 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
