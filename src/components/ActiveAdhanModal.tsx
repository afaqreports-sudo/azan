import React from 'react';
import { VolumeX, Sparkles, Bell, HeartHandshake } from 'lucide-react';
import { CalculatedPrayerTime } from '../types';

interface ActiveAdhanModalProps {
  prayer: CalculatedPrayerTime | null;
  onDismiss: () => void;
}

export const ActiveAdhanModal: React.FC<ActiveAdhanModalProps> = ({
  prayer,
  onDismiss,
}) => {
  if (!prayer) return null;

  const isObligatory = prayer.category === 'obligatory';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-b from-stone-900 to-emerald-950 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-500/30 text-center relative overflow-hidden">
        
        {/* Glowing pulse ring */}
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center animate-pulse mb-5 shadow-lg">
          <Bell className="w-10 h-10 text-emerald-300" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 mb-2">
          {isObligatory ? 'Adhan Time Entered' : 'Voluntary Prayer Reminder'}
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-white mt-1">
          {prayer.name}
        </h2>
        <div className="text-2xl font-serif text-emerald-300/90 mt-1 mb-4">
          {prayer.arabicName}
        </div>

        <div className="text-lg font-mono font-bold text-amber-300 mb-5">
          {prayer.formattedTime}
        </div>

        {/* Content based on prayer type */}
        {isObligatory ? (
          <div className="space-y-4 bg-stone-900/80 border border-emerald-800/40 rounded-2xl p-4 sm:p-5 text-stone-200">
            <div className="text-xl font-serif text-emerald-200 leading-relaxed font-normal">
              اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ
            </div>
            <div className="text-xs text-stone-300 italic">
              &quot;Allah is the Greatest, Allah is the Greatest&quot;
            </div>

            <div className="pt-3 border-t border-stone-800 text-[11px] text-stone-400">
              <strong className="text-emerald-300 block mb-1">Dua after Adhan:</strong>
              اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-stone-900/80 border border-emerald-800/40 rounded-2xl p-4 sm:p-5 text-stone-200 text-xs">
            {prayer.id === 'ishraq' && (
              <>
                <p className="font-semibold text-emerald-300 text-sm">
                  Virtue of Ishraq (Post-Sunrise Prayer):
                </p>
                <p className="text-stone-300 leading-relaxed">
                  &quot;Whoever prays Fajr in congregation, then sits remembering Allah until the sun has risen, then prays two rak&apos;ahs, will have a reward like that of Hajj and &apos;Umrah.&quot; (Jami` at-Tirmidhi)
                </p>
              </>
            )}
            {prayer.id === 'chasht' && (
              <>
                <p className="font-semibold text-emerald-300 text-sm">
                  Virtue of Chasht (Salat al-Duha):
                </p>
                <p className="text-stone-300 leading-relaxed">
                  &quot;In the morning, charity is due for every joint in your body. Two rak&apos;ahs prayed at the Duha time is sufficient to fulfill all that charity.&quot; (Sahih Muslim)
                </p>
              </>
            )}
            {prayer.id === 'tahajjud' && (
              <>
                <p className="font-semibold text-emerald-300 text-sm">
                  Virtue of Tahajjud (Night Vigil):
                </p>
                <p className="text-stone-300 leading-relaxed">
                  &quot;The best prayer after the obligatory prayers is the night prayer (Tahajjud).&quot; (Sahih Muslim)
                </p>
              </>
            )}
          </div>
        )}

        <button
          id="dismiss-adhan-modal-btn"
          onClick={onDismiss}
          className="mt-6 w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <VolumeX className="w-4 h-4" />
          <span>Dismiss & Stop Audio</span>
        </button>

      </div>
    </div>
  );
};
