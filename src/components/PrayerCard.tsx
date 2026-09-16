import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react';
import {
  AudioTrackOption,
  CalculatedPrayerTime,
  PrayerSetting,
} from '../types';

interface PrayerCardProps {
  index: number;
  prayer: CalculatedPrayerTime;
  setting: PrayerSetting;
  audioTracks: AudioTrackOption[];
  isPlaying: boolean;
  isNext: boolean;
  onToggleEnabled: (prayerId: string) => void;
  onUpdateAdjustment: (prayerId: string, minutes: number) => void;
  onUpdateAudioTrack: (prayerId: string, trackId: string) => void;
  onTestAudio: (prayer: CalculatedPrayerTime) => void;
  onStopAudio: () => void;
  onOpenPrayerConfig?: (prayerId: string) => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  index,
  prayer,
  setting,
  audioTracks,
  isPlaying,
  isNext,
  onToggleEnabled,
  onUpdateAdjustment,
  onUpdateAudioTrack,
  onTestAudio,
  onStopAudio,
  onOpenPrayerConfig,
}) => {
  const [showAdjustDrawer, setShowAdjustDrawer] = useState(false);

  const isObligatory = prayer.category === 'obligatory';
  const audioTypeLabel = isObligatory ? 'Adhan' : 'Prayer Reminder';

  // Available audio choices filtered or prioritized
  const relevantTracks = audioTracks.filter((t) =>
    isObligatory ? t.type === 'adhan' || t.toneType === 'custom' : true
  );

  const currentTrack =
    audioTracks.find((t) => t.id === prayer.audioTrackId) || audioTracks[0];

  const quickOffsets = [-15, -10, -5, -2, 0, 2, 5, 10, 15];

  return (
    <div
      id={`prayer-card-${prayer.id}`}
      className={`rounded-xl border transition-all duration-200 ${
        !prayer.enabled
          ? 'bg-stone-100/70 border-stone-200 opacity-60 text-stone-500'
          : isNext
          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-stone-200/90 shadow-xs hover:border-stone-300'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Left: Index, Names & Categorization */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                isNext
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : isObligatory
                  ? 'bg-stone-800 text-stone-100'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}
            >
              {index + 1}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900 font-serif">
                  {prayer.name}
                </h3>
                <span className="text-base font-serif text-stone-400 font-normal">
                  {prayer.arabicName}
                </span>

                {isNext && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    Next
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                <span
                  className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium ${
                    isObligatory
                      ? 'text-amber-800 bg-amber-50 border border-amber-200/60'
                      : 'text-teal-800 bg-teal-50 border border-teal-200/60'
                  }`}
                >
                  {isObligatory ? 'Fard (Adhan)' : 'Nafl (Reminder)'}
                </span>

                {/* Status Badges: Calculated, Manual, +X min */}
                <span className="text-stone-300">•</span>
                <span className="font-medium text-stone-600">
                  {prayer.statusLabel}
                </span>

                {(prayer.id === 'chasht' || prayer.id === 'tahajjud' || prayer.id === 'ishraq') && onOpenPrayerConfig && (
                  <button
                    onClick={() => onOpenPrayerConfig(prayer.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-medium hover:underline"
                    title={`Configure ${prayer.name} timing mode`}
                  >
                    <Settings className="w-3 h-3" />
                    <span>Rule</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Center: Time Display */}
          <div className="flex items-baseline sm:items-end flex-col">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-stone-900">
              {prayer.formattedTime}
            </div>
            {prayer.adjustmentMinutes !== 0 && (
              <div className="text-[11px] font-mono text-stone-400">
                Raw:{' '}
                {prayer.rawTime?.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
            )}
          </div>

          {/* Right: Audio Selection, Test Button & Enable Switch */}
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
            
            {/* Audio Selector */}
            <div className="flex items-center gap-1.5">
              <select
                id={`audio-select-${prayer.id}`}
                value={prayer.audioTrackId}
                disabled={!prayer.enabled}
                onChange={(e) => onUpdateAudioTrack(prayer.id, e.target.value)}
                className="text-xs py-1.5 pl-2.5 pr-7 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:ring-emerald-700 focus:border-emerald-700 font-medium disabled:bg-stone-100 disabled:text-stone-400 cursor-pointer"
                title={`Select audio file for ${prayer.name}`}
              >
                {relevantTracks.map((trk) => (
                  <option key={trk.id} value={trk.id}>
                    {trk.name}
                  </option>
                ))}
              </select>

              {/* Test Audio Button */}
              <button
                id={`test-audio-${prayer.id}`}
                onClick={() => {
                  if (isPlaying) {
                    onStopAudio();
                  } else {
                    onTestAudio(prayer);
                  }
                }}
                disabled={!prayer.enabled}
                className={`p-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isPlaying
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm animate-pulse'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                } disabled:opacity-40`}
                title={isPlaying ? 'Stop audio' : `Test ${audioTypeLabel}`}
              >
                {isPlaying ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
              </button>
            </div>

            {/* Manual Adjustment Toggle */}
            <button
              id={`adjust-btn-${prayer.id}`}
              onClick={() => setShowAdjustDrawer(!showAdjustDrawer)}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                prayer.adjustmentMinutes !== 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
              }`}
              title="Manually adjust minutes (+/-)"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Prayer ON / OFF Switch */}
            <div className="flex items-center gap-1.5 pl-1">
              <label
                htmlFor={`toggle-prayer-${prayer.id}`}
                className="text-[11px] font-semibold text-stone-500 uppercase cursor-pointer select-none"
              >
                {prayer.enabled ? 'ON' : 'OFF'}
              </label>
              <input
                id={`toggle-prayer-${prayer.id}`}
                type="checkbox"
                checked={prayer.enabled}
                onChange={() => onToggleEnabled(prayer.id)}
                className="w-4 h-4 text-emerald-700 bg-stone-100 border-stone-300 rounded-sm focus:ring-emerald-700 cursor-pointer"
                title={`Enable or disable ${prayer.name}`}
              />
            </div>

          </div>

        </div>

        {/* Collapsible Manual Adjustment Drawer */}
        {showAdjustDrawer && (
          <div className="mt-4 pt-3.5 border-t border-stone-100 bg-stone-50/80 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 rounded-b-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-stone-800">
                  Manual Timing Adjustment:
                </span>
                <p className="text-[11px] text-stone-500">
                  Fine-tune this prayer relative to astronomical calculations (e.g. for local mosque agreement).
                </p>
              </div>

              {/* Current Value & Direct Stepper */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateAdjustment(prayer.id, prayer.adjustmentMinutes - 1)
                  }
                  className="w-7 h-7 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-sm flex items-center justify-center shadow-2xs"
                  title="Subtract 1 minute"
                >
                  -
                </button>
                <span className="font-mono font-bold text-xs px-2.5 py-1 bg-white border border-stone-300 rounded-md min-w-[60px] text-center text-stone-900">
                  {prayer.adjustmentMinutes > 0
                    ? `+${prayer.adjustmentMinutes}`
                    : prayer.adjustmentMinutes}{' '}
                  min
                </span>
                <button
                  onClick={() =>
                    onUpdateAdjustment(prayer.id, prayer.adjustmentMinutes + 1)
                  }
                  className="w-7 h-7 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-sm flex items-center justify-center shadow-2xs"
                  title="Add 1 minute"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick offset buttons: -10, -5, 0, +3, +5, +10 */}
            <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-semibold text-stone-400 mr-1">
                Quick:
              </span>
              {quickOffsets.map((val) => (
                <button
                  key={val}
                  onClick={() => onUpdateAdjustment(prayer.id, val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    prayer.adjustmentMinutes === val
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {val === 0 ? '0' : val > 0 ? `+${val}m` : `${val}m`}
                </button>
              ))}
              <button
                onClick={() => setShowAdjustDrawer(false)}
                className="ml-auto text-[11px] text-stone-500 hover:text-stone-800 font-medium underline"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
