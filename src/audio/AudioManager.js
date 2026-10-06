// Sons do jogo. Cada som tem um nome. Por padrão ele é sintetizado na hora
// (WebAudio), mas se existir um arquivo em public/sounds/<nome>.ogg|.mp3|.wav
// listado em SOUND_FILES, o arquivo substitui o som sintetizado.
//
// Para trocar um som: coloque o arquivo em public/sounds/ e adicione aqui.
export const SOUND_FILES = {
  // m4: 'sounds/m4.ogg',
  // sniper: 'sounds/sniper.ogg',
};

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.master = null;
    this.volume = 0.55;
    this.loops = new Map();
  }

  // Navegadores só liberam áudio após interação do usuário.
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(this.ctx.destination);
    this.noiseBuf = this._makeNoise(1.5);
    for (const [name, url] of Object.entries(SOUND_FILES)) this._load(name, url);
  }

  async _load(name, url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.arrayBuffer();
      this.buffers[name] = await this.ctx.decodeAudioData(data);
    } catch {
      /* arquivo ausente: segue usando o som sintetizado */
    }
  }

  _makeNoise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  play(name, opts = {}) {
    if (!this.ctx || !name) return;
    const vol = opts.volume ?? 1;
    if (this.buffers[name]) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[name];
      const g = this.ctx.createGain();
      g.gain.value = vol;
      src.connect(g).connect(this.master);
      src.start();
      return;
    }
    const synth = SYNTHS[name];
    if (synth) synth(this, this.ctx.currentTime, vol, opts);
  }

  // Som contínuo (ex.: zumbido da Carga de Poder). Retorna id para parar.
  startLoop(id, kind = 'chargeHum', pitch = 1) {
    if (!this.ctx || this.loops.has(id)) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc2.type = 'sine';
    osc.frequency.value = 70 * pitch;
    osc2.frequency.value = 140 * pitch;
    osc.frequency.linearRampToValueAtTime(130 * pitch, t + 2.5);
    osc2.frequency.linearRampToValueAtTime(280 * pitch, t + 2.5);
    f.type = 'lowpass';
    f.frequency.value = 600;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.12, t + 0.15);
    osc.connect(f);
    osc2.connect(f);
    f.connect(g).connect(this.master);
    osc.start();
    osc2.start();
    this.loops.set(id, { osc, osc2, g });
  }

  stopLoop(id) {
    const l = this.loops.get(id);
    if (!l || !this.ctx) return;
    const t = this.ctx.currentTime;
    l.g.gain.cancelScheduledValues(t);
    l.g.gain.setValueAtTime(l.g.gain.value, t);
    l.g.gain.linearRampToValueAtTime(0, t + 0.12);
    l.osc.stop(t + 0.15);
    l.osc2.stop(t + 0.15);
    this.loops.delete(id);
  }

  stopAllLoops() {
    for (const id of [...this.loops.keys()]) this.stopLoop(id);
  }

  // ---- blocos de síntese ----
  noise(t, dur, { vol = 1, type = 'lowpass', freq = 1000, freqEnd, q = 1, attack = 0.002, rate = 1 } = {}) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = rate;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  tone(t, dur, { vol = 0.5, type = 'sine', freq = 440, freqEnd, attack = 0.005 } = {}) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

// Biblioteca de sons sintetizados. Nome → função.
const SYNTHS = {
  punch: (a, t, v) => {
    a.tone(t, 0.12, { vol: 0.6 * v, freq: 160, freqEnd: 50, type: 'sine' });
    a.noise(t, 0.08, { vol: 0.5 * v, freq: 1800, freqEnd: 300 });
  },
  kick: (a, t, v) => {
    a.tone(t, 0.16, { vol: 0.7 * v, freq: 120, freqEnd: 40 });
    a.noise(t, 0.1, { vol: 0.45 * v, freq: 1200, freqEnd: 200 });
  },
  heavyPunch: (a, t, v) => {
    a.tone(t, 0.28, { vol: 0.9 * v, freq: 110, freqEnd: 30 });
    a.noise(t, 0.2, { vol: 0.7 * v, freq: 2500, freqEnd: 150 });
  },
  impact: (a, t, v) => {
    a.tone(t, 0.2, { vol: 0.6 * v, freq: 90, freqEnd: 35 });
    a.noise(t, 0.15, { vol: 0.5 * v, freq: 3000, freqEnd: 400 });
  },
  swing: (a, t, v) => a.noise(t, 0.14, { vol: 0.25 * v, type: 'bandpass', freq: 900, freqEnd: 2600, q: 2, attack: 0.04 }),
  blade: (a, t, v) => {
    a.noise(t, 0.16, { vol: 0.35 * v, type: 'bandpass', freq: 3000, freqEnd: 7000, q: 3, attack: 0.02 });
    a.tone(t + 0.02, 0.18, { vol: 0.08 * v, type: 'triangle', freq: 2400, freqEnd: 1800 });
  },
  bladeHit: (a, t, v) => {
    a.noise(t, 0.12, { vol: 0.55 * v, type: 'highpass', freq: 2500 });
    a.tone(t, 0.15, { vol: 0.35 * v, freq: 140, freqEnd: 60 });
  },
  m4: (a, t, v) => {
    a.noise(t, 0.09, { vol: 0.8 * v, freq: 4000, freqEnd: 500 });
    a.tone(t, 0.07, { vol: 0.4 * v, freq: 220, freqEnd: 60, type: 'square' });
  },
  // Erin: granadas e escopeta
  explosion: (a, t, v) => {
    a.noise(t, 0.9, { vol: 1.1 * v, freq: 3000, freqEnd: 60 });
    a.tone(t, 0.6, { vol: 1.0 * v, freq: 90, freqEnd: 25 });
    a.noise(t + 0.15, 1.4, { vol: 0.25 * v, freq: 500, freqEnd: 80, attack: 0.1 });
  },
  shotgun: (a, t, v) => {
    a.noise(t, 0.35, { vol: 1.0 * v, freq: 3500, freqEnd: 200 });
    a.tone(t, 0.22, { vol: 0.7 * v, freq: 130, freqEnd: 35, type: 'square' });
    a.tone(t + 0.35, 0.05, { vol: 0.2 * v, freq: 900, type: 'square' }); // bombeia
    a.tone(t + 0.45, 0.05, { vol: 0.2 * v, freq: 700, type: 'square' });
  },
  grenadePin: (a, t, v) => {
    a.tone(t, 0.04, { vol: 0.3 * v, freq: 2400, type: 'square' });
    a.noise(t + 0.05, 0.1, { vol: 0.2 * v, type: 'highpass', freq: 3000 });
  },
  // Aguiar: machado e armadilha de urso
  axeHit: (a, t, v) => {
    a.tone(t, 0.25, { vol: 0.85 * v, freq: 120, freqEnd: 35 });
    a.noise(t, 0.18, { vol: 0.6 * v, type: 'highpass', freq: 1800 });
    a.noise(t + 0.03, 0.25, { vol: 0.3 * v, freq: 800, freqEnd: 200 });
  },
  trapSnap: (a, t, v) => {
    a.tone(t, 0.05, { vol: 0.6 * v, freq: 1600, freqEnd: 400, type: 'square' });
    a.noise(t, 0.2, { vol: 0.7 * v, type: 'highpass', freq: 2200 });
    a.tone(t + 0.02, 0.2, { vol: 0.5 * v, freq: 140, freqEnd: 50 });
  },
  maskOn: (a, t, v) => {
    a.tone(t, 0.6, { vol: 0.35 * v, freq: 70, freqEnd: 40, type: 'sawtooth' });
    a.noise(t, 0.5, { vol: 0.25 * v, freq: 400, freqEnd: 120, attack: 0.2 });
  },
  sniper: (a, t, v) => {
    a.noise(t, 0.6, { vol: 1.0 * v, freq: 5000, freqEnd: 120 });
    a.tone(t, 0.35, { vol: 0.8 * v, freq: 160, freqEnd: 30, type: 'square' });
    a.noise(t + 0.25, 0.9, { vol: 0.15 * v, freq: 600, freqEnd: 100 });
  },
  reload: (a, t, v) => {
    a.tone(t, 0.04, { vol: 0.25 * v, freq: 1800, type: 'square' });
    a.tone(t + 0.12, 0.05, { vol: 0.25 * v, freq: 1200, type: 'square' });
  },
  ready: (a, t, v) => {
    a.tone(t, 0.12, { vol: 0.15 * v, freq: 880, type: 'triangle' });
    a.tone(t + 0.07, 0.18, { vol: 0.15 * v, freq: 1320, type: 'triangle' });
  },
  denied: (a, t, v) => a.tone(t, 0.12, { vol: 0.2 * v, freq: 180, type: 'square', freqEnd: 140 }),
  carga: (a, t, v, o) => {
    const p = o.pitch || 1;
    a.tone(t, 0.35, { vol: 0.3 * v, freq: 220 * p, freqEnd: 660 * p, type: 'sawtooth' });
    a.noise(t, 0.4, { vol: 0.2 * v, type: 'bandpass', freq: 500, freqEnd: 3000, q: 4, attack: 0.1 });
  },
  armed: (a, t, v) => {
    a.tone(t, 0.25, { vol: 0.25 * v, freq: 660, type: 'triangle' });
    a.tone(t + 0.08, 0.35, { vol: 0.25 * v, freq: 990, type: 'triangle' });
  },
  specialStart: (a, t, v) => {
    a.noise(t, 0.8, { vol: 0.5 * v, type: 'bandpass', freq: 200, freqEnd: 4000, q: 2, attack: 0.5 });
    a.tone(t, 0.9, { vol: 0.3 * v, freq: 60, freqEnd: 240, type: 'sawtooth' });
  },
  banner: (a, t, v) => {
    a.noise(t, 0.5, { vol: 0.4 * v, freq: 6000, freqEnd: 200 });
    a.tone(t, 0.6, { vol: 0.4 * v, freq: 55, type: 'sawtooth', freqEnd: 40 });
  },
  powerUp: (a, t, v) => {
    a.tone(t, 1.4, { vol: 0.35 * v, freq: 80, freqEnd: 320, type: 'sawtooth', attack: 0.3 });
    a.noise(t, 1.5, { vol: 0.35 * v, type: 'lowpass', freq: 300, freqEnd: 2500, attack: 0.6 });
  },
  smoke: (a, t, v) => a.noise(t, 1.2, { vol: 0.3 * v, type: 'lowpass', freq: 500, freqEnd: 1200, attack: 0.4 }),
  bloodClaw: (a, t, v) => {
    a.noise(t, 0.6, { vol: 0.5 * v, type: 'bandpass', freq: 300, freqEnd: 1500, q: 3, attack: 0.2 });
    a.tone(t, 0.7, { vol: 0.3 * v, freq: 50, freqEnd: 110, type: 'sawtooth', attack: 0.2 });
  },
  clawHit: (a, t, v) => {
    a.noise(t, 0.18, { vol: 0.7 * v, type: 'bandpass', freq: 1200, freqEnd: 300, q: 1.5 });
    a.tone(t, 0.2, { vol: 0.4 * v, freq: 90, freqEnd: 40 });
  },
  teleport: (a, t, v) => {
    a.noise(t, 0.22, { vol: 0.35 * v, type: 'bandpass', freq: 4000, freqEnd: 400, q: 3 });
    a.tone(t, 0.2, { vol: 0.15 * v, freq: 1400, freqEnd: 200, type: 'sine' });
  },
  knifeThrow: (a, t, v) => a.noise(t, 0.2, { vol: 0.3 * v, type: 'bandpass', freq: 2000, freqEnd: 5000, q: 5 }),
  bladeWave: (a, t, v) => {
    a.noise(t, 0.45, { vol: 0.45 * v, type: 'bandpass', freq: 1500, freqEnd: 6000, q: 2 });
    a.tone(t, 0.4, { vol: 0.15 * v, freq: 900, freqEnd: 300, type: 'triangle' });
  },
  shockwave: (a, t, v) => {
    a.tone(t, 0.5, { vol: 0.8 * v, freq: 70, freqEnd: 25 });
    a.noise(t, 0.5, { vol: 0.5 * v, freq: 1500, freqEnd: 80 });
  },
  drain: (a, t, v) => a.tone(t, 0.25, { vol: 0.15 * v, freq: 300, freqEnd: 900, type: 'triangle' }),
  slashFinal: (a, t, v) => {
    a.noise(t, 0.5, { vol: 0.7 * v, type: 'highpass', freq: 2000 });
    a.tone(t, 0.6, { vol: 0.25 * v, freq: 3000, freqEnd: 600, type: 'triangle' });
    a.tone(t, 0.5, { vol: 0.5 * v, freq: 80, freqEnd: 30 });
  },
  heartbeat: (a, t, v) => {
    a.tone(t, 0.15, { vol: 0.5 * v, freq: 60, freqEnd: 40 });
    a.tone(t + 0.22, 0.15, { vol: 0.4 * v, freq: 55, freqEnd: 38 });
  },
  jump: (a, t, v) => a.noise(t, 0.12, { vol: 0.15 * v, freq: 600, freqEnd: 1500, attack: 0.03 }),
  land: (a, t, v) => a.noise(t, 0.1, { vol: 0.2 * v, freq: 500, freqEnd: 150 }),
  ko: (a, t, v) => {
    a.tone(t, 1.2, { vol: 0.6 * v, freq: 50, freqEnd: 25 });
    a.noise(t, 1.0, { vol: 0.4 * v, freq: 2000, freqEnd: 80 });
  },
  // ---- V2 ----
  blockHit: (a, t, v) => {
    a.noise(t, 0.08, { vol: 0.45 * v, type: 'highpass', freq: 1800 });
    a.tone(t, 0.1, { vol: 0.2 * v, freq: 420, freqEnd: 300, type: 'square' });
  },
  guardBreak: (a, t, v) => {
    a.noise(t, 0.4, { vol: 0.7 * v, type: 'highpass', freq: 1200 });
    a.tone(t, 0.4, { vol: 0.4 * v, freq: 600, freqEnd: 80, type: 'sawtooth' });
  },
  perfectBlock: (a, t, v) => {
    a.tone(t, 0.3, { vol: 0.3 * v, freq: 1760, type: 'triangle' });
    a.tone(t, 0.4, { vol: 0.25 * v, freq: 2640, type: 'sine' });
    a.noise(t, 0.1, { vol: 0.4 * v, type: 'highpass', freq: 4000 });
  },
  chainThrow: (a, t, v) => {
    for (let i = 0; i < 5; i++) a.tone(t + i * 0.035, 0.04, { vol: 0.12 * v, freq: 2400 + i * 200, type: 'square' });
    a.noise(t, 0.25, { vol: 0.25 * v, type: 'bandpass', freq: 3000, q: 4 });
  },
  chainPull: (a, t, v) => {
    for (let i = 0; i < 6; i++) a.tone(t + i * 0.03, 0.04, { vol: 0.14 * v, freq: 3200 - i * 250, type: 'square' });
    a.tone(t, 0.25, { vol: 0.4 * v, freq: 120, freqEnd: 60 });
  },
  fearGaze: (a, t, v) => {
    a.tone(t, 0.9, { vol: 0.3 * v, freq: 55, freqEnd: 45, type: 'sawtooth', attack: 0.2 });
    a.tone(t, 0.9, { vol: 0.15 * v, freq: 1500, freqEnd: 900, type: 'sine', attack: 0.3 });
    a.noise(t, 0.8, { vol: 0.2 * v, type: 'bandpass', freq: 400, freqEnd: 150, q: 6, attack: 0.3 });
  },
  descarnar: (a, t, v) => {
    for (let i = 0; i < 6; i++) a.noise(t + i * 0.07, 0.1, { vol: 0.4 * v, type: 'bandpass', freq: 3500 + i * 300, q: 3 });
    a.tone(t, 0.5, { vol: 0.25 * v, freq: 90, freqEnd: 50, type: 'sawtooth' });
  },
  ritual: (a, t, v) => {
    a.tone(t, 1.4, { vol: 0.3 * v, freq: 70, freqEnd: 140, type: 'sawtooth', attack: 0.5 });
    a.noise(t, 1.4, { vol: 0.25 * v, type: 'bandpass', freq: 300, freqEnd: 2000, q: 3, attack: 0.6 });
  },
  rebirth: (a, t, v) => {
    a.tone(t, 1.0, { vol: 0.35 * v, freq: 60, freqEnd: 220, type: 'sawtooth', attack: 0.2 });
    for (let i = 0; i < 8; i++) a.noise(t + i * 0.09, 0.05, { vol: 0.3 * v, type: 'highpass', freq: 5000 });
  },
  blink: (a, t, v) => {
    a.tone(t, 0.25, { vol: 0.25 * v, freq: 200, freqEnd: 1600, type: 'sine' });
    a.noise(t, 0.2, { vol: 0.3 * v, type: 'bandpass', freq: 800, freqEnd: 5000, q: 3 });
  },
  fearBlade: (a, t, v) => {
    a.tone(t, 0.6, { vol: 0.35 * v, freq: 3000, freqEnd: 200, type: 'triangle' });
    a.tone(t, 0.6, { vol: 0.5 * v, freq: 70, freqEnd: 30, type: 'sawtooth' });
    a.noise(t, 0.5, { vol: 0.6 * v, type: 'highpass', freq: 2500 });
  },
  // ---- Anfitrião ----
  whip: (a, t, v) => {
    a.noise(t, 0.16, { vol: 0.5 * v, type: 'bandpass', freq: 900, freqEnd: 7000, q: 4 });
    a.noise(t + 0.12, 0.08, { vol: 0.7 * v, type: 'highpass', freq: 3500 });
    a.tone(t + 0.12, 0.12, { vol: 0.2 * v, freq: 1800, freqEnd: 400, type: 'triangle' });
  },
  // risada distorcida pela máscara: pulsos "ha" descendo de tom
  laugh: (a, t, v) => {
    for (let i = 0; i < 5; i++) {
      a.tone(t + i * 0.13, 0.1, { vol: 0.22 * v, freq: 260 - i * 18, freqEnd: 200 - i * 18, type: 'sawtooth', attack: 0.01 });
      a.noise(t + i * 0.13, 0.09, { vol: 0.12 * v, type: 'bandpass', freq: 900, q: 5 });
    }
  },
  // palmas da "plateia" (A Plateia): estalos curtos espalhados
  applause: (a, t, v) => {
    for (let i = 0; i < 26; i++) a.noise(t + i * 0.045 + (i % 3) * 0.013, 0.035, { vol: (0.18 + (i % 4) * 0.05) * v, type: 'bandpass', freq: 1400 + (i % 5) * 300, q: 2 });
  },
  tick: (a, t, v) => {
    a.noise(t, 0.03, { vol: 0.35 * v, type: 'highpass', freq: 5000 });
    a.tone(t, 0.04, { vol: 0.12 * v, freq: 2100, type: 'square' });
  },
  button: (a, t, v) => {
    a.tone(t, 0.08, { vol: 0.35 * v, freq: 180, freqEnd: 90, type: 'square' });
    a.noise(t, 0.06, { vol: 0.4 * v, type: 'lowpass', freq: 900 });
    a.tone(t + 0.1, 0.5, { vol: 0.2 * v, freq: 880, freqEnd: 1320, type: 'triangle' });
  },
  select: (a, t, v) => a.tone(t, 0.06, { vol: 0.15 * v, freq: 660, type: 'triangle' }),
  confirm: (a, t, v) => {
    a.tone(t, 0.1, { vol: 0.2 * v, freq: 440, type: 'square' });
    a.tone(t + 0.08, 0.2, { vol: 0.2 * v, freq: 880, type: 'square' });
  },
};
