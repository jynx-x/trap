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
    '.bbbbbbbbbbb.',
    'bbcbbbbbbbbbb',
    'ttttttttttttt',
  ], { r: 'rd2', w: 'cr', R: 'rd0', b: 'bl1', c: 'bl4', t: 'mt0' }));

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
    'bbbbbbbbb', 'bhbbybbbb', 'bhbyyybbb', 'bbyyyyybb', 'bbbyyybbb',
    'bbbbybbbb', '.bbbbbbb.', '..bbbbb..', '...bbb...', '....b....',
  ], { b: 'bl1', h: 'bl4', y: 'go2' }));

  reg('bat', fromMap([
    'x...........x', 'xx..x...x..xx', 'xxx.xxxxx.xxx', '.xxxxrxrxxxx.', '..xxxxxxxxx..', '.....x.x.....',
  ], { x: 'pu0', r: 'rd3' }));

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

  // red warning triangle with a cream "!"
  reg('warnRed', make(19, 17, P => {
    for (let y = 0; y < 14; y++) { const hw = Math.floor(y * 0.62); P.r(9 - hw, 1 + y, hw * 2 + 1, 1, 'rd2'); }
    for (let y = 2; y < 12; y++) { const hw = Math.floor(y * 0.62) - 1; if (hw > 0) P.r(9 - hw, 1 + y, 1, 1, 'rd3'); }
    P.r(1, 14, 17, 1, 'rd0');
    P.r(9, 5, 1, 5, 'cr'); P.r(8, 6, 3, 3, 'cr'); P.r(9, 11, 1, 2, 'cr');
  }));

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

  /* ---------- DUNGEON TILES — dark purple-blue stone (no outline, tiled) ---------- */
  const W = { m: '#1C1836', b: '#322C56', h: '#46407A', s: '#27224A' };
  const F = { m: '#221E40', b: '#3A345F', h: '#504A82' };
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  reg('wall', make(32, 16, P => {
    P.r(0, 0, 32, 16, W.b);
    P.r(0, 0, 32, 1, W.m); P.r(0, 8, 32, 1, W.m);
    P.r(0, 1, 1, 7, W.m); P.r(16, 9, 1, 7, W.m);
    P.r(1, 1, 15, 1, W.h); P.r(17, 1, 15, 1, W.h); P.r(0, 9, 16, 1, W.h); P.r(17, 9, 15, 1, W.h);
    P.r(1, 7, 15, 1, W.s); P.r(17, 7, 15, 1, W.s); P.r(0, 15, 16, 1, W.s); P.r(17, 15, 15, 1, W.s);
    for (let i = 0; i < 14; i++) P.px(Math.floor(rnd() * 32), 1 + Math.floor(rnd() * 14), rnd() > 0.5 ? W.h : W.m);
    P.line(22, 3, 25, 6, W.m); P.px(5, 11, '#5B3A8A'); P.px(6, 11, '#5B3A8A');
  }, { outline: false }));

  reg('floor', make(16, 16, P => {
    P.r(0, 0, 16, 16, F.b);
    P.r(0, 0, 16, 1, F.m); P.r(0, 0, 1, 16, F.m);
    P.r(1, 1, 15, 1, F.h); P.r(1, 1, 1, 15, F.h);
    for (let i = 0; i < 6; i++) P.px(2 + Math.floor(rnd() * 13), 2 + Math.floor(rnd() * 13), F.m);
  }, { outline: false }));

  // low stone wall blocks the team peeks over
  reg('block', make(16, 12, P => {
    P.r(0, 0, 16, 12, '#5A5488');
    P.r(0, 0, 16, 1, '#7A74AE'); P.r(0, 5, 16, 1, '#2A2548'); P.r(0, 11, 16, 1, '#2A2548');
    P.r(0, 1, 1, 4, '#2A2548'); P.r(8, 6, 1, 5, '#2A2548');
    P.r(1, 1, 7, 1, '#8C86C0'); P.r(9, 6, 7, 1, '#6E68A2'); P.r(1, 4, 15, 1, '#474170'); P.r(0, 10, 16, 1, '#474170');
    P.px(4, 2, '#474170'); P.px(12, 8, '#474170');
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
  // ceiling stalactite spikes
  reg('spikeDown', make(14, 24, P => {
    P.r(1, 1, 12, 2, '#4A4670');
    for (let y = 3; y < 22; y++) {
      const hw = Math.max(0, Math.floor((22 - y) / 3.2));
      P.r(7 - hw, y, hw, 1, '#A7A3C8'); P.r(7, y, hw + (hw ? 0 : 1), 1, '#67638E');
    }
    P.px(5, 5, '#E2E0F5'); P.px(5, 6, '#E2E0F5');
  }));

  reg('chain', make(7, 10, P => {
    P.r(2, 0, 3, 1, 'mt1'); P.r(1, 1, 1, 3, 'mt1'); P.r(5, 1, 1, 3, 'mt1'); P.r(2, 4, 3, 1, 'mt1');
    P.px(2, 1, 'mt3'); P.r(3, 5, 1, 4, 'mt2');
  }, { outline: false }));

  // glowing lava crack for the back wall
  reg('lavaCrack', make(28, 48, P => {
    const main = [[14, 1], [12, 7], [15, 12], [11, 18], [14, 24], [10, 31], [13, 37], [11, 46]];
    for (let i = 0; i < main.length - 1; i++) {
      const [a, b] = [main[i], main[i + 1]];
      P.line(a[0], a[1], b[0], b[1], 'or1'); P.line(a[0] + 1, a[1], b[0] + 1, b[1], 'go3');
    }
    [[[15, 12], [21, 16], [25, 15]], [[11, 18], [5, 22], [2, 21]], [[14, 24], [20, 29]], [[10, 31], [4, 35]]].forEach(br => {
      for (let i = 0; i < br.length - 1; i++) P.line(br[i][0], br[i][1], br[i + 1][0], br[i + 1][1], 'or0');
    });
  }, { outline: 'rd0' }));

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
  reg('warn', make(19, 17, P => {
    for (let y = 0; y < 14; y++) { const hw = Math.floor(y * 0.62); P.r(9 - hw, 1 + y, hw * 2 + 1, 1, 'wy0'); }
    P.r(1, 14, 17, 1, 'go0');
    P.r(9, 5, 1, 5, 'nv0'); P.r(8, 6, 3, 3, 'nv0'); P.r(9, 11, 1, 2, 'nv0'); P.px(9, 3, 'wy1');
  }));
  reg('skullSign', make(26, 24, P => {
    P.r(12, 12, 3, 11, 'wd1');
    P.r(1, 1, 24, 13, 'wd2'); P.r(1, 1, 24, 1, 'wd3'); P.r(1, 12, 24, 1, 'wd1');
    P.map(['.wwwww.', 'wwwwwww', 'wnwwwnw', 'wwwnwww', '.wnwnw.'], { w: 'cr', n: 'nv0' }, 5, 4);
    P.map(['r...r', '.r.r.', '..r..', '.r.r.', 'r...r'], { r: 'rd1' }, 15, 4);
  }));

  /* ---------- SET PIECES ---------- */
  reg('arch', make(54, 68, P => {
    const S1 = '#4A4478', S2 = '#5E588F', S3 = '#7A74AE';
    P.r(1, 8, 52, 59, S2); P.r(5, 4, 44, 4, S2); P.r(12, 1, 30, 3, S2);
    for (let y = 8; y < 67; y += 7) P.r(1, y, 52, 1, S1);
    for (let y = 8, k = 0; y < 67; y += 7, k++) for (let x = (k % 2) * 6 + 2; x < 53; x += 12) P.r(x, y + 1, 1, 6, S1);
    P.r(12, 1, 30, 1, S3); P.r(5, 4, 7, 1, S3); P.r(42, 4, 7, 1, S3); P.r(1, 8, 4, 1, S3);
    // skull keystone
    P.r(21, 0, 12, 11, S3);
    P.map(['.cccccc.', 'cccccccc', 'cnnccnnc', 'cnnccnnc', 'ccccnccc', '.cncncc.', '..cccc..'], { c: 'cr', n: 'nv1' }, 23, 2);
    // opening (arched)
    P.clear(10, 16, 34, 52);
    P.clear(13, 13, 28, 3); P.clear(17, 11, 20, 2);
    P.r(9, 16, 1, 51, S1); P.r(44, 16, 1, 51, S1);
  }));
  reg('leaf', make(17, 56, P => {
    P.r(0, 0, 17, 56, 'wd1');
    for (let x = 0; x < 17; x += 4) P.r(x, 0, 1, 56, 'wd0');
    for (let x = 1; x < 17; x += 4) P.r(x, 0, 1, 56, 'wd2');
    P.r(0, 10, 17, 3, 'mt0'); P.r(0, 42, 17, 3, 'mt0'); P.r(0, 10, 17, 1, 'mt1'); P.r(0, 42, 17, 1, 'mt1');
    [2, 7, 12].forEach(x => { P.px(x, 11, 'mt3'); P.px(x, 43, 'mt3'); });
  }, { outline: false }));
  reg('tablet', make(40, 22, P => {
    P.r(1, 2, 38, 18, '#5E588F'); P.r(2, 1, 36, 1, '#5E588F'); P.r(2, 20, 36, 1, '#4A4478');
    P.r(3, 4, 34, 14, '#2A2548'); P.r(3, 4, 34, 1, '#1C1836');
    P.r(1, 2, 1, 17, '#7A74AE'); P.r(2, 1, 36, 1, '#7A74AE');
  }));
  // hanging team banner (text is drawn in DOM on top)
  reg('banner', make(32, 60, P => {
    P.r(0, 1, 32, 2, 'mt1'); P.r(0, 1, 32, 1, 'mt3'); P.r(0, 0, 3, 4, 'go1'); P.r(29, 0, 3, 4, 'go1');
    P.r(3, 3, 26, 47, 'rd1');
    [3, 4].forEach(x => P.r(x, 3, 1, 47, 'rd3'));
    [11, 20].forEach(x => P.r(x, 3, 1, 47, 'rd0'));
    for (let t = 0; t < 3; t++) {
      const x0 = 3 + Math.round(t * 26 / 3), w = Math.round(26 / 3);
      for (let i = 0; i < 6; i++) { const inset = Math.floor(i * (w / 2) / 6); P.r(x0 + inset, 50 + i, w - inset * 2, 1, 'rd1'); }
    }
    P.r(3, 5, 26, 1, 'go1'); P.r(3, 44, 26, 1, 'go1');
    // cat emblem
    P.map(['c.....c', 'cc...cc', 'ccccccc', 'cnccncc', 'ccccccc', '.ccpcc.', '..ccc..'], { c: 'cr', n: 'nv1', p: 'pk0' }, 12, 34);
  }));
  // big red button: glossy dome on a metal collar
  reg('capUp', make(36, 24, P => {
    P.disc(18, 18, 16.5, 5, 'mt0'); P.disc(18, 17.5, 15.5, 4, 'mt1'); P.r(6, 16, 5, 1, 'mt3');
    P.disc(18, 11, 14.5, 9.5, 'rd0');
    P.disc(18, 10, 13.5, 8, '#D91D32');
    P.disc(18, 9.5, 11, 6.5, '#FF5B50');
    P.disc(13, 7, 5, 2.5, '#FFB087'); P.r(10, 6, 3, 1, 'cr');
  }));
  // octagonal stone pedestal (the PUSH plate text is DOM)
  reg('pedestal', make(56, 32, P => {
    const L = '#7A74AE', M = '#5E588F', D = '#433D6E', X = '#2A2548';
    for (let y = 1; y <= 5; y++) { const inset = 6 - y; P.r(1 + inset, y, 54 - inset * 2, 1, y === 1 ? '#9A94CC' : L); }
    P.r(1, 6, 9, 24, D); P.r(10, 6, 36, 24, M); P.r(46, 6, 9, 24, X);
    for (let y = 12; y < 30; y += 7) { P.r(1, y, 54, 1, X); }
    [[16, 6], [30, 6], [22, 13], [38, 13], [16, 20], [30, 20]].forEach(([x, y]) => P.r(x, y + 1, 1, 5, X));
    P.r(10, 6, 36, 1, L);
    [11, 44].forEach(x => { P.r(x, 6, 2, 24, 'mt0'); P.px(x, 9, 'mt2'); P.px(x, 25, 'mt2'); });
    P.r(17, 12, 22, 11, 'mt0'); P.r(18, 13, 20, 9, 'nv1'); P.r(18, 13, 20, 1, 'nv3');
    P.r(1, 29, 54, 2, X);
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
