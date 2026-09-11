/* TRAP ESCAPE — scene builders + FX helpers */
const SC = (() => {
  const $ = id => document.getElementById(id);
  const S = PX.SPR;
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

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

  /* ---------- shared scenery helpers ---------- */
  function island(root, name, s, x, y, delay) {
    const g = div('abs bobble', root, `left:${x}px;top:${y}px;animation-delay:${delay}s`);
    return { g, img: sp(name, s, g, 0, 0) };
  }
  function clouds(root, list, dur, top = 0, css = '') {
    const cl = div('abs drift', root, `left:0;top:${top}px;width:2600px;height:10px;animation-duration:${dur}s;${css}`);
    list.forEach(([x, y, n, s]) => { sp(n, s, cl, x, y); sp(n, s, cl, x + 1300, y); });
    return cl;
  }
  function starsField(root, n, maxY) {
    seed = 11;
    for (let i = 0; i < n; i++) {
      const size = rnd() > 0.82 ? 4 : rnd() > 0.45 ? 3 : 2;
      div('abs twk', root, `left:${Math.round(rnd() * 960)}px;top:${Math.round(rnd() * maxY)}px;width:${size}px;height:${size}px;background:${['#FFF9E8', '#8AD7FF', '#FFE894'][i % 3]};animation-delay:-${(rnd() * 1.6).toFixed(2)}s`);
    }
  }
  function ocean(root, top, h) {
    const o = div('ocean', root, `top:${top}px;height:${h}px`);
    [5, 18, 36, 62, 96, 140].forEach((y, i) => div('wv', o, `top:${y}px;animation-duration:${3 + i}s;opacity:${1 - i * 0.13}`));
    return o;
  }
  function blimp(root, top, dur) {
    const ship = div('abs drift', root, `left:1000px;top:${top}px;animation-duration:${dur}s`);
    const g = div('bobble', ship, 'position:relative');
    sp('blimp', 3, g, 0, 0);
    div('blimp-text', g, '', 'VISUAL SYSTEMS<br>SQUAD');
    return ship;
  }
  const signboard = (root, x, y, html) => div('signboard', root, `left:${x}px;top:${y}px`, html);
  function woodSign(root, x, y, html) {
    const w = div('woodsign', root, `left:${x}px;top:${y}px`);
    div('board', w, '', html); div('pole', w);
    return w;
  }
  function cliff(root, x, w, side) {
    tile(root, 'cliff', 3, x, 428, w, 112);
    div('abs', root, `left:${side === 'L' ? x + w - 18 : x}px;top:428px;width:18px;height:112px;background:rgba(7,22,47,.4)`);
    tile(root, 'grassTop', 3, x, 406, w, 30);
  }
  const lamp = (root, x, y) => { sp('haloLamp', 3, root, x - 18, y - 30, 'flicker'); sp('lamp', 3, root, x, y); };
  function flowers(root, list) { list.forEach(([x, y, k]) => sp(`flower${k}`, 3, root, x, y)); }

  /* ---------------- INTRO: night world + rope bridge over the spike pit ---------------- */
  function buildMeadow() {
    const root = $('meadow'); root.innerHTML = '';
    div('sky night', root);
    starsField(root, 52, 300);
    [[210, 70], [520, 36], [872, 150], [60, 232], [680, 110]].forEach(([x, y], i) => { sp('sparkle', 3, root, x, y, 'twk').style.animationDelay = `${i * 0.35}s`; });
    sp('haloMoon', 3, root, 211, -21, 'flicker'); sp('moon', 3, root, 262, 30);
    ocean(root, 318, 222);
    const big = island(root, 'islandL', 3, 20, 158, 0);
    div('waterfall', big.g, 'left:112px;top:66px;height:200px;z-index:-1'); div('waterfall', big.g, 'left:190px;top:56px;height:210px;width:16px;z-index:-1');
    sp('castle', 2, big.g, 74, -96); sp('pine', 2, big.g, 14, -56); sp('pine', 2, big.g, 196, -56); sp('catFlag', 2, big.g, 44, -46);
    const r1 = island(root, 'islandM', 3, 712, 176, -1.4);
    div('waterfall', r1.g, 'left:70px;top:62px;height:190px;width:16px;z-index:-1');
    sp('pine', 2, r1.g, 14, -58); sp('pine', 2, r1.g, 48, -52); sp('catFlag', 2, r1.g, 102, -46);
    signboard(r1.g, 20, 40, 'BOARD<br>STUDIO');
    island(root, 'islandS', 2, 430, 118, -0.7); island(root, 'islandS', 2, 604, 74, -2.1);
    blimp(root, 34, 48);
    clouds(root, [[60, 0, 'cloudL', 3], [500, 14, 'cloudS', 3], [820, 4, 'cloudL', 2]], 110, 286, 'opacity:.9');

    // spike pit between the cliffs
    div('abs pit', root, 'left:270px;top:430px;width:420px;height:110px');
    tile(root, 'spikeTall', 2, 280, 486, 400, 56);
    cliff(root, 0, 290, 'L'); cliff(root, 670, 290, 'R');
    sp('pine', 3, root, 4, 312); sp('pine', 3, root, 890, 312);
    const signL = woodSign(root, 36, 318, 'SHORT<br>CUT →');
    const signR = woodSign(root, 806, 312, `TRAP<br>ZONE ${icon('skull', 2, 'vertical-align:-6px')}`); signR.style.opacity = 0;
    lamp(root, 232, 318); lamp(root, 692, 318);
    const cats = [sp('cat', 3, root, 172, 382), sp('cat', 3, root, 744, 382)];
    flowers(root, [[100, 414, 0], [150, 424, 1], [220, 418, 2], [760, 420, 3], [840, 416, 0], [920, 424, 1]]);

    // rope bridge
    const x0 = 282, x1 = 678, deck = t => 434 + Math.sin(Math.PI * t) * 12, rail = t => 400 + Math.sin(Math.PI * t) * 6;
    const pts = f => Array.from({ length: 25 }, (_, i) => { const t = i / 24; return `${Math.round(x0 + (x1 - x0) * t)},${Math.round(f(t))}`; }).join(' ');
    const hang = Array.from({ length: 9 }, (_, i) => { const t = (i + 0.5) / 9, x = Math.round(x0 + (x1 - x0) * t); return [x, Math.round(rail(t)), Math.round(deck(t) + 4)]; });
    const rope = (p, w, c) => `<polyline points="${p}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
    const ropes = div('abs', root, 'left:0;top:0;width:960px;height:540px;transition:opacity .15s steps(2)', `
      <svg width="960" height="540" viewBox="0 0 960 540" shape-rendering="crispEdges" style="position:absolute;left:0;top:0">
        ${rope(pts(rail), 7, '#07162F')}${rope(pts(rail), 3, '#B76C43')}
        ${hang.map(([x, a, b]) => `<line x1="${x}" y1="${a}" x2="${x}" y2="${b}" stroke="#07162F" stroke-width="5"/><line x1="${x}" y1="${a}" x2="${x}" y2="${b}" stroke="#8C4E32" stroke-width="2"/>`).join('')}
        ${rope(pts(t => deck(t) + 10), 7, '#07162F')}${rope(pts(t => deck(t) + 10), 3, '#8C4E32')}
      </svg>`);
    const planks = Array.from({ length: 12 }, (_, i) => { const t = (i + 0.5) / 12; return sp('plank', 3, root, Math.round(x0 + (x1 - x0) * t - 18), Math.round(deck(t) - 6)); });
    sp('post', 3, root, x0 - 14, 384); sp('post', 3, root, x1 - 10, 384);

    return { root, planks, ropes, signL, signR, cats, party: party(root, [364, 444, 524], 354, 'normal') };
  }

  /* ---------------- DUNGEON (trap zone) ---------------- */
  const PROPS = [
    { id: 'rock', x: 6, y: 420, s: 3, msg: '돌멩이다. 아무것도 없다.' },
    { id: 'skull', x: 606, y: 362, s: 3, msg: '해골이 웃고 있다… 열쇠는 없다.' },
    { id: 'crate', x: 598, y: 396, s: 3, msg: '텅 빈 상자다.' },
    { id: 'planks', x: 684, y: 432, s: 3, msg: '거미줄뿐이다.' },
    { id: 'chest', x: 804, y: 414, s: 3, msg: '누가 이미 털어갔다!' },
    { id: 'barrel', x: 890, y: 352, s: 3, msg: '찰랑… 물만 들었다.' },
    { id: 'skullSign', x: 694, y: 306, s: 3, msg: '"위험" 표지판뿐이다.' },
    { id: 'warn', x: 236, y: 262, s: 3, msg: '경고판 뒤엔 벽뿐이다.' },
  ];

  function buildDungeon() {
    const root = $('dungeon'); root.innerHTML = '';
    tile(root, 'wall', 3, 0, 0, 960, 390);
    div('abs', root, 'left:0;top:0;width:960px;height:110px;background:linear-gradient(180deg,rgba(7,22,47,.75) 0 30%,rgba(7,22,47,.45) 30% 62%,rgba(7,22,47,.18) 62%)');
    // glowing lava cracks in the back wall
    [[596, 250], [700, 118], [150, 40]].forEach(([x, y]) => { sp('haloFire', 3, root, x + 28 - 69, y + 48 - 69, 'flicker'); sp('lavaCrack', 2, root, x, y); });
    tile(root, 'spikeDown', 2, 0, 0, 960, 48);
    tile(root, 'floor', 3, 0, 386, 960, 160);
    div('abs', root, 'left:0;top:382px;width:960px;height:8px;background:#1C1836;box-shadow:0 4px 0 #2B2650');
    [[118, 76], [212, 140], [920, 120]].forEach(([x, h]) => tile(root, 'chain', 3, x, 30, 21, h, 'swing'));

    // exit door (skull keystone)
    const door = div('abs', root, 'left:372px;top:118px;width:216px;height:272px');
    const doorRays = div('abs', door, 'left:-92px;top:-40px;width:400px;height:400px;opacity:0;transition:opacity .4s steps(4);background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,242,181,.8) 0 8deg,transparent 8deg 24deg);-webkit-mask:radial-gradient(circle,#000 0 30%,rgba(0,0,0,.5) 30% 50%,transparent 50%);mask:radial-gradient(circle,#000 0 30%,rgba(0,0,0,.5) 30% 50%,transparent 50%)');
    div('abs', door, 'left:40px;top:44px;width:136px;height:228px;background:#07162F');
    const light = div('abs', door, 'left:40px;top:44px;width:136px;height:228px;opacity:0;transition:opacity .5s steps(5);background:linear-gradient(180deg,#FFFFFF 0 25%,#FFF2B5 25% 55%,#FFE894 55% 80%,#FFD95F 80%)');
    const leafL = sp('leaf', 4, door, 40, 48); const leafR = sp('leaf', 4, door, 108, 48);
    leafL.style.transformOrigin = '0 50%'; leafR.style.transformOrigin = '100% 50%'; leafR.style.transform = 'scaleX(-1)';
    [leafL, leafR].forEach(l => { l.style.transition = 'transform .9s steps(6)'; });
    sp('arch', 4, door, 0, 0);

    const sirenGlow = sp('haloRed', 3, root, 387, -2); sirenGlow.style.opacity = 0;
    sp('siren', 4, root, 450, 70);

    [292, 638].forEach(x => {
      sp('haloFire', 3, root, x + 15 - 69, 176 - 69, 'flicker');
      sp('torch', 3, root, x, 196);
      div('abs flame', root, `left:${x - 3}px;top:160px;background-image:url(${S.flame.url});image-rendering:pixelated`);
    });
    // team banner
    sp('banner', 3, root, 792, 64);
    div('vss-text', root, 'left:804px;top:96px', 'VISUAL<br>SYSTEMS<br>SQUAD');
    sp('haloPurple', 3, root, 858, 266, 'flicker'); sp('crystal', 3, root, 900, 300);
    sp('haloBlue', 3, root, -40, 300, 'flicker'); sp('crystal', 2, root, 8, 352);

    const tablet = div('abs tablet', root, 'left:34px;top:246px;width:168px;height:96px');
    const tabletGlow = sp('haloGold', 3, tablet, -20, -60); tabletGlow.style.opacity = 0;
    sp('tablet', 4, tablet, 0, 0);
    const tabletRunes = div('tablet-runes', tablet);

    const glow = div('lava-glow', root, 'left:0;top:430px;width:960px;height:76px');
    const lava = tile(root, 'lava', 3, 0, 504, 960, 36, 'lava');
    sp('bridgeL', 3, root, 404, 498); sp('bridgeR', 3, root, 560, 498);
    const spikes = [tile(root, 'spike', 2, 0, 472, 360, 32), tile(root, 'spike', 2, 600, 472, 360, 32)];
    spikes.forEach(s => { s.style.transition = 'transform .5s steps(5), opacity .5s steps(5)'; });

    const props = PROPS.map(p => {
      const el = div('prop', root, `left:${p.x}px;top:${p.y}px`);
      const img = sp(p.id, p.s, el);
      div('q', el, '', '?');
      const w = S[p.id].w * p.s, h = S[p.id].h * p.s;
      return { ...p, el, img, cx: p.x + w / 2, cy: p.y + h / 2, w, h };
    });

    // escape button on its stone pedestal
    const btn = div('', root); btn.id = 'escBtn';
    div('rays', btn);
    sp('haloRed', 3, btn, null, null, 'glow');
    sp('pedestal', 3, btn, null, null, 'ped');
    div('push-plate', btn, '', 'PUSH');
    const capwrap = div('capwrap', btn);
    sp('capUp', 3, capwrap, null, null, 'cap');
    const locks = div('locks', btn);
    [62, -62].forEach(a => { const c = tile(locks, 'chain', 2, 77, 2, 14, 130); c.style.transform = `rotate(${a}deg)`; });
    sp('lock', 4, locks, 58, 36);
    const hitbox = div('hitbox', btn);
    const label = div('frame dark', root); label.id = 'escLabel';

    // the team peeks over a low stone wall
    const P = party(root, [88, 176, 264], -160, 'dizzy');
    P.forEach(c => { c.el.style.zIndex = 5; });
    tile(root, 'block', 3, 70, 436, 300, 36).style.zIndex = 6;
    sp('cat', 3, root, 330, 393).style.zIndex = 7;
    return { root, door: { rays: doorRays, light, leafL, leafR }, sirenGlow, tablet, tabletGlow, tabletRunes, lava, glow, spikes, props, btn, locks, hitbox, label, party: P };
  }

  /* ---------------- VICTORY: VISUAL SYSTEMS HQ ---------------- */
  function buildVictory() {
    const root = $('victory'); root.innerHTML = '';
    div('sky', root);
    starsField(root, 16, 190);
    div('abs spin', root, 'left:80px;top:-280px;width:800px;height:800px;opacity:.45;background:repeating-conic-gradient(from 0deg,rgba(255,242,181,.9) 0 7deg,transparent 7deg 20deg);-webkit-mask:radial-gradient(circle,#000 0 20%,rgba(0,0,0,.55) 20% 36%,rgba(0,0,0,.25) 36% 50%,transparent 50%);mask:radial-gradient(circle,#000 0 20%,rgba(0,0,0,.55) 20% 36%,rgba(0,0,0,.25) 36% 50%,transparent 50%);animation-duration:24s');
    ocean(root, 330, 210);
    clouds(root, [[30, 70, 'cloudL', 3], [480, 150, 'cloudS', 3], [820, 60, 'cloudL', 2], [1100, 130, 'cloudS', 2]], 110);
    const a = island(root, 'islandM', 3, 18, 190, -1);
    div('waterfall', a.g, 'left:70px;top:60px;height:200px;z-index:-1'); sp('castle', 2, a.g, 22, -94);
    signboard(a.g, 6, 40, 'IMAGE LAB');
    const b = island(root, 'islandM', 3, 800, 176, -2);
    div('waterfall', b.g, 'left:52px;top:60px;height:200px;z-index:-1'); sp('pine', 2, b.g, 20, -58); sp('pine', 2, b.g, 56, -52); sp('catFlag', 2, b.g, 104, -46);
    signboard(b.g, 18, 40, 'PIPELINE CORE');
    island(root, 'islandS', 2, 700, 64, -0.4); island(root, 'islandS', 2, 214, 44, -1.6);
    blimp(root, 96, 36);
    clouds(root, [[0, 0, 'cloudL', 4], [520, 20, 'cloudL', 3], [980, 4, 'cloudS', 4]], 80, 352);
    tile(root, 'cliff', 3, 0, 450, 960, 90);
    tile(root, 'grassTop', 3, 0, 424, 960, 30);
    sp('haloPortal', 3, root, 480 - 135, 336 - 135, 'flicker');
    sp('hqGate', 3, root, 480 - 111, 268);
    div('hq-sign', root, 'left:408px;top:313px;width:144px;line-height:24px', 'VISUAL SYSTEMS HQ');
    sp('pine', 3, root, -4, 330); sp('pine', 3, root, 52, 342); sp('pine', 3, root, 846, 330); sp('pine', 3, root, 902, 342);
    lamp(root, 300, 336); lamp(root, 642, 336);
    sp('catFlag', 3, root, 336, 360); sp('catFlag', 3, root, 590, 360);
    flowers(root, [[120, 440, 0], [180, 452, 1], [250, 444, 2], [330, 456, 3], [620, 452, 1], [700, 444, 2], [770, 456, 3], [850, 446, 0]]);
    sp('cat', 3, root, 196, 402); sp('cat', 3, root, 720, 402);
    const P = party(root, [352, 444, 536], 344, 'happy');
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
