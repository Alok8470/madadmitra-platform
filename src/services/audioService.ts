// ==============================================================================
// MADADMITRA STUDIO-QUALITY FEMALE AUDIO ENGINE (Swara Neural Voice)
// Features: Real studio-recorded female Hindi voice + Chimes + Zero-latency MP3
// ==============================================================================

/**
 * Returns the direct studio audio track path for a given service category.
 * Audio is pre-rendered using Microsoft Swara Neural (Highest quality Hindi female voice).
 */
export function getStudioAudioPath(serviceCategory?: string): string {
  const cat = (serviceCategory || '').toLowerCase();
  if (cat.includes('electric') || cat.includes('इलेक्ट्रीशियन') || cat.includes('बिजली')) {
    return '/audio/job-alert-electrician.mp3';
  }
  if (cat.includes('plumb') || cat.includes('प्लम्बर') || cat.includes('नल')) {
    return '/audio/job-alert-plumber.mp3';
  }
  if (cat.includes('carpent') || cat.includes('बढ़ई') || cat.includes('लकड़ी')) {
    return '/audio/job-alert-carpenter.mp3';
  }
  if (cat.includes('cook') || cat.includes('रसोइया') || cat.includes('खाना')) {
    return '/audio/job-alert-cook.mp3';
  }
  if (cat.includes('clean') || cat.includes('सफाई') || cat.includes('झाड़ू')) {
    return '/audio/job-alert-cleaner.mp3';
  }
  return '/audio/job-alert-female.mp3';
}

/**
 * Plays a pleasant notification chime using Web Audio API.
 */
export function playDispatchChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.4, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.debug('Chime error:', e);
  }
}

// Global active audio controller
let currentActiveAudio: HTMLAudioElement | null = null;

/**
 * Plays the crystal-clear, studio-grade female Hindi voice audio.
 * Uses high-definition pre-rendered audio, eliminating robotic text-to-speech.
 */
export function playStudioFemaleVoice(options: {
  serviceCategory?: string;
  onStart?: () => void;
  onEnd?: () => void;
}): void {
  stopJobSpeech();

  // 1. Play dual alert chime
  playDispatchChime();

  const audioPath = getStudioAudioPath(options.serviceCategory);
  const audio = new Audio(audioPath);
  currentActiveAudio = audio;

  audio.onplay = () => {
    if (options.onStart) options.onStart();
  };

  audio.onended = () => {
    currentActiveAudio = null;
    if (options.onEnd) options.onEnd();
  };

  audio.onerror = (e) => {
    console.warn('Audio playback error, falling back to general audio:', e);
    // If specific file failed, try universal female track
    if (audioPath !== '/audio/job-alert-female.mp3') {
      const fallbackAudio = new Audio('/audio/job-alert-female.mp3');
      currentActiveAudio = fallbackAudio;
      fallbackAudio.onplay = () => { if (options.onStart) options.onStart(); };
      fallbackAudio.onended = () => { if (options.onEnd) options.onEnd(); };
      fallbackAudio.onerror = () => { if (options.onEnd) options.onEnd(); };
      fallbackAudio.play().catch(() => {
        if (options.onEnd) options.onEnd();
      });
    } else {
      if (options.onEnd) options.onEnd();
    }
  };

  // Play studio recording with tiny delay so chime finishes nicely
  setTimeout(() => {
    if (currentActiveAudio === audio) {
      audio.play().catch((err) => {
        console.debug('Autoplay restriction, waiting for user tap:', err);
        if (options.onEnd) options.onEnd();
      });
    }
  }, 200);
}

/**
 * Immediately stops any currently playing audio.
 */
export function stopJobSpeech(): void {
  if (currentActiveAudio) {
    try {
      currentActiveAudio.pause();
      currentActiveAudio.currentTime = 0;
    } catch {
      // Audio teardown
    }
    currentActiveAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
