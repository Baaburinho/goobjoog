import React from 'react';

interface CityData {
  id: string;
  name: string;
  count: number;
  x: number; // SVG coordinates
  y: number;
  region: string;
}

interface SomaliMapProps {
  selectedCity: string;
  onSelectCity: (cityName: string) => void;
  cityCounts: Record<string, number>;
  lang: 'en' | 'so' | 'ar';
}

const CITY_TRANSLATIONS: Record<string, Record<'en' | 'so' | 'ar', string>> = {
  'Hargeisa': { en: 'Hargeisa', so: 'Hargeysa', ar: 'هرجيسا' },
  'Berbera': { en: 'Berbera', so: 'Berbera', ar: 'بربرة' },
  'Bosaso': { en: 'Bosaso', so: 'Boosaaso', ar: 'بوساسو' },
  'Garowe': { en: 'Garowe', so: 'Garoowe', ar: 'غاروي' },
  'Galkayo': { en: 'Galkayo', so: 'Gaalkacayo', ar: 'جالكعيو' },
  'Baidoa': { en: 'Baidoa', so: 'Baydhabo', ar: 'بيدوا' },
  'Mogadishu': { en: 'Mogadishu', so: 'Muqdisho', ar: 'مقديشو' },
  'Kismayo': { en: 'Kismayo', so: 'Kismaayo', ar: 'كيسمايو' }
};

const MAP_LABELS = {
  title: {
    en: 'Geographic Discovery',
    so: 'Helitaanka Deegaanka',
    ar: 'الاستكشاف الجغرافي'
  },
  subtitle: {
    en: 'Click cities on the map to filter available properties',
    so: 'Guji magaalooyinka khariidada si aad u shaandhayso guryaha',
    ar: 'اضغط على المدن في الخريطة لتصفية العقارات المتاحة'
  },
  indianOcean: {
    en: 'INDIAN OCEAN',
    so: 'BADWEYNTA HINDIYA',
    ar: 'المحيط الهندي'
  },
  gulfOfAden: {
    en: 'GULF OF ADEN',
    so: 'KHALIJKII CADAN',
    ar: 'خليج عدن'
  },
  availableListings: {
    en: 'Available Listings',
    so: 'Guryaha Diyaarka ah',
    ar: 'العقارات المتاحة'
  },
  clearFilter: {
    en: 'Clear Map Filter',
    so: 'Nadiifi Khariidada',
    ar: 'إزالة تصفية الخريطة'
  }
};

export const SomaliMap: React.FC<SomaliMapProps> = ({ selectedCity, onSelectCity, cityCounts, lang }) => {
  const cities: CityData[] = [
    { id: 'hargeisa', name: 'Hargeisa', count: cityCounts['Hargeisa'] || 0, x: 120, y: 150, region: 'Somaliland' },
    { id: 'berbera', name: 'Berbera', count: cityCounts['Berbera'] || 0, x: 165, y: 125, region: 'Somaliland (Coast)' },
    { id: 'bosaso', name: 'Bosaso', count: cityCounts['Bosaso'] || 0, x: 290, y: 120, region: 'Puntland (North Coast)' },
    { id: 'garowe', name: 'Garowe', count: cityCounts['Garowe'] || 0, x: 260, y: 180, region: 'Puntland' },
    { id: 'galkayo', name: 'Galkayo', count: cityCounts['Galkayo'] || 0, x: 230, y: 260, region: 'Mudug (Central)' },
    { id: 'baidoa', name: 'Baidoa', count: cityCounts['Baidoa'] || 0, x: 135, y: 350, region: 'Bay (South West)' },
    { id: 'mogadishu', name: 'Mogadishu', count: cityCounts['Mogadishu'] || 0, x: 190, y: 380, region: 'Banadir (South-Central)' },
    { id: 'kismayo', name: 'Kismayo', count: cityCounts['Kismayo'] || 0, x: 110, y: 440, region: 'Jubaland (South)' },
  ];

  const tMap = MAP_LABELS;
  const isArabic = lang === 'ar';

  return (
    <div className="relative glass-panel rounded-card p-6 h-full flex flex-col justify-between overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" dir={isArabic ? 'rtl' : 'ltr'}>
      <div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-0.5">{tMap.title[lang]}</h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">{tMap.subtitle[lang]}</p>
      </div>

      <div className="flex-1 min-h-[300px] flex items-center justify-center my-4 relative">
        {/* Stylized Somalia Vector SVG */}
        <svg
          viewBox="0 0 400 500"
          className="w-full h-full max-h-[380px] text-slate-300 transition-all duration-300"
          style={{ filter: 'drop-shadow(0px 10px 20px rgba(15, 23, 42, 0.05))' }}
        >
          {/* Schematic outline representing the shape of Somalia */}
          <path
            d="M 100 130 
               L 180 120 
               Q 230 110, 270 140 
               Q 300 160, 320 200 
               Q 310 230, 280 235 
               Q 250 240, 240 260 
               Q 230 280, 220 310 
               Q 210 340, 195 380 
               Q 180 420, 140 430 
               Q 100 440, 80 470
               L 70 480
               L 60 450
               L 95 400
               L 130 350
               L 165 310
               L 170 280
               L 140 260
               L 110 210
               L 80 180
               Z"
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          />

          {/* Surrounding Coastlines & Ocean label */}
          <path
            d="M 50 120 C 120 110, 250 100, 350 150"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text x={isArabic ? "100" : "320"} y="270" className="text-[9px] font-black fill-slate-400 tracking-wider font-sans select-none pointer-events-none uppercase">
            {tMap.indianOcean[lang]}
          </text>
          <text x="60" y="80" className="text-[9px] font-black fill-slate-400 tracking-wider font-sans select-none pointer-events-none uppercase">
            {tMap.gulfOfAden[lang]}
          </text>

          {/* City Nodes */}
          {cities.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
            const translatedName = CITY_TRANSLATIONS[city.name]?.[lang] || city.name;
            
            return (
              <g
                key={city.id}
                onClick={() => onSelectCity(isSelected ? '' : city.name)}
                className="cursor-pointer group"
              >
                {/* Pulse ring for selected / hovered */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isSelected ? 18 : 12}
                  className={`fill-none stroke-2 transition-all duration-300 ${
                    isSelected
                      ? 'stroke-brand-primary animate-pulse'
                      : 'stroke-brand-secondary/60 group-hover:stroke-brand-secondary scale-110 opacity-70 group-hover:opacity-100'
                  }`}
                />
                
                {/* Outer solid glow ring */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isSelected ? 10 : 7}
                  className={`transition-all duration-300 ${
                    isSelected
                      ? 'fill-brand-primary shadow-lg shadow-blue-500/50'
                      : 'fill-brand-secondary group-hover:fill-brand-secondary-dark'
                  }`}
                />

                {/* City Core Dot */}
                <circle cx={city.x} cy={city.y} r="3" fill="#FFFFFF" />

                {/* City Label Background */}
                <rect
                  x={city.x + 12}
                  y={city.y - 14}
                  width={translatedName.length * 7 + 34}
                  height="22"
                  rx="6"
                  className={`transition-all duration-200 ${
                    isSelected 
                      ? 'fill-brand-primary' 
                      : 'fill-white/95 stroke-slate-200 stroke-1 group-hover:fill-slate-50'
                  }`}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
                />

                {/* City Text Label */}
                <text
                  x={city.x + 18}
                  y={city.y + 1}
                  className={`text-[9px] font-bold transition-all duration-200 select-none ${
                    isSelected ? 'fill-white' : 'fill-slate-700'
                  }`}
                >
                  {translatedName}
                </text>

                {/* Count badge on label */}
                <circle
                  cx={city.x + translatedName.length * 7 + 34}
                  cy={city.y - 3}
                  r="7"
                  className={`${isSelected ? 'fill-white' : 'fill-brand-secondary'}`}
                />
                <text
                  x={city.x + translatedName.length * 7 + 34}
                  y={city.y}
                  textAnchor="middle"
                  className={`text-[8px] font-bold select-none ${
                    isSelected ? 'fill-brand-primary' : 'fill-white'
                  }`}
                >
                  {city.count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60">
        <div className="text-[10px] text-slate-500 dark:text-slate-500 flex items-center gap-1.5 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-secondary block"></span>
          <span>{tMap.availableListings[lang]}</span>
        </div>
        {selectedCity && (
          <button
            onClick={() => onSelectCity('')}
            className="text-[10px] font-bold text-brand-primary hover:text-brand-primary-dark transition"
          >
            {tMap.clearFilter[lang]}
          </button>
        )}
      </div>
    </div>
  );
};
