import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AudioTrackOption,
  CalculatedPrayerTime,
  DailySchedule,
  GlobalCalculationSettings,
  LocationConfig,
  PrayerSetting,
} from './types';
import {
  loadSavedAudioTracks,
  loadSavedGlobalSettings,
  loadSavedLocation,
  loadSavedPrayers,
  saveCustomAudioTrack,
  saveGlobalSettings,
  saveLocation,
  savePrayers,
} from './services/storage';
import { calculateDailySchedule } from './services/prayerCalculation';
import { audioEngine } from './services/audioService';
import { Header } from './components/Header';
import { NextPrayerHero } from './components/NextPrayerHero';
import { PrayerList } from './components/PrayerList';
import { CalculationSettingsModal } from './components/CalculationSettingsModal';
import { LocationModal } from './components/LocationModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { ActiveAdhanModal } from './components/ActiveAdhanModal';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  // State Initialization from persistent storage
  const [location, setLocation] = useState<LocationConfig>(loadSavedLocation);
  const [globalSettings, setGlobalSettings] = useState<GlobalCalculationSettings>(
    loadSavedGlobalSettings
  );
  const [prayerSettings, setPrayerSettings] = useState<PrayerSetting[]>(loadSavedPrayers);
  const [audioTracks, setAudioTracks] = useState<AudioTrackOption[]>(loadSavedAudioTracks);

  // Time & Active schedule state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Playing / Alarm state
  const [playingPrayerId, setPlayingPrayerId] = useState<string | null>(null);
  const [activeAlarmPrayer, setActiveAlarmPrayer] = useState<CalculatedPrayerTime | null>(null);
  const triggeredPrayersRef = useRef<Set<string>>(new Set());

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCalcSettingsOpen, setIsCalcSettingsOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  // 1. Live Clock & Automatic Midnight Recalculation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check if day rolled over
      const isToday =
        selectedDate.getFullYear() === now.getFullYear() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getDate() === now.getDate();

      if (isToday) {
        // Daily alarm check
        schedule.prayers.forEach((prayer) => {
          if (!prayer.enabled) return;
          const prayerMs = prayer.finalTime.getTime();
          const diffSec = Math.floor((now.getTime() - prayerMs) / 1000);

          // If within 0 to 59 seconds of prayer time and not yet triggered today
          const key = `${schedule.dateKey}_${prayer.id}`;
          if (diffSec >= 0 && diffSec < 60 && !triggeredPrayersRef.current.has(key)) {
            triggeredPrayersRef.current.add(key);
            triggerAdhanAlarm(prayer);
          }
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  });

  // Calculate schedule dynamically
  const schedule: DailySchedule = useMemo(() => {
    return calculateDailySchedule(
      selectedDate,
      location,
      globalSettings,
      prayerSettings,
      currentTime
    );
  }, [selectedDate, location, globalSettings, prayerSettings, currentTime]);

  // Trigger Adhan or Prayer Reminder
  const triggerAdhanAlarm = (prayer: CalculatedPrayerTime) => {
    setActiveAlarmPrayer(prayer);
    setPlayingPrayerId(prayer.id);

    const track = audioTracks.find((t) => t.id === prayer.audioTrackId) || audioTracks[0];
    audioEngine.playTrack(track, () => {
      setPlayingPrayerId(null);
    });

    // Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Time for ${prayer.name} (${prayer.arabicName})`, {
        body: `It is now time for ${prayer.name} in ${location.name}.`,
        icon: '/favicon.ico',
      });
    }
  };

  // Test audio handler
  const handleTestAudio = (prayer: CalculatedPrayerTime) => {
    audioEngine.stopAll();
    setPlayingPrayerId(prayer.id);
    const track = audioTracks.find((t) => t.id === prayer.audioTrackId) || audioTracks[0];
    audioEngine.playTrack(track, () => {
      setPlayingPrayerId(null);
    });
  };

  const handleStopAudio = () => {
    audioEngine.stopAll();
    setPlayingPrayerId(null);
    setActiveAlarmPrayer(null);
  };

  // Persistence updates
  const handleUpdateLocation = (newLoc: LocationConfig) => {
    setLocation(newLoc);
    saveLocation(newLoc);
  };

  const handleUpdateGlobalSettings = (newSettings: GlobalCalculationSettings) => {
    setGlobalSettings(newSettings);
    saveGlobalSettings(newSettings);
  };

  const handleTogglePrayer = (prayerId: string) => {
    const updated = prayerSettings.map((p) =>
      p.id === prayerId ? { ...p, enabled: !p.enabled } : p
    );
    setPrayerSettings(updated);
    savePrayers(updated);
  };

  const handleUpdateAdjustment = (prayerId: string, minutes: number) => {
    const clamped = Math.max(-60, Math.min(60, minutes));
    const updated = prayerSettings.map((p) =>
      p.id === prayerId ? { ...p, manualAdjustmentMinutes: clamped } : p
    );
    setPrayerSettings(updated);
    savePrayers(updated);
  };

  const handleUpdateAudioTrack = (prayerId: string, trackId: string) => {
    const updated = prayerSettings.map((p) =>
      p.id === prayerId ? { ...p, audioTrackId: trackId } : p
    );
    setPrayerSettings(updated);
    savePrayers(updated);
  };

  const handleUpdatePrayerSetting = (prayerId: string, partial: Partial<PrayerSetting>) => {
    const updated = prayerSettings.map((p) =>
      p.id === prayerId ? { ...p, ...partial } : p
    );
    setPrayerSettings(updated);
    savePrayers(updated);
  };

  const handleAddCustomTrack = (track: AudioTrackOption) => {
    saveCustomAudioTrack(track);
    setAudioTracks(loadSavedAudioTracks());
  };

  const handleResetAdjustments = () => {
    const updated = prayerSettings.map((p) => ({
      ...p,
      manualAdjustmentMinutes: 0,
    }));
    setPrayerSettings(updated);
    savePrayers(updated);
  };

  // Date Navigation Helpers
  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Header
        location={location}
        currentTime={currentTime}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        onOpenSettings={() => setIsCalcSettingsOpen(true)}
        onOpenAudio={() => setIsAudioModalOpen(true)}
        onRefreshTimes={() => {
          setSelectedDate(new Date());
          setCurrentTime(new Date());
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Date Selector Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Timetable Date:
            </span>
            <span className="text-sm font-bold text-stone-900 font-serif">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {isToday && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                Today
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {!isToday && (
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Go to Today
              </button>
            )}
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Banner: Upcoming Prayer Countdown & Horizon info */}
        <NextPrayerHero
          schedule={schedule}
          globalSettings={globalSettings}
          playingPrayerId={playingPrayerId}
          onTogglePrayer={handleTogglePrayer}
          onTestAudio={handleTestAudio}
          onStopAudio={handleStopAudio}
          onOpenSettings={() => setIsCalcSettingsOpen(true)}
        />

        {/* 8-Prayer Sequential List */}
        <PrayerList
          schedulePrayers={schedule.prayers}
          prayerSettings={prayerSettings}
          audioTracks={audioTracks}
          playingPrayerId={playingPrayerId}
          nextPrayerId={schedule.nextPrayer?.id || null}
          onToggleEnabled={handleTogglePrayer}
          onUpdateAdjustment={handleUpdateAdjustment}
          onUpdateAudioTrack={handleUpdateAudioTrack}
          onTestAudio={handleTestAudio}
          onStopAudio={handleStopAudio}
          onOpenPrayerConfig={(prayerId) => {
            setIsCalcSettingsOpen(true);
          }}
          onResetAdjustments={handleResetAdjustments}
        />

        {/* Religious Disclaimer Section */}
        <DisclaimerBanner onOpenSettings={() => setIsCalcSettingsOpen(true)} />

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-stone-200 py-4 mt-8 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Azan e Madina • Accurate astronomical 8-prayer timetable for Fajar, Ishraq, Chasht, Zohar, Asar, Maghrib, Esha & Tahajjud.
          </span>
          <span className="text-[11px] text-stone-400">
            Latitude: {location.latitude}° • Longitude: {location.longitude}° • {location.timezone}
          </span>
        </div>
      </footer>

      {/* Modals */}
      <CalculationSettingsModal
        isOpen={isCalcSettingsOpen}
        onClose={() => setIsCalcSettingsOpen(false)}
        globalSettings={globalSettings}
        onUpdateGlobalSettings={handleUpdateGlobalSettings}
        prayerSettings={prayerSettings}
        onUpdatePrayerSetting={handleUpdatePrayerSetting}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={handleUpdateLocation}
      />

      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        audioTracks={audioTracks}
        onAddCustomTrack={handleAddCustomTrack}
        prayers={prayerSettings}
        calculatedPrayers={schedule.prayers}
        onUpdateAudioTrack={handleUpdateAudioTrack}
      />

      <ActiveAdhanModal
        prayer={activeAlarmPrayer}
        onDismiss={handleStopAudio}
      />

    </div>
  );
}
