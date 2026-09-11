/* TRAP ESCAPE — floating fantasy world sprites (intro + HQ scenes) */
(() => {
  const { make, fromMap, halo, reg } = PX;
  const ST = { m: '#4E557F', b: '#7A82B0', h: '#A3AAD3', s: '#636A98' }; // light cliff stone

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

  // floating island: grass cap, stone-block cliff body tapering to a point
  function island(w, h) {
    return make(w, h, P => {
      const top = 3, gh = 4, mid = w / 2;
      for (let y = top + gh; y < h - 1; y++) {
        const k = (y - top - gh) / (h - top - gh - 1), row = y - top - gh;
        const hw = Math.max(1, Math.round((w / 2 - 2) * (1 - k * k * 0.95) - k * 2)), x0 = Math.round(mid - hw);
        P.r(x0, y, hw * 2, 1, ST.b);
        P.r(Math.round(mid + hw * 0.4), y, Math.round(hw * 0.6), 1, ST.s);
        P.r(x0, y, 2, 1, ST.h);
        if (row % 4 === 3) P.r(x0, y, hw * 2, 1, ST.m);
        else for (let x = x0 + 4 + ((row >> 2) % 2) * 3; x < x0 + hw * 2 - 1; x += 7) P.px(x, y, ST.m);
      }
      P.r(2, top, w - 4, gh, 'gr1'); P.r(1, top + 1, w - 2, gh - 1, 'gr1');
      P.r(3, top, w - 6, 1, 'gr3'); P.r(2, top + gh - 1, w - 4, 1, 'gr0');
      for (let x = 3; x < w - 3; x += 5) { P.px(x, top - 1, 'gr2'); P.r(x + 2, top + gh, 1, 2, 'gr0'); }
    });
  }
  reg('islandS', island(30, 22));
  reg('islandM', island(48, 30));
  reg('islandL', island(90, 40));

  // light-stone cliff face tile for the foreground ground
  reg('cliff', make(24, 16, P => {
    P.r(0, 0, 24, 16, ST.b);
    P.r(0, 0, 24, 1, ST.m); P.r(0, 8, 24, 1, ST.m);
    P.r(0, 1, 1, 7, ST.m); P.r(12, 1, 1, 7, ST.m); P.r(6, 9, 1, 7, ST.m); P.r(18, 9, 1, 7, ST.m);
    P.r(1, 1, 11, 1, ST.h); P.r(13, 1, 11, 1, ST.h); P.r(0, 9, 6, 1, ST.h); P.r(7, 9, 11, 1, ST.h); P.r(19, 9, 5, 1, ST.h);
    P.r(1, 7, 11, 1, ST.s); P.r(13, 7, 11, 1, ST.s); P.r(0, 15, 24, 1, ST.s);
    P.px(4, 4, ST.s); P.px(16, 3, ST.s); P.px(10, 12, ST.s); P.px(21, 13, ST.h);
  }, { outline: false }));

  reg('castle', make(50, 52, P => {
    const wall = '#E4E7FB', wallS = '#B3BAE6';
    P.r(8, 26, 34, 24, wall); P.r(32, 26, 10, 24, wallS);
    for (let x = 8; x < 42; x += 4) P.r(x, 24, 2, 2, wall);
    [[3, 18, 8], [39, 18, 8], [20, 12, 10]].forEach(([x, y, tw], i) => {
      P.r(x, y, tw, 50 - y, i === 1 ? wallS : wall);
      if (i !== 1) P.r(x + tw - 2, y, 2, 50 - y, wallS);
      for (let k = 0; k < tw / 2 + 1; k++) P.r(x - 1 + k, Math.round(y - 1 - k * 1.7), tw + 2 - k * 2, 2, k % 2 ? 'bl2' : 'bl1');
      P.r(x + tw / 2 - 1, y + 5, 2, 3, 'nv2'); P.px(x + tw / 2 - 1, y + 5, 'go2');
    });
    P.r(25, 0, 1, 5, 'mt1'); P.r(26, 0, 6, 4, 'pk0'); P.px(27, 1, 'cr'); P.px(29, 1, 'cr'); P.r(27, 2, 3, 1, 'cr');
    P.r(21, 38, 8, 12, 'nv2'); P.r(22, 37, 6, 1, 'nv2'); P.r(24, 38, 2, 12, 'nv3');
    P.r(12, 32, 2, 3, 'go2'); P.r(35, 32, 2, 3, 'go1');
  }));

  // white team blimp (the "VISUAL SYSTEMS SQUAD" lettering is DOM)
  reg('blimp', make(66, 30, P => {
    P.disc(32, 12, 28, 10.5, 'mt2'); P.disc(31, 11, 27, 9.5, 'cr2'); P.disc(28, 9, 20, 6, 'cr'); P.r(18, 4, 12, 1, 'wh');
    [[14, 15], [47, 48]].forEach(([a, b]) => {
      for (let x = a; x <= b; x++) {
        const hh = 10.5 * Math.sqrt(Math.max(0, 1 - ((x + 0.5 - 32) / 28) ** 2));
        P.r(x, Math.round(12 - hh), 1, Math.round(hh * 2), 'bl2');
      }
    });
    P.r(56, 3, 6, 5, 'bl2'); P.r(58, 1, 3, 3, 'bl2'); P.r(56, 16, 6, 5, 'bl2'); P.r(58, 20, 3, 3, 'bl2'); P.r(60, 9, 5, 5, 'bl1');
    P.r(6, 8, 7, 7, 'bl1'); P.r(7, 9, 5, 5, 'bl4'); P.r(8, 10, 3, 4, 'nv3'); P.px(9, 10, 'sk0');
    P.r(22, 22, 20, 5, 'mt1'); P.r(22, 22, 20, 1, 'mt3'); [25, 30, 35].forEach(x => P.r(x, 23, 3, 2, 'go2'));
    P.r(26, 20, 1, 2, 'mt0'); P.r(38, 20, 1, 2, 'mt0');
  }));

  reg('pine', make(20, 32, P => {
    P.r(9, 25, 3, 6, 'wd1'); P.px(9, 25, 'wd2');
    [[2, 3], [7, 6], [13, 8], [19, 9]].forEach(([top, hw]) => {
      for (let i = 0; i < 7; i++) {
        const w = Math.round(1 + hw * i / 6);
        P.r(10 - w, top + i, w * 2, 1, 'gr0'); P.r(10 - w, top + i, Math.max(1, w - 1), 1, 'gr1');
      }
      P.px(8, top + 3, 'gr2'); P.px(7, top + 5, 'gr3');
    });
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

  // pink flag with a white cat face
  reg('catFlag', make(18, 26, P => {
    P.r(2, 1, 2, 24, 'mt1'); P.px(2, 1, 'mt3'); P.r(1, 0, 4, 2, 'go1');
    P.r(4, 3, 12, 9, 'pk0'); P.r(4, 3, 12, 1, 'pk1'); P.r(12, 12, 4, 1, 'pk0'); P.r(4, 11, 7, 1, '#D94F93');
    P.map(['c...c', 'ccccc', 'cncnc', 'ccccc'], { c: 'cr', n: 'nv1' }, 7, 5);
  }));

  // white team cat mascot
  const CAT = ['.w........w.', '.ww......ww.', '.wpw....wpw.', 'wwwwwwwwwwww', 'wwwwwwwwwwww',
    'wwkwwwwwwkww', 'wwkwwwwwwkww', 'wpwwwkkwwwpw', '.wwwwwwwwww.', '..wwwwwwww..', '.swwwwwwwws.', '.swwwwwwwws.', '.ss.wwww.ss.'];
  const CAT_L = { w: 'cr', s: 'cr2', p: 'pk1', k: 'nv0', r: 'rd1' };
  reg('cat', fromMap(CAT, CAT_L));
  const shock = CAT.slice();
  shock[5] = 'wkkwwwwwwkkw'; shock[6] = 'wkkwwwwwwkkw'; shock[7] = 'wpwwwrrwwwpw'; shock[8] = '.wwwwrrwwww.';
  reg('catShock', fromMap(shock, CAT_L));

  reg('moon', make(20, 20, P => {
    P.disc(10, 10, 8.5, 8.5, 'go3'); P.disc(7, 11, 2.5, 3, 'go4');
    P.ctx.globalCompositeOperation = 'destination-out'; P.disc(14, 7, 7.5, 7.5, '#000'); P.ctx.globalCompositeOperation = 'source-over';
  }, { outline: false }));

  reg('sun', make(24, 24, P => { P.disc(12, 12, 10, 10, 'go1'); P.disc(10, 10, 6, 6, 'go3'); P.disc(9, 9, 2.5, 2.5, 'go4'); }, { outline: 'go0' }));

  // VISUAL SYSTEMS HQ gate (sign text is DOM)
  reg('hqGate', make(74, 54, P => {
    const L = '#D5D9F2', M = '#B3B9E2', D = '#8C93C6';
    P.r(14, 46, 46, 3, M); P.r(10, 49, 54, 3, D); P.r(14, 46, 46, 1, L); P.r(10, 49, 54, 1, M);
    P.r(6, 18, 62, 28, M); P.r(6, 18, 62, 2, L);
    for (let y = 24; y < 46; y += 6) P.r(6, y, 62, 1, D);
    for (let y = 24, k = 0; y < 46; y += 6, k++) for (let x = 10 + (k % 2) * 5; x < 66; x += 10) P.r(x, y + 1, 1, 5, D);
    [4, 58].forEach(x => { P.r(x, 14, 12, 32, L); P.r(x + 9, 14, 3, 32, D); P.r(x - 1, 14, 14, 3, M); P.r(x - 1, 44, 14, 2, D); });
    for (let i = 0; i < 8; i++) P.r(2 + i * 2, 13 - i, 70 - i * 4, 1, i % 2 ? 'bl2' : 'bl1');
    P.r(2, 13, 70, 1, 'bl0'); P.r(18, 7, 10, 1, 'bl4');
    P.r(13, 15, 48, 8, 'nv1'); P.r(13, 15, 48, 1, 'nv3');
    P.r(25, 27, 24, 19, 'bl1'); P.r(27, 25, 20, 2, 'bl1'); P.r(27, 28, 20, 18, 'bl3'); P.r(30, 30, 14, 16, 'bl4'); P.r(33, 33, 8, 13, 'cr');
    [[7, 20], [61, 20]].forEach(([x, y]) => { P.r(x, y, 4, 5, 'go2'); P.px(x + 1, y + 1, 'go4'); });
  }));

  // rope-bridge pieces + chasm spikes
  reg('plank', make(12, 8, P => { P.r(1, 1, 10, 6, 'wd2'); P.r(1, 1, 10, 1, 'wd3'); P.r(1, 6, 10, 1, 'wd1'); P.px(3, 3, 'wd0'); P.px(8, 4, 'wd0'); }));
  reg('post', make(8, 22, P => { P.r(2, 3, 4, 18, 'wd1'); P.r(2, 3, 1, 18, 'wd2'); P.r(1, 1, 6, 3, 'wd2'); P.r(1, 1, 6, 1, 'wd3'); }));
  reg('spikeTall', make(14, 32, P => {
    for (let y = 1; y < 28; y++) { const hw = Math.floor((y - 1) / 5); P.r(6 - hw, y, hw + 1, 1, 'mt2'); P.r(7, y, hw + 1, 1, 'mt1'); }
    P.r(6, 3, 1, 5, 'mt3'); P.r(1, 28, 12, 2, 'mt0');
  }));

  reg('grassTop', make(16, 10, P => {
    P.r(0, 3, 16, 7, 'gr1'); P.r(0, 2, 16, 1, 'gr2');
    [[1, 1], [4, 0], [5, 1], [9, 1], [12, 0], [13, 1]].forEach(([x, y]) => P.r(x, y, 1, 3 - y, 'gr2'));
    P.px(4, 0, 'gr3'); P.px(12, 0, 'gr3'); P.r(0, 8, 16, 2, 'gr0'); P.px(7, 5, 'gr2'); P.px(11, 6, 'gr0');
  }, { outline: false }));

  reg('sparkle', fromMap(['..w..', '..w..', 'wwWww', '..w..', '..w..'], { w: 'go3', W: 'wh' }, { outline: false }));
  reg('haloSun', halo(40, 'go2', 5));
  reg('haloPortal', halo(44, 'go1', 5));
  reg('haloLamp', halo(12, 'go2'));
  reg('haloMoon', halo(26, 'go3'));
})();
