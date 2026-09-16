import React from 'react';
import { MapPin, Settings2, Music, Compass, Clock, RefreshCw } from 'lucide-react';
import { LocationConfig } from '../types';
import { getHijriDate } from '../services/prayerCalculation';

interface HeaderProps {
  location: LocationConfig;
  currentTime: Date;
  onOpenLocation: () => void;
  onOpenSettings: () => void;
  onOpenAudio: () => void;
  onRefreshTimes: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  currentTime,
  onOpenLocation,
  onOpenSettings,
  onOpenAudio,
  onRefreshTimes,
}) => {
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hijriDate = getHijriDate(currentTime);

  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Brand & App Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex items-center justify-center shadow-xs border border-emerald-700/40">
              <Compass className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900 font-serif">
                  Azan e Madina
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  8 Prayers System
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Astronomical calculations & custom alerts for Fard and Nafl
              </p>
            </div>
          </div>

          {/* Center Date & Live Clock */}
          <div className="hidden lg:flex flex-col items-center bg-stone-50 px-4 py-1.5 rounded-lg border border-stone-200/70">
            <div className="flex items-center gap-1.5 text-stone-900 font-mono font-semibold text-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{formattedTime}</span>
            </div>
            <div className="text-[11px] text-stone-500 flex items-center gap-2">
              <span>{formattedDate}</span>
              <span className="text-stone-300">•</span>
              <span className="text-emerald-800 font-medium">{hijriDate}</span>
            </div>
          </div>

          {/* Controls: Location, Audio, Calculation Settings */}
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Location Pill */}
            <button
              id="header-location-btn"
              onClick={onOpenLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              title="Update your location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[170px]">
                {location.name}
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                {location.country.slice(0, 3)}
              </span>
            </button>

            {/* Audio Settings Button */}
            <button
              id="header-audio-btn"
              onClick={onOpenAudio}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg border border-stone-200 transition-colors"
              title="Audio & Azan Settings"
            >
              <Music className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Audio</span>
            </button>

            {/* Calculation Settings Button */}
            <button
              id="header-settings-btn"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
              title="Prayer Calculation Settings"
            >
              <Settings2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Calculation Settings</span>
            </button>

            {/* Recalculate / Refresh Icon */}
            <button
              id="header-refresh-btn"
              onClick={onRefreshTimes}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
              title="Recalculate today's times"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Mobile Sub-bar for live time and Hijri */}
        <div className="mt-2 pt-2 border-t border-stone-100 flex lg:hidden items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1 font-mono font-medium">
            <Clock className="w-3 h-3 text-emerald-700" />
            <span>{formattedTime}</span>
          </div>
          <div className="truncate text-stone-500 text-[11px]">
            {formattedDate} • <span className="text-emerald-800 font-medium">{hijriDate}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
