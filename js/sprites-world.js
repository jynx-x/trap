/* TRAP ESCAPE — floating fantasy world sprites (intro + clear scenes) */
(() => {
  const { make, fromMap, halo, reg } = PX;

  function cloud(w, h) {
    return make(w, h, P => {
      const cy = h * 0.62;
      P.disc(w * 0.3, cy, w * 0.2, h * 0.34, 'cr');
      P.disc(w * 0.52, cy - h * 0.18, w * 0.22, h * 0.42, 'cr');
      P.disc(w * 0.72, cy, w * 0.18, h * 0.3, 'cr');
      P.r(Math.round(w * 0.14), Math.round(cy), Math.round(w * 0.72), Math.round(h * 0.28), 'cr');
      P.r(Math.round(w * 0.14), Math.round(cy + h * 0.14), Math.round(w * 0.72), Math.round(h * 0.14), 'bl4');
      P.r(Math.round(w * 0.42), Math.round(h * 0.18), 3, 1, 'wh');
    }, { outline: '#5AA6E6' });
  }
  reg('cloudL', cloud(46, 17));
  reg('cloudS', cloud(28, 11));

  function island(w, h, opt = {}) {
    return make(w, h, P => {
      const top = 3, grassH = 4, mid = w / 2;
      // earth body tapering to a point
      for (let y = top + grassH; y < h - 1; y++) {
        const k = (y - top - grassH) / (h - top - grassH - 1);
        const hw = Math.max(1, Math.round((w / 2 - 2) * (1 - k * k * 0.95) - k * 2));
        P.r(Math.round(mid - hw), y, hw * 2, 1, 'wd1');
        P.r(Math.round(mid + hw * 0.35), y, Math.round(hw * 0.65), 1, 'wd0');
        P.px(Math.round(mid - hw), y, 'wd2');
      }
      // rock bands
      for (let y = top + grassH + 3; y < h - 4; y += 4) P.r(Math.round(mid - w * 0.18), y, Math.round(w * 0.22), 1, 'wd2');
      // grass cap
      P.r(2, top, w - 4, grassH, 'gr1'); P.r(1, top + 1, w - 2, grassH - 1, 'gr1');
      P.r(3, top, w - 6, 1, 'gr3'); P.r(2, top + grassH - 1, w - 4, 1, 'gr0');
      for (let x = 3; x < w - 3; x += 5) { P.px(x, top - 1, 'gr2'); P.px(x + 2, top + grassH, 'gr0'); }
      if (opt.vines) [0.25, 0.7].forEach(p => P.r(Math.round(w * p), top + grassH, 1, 5, 'gr0'));
    });
  }
  reg('islandS', island(30, 22, { vines: true }));
  reg('islandM', island(48, 30, { vines: true }));
  reg('islandL', island(90, 40, { vines: true }));

  reg('castle', make(48, 44, P => {
    const wall = '#E4E7FB', wallS = '#B3BAE6';
    P.r(8, 20, 32, 22, wall); P.r(30, 20, 10, 22, wallS);
    for (let x = 8; x < 40; x += 4) P.r(x, 18, 2, 2, wall);
    // towers
    [[3, 12], [37, 12], [20, 6]].forEach(([x, y], i) => {
      const tw = i === 2 ? 10 : 8;
      P.r(x, y, tw, 42 - y, i === 1 ? wallS : wall);
      for (let k = 0; k < tw / 2 + 1; k++) P.r(x - 1 + k, y - 1 - k * 1.6, tw + 2 - k * 2, 2, k % 2 ? 'pu1' : 'bl1');
      P.r(x + tw / 2 - 1, y + 5, 2, 3, 'nv2'); P.px(x + tw / 2 - 1, y + 5, 'go2');
    });
    P.r(24, -2, 1, 5, 'mt1'); P.r(25, -2, 5, 3, 'rd2'); P.px(25, -2, 'rd3');
    P.r(20, 30, 8, 12, 'nv2'); P.r(21, 29, 6, 1, 'nv2'); P.r(23, 30, 2, 12, 'nv3');
    P.r(12, 26, 2, 3, 'bl2'); P.r(33, 26, 2, 3, 'bl1');
  }));

  reg('airship', make(46, 30, P => {
    P.disc(22, 9, 18, 8, 'pu1'); P.disc(20, 7, 14, 5, 'pu2'); P.r(12, 4, 10, 1, 'pu3');
    P.r(6, 8, 33, 2, 'go1'); P.r(8, 8, 3, 1, 'go4');
    P.r(40, 5, 4, 8, 'rd2'); P.px(41, 6, 'rd3');
    P.line(12, 16, 15, 21, 'wd0'); P.line(32, 16, 29, 21, 'wd0');
    P.r(11, 21, 22, 6, 'wd2'); P.r(11, 21, 22, 1, 'wd3'); P.r(11, 25, 22, 2, 'wd1');
    [15, 21, 27].forEach(x => P.r(x, 22, 2, 2, 'bl4'));
    P.r(3, 21, 2, 6, 'mt1'); P.r(1, 23, 6, 1, 'mt2');
  }));

  reg('tree', make(30, 36, P => {
    P.r(13, 22, 5, 13, 'wd1'); P.r(13, 22, 1, 13, 'wd2'); P.r(16, 22, 2, 13, 'wd0');
    P.disc(15, 14, 13, 10, 'gr0'); P.disc(14, 12, 12, 9, 'gr1'); P.disc(11, 9, 7, 5, 'gr2'); P.disc(9, 7, 3, 2, 'gr3');
    [[20, 16], [7, 16], [17, 7]].forEach(([x, y]) => P.px(x, y, 'gr3'));
    P.r(7, 34, 17, 1, 'gr0');
  }));

  reg('bush', make(22, 12, P => {
    P.disc(6, 7, 5, 4, 'gr1'); P.disc(12, 5.5, 6, 5, 'gr1'); P.disc(17, 7.5, 4, 3.5, 'gr1');
    P.r(2, 9, 18, 2, 'gr0'); P.px(10, 3, 'gr3'); P.px(11, 3, 'gr3'); P.px(5, 5, 'gr2');
    P.px(14, 6, 'pk0'); P.px(7, 8, 'pk0');
  }));

  ['pk0', 'wy0', 'cr', 'bl3'].forEach((c, i) => reg(`flower${i}`, fromMap([
    '.p.', 'pcp', '.p.', '.g.', 'gg.', '.g.',
  ], { p: c, c: i === 1 ? 'or1' : 'go1', g: 'gr0' })));

  reg('lamp', make(12, 30, P => {
    P.r(5, 9, 2, 20, 'wd1'); P.r(5, 9, 1, 20, 'wd2'); P.r(3, 27, 6, 2, 'wd0');
    P.r(3, 2, 6, 7, 'go2'); P.r(4, 3, 2, 4, 'go4'); P.r(2, 1, 8, 1, 'nv3'); P.r(2, 9, 8, 1, 'nv3'); P.px(5, 0, 'nv3');
  }));

  reg('flag', make(14, 22, P => {
    P.r(1, 1, 1, 20, 'mt1'); P.r(2, 2, 9, 6, 'bl2'); P.r(2, 2, 9, 1, 'bl4'); P.r(8, 7, 3, 2, 'bl2'); P.px(5, 4, 'go2'); P.px(6, 4, 'go2');
  }));

  reg('slime', make(16, 13, P => {
    P.disc(8, 8, 6.5, 5, 'bl2'); P.disc(8, 7, 5, 4, 'bl3'); P.px(5, 4, 'wh'); P.px(6, 4, 'bl4');
    P.r(5, 7, 1, 2, 'nv0'); P.r(10, 7, 1, 2, 'nv0'); P.r(7, 10, 2, 1, 'nv2');
    P.r(3, 12, 10, 1, 'bl1');
  }));

  reg('sun', make(24, 24, P => { P.disc(12, 12, 10, 10, 'go1'); P.disc(10, 10, 6, 6, 'go3'); P.disc(9, 9, 2.5, 2.5, 'go4'); }, { outline: 'go0' }));

  reg('portal', make(46, 62, P => {
    P.disc(23, 31, 21, 29, 'go0'); P.disc(23, 31, 19, 27, 'go1'); P.disc(22, 30, 17, 25, 'go3');
    P.disc(23, 31, 14, 22, 'bl3'); P.disc(23, 31, 10, 17, 'bl4'); P.disc(23, 31, 6, 11, 'cr');
    P.r(23, 3, 1, 3, 'wh'); P.px(9, 20, 'go4'); P.px(8, 22, 'go4');
    P.r(4, 56, 38, 5, 'st4'); P.r(4, 56, 38, 1, 'mt3');
  }));

  reg('grassTop', make(16, 10, P => {
    P.r(0, 3, 16, 7, 'gr1'); P.r(0, 2, 16, 1, 'gr2');
    [[1, 1], [4, 0], [5, 1], [9, 1], [12, 0], [13, 1]].forEach(([x, y]) => P.r(x, y, 1, 3 - y, 'gr2'));
    P.px(4, 0, 'gr3'); P.px(12, 0, 'gr3'); P.r(0, 8, 16, 2, 'gr0'); P.px(7, 5, 'gr2'); P.px(11, 6, 'gr0');
  }, { outline: false }));
  reg('dirt', make(16, 16, P => {
    P.r(0, 0, 16, 16, 'wd1');
    [[2, 3], [9, 2], [13, 9], [5, 11], [11, 14]].forEach(([x, y]) => { P.r(x, y, 2, 1, 'wd0'); P.px(x, y - 1, 'wd2'); });
    P.px(7, 7, 'st4'); P.px(8, 7, 'st3');
  }, { outline: false }));

  reg('sparkle', fromMap(['..w..', '..w..', 'wwWww', '..w..', '..w..'], { w: 'go3', W: 'wh' }, { outline: false }));
  reg('haloSun', halo(40, 'go2', 5));
  reg('haloPortal', halo(44, 'go1', 5));
  reg('haloLamp', halo(12, 'go2'));
})();
