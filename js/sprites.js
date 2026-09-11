/* TRAP ESCAPE — pixel sprite engine + characters
   Every sprite is painted pixel-by-pixel on a tiny canvas, auto-outlined in dark navy,
   and scaled up with nearest-neighbor rendering. */
(() => {
  const C = {
    nv0: '#07162F', nv1: '#0A1F46', nv2: '#102A5B', nv3: '#163766',
    bl0: '#1D4E9E', bl1: '#2869C7', bl2: '#398FE3', bl3: '#54B8F7', bl4: '#8AD7FF',
    cr: '#FFF9E8', cr2: '#FFF2D2', wh: '#FFFFFF',
    gr0: '#348C46', gr1: '#55B957', gr2: '#7BD95A', gr3: '#A2E66E',
    pu0: '#6447BE', pu1: '#815BD7', pu2: '#A36FE8', pu3: '#CD8DF4',
    pk0: '#FF70B6', pk1: '#FF8BC7',
    go0: '#E09A2E', go1: '#FFC94D', go2: '#FFD95F', go3: '#FFE894', go4: '#FFF2B5',
    rd0: '#C8172F', rd1: '#E52A3D', rd2: '#FF3B47', rd3: '#FF5663',
    or0: '#F26A2E', or1: '#FF8A3C', or2: '#FFAD4D',
    wy0: '#FFD23E', wy1: '#FFE35B',
    un0: '#10192B', un1: '#182643', un2: '#263B62',
    sk0: '#FFD9B8', sk1: '#F3B58E', sk2: '#FFEBD9',
    st0: '#1E2350', st1: '#2B3268', st2: '#3A4583', st3: '#5160A6', st4: '#6F7FC4',
    wd0: '#5E3220', wd1: '#8C4E32', wd2: '#B76C43', wd3: '#D9925A',
    mt0: '#4A5680', mt1: '#7885B5', mt2: '#AEB9E0', mt3: '#E2E8FF',
    mouth: '#8E1F3A', eye: '#0E1633',
  };
  const col = c => C[c] || c;

  function make(w, h, draw, opt = {}) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const P = {
      ctx, w, h,
      px(x, y, c) { ctx.fillStyle = col(c); ctx.fillRect(x, y, 1, 1); },
      r(x, y, ww, hh, c) { ctx.fillStyle = col(c); ctx.fillRect(x, y, ww, hh); },
      clear(x, y, ww = 1, hh = 1) { ctx.clearRect(x, y, ww, hh); },
      // filled disc / ellipse on the pixel grid
      disc(cx, cy, rx, ry, c) {
        ry = ry ?? rx; ctx.fillStyle = col(c);
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
          for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
            const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
            if (dx * dx + dy * dy <= 1) ctx.fillRect(x, y, 1, 1);
          }
      },
      map(rows, legend, ox = 0, oy = 0) {
        rows.forEach((row, y) => [...row].forEach((ch, x) => {
          if (ch !== '.' && ch !== ' ' && legend[ch]) P.px(ox + x, oy + y, legend[ch]);
        }));
      },
      line(x0, y0, x1, y1, c) {
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
        for (let i = 0; i <= n; i++) P.px(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c);
      },
    };
    draw(P, ctx);
    if (opt.outline !== false) outline(ctx, w, h, col(opt.outline || 'nv0'));
    return cv;
  }

  function outline(ctx, w, h, color) {
    const d = ctx.getImageData(0, 0, w, h).data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 20;
    ctx.fillStyle = color;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
      if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) ctx.fillRect(x, y, 1, 1);
  }

  // map sprite with 1px margin for the outline
  function fromMap(rows, legend, opt) {
    const h = rows.length, w = Math.max(...rows.map(r => r.length));
    return make(w + 2, h + 2, P => P.map(rows, legend, 1, 1), opt);
  }

  // stepped pixel halo: concentric discs with decreasing alpha (no blur)
  function halo(r, color, steps = 4) {
    const s = r * 2 + 2;
    return make(s, s, P => {
      for (let i = 0; i < steps; i++) {
        P.ctx.globalAlpha = 0.16 + i * 0.12;
        P.disc(s / 2, s / 2, r * (1 - i / (steps + 0.6)), null, color);
      }
      P.ctx.globalAlpha = 1;
    }, { outline: false });
  }

  const SPR = {};
  const reg = (name, cv) => { SPR[name] = { url: cv.toDataURL(), w: cv.width, h: cv.height, cv }; return SPR[name]; };

  /* ---------------- CHARACTERS (36×44 grid, shown at 2×) ----------------
     big head, tiny body, dark navy team hoodie; hair tells them apart */
  const HAIR = {
    dark: { s: '#0B0C1A', b: '#1E2140', h: '#3A4178', x: '#5C66A8' },
    blonde: { s: '#C4843A', b: '#EDBD6A', h: '#FFDB8A', x: '#FFF1C4' },
    purple: { s: '#46266C', b: '#7446A8', h: '#A56ED8', x: '#CFA2F4' },
  };
  const TEAM = [
    { id: 'jin', hair: 'dark', style: 'buns' },
    { id: 'mia', hair: 'blonde', style: 'twin' },
    { id: 'yuna', hair: 'purple', style: 'pony' },
  ];
  const FACES = ['normal', 'shock', 'panic', 'dizzy', 'focus', 'happy'];
  const CX = 18;

  function hairCap(P, H) {
    for (let y = 4; y <= 15; y++) {
      const t = (y + 0.5 - 15) / 11, hw = 13.6 * Math.sqrt(Math.max(0, 1 - t * t));
      P.r(Math.round(CX - hw), y, Math.round(hw * 2), 1, H.b);
    }
    P.r(11, 7, 6, 1, H.h); P.r(9, 8, 5, 1, H.h); P.r(8, 9, 2, 1, H.h); P.px(12, 7, H.x); P.px(13, 7, H.x);
    P.r(21, 7, 3, 1, H.h); P.r(23, 8, 2, 1, H.h);
    P.r(6, 13, 24, 1, H.s);
  }

  function backHair(P, m, H) {
    if (m.style === 'twin') {
      [4.5, 31.5].forEach((cx, i) => {
        P.disc(cx, 22, 3.3, 8.6, H.b);
        P.r(Math.round(cx) - (i ? 0 : 1), 17, 1, 8, H.h);
        P.r(Math.round(cx) - 2, 28, 4, 2, H.s);
      });
    } else if (m.style === 'pony') {
      P.disc(29.5, 14, 4.2, 10.5, H.b);
      P.r(31, 8, 1, 12, H.h); P.r(28, 21, 4, 3, H.s); P.px(30, 25, H.s);
    }
  }

  function frontHair(P, m, H) {
    hairCap(P, H);
    if (m.style === 'buns') {
      P.r(4, 15, 3, 10, H.b); P.r(29, 15, 3, 10, H.b); P.r(5, 25, 2, 1, H.b); P.r(29, 25, 2, 1, H.b);
      P.r(6, 16, 1, 9, H.s); P.r(29, 16, 1, 9, H.s);
      P.r(7, 14, 22, 3, H.b);
      [11, 17, 23].forEach(x => P.r(x, 15, 1, 2, H.s));
      P.r(9, 14, 3, 1, H.h); P.r(19, 14, 3, 1, H.h);
      P.disc(8.5, 5, 4.5, 4.5, H.b); P.disc(27.5, 5, 4.5, 4.5, H.b);
      P.r(6, 2, 2, 1, H.h); P.px(5, 3, H.h); P.r(25, 2, 2, 1, H.h); P.px(24, 3, H.h);
      P.r(6, 8, 5, 1, H.s); P.r(25, 8, 5, 1, H.s);
      P.r(11, 4, 2, 2, 'go1'); P.px(11, 4, 'go4'); P.r(23, 4, 2, 2, 'go1'); P.px(24, 4, 'go4');
    } else if (m.style === 'twin') {
      P.r(6, 14, 24, 2, H.b); P.r(7, 16, 10, 1, H.b); P.r(21, 16, 9, 1, H.b); P.r(8, 17, 3, 1, H.b); P.r(27, 17, 2, 1, H.b);
      P.px(13, 16, H.s); P.px(24, 16, H.s); P.r(17, 15, 1, 1, H.s);
      P.r(4, 14, 2, 8, H.b); P.r(30, 14, 2, 8, H.b);
      P.r(9, 14, 4, 1, H.h);
      P.r(2, 13, 4, 2, 'pk0'); P.r(30, 13, 4, 2, 'pk0'); P.px(3, 13, 'pk1'); P.px(31, 13, 'pk1');
      P.r(24, 11, 3, 1, 'bl3'); P.px(24, 11, 'bl4');
      P.px(18, 3, H.b); P.px(19, 2, H.b); P.px(20, 2, H.h); // ahoge
    } else if (m.style === 'pony') {
      P.r(6, 14, 24, 2, H.b); P.r(6, 16, 12, 1, H.b); P.r(7, 17, 4, 1, H.b); P.px(7, 18, H.b);
      P.r(22, 16, 8, 1, H.b); P.px(28, 17, H.b);
      P.px(18, 16, H.s); P.px(12, 16, H.s);
      P.r(4, 14, 3, 11, H.b); P.r(29, 14, 3, 8, H.b); P.r(6, 16, 1, 8, H.s);
      P.disc(24.5, 4, 3.4, 2.6, H.b); P.r(23, 2, 3, 1, H.h);
      P.r(26, 4, 3, 3, 'pk0'); P.px(26, 4, 'pk1');
      P.r(8, 14, 4, 1, H.h);
    }
  }

  const EYES = {
    normal: ['.xx.', 'xwxx', 'xxxx', 'xxbx', '.xx.'],
    shock: ['.xx.', 'xccx', 'xcxx', 'xccx', '.xx.'],
    dizzy: ['x..x', '.xx.', '.xx.', 'x..x', '....'],
    focus: ['....', 'xxxx', 'xwxx', '.xx.', '....'],
    happy: ['....', '.xx.', 'x..x', '....', '....'],
  };
  const PANIC_L = ['x...', '.x..', '..xx', '.x..', 'x...'];
  const PANIC_R = ['...x', '..x.', 'xx..', '..x.', '...x'];
  const MOUTH = {
    normal: ['.m..m.', '..mm..'],
    shock: ['..mm..', '.mddm.', '..mm..'],
    panic: ['.mmmm.', 'mddddm', 'mdppdm', '.mmmm.'],
    dizzy: ['m.m.m.', '.m.m.m'],
    focus: ['.mmmm.'],
    happy: ['mmmmmm', 'mddddm', '.mppm.', '..mm..'],
  };
  const EYE_L = { x: 'eye', w: 'wh', b: 'bl3', c: 'cr' };
  const MOUTH_L = { m: 'mouth', d: '#4A0C1E', p: 'pk0' };

  function drawFace(P, face) {
    if (face === 'panic') { P.map(PANIC_L, EYE_L, 11, 17); P.map(PANIC_R, EYE_L, 21, 17); }
    else { P.map(EYES[face], EYE_L, 11, 17); P.map(EYES[face], EYE_L, 21, 17); }
    P.map(MOUTH[face], MOUTH_L, 15, 23);
    if (face === 'normal' || face === 'happy' || face === 'shock') {
      P.r(8, 22, 3, 1, 'pk1'); P.r(25, 22, 3, 1, 'pk1'); P.px(8, 22, '#FFB3D1'); P.px(25, 22, '#FFB3D1');
    }
    if (face === 'panic' || face === 'dizzy') {
      P.r(33, 9, 1, 2, 'bl3'); P.px(32, 11, 'bl3'); P.px(33, 11, 'bl4'); P.px(32, 12, 'bl3');
    }
    if (face === 'panic') { P.r(12, 22, 1, 2, 'bl4'); P.r(23, 22, 1, 2, 'bl4'); }
  }

  function drawChar(m, face) {
    const H = HAIR[m.hair], up = face === 'happy' || face === 'panic';
    return make(36, 44, P => {
      backHair(P, m, H);
      // legs + shoes
      P.r(13, 37, 4, 3, 'un0'); P.r(19, 37, 4, 3, 'un0');
      P.r(12, 40, 5, 2, 'nv3'); P.r(19, 40, 5, 2, 'nv3'); P.px(13, 40, 'bl1'); P.px(20, 40, 'bl1');
      P.r(12, 42, 5, 1, 'cr2'); P.r(19, 42, 5, 1, 'cr2');
      // navy team hoodie
      P.r(11, 28, 14, 10, 'un1'); P.r(11, 28, 2, 10, 'un2'); P.r(11, 36, 14, 2, 'un0');
      P.r(15, 28, 6, 1, 'cr'); P.r(16, 29, 4, 1, 'cr'); P.r(17, 30, 2, 1, 'cr');
      P.r(18, 31, 1, 5, 'un0');
      P.px(13, 31, 'cr'); P.px(15, 31, 'cr'); P.r(13, 32, 3, 1, 'cr'); // tiny cat logo
      if (!up) {
        P.r(8, 29, 3, 6, 'un1'); P.r(25, 29, 3, 6, 'un1'); P.px(8, 29, 'un2'); P.px(9, 29, 'un2');
        P.r(8, 35, 3, 2, 'sk0'); P.r(25, 35, 3, 2, 'sk0');
      }
      // big round head
      P.disc(18, 17.5, 12.5, 11, 'sk0');
      P.r(12, 27, 12, 1, 'sk1'); P.px(9, 12, 'sk2'); P.px(10, 11, 'sk2');
      frontHair(P, m, H);
      drawFace(P, face);
      if (up) { // arms up: \(^o^)/
        P.r(5, 19, 3, 10, 'un1'); P.r(28, 19, 3, 10, 'un1'); P.r(8, 27, 3, 2, 'un1'); P.r(25, 27, 3, 2, 'un1');
        P.px(5, 19, 'un2'); P.r(5, 16, 3, 3, 'sk0'); P.r(28, 16, 3, 3, 'sk0');
      }
    });
  }

  TEAM.forEach(m => FACES.forEach(f => reg(`${m.id}_${f}`, drawChar(m, f))));

  window.PX = { C, col, make, fromMap, halo, reg, SPR, TEAM, FACES, outline, CHAR_SCALE: 2 };
})();
