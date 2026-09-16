import React from 'react';
import { Volume2, VolumeX, Play, Square, Sunrise, Sunset, Bell, Info } from 'lucide-react';
import { CalculatedPrayerTime, DailySchedule, GlobalCalculationSettings } from '../types';
import { formatTimeRemaining } from '../services/prayerCalculation';

interface NextPrayerHeroProps {
  schedule: DailySchedule;
  globalSettings: GlobalCalculationSettings;
  playingPrayerId: string | null;
  onTogglePrayer: (prayerId: string) => void;
  onTestAudio: (prayer: CalculatedPrayerTime) => void;
  onStopAudio: () => void;
  onOpenSettings: () => void;
}

export const NextPrayerHero: React.FC<NextPrayerHeroProps> = ({
  schedule,
  globalSettings,
  playingPrayerId,
  onTogglePrayer,
  onTestAudio,
  onStopAudio,
  onOpenSettings,
}) => {
  const next = schedule.nextPrayer;
  const isPlaying = next && playingPrayerId === next.id;

  const sunriseFormatted = schedule.astronomicalSunrise?.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const sunsetFormatted = schedule.astronomicalSunset?.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="w-full bg-gradient-to-br from-emerald-900 via-teal-950 to-stone-900 text-white rounded-2xl p-5 sm:p-7 shadow-md border border-emerald-800/40 relative overflow-hidden">
      {/* Subtle Islamic geometric background accent */}
      <div
        className="absolute -right-16 -bottom-16 w-64 h-64 opacity-5 pointer-events-none rounded-full border-8 border-white"
        style={{ transform: 'rotate(45deg)' }}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Next Prayer Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-700/60 text-emerald-200 border border-emerald-500/30">
              <Bell className="w-3 h-3" />
              Next Scheduled Prayer
            </span>
            {next && (
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                next.category === 'obligatory'
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                  : 'bg-teal-400/20 text-teal-200 border border-teal-400/30'
              }`}>
                {next.category === 'obligatory' ? 'Obligatory (Fard)' : 'Voluntary (Nafl)'}
              </span>
            )}
          </div>

          {next ? (
            <div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-white">
                  {next.name}
                </h2>
                <span className="text-2xl font-serif text-emerald-300/80 font-normal">
                  {next.arabicName}
                </span>
              </div>
              <p className="text-sm text-emerald-200/80 mt-1 flex items-center gap-2">
                <span>Scheduled for </span>
                <strong className="text-white text-base font-mono underline decoration-emerald-500/50 underline-offset-4">
                  {next.formattedTime}
                </strong>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                  {next.statusLabel}
                </span>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold font-serif text-stone-200">
                All prayers completed for today
              </h2>
              <p className="text-sm text-stone-400">
                Calculating tomorrow&apos;s Tahajjud and Fajar timetable...
              </p>
            </div>
          )}
        </div>

        {/* Center / Right: Countdown Box */}
        {next && (
          <div className="bg-emerald-950/80 border border-emerald-700/40 rounded-xl p-4 sm:p-5 flex flex-col items-start sm:items-end w-full md:w-auto min-w-[220px]">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
              Time Remaining
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-amber-300 mt-1">
              {formatTimeRemaining(schedule.timeToNextMs)}
            </div>

            {/* Quick action bar */}
            <div className="mt-3 flex items-center gap-2 w-full justify-start sm:justify-end pt-2 border-t border-emerald-800/40">
              <button
                id="hero-test-audio-btn"
                onClick={() => {
                  if (isPlaying) {
                    onStopAudio();
                  } else {
                    onTestAudio(next);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test {next.category === 'obligatory' ? 'Azan' : 'Reminder'}</span>
                  </>
                )}
              </button>

              <button
                id="hero-toggle-enabled-btn"
                onClick={() => onTogglePrayer(next.id)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  next.enabled
                    ? 'bg-emerald-800/70 text-emerald-200 hover:bg-emerald-700'
                    : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                }`}
                title={next.enabled ? 'Disable Adhan for this prayer' : 'Enable Adhan for this prayer'}
              >
                {next.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Astronomical Sunlight Horizon Footer */}
      <div className="mt-6 pt-4 border-t border-emerald-800/50 flex flex-wrap items-center justify-between text-xs text-emerald-200/90 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-amber-300" />
            <span>Astronomical Sunrise: <strong className="text-white font-mono">{sunriseFormatted}</strong></span>
          </div>
          <div className="hidden sm:inline text-emerald-600">•</div>
          <div className="flex items-center gap-1.5">
            <Sunset className="w-4 h-4 text-orange-400" />
            <span>Sunset (Maghrib): <strong className="text-white font-mono">{sunsetFormatted}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-stone-300">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {globalSettings.method} Method • {globalSettings.madhab} Asar
          </span>
          <button
            onClick={onOpenSettings}
            className="text-emerald-300 hover:text-white underline underline-offset-2 ml-1"
          >
            Change
          </button>
        </div>
      </div>

    </div>
  );
};
