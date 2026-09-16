import React from 'react';
import { X, Check, Calculator, Clock, Moon, Sun, Sparkles, BookOpen } from 'lucide-react';
import {
  AsrMadhab,
  CalculationMethodId,
  ChashtAutoRule,
  ChashtMode,
  GlobalCalculationSettings,
  PrayerSetting,
  TahajjudAutoRule,
  TahajjudMode,
} from '../types';

interface CalculationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalSettings: GlobalCalculationSettings;
  onUpdateGlobalSettings: (newSettings: GlobalCalculationSettings) => void;
  prayerSettings: PrayerSetting[];
  onUpdatePrayerSetting: (prayerId: string, partial: Partial<PrayerSetting>) => void;
}

const METHODS_CATALOG: {
  id: CalculationMethodId;
  name: string;
  region: string;
  fajrAngle: string;
  ishaAngle: string;
}[] = [
  {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    region: 'Pakistan, India, Bangladesh, Afghanistan',
    fajrAngle: '18.0°',
    ishaAngle: '18.0°',
  },
  {
    id: 'UmmAlQura',
    name: 'Umm Al-Qura University, Makkah',
    region: 'Saudi Arabia & Arabian Peninsula',
    fajrAngle: '18.5°',
    ishaAngle: '90 min after Maghrib (120 min in Ramadan)',
  },
  {
    id: 'MuslimWorldLeague',
    name: 'Muslim World League (MWL)',
    region: 'Europe, Far East, Global standard',
    fajrAngle: '18.0°',
    ishaAngle: '17.0°',
  },
  {
    id: 'NorthAmerica',
    name: 'Islamic Society of North America (ISNA)',
    region: 'United States, Canada',
    fajrAngle: '15.0°',
    ishaAngle: '15.0°',
  },
  {
    id: 'Egyptian',
    name: 'Egyptian General Authority of Survey',
    region: 'Egypt, Africa, Middle East, Malaysia, Lebanon',
    fajrAngle: '19.5°',
    ishaAngle: '17.5°',
  },
  {
    id: 'Dubai',
    name: 'Dubai (Awqaf & Islamic Affairs)',
    region: 'United Arab Emirates',
    fajrAngle: '18.2°',
    ishaAngle: '18.2°',
  },
  {
    id: 'Qatar',
    name: 'State of Qatar',
    region: 'Qatar',
    fajrAngle: '18.0°',
    ishaAngle: '90 min after Maghrib',
  },
  {
    id: 'Kuwait',
    name: 'Ministry of Awqaf, Kuwait',
    region: 'Kuwait',
    fajrAngle: '18.0°',
    ishaAngle: '17.5°',
  },
  {
    id: 'MoonsightingCommittee',
    name: 'Moonsighting Committee Worldwide',
    region: 'North America / UK / Worldwide',
    fajrAngle: '18.0°',
    ishaAngle: '18.0°',
  },
  {
    id: 'Singapore',
    name: 'Majlis Ugama Islam Singapura (MUIS)',
    region: 'Singapore, Southeast Asia',
    fajrAngle: '20.0°',
    ishaAngle: '18.0°',
  },
  {
    id: 'Turkey',
    name: 'Diyanet İşleri Başkanlığı',
    region: 'Turkey',
    fajrAngle: '18.0°',
    ishaAngle: '17.0°',
  },
];

export const CalculationSettingsModal: React.FC<CalculationSettingsModalProps> = ({
  isOpen,
  onClose,
  globalSettings,
  onUpdateGlobalSettings,
  prayerSettings,
  onUpdatePrayerSetting,
}) => {
  if (!isOpen) return null;

  const chasht = prayerSettings.find((p) => p.id === 'chasht');
  const chashtCfg = chasht?.chashtConfig || {
    mode: 'automatic',
    autoRule: 'midday',
    offsetMinutes: 90,
    manualTime: '09:15',
  };

  const tahajjud = prayerSettings.find((p) => p.id === 'tahajjud');
  const tahajjudCfg = tahajjud?.tahajjudConfig || {
    mode: 'automatic',
    autoRule: 'last_third',
    manualTime: '02:45',
  };

  const updateChasht = (partial: Partial<typeof chashtCfg>) => {
    const updated = { ...chashtCfg, ...partial };
    onUpdatePrayerSetting('chasht', { chashtConfig: updated });
  };

  const updateTahajjud = (partial: Partial<typeof tahajjudCfg>) => {
    const updated = { ...tahajjudCfg, ...partial };
    onUpdatePrayerSetting('tahajjud', { tahajjudConfig: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Prayer Calculation Settings
              </h3>
              <p className="text-xs text-stone-500">
                Configure astronomical algorithms, juristic methods & voluntary prayer rules
              </p>
            </div>
          </div>
          <button
            id="close-calc-settings-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* SECTION 1: Astronomical Calculation Method (Fajar & Esha) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Astronomical Calculation Method (Fajar & Esha)</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono">
                {globalSettings.method}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Determines sun depression angles used to calculate twilight for Fajar and dusk for Esha.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto border border-stone-200 rounded-xl p-2 bg-stone-50/50">
              {METHODS_CATALOG.map((m) => {
                const isSelected = globalSettings.method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      onUpdateGlobalSettings({
                        ...globalSettings,
                        method: m.id,
                      })
                    }
                    className={`text-left p-2.5 rounded-lg text-xs transition-all border ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{m.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />}
                    </div>
                    <div
                      className={`text-[11px] mt-1 ${
                        isSelected ? 'text-emerald-100' : 'text-stone-500'
                      }`}
                    >
                      {m.region}
                    </div>
                    <div
                      className={`text-[10px] font-mono mt-1 ${
                        isSelected ? 'text-emerald-200' : 'text-stone-400'
                      }`}
                    >
                      Fajr: {m.fajrAngle} • Isha: {m.ishaAngle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Asar Juristic Method (Madhab) */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Asar Juristic Method (Madhab)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  onUpdateGlobalSettings({
                    ...globalSettings,
                    madhab: 'Hanafi',
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all ${
                  globalSettings.madhab === 'Hanafi'
                    ? 'bg-emerald-50 border-emerald-700 text-emerald-900 ring-2 ring-emerald-700/20'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>Hanafi</span>
                  {globalSettings.madhab === 'Hanafi' && (
                    <Check className="w-4 h-4 text-emerald-700" />
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Shadow length equals twice the object height (Shadow factor 2). Later Asr time.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateGlobalSettings({
                    ...globalSettings,
                    madhab: 'Shafi',
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all ${
                  globalSettings.madhab === 'Shafi'
                    ? 'bg-emerald-50 border-emerald-700 text-emerald-900 ring-2 ring-emerald-700/20'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>Standard (Shafi&apos;i / Maliki / Hanbali)</span>
                  {globalSettings.madhab === 'Shafi' && (
                    <Check className="w-4 h-4 text-emerald-700" />
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Shadow length equals the object height (Shadow factor 1). Earlier Asr time.
                </p>
              </button>
            </div>
          </div>

          {/* SECTION 3: Ishraq Calculation Setting */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sun className="w-4 h-4 text-orange-500" />
                <span>Ishraq Timing Rule</span>
              </label>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Sunrise + {globalSettings.ishraqOffsetMinutes}m
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Ishraq is calculated as an offset after astronomical sunrise once the sun rises above the horizon (spear length).
            </p>

            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-700 font-medium">
                Ishraq starts after sunrise by:
              </span>
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateGlobalSettings({
                      ...globalSettings,
                      ishraqOffsetMinutes: Math.max(5, globalSettings.ishraqOffsetMinutes - 5),
                    })
                  }
                  className="w-7 h-7 rounded-md bg-white border border-stone-300 font-bold text-sm flex items-center justify-center hover:bg-stone-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={globalSettings.ishraqOffsetMinutes}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10) || 15;
                    onUpdateGlobalSettings({
                      ...globalSettings,
                      ishraqOffsetMinutes: Math.max(5, Math.min(60, v)),
                    });
                  }}
                  className="w-14 text-center font-mono font-bold text-xs py-1 border border-stone-300 rounded-md bg-white text-stone-900"
                />
                <span className="text-xs text-stone-500 font-medium">minutes</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateGlobalSettings({
                      ...globalSettings,
                      ishraqOffsetMinutes: Math.min(60, globalSettings.ishraqOffsetMinutes + 5),
                    })
                  }
                  className="w-7 h-7 rounded-md bg-white border border-stone-300 font-bold text-sm flex items-center justify-center hover:bg-stone-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: Chasht (Salat al-Duha) Configuration */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Chasht (Salat al-Duha) Mode</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase font-mono bg-stone-100 text-stone-700">
                Mode: {chashtCfg.mode}
              </span>
            </div>

            {/* Mode selection: Automatic vs Manual */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateChasht({ mode: 'automatic' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  chashtCfg.mode === 'automatic'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Automatic (Astro formula)
              </button>
              <button
                type="button"
                onClick={() => updateChasht({ mode: 'manual' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  chashtCfg.mode === 'manual'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Manual (Fixed Time)
              </button>
            </div>

            {chashtCfg.mode === 'automatic' ? (
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                <label className="text-xs font-semibold text-stone-700">
                  Automatic Calculation Rule:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateChasht({ autoRule: 'midday' })}
                    className={`p-2 rounded-lg text-left text-xs border ${
                      chashtCfg.autoRule === 'midday'
                        ? 'bg-white border-emerald-700 ring-1 ring-emerald-700 font-bold text-emerald-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div>Midpoint Peak (Sunnah)</div>
                    <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                      Halfway between Sunrise & Zohar
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateChasht({ autoRule: 'one_third_morning' })}
                    className={`p-2 rounded-lg text-left text-xs border ${
                      chashtCfg.autoRule === 'one_third_morning'
                        ? 'bg-white border-emerald-700 ring-1 ring-emerald-700 font-bold text-emerald-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div>1/3 Morning</div>
                    <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                      Earlier Chasht period
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateChasht({ autoRule: 'offset_sunrise' })}
                    className={`p-2 rounded-lg text-left text-xs border ${
                      chashtCfg.autoRule === 'offset_sunrise'
                        ? 'bg-white border-emerald-700 ring-1 ring-emerald-700 font-bold text-emerald-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div>Sunrise + 90 min</div>
                    <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                      Fixed solar morning offset
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">
                  Fixed Chasht Time:
                </span>
                <input
                  type="time"
                  value={chashtCfg.manualTime || '09:15'}
                  onChange={(e) => updateChasht({ manualTime: e.target.value })}
                  className="font-mono text-xs font-bold px-2 py-1 bg-white border border-stone-300 rounded-md text-stone-900"
                />
              </div>
            )}
          </div>

          {/* SECTION 5: Tahajjud (Qiyam al-Layl) Configuration */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Tahajjud (Qiyam al-Layl) Mode</span>
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase font-mono bg-stone-100 text-stone-700">
                Mode: {tahajjudCfg.mode}
              </span>
            </div>

            {/* Mode selection: Automatic vs Manual */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateTahajjud({ mode: 'automatic' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  tahajjudCfg.mode === 'automatic'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Automatic (Night interval formula)
              </button>
              <button
                type="button"
                onClick={() => updateTahajjud({ mode: 'manual' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  tahajjudCfg.mode === 'manual'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Manual (Fixed Time)
              </button>
            </div>

            {tahajjudCfg.mode === 'automatic' ? (
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                <label className="text-xs font-semibold text-stone-700">
                  Night Partition Rule (Maghrib to Fajar):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateTahajjud({ autoRule: 'last_third' })}
                    className={`p-2.5 rounded-lg text-left text-xs border ${
                      tahajjudCfg.autoRule === 'last_third'
                        ? 'bg-white border-emerald-700 ring-1 ring-emerald-700 font-bold text-emerald-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Last 1/3 of the Night (Sunnah)</span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                      Most virtuous period: Allah descends to the lowest heaven
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateTahajjud({ autoRule: 'middle_of_night' })}
                    className={`p-2.5 rounded-lg text-left text-xs border ${
                      tahajjudCfg.autoRule === 'middle_of_night'
                        ? 'bg-white border-emerald-700 ring-1 ring-emerald-700 font-bold text-emerald-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div>Middle of the Night (1/2)</div>
                    <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                      Exact Islamic midnight midpoint
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateTahajjud({ autoRule: 'last_sixth' })}
                    className={`p-2.5 rounded-lg text-left text-xs border ${
                      tahajjudCfg.autoRule === 'last_sixth'
                        ? 'bg-white border-emerald-700 ring-1 ring-emerald-700 font-bold text-emerald-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div>Last 1/6 of the Night</div>
                    <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                      Closer to dawn before Fajr
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateTahajjud({ autoRule: 'before_fajr_45m' })}
                    className={`p-2.5 rounded-lg text-left text-xs border ${
                      tahajjudCfg.autoRule === 'before_fajr_45m'
                        ? 'bg-white border-emerald-700 ring-1 ring-emerald-700 font-bold text-emerald-900'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    <div>45 Minutes before Fajr</div>
                    <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                      Pre-Sahoor & early morning rise
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">
                  Fixed Tahajjud Time:
                </span>
                <input
                  type="time"
                  value={tahajjudCfg.manualTime || '02:45'}
                  onChange={(e) => updateTahajjud({ manualTime: e.target.value })}
                  className="font-mono text-xs font-bold px-2 py-1 bg-white border border-stone-300 rounded-md text-stone-900"
                />
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between rounded-b-2xl">
          <span className="text-xs text-stone-500">
            Changes recalculate timetable automatically
          </span>
          <button
            id="calc-settings-done-btn"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Save & Recalculate
          </button>
        </div>

      </div>
    </div>
  );
};
