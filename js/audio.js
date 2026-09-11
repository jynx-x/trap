/* TRAP ESCAPE — tiny WebAudio chiptune engine (no audio files) */
const SND = (() => {
  let ctx = null, master, sfxBus, musicBus, noiseBuf, enabled = true, seqTimer = null, current = null;
  const N = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = enabled ? 0.6 : 0; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.3; musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function tone({ f = 440, f2, type = 'square', t = 0, at, dur = 0.12, vol = 0.25, out }) {
    if (!ctx) return;
    const s = at ?? ctx.currentTime + t;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, s);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + dur);
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(vol, s + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(g); g.connect(out || sfxBus); o.start(s); o.stop(s + dur + 0.03);
  }

  function noise({ t = 0, at, dur = 0.3, vol = 0.4, freq = 1200, freq2, type = 'lowpass', out }) {
    if (!ctx) return;
    const s = at ?? ctx.currentTime + t;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(freq, s);
    if (freq2) fl.frequency.exponentialRampToValueAtTime(freq2, s + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, s); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    src.connect(fl); fl.connect(g); g.connect(out || sfxBus); src.start(s); src.stop(s + dur + 0.03);
  }

  const arp = (notes, step, opts = {}) => notes.forEach((n, i) => tone({ f: N(n), t: (opts.t || 0) + i * step, dur: opts.dur || 0.12, vol: opts.vol || 0.18, type: opts.type || 'square' }));

  const sfx = {
    click() { tone({ f: 900, f2: 1400, dur: 0.05, vol: 0.15 }); },
    start() { arp([72, 76, 79, 84], 0.06, { dur: 0.12 }); },
    alarm() {
      for (let i = 0; i < 3; i++) {
        tone({ f: 620, f2: 1180, t: i * 0.56, dur: 0.28, vol: 0.14, type: 'sawtooth' });
        tone({ f: 1180, f2: 620, t: i * 0.56 + 0.28, dur: 0.28, vol: 0.14, type: 'sawtooth' });
      }
    },
    warning() { for (let i = 0; i < 3; i++) tone({ f: 988, t: i * 0.16, dur: 0.1, vol: 0.18 }); },
    rumble(dur = 1.4) { noise({ dur, vol: 0.5, freq: 260, freq2: 70 }); tone({ f: 70, f2: 40, dur, vol: 0.3, type: 'sine' }); },
    fall() { tone({ f: 1100, f2: 110, dur: 1.0, vol: 0.16, type: 'square' }); },
    thud() { tone({ f: 160, f2: 40, dur: 0.35, vol: 0.55, type: 'sine' }); noise({ dur: 0.3, vol: 0.45, freq: 700 }); },
    bonk() { tone({ f: 260, f2: 140, dur: 0.1, vol: 0.2, type: 'triangle' }); noise({ dur: 0.06, vol: 0.12, freq: 900 }); },
    wrong() { tone({ f: 240, f2: 120, dur: 0.16, vol: 0.2, type: 'sawtooth' }); tone({ f: 170, f2: 80, t: 0.15, dur: 0.28, vol: 0.2, type: 'sawtooth' }); },
    key() { arp([79, 86, 91, 95, 98], 0.05, { type: 'triangle', vol: 0.16 }); },
    sparkle() { arp([96, 100, 103], 0.04, { type: 'triangle', vol: 0.08, dur: 0.08 }); },
    complete() { arp([72, 76, 79, 84, 88], 0.07, { dur: 0.14 }); tone({ f: N(91), t: 0.36, dur: 0.45, vol: 0.14, type: 'triangle' }); },
    beep(hi) { tone({ f: hi ? 1480 : 1040, dur: 0.06, vol: 0.09 }); },
    cut() { noise({ dur: 0.07, vol: 0.35, freq: 3500, type: 'highpass' }); tone({ f: 1700, f2: 300, dur: 0.1, vol: 0.12 }); },
    zap() { noise({ dur: 0.25, vol: 0.3, freq: 2500, freq2: 300, type: 'bandpass' }); },
    disarm() { arp([60, 55, 48], 0.09, { type: 'square', vol: 0.14, dur: 0.12 }); arp([79, 84], 0.1, { t: 0.35, type: 'triangle', dur: 0.25 }); },
    rune(i) { tone({ f: N([72, 76, 79, 83][i] || 72), dur: 0.18, vol: 0.17, type: 'triangle' }); tone({ f: N(([72, 76, 79, 83][i] || 72) + 12), t: 0.02, dur: 0.1, vol: 0.05 }); },
    denied() { tone({ f: 140, dur: 0.14, vol: 0.22 }); tone({ f: 140, t: 0.2, dur: 0.32, vol: 0.22 }); },
    granted() { arp([76, 79, 84, 88, 91], 0.06, { type: 'triangle', vol: 0.18, dur: 0.18 }); },
    heart() { tone({ f: 400, f2: 200, dur: 0.2, vol: 0.18, type: 'square' }); },
    unlock() {
      noise({ dur: 0.07, vol: 0.35, freq: 1600 }); noise({ t: 0.14, dur: 0.07, vol: 0.35, freq: 1600 });
      arp([72, 79, 84, 88, 91, 96], 0.07, { t: 0.3, type: 'square', vol: 0.15, dur: 0.2 });
    },
    pump(p) { tone({ f: 260 + p * 9, f2: 420 + p * 9, dur: 0.06, vol: 0.13 }); },
    press() { tone({ f: 200, f2: 70, dur: 0.18, vol: 0.4 }); noise({ dur: 0.06, vol: 0.3, freq: 2000 }); },
    explosion() { noise({ dur: 1.6, vol: 0.9, freq: 3500, freq2: 60 }); tone({ f: 110, f2: 28, dur: 0.9, vol: 0.55, type: 'sine' }); },
    door() {
      noise({ dur: 1.8, vol: 0.3, freq: 250, freq2: 1200 });
      [60, 64, 67, 72, 76].forEach((n, i) => tone({ f: N(n), t: 0.8 + i * 0.05, dur: 1.6, vol: 0.07, type: 'triangle' }));
    },
    whoosh() { noise({ dur: 0.45, vol: 0.25, freq: 400, freq2: 3000, type: 'bandpass' }); },
    star(i) { tone({ f: N(84 + [0, 2, 4, 7, 12][i]), dur: 0.16, vol: 0.14 }); tone({ f: N(96 + [0, 2, 4, 7, 12][i]), t: 0.03, dur: 0.1, vol: 0.05, type: 'triangle' }); },
    jingle() {
      const L = [[67, 0, .12], [72, .12, .12], [76, .24, .12], [79, .36, .3], [76, .72, .12], [79, 0.84, 0.7]];
      L.forEach(([n, t, d]) => { tone({ f: N(n), t, dur: d + 0.05, vol: 0.2 }); tone({ f: N(n - 12), t, dur: d + 0.05, vol: 0.1, type: 'triangle' }); });
      [48, 55, 60].forEach(n => tone({ f: N(n), t: 0.84, dur: 0.9, vol: 0.12, type: 'triangle' }));
    },
  };

  /* ---- music: 16th-note step sequencer ---- */
  const kick = at => tone({ at, f: 150, f2: 45, dur: 0.14, vol: 0.5, type: 'sine', out: musicBus });
  const snare = at => noise({ at, dur: 0.1, vol: 0.28, freq: 1800, type: 'bandpass', out: musicBus });
  const hat = at => noise({ at, dur: 0.03, vol: 0.12, freq: 7000, type: 'highpass', out: musicBus });

  const SONGS = {
    meadow: { bpm: 112, play(s, at, d) {
      const bar = Math.floor(s / 16) % 4, i = s % 16;
      const roots = [48, 53, 55, 48], ch = [[60, 64, 67], [60, 65, 69], [59, 62, 67], [60, 64, 67]][bar];
      if (i % 4 === 0) tone({ at, f: N(roots[bar]), dur: d * 3, vol: 0.22, type: 'triangle', out: musicBus });
      if (i % 2 === 0) tone({ at, f: N(ch[(i / 2) % 3] + 12), dur: d * 1.5, vol: 0.06, type: 'square', out: musicBus });
    } },
    dungeon: { bpm: 156, play(s, at, d) {
      const bar = Math.floor(s / 16) % 4, i = s % 16;
      const roots = [45, 45, 41, 40], ch = [[57, 60, 64], [57, 60, 64], [53, 57, 60], [52, 56, 59]][bar];
      if (i % 2 === 0) tone({ at, f: N(roots[bar] + (i % 4 === 2 ? 12 : 0)), dur: d * 1.5, vol: 0.2, type: 'square', out: musicBus });
      tone({ at, f: N(ch[[0, 1, 2, 1][i % 4]] + 12), dur: d * 0.8, vol: 0.05, type: 'square', out: musicBus });
      const mel = [76, 0, 74, 0, 72, 0, 71, 72, 0, 0, 69, 0, 71, 0, 72, 0];
      if (bar % 2 === 1 && mel[i]) tone({ at, f: N(mel[i] + (bar === 3 ? -1 : 0)), dur: d * 1.8, vol: 0.07, type: 'square', out: musicBus });
      if (i === 0 || i === 8 || i === 10) kick(at);
      if (i === 4 || i === 12) snare(at);
      if (i % 2 === 1) hat(at);
    } },
    victory: { bpm: 128, play(s, at, d) {
      const bar = Math.floor(s / 16) % 4, i = s % 16;
      const roots = [48, 53, 55, 53], ch = [[64, 67, 72], [65, 69, 72], [67, 71, 74], [65, 69, 72]][bar];
      if (i % 4 === 0) tone({ at, f: N(roots[bar]), dur: d * 2, vol: 0.2, type: 'triangle', out: musicBus });
      if (i % 4 === 2) tone({ at, f: N(roots[bar] + 12), dur: d, vol: 0.12, type: 'triangle', out: musicBus });
      tone({ at, f: N(ch[i % 3] + 12), dur: d * 0.7, vol: 0.04, type: 'square', out: musicBus });
      if (i % 4 === 2) hat(at);
    } },
  };

  function play(name) {
    stop();
    if (!ctx) return;
    const song = SONGS[name]; current = name;
    const d = 60 / song.bpm / 4; let step = 0, next = ctx.currentTime + 0.06;
    seqTimer = setInterval(() => {
      while (next < ctx.currentTime + 0.14) { song.play(step, next, d); step++; next += d; }
    }, 30);
  }
  function stop() { clearInterval(seqTimer); seqTimer = null; current = null; }

  function setEnabled(on) {
    enabled = on;
    if (master) master.gain.setTargetAtTime(on ? 0.6 : 0, ctx.currentTime, 0.02);
  }

  const safe = fn => (...a) => { try { fn(...a); } catch (e) { /* audio is optional */ } };
  const api = { init: safe(init), play: safe(play), stop, setEnabled, get enabled() { return enabled; } };
  Object.keys(sfx).forEach(k => { api[k] = safe(sfx[k]); });
  return api;
})();
