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
    mouth: '#8E1F3A',
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

  /* ---------------- CHARACTERS ---------------- */
  const HAIR = {
    dark:   { s: '#0E0F1E', b: '#1E2038', h: '#3B3F6E' },
    brown:  { s: '#5E3220', b: '#8C4E32', h: '#B76C43' },
    blonde: { s: '#C28A42', b: '#E8B86E', h: '#FFD98C' },
    purple: { s: '#4A2870', b: '#6D3F9D', h: '#9D61C8' },
  };
  const TEAM = [
    { id: 'jin', hair: 'dark', style: 'spiky' },
    { id: 'mia', hair: 'blonde', style: 'pony' },
    { id: 'leo', hair: 'brown', style: 'bob' },
    { id: 'yuna', hair: 'purple', style: 'buns' },
  ];
  const FACES = ['normal', 'shock', 'panic', 'dizzy', 'focus', 'happy'];

  function drawHair(P, style, H) {
    // base cap over the head
    P.r(5, 4, 14, 1, H.b); P.r(4, 5, 16, 4, H.b);
    P.r(4, 9, 16, 1, H.s);
    if (style === 'spiky') {
      [[6, 3], [7, 2], [10, 2], [11, 1], [14, 2], [15, 3], [17, 3], [18, 4], [5, 3]].forEach(([x, y]) => P.r(x, y, 1, 4 - y + 1, H.b));
      P.r(4, 10, 1, 3, H.b); P.r(19, 10, 1, 3, H.b);
      P.r(5, 10, 3, 1, H.b); P.r(12, 10, 3, 1, H.b); P.px(9, 10, H.s);
      P.r(7, 5, 4, 1, H.h); P.px(11, 2, H.h); P.px(7, 3, H.h);
    } else if (style === 'pony') {
      P.r(6, 3, 12, 1, H.b);
      P.r(20, 6, 2, 3, H.b); P.r(20, 9, 3, 4, H.b); P.r(21, 13, 2, 2, H.s); P.px(20, 8, H.h);
      P.r(4, 10, 1, 4, H.b); P.r(19, 10, 1, 3, H.b);
      P.r(5, 10, 5, 1, H.b); P.r(13, 10, 5, 1, H.b); P.px(10, 10, H.s);
      P.r(20, 5, 1, 1, '#FF70B6'); P.r(19, 6, 1, 2, '#FF70B6'); // scrunchie
      P.r(7, 5, 5, 1, H.h); P.r(6, 6, 2, 1, H.h);
    } else if (style === 'bob') {
      P.r(6, 3, 12, 1, H.b);
      P.r(3, 7, 2, 9, H.b); P.r(19, 7, 2, 9, H.b); P.r(3, 14, 2, 2, H.s); P.r(19, 14, 2, 2, H.s);
      P.r(5, 10, 14, 1, H.b); P.px(9, 10, H.s); P.px(14, 10, H.s);
      P.r(7, 5, 5, 1, H.h); P.r(4, 8, 1, 3, H.h);
    } else if (style === 'buns') {
      P.disc(4.5, 3.5, 3, 3, H.b); P.disc(19.5, 3.5, 3, 3, H.b);
      P.px(3, 2, H.h); P.px(18, 2, H.h); P.px(4, 2, H.h);
      P.r(6, 3, 12, 1, H.b);
      P.r(4, 10, 1, 4, H.b); P.r(19, 10, 1, 4, H.b);
      P.r(5, 10, 4, 1, H.b); P.r(15, 10, 4, 1, H.b); P.r(10, 10, 4, 1, H.b);
      P.r(8, 5, 5, 1, H.h); P.r(7, 6, 2, 1, H.h);
    }
  }

  function drawFace(P, face) {
    const E = 'nv0', blush = () => { P.r(5, 14, 2, 1, 'pk1'); P.r(17, 14, 2, 1, 'pk1'); };
    if (face === 'normal') {
      P.r(7, 11, 2, 3, E); P.r(15, 11, 2, 3, E); P.px(7, 11, 'cr'); P.px(15, 11, 'cr');
      P.r(11, 15, 2, 1, 'mouth'); blush();
    } else if (face === 'shock') {
      P.r(7, 11, 2, 3, E); P.r(15, 11, 2, 3, E); P.r(7, 11, 1, 2, 'cr'); P.r(15, 11, 1, 2, 'cr');
      P.r(11, 15, 2, 2, 'mouth');
    } else if (face === 'panic') {
      P.r(6, 10, 4, 5, E); P.r(14, 10, 4, 5, E);
      P.r(7, 11, 2, 3, 'cr'); P.r(15, 11, 2, 3, 'cr'); P.px(8, 12, E); P.px(15, 12, E);
      P.r(10, 15, 4, 2, 'mouth'); P.r(11, 16, 2, 1, 'rd3');
      P.r(21, 9, 1, 2, 'bl3'); P.px(22, 11, 'bl4'); P.px(21, 11, 'bl3'); // sweat
    } else if (face === 'dizzy') {
      [[6, 11], [8, 11], [7, 12], [6, 13], [8, 13]].forEach(([x, y]) => { P.px(x, y, E); P.px(x + 9, y, E); });
      P.px(10, 16, 'mouth'); P.px(11, 15, 'mouth'); P.px(12, 16, 'mouth'); P.px(13, 15, 'mouth');
      P.r(21, 8, 1, 2, 'bl3');
    } else if (face === 'focus') {
      P.r(7, 12, 2, 2, E); P.r(15, 12, 2, 2, E); P.px(7, 12, 'cr'); P.px(15, 12, 'cr');
      P.r(6, 10, 2, 1, E); P.px(8, 11, E); P.r(16, 10, 2, 1, E); P.px(15, 11, E);
      P.r(11, 15, 2, 1, 'mouth');
    } else if (face === 'happy') {
      P.px(6, 13, E); P.r(7, 12, 2, 1, E); P.px(9, 13, E);
      P.px(14, 13, E); P.r(15, 12, 2, 1, E); P.px(17, 13, E);
      P.r(10, 15, 4, 1, 'mouth'); P.r(11, 16, 2, 1, 'rd3'); blush();
    }
  }

  function drawChar(member, face) {
    const H = HAIR[member.hair], up = face === 'happy';
    return make(24, 29, P => {
      // shoes + legs
      P.r(8, 25, 3, 1, 'un0'); P.r(13, 25, 3, 1, 'un0');
      P.r(7, 26, 4, 2, 'bl1'); P.r(13, 26, 4, 2, 'bl1'); P.px(7, 26, 'bl3'); P.px(13, 26, 'bl3');
      // torso: dark navy team uniform
      P.r(7, 18, 10, 7, 'un1'); P.r(7, 18, 1, 7, 'un2'); P.r(7, 23, 10, 2, 'un0');
      P.r(10, 18, 4, 1, 'un2'); P.px(11, 19, 'cr'); P.px(12, 19, 'cr'); // collar
      P.r(13, 20, 2, 2, 'bl3'); P.px(13, 20, 'bl4'); // team logo
      // arms
      if (up) {
        P.r(4, 14, 2, 5, 'un1'); P.r(18, 14, 2, 5, 'un1'); P.r(5, 17, 2, 2, 'un1'); P.r(17, 17, 2, 2, 'un1');
        P.r(4, 12, 2, 2, 'sk0'); P.r(18, 12, 2, 2, 'sk0');
      } else {
        P.r(5, 19, 2, 4, 'un1'); P.r(17, 19, 2, 4, 'un1'); P.px(5, 19, 'un2');
        P.r(5, 23, 2, 1, 'sk0'); P.r(17, 23, 2, 1, 'sk0');
      }
      // head (big, round)
      P.r(5, 7, 14, 11, 'sk0'); P.r(4, 8, 16, 9, 'sk0');
      P.r(5, 17, 14, 1, 'sk1'); P.r(4, 16, 1, 1, 'sk1'); P.r(19, 16, 1, 1, 'sk1');
      P.px(6, 8, 'sk2');
      drawHair(P, member.style, H);
      drawFace(P, face);
    });
  }

  TEAM.forEach(m => FACES.forEach(f => reg(`${m.id}_${f}`, drawChar(m, f))));

  window.PX = { C, col, make, fromMap, halo, reg, SPR, TEAM, FACES, outline };
})();
