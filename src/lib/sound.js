/**
 * Sound notification utility using Web Audio API
 * Generates distinct, pleasant notification tunes with zero external audio assets
 */

export const NOTIFICATION_TUNES = [
  {
    id: 'crystal',
    name: 'Veyra Crystal',
    tag: 'Classic',
    description: 'Harmonic crystal bell chime',
  },
  {
    id: 'pop',
    name: 'Brisk Pop',
    tag: 'Modern',
    description: 'Snappy bubble pop tone',
  },
  {
    id: 'double_chime',
    name: 'Double Chime',
    tag: 'Melodic',
    description: 'Two-tone ascending alert',
  },
  {
    id: 'marimba',
    name: 'Warm Marimba',
    tag: 'Acoustic',
    description: 'Gentle wooden percussive melody',
  },
  {
    id: 'cyber',
    name: 'Cyber Pulse',
    tag: 'Futuristic',
    description: 'Crisp synth pulse effect',
  },
  {
    id: 'drop',
    name: 'Zen Drop',
    tag: 'Ambient',
    description: 'Soft resonant waterdrop note',
  },
];

export const getSelectedToneId = () => {
  if (typeof window === 'undefined') return 'crystal';
  try {
    return localStorage.getItem('veyra_notification_tone') || 'crystal';
  } catch (e) {
    return 'crystal';
  }
};

export const setSelectedToneId = (toneId) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('veyra_notification_tone', toneId);
  } catch (e) {
    console.warn('Could not save notification tone:', e);
  }
};

export const playMessageSound = (explicitToneId, isPreview = false) => {
  if (typeof window === 'undefined') return;

  try {
    // If not in preview mode, check if sound alerts are muted
    if (!isPreview) {
      const soundEnabled = localStorage.getItem('veyra_sound_alerts');
      if (soundEnabled === 'false') return;
    }

    const toneId = explicitToneId || getSelectedToneId();

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    switch (toneId) {
      case 'pop': {
        // Brisk pop / bubble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.09);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'double_chime': {
        // Two-tone chime: A5 -> C#6
        const createTone = (freq, startTime, dur, vol) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + dur);
        };
        createTone(880, now, 0.22, 0.14);
        createTone(1108.7, now + 0.09, 0.35, 0.16);
        break;
      }

      case 'marimba': {
        // Warm wooden marimba: E5 -> G#5 -> B5
        const notes = [
          { freq: 659.3, time: now, dur: 0.2 },
          { freq: 830.6, time: now + 0.06, dur: 0.22 },
          { freq: 987.8, time: now + 0.12, dur: 0.35 },
        ];
        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.18, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + dur);
        });
        break;
      }

      case 'cyber': {
        // Cyber pulse: detuned synth ping
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(587.3, now);
        osc2.frequency.setValueAtTime(1174.6, now + 0.03);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
        break;
      }

      case 'drop': {
        // Zen waterdrop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1550, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
        break;
      }

      case 'crystal':
      default: {
        // Classic Veyra Crystal: C6 -> E6 -> G6
        const createBell = (freq, startTime, dur, vol) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + dur);
        };
        createBell(1046.5, now, 0.28, 0.12);
        createBell(1318.5, now + 0.07, 0.38, 0.14);
        createBell(1567.9, now + 0.14, 0.45, 0.16);
        break;
      }
    }
  } catch (e) {
    // Silently handle autoplay / restricted context
  }
};

export default playMessageSound;
