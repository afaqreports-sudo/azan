import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  PrayerTimes,
  Madhab,
  HighLatitudeRule,
} from 'adhan';
import {
  CalculatedPrayerTime,
  DailySchedule,
  GlobalCalculationSettings,
  LocationConfig,
  PrayerId,
  PrayerSetting,
} from '../types';

export function getCalculationParameters(
  settings: GlobalCalculationSettings
): CalculationParameters {
  let params: CalculationParameters;

  switch (settings.method) {
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'MuslimWorldLeague':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'Qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'Kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'MoonsightingCommittee':
      params = CalculationMethod.MoonsightingCommittee();
      break;
    case 'Singapore':
      params = CalculationMethod.Singapore();
      break;
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    default:
      params = CalculationMethod.Karachi();
  }

  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  switch (settings.highLatitudeRule) {
    case 'seventh_of_the_night':
      params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
      break;
    case 'twilight_angle':
      params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
      break;
    case 'middle_of_the_night':
    default:
      params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
      break;
  }

  return params;
}

export function formatPrayerTime(date: Date): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Due now';
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function parseTimeToToday(timeStr: string, baseDate: Date): Date {
  const result = new Date(baseDate);
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  result.setHours(h, m, 0, 0);
  return result;
}

export function calculateDailySchedule(
  targetDate: Date,
  location: LocationConfig,
  globalSettings: GlobalCalculationSettings,
  prayerSettings: PrayerSetting[],
  now: Date = new Date()
): DailySchedule {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = getCalculationParameters(globalSettings);

  // Clean date clone for target date at 00:00:00
  const date = new Date(targetDate);
  date.setHours(12, 0, 0, 0); // avoid daylight savings midnight edge cases

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // Previous day prayer times for early morning Tahajjud calculation
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevPrayerTimes = new PrayerTimes(coordinates, prevDate, params);

  // Next day prayer times for tonight's Tahajjud calculation
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextPrayerTimes = new PrayerTimes(coordinates, nextDate, params);

  const rawTimesMap: Record<PrayerId, Date> = {
    fajar: new Date(prayerTimes.fajr),
    ishraq: new Date(prayerTimes.sunrise.getTime() + globalSettings.ishraqOffsetMinutes * 60 * 1000),
    chasht: new Date(),
    zohar: new Date(prayerTimes.dhuhr),
    asar: new Date(prayerTimes.asr),
    maghrib: new Date(prayerTimes.maghrib),
    esha: new Date(prayerTimes.isha),
    tahajjud: new Date(),
  };

  // --- CHASHT CALCULATION ---
  const chashtSetting = prayerSettings.find((p) => p.id === 'chasht');
  const chashtCfg = chashtSetting?.chashtConfig || {
    mode: 'automatic',
    autoRule: 'midday',
    offsetMinutes: 90,
    manualTime: '09:15',
  };

  let chashtRaw: Date;
  let chashtIsManual = false;

  if (chashtCfg.mode === 'manual' && chashtCfg.manualTime) {
    chashtRaw = parseTimeToToday(chashtCfg.manualTime, date);
    chashtIsManual = true;
  } else {
    const sunriseMs = prayerTimes.sunrise.getTime();
    const dhuhrMs = prayerTimes.dhuhr.getTime();

    if (chashtCfg.autoRule === 'offset_sunrise') {
      chashtRaw = new Date(sunriseMs + (chashtCfg.offsetMinutes || 90) * 60 * 1000);
    } else if (chashtCfg.autoRule === 'one_third_morning') {
      chashtRaw = new Date(sunriseMs + (dhuhrMs - sunriseMs) * (1 / 3));
    } else {
      // Default: 'midday' - halfway between sunrise and dhuhr (Salat al-Awwabin)
      chashtRaw = new Date(sunriseMs + (dhuhrMs - sunriseMs) * 0.5);
    }
  }
  rawTimesMap.chasht = chashtRaw;

  // --- TAHAJJUD CALCULATION ---
  // According to Islamic jurisprudence:
  // Tahajjud is prayed during the night between Isha/Maghrib and Fajr.
  // Best time is the last third of the night (Sunnah of the Prophet Muhammad ﷺ).
  // For the current calendar day's timetable, Tahajjud occurs in the early morning
  // before today's Fajr (between yesterday's Maghrib and today's Fajr).
  const tahajjudSetting = prayerSettings.find((p) => p.id === 'tahajjud');
  const tahajjudCfg = tahajjudSetting?.tahajjudConfig || {
    mode: 'automatic',
    autoRule: 'last_third',
    manualTime: '02:45',
  };

  let tahajjudRaw: Date;
  let tahajjudIsManual = false;

  if (tahajjudCfg.mode === 'manual' && tahajjudCfg.manualTime) {
    tahajjudRaw = parseTimeToToday(tahajjudCfg.manualTime, date);
    tahajjudIsManual = true;
  } else {
    // Night leading into today's Fajr:
    const nightStartMs = prevPrayerTimes.maghrib.getTime();
    const nightEndMs = prayerTimes.fajr.getTime();
    const nightDurationMs = nightEndMs - nightStartMs;

    if (tahajjudCfg.autoRule === 'middle_of_night') {
      tahajjudRaw = new Date(nightStartMs + nightDurationMs * 0.5);
    } else if (tahajjudCfg.autoRule === 'last_sixth') {
      tahajjudRaw = new Date(nightEndMs - nightDurationMs / 6);
    } else if (tahajjudCfg.autoRule === 'before_fajr_45m') {
      tahajjudRaw = new Date(nightEndMs - 45 * 60 * 1000);
    } else {
      // Default: 'last_third' - start of the last third of the night
      tahajjudRaw = new Date(nightEndMs - nightDurationMs / 3);
    }
  }
  rawTimesMap.tahajjud = tahajjudRaw;

  // Order of the 8 prayers as requested:
  // 1. Fajar, 2. Ishraq, 3. Chasht, 4. Zohar, 5. Asar, 6. Maghrib, 7. Esha, 8. Tahajjud
  const orderedIds: PrayerId[] = [
    'fajar',
    'ishraq',
    'chasht',
    'zohar',
    'asar',
    'maghrib',
    'esha',
    'tahajjud',
  ];

  const calculatedPrayers: CalculatedPrayerTime[] = orderedIds.map((id) => {
    const setting = prayerSettings.find((p) => p.id === id)!;
    const rawTime = rawTimesMap[id];
    const adjMinutes = setting.manualAdjustmentMinutes || 0;
    const finalTime = new Date(rawTime.getTime() + adjMinutes * 60 * 1000);

    const isManual =
      (id === 'chasht' && chashtIsManual) ||
      (id === 'tahajjud' && tahajjudIsManual);

    let statusLabel = 'Calculated';
    if (isManual) {
      statusLabel = adjMinutes !== 0
        ? `Manual (${adjMinutes > 0 ? '+' : ''}${adjMinutes}m)`
        : 'Manual';
    } else if (adjMinutes !== 0) {
      statusLabel = `${adjMinutes > 0 ? '+' : ''}${adjMinutes} min adjustment`;
    }

    return {
      id,
      name: setting.name,
      arabicName: setting.arabicName,
      category: setting.category,
      enabled: setting.enabled,
      rawTime,
      finalTime,
      formattedTime: formatPrayerTime(finalTime),
      adjustmentMinutes: adjMinutes,
      isManual,
      statusLabel,
      audioTrackId: setting.audioTrackId,
    };
  });

  // Calculate Next Prayer among enabled ones
  // We check today's remaining prayers, or if none left, the first prayer of tomorrow
  let nextPrayer: CalculatedPrayerTime | null = null;
  let minDiff = Infinity;
  const nowMs = now.getTime();

  // For chronological checking today:
  // Note: Tahajjud is early morning (e.g. 2:45 AM), so chronological order on calendar day is:
  // Tahajjud (02:45 AM) -> Fajar (05:02 AM) -> Ishraq (06:17 AM) -> Chasht (09:15 AM) -> Zohar -> Asar -> Maghrib -> Esha -> (Next day's Tahajjud / Fajar)
  for (const prayer of calculatedPrayers) {
    if (!prayer.enabled) continue;
    const diff = prayer.finalTime.getTime() - nowMs;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextPrayer = prayer;
    }
  }

  // If no more enabled prayers left for today, calculate next day's first enabled prayer
  if (!nextPrayer) {
    // Tomorrow's schedule
    const tomorrowSchedule = calculateDailySchedule(
      nextDate,
      location,
      globalSettings,
      prayerSettings,
      now
    );
    for (const prayer of tomorrowSchedule.prayers) {
      if (!prayer.enabled) continue;
      const diff = prayer.finalTime.getTime() - nowMs;
      if (diff > 0) {
        nextPrayer = prayer;
        minDiff = diff;
        break;
      }
    }
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateKey = `${yyyy}-${mm}-${dd}`;

  return {
    date,
    dateKey,
    astronomicalSunrise: prayerTimes.sunrise,
    astronomicalSunset: prayerTimes.sunset,
    prayers: calculatedPrayers,
    nextPrayer,
    timeToNextMs: minDiff === Infinity ? 0 : Math.max(0, minDiff),
  };
}

export function getHijriDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return '1448 AH';
  }
}
