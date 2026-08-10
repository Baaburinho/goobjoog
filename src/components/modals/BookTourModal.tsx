import React, { useState } from 'react';
import { X, Calendar, Clock, Video, MapPin, User, CheckCircle2 } from 'lucide-react';
import type { House, UserProfile, HouseTour } from '../../domain/entities';
import { useLanguage } from '../../app/context/LanguageContext';
import { translations } from '../../lib/translations';

interface BookTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  house: House | null;
  currentTenant: UserProfile;
  onBookTour: (tour: HouseTour) => void;
}

export const BookTourModal: React.FC<BookTourModalProps> = ({
  isOpen,
  onClose,
  house,
  currentTenant,
  onBookTour
}) => {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;
  const isArabic = lang === 'ar';

  const defaultDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [tourDate, setTourDate] = useState(defaultDate);
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [tourType, setTourType] = useState<'in_person' | 'video_call'>('in_person');
  const [notes, setNotes] = useState('');

  if (!isOpen || !house) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTour: HouseTour = {
      id: 'tour-' + Math.random().toString(36).substr(2, 9),
      houseId: house.id,
      houseTitle: house.title,
      tenantId: currentTenant.id,
      tenantName: currentTenant.fullName,
      tenantPhone: currentTenant.phone,
      landlordId: house.landlordId,
      tourDate,
      tourTimeSlot: timeSlot,
      tourType,
      status: 'pending',
      notes,
      createdAt: new Date().toISOString()
    };

    onBookTour(newTour);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {lang === 'so' ? 'Qabsashada Ballanta Booqashada' : lang === 'ar' ? 'حجز موعد معاينة العقار' : 'Schedule Viewing Tour'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {house.title} • {house.district}, {house.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Preferred Tour Type */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              {lang === 'so' ? 'Nooca Booqashada' : lang === 'ar' ? 'نوع المعاينة' : 'Tour Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTourType('in_person')}
                className={`p-3 rounded-2xl border transition flex items-center justify-center gap-2 font-bold ${
                  tourType === 'in_person'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <MapPin size={16} />
                <span>{lang === 'so' ? 'Booqasho Goobta Ah' : lang === 'ar' ? 'زيارة ميدانية' : 'In-Person Visit'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTourType('video_call')}
                className={`p-3 rounded-2xl border transition flex items-center justify-center gap-2 font-bold ${
                  tourType === 'video_call'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Video size={16} />
                <span>{lang === 'so' ? 'Direct Video Tour' : lang === 'ar' ? 'معاينة عبر الفيديو' : 'Live Video Tour'}</span>
              </button>
            </div>
          </div>

          {/* Preferred Date */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              {lang === 'so' ? 'Taariikhda Booqashada' : lang === 'ar' ? 'تاريخ المعاينة' : 'Preferred Date'}
            </label>
            <input
              type="date"
              value={tourDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setTourDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Preferred Time Slot */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              {lang === 'so' ? 'Waqtiga Maalintii' : lang === 'ar' ? 'الفترة الزمنية' : 'Preferred Time Slot'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTimeSlot('morning')}
                className={`py-2.5 px-2 rounded-xl border transition text-center font-bold ${
                  timeSlot === 'morning'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                ☀️ {lang === 'so' ? 'Subax' : lang === 'ar' ? 'صباحاً' : 'Morning'}
              </button>

              <button
                type="button"
                onClick={() => setTimeSlot('afternoon')}
                className={`py-2.5 px-2 rounded-xl border transition text-center font-bold ${
                  timeSlot === 'afternoon'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                🌤️ {lang === 'so' ? 'Galab' : lang === 'ar' ? 'عصراً' : 'Afternoon'}
              </button>

              <button
                type="button"
                onClick={() => setTimeSlot('evening')}
                className={`py-2.5 px-2 rounded-xl border transition text-center font-bold ${
                  timeSlot === 'evening'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                🌙 {lang === 'so' ? 'Habeen' : lang === 'ar' ? 'مساءً' : 'Evening'}
              </button>
            </div>
          </div>

          {/* Notes for Landlord */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              {lang === 'so' ? 'Fariin / Ogeysiis Mulkiilaha (Tusaale)' : lang === 'ar' ? 'ملاحظات للمالك' : 'Notes for Landlord (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder={lang === 'so' ? 'tusaale: Waxaa ila socda 2 qof si aan guriga u wada eegno.' : 'e.g. Bringing family members for property tour.'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              {t.clear || 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              <span>{lang === 'so' ? 'Xaqiiji Ballanta' : lang === 'ar' ? 'تأكيد طلب المعاينة' : 'Book Viewing Tour'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
