/* TRAP ESCAPE — game flow */
(() => {
  const $ = id => document.getElementById(id);
  const { div, sp, icon } = SC;
  const SPR = PX.SPR;
  const ui = $('ui');
  const WIKI_URL = 'https://app.notion.com/p/Visual-Systems-Wiki-26356f01f431808494cffc6f411b129e?source=copy_link';

  const S = {
    phase: 'intro', mission1: false, mission2: false, mission3: false,
    escapeUnlocked: false, gameCompleted: false, soundEnabled: true,
    current: 0, hearts: 3, mistakes: 0, t0: 0, tEnd: 0,
  };
  window.TRAP = S; // handy for debugging in the console

  let RUN = 0, D = null, timerId = null, confettiId = null;
  const CANCEL = Symbol('cancel');
  const sleep = ms => { const r = RUN; return new Promise((res, rej) => setTimeout(() => (r === RUN ? res() : rej(CANCEL)), ms)); };
  const guard = fn => async (...a) => { try { await fn(...a); } catch (e) { if (e !== CANCEL) console.error(e); } };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fmt = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const faces = (f, mode) => D.party.forEach(c => { c.setFace(f); if (mode !== undefined) c.mode(mode); });
  const stagePos = el => {
    const r = el.getBoundingClientRect(), st = $('stage').getBoundingClientRect(), k = st.width / 960;
    return { x: (r.left + r.width / 2 - st.left) / k, y: (r.top + r.height / 2 - st.top) / k };
  };
  const shakeEl = el => { el.classList.remove('shake-sm'); void el.offsetWidth; el.classList.add('shake-sm'); };

  /* ---------- stage fit ---------- */
  function fit() {
    const s = Math.min(innerWidth / 984, innerHeight / 564);
    $('stage').style.transform = `translate(-50%,-50%) scale(${s})`;
  }
  addEventListener('resize', fit); addEventListener('orientationchange', fit); fit();

  /* ---------- sound toggle ---------- */
  const muteBtn = $('mute');
  const renderMute = () => { muteBtn.style.backgroundImage = `url(${SPR[S.soundEnabled ? 'spkOn' : 'spkOff'].url})`; };
  muteBtn.onclick = e => { e.stopPropagation(); S.soundEnabled = !S.soundEnabled; SND.init(); SND.setEnabled(S.soundEnabled); renderMute(); };
  renderMute();

  /* ---------- team badge: always on screen ---------- */
  div('', $('stage'), '', `${icon('squad', 3)}<div><b>VISUAL SYSTEMS</b><span>SQUAD</span></div>`).id = 'squad';

  const show = name => ['meadow', 'dungeon', 'victory'].forEach(n => { $(n).hidden = n !== name; });

  /* ---------- UI pieces ---------- */
  async function banner(html, ms = 1100, top, cls = 'band') {
    const b = div(`center ghost pop-c ${cls}`, ui, `z-index:25${top ? `;top:${top}px` : ''}`, html);
    try { await sleep(ms); } finally { b.classList.remove('pop-c'); b.classList.add('out-c'); setTimeout(() => b.remove(), 260); }
  }

  async function dialog(lines, faceId) {
    const d = div('frame dialog', ui, 'z-index:22', `<div class="face"><img src="${SPR[faceId].url}" alt=""></div><div class="txt ko"></div><div class="next">▼</div>`);
    const txt = d.querySelector('.txt');
    let skip = false;
    d.onclick = () => { skip = true; SND.click(); };
    try {
      for (const line of lines) {
        skip = false; txt.textContent = '';
        for (let i = 0; i < line.length && !skip; i++) { txt.textContent += line[i]; if (i % 3 === 0) SND.beep(false); await sleep(26); }
        txt.textContent = line; skip = false;
        const until = Date.now() + 1100 + line.length * 28;
        while (!skip && Date.now() < until) await sleep(40);
      }
    } finally { d.remove(); }
  }

  function buildHUD() {
    const h = div('frame', ui, '', `
      <div class="ttl sm red h-title">TRAP ESCAPE</div>
      <div class="hearts"></div>
      <div class="row"><span>MISSIONS</span><b id="hudCount">0 / 3</b></div>
      <div class="bar"><i></i><i></i><i></i></div>
      ${['KEY', 'WIRES', 'LOCK'].map((n, i) => `<div class="m" data-m="${i + 1}"><span class="box"><img src="${SPR.check.url}" alt=""></span>${n}</div>`).join('')}
      <div class="time">TIME <b id="hudTime">00:00</b></div>`);
    h.id = 'hud'; h.classList.add('pop');
    renderHearts(); updateHUD();
  }
  function renderHearts() {
    const w = document.querySelector('#hud .hearts'); if (!w) return;
    w.innerHTML = '';
    for (let i = 0; i < 3; i++) sp(i < S.hearts ? 'heart' : 'heartEmpty', 3, w);
  }
  const doneCount = () => [1, 2, 3].filter(i => S['mission' + i]).length;
  function updateHUD() {
    const h = $('hud'); if (!h) return;
    const n = doneCount();
    $('hudCount').textContent = `${n} / 3`;
    h.querySelectorAll('.bar i').forEach((b, i) => b.classList.toggle('on', i < n));
    h.querySelectorAll('.m').forEach(m => {
      const k = +m.dataset.m;
      m.classList.toggle('done', S['mission' + k]);
      m.classList.toggle('now', !S['mission' + k] && k === S.current);
    });
  }
  // no game over: hearts only cost stars at the end
  function loseHeart(x = 130, y = 60) {
    SND.heart(); S.mistakes++;
    if (S.hearts > 0) { S.hearts--; renderHearts(); SC.floatText(x, y, `<span style="color:#FF5663">-1 ♥</span>`); }
    else SC.floatText(x, y, '하트 0… 근성으로 버틴다!');
  }

  function questSign(tag, title, desc, count) {
    let q = $('quest');
    if (!q) { q = div('wood', ui); q.id = 'quest'; }
    q.innerHTML = `
      <div class="chainL tile" style="background-image:url(${SPR.chain.url})"></div>
      <div class="chainR tile" style="background-image:url(${SPR.chain.url})"></div>
      <div class="tag">${tag}</div>
      <div class="ttl sm q-title">${title}</div>
      <div class="q-desc ko">${desc}</div>
      ${count ? `<div class="q-count" id="qCount">${count}</div>` : ''}`;
    q.classList.remove('enter'); void q.offsetWidth; q.classList.add('enter');
    SND.whoosh();
  }

  function escLabel() {
    const l = D.label;
    if (S.escapeUnlocked) {
      l.classList.add('ready');
      l.innerHTML = `<div class="l1">${icon('warn', 1, 'margin:-6px 6px 0 0')}MASH!</div><div class="l2">PUSH TO ESCAPE</div><div class="gauge"><i></i></div>`;
    } else {
      l.innerHTML = `<div class="l1">${icon('lock', 1, 'margin:-4px 8px 0 0')}LOCKED</div><div class="l2">MISSIONS ${doneCount()} / 3</div>`;
    }
  }

  function startTimer() {
    S.t0 = Date.now(); clearInterval(timerId);
    timerId = setInterval(() => { const t = $('hudTime'); if (t) t.textContent = fmt(Date.now() - S.t0); }, 250);
  }

  /* ---------- TITLE ---------- */
  function title() {
    RUN++; clearInterval(timerId); clearInterval(confettiId);
    ui.innerHTML = ''; $('vignette').className = ''; $('fx').innerHTML = '';
    const M = SC.buildMeadow(); show('meadow');
    const t = div('abs', ui, 'left:0;top:0;width:960px;height:540px;pointer-events:none');
    div('center logo', t, 'top:104px', '<div class="ttl red t1">TRAP</div><div class="ttl blue t2">ESCAPE</div>');
    div('center', t, 'top:214px', `<div class="ribbon">${icon('sparkle', 2)}VISUAL SYSTEMS SQUAD${icon('sparkle', 2)}</div>`);
    div('center tagline', t, 'top:248px', '- ONE PUSH, A BRIGHTER TOMORROW -');
    div('corner', t, 'left:22px;bottom:16px', `${icon('heart', 2)}${icon('heart', 2, 'margin-left:4px')}${icon('heart', 2, 'margin-left:4px')}<span class="loadbar"><i></i></span><br>LOADING...<br>A MORE VISUAL WORLD`);
    div('corner', t, 'right:22px;bottom:16px;text-align:right', 'v1.0<br>VISUAL SYSTEMS SQUAD<br>ALL RIGHTS RESERVED.');
    const wrap = div('abs', t, 'left:0;right:0;top:262px;display:flex;justify-content:center;pointer-events:auto');
    const b = document.createElement('button');
    b.className = 'pbtn'; b.style.position = 'relative'; b.innerHTML = '▶ START';
    wrap.appendChild(b);
    b.onclick = () => { b.classList.add('down'); startGame(); };
    let k = 0;
    const chat = setInterval(() => {
      if (!document.body.contains(t)) return clearInterval(chat);
      M.party[k % M.party.length].say(['♪', '♥', '~', '!'][k % 4], 900); k++;
    }, 1300);
  }

  /* ---------- INTRO → EMERGENCY ---------- */
  const startGame = guard(async () => {
    RUN++;
    SND.init(); SND.setEnabled(S.soundEnabled); SND.start();
    Object.assign(S, { phase: 'intro', mission1: false, mission2: false, mission3: false, escapeUnlocked: false, gameCompleted: false, current: 0, hearts: 3, mistakes: 0 });
    clearInterval(timerId); clearInterval(confettiId);
    ui.innerHTML = ''; $('vignette').className = ''; $('fx').innerHTML = '';
    const M = SC.buildMeadow(); show('meadow');
    D = SC.buildDungeon(); escLabel();

    // 1) peaceful world
    SND.play('meadow');
    M.party.forEach(c => c.mode('walk'));
    await sleep(350);
    M.party[0].say('♪', 1300); M.party[2].say('날씨 좋다~', 1600, true);
    await sleep(1800);
    M.party.forEach(c => c.mode(null));

    // 2) the bridge creaks — wrong path!
    SND.stop(); SND.warning(); SC.flash(true);
    M.party.forEach(c => { c.setFace('shock'); c.say('!!', 1200); c.mode('recoil'); });
    M.planks.forEach((p, i) => { p.style.animationDelay = `${(i % 3) * 0.06}s`; p.classList.add('wiggle'); });
    M.signL.querySelector('.board').innerHTML = `WRONG<br>PATH! ${icon('skull', 2, 'vertical-align:-6px')}`;
    M.signL.classList.add('wiggle');
    M.signR.style.opacity = 1; M.signR.classList.add('pop');
    M.cats.forEach(c => { c.src = SPR.catShock.url; c.classList.add('recoil-cat'); });
    const w = div('center ghost pop-c band band-red', ui, 'top:176px', '<div class="ttl rtxt blink" style="font-size:36px">!!! WARNING !!!</div>');
    SND.rumble(1.4); SC.shake(1200);
    await sleep(950);
    w.remove();

    // 3) snap! the bridge breaks and everyone falls — EMERGENCY
    SND.cut(); SND.fall();
    M.ropes.style.opacity = 0;
    M.planks.forEach((p, i) => p.animate(
      [{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${(Math.random() - 0.5) * 140}px, ${240 + Math.random() * 120}px) rotate(${(Math.random() - 0.5) * 540}deg)` }],
      { duration: 900 + Math.random() * 400, delay: Math.abs(i - 6) * 40, easing: 'steps(12)', fill: 'forwards' }));
    M.party.forEach((c, i) => {
      c.setFace('panic');
      c.el.style.transition = 'top 1.7s steps(17), transform 1.7s steps(17)';
      c.el.style.top = '640px'; c.el.style.transform = `rotate(${(i % 2 ? 1 : -1) * 30}deg)`;
    });
    M.party[1].say('으아악!', 1100, true);
    $('vignette').className = 'on'; SND.alarm(); SC.flash(true); SC.shake(900);
    const EMG = `
      <div class="emg-rays">${[0, 1, 2, 3, 4, 5, 6].map(i => `<i style="transform:rotate(${-66 + i * 22}deg)"></i>`).join('')}</div>
      ${icon('siren', 5, 'position:absolute;left:50%;top:22px;margin-left:-37px;z-index:2')}
      <div class="emg-plate"><div class="hz"></div><div class="ttl rtxt emg-t">EMERGENCY</div><div class="hz"></div></div>
      ${[['left:-30px;top:64px', 0], ['left:6px;top:196px', 0.3], ['right:-30px;top:64px', 0.15], ['right:6px;top:196px', 0.45]]
        .map(([pos, d]) => icon('warnRed', 4, `position:absolute;${pos};animation-delay:${d}s;animation-duration:.6s`).replace('<img', '<img class="bobble"')).join('')}`;
    await banner(EMG, 2000, 196, 'emg');
    const blk = div('abs ghost', ui, 'left:0;top:0;width:960px;height:540px;background:#07162F;opacity:0;transition:opacity .25s steps(3);z-index:40');
    void blk.offsetWidth; blk.style.opacity = 1;
    await sleep(420);
    show('dungeon');
    blk.style.opacity = 0; setTimeout(() => blk.remove(), 400);

    // 3) crash-land in the trap room
    for (const [i, c] of D.party.entries()) {
      c.el.style.transition = 'top .32s steps(4)'; c.moveTo(parseInt(c.el.style.left, 10), 372);
      await sleep(300);
      SND.thud(); SC.shake(260, true);
      SC.particles(parseInt(c.el.style.left, 10) + 36, 455, 10, ['#6F7FC4', '#5160A6', '#FFF2D2'], { up: true, dist: 50 });
      c.say(['@_@', '?!', '아야'][i], 1100, i === 2);
    }
    await sleep(500);

    // 4) TRAP ZONE
    S.phase = 'trap';
    D.sirenGlow.style.opacity = ''; D.sirenGlow.classList.add('blink');
    SC.flash(true); SC.shake(500);
    faces('panic');
    await banner(`${icon('skull', 4)}<div class="ttl rtxt" style="font-size:44px;margin-top:16px">TRAP ZONE</div>`, 1600, 220, 'band band-red');
    SND.play('dungeon');
    const arrow = div('abs ghost ttl gold', ui, 'left:470px;top:262px;font-size:20px;z-index:21', '▼');
    arrow.classList.add('bobble'); arrow.style.animationDuration = '.4s';
    await dialog(['함정에 빠졌습니다!', '출구는 잠겨 있다… 저 빨간 버튼이 탈출 장치인가?', '잠금을 풀려면 3개의 미션을 완료해야 한다!'], 'jin_panic');
    arrow.remove();

    buildHUD(); startTimer();
    await mission1();
    await mission2();
    await mission3();
    await escapeReady();
  });

  /* ---------- shared: mission complete ---------- */
  async function missionComplete(n) {
    S['mission' + n] = true; S.current = n + 1;
    updateHUD(); escLabel(); SND.complete(); SC.flash();
    SC.sparkles(480, 250, 10, 180);
    faces('happy', 'jump');
    const all = doneCount() === 3;
    await banner(all
      ? `<div class="ttl sm blue" style="font-size:44px">3 / 3</div><div class="ttl gold" style="font-size:40px;margin-top:30px">ALL MISSIONS<br>COMPLETE!</div>`
      : `<div class="ttl gold" style="font-size:40px">${icon('check', 5, 'margin:-14px 16px 0 0')}MISSION<br>COMPLETE!</div><div class="ttl sm blue" style="font-size:22px;margin-top:28px">${doneCount()} / 3</div>`, all ? 1700 : 1300);
    faces('focus', null);
  }

  /* ---------- MISSION 01 — FIND THE KEY (3 pieces, 2 bat traps) ---------- */
  function batAttack(p) {
    const b = sp('bat', 4, $('fx'), p.cx - 30, p.cy - 16);
    b.animate([
      { transform: 'translate(0,0) scale(.3)' }, { transform: 'translate(-50px,-70px) scale(1.3)' },
      { transform: 'translate(60px,-140px) scale(1.1) scaleY(.6)' }, { transform: 'translate(-40px,-220px) scale(1)' },
      { transform: 'translate(120px,-360px) scale(.8)', opacity: 0 },
    ], { duration: 1100, easing: 'steps(12)', fill: 'forwards' }).onfinish = () => b.remove();
  }

  async function mission1() {
    S.phase = 'mission'; S.current = 1; updateHUD();
    const NEED = 3;
    const count = n => `${icon('key', 2)}&nbsp; ${n} / ${NEED}`;
    questSign('MISSION 01', 'FIND THE KEY', `열쇠 조각 ${NEED}개를 찾아라!`, count(0));
    faces('focus');
    D.party[0].say('어디 있지?', 1600, true);
    setTimeout(() => D.party[1] && D.party[1].say('박쥐 조심해!', 1500, true), 900);
    const props = D.props;
    const kind = {};
    shuffle(props.map((_, i) => i)).forEach((pi, k) => { kind[pi] = k < NEED ? 'piece' : k < NEED + 2 ? 'bat' : 'empty'; });
    let got = 0, stunned = false;
    const run = RUN;
    props.forEach(p => p.el.classList.add('live'));
    await new Promise(res => props.forEach((p, i) => {
      p.el.onclick = () => {
        if (run !== RUN || stunned || !p.el.classList.contains('live')) return;
        p.el.classList.remove('live'); p.el.classList.add('searched');
        p.img.classList.remove('wiggle'); void p.img.offsetWidth; p.img.classList.add('wiggle');
        if (kind[i] === 'piece') {
          got++;
          SND.key(); SC.sparkles(p.cx, p.cy - 20, 6, 40);
          SC.particles(p.cx, p.cy, 10, ['#FFD95F', '#FFF2B5', '#FFC94D'], { up: true, dist: 60 });
          const k = sp('key', 3, $('fx'), p.cx - 24, p.cy - 12);
          k.animate([{ transform: 'translateY(0) scale(.3)' }, { transform: 'translateY(-50px) scale(1.2)' }, { transform: `translate(${480 - p.cx}px, ${140 - p.cy}px) scale(.6)`, opacity: 0.3 }],
            { duration: 900, easing: 'steps(9)', fill: 'forwards' }).onfinish = () => k.remove();
          SC.floatText(p.cx, p.y - 34, `<span style="color:#FFD95F">열쇠 조각 발견!</span> ${got}/${NEED}`);
          const q = $('qCount'); if (q) q.innerHTML = count(got);
          if (got === NEED) res();
        } else if (kind[i] === 'bat') {
          stunned = true;
          SND.zap(); SND.wrong(); SC.flash(true); SC.shake(400, true); loseHeart();
          div('x', p.el, '', 'X'); batAttack(p);
          SC.floatText(p.cx, p.y - 34, '<span style="color:#FF5663">박쥐 습격!</span> 잠시 기절…');
          faces('dizzy', 'recoil');
          setTimeout(() => { if (run === RUN) { stunned = false; if (!S.mission1) faces('focus', null); } }, 1400);
        } else {
          div('x', p.el, '', 'X'); SND.bonk();
          SC.floatText(p.cx, p.y - 34, `<span style="color:#FF5663">✕</span> ${p.msg}`);
          const c = D.party[i % D.party.length]; c.setFace('dizzy'); c.mode('recoil');
          setTimeout(() => { if (run === RUN && !S.mission1) c.setFace('focus'); }, 700);
        }
      };
    }));
    props.forEach(q => { q.el.classList.remove('live'); q.el.onclick = null; });
    await sleep(700);
    // the three pieces fuse into one key
    SND.key(); SC.flash();
    const key = sp('key', 6, $('fx'), 480 - 51, 200);
    key.animate([{ transform: 'scale(0) rotate(-30deg)' }, { transform: 'scale(1.3) rotate(10deg)' }, { transform: 'scale(1)' }], { duration: 500, easing: 'steps(6)', fill: 'forwards' });
    SC.sparkles(480, 220, 12, 120);
    SC.floatText(480, 170, '<span class="ttl sm gold" style="font-size:16px">KEY ASSEMBLED!</span>', '');
    await sleep(1000);
    key.animate([{ transform: 'scale(1)' }, { transform: 'translate(-400px, 20px) scale(.3)', opacity: 0.2 }], { duration: 500, easing: 'steps(6)', fill: 'forwards' });
    await sleep(520); key.remove();
    await missionComplete(1);
  }

  /* ---------- MISSION 02 — CUT THE WIRES (defusal manual, real timer) ---------- */
  const WIRES = {
    red: { c: '#FF3B47', hi: '#FF8A8A', lo: '#C8172F' },
    blue: { c: '#398FE3', hi: '#8AD7FF', lo: '#1D4E9E' },
    yellow: { c: '#FFD23E', hi: '#FFF2B5', lo: '#E09A2E' },
    green: { c: '#55B957', hi: '#A2E66E', lo: '#348C46' },
  };
  const LEDS = { red: '#FF3B47', blue: '#54B8F7', green: '#7BD95A' };
  const MANUAL = `<h4>DEFUSAL MANUAL</h4><div class="sub">위에서부터! 먼저 맞는 규칙 하나만 따른다.</div>
    1. LED <b>빨강</b> → 파란 선<br>
    2. 시리얼 끝자리 <b>짝수</b> → 노란 선<br>
    3. 맨 위 선이 <b>초록</b> → 초록 선<br>
    4. 그 외 전부 → 빨간 선`;
  function bombConfig() {
    const order = shuffle(Object.keys(WIRES));
    const led = pick(Object.keys(LEDS));
    const digit = Math.floor(Math.random() * 10);
    const serial = `TR${pick([...'ABCDEFGHJKLMNPRSTUVWXYZ'])}-${10 + Math.floor(Math.random() * 90)}${digit}`;
    const ans = led === 'red' ? 'blue' : digit % 2 === 0 ? 'yellow' : order[0] === 'green' ? 'green' : 'red';
    return { order, led, serial, ans };
  }

  async function mission2() {
    S.current = 2; updateHUD();
    questSign('MISSION 02', 'CUT THE WIRES', '매뉴얼대로 올바른 선을 끊어라!');
    faces('panic'); D.party[1].say('폭탄이다!!', 1400, true);
    await sleep(600);
    const LIMIT = 20;
    const win = div('frame window win-in', ui, 'left:110px;top:132px;width:740px;height:380px;z-index:15', '<div class="wtitle">!! TRAP DEVICE !!</div>');
    sp('bomb', 3, win, 20, 52);
    const led = div('led', win, 'left:122px;top:64px');
    div('abs', win, 'left:118px;top:100px;font-family:var(--px);font-size:8px;color:var(--bl4)', 'LED');
    const serial = div('serial', win, 'left:18px;top:150px');
    const lcd = div('lcd abs', win, 'left:18px;top:222px');
    const wireBox = div('abs', win, 'left:0;top:0');
    div('manual ko', win, 'left:452px;top:52px;width:262px', MANUAL);
    const status = div('abs ko', win, 'left:18px;top:306px;width:450px;font-size:15px;line-height:1.4', '매뉴얼을 읽고 딱 하나의 선을 끊어라.');
    setTimeout(() => win.classList.remove('win-in'), 400);

    const run = RUN;
    let cfg, left, done = false, resolve;
    const solved = new Promise(r => { resolve = r; });
    const showTime = () => { lcd.textContent = `00:${String(Math.max(0, left)).padStart(2, '0')}`; lcd.classList.toggle('blink-fast', left <= 5); };
    const arm = () => {
      cfg = bombConfig(); left = LIMIT;
      led.style.background = LEDS[cfg.led];
      serial.innerHTML = `<small>SERIAL NO.</small>${cfg.serial}`;
      lcd.className = 'lcd abs'; showTime();
      wireBox.innerHTML = '';
      cfg.order.forEach((k, i) => {
        const w = WIRES[k];
        const el = div('wire', wireBox, `left:222px;width:190px;top:${56 + i * 54}px;--c:${w.c};--hi:${w.hi};--lo:${w.lo}`,
          '<i class="term t1"></i><i class="seg a"></i><i class="seg b"></i><i class="term t2"></i>');
        el.dataset.color = k;
        el.onclick = () => cut(el, k);
      });
    };
    const cut = (el, k) => {
      if (run !== RUN || done || el.classList.contains('cut')) return;
      el.classList.add('cut'); SND.cut();
      const p = stagePos(el);
      SC.particles(p.x, p.y, 12, ['#FFE894', '#FF8A3C', '#FFFFFF'], { dist: 50, gravity: 10 });
      if (k === cfg.ans) {
        done = true; clearInterval(tick); SND.disarm();
        lcd.className = 'lcd abs ok'; lcd.textContent = 'SAFE';
        status.innerHTML = '<span class="ttl sm" style="--ex:#348C46;color:#A2E66E;font-size:14px">SYSTEM DISABLED</span>';
        resolve();
      } else {
        SND.wrong(); SND.zap(); SC.flash(true); loseHeart(); shakeEl(win);
        left = Math.max(1, left - 5); showTime();
        status.innerHTML = '<span style="color:#FF5663">⚠ WRONG WIRE! -5초</span> 매뉴얼을 다시 봐!';
        faces('dizzy'); setTimeout(() => { if (run === RUN && !done) faces('panic'); }, 700);
      }
    };
    const boom = () => {
      SND.explosion(); SC.flash(true); SC.shake(700); loseHeart();
      const p = stagePos(win);
      SC.particles(p.x - 250, p.y - 80, 30, ['#FF8A3C', '#FFD95F', '#FF3B47', '#FFF2D2'], { dist: 140 });
      status.innerHTML = '<span style="color:#FF5663">BOOM!</span> 폭탄이 재설정됐다… 처음부터 다시!';
      faces('dizzy'); setTimeout(() => { if (run === RUN && !done) faces('panic'); }, 900);
      arm();
    };
    arm();
    const tick = setInterval(() => {
      if (run !== RUN || done) return clearInterval(tick);
      left--; showTime(); SND.beep(left <= 5);
      if (left <= 0) boom();
    }, 1000);
    await solved;
    await sleep(1000);
    win.classList.add('win-out'); await sleep(320); win.remove();
    await missionComplete(2);
  }

  /* ---------- MISSION 03 — OPEN THE LOCK (memorize 6 flashing runes) ---------- */
  async function mission3() {
    S.current = 3; updateHUD();
    const KINDS = ['star', 'diamond', 'circle', 'tri'], LEN = 6;
    questSign('MISSION 03', 'OPEN THE LOCK', `석판의 룬 ${LEN}개를 기억하라!`);
    const seq = [];
    while (seq.length < LEN) {
      const k = pick(KINDS);
      if (seq.length >= 2 && seq[seq.length - 1] === k && seq[seq.length - 2] === k) continue;
      seq.push(k);
    }
    const TR = D.tabletRunes;
    D.tablet.classList.add('glow'); D.tabletGlow.style.opacity = 1; D.tabletGlow.classList.add('flicker');
    const hint = div('abs ghost ttl sm gold blink', ui, 'left:40px;top:352px;font-size:12px;z-index:14', '▲ WATCH!');
    faces('focus'); D.party[2].say('벽을 봐!', 1400, true);

    const win = div('frame window blue win-in', ui, 'left:446px;top:150px;width:480px;height:300px;z-index:15', '<div class="wtitle">RUNE LOCK</div>');
    const slots = div('slots', win);
    const slotEls = seq.map(() => div('slot', slots));
    const row = div('runes busy', win);
    const status = div('status', win);
    setTimeout(() => win.classList.remove('win-in'), 400);
    let input = [], done = false, busy = true, resolve;
    const run = RUN;
    const solved = new Promise(r => { resolve = r; });
    const setStatus = (t, c) => { status.style.color = c; status.textContent = t; };
    const reset = () => { input = []; slotEls.forEach(s => { s.innerHTML = ''; }); };
    const idle = () => { TR.className = 'tablet-runes big'; TR.innerHTML = '<span class="qm">? ? ? ? ? ?</span>'; };
    const showSeq = async () => {
      busy = true; row.classList.add('busy'); setStatus('WATCH THE WALL!', '#FFD95F');
      hint.textContent = '▲ WATCH!';
      TR.className = 'tablet-runes big';
      for (let i = 0; i < LEN; i++) {
        TR.innerHTML = `<img src="${SPR['runeGold_' + seq[i]].url}" alt=""><span class="step">${i + 1}/${LEN}</span>`;
        SND.rune(KINDS.indexOf(seq[i]));
        await sleep(700);
        TR.innerHTML = '';
        await sleep(170);
      }
      idle(); hint.textContent = '▲ ???';
      busy = false; row.classList.remove('busy'); setStatus('ENTER THE CODE', '#8AD7FF');
    };

    KINDS.forEach((k, idx) => {
      const b = document.createElement('button'); b.className = 'rune-btn'; row.appendChild(b);
      sp('rune_' + k, 4, b, 16, 14);
      b.onclick = () => {
        if (run !== RUN || done || busy) return;
        SND.rune(idx);
        b.classList.add('hit-on'); setTimeout(() => b.classList.remove('hit-on'), 120);
        if (k === seq[input.length]) {
          sp('rune_' + k, 4, slotEls[input.length], 11, 11, 'pop');
          input.push(k);
          if (input.length === LEN) {
            done = true; SND.granted();
            setStatus('ACCESS GRANTED', '#7BD95A');
            slotEls.forEach(s => { s.style.boxShadow = 'inset 0 0 0 3px #7BD95A'; });
            resolve();
          }
        } else {
          SND.denied(); loseHeart(); SC.flash(true); shakeEl(win);
          setStatus('ACCESS DENIED', '#FF5663');
          busy = true; row.classList.add('busy'); reset();
          faces('dizzy');
          setTimeout(() => { if (run === RUN && !done) { faces('focus'); showSeq().catch(() => {}); } }, 1000);
        }
      };
    });

    await sleep(700);
    await showSeq();
    await solved;
    await sleep(1000);
    win.classList.add('win-out'); hint.remove();
    D.tablet.classList.remove('glow'); D.tabletGlow.style.opacity = 0; TR.innerHTML = '';
    await sleep(320); win.remove();
    await missionComplete(3);
  }

  /* ---------- ESCAPE (mash to fill the power gauge) ---------- */
  function mash() {
    return new Promise(res => {
      const run = RUN, bar = D.label.querySelector('.gauge i'), g = D.label.querySelector('.gauge');
      let power = 0, last = performance.now(), done = false;
      const draw = () => { bar.style.width = `${power * 1.46}px`; g.classList.toggle('hot', power > 70); };
      const decay = setInterval(() => {
        if (run !== RUN || done) return clearInterval(decay);
        const now = performance.now(); power = Math.max(0, power - 22 * (now - last) / 1000); last = now; draw();
      }, 50);
      D.hitbox.onclick = () => {
        if (run !== RUN || done) return;
        power = Math.min(100, power + 9); draw(); SND.pump(power);
        D.btn.classList.add('pressed'); setTimeout(() => D.btn.classList.remove('pressed'), 70);
        SC.particles(480, 390, 3, ['#FFE35B', '#FF8A3C'], { up: true, dist: 40 });
        if (power >= 100) { done = true; clearInterval(decay); D.hitbox.onclick = null; res(); }
      };
    });
  }

  async function escapeReady() {
    S.escapeUnlocked = true; S.phase = 'escape'; S.current = 4; updateHUD();
    SND.unlock(); SC.flash(); SC.shake(300, true);
    SC.particles(480, 390, 24, ['#AEB9E0', '#7885B5', '#E2E8FF', '#FFC94D'], { dist: 110 });
    D.locks.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(60px) rotate(20deg)', opacity: 0 }], { duration: 500, easing: 'steps(5)', fill: 'forwards' });
    D.btn.classList.add('ready'); escLabel();
    const q = $('quest'); if (q) q.remove();
    div('final-sign pop', ui, '', `
      ${icon('skull', 4, 'position:absolute;left:50%;top:-24px;margin-left:-28px')}
      ${icon('warnRed', 3, 'position:absolute;left:-30px;top:26px')}${icon('warnRed', 3, 'position:absolute;right:-30px;top:26px')}
      <div class="fs1 outline-ko"><span class="trap">TRAP</span>을 탈출하기 위해</div>
      <div class="fs2 outline-ko">이 <span style="color:#FFD95F">버튼</span>을 누르시오!</div>
      <div class="fs3">MASH TO ESCAPE!</div>`);
    SND.whoosh();
    faces('happy'); D.party[0].say('누르면 탈출할 수 있어!', 1800, true);
    setTimeout(() => D.party[2] && D.party[2].say('지금이야!', 1600, true), 500);
    await banner(`${icon('lock', 4)}<div class="ttl gold" style="font-size:30px;margin-top:18px">ESCAPE BUTTON</div><div class="ttl md blue" style="font-size:24px;margin-top:22px">UNLOCKED</div>`, 1400, 200);
    faces('focus');
    D.party[1].say('연타! 연타!', 1600, true);
    await mash();
    await escapeSequence();
  }

  async function escapeSequence() {
    const run = RUN;
    // 1. press
    D.btn.classList.add('pressed'); SND.press();
    await sleep(180);
    // 2. flash + 3. shake/dust
    SC.flash(); SND.explosion(); SND.stop();
    banner('<div class="ttl gold" style="font-size:40px">SYSTEM<br>ACTIVATED</div>', 1100, 200).catch(() => {});
    SC.shake(1500);
    $('vignette').className = ''; D.sirenGlow.classList.remove('blink'); D.sirenGlow.style.opacity = 0;
    faces('shock');
    const dust = setInterval(() => {
      if (run !== RUN) return clearInterval(dust);
      SC.particles(80 + Math.random() * 800, 380 + Math.random() * 80, 6, ['#6F7FC4', '#5160A6', '#FFF2D2'], { up: true, dist: 60 });
    }, 120);
    SC.rain(26, ['#5160A6', '#3A4583', '#6F7FC4'], { w: 10, h: 10, dur: 1100, spread: 900, cls: 'pt' });
    await sleep(1400);
    clearInterval(dust);
    // 4. trap disabled: spikes retract, lava cools, alarm off
    D.spikes.forEach(s => { s.style.transform = 'translateY(24px)'; s.style.opacity = 0; });
    D.lava.style.transition = 'filter .8s steps(6)'; D.lava.style.filter = 'hue-rotate(190deg) saturate(1.2) brightness(1.1)';
    D.glow.style.opacity = 0;
    D.btn.classList.remove('ready');
    D.label.classList.remove('ready'); D.label.innerHTML = '<div class="l1" style="color:#7BD95A">DISABLED</div>';
    SND.disarm();
    await banner('<div class="ttl blue" style="font-size:44px">TRAP<br>DISABLED</div>', 1100, 210);
    // 5. exit opens
    SND.door();
    D.door.light.style.opacity = 1; D.door.rays.style.opacity = 1; D.door.rays.classList.add('spin');
    D.door.leafL.style.transform = 'scaleX(.12)'; D.door.leafR.style.transform = 'scaleX(-.12)';
    const shine = setInterval(() => { if (run !== RUN) return clearInterval(shine); SC.sparkles(480, 250, 2, 80); }, 260);
    faces('happy');
    await sleep(900);
    banner('<div class="ttl gold" style="font-size:46px">EXIT OPEN</div>', 1200, 90).catch(() => {});
    // 6. everyone runs for the light
    D.party.forEach((c, i) => setTimeout(() => {
      if (run !== RUN) return;
      c.mode('walk'); c.say(['가자!', '야호!', '탈출!'][i], 900, true);
      c.el.style.transition = 'left 1s steps(10), top 1s steps(10), transform 1s steps(10), opacity 1s steps(10)';
      c.el.style.zIndex = 1; c.moveTo(444, 262); c.el.style.transform = 'scale(.5)'; c.el.style.opacity = 0;
    }, 300 + i * 300));
    await sleep(2300);
    clearInterval(shine);
    const white = div('abs ghost', ui, 'left:0;top:0;width:960px;height:540px;background:#FFF9E8;opacity:0;transition:opacity .4s steps(4);z-index:40');
    void white.offsetWidth; white.style.opacity = 1;
    await sleep(500);
    await missionClear();
  }

  /* ---------- MISSION CLEAR ---------- */
  async function missionClear() {
    S.phase = 'clear'; S.gameCompleted = true; S.tEnd = Date.now();
    clearInterval(timerId);
    const secs = Math.floor((S.tEnd - S.t0) / 1000);
    const stars = Math.max(1, Math.min(5, 2 + S.hearts - (secs > 150 ? 1 : 0)));
    const rank = stars === 5 && secs < 100 ? ['LEGEND', '전설의 탈출러'] : stars >= 4 ? ['HERO', '함정 파괴자'] : stars >= 3 ? ['ADVENTURER', '침착한 모험가'] : ['SURVIVOR', '끈질긴 생존자'];
    ui.innerHTML = ''; $('fx').innerHTML = '';
    const V = SC.buildVictory(); show('victory');
    V.party.forEach((c, i) => { c.el.style.animationDelay = `${i * 0.12}s`; c.mode('jump'); });
    const white = div('abs ghost', ui, 'left:0;top:0;width:960px;height:540px;background:#FFF9E8;opacity:1;transition:opacity .5s steps(5);z-index:40');
    void white.offsetWidth; white.style.opacity = 0; setTimeout(() => white.remove(), 600);
    SND.jingle();
    const run = RUN;
    setTimeout(() => { if (run === RUN) SND.play('victory'); }, 1900);
    const COLORS = ['#FFC94D', '#FF70B6', '#54B8F7', '#7BD95A', '#FFF9E8', '#A36FE8', '#FF5663'];
    SC.rain(90, COLORS, { spread: 1200 });
    confettiId = setInterval(() => { if (run === RUN) SC.rain(10, COLORS, { spread: 600 }); }, 900);

    const L = div('abs ghost', ui, 'left:0;top:0;width:960px;height:540px');
    const crown = div('center', L, 'top:52px');
    sp('crown', 6, div('bobble', crown, 'animation-duration:.6s'), null, null, 'pop').style.position = 'relative';
    const tt = div('center', L, 'top:132px', '<div class="ttl gold" style="font-size:50px">MISSION CLEAR!</div>');
    tt.classList.add('pop-c');
    div('center ttl md blue', L, 'top:190px;font-size:20px', 'TRAP ESCAPED');
    const starRow = div('center stars', L, 'top:244px');
    const starImgs = [0, 1, 2, 3, 4].map(() => sp('starEmpty', 4, starRow));

    div('frame cream checklist', L, 'left:34px;top:300px;width:262px', `
      ${['FIND THE KEY', 'CUT THE WIRES', 'OPEN THE LOCK'].map(n => `<div class="ci">${icon('check', 2)}${n}</div>`).join('')}
      <div class="tot">3 / 3 COMPLETE</div>`);
    div('frame dark', L, 'left:664px;top:300px;width:262px;padding:14px 20px 14px', `
      <div style="font-family:var(--px);font-size:10px;color:var(--bl4)">CLEAR TIME</div>
      <div class="ttl sm" style="font-size:24px;margin:10px 0 12px">${fmt(S.tEnd - S.t0)}</div>
      <div style="font-family:var(--px);font-size:10px;color:var(--bl4)">RANK <span style="color:var(--rd3);margin-left:10px">MISS ${S.mistakes}</span></div>
      <div class="rank" style="margin-top:8px">${rank[0]}</div>
      <div class="ko" style="font-size:14px;margin-top:6px;color:var(--cr)">${rank[1]}</div>`);

    const wrap = div('abs', ui, 'left:0;right:0;top:458px;display:flex;justify-content:center;z-index:5');
    const go = document.createElement('a');
    go.className = 'pbtn gold'; go.href = WIKI_URL; go.rel = 'noopener';
    go.target = window.self === window.top ? '_self' : '_blank'; // inside an embed (e.g. Notion) Notion can't load in the iframe → new tab
    go.style.cssText = 'position:relative;font-size:18px;padding:18px 30px 16px;text-decoration:none';
    go.innerHTML = 'ESCAPE SUCCESS ▶'; wrap.appendChild(go);
    go.onclick = () => { go.classList.add('down'); SND.click(); };

    await sleep(900);
    for (let i = 0; i < stars; i++) {
      starImgs[i].src = SPR.star.url; starImgs[i].classList.add('pop'); SND.star(i);
      const p = stagePos(starImgs[i]);
      SC.sparkles(p.x, p.y, 3, 20);
      await sleep(180);
    }
  }

  title();
})();
