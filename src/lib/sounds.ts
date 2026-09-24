const SOUND_KEY = "muslima-stories:ambient-sound";

type SoundName = "flip-forward" | "flip-back" | "favorite" | "complete";

function soundIsEnabled() {
  try {
    return window.localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}

export function playStorySound(name: SoundName) {
  if (typeof window === "undefined" || !soundIsEnabled()) return;
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = name === "flip-forward" || name === "flip-back" ? 1500 : 2400;
  gain.connect(filter).connect(context.destination);
  gain.gain.setValueAtTime(0.0001, context.currentTime);

  const notes = name === "flip-forward" ? [392, 523] : name === "flip-back" ? [523, 392] : name === "favorite" ? [523, 659, 784] : [523, 659, 784, 1047];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = name === "flip-forward" || name === "flip-back" ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    const start = context.currentTime + index * (name === "complete" ? 0.13 : 0.08);
    oscillator.start(start);
    oscillator.stop(start + (name === "complete" ? 0.28 : 0.18));
  });

  const duration = name === "complete" ? 0.75 : name === "favorite" ? 0.42 : 0.28;
  gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  window.setTimeout(() => void context.close(), (duration + 0.2) * 1000);
}

export function praiseReader() {
  if (typeof window === "undefined" || !soundIsEnabled()) return;
  playStorySound("complete");
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const praise = new SpeechSynthesisUtterance("Well done!");
    praise.rate = 0.92;
    praise.pitch = 1.08;
    praise.volume = 0.7;
    window.speechSynthesis.speak(praise);
  }
}