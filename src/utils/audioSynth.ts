// Web Audio synthesizer for NoteLogic interactive demo in portfolio

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Frequency map for standard notes in 4th octave
const NOTE_FREQS: Record<string, number> = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99,
};

export interface ChordDefinition {
  name: string;
  type: string;
  formula: string;
  frequencies: number[];
  guitarFrets: string; // e.g. "x-3-2-0-1-0"
  pianoKeys: string[];
  description: { en: string; id: string };
}

export const SAMPLE_CHORDS: ChordDefinition[] = [
  {
    name: 'C',
    type: 'Major Triad',
    formula: '1 - 3 - 5 (C - E - G)',
    frequencies: [NOTE_FREQS['C4'], NOTE_FREQS['E4'], NOTE_FREQS['G4'], NOTE_FREQS['C5']],
    guitarFrets: 'x 3 2 0 1 0',
    pianoKeys: ['C', 'E', 'G'],
    description: {
      en: 'Tonic-stable major color; clear tonal center of C Major.',
      id: 'Akor mayor tonik yang stabil; pusat tonal utama tangga nada C Mayor.',
    },
  },
  {
    name: 'Cm',
    type: 'Minor Triad',
    formula: '1 - b3 - 5 (C - Eb - G)',
    frequencies: [NOTE_FREQS['C4'], NOTE_FREQS['D#4'], NOTE_FREQS['G4'], NOTE_FREQS['C5']],
    guitarFrets: 'x 3 5 5 4 3',
    pianoKeys: ['C', 'D#', 'G'],
    description: {
      en: 'Introspective, melancholy minor center; strong emotional resonance.',
      id: 'Karakter minor melankolis dan mendalam; resolusi emosional yang kuat.',
    },
  },
  {
    name: 'G',
    type: 'Major Dominant',
    formula: '1 - 3 - 5 (G - B - D)',
    frequencies: [NOTE_FREQS['G3'], NOTE_FREQS['B3'], NOTE_FREQS['D4'], NOTE_FREQS['G4']],
    guitarFrets: '3 2 0 0 0 3',
    pianoKeys: ['G', 'B', 'D'],
    description: {
      en: 'Resolute, expansive dominant chord pulling naturally toward C.',
      id: 'Akor dominan bertenaga yang secara alami menarik resolusi ke C.',
    },
  },
  {
    name: 'Am',
    type: 'Minor Triad (Aeolian)',
    formula: '1 - b3 - 5 (A - C - E)',
    frequencies: [NOTE_FREQS['A3'], NOTE_FREQS['C4'], NOTE_FREQS['E4'], NOTE_FREQS['A4']],
    guitarFrets: 'x 0 2 2 1 0',
    pianoKeys: ['A', 'C', 'E'],
    description: {
      en: 'Relative minor of C Major; widely used in emotional progressions.',
      id: 'Relative minor dari C Mayor; fondasi harmoni musik modern.',
    },
  },
  {
    name: 'F',
    type: 'Major Subdominant',
    formula: '1 - 3 - 5 (F - A - C)',
    frequencies: [NOTE_FREQS['F3'], NOTE_FREQS['A3'], NOTE_FREQS['C4'], NOTE_FREQS['F4']],
    guitarFrets: '1 3 3 2 1 1',
    pianoKeys: ['F', 'A', 'C'],
    description: {
      en: 'Subdominant lift; creates gentle tension moving away from tonic.',
      id: 'Subdominan penyeimbang; menciptakan dinamika melodi sebelum resolusi.',
    },
  },
];

export function playChordSound(chord: ChordDefinition) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Strum effect: stagger each note slightly like guitar strum (25ms apart)
  chord.frequencies.forEach((freq, index) => {
    const startTime = now + index * 0.025;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Triangle wave gives warm, acoustic-like chime
    osc.type = index % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.5);
  });
}
