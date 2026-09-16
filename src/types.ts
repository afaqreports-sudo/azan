export type PrayerId = 
  | 'fajar'
  | 'ishraq'
  | 'chasht'
  | 'zohar'
  | 'asar'
  | 'maghrib'
  | 'esha'
  | 'tahajjud';

export type PrayerCategory = 'obligatory' | 'voluntary';

export type CalculationMethodId =
  | 'Karachi'
  | 'UmmAlQura'
  | 'MuslimWorldLeague'
  | 'NorthAmerica'
  | 'Egyptian'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'MoonsightingCommittee'
  | 'Singapore'
  | 'Turkey';

export type AsrMadhab = 'Hanafi' | 'Shafi';

export type ChashtMode = 'automatic' | 'manual';
export type ChashtAutoRule = 'midday' | 'offset_sunrise' | 'one_third_morning';

export type TahajjudMode = 'automatic' | 'manual';
export type TahajjudAutoRule = 'last_third' | 'middle_of_night' | 'last_sixth' | 'before_fajr_45m';

export interface LocationConfig {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isAutoDetected: boolean;
}

export interface AudioTrackOption {
  id: string;
  name: string;
  type: 'adhan' | 'reminder';
  description: string;
  toneType: 'madina_adhan' | 'makkah_adhan' | 'fajr_adhan' | 'soft_adhan' | 'chime_gentle' | 'chime_tasbih' | 'bell_peaceful' | 'custom';
  customDataUrl?: string;
  customFileName?: string;
}

export interface PrayerSetting {
  id: PrayerId;
  name: string;
  arabicName: string;
  category: PrayerCategory;
  enabled: boolean;
  manualAdjustmentMinutes: number; // e.g. -5, 0, +3
  audioTrackId: string;
  // Specific config for voluntary prayers:
  chashtConfig?: {
    mode: ChashtMode;
    autoRule: ChashtAutoRule;
    offsetMinutes: number; // if offset_sunrise
    manualTime: string; // e.g. "09:30"
  };
  tahajjudConfig?: {
    mode: TahajjudMode;
    autoRule: TahajjudAutoRule;
    manualTime: string; // e.g. "03:30"
  };
}

export interface GlobalCalculationSettings {
  method: CalculationMethodId;
  madhab: AsrMadhab;
  ishraqOffsetMinutes: number; // default 15 mins after sunrise
  highLatitudeRule: 'middle_of_the_night' | 'seventh_of_the_night' | 'twilight_angle';
}

export interface CalculatedPrayerTime {
  id: PrayerId;
  name: string;
  arabicName: string;
  category: PrayerCategory;
  enabled: boolean;
  rawTime: Date;
  finalTime: Date;
  formattedTime: string; // "05:02 AM"
  adjustmentMinutes: number;
  isManual: boolean;
  statusLabel: string; // "Calculated", "Manual", "+3 min adjustment"
  audioTrackId: string;
}

export interface DailySchedule {
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  astronomicalSunrise: Date;
  astronomicalSunset: Date;
  prayers: CalculatedPrayerTime[];
  nextPrayer: CalculatedPrayerTime | null;
  timeToNextMs: number;
}
