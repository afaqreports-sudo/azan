import React, { useState } from 'react';
import {
  AudioTrackOption,
  CalculatedPrayerTime,
  PrayerId,
  PrayerSetting,
} from '../types';
import { PrayerCard } from './PrayerCard';
import { Sparkles, CheckCheck, RotateCcw } from 'lucide-react';

interface PrayerListProps {
  schedulePrayers: CalculatedPrayerTime[];
  prayerSettings: PrayerSetting[];
  audioTracks: AudioTrackOption[];
  playingPrayerId: string | null;
  nextPrayerId: string | null;
  onToggleEnabled: (prayerId: string) => void;
  onUpdateAdjustment: (prayerId: string, minutes: number) => void;
  onUpdateAudioTrack: (prayerId: string, trackId: string) => void;
  onTestAudio: (prayer: CalculatedPrayerTime) => void;
  onStopAudio: () => void;
  onOpenPrayerConfig: (prayerId: string) => void;
  onResetAdjustments: () => void;
}

export const PrayerList: React.FC<PrayerListProps> = ({
  schedulePrayers,
  prayerSettings,
  audioTracks,
  playingPrayerId,
  nextPrayerId,
  onToggleEnabled,
  onUpdateAdjustment,
  onUpdateAudioTrack,
  onTestAudio,
  onStopAudio,
  onOpenPrayerConfig,
  onResetAdjustments,
}) => {
  const [filter, setFilter] = useState<'all' | 'obligatory' | 'voluntary'>('all');

  const filteredPrayers = schedulePrayers.filter((p) => {
    if (filter === 'obligatory') return p.category === 'obligatory';
    if (filter === 'voluntary') return p.category === 'voluntary';
    return true;
  });

  const enabledCount = schedulePrayers.filter((p) => p.enabled).length;
  const hasAdjustments = schedulePrayers.some((p) => p.adjustmentMinutes !== 0);

  return (
    <div className="w-full space-y-4">
      {/* Section Header with Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <span>Today&apos;s 8-Prayer Timetable</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              {enabledCount} of 8 Enabled
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Sequential daily schedule from dawn to night vigil
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Filter Pills */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              id="filter-all-btn"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              All (8)
            </button>
            <button
              id="filter-fard-btn"
              onClick={() => setFilter('obligatory')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filter === 'obligatory'
                  ? 'bg-white text-amber-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              5 Fard
            </button>
            <button
              id="filter-nafl-btn"
              onClick={() => setFilter('voluntary')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filter === 'voluntary'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              3 Nafl
            </button>
          </div>

          {hasAdjustments && (
            <button
              onClick={onResetAdjustments}
              className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
              title="Reset all manual adjustments to 0 min"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset Adjustments</span>
            </button>
          )}
        </div>
      </div>

      {/* Prayers Cards */}
      <div className="space-y-2.5">
        {filteredPrayers.map((prayer, idx) => {
          const setting = prayerSettings.find((p) => p.id === prayer.id)!;
          const isPlaying = playingPrayerId === prayer.id;
          const isNext = nextPrayerId === prayer.id;

          return (
            <PrayerCard
              key={prayer.id}
              index={schedulePrayers.findIndex((p) => p.id === prayer.id)}
              prayer={prayer}
              setting={setting}
              audioTracks={audioTracks}
              isPlaying={isPlaying}
              isNext={isNext}
              onToggleEnabled={onToggleEnabled}
              onUpdateAdjustment={onUpdateAdjustment}
              onUpdateAudioTrack={onUpdateAudioTrack}
              onTestAudio={onTestAudio}
              onStopAudio={onStopAudio}
              onOpenPrayerConfig={onOpenPrayerConfig}
            />
          );
        })}
      </div>
    </div>
  );
};
