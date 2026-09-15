/**
 * Web Audio Engine for synthesizing zero-latency SFX,
 * handling microphone voiceover recordings, and mixing.
 */

let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioCtx = new AudioCtxClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

export type SfxType = 'whoosh' | 'ding' | 'pop' | 'camera' | 'glitch' | 'bass' | 'chime' | 'applause';

/**
 * Synthesizes and plays a real-time sound effect directly in the browser
 */
export function playSfx(type: SfxType, volume = 0.7) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1), now);
    masterGain.connect(ctx.destination);

    if (type === 'whoosh') {
      // White noise with swept bandpass filter
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.0;
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.6);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.6);
    } else if (type === 'ding') {
      // Pure crystalline bell / chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.2);
    } else if (type === 'pop') {
      // Snappy bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'camera') {
      // Dual click shutter
      const playClick = (timeOffset: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(100, now + timeOffset + 0.03);
        gain.gain.setValueAtTime(0.8, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.03);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.03);
      };
      playClick(0);
      playClick(0.08);
    } else if (type === 'glitch') {
      // 8-bit digital glitch burst
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(880, now + 0.04);
      osc.frequency.setValueAtTime(180, now + 0.09);
      osc.frequency.setValueAtTime(1420, now + 0.14);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'bass') {
      // Deep 808 Sub drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.8);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.0);
    } else if (type === 'chime') {
      // Triad chord chime (C6, E6, G6)
      const freqs = [1046.5, 1318.51, 1567.98];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        gain.gain.setValueAtTime(0.4, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.0);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 1.0);
      });
    } else if (type === 'applause') {
      // Noise burst texture
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(now);
      noise.stop(now + 1.5);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Creates a synthetic WAV data URL for a given SFX so it can be added to the project timeline as an audio clip!
 */
export async function createSfxBlobUrl(type: SfxType): Promise<{ url: string; duration: number }> {
  const durations: Record<SfxType, number> = {
    whoosh: 0.8,
    ding: 1.2,
    pop: 0.3,
    camera: 0.4,
    glitch: 0.5,
    bass: 1.2,
    chime: 1.5,
    applause: 2.0,
  };
  const duration = durations[type] || 1.0;
  const sampleRate = 44100;
  const length = Math.ceil(sampleRate * duration);
  const offlineCtx = new OfflineAudioContext(1, length, sampleRate);

  const now = 0;
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.8, now);
  masterGain.connect(offlineCtx.destination);

  if (type === 'whoosh') {
    const buffer = offlineCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const noise = offlineCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.0;
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.7);

    const gain = offlineCtx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.9, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
  } else if (type === 'ding') {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
  } else if (type === 'pop') {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
  } else if (type === 'bass') {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.8);
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
  } else {
    // Default chime
    const freqs = [1046.5, 1318.51, 1567.98];
    freqs.forEach((f, idx) => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);
      gain.gain.setValueAtTime(0.4, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.9);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.05);
    });
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = bufferToWave(renderedBuffer, length);
  const url = URL.createObjectURL(wavBlob);
  return { url, duration };
}

/**
 * Converts AudioBuffer to WAV Blob
 */
function bufferToWave(abuffer: AudioBuffer, totalSteps: number): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = totalSteps * numOfChan * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  const channels: Float32Array[] = [];
  let sampleRate = abuffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF chunk
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  // fmt chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // 16 for PCM
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample

  // data chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset] || 0));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: 'audio/wav' });
}

/**
 * Microphone Voiceover Recorder
 */
export async function startVoiceRecorder(): Promise<{
  stop: () => Promise<{ blob: Blob; url: string; duration: number }>;
  getVolumeLevel: () => number;
}> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = getAudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const mediaRecorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  const startTime = Date.now();

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  mediaRecorder.start(100);

  return {
    stop: () =>
      new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const duration = Math.max(0.5, (Date.now() - startTime) / 1000);
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          stream.getTracks().forEach((track) => track.stop());
          resolve({ blob, url, duration });
        };
        mediaRecorder.stop();
      }),
    getVolumeLevel: () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      return sum / dataArray.length / 255;
    },
  };
}
