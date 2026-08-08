import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { translations } from '../../lib/translations';

interface StaticPageModalProps {
  onClose: () => void;
  title: string;
  pageType: 'help' | 'about' | 'privacy' | 'terms';
  lang?: 'en' | 'so' | 'ar';
}

export const StaticPageModal: React.FC<StaticPageModalProps> = ({ onClose, title, pageType, lang = 'en' }) => {
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const renderContent = () => {
    switch (pageType) {
      case 'help':
        return (
          <div className="flex flex-col gap-6" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-300 mb-1">{t.helpCenter}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {lang === 'so' ? 'Ka raadi macluumaadka aad u baahan tahay ama la xiriir kooxdayada taageerada.' :
                 lang === 'ar' ? 'ابحث في قاعدة المعرفة أو تواصل مع فريق الدعم الفني لحل أي استفسار.' :
                 'Search our knowledge base or contact our support team.'}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">{t.faqTitle}</h4>
              <div className="flex flex-col gap-2">
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'so' ? 'Sideen kirada ugu bixin karaa EVC Plus / Sahal?' :
                     lang === 'ar' ? 'كيف أقوم بسداد الإيجار عبر EVC Plus أو Sahal أو Zaad؟' :
                     'How do I pay rent using EVC Plus?'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'so' ? 'Tag qaybta Bixinta (Payments), dooro dalabkaaga, oo geli 4-ta lambar ee sirta ah ee taleefankaaga.' :
                     lang === 'ar' ? 'انتقل إلى تبويب المدفوعات، ثم اختر العقار واضغط سداد الإيجار وأدخل رمز PIN السري في شاشة الهاتف.' :
                     'Go to the Payments tab, select your pending rent, and enter your 4-digit PIN when prompted.'}
                  </span>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {lang === 'so' ? 'Sideen u noqon karaa Mulkiile guryo diiwaangeliya?' :
                     lang === 'ar' ? 'كيف أقوم بترقية حسابي وإدراج عقارات كمالك؟' :
                     'How do I become a Landlord?'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'so' ? 'Guji batoonka "Codso In Laguu Dalaco Mulkiile" ee ku yaala bogga hore si maamuluhu kuu xaqiijiyo.' :
                     lang === 'ar' ? 'اضغط على زر طلب ترقية الحساب إلى مالك عقار في الصفحة الرئيسية ليتم اعتماد ملفك من الإدارة.' :
                     'Click "Apply to Become Landlord" in your dashboard. An administrator will verify your profile.'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                {lang === 'so' ? 'La Xiriir Kooxda Caawinta' : lang === 'ar' ? 'التواصل مع فريق خدمة العملاء' : 'Contact Support Team'}
              </button>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white text-3xl font-black">
              🏠
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t.aboutGoobJoogTitle}</h3>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-mono">
              Version 2.4.1 (Build 8932)
            </span>
            
            <div className="mt-8 text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed space-y-3">
              <p>{t.aboutGoobJoogBody}</p>
              <p className="font-bold text-blue-600">Somalia 🇸🇴</p>
              <p>&copy; {new Date().getFullYear()} GoobJoog Technologies. All rights reserved.</p>
            </div>
          </div>
        );
      case 'privacy':
      case 'terms':
        return (
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex flex-col gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {lang === 'so' ? 'Taariikhda dib u eegista: August 2026' : lang === 'ar' ? 'آخر تحديث: أغسطس ٢٠٢٦' : 'Last updated: August 2026'}
            </p>
            <p>
              {lang === 'so' ? 'GoobJoog waxay dhowreysaa dhammaan xogta iyo xasaanadda isticmaaleyaasha iyadoo la raacayo shuruucda ilaalinta xogta ee Soomaaliya.' :
               lang === 'ar' ? 'تلتزم منصة جوب جوج بأعلى معايير حماية البيانات وسرية المعلومات المالية والشخصية لجميع المستأجرين والملّاك في الصومال.' :
               'GoobJoog platform is committed to strict data security, privacy, and encryption for all real estate and rental payment records in Somalia.'}
            </p>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-2">
              {lang === 'so' ? '1. Ururinta Xogta' : lang === 'ar' ? '١. جمع البيانات واستخدامها' : '1. Data Collection'}
            </h4>
            <p>
              {lang === 'so' ? 'Waxaan ururinaa keliya xogta muhiimka u ah kireynta guryaha iyo xaqiijinta aqoonsiga. Marna lama iibiyo xogtaada.' :
               lang === 'ar' ? 'نقوم فقط بجمع البيانات الأساسية الضرورية لإتمام عمليات الإيجار والتحقق من الهوية ولا نشاركها مع أي طرف خارجي.' :
               'We collect essential data required to facilitate secure property rentals and verify identities. We never sell your personal data.'}
            </p>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-2">
              {lang === 'so' ? '2. Bixinta Lacagaha Mobile Money' : lang === 'ar' ? '٢. أمان المعاملات المالية' : '2. Mobile Payments Security'}
            </h4>
            <p>
              {lang === 'so' ? 'Dhammaan dhaqdhaqaaqa lacagaha waxay toos u maraan shirkadaha Hormuud (EVC Plus), Telesom (Zaad), iyo Golis (Sahal).' :
               lang === 'ar' ? 'تتم جميع عمليات تحويل وسداد الإيجار عبر بروتوكولات مشفرة مباشرة مع شبكات الاتصالات (Hormuud EVC Plus, Telesom ZAAD, Golis Sahal).' :
               'All mobile money transactions are securely routed through certified telecom APIs (Hormuud EVC Plus, Telesom ZAAD, Golis Sahal). We do not store your private PIN codes.'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-fadeIn" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10 bg-white dark:bg-slate-950">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
          <ArrowLeft size={20} className={isArabic ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 pb-20">
        {renderContent()}
      </div>
    </div>
  );
};
