import {
  AudioTrackOption,
  GlobalCalculationSettings,
  LocationConfig,
  PrayerSetting,
} from '../types';
import {
  DEFAULT_AUDIO_TRACKS,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_LOCATION,
  DEFAULT_PRAYERS,
} from '../constants/defaults';

const STORAGE_KEYS = {
  LOCATION: 'azan_madina_location_v2',
  GLOBAL_SETTINGS: 'azan_madina_calc_settings_v2',
  PRAYERS: 'azan_madina_prayers_v2',
  AUDIO_TRACKS: 'azan_madina_custom_audio_v2',
  NOTIFICATIONS_DISMISSED: 'azan_madina_notif_dismissed',
};

export function loadSavedLocation(): LocationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load location from storage', e);
  }
  return DEFAULT_LOCATION;
}

export function saveLocation(location: LocationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
  } catch (e) {
    console.error('Failed to save location to storage', e);
  }
}

export function loadSavedGlobalSettings(): GlobalCalculationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GLOBAL_SETTINGS);
    if (raw) {
      return { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load global settings', e);
  }
  return DEFAULT_GLOBAL_SETTINGS;
}

export function saveGlobalSettings(settings: GlobalCalculationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GLOBAL_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save global settings', e);
  }
}

export function loadSavedPrayers(): PrayerSetting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRAYERS);
    if (raw) {
      const parsed: PrayerSetting[] = JSON.parse(raw);
      // Ensure all 8 default prayers are present and preserve order
      return DEFAULT_PRAYERS.map((def) => {
        const match = parsed.find((p) => p.id === def.id);
        if (match) {
          return {
            ...def,
            ...match,
            // deep merge configs if present
            chashtConfig: { ...def.chashtConfig, ...(match.chashtConfig || {}) },
            tahajjudConfig: { ...def.tahajjudConfig, ...(match.tahajjudConfig || {}) },
          };
        }
        return def;
      });
    }
  } catch (e) {
    console.error('Failed to load prayers from storage', e);
  }
  return DEFAULT_PRAYERS;
}

export function savePrayers(prayers: PrayerSetting[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(prayers));
  } catch (e) {
    console.error('Failed to save prayers to storage', e);
  }
}

export function loadSavedAudioTracks(): AudioTrackOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIO_TRACKS);
    if (raw) {
      const customTracks: AudioTrackOption[] = JSON.parse(raw);
      return [...DEFAULT_AUDIO_TRACKS, ...customTracks];
    }
  } catch (e) {
    console.error('Failed to load custom audio tracks', e);
  }
  return DEFAULT_AUDIO_TRACKS;
}

export function saveCustomAudioTrack(track: AudioTrackOption): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIO_TRACKS);
    const existing: AudioTrackOption[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((t) => t.id !== track.id);
    filtered.push(track);
    localStorage.setItem(STORAGE_KEYS.AUDIO_TRACKS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save custom audio track', e);
  }
}
