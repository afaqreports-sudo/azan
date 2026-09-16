import { AudioTrackOption, PrayerCategory } from '../types';
import { DEFAULT_AUDIO_TRACKS } from '../constants/defaults';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | HTMLAudioElement | null = null;
  private isSynthesizing = false;
  private stopSynthesisCallback: (() => void) | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public stopAll(): void {
    if (this.stopSynthesisCallback) {
      this.stopSynthesisCallback();
      this.stopSynthesisCallback = null;
    }
    if (this.currentSource) {
      if ('stop' in this.currentSource) {
        try {
          this.currentSource.stop();
        } catch {
          // ignore
        }
      } else if ('pause' in this.currentSource) {
        this.currentSource.pause();
        this.currentSource.currentTime = 0;
      }
      this.currentSource = null;
    }
    this.isSynthesizing = false;
  }

  public async playTrack(
    track: AudioTrackOption,
    onEnded?: () => void
  ): Promise<void> {
    this.stopAll();

    // If it's a custom uploaded audio file with Data URL
    if (track.customDataUrl) {
      const audio = new Audio(track.customDataUrl);
      this.currentSource = audio;
      audio.onended = () => {
        this.currentSource = null;
        onEnded?.();
      };
      await audio.play();
      return;
    }

    // Synthesize based on toneType using Web Audio API
    const ctx = this.getAudioContext();
    this.isSynthesizing = true;

    if (track.toneType.includes('adhan')) {
      this.playAdhanMelody(ctx, track.toneType, onEnded);
    } else {
      this.playReminderChime(ctx, track.toneType, onEnded);
    }
  }

  /**
   * Synthesize Adhan phrases using harmonic rich oscillators
   * imitating resonant vocal tones in Maqam Bayati and Hijaz
   */
  private playAdhanMelody(
    ctx: AudioContext,
    toneType: string,
    onEnded?: () => void
  ): void {
    let cancelled = false;
    this.stopSynthesisCallback = () => {
      cancelled = true;
    };

    // Frequencies representing traditional melodic phrases of the Azan
    // "Allahu Akbar, Allahu Akbar"
    // D4, F4, G4, A4, Bb4, G4, F4, E4, D4 (Bayati/Hijaz scale)
    const d4 = 293.66;
    const eb4 = 311.13;
    const e4 = 329.63;
    const f4 = 349.23;
    const fSharp4 = 369.99;
    const g4 = 392.0;
    const a4 = 440.0;
    const bb4 = 466.16;
    const c5 = 523.25;
    const d5 = 587.33;

    type Note = { freq: number; dur: number; pause: number; type?: OscillatorType };

    let notes: Note[] = [];

    if (toneType === 'makkah_adhan') {
      // Hijaz Maqam: D, Eb, F#, G, A, Bb, C, D
      notes = [
        { freq: d4, dur: 0.9, pause: 0.1 },
        { freq: fSharp4, dur: 0.7, pause: 0.05 },
        { freq: g4, dur: 1.2, pause: 0.2 },
        { freq: a4, dur: 1.8, pause: 0.4 }, // Al-laa-hu
        { freq: bb4, dur: 0.6, pause: 0.05 },
        { freq: a4, dur: 0.7, pause: 0.05 },
        { freq: g4, dur: 0.9, pause: 0.1 },
        { freq: fSharp4, dur: 1.4, pause: 0.3 }, // Ak-bar
        { freq: d4, dur: 1.6, pause: 0.5 },
      ];
    } else if (toneType === 'fajr_adhan') {
      // Fajr melody with dawn resonance
      notes = [
        { freq: d4, dur: 0.8, pause: 0.1 },
        { freq: g4, dur: 1.1, pause: 0.1 },
        { freq: a4, dur: 1.4, pause: 0.3 },
        { freq: bb4, dur: 0.8, pause: 0.1 },
        { freq: a4, dur: 1.6, pause: 0.4 },
        // "As-salatu Khayrum minan-nawm" cadence
        { freq: c5, dur: 0.9, pause: 0.1 },
        { freq: bb4, dur: 0.8, pause: 0.1 },
        { freq: a4, dur: 1.2, pause: 0.2 },
        { freq: g4, dur: 1.5, pause: 0.5 },
      ];
    } else if (toneType === 'soft_adhan') {
      // Gentle ambient adhan
      notes = [
        { freq: d4, dur: 0.9, pause: 0.15 },
        { freq: f4, dur: 0.9, pause: 0.15 },
        { freq: g4, dur: 1.4, pause: 0.3 },
        { freq: a4, dur: 1.8, pause: 0.5 },
        { freq: g4, dur: 1.2, pause: 0.2 },
        { freq: d4, dur: 2.0, pause: 0.6 },
      ];
    } else {
      // Default: Madinah Bayati style (Prophet's Mosque)
      notes = [
        { freq: d4, dur: 0.8, pause: 0.1 },
        { freq: f4, dur: 0.7, pause: 0.05 },
        { freq: g4, dur: 1.3, pause: 0.2 },
        { freq: a4, dur: 1.6, pause: 0.3 },
        { freq: bb4, dur: 0.7, pause: 0.05 },
        { freq: a4, dur: 0.8, pause: 0.1 },
        { freq: g4, dur: 1.1, pause: 0.15 },
        { freq: f4, dur: 0.9, pause: 0.1 },
        { freq: e4, dur: 0.7, pause: 0.05 },
        { freq: d4, dur: 1.8, pause: 0.5 },
      ];
    }

    let delay = 0.1;
    const startTime = ctx.currentTime + delay;
    let currentT = startTime;

    notes.forEach((n) => {
      if (cancelled) return;

      // Primary oscillator (warm voice)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(n.freq, currentT);
      // slight vibrato / microtonal slide
      osc1.frequency.exponentialRampToValueAtTime(n.freq * 1.002, currentT + n.dur);

      osc2.frequency.setValueAtTime(n.freq * 2, currentT); // octave overtone

      // Gain envelope
      gainNode.gain.setValueAtTime(0, currentT);
      gainNode.gain.linearRampToValueAtTime(0.35, currentT + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentT + n.dur);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(currentT);
      osc2.start(currentT);
      osc1.stop(currentT + n.dur);
      osc2.stop(currentT + n.dur);

      currentT += n.dur + n.pause;
    });

    const totalDurationMs = (currentT - ctx.currentTime) * 1000;
    setTimeout(() => {
      if (!cancelled) {
        this.isSynthesizing = false;
        onEnded?.();
      }
    }, Math.max(100, totalDurationMs));
  }

  /**
   * Synthesize gentle spiritual bells/chimes for Ishraq, Chasht & Tahajjud
   */
  private playReminderChime(
    ctx: AudioContext,
    toneType: string,
    onEnded?: () => void
  ): void {
    let cancelled = false;
    this.stopSynthesisCallback = () => {
      cancelled = true;
    };

    const now = ctx.currentTime + 0.05;

    if (toneType === 'chime_tasbih') {
      // 3 ascending serene crystal chimes
      const freqs = [528, 660, 792]; // Solfeggio 528 Hz healing harmonic
      freqs.forEach((f, idx) => {
        const t = now + idx * 0.45;
        this.createBellNode(ctx, f, t, 2.5);
      });
      setTimeout(() => {
        if (!cancelled) onEnded?.();
      }, 3500);
    } else if (toneType === 'bell_peaceful') {
      // Deep resonant bronze temple/sanctuary bowl
      this.createBellNode(ctx, 216, now, 4.0, 0.45);
      this.createBellNode(ctx, 432, now, 3.2, 0.25);
      this.createBellNode(ctx, 864, now, 2.0, 0.1);
      setTimeout(() => {
        if (!cancelled) onEnded?.();
      }, 4200);
    } else {
      // Dawn spiritual oud / chime
      const freqs = [392, 440, 523.25, 659.25];
      freqs.forEach((f, idx) => {
        const t = now + idx * 0.35;
        this.createBellNode(ctx, f, t, 2.2, 0.3);
      });
      setTimeout(() => {
        if (!cancelled) onEnded?.();
      }, 3000);
    }
  }

  private createBellNode(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    maxGain = 0.35
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(maxGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audioEngine = new AudioEngine();

export function getAudioTrackLabel(
  trackId: string,
  tracks: AudioTrackOption[],
  category: PrayerCategory
): string {
  const found = tracks.find((t) => t.id === trackId);
  if (found) {
    return found.name;
  }
  return category === 'obligatory' ? 'Azan e Madina' : 'Peaceful Reminder';
}
