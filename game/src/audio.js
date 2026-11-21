// Synthesised sounds only: no audio files, everything is a WebAudio oscillator
// shaped in code, so the game ships no assets and loads nothing over the network.
let context = null;
let muted = false;

function ensureContext() {
  if (!context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') context.resume().catch(() => {});
  return context;
}

function tone({ frequency, endFrequency, duration, type, volume, delay = 0 }) {
  if (muted) return;
  const audio = ensureContext();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

export function playFound() {
  tone({ frequency: 660, duration: 0.12, type: 'sine', volume: 0.22 });
  tone({ frequency: 990, duration: 0.2, type: 'sine', volume: 0.2, delay: 0.09 });
}

export function playWrong() {
  tone({ frequency: 180, endFrequency: 110, duration: 0.22, type: 'sawtooth', volume: 0.12 });
}

export function playClick() {
  tone({ frequency: 520, duration: 0.06, type: 'triangle', volume: 0.1 });
}

export function playHint() {
  tone({ frequency: 440, endFrequency: 880, duration: 0.25, type: 'sine', volume: 0.14 });
}

export function playRoundClear() {
  [523, 659, 784, 1047].forEach((frequency, index) => {
    tone({ frequency, duration: 0.22, type: 'triangle', volume: 0.18, delay: index * 0.11 });
  });
}

export function playWin() {
  [523, 659, 784, 1047, 1319].forEach((frequency, index) => {
    tone({ frequency, duration: 0.3, type: 'triangle', volume: 0.18, delay: index * 0.13 });
  });
}

export function playTick() {
  tone({ frequency: 880, duration: 0.05, type: 'square', volume: 0.05 });
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}
