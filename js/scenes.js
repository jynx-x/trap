/* TRAP ESCAPE — scene builders + FX helpers */
const SC = (() => {
  const $ = id => document.getElementById(id);
  const S = PX.SPR;

  function div(cls, parent, css, html) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    if (css) d.style.cssText = css;
    if (html != null) d.innerHTML = html;
    if (parent) parent.appendChild(d);
    return d;
  }
  function sp(name, scale = 3, parent, x, y, cls) {
    const s = S[name], i = new Image();
    i.src = s.url; i.draggable = false; i.alt = '';
    i.className = 'px' + (cls ? ' ' + cls : '');
    i.style.width = s.w * scale + 'px'; i.style.height = s.h * scale + 'px';
    if (x != null) { i.style.left = x + 'px'; i.style.top = y + 'px'; }
    if (parent) parent.appendChild(i);
    return i;
  }
  function tile(parent, name, scale, x, y, w, h, cls) {
    const s = S[name];
    return div('tile' + (cls ? ' ' + cls : ''), parent,
      `left:${x}px;top:${y}px;width:${w}px;height:${h}px;background-image:url(${s.url});background-size:${s.w * scale}px ${s.h * scale}px`);
  }
  const icon = (name, scale = 2, css = '') => { const s = S[name]; return `<img src="${s.url}" alt="" style="position:static;display:inline-block;vertical-align:middle;image-rendering:pixelated;width:${s.w * scale}px;height:${s.h * scale}px;${css}">`; };

  function makeChar(m, parent, x, y, face = 'normal') {
    const el = div('char', parent, `left:${x}px;top:${y}px`);
    div('shadow', el);
    const body = div('body', el);
    body.style.animationDelay = `-${(Math.random() * 0.7).toFixed(2)}s`;
    const img = new Image(); img.alt = ''; img.draggable = false; body.appendChild(img);
    const bubble = div('bubble', el);
    const c = {
      el, img, bubble, m,
      setFace(f) { c.face = f; img.src = S[`${m.id}_${f}`].url; },
      say(t, ms = 1400, ko) {
        bubble.textContent = t; bubble.classList.toggle('ko', !!ko); bubble.classList.add('show');
        clearTimeout(c._t); if (ms) c._t = setTimeout(() => bubble.classList.remove('show'), ms);
      },
      hush() { bubble.classList.remove('show'); },
      mode(cls) { el.classList.remove('walk', 'jump', 'recoil'); if (cls) { void el.offsetWidth; el.classList.add(cls); } },
      moveTo(nx, ny) { el.style.left = nx + 'px'; el.style.top = ny + 'px'; },
    };
    c.setFace(face);
    return c;
  }
  const party = (parent, xs, y, face) => PX.TEAM.map((m, i) => makeChar(m, parent, xs[i], y, face));

  function island(root, name, s, x, y, delay) {
    const g = div('abs bobble', root, `left:${x}px;top:${y}px;animation-delay:${delay}s`);
    return { g, img: sp(name, s, g, 0, 0) };
  }
  function clouds(root, list, dur, top = 0) {
    const cl = div('abs drift', root, `left:0;top:${top}px;width:2600px;height:10px;animation-duration:${dur}s`);
    list.forEach(([x, y, n, s]) => { sp(n, s, cl, x, y); sp(n, s, cl, x + 1300, y); });
    return cl;
  }
  function ground(root, top) {
    tile(root, 'grassTop', 3, 0, top, 960, 30);
    tile(root, 'dirt', 3, 0, top + 30, 960, 540 - top - 30);
  }
  function flowers(root, list) { list.forEach(([x, y, k]) => sp(`flower${k}`, 3, root, x, y)); }

  /* ---------------- MEADOW (intro) ---------------- */
  function buildMeadow() {
    const root = $('meadow'); root.innerHTML = '';
    div('sky', root);
    sp('haloSun', 3, root, 690, -40, 'flicker');
    sp('sun', 3, root, 774, 44);
    clouds(root, [[40, 40, 'cloudL', 3], [420, 120, 'cloudS', 3], [660, 20, 'cloudS', 2], [930, 96, 'cloudL', 2]], 140);
    const big = island(root, 'islandL', 3, 520, 170, 0);
    div('waterfall', big.g, 'left:150px;top:60px;height:300px;z-index:-1');
    sp('castle', 2, big.g, 86, -82);
    const m1 = island(root, 'islandM', 3, 40, 120, -1.2);
    sp('tree', 2, m1.g, 30, -64); sp('flag', 2, m1.g, 104, -38);
    island(root, 'islandS', 2, 360, 76, -0.6);
    const s2 = island(root, 'islandS', 3, 862, 250, -2);
    div('waterfall', s2.g, 'left:40px;top:50px;height:220px;width:16px;z-index:-1');
    const ship = div('abs drift', root, 'left:1000px;top:46px;animation-duration:42s');
    sp('airship', 2, div('bobble', ship), 0, 0);
    clouds(root, [[120, 0, 'cloudL', 4], [700, 20, 'cloudL', 3], [1050, 10, 'cloudS', 4]], 90, 330);
    // midground
    sp('tree', 4, root, -10, 262); sp('tree', 4, root, 842, 262);
    sp('bush', 3, root, 150, 368); sp('bush', 3, root, 740, 372);
    [[250, 312], [678, 312]].forEach(([x, y]) => { sp('haloLamp', 3, root, x - 18, y - 30, 'flicker'); sp('lamp', 3, root, x, y); });
    ground(root, 402);
    flowers(root, [[40, 440, 0], [110, 470, 1], [200, 438, 2], [260, 490, 3], [700, 452, 0], [790, 488, 1], [880, 446, 2], [610, 500, 3], [360, 505, 1], [150, 505, 2]]);
    const slime = div('abs bobble', root, 'left:792px;top:382px;animation-duration:.8s');
    sp('slime', 3, slime, 0, 0);
    // trap hole + cracks (hidden until the accident)
    const cracks = div('abs', root, 'left:0;top:0;width:960px;height:540px;opacity:0;transition:opacity .2s steps(2)');
    for (let k = 0; k < 7; k++) {
      let x = 300 + k * 52, y = 412 + (k % 3) * 8;
      for (let i = 0; i < 6; i++) { div('abs', cracks, `left:${x}px;top:${y}px;width:12px;height:4px;background:#07162F`); x += 10; y += (i % 2 ? -4 : 4); }
    }
    const hole = div('abs', root, 'left:280px;top:396px;width:420px;height:64px;transform:scaleX(0);transition:transform .35s steps(5)');
    [['0;top:12px;width:420px;height:40px', '#07162F'], ['22px;top:4px;width:376px;height:56px', '#07162F'], ['56px;top:0;width:308px;height:64px', '#07162F'],
      ['96px;top:16px;width:228px;height:32px', 'rgba(200,23,47,.55)'], ['140px;top:22px;width:140px;height:20px', 'rgba(255,138,60,.6)']]
      .forEach(([pos, bg]) => div('abs', hole, `left:${pos};background:${bg}`));
    return { root, cracks, hole, party: party(root, [364, 444, 524], 338, 'normal') };
  }

  /* ---------------- DUNGEON (trap zone) ---------------- */
  const PROPS = [
    { id: 'rock', x: 6, y: 420, s: 3, msg: '돌멩이다. 아무것도 없다.' },
    { id: 'skull', x: 356, y: 448, s: 3, msg: '해골이 웃고 있다… 열쇠는 없다.' },
    { id: 'crate', x: 598, y: 396, s: 3, msg: '텅 빈 상자다.' },
    { id: 'planks', x: 684, y: 432, s: 3, msg: '거미줄뿐이다.' },
    { id: 'chest', x: 804, y: 414, s: 3, msg: '누가 이미 털어갔다!' },
    { id: 'barrel', x: 890, y: 352, s: 3, msg: '찰랑… 물만 들었다.' },
  ];

  function buildDungeon() {
    const root = $('dungeon'); root.innerHTML = '';
    tile(root, 'wall', 3, 0, 0, 960, 390);
    div('abs', root, 'left:0;top:0;width:960px;height:96px;background:linear-gradient(180deg,rgba(7,22,47,.75) 0 30%,rgba(7,22,47,.45) 30% 62%,rgba(7,22,47,.18) 62%)');
    tile(root, 'floor', 3, 0, 386, 960, 160);
    div('abs', root, 'left:0;top:382px;width:960px;height:8px;background:#1E2350;box-shadow:0 4px 0 #2B3268');
    [[118, 60], [212, 132], [760, 168], [846, 96]].forEach(([x, h]) => tile(root, 'chain', 3, x, 0, 21, h, 'swing'));

    // exit door
    const door = div('abs', root, 'left:372px;top:118px;width:216px;height:272px');
    const doorRays = div('abs', door, 'left:-92px;top:-40px;width:400px;height:400px;opacity:0;transition:opacity .4s steps(4);background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,242,181,.8) 0 8deg,transparent 8deg 24deg);-webkit-mask:radial-gradient(circle,#000 0 30%,rgba(0,0,0,.5) 30% 50%,transparent 50%);mask:radial-gradient(circle,#000 0 30%,rgba(0,0,0,.5) 30% 50%,transparent 50%)');
    div('abs', door, 'left:40px;top:44px;width:136px;height:228px;background:#07162F');
    const light = div('abs', door, 'left:40px;top:44px;width:136px;height:228px;opacity:0;transition:opacity .5s steps(5);background:linear-gradient(180deg,#FFFFFF 0 25%,#FFF2B5 25% 55%,#FFE894 55% 80%,#FFD95F 80%)');
    const leafL = sp('leaf', 4, door, 40, 48); const leafR = sp('leaf', 4, door, 108, 48);
    leafL.style.transformOrigin = '0 50%'; leafR.style.transformOrigin = '100% 50%'; leafR.style.transform = 'scaleX(-1)';
    [leafL, leafR].forEach(l => { l.style.transition = 'transform .9s steps(6)'; });
    sp('arch', 4, door, 0, 0);

    // siren
    const sirenGlow = sp('haloRed', 3, root, 387, -2); sirenGlow.style.opacity = 0;
    sp('siren', 4, root, 450, 70);

    // torches with stepped fire halos
    [292, 638].forEach(x => {
      sp('haloFire', 3, root, x + 15 - 69, 176 - 69, 'flicker');
      sp('torch', 3, root, x, 196);
      div('abs flame', root, `left:${x - 3}px;top:160px;background-image:url(${S.flame.url});image-rendering:pixelated`);
    });
    sp('haloPurple', 3, root, 858, 266, 'flicker'); sp('crystal', 3, root, 900, 300);
    sp('haloBlue', 3, root, -40, 300, 'flicker'); sp('crystal', 2, root, 8, 352);

    // hint tablet
    const tablet = div('abs tablet', root, 'left:34px;top:246px;width:168px;height:96px');
    const tabletGlow = sp('haloGold', 3, tablet, -20, -60); tabletGlow.style.opacity = 0;
    sp('tablet', 4, tablet, 0, 0);
    const tabletRunes = div('tablet-runes', tablet);

    sp('warn', 3, root, 236, 262);
    sp('skullSign', 3, root, 694, 306);

    // lava moat + broken bridge + spikes
    const glow = div('lava-glow', root, 'left:0;top:430px;width:960px;height:76px');
    const lava = tile(root, 'lava', 3, 0, 504, 960, 36, 'lava');
    sp('bridgeL', 3, root, 404, 498); sp('bridgeR', 3, root, 560, 498);
    const spikes = [tile(root, 'spike', 2, 0, 472, 360, 32), tile(root, 'spike', 2, 600, 472, 360, 32)];
    spikes.forEach(s => { s.style.transition = 'transform .5s steps(5), opacity .5s steps(5)'; });

    // searchable props
    const props = PROPS.map(p => {
      const el = div('prop', root, `left:${p.x}px;top:${p.y}px`);
      const img = sp(p.id, p.s, el);
      div('q', el, '', '?');
      const w = S[p.id].w * p.s, h = S[p.id].h * p.s;
      return { ...p, el, img, cx: p.x + w / 2, cy: p.y + h / 2, w, h };
    });

    // escape button
    const btn = div('', root); btn.id = 'escBtn';
    div('rays', btn);
    sp('haloRed', 3, btn, null, null, 'glow');
    sp('pedestal', 3, btn, null, null, 'ped');
    const capwrap = div('capwrap', btn);
    sp('capUp', 3, capwrap, null, null, 'cap');
    const locks = div('locks', btn);
    [62, -62].forEach(a => { const c = tile(locks, 'chain', 2, 77, 6, 14, 130); c.style.transform = `rotate(${a}deg)`; });
    sp('lock', 4, locks, 58, 44);
    const hitbox = div('hitbox', btn);
    const label = div('frame dark', root); label.id = 'escLabel';

    const P = party(root, [88, 176, 264], -160, 'dizzy');
    P.forEach(c => { c.el.style.zIndex = 5; });
    return { root, door: { rays: doorRays, light, leafL, leafR }, sirenGlow, tablet, tabletGlow, tabletRunes, lava, glow, spikes, props, btn, locks, hitbox, label, party: P };
  }

  /* ---------------- VICTORY ---------------- */
  function buildVictory() {
    const root = $('victory'); root.innerHTML = '';
    div('sky', root);
    div('abs spin', root, 'left:80px;top:-280px;width:800px;height:800px;opacity:.5;background:repeating-conic-gradient(from 0deg,rgba(255,242,181,.9) 0 7deg,transparent 7deg 20deg);-webkit-mask:radial-gradient(circle,#000 0 20%,rgba(0,0,0,.55) 20% 36%,rgba(0,0,0,.25) 36% 50%,transparent 50%);mask:radial-gradient(circle,#000 0 20%,rgba(0,0,0,.55) 20% 36%,rgba(0,0,0,.25) 36% 50%,transparent 50%);animation-duration:24s');
    clouds(root, [[30, 70, 'cloudL', 3], [480, 150, 'cloudS', 3], [820, 60, 'cloudL', 2], [1100, 130, 'cloudS', 2]], 110);
    const a = island(root, 'islandM', 3, 18, 190, -1);
    div('waterfall', a.g, 'left:70px;top:60px;height:260px;z-index:-1'); sp('castle', 2, a.g, 22, -80);
    const b = island(root, 'islandM', 3, 800, 170, -2);
    div('waterfall', b.g, 'left:52px;top:60px;height:260px;z-index:-1'); sp('tree', 2, b.g, 40, -64);
    island(root, 'islandS', 2, 700, 60, -0.4); island(root, 'islandS', 2, 210, 40, -1.6);
    const ship = div('abs drift', root, 'left:1000px;top:96px;animation-duration:36s'); sp('airship', 2, div('bobble', ship), 0, 0);
    clouds(root, [[0, 0, 'cloudL', 4], [520, 20, 'cloudL', 3], [980, 4, 'cloudS', 4]], 80, 352);
    sp('haloPortal', 3, root, 480 - 135, 336 - 135, 'flicker');
    sp('portal', 3, root, 408, 236);
    sp('tree', 4, root, -22, 272); sp('tree', 4, root, 856, 272);
    [[300, 318], [642, 318]].forEach(([x, y]) => { sp('haloLamp', 3, root, x - 18, y - 30, 'flicker'); sp('lamp', 3, root, x, y); });
    ground(root, 420);
    flowers(root, [[20, 458, 0], [90, 490, 1], [180, 452, 2], [250, 500, 3], [330, 470, 0], [620, 470, 1], [700, 500, 2], [770, 456, 3], [850, 494, 0], [920, 462, 1], [140, 512, 3], [800, 516, 2]]);
    [[190, 400], [720, 404]].forEach(([x, y]) => { const s = div('abs bobble', root, `left:${x}px;top:${y}px;animation-duration:.7s`); sp('slime', 3, s, 0, 0); });
    const P = party(root, [352, 444, 536], 352, 'happy');
    return { root, party: P };
  }

  /* ---------------- FX ---------------- */
  function particles(x, y, n, colors, opt = {}) {
    const fx = $('fx');
    for (let i = 0; i < n; i++) {
      const size = (opt.size || 4) + Math.floor(Math.random() * 3) * 2;
      const p = div('pt', fx, `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]}`);
      const ang = opt.up ? -Math.PI / 2 + (Math.random() - 0.5) * 2.2 : Math.random() * Math.PI * 2;
      const dist = (opt.dist || 70) * (0.4 + Math.random() * 0.8);
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist + (opt.gravity ?? 30);
      p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }],
        { duration: (opt.dur || 700) * (0.6 + Math.random() * 0.6), easing: 'steps(8)', fill: 'forwards' }).onfinish = () => p.remove();
    }
  }
  function sparkles(x, y, n = 6, spread = 60) {
    const fx = $('fx');
    for (let i = 0; i < n; i++) {
      const s = sp('sparkle', 3, fx, x + (Math.random() - 0.5) * spread * 2, y + (Math.random() - 0.5) * spread);
      s.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.3)' }, { transform: 'scale(0)' }],
        { duration: 600, delay: i * 70, easing: 'steps(5)', fill: 'both' }).onfinish = () => s.remove();
    }
  }
  function rain(n, colors, opt = {}) {
    const fx = $('fx');
    for (let i = 0; i < n; i++) {
      const w = opt.w || 8, h = opt.h || 12;
      const p = div(opt.cls || 'confetti', fx, `left:${Math.random() * 960}px;top:-20px;width:${w}px;height:${h}px;background:${colors[i % colors.length]}`);
      const dx = (Math.random() - 0.5) * 160, rot = (Math.random() - 0.5) * 900;
      p.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${dx}px,${580 + Math.random() * 40}px) rotate(${rot}deg)` }],
        { duration: (opt.dur || 2600) * (0.6 + Math.random() * 0.8), delay: Math.random() * (opt.spread || 600), easing: 'steps(24)', fill: 'both' }).onfinish = () => p.remove();
    }
  }
  function floatText(x, y, html, cls = 'outline-ko') {
    x = Math.max(130, Math.min(830, x)); y = Math.max(40, y);
    const t = div('float-text ' + cls, $('fx'), `left:${x}px;top:${y}px`, html);
    setTimeout(() => t.remove(), 1400);
  }
  function flash(red) {
    const f = $('flash'); f.className = ''; void f.offsetWidth; f.className = red ? 'go-red' : 'go';
  }
  let shakeT;
  function shake(ms = 400, small) {
    const w = $('world'); w.classList.remove('shake', 'shake-sm'); void w.offsetWidth;
    w.classList.add(small ? 'shake-sm' : 'shake');
    clearTimeout(shakeT); shakeT = setTimeout(() => w.classList.remove('shake', 'shake-sm'), ms);
  }

  return { div, sp, tile, icon, makeChar, buildMeadow, buildDungeon, buildVictory, particles, sparkles, rain, floatText, flash, shake };
})();
