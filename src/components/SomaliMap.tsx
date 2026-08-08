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
  'Beledweyne': { en: 'Beledweyne', so: 'Beledweyne', ar: 'بلدوين' },
  'Baidoa': { en: 'Baidoa', so: 'Baydhabo', ar: 'بيدوا' },
  'Mogadishu': { en: 'Mogadishu', so: 'Muqdisho', ar: 'مقديشو' },
  'Kismayo': { en: 'Kismayo', so: 'Kismaayo', ar: 'كيسمايو' },
  'Burao': { en: 'Burao', so: 'Burco', ar: 'برعو' }
};

const MAP_LABELS = {
  title: {
    en: 'Geographic Discovery',
    so: 'Khariidada Dalka Soomaaliya',
    ar: 'خريطة الصومال والاستكشاف الجغرافي'
  },
  subtitle: {
    en: 'Click cities on the map to filter available properties',
    so: 'Guji magaalooyinka khariidada Soomaaliya si aad u aragto guryaha',
    ar: 'اضغط على مدن الخريطة لاستعراض وتصفية العقارات'
  },
  indianOcean: {
    en: 'INDIAN OCEAN',
    so: 'BADWEYNTA HINDIYA',
    ar: 'المحيط الهندي'
  },
  gulfOfAden: {
    en: 'GULF OF ADEN',
    so: 'GACANKA CADAN',
    ar: 'خليج عدن'
  },
  availableListings: {
    en: 'Available Listings',
    so: 'Guryaha Diyaarka ah',
    ar: 'العقارات المتاحة'
  },
  clearFilter: {
    en: 'Clear Map Filter',
    so: 'Nadiifi Shaandhada',
    ar: 'إلغاء التحديد'
  }
};

export const SomaliMap: React.FC<SomaliMapProps> = ({ selectedCity, onSelectCity, cityCounts, lang }) => {
  // Accurate geographic locations plotted on 420x560 Horn of Africa SVG coordinate space
  const cities: CityData[] = [
    { id: 'berbera', name: 'Berbera', count: cityCounts['Berbera'] || 0, x: 130, y: 105, region: 'Saaxil / Coast' },
    { id: 'hargeisa', name: 'Hargeisa', count: cityCounts['Hargeisa'] || 0, x: 95, y: 135, region: 'Maroodi Jeex' },
    { id: 'burao', name: 'Burao', count: cityCounts['Burao'] || 0, x: 155, y: 145, region: 'Togdheer' },
    { id: 'bosaso', name: 'Bosaso', count: cityCounts['Bosaso'] || 0, x: 285, y: 72, region: 'Bari (North Coast)' },
    { id: 'garowe', name: 'Garowe', count: cityCounts['Garowe'] || 0, x: 265, y: 165, region: 'Nugaal' },
    { id: 'galkayo', name: 'Galkayo', count: cityCounts['Galkayo'] || 0, x: 235, y: 240, region: 'Mudug' },
    { id: 'beledweyne', name: 'Beledweyne', count: cityCounts['Beledweyne'] || 0, x: 165, y: 325, region: 'Hiiraan' },
    { id: 'baidoa', name: 'Baidoa', count: cityCounts['Baidoa'] || 0, x: 115, y: 385, region: 'Bay' },
    { id: 'mogadishu', name: 'Mogadishu', count: cityCounts['Mogadishu'] || 0, x: 195, y: 405, region: 'Banaadir (Capital)' },
    { id: 'kismayo', name: 'Kismayo', count: cityCounts['Kismayo'] || 0, x: 115, y: 485, region: 'Jubbada Hoose' }
  ];

  const tMap = MAP_LABELS;
  const isArabic = lang === 'ar';

  return (
    <div className="relative glass-panel rounded-2xl p-5 h-full flex flex-col justify-between overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" dir={isArabic ? 'rtl' : 'ltr'}>
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>🇸🇴</span>
            <span>{tMap.title[lang]}</span>
          </h3>
          {selectedCity && (
            <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
              {CITY_TRANSLATIONS[selectedCity]?.[lang] || selectedCity}
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{tMap.subtitle[lang]}</p>
      </div>

      <div className="flex-1 min-h-[340px] flex items-center justify-center my-2 relative">
        {/* Authentic Horn of Africa / Somalia Geographic SVG Vector */}
        <svg
          viewBox="0 0 420 560"
          className="w-full h-full max-h-[380px] transition-all duration-300 select-none"
          style={{ filter: 'drop-shadow(0px 8px 16px rgba(15, 23, 42, 0.06))' }}
        >
          <defs>
            <linearGradient id="somaliaMapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DBEAFE" />
              <stop offset="50%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="somaliaMapGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Surrounding Ocean Waves & Coastlines */}
          <path
            d="M 20 90 Q 150 70, 310 40 Q 370 30, 400 60"
            fill="none"
            stroke="#93C5FD"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.6"
          />
          <path
            d="M 400 90 Q 370 170, 310 250 Q 250 340, 210 420 Q 160 480, 110 545"
            fill="none"
            stroke="#93C5FD"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.6"
          />

          {/* Gulf of Aden Label */}
          <text x="130" y="60" className="text-[10px] font-black fill-blue-400 dark:fill-blue-500 tracking-widest uppercase select-none pointer-events-none opacity-80">
            ~ {tMap.gulfOfAden[lang]} ~
          </text>

          {/* Indian Ocean Label */}
          <text x="240" y="340" className="text-[10px] font-black fill-blue-400 dark:fill-blue-500 tracking-widest uppercase select-none pointer-events-none opacity-80" transform="rotate(35 240 340)">
            ~ {tMap.indianOcean[lang]} ~
          </text>

          {/* Authentic Somalia Map Outline (Accurate Horn of Africa geometry) */}
          <path
            d="M 42 122 
               C 60 115, 95 108, 130 102 
               C 170 96, 215 88, 255 80 
               C 285 74, 320 62, 348 58 
               C 362 56, 375 62, 378 72 
               C 382 85, 370 98, 362 108 
               C 350 125, 335 155, 322 185 
               C 310 215, 290 245, 275 272 
               C 260 300, 240 330, 222 360 
               C 208 382, 198 402, 185 418 
               C 172 434, 155 452, 140 472 
               C 125 492, 112 515, 98 538 
               C 92 546, 85 545, 82 538 
               C 78 525, 75 505, 72 485 
               C 68 455, 65 435, 70 415 
               C 75 390, 85 370, 95 350 
               C 108 325, 122 300, 138 275 
               C 152 250, 168 225, 180 200 
               C 188 185, 182 178, 165 175 
               C 145 172, 115 170, 90 168 
               C 68 166, 52 155, 45 142 
               Z"
            fill="url(#somaliaMapGradient)"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="dark:fill-slate-800 transition-colors duration-300 cursor-default"
            filter="url(#shadowFilter)"
          />

          {/* Shabelle & Jubba Rivers stylized paths */}
          <path
            d="M 125 350 Q 155 375, 180 405 Q 170 425, 150 445"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1.2"
            opacity="0.5"
          />
          <path
            d="M 80 435 Q 100 460, 110 490"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1.2"
            opacity="0.5"
          />

          {/* Interactive City Nodes */}
          {cities.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
            const translatedName = CITY_TRANSLATIONS[city.name]?.[lang] || city.name;
            const labelWidth = translatedName.length * 6.8 + 26;
            
            return (
              <g
                key={city.id}
                onClick={() => onSelectCity(isSelected ? '' : city.name)}
                className="cursor-pointer group"
              >
                {/* Pulsing ring for selected / hover */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isSelected ? 16 : 10}
                  className={`fill-none stroke-2 transition-all duration-300 ${
                    isSelected
                      ? 'stroke-blue-600 animate-ping opacity-75'
                      : 'stroke-blue-400 group-hover:stroke-blue-600 opacity-60 group-hover:opacity-100'
                  }`}
                />
                
                {/* Solid Core Dot */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isSelected ? 8 : 5.5}
                  className={`transition-all duration-300 ${
                    isSelected
                      ? 'fill-blue-600 shadow-lg'
                      : 'fill-emerald-600 group-hover:fill-blue-600'
                  }`}
                />
                <circle cx={city.x} cy={city.y} r="2.5" fill="#FFFFFF" />

                {/* City Name Label Pill */}
                <g transform={`translate(${city.x > 220 ? city.x - labelWidth - 8 : city.x + 10}, ${city.y - 10})`}>
                  <rect
                    width={labelWidth}
                    height="20"
                    rx="6"
                    className={`transition-all duration-200 ${
                      isSelected 
                        ? 'fill-blue-600 stroke-blue-700 shadow-md' 
                        : 'fill-white/95 dark:fill-slate-800/95 stroke-slate-200 dark:stroke-slate-700 stroke-1 group-hover:fill-blue-50 dark:group-hover:fill-slate-700'
                    }`}
                  />
                  <text
                    x={labelWidth / 2 - 4}
                    y="13"
                    textAnchor="middle"
                    className={`text-[9px] font-extrabold select-none ${
                      isSelected ? 'fill-white' : 'fill-slate-800 dark:fill-slate-100'
                    }`}
                  >
                    {translatedName}
                  </text>

                  {/* Count indicator */}
                  <circle
                    cx={labelWidth - 8}
                    cy="10"
                    r="5.5"
                    className={`${isSelected ? 'fill-white' : 'fill-blue-600'}`}
                  />
                  <text
                    x={labelWidth - 8}
                    y="13"
                    textAnchor="middle"
                    className={`text-[7.5px] font-black select-none ${
                      isSelected ? 'fill-blue-600' : 'fill-white'
                    }`}
                  >
                    {city.count}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Filter Controls */}
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-sm"></span>
          <span>{tMap.availableListings[lang]}</span>
        </div>
        {selectedCity && (
          <button
            onClick={() => onSelectCity('')}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
          >
            {tMap.clearFilter[lang]}
          </button>
        )}
      </div>
    </div>
  );
};
