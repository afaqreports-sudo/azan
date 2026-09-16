import React, { useState, useRef } from 'react';
import {
  X,
  Music,
  Play,
  Square,
  Upload,
  Check,
  Volume2,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';
import { AudioTrackOption, CalculatedPrayerTime, PrayerSetting } from '../types';
import { audioEngine } from '../services/audioService';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioTracks: AudioTrackOption[];
  onAddCustomTrack: (track: AudioTrackOption) => void;
  prayers: PrayerSetting[];
  calculatedPrayers: CalculatedPrayerTime[];
  onUpdateAudioTrack: (prayerId: string, trackId: string) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  audioTracks,
  onAddCustomTrack,
  prayers,
  calculatedPrayers,
  onUpdateAudioTrack,
}) => {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [customTrackName, setCustomTrackName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTestTrack = (track: AudioTrackOption) => {
    if (playingTrackId === track.id) {
      audioEngine.stopAll();
      setPlayingTrackId(null);
      return;
    }

    setPlayingTrackId(track.id);
    audioEngine.playTrack(track, () => {
      setPlayingTrackId(null);
    });
  };

  const handleStopAll = () => {
    audioEngine.stopAll();
    setPlayingTrackId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check audio type
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      setUploadError('Please choose a valid audio file (.mp3, .wav, .m4a, .ogg).');
      return;
    }

    // Limit size (5MB for browser local storage reliability)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Audio file is larger than 5MB. Please use a shorter clip or compressed mp3.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const trackName =
        customTrackName.trim() || file.name.replace(/\.[^/.]+$/, '');

      const newTrack: AudioTrackOption = {
        id: `custom_${Date.now()}`,
        name: trackName,
        type: 'adhan',
        description: `Custom uploaded audio (${(file.size / 1024).toFixed(0)} KB)`,
        toneType: 'custom',
        customDataUrl: dataUrl,
        customFileName: file.name,
      };

      onAddCustomTrack(newTrack);
      setCustomTrackName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.onerror = () => {
      setUploadError('Error reading audio file.');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Adhan & Reminder Audio Manager
              </h3>
              <p className="text-xs text-stone-500">
                Choose or upload individual audio files for each of the 8 prayers
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopAll();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Notice about Adhan vs Nafl Reminder */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Traditional Practice Guideline:</p>
              <p className="text-stone-600 mt-0.5">
                The 5 obligatory prayers (Fajar, Zohar, Asar, Maghrib, Esha) traditionally feature the formal Azan call. Voluntary prayers (Ishraq, Chasht, Tahajjud) use gentle reminders or chimes. You can customize each independently.
              </p>
            </div>
          </div>

          {/* Section 1: Audio Assignment Matrix for All 8 Prayers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-800" />
              <span>Prayer Audio File Assignments</span>
            </h4>
            <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 bg-stone-50/40">
              {prayers.map((prayer) => {
                const isObligatory = prayer.category === 'obligatory';
                const calc = calculatedPrayers.find((c) => c.id === prayer.id);

                return (
                  <div
                    key={prayer.id}
                    className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center font-mono">
                        {prayer.name.slice(0, 1)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 font-serif">
                            {prayer.name}
                          </span>
                          <span className="text-xs text-stone-400 font-serif">
                            {prayer.arabicName}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isObligatory
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-teal-50 text-teal-800 border border-teal-200'
                            }`}
                          >
                            {isObligatory ? 'Adhan' : 'Reminder'}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          Time: {calc?.formattedTime || '--:--'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={prayer.audioTrackId}
                        onChange={(e) =>
                          onUpdateAudioTrack(prayer.id, e.target.value)
                        }
                        className="text-xs py-1.5 pl-2.5 pr-7 bg-white border border-stone-200 rounded-lg text-stone-800 font-medium focus:ring-emerald-700 focus:border-emerald-700 cursor-pointer w-full sm:w-56"
                      >
                        {audioTracks.map((trk) => (
                          <option key={trk.id} value={trk.id}>
                            {trk.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          const trk = audioTracks.find(
                            (t) => t.id === prayer.audioTrackId
                          );
                          if (trk) handleTestTrack(trk);
                        }}
                        className={`p-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
                          playingTrackId === prayer.audioTrackId
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
                        }`}
                        title="Test prayer audio"
                      >
                        {playingTrackId === prayer.audioTrackId ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Audio Tracks Library */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Audio Library & Sound Synthesizer</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {audioTracks.map((track) => {
                const isCurrentPlaying = playingTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-2 hover:border-stone-300"
                  >
                    <div className="overflow-hidden">
                      <div className="font-semibold text-xs text-stone-900 truncate">
                        {track.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {track.description}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestTrack(track)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all shrink-0 ${
                        isCurrentPlaying
                          ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                          : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-200'
                      }`}
                      title={isCurrentPlaying ? 'Stop' : 'Play preview'}
                    >
                      {isCurrentPlaying ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Upload Custom Audio File (e.g. Fajar.mp3) */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-800" />
              <span>Upload Custom Audio File (.mp3, .wav, .m4a)</span>
            </h4>
            <p className="text-xs text-stone-500">
              Upload your own favorite Muazzin (e.g., Fajar.mp3, MadinaAdhan.mp3) to save directly in the app.
            </p>

            <div className="p-4 bg-stone-50 border border-dashed border-stone-300 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Optional custom audio name (e.g. Sheikh Mulla Makkah Azan)"
                  value={customTrackName}
                  onChange={(e) => setCustomTrackName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="custom-audio-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select Audio File</span>
                </button>
              </div>

              {uploadError && (
                <div className="text-xs text-rose-600 font-medium">
                  {uploadError}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={handleStopAll}
            className="text-xs text-rose-700 hover:text-rose-900 font-semibold"
          >
            Stop All Audio
          </button>
          <button
            onClick={() => {
              handleStopAll();
              onClose();
            }}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
