/* TRAP ESCAPE — icons + dungeon sprites */
(() => {
  const { make, fromMap, halo, reg } = PX;

  /* ---------- ICONS ---------- */
  const HEART = ['.rr.rr.', 'rwrrrrr', 'rrrrrrR', '.rrrrR.', '..rrR..', '...R...'];
  reg('heart', fromMap(HEART, { r: 'rd2', w: 'wh', R: 'rd0' }));
  reg('heartEmpty', fromMap(HEART, { r: 'nv3', w: 'nv3', R: 'nv2' }));

  reg('key', fromMap([
    '.yyy...........',
    'yhyyy..........',
    'yy.yyyyyyyyyyyy',
    'yyyyygggggggggg',
    '.ggg......g.gg.',
    '..........g..g.',
  ], { y: 'go2', h: 'go4', g: 'go0' }));

  reg('lock', fromMap([
    '..mmmmmmm..',
    '.mh.....mm.',
    '.m.......m.',
    '.m.......m.',
    'yyyyyyyyyyy',
    'yhhyyyyyyyy',
    'yhyyyoyyyyg',
    'yyyyooyyyyg',
    'yyyyyoyyyyg',
    'yyyyyoyyyyg',
    'ggggggggggg',
  ], { m: 'mt1', h: 'mt3', y: 'go1', o: 'nv0', g: 'go0' }));

  const STAR = [
    '.....y.....',
    '....yyy....',
    '....yhy....',
    'yyyyyhyyyyy',
    '.yyyyyyyyy.',
    '..yyyyyyy..',
    '..yyyyyyy..',
    '.yyyG.Gyyy.',
    '.yyG...Gyy.',
    '.yG.....Gy.',
  ];
  reg('star', fromMap(STAR, { y: 'go1', h: 'go4', G: 'go0' }));
  reg('starEmpty', fromMap(STAR, { y: 'nv3', h: 'nv3', G: 'nv2' }));

  reg('crown', fromMap([
    '.......h.......',
    '.y....yyy....y.',
    'yhy...yry...yhy',
    'yyy..yyyyy..yyy',
    'yyyy.yyhyy.yyyy',
    'yyyyyyyyyyyyyyy',
    'yybbyyrryybbyyy',
    'yhyyyyyyyyyyyyy',
    'ggggggggggggggg',
  ], { y: 'go1', h: 'go4', r: 'rd2', b: 'bl3', g: 'go0' }));

  reg('siren', fromMap([
    '....rrrrr....',
    '...rwwrrrr...',
    '..rwwrrrrrr..',
    '..rwrrrrrrr..',
    '..rrrrrrrrR..',
    '..rrrrrrrRR..',
    '.mmmmmmmmmmm.',
    'mmhmmmmmmmmmm',
    'ttttttttttttt',
  ], { r: 'rd2', w: 'cr', R: 'rd0', m: 'mt1', h: 'mt3', t: 'mt0' }));

  reg('skull', fromMap([
    '..wwwwwwww..',
    '.wwwwwwwwwws',
    'wwwwwwwwwwws',
    'wwnnwwwwnnws',
    'wwnnnwwnnnws',
    'wwwwwnnwwwws',
    '.wwwwwwwwws.',
    '..wnwnwnws..',
    '..wwwwwwww..',
  ], { w: 'cr', s: 'cr2', n: 'nv2' }));

  reg('squad', fromMap([
    'bbbbbbbbb',
    'bhbbybbbb',
    'bhbyyybbb',
    'bbyyyyybb',
    'bbbyyybbb',
    'bbbbybbbb',
    '.bbbbbbb.',
    '..bbbbb..',
    '...bbb...',
    '....b....',
  ], { b: 'bl1', h: 'bl4', y: 'go2' }));

  reg('check', fromMap([
    '........g', '.......gg', '......gg.', 'g....gg..', 'gg..gg...', '.gggg....', '..gg.....',
  ], { g: 'gr2' }));

  reg('spkOn', fromMap([
    '....o.......', '...oo..o....', 'ooooo...o...', 'ooooo.o..o..',
    'ooooo.o..o..', 'ooooo...o...', '...oo..o....', '....o.......',
  ], { o: 'nv0' }, { outline: false }));
  reg('spkOff', fromMap([
    '....o.......', '...oo.......', 'ooooo.r...r.', 'ooooo..r.r..',
    'ooooo...r...', 'ooooo..r.r..', '...oo.r...r.', '....o.......',
  ], { o: 'nv0', r: 'rd0' }, { outline: false }));

  const RUNES = {
    star: ['....x....', '....x....', '...xxx...', 'xxxxxxxxx', '.xxxxxxx.', '..xxxxx..', '..xxxxx..', '.xxx.xxx.', '.xx...xx.'],
    diamond: ['....x....', '...xxx...', '..xxxxx..', '.xxxxxxx.', 'xxxxxxxxx', '.xxxxxxx.', '..xxxxx..', '...xxx...', '....x....'],
    circle: ['..xxxxx..', '.xxxxxxx.', 'xxxxxxxxx', 'xxxxxxxxx', 'xxxxxxxxx', 'xxxxxxxxx', 'xxxxxxxxx', '.xxxxxxx.', '..xxxxx..'],
    tri: ['....x....', '...xxx...', '...xxx...', '..xxxxx..', '..xxxxx..', '.xxxxxxx.', '.xxxxxxx.', 'xxxxxxxxx', 'xxxxxxxxx'],
  };
  Object.entries(RUNES).forEach(([k, rows]) => {
    reg(`rune_${k}`, fromMap(rows, { x: 'bl4' }));
    reg(`runeGold_${k}`, fromMap(rows, { x: 'go2' }));
    reg(`runeDim_${k}`, fromMap(rows, { x: 'st4' }, { outline: 'st0' }));
  });

  /* ---------- DUNGEON TILES (no outline, tiled) ---------- */
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  reg('wall', make(32, 16, P => {
    P.r(0, 0, 32, 16, 'st1');
    P.r(0, 0, 32, 1, 'st0'); P.r(0, 8, 32, 1, 'st0');
    P.r(0, 1, 1, 7, 'st0'); P.r(16, 9, 1, 7, 'st0');
    P.r(1, 1, 15, 1, 'st2'); P.r(17, 1, 15, 1, 'st2'); P.r(0, 9, 16, 1, 'st2'); P.r(17, 9, 15, 1, 'st2');
    P.r(1, 7, 15, 1, '#252B5C'); P.r(17, 7, 15, 1, '#252B5C'); P.r(0, 15, 16, 1, '#252B5C'); P.r(17, 15, 15, 1, '#252B5C');
    for (let i = 0; i < 14; i++) P.px(Math.floor(rnd() * 32), 1 + Math.floor(rnd() * 14), rnd() > 0.5 ? 'st2' : 'st0');
    P.line(22, 3, 25, 6, 'st0'); P.px(5, 11, 'pu0'); P.px(6, 11, 'pu0');
  }, { outline: false }));

  reg('floor', make(16, 16, P => {
    P.r(0, 0, 16, 16, 'st2');
    P.r(0, 0, 16, 1, 'st1'); P.r(0, 0, 1, 16, 'st1');
    P.r(1, 1, 15, 1, 'st3'); P.r(1, 1, 1, 15, 'st3');
    for (let i = 0; i < 6; i++) P.px(2 + Math.floor(rnd() * 13), 2 + Math.floor(rnd() * 13), 'st1');
  }, { outline: false }));

  reg('lava', make(32, 12, P => {
    P.r(0, 0, 32, 12, 'or0');
    for (let x = 0; x < 32; x++) {
      const y = Math.round(1.5 + Math.sin(x / 32 * Math.PI * 4) * 1.2);
      P.r(x, 0, 1, y, 'go3'); P.px(x, y, 'or2'); P.px(x, y + 1, 'or1');
    }
    P.r(0, 8, 32, 4, 'rd1'); P.r(0, 10, 32, 2, 'rd0');
    [[5, 5], [18, 6], [27, 4], [11, 8]].forEach(([x, y]) => { P.r(x, y, 2, 1, 'go2'); P.px(x, y - 1, 'go4'); });
  }, { outline: false }));

  reg('spike', make(12, 16, P => {
    for (let y = 0; y < 12; y++) {
      const hw = Math.floor(y / 2.2);
      P.r(5 - hw, 1 + y, hw + 1, 1, 'mt2'); P.r(6, 1 + y, hw + 1, 1, 'mt1');
    }
    P.px(5, 2, 'mt3'); P.px(5, 3, 'mt3');
    P.r(1, 13, 10, 2, 'mt0');
  }));

  reg('chain', make(7, 10, P => {
    P.r(2, 0, 3, 1, 'mt1'); P.r(1, 1, 1, 3, 'mt1'); P.r(5, 1, 1, 3, 'mt1'); P.r(2, 4, 3, 1, 'mt1');
    P.px(2, 1, 'mt3'); P.r(3, 5, 1, 4, 'mt2');
  }, { outline: false }));

  /* ---------- LIGHTS ---------- */
  const FLAME = [
    '....o.....', '...oo.....', '...oyo....', '..oyyo....', '..oyyoo...', '.ooyYyo...',
    '.oyYYYyo..', '.oyYWYyo..', '.oyYWYyo..', '..oyYyo...', '...ooo....',
  ];
  const FLAME_B = FLAME.map(r => [...r].reverse().join('')).map(r => r.slice(1) + '.');
  reg('flame', make(24, 13, P => {
    const L = { o: 'or1', y: 'go1', Y: 'go3', W: 'cr' };
    P.map(FLAME, L, 1, 1); P.map(FLAME_B, L, 13, 1);
  }, { outline: 'rd0' }));
  reg('torch', make(10, 16, P => {
    P.r(1, 1, 8, 2, 'mt1'); P.r(2, 3, 6, 2, 'mt0'); P.px(2, 1, 'mt3');
    P.r(4, 5, 2, 10, 'wd1'); P.px(4, 5, 'wd3');
  }));
  reg('haloFire', halo(22, 'or1'));
  reg('haloRed', halo(30, 'rd2'));
  reg('haloBlue', halo(20, 'bl3'));
  reg('haloPurple', halo(20, 'pu2'));
  reg('haloGold', halo(34, 'go2'));

  reg('crystal', make(14, 18, P => {
    P.r(5, 2, 4, 14, 'pu2'); P.r(6, 1, 2, 1, 'pu2'); P.r(5, 2, 1, 14, 'pu3'); P.r(8, 3, 1, 13, 'pu0');
    P.r(1, 8, 3, 8, 'bl2'); P.px(2, 7, 'bl2'); P.r(1, 8, 1, 8, 'bl4');
    P.r(10, 6, 3, 10, 'pu1'); P.px(11, 5, 'pu1'); P.r(10, 6, 1, 10, 'pu3');
    P.r(0, 15, 14, 2, 'st2'); P.px(6, 4, 'wh');
  }));

  /* ---------- SEARCHABLE PROPS ---------- */
  reg('rock', make(20, 13, P => {
    P.disc(10, 7.5, 9, 5.5, 'st3'); P.disc(8, 5, 5, 3, 'st4');
    P.r(3, 10, 15, 2, 'st2'); P.px(7, 3, 'mt3'); P.px(8, 3, 'mt3'); P.line(13, 5, 15, 8, 'st2');
  }));
  reg('crate', make(20, 18, P => {
    P.r(1, 1, 18, 16, 'wd2'); P.r(1, 1, 18, 2, 'wd3'); P.r(1, 15, 18, 2, 'wd1');
    P.r(1, 1, 2, 16, 'wd3'); P.r(17, 1, 2, 16, 'wd1');
    for (let i = 0; i < 12; i++) P.r(3 + i, 3 + i, 2, 1, 'wd1');
    P.r(3, 8, 14, 1, 'wd1');
    [[2, 2], [17, 2], [2, 15], [17, 15]].forEach(([x, y]) => P.px(x, y, 'mt2'));
  }));
  reg('barrel', make(16, 20, P => {
    P.r(3, 1, 10, 18, 'wd2'); P.r(2, 3, 12, 14, 'wd2');
    P.r(2, 4, 12, 2, 'mt1'); P.r(2, 14, 12, 2, 'mt1'); P.r(2, 4, 12, 1, 'mt2');
    P.r(5, 2, 1, 16, 'wd3'); P.r(11, 2, 2, 16, 'wd1'); P.r(3, 1, 10, 1, 'wd3');
  }));
  reg('planks', make(26, 12, P => {
    P.r(1, 7, 23, 3, 'wd2'); P.r(1, 7, 23, 1, 'wd3'); P.px(20, 8, 'nv2');
    P.r(3, 4, 20, 3, 'wd1'); P.r(3, 4, 20, 1, 'wd2'); P.px(6, 5, 'nv2');
    P.r(5, 1, 14, 3, 'wd2'); P.r(5, 1, 14, 1, 'wd3');
  }));
  reg('chest', make(22, 17, P => {
    P.r(1, 2, 20, 6, 'wd2'); P.r(2, 1, 18, 1, 'wd2'); P.r(2, 2, 18, 1, 'wd3');
    P.r(1, 8, 20, 8, 'wd1'); P.r(1, 7, 20, 1, 'go0');
    P.r(3, 1, 2, 15, 'go1'); P.r(17, 1, 2, 15, 'go1'); P.px(3, 2, 'go4'); P.px(17, 2, 'go4');
    P.r(9, 6, 4, 5, 'go1'); P.px(10, 8, 'nv0'); P.px(10, 9, 'nv0'); P.px(9, 6, 'go4');
  }));
  reg('bomb', make(26, 26, P => {
    P.disc(12, 15, 10, 10, 'nv3'); P.disc(10, 13, 6, 6, 'st2'); P.disc(9, 12, 3, 3, 'bl1'); P.px(8, 11, 'bl4');
    P.r(10, 3, 5, 3, 'mt1'); P.px(10, 3, 'mt3');
    P.px(15, 2, 'wd2'); P.px(16, 1, 'wd2'); P.px(17, 1, 'wd2'); P.px(18, 2, 'wd2');
    P.r(19, 0, 3, 3, 'go3'); P.px(22, 1, 'or1'); P.px(20, 3, 'or1'); P.px(18, 0, 'or1');
  }));

  /* ---------- SET PIECES ---------- */
  reg('arch', make(54, 68, P => {
    P.r(1, 8, 52, 59, 'st3'); P.r(5, 4, 44, 4, 'st3'); P.r(12, 1, 30, 3, 'st3');
    // stone blocks
    for (let y = 8; y < 67; y += 7) P.r(1, y, 52, 1, 'st2');
    for (let y = 8, k = 0; y < 67; y += 7, k++) for (let x = (k % 2) * 6 + 2; x < 53; x += 12) P.r(x, y + 1, 1, 6, 'st2');
    P.r(12, 1, 30, 1, 'st4'); P.r(5, 4, 7, 1, 'st4'); P.r(42, 4, 7, 1, 'st4'); P.r(1, 8, 4, 1, 'st4');
    // keystone
    P.r(23, 0, 8, 9, 'st4'); P.r(24, 1, 6, 7, 'pu1'); P.r(25, 2, 2, 2, 'pu3'); P.px(27, 5, 'bl4');
    // opening (arched)
    P.clear(10, 16, 34, 52);
    P.clear(13, 13, 28, 3); P.clear(17, 11, 20, 2);
    P.r(9, 16, 1, 51, 'st1'); P.r(44, 16, 1, 51, 'st1');
  }));
  reg('leaf', make(17, 56, P => {
    P.r(0, 0, 17, 56, 'wd1');
    for (let x = 0; x < 17; x += 4) P.r(x, 0, 1, 56, 'wd0');
    for (let x = 1; x < 17; x += 4) P.r(x, 0, 1, 56, 'wd2');
    P.r(0, 10, 17, 3, 'mt0'); P.r(0, 42, 17, 3, 'mt0'); P.r(0, 10, 17, 1, 'mt1'); P.r(0, 42, 17, 1, 'mt1');
    [2, 7, 12].forEach(x => { P.px(x, 11, 'mt3'); P.px(x, 43, 'mt3'); });
  }, { outline: false }));
  reg('tablet', make(40, 22, P => {
    P.r(1, 2, 38, 18, 'st3'); P.r(2, 1, 36, 1, 'st3'); P.r(2, 20, 36, 1, 'st2');
    P.r(3, 4, 34, 14, 'st1'); P.r(3, 4, 34, 1, 'st0');
    P.r(1, 2, 1, 17, 'st4'); P.r(2, 1, 36, 1, 'st4');
  }));
  reg('warn', make(19, 17, P => {
    for (let y = 0; y < 14; y++) { const hw = Math.floor(y * 0.62); P.r(9 - hw, 1 + y, hw * 2 + 1, 1, 'wy0'); }
    P.r(9 - 8, 14, 17, 1, 'go0');
    P.r(9, 5, 1, 5, 'nv0'); P.r(8, 6, 3, 3, 'nv0'); P.r(9, 11, 1, 2, 'nv0'); P.px(9, 3, 'wy1');
  }));
  reg('skullSign', make(26, 24, P => {
    P.r(12, 12, 3, 11, 'wd1');
    P.r(1, 1, 24, 13, 'wd2'); P.r(1, 1, 24, 1, 'wd3'); P.r(1, 12, 24, 1, 'wd1');
    P.map(['.wwwww.', 'wwwwwww', 'wnwwwnw', 'wwwnwww', '.wnwnw.'], { w: 'cr', n: 'nv0' }, 5, 4);
    P.map(['r...r', '.r.r.', '..r..', '.r.r.', 'r...r'], { r: 'rd1' }, 15, 4);
  }));
  reg('capUp', make(34, 21, P => {
    P.disc(17, 10, 15.5, 9.5, 'rd0');
    P.disc(17, 9, 14.5, 8, '#D91D32');
    P.disc(17, 8.5, 12, 6.5, '#FF5B50');
    P.disc(12, 6, 5, 2.5, '#FFB087'); P.r(9, 5, 3, 1, 'cr');
  }));
  reg('pedestal', make(56, 26, P => {
    P.r(1, 4, 54, 21, 'mt0'); P.r(3, 1, 50, 5, 'mt1'); P.r(3, 1, 50, 1, 'mt2');
    P.r(1, 11, 54, 6, 'wy0');
    for (let x = -6; x < 56; x += 8) for (let i = 0; i < 6; i++) { const xx = x + i; if (xx >= 1 && xx < 55) P.r(xx, 11 + i, 3, 1, 'nv0'); }
    P.r(1, 10, 54, 1, 'nv1'); P.r(1, 17, 54, 1, 'nv1');
    P.r(1, 22, 54, 3, 'nv2'); [6, 49].forEach(x => { P.px(x, 7, 'mt3'); P.px(x, 20, 'mt2'); });
  }));
  reg('bridgeL', make(40, 12, P => {
    for (let x = 1; x < 36; x += 5) { P.r(x, 3, 4, 6, 'wd2'); P.r(x, 3, 4, 1, 'wd3'); }
    P.r(36, 5, 3, 3, 'wd1'); P.r(1, 2, 37, 1, 'wd0');
  }));
  reg('bridgeR', make(34, 12, P => {
    for (let x = 6; x < 33; x += 5) { P.r(x, 3, 4, 6, 'wd2'); P.r(x, 3, 4, 1, 'wd3'); }
    P.r(2, 6, 3, 3, 'wd1'); P.r(4, 2, 29, 1, 'wd0');
  }));
})();
