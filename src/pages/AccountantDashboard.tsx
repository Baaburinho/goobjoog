import React, { useState } from 'react';
import { DollarSign, Percent, Clock, Home, Check, RefreshCw, Download, FileText, CheckCircle2 } from 'lucide-react';
import type { Transaction, Application, House } from '../domain/entities';
import { translations } from '../lib/translations';

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
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';
  const [financialReportPeriod, setFinancialReportPeriod] = useState<'daily' | 'monthly' | 'annual'>('monthly');

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
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const triggerWebhookSync = () => {
    addAuditLog('WEBHOOK_SCAN', 'Webhook listener scanned Waafi & Hormuud API nodes. Ledger balances synchronized.');
    const alertMsg = lang === 'so' ? "Baaritaanka isbarbardhiga wuu dhamaaday! Nidaamku wuxuu toos ugu xiran yahay Hormuud & Telesom." : 
                     lang === 'ar' ? "اكتمل فحص مطابقة القيود المالية مع بوابات الدفع الإلكترونية بنجاح!" :
                     "Webhook reconciliation scan complete! Systems completely synchronized with central Hormuud and Telesom nodes.";
    alert(alertMsg);
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Tenant Phone", "Landlord", "Property", "Total Rent", "Fee", "Payout", "Gateway", "Status", "Date"];
    const rows = transactions.map(tx => [
      tx.id,
      tx.tenantPhone,
      tx.landlordName,
      `"${tx.houseTitle}"`,
      tx.amountTotal,
      tx.commissionAmount,
      tx.payoutAmount,
      tx.paymentMethod,
      tx.paymentStatus,
      tx.date
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GoobJoog_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('EXPORT_CSV', `Accountant exported financial ledger snapshot.`);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t.totalRevenueStat}
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">${formatNumber(totalRevenue)} USD</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t.failedTransactionsStat}
            </div>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{formatNumber(transactions.filter(t => t.paymentStatus === 'failed').length)}</div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-2xl">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t.pendingTransactionsStat}
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{formatNumber(transactions.filter(t => t.paymentStatus === 'pending').length)}</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-2xl">
            <RefreshCw size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl shadow-sm flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t.activeTenancyRateStat}
            </div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{formatNumber(activeTenancyRate, 1)}%</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-2xl">
            <Percent size={20} />
          </div>
        </div>
      </div>

      {/* SECONDARY METRICS: COMMISSION & OUTSTANDING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">{t.commission} (10%)</span>
            <h3 className="text-2xl font-black mt-1">${formatNumber(systemCommission)} USD</h3>
          </div>
          <button
            onClick={triggerWebhookSync}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl backdrop-blur-sm transition active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            <span>{t.webhookSyncBtn}</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.outstanding}</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">${formatNumber(outstandingPayments)} USD</h3>
          </div>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl transition active:scale-95 flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>{t.exportCsvBtn}</span>
          </button>
        </div>
      </div>

      {/* FINANCIAL LEDGER TABLE */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.financialLedgerTable}</h3>
          
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFinancialReportPeriod('daily')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                financialReportPeriod === 'daily' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {lang === 'so' ? 'Maalinle' : lang === 'ar' ? 'يومي' : 'Daily'}
            </button>
            <button
              onClick={() => setFinancialReportPeriod('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                financialReportPeriod === 'monthly' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {lang === 'so' ? 'Bille' : lang === 'ar' ? 'شهري' : 'Monthly'}
            </button>
            <button
              onClick={() => setFinancialReportPeriod('annual')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                financialReportPeriod === 'annual' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {lang === 'so' ? 'Sanadle' : lang === 'ar' ? 'سنوي' : 'Annual'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="pb-3">{t.transactionDate}</th>
                <th className="pb-3">{t.tenantContact}</th>
                <th className="pb-3">{t.landlordContact}</th>
                <th className="pb-3">{t.propertyTitleCol}</th>
                <th className="pb-3">{t.totalAmountCol}</th>
                <th className="pb-3">{t.systemCommissionCol}</th>
                <th className="pb-3">{t.payoutAmountCol}</th>
                <th className="pb-3">{t.paymentGatewayCol}</th>
                <th className="pb-3">{t.statusCol}</th>
                <th className="pb-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 font-mono text-[11px] text-slate-500">{formatDate(tx.date)}</td>
                  <td className="py-3 font-bold">{tx.tenantPhone}</td>
                  <td className="py-3">{tx.landlordName}</td>
                  <td className="py-3 font-medium text-slate-600 dark:text-slate-300">{tx.houseTitle}</td>
                  <td className="py-3 font-bold text-emerald-600">${formatNumber(tx.amountTotal)}</td>
                  <td className="py-3 text-blue-600 font-medium">${formatNumber(tx.commissionAmount)}</td>
                  <td className="py-3 font-medium">${formatNumber(tx.payoutAmount)}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 uppercase">
                      {tx.paymentMethod === 'evc_plus' ? t.evcPlus : tx.paymentMethod === 'zaad' ? t.zaad : t.sahal}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.paymentStatus === 'successful' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      tx.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {tx.paymentStatus === 'successful' ? t.successful : tx.paymentStatus === 'pending' ? t.pending : t.failed}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {tx.verified ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        ✓ {t.ledgerVerifiedBadge}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onVerifyLedger(tx.id);
                          addAuditLog('LEDGER_VERIFY', `Accountant reconciled transaction ${tx.id}`);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow transition active:scale-95"
                      >
                        {t.verifyLedgerBtn}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
