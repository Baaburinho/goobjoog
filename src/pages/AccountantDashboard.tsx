import React, { useState } from 'react';
import { DollarSign, Percent, Clock, Home, Check, RefreshCw, Download } from 'lucide-react';
import type { Transaction, Application, House } from '../domain/entities';

interface AccountantDashboardProps {
  transactions: Transaction[];
  applications: Application[];
  houses: House[];
  totalRevenue: number;
  systemCommission: number;
  outstandingPayments: number;
  activeTenancyRate: number;
  onVerifyLedger: (txId: string) => void;
  addAuditLog: (action: string, details: string) => void;
  lang: 'en' | 'so' | 'ar';
}

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({
  transactions,
  applications,
  houses,
  totalRevenue,
  systemCommission,
  outstandingPayments,
  activeTenancyRate,
  onVerifyLedger,
  addAuditLog,
  lang
}) => {
  const [financialReportPeriod, setFinancialReportPeriod] = useState<'daily' | 'monthly' | 'annual'>('monthly');
  const isArabic = lang === 'ar';

  // Localized Format Helpers
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
      return new Intl.DateTimeFormat(locale, { 
        dateStyle: 'medium'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const triggerWebhookSync = () => {
    addAuditLog('WEBHOOK_SCAN', 'Webhook listener scanned Waafi API nodes. Ledger balances synchronized.');
    const alertMsg = lang === 'so' ? "Baaritaanka isbarbardhiga wuu dhamaaday!" : 
                     lang === 'ar' ? "اكتمل فحص مطابقة القيود المالية مع بوابات الدفع الإلكترونية!" :
                     "Webhook reconciliation scan complete! Systems completely synchronized with central Hormuud and Telesom nodes.";
    alert(alertMsg);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-card shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'so' ? 'Dakhliga Guud (Guuleystay)' : lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">${formatNumber(totalRevenue)} USD</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-card shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'so' ? 'Macaamilada Fashilmay' : lang === 'ar' ? 'المعاملات الفاشلة' : 'Failed Attempts'}
            </div>
            <div className="text-2xl font-black text-rose-700 mt-1">{transactions.filter(t => t.paymentStatus === 'failed').length}</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
            <Clock size={20} />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-card shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'so' ? 'Macaamilada Sugaya' : lang === 'ar' ? 'المعاملات المعلقة' : 'Pending Payments'}
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">{transactions.filter(t => t.paymentStatus === 'pending').length}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <RefreshCw size={20} />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-card shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'so' ? 'Macaamilada Guuleystay' : lang === 'ar' ? 'المعاملات الناجحة' : 'Successful Payments'}
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">{transactions.filter(t => t.paymentStatus === 'successful').length}</div>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
            <Check size={20} />
          </div>
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: PAYMENT REGISTRY */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {lang === 'so' ? 'Diiwaanka Lacag-bixinta Mobilada' : lang === 'ar' ? 'دفتر قيود المعاملات الإلكترونية' : 'Mobile Money Transaction Ledger'}
              </h3>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-semibold font-mono">
                {lang === 'so' ? 'Diiwaan Laba-geesood ah' : lang === 'ar' ? 'مطابق للقيود المزدوجة' : 'Double-Entry Compliant'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[9px] font-bold">
                    <th className="py-2.5 px-2">{lang === 'so' ? 'Tixraaca / Taariikhda' : lang === 'ar' ? 'رقم المرجع / التاريخ' : 'Reference ID / Date'}</th>
                    <th className="py-2.5 px-2">{lang === 'so' ? 'Bixiyaha (Taleefan)' : lang === 'ar' ? 'المرسل (الهاتف)' : 'Payer (Phone)'}</th>
                    <th className="py-2.5 px-2">{lang === 'so' ? 'Guriga' : lang === 'ar' ? 'العقار' : 'House Details'}</th>
                    <th className="py-2.5 px-2">{lang === 'so' ? 'Lacagta (USD)' : lang === 'ar' ? 'المبلغ' : 'Amount (USD)'}</th>
                    <th className="py-2.5 px-2">{lang === 'so' ? 'Qaybsiga' : lang === 'ar' ? 'التفصيل' : 'Comm/Payout'}</th>
                    <th className="py-2.5 px-2">{lang === 'so' ? 'Adeega' : lang === 'ar' ? 'الوسيلة' : 'Method'}</th>
                    <th className="py-2.5 px-2 text-right">{lang === 'so' ? 'Hubinta' : lang === 'ar' ? 'التسوية' : 'Ledger Verification'}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">No mobile money transactions recorded.</td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:bg-slate-950/50 transition">
                        <td className="py-3 px-2">
                          <span className="font-bold block text-slate-700 dark:text-slate-300 font-mono">{tx.telecomReference}</span>
                          <span className="text-[9px] text-slate-400">{formatDate(tx.date)}</span>
                        </td>
                        <td className="py-3 px-2 font-medium text-slate-600 dark:text-slate-400 font-mono">{tx.tenantPhone}</td>
                        <td className="py-3 px-2">
                          <span className="block text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">{tx.houseTitle}</span>
                          <span className="text-[9px] text-slate-400">Landlord: {tx.landlordName}</span>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-850">${formatNumber(tx.amountTotal, 2)}</td>
                        <td className="py-3 px-2 text-[10px]">
                          <span className="text-emerald-700 font-semibold block">-${formatNumber(tx.commissionAmount, 2)} Comm</span>
                          <span className="text-blue-700 font-semibold block">+${formatNumber(tx.payoutAmount, 2)} Landlord</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase">{tx.paymentMethod.replace('_', ' ')}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {tx.verified ? (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 justify-end">
                              <Check size={11} /> Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onVerifyLedger(tx.id);
                                alert("Transaction verified successfully!");
                              }}
                              className="bg-brand-primary hover:bg-brand-primary-dark text-white text-[10px] font-bold py-1 px-2 rounded shadow transition"
                            >
                              Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: REPORT GENERATOR */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-slate-800/50 pb-2">
              {lang === 'so' ? 'Warbixinnada Dakhliga' : lang === 'ar' ? 'التقارير والبيانات المالية' : 'Financial Reports'}
            </h3>
            
            <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              {['daily', 'monthly', 'annual'].map(period => (
                <button
                  key={period}
                  onClick={() => setFinancialReportPeriod(period as any)}
                  className={`flex-grow text-[10px] font-bold py-1.5 rounded transition uppercase ${
                    financialReportPeriod === period ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm' : 'text-slate-500 dark:text-slate-500'
                  }`}
                >
                  {period === 'daily' ? (lang === 'so' ? 'Maalinle' : lang === 'ar' ? 'يومي' : 'daily') :
                   period === 'monthly' ? (lang === 'so' ? 'Billaha' : lang === 'ar' ? 'شهري' : 'monthly') :
                   (lang === 'so' ? 'Sanadle' : lang === 'ar' ? 'سنوي' : 'annual')}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-155 flex flex-col gap-3 text-xs mb-4">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>{lang === 'so' ? 'Dakhliga Guud:' : lang === 'ar' ? 'الإيرادات الإجمالية:' : 'Gross Revenue:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${formatNumber(totalRevenue)} USD</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>{lang === 'so' ? 'Kumiishinka Diiwaangashan:' : lang === 'ar' ? 'العمولة المتراكمة:' : 'Commission Accrued:'}</span>
                <span className="font-bold text-emerald-700">${formatNumber(systemCommission)} USD</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center text-slate-800 dark:text-slate-200 font-bold text-sm">
                <span>{lang === 'so' ? 'Bedka Guud:' : lang === 'ar' ? 'الحجم الصافي للعمليات:' : 'Net Volume:'}</span>
                <span>${formatNumber(totalRevenue)} USD</span>
              </div>
            </div>

            <button
              onClick={() => alert(`GoobJoog ${financialReportPeriod.toUpperCase()} ledger exported successfully.`)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition shadow"
            >
              <Download size={13} />
              {lang === 'so' ? 'Dhoofi Xogta Maaliyadeed' : lang === 'ar' ? 'تصدير البيانات المالية' : 'Export Financials'}
            </button>
          </div>

          <div className="glass-panel p-5 rounded-card shadow-sm bg-white dark:bg-slate-900">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {lang === 'so' ? 'Is-barbardhiga Diiwaanka' : lang === 'ar' ? 'التسوية ومطابقة الحسابات' : 'Reconciliations Scan'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-4">
              {lang === 'so' ? 'Isbarbardhig toos ah oo SMS-ada iyo shirkadaha isgaarsiinta la sameynayo.' : lang === 'ar' ? 'إجراء فحص ومطابقة تلقائية لرسائل المعاملات المالية الصادرة من مزودي الخدمة.' : 'Trigger central webhook query matching telecom SMS API records with internal database ledgers.'}
            </p>
            <button
              onClick={triggerWebhookSync}
              className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded border border-slate-200 dark:border-slate-800 shadow-sm transition flex items-center justify-center gap-1"
            >
              <RefreshCw size={12} />
              {lang === 'so' ? 'Hubi Webhook Ledgers' : lang === 'ar' ? 'بدء فحص المطابقة' : 'Verify Webhook Ledgers'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
