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
    current: 0, hearts: 3, t0: 0, tEnd: 0,
  };
  window.TRAP = S; // handy for debugging in the console

  let RUN = 0, D = null, timerId = null, confettiId = null;
  const CANCEL = Symbol('cancel');
  const sleep = ms => { const r = RUN; return new Promise((res, rej) => setTimeout(() => (r === RUN ? res() : rej(CANCEL)), ms)); };
  const guard = fn => async (...a) => { try { await fn(...a); } catch (e) { if (e !== CANCEL) console.error(e); } };
  const clickOnce = el => new Promise(res => { el.addEventListener('click', res, { once: true }); });
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const faces = (f, mode) => D.party.forEach(c => { c.setFace(f); if (mode !== undefined) c.mode(mode); });

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
    const b = div(`center ghost pop-c ${cls}`, ui,`z-index:25${top ? `;top:${top}px` : ''}`, html);
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
  function loseHeart(x = 130, y = 60) {
    SND.heart();
    if (S.hearts > 1) { S.hearts--; renderHearts(); SC.floatText(x, y, `<span style="color:#FF5663">-1 ♥</span>`); }
    else SC.floatText(x, y, '근성으로 버틴다!');
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
      l.innerHTML = `<div class="l1">${icon('warn', 1, 'margin:-6px 6px 0 0')}READY</div><div class="l2">PUSH TO ESCAPE</div>`;
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
    div('center logo', t, 'top:128px', '<div class="ttl red t1">TRAP</div><div class="ttl gold t2">ESCAPE</div>');
    div('center ttl sm blue', t, 'top:236px;font-size:13px', 'PIXEL DUNGEON MINI GAME');
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
    Object.assign(S, { phase: 'intro', mission1: false, mission2: false, mission3: false, escapeUnlocked: false, gameCompleted: false, current: 0, hearts: 3 });
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

    // 2) sudden accident
    SND.stop(); SND.warning(); SC.flash(true);
    M.party.forEach(c => { c.setFace('shock'); c.say('!!', 1200); c.mode('recoil'); });
    const w = div('center ghost pop-c band band-red', ui, 'top:176px', '<div class="ttl rtxt blink" style="font-size:36px">!!! WARNING !!!</div>');
    M.cracks.style.opacity = 1;
    SND.rumble(1.6); SC.shake(1500);
    await sleep(900);
    M.party.forEach(c => c.setFace('panic'));
    M.hole.style.transform = 'scaleX(1)';
    await sleep(380);
    SND.fall();
    M.party.forEach((c, i) => {
      c.el.style.transition = 'top .7s steps(7), transform .7s steps(7)';
      c.el.style.top = '660px'; c.el.style.transform = `rotate(${(i % 2 ? 1 : -1) * 50}deg)`;
    });
    M.party[1].say('으아악!', 800, true);
    await sleep(650);
    w.remove();
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

    // 4) EMERGENCY
    S.phase = 'trap';
    $('vignette').className = 'on'; D.sirenGlow.style.opacity = ''; D.sirenGlow.classList.add('blink');
    SND.alarm(); SC.flash(true); SC.shake(600);
    faces('panic');
    await banner(`${icon('siren', 5)}<div class="ttl rtxt" style="font-size:60px;margin-top:14px">EMERGENCY</div><div class="ttl md red" style="font-size:22px;margin-top:30px">TRAP ZONE</div>`, 2300, 230, 'band band-red');
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

  /* ---------- MISSION 01 — FIND THE KEY ---------- */
  async function mission1() {
    S.phase = 'mission'; S.current = 1; updateHUD();
    questSign('MISSION 01', 'FIND THE KEY', '숨겨진 열쇠를 찾으세요.', `${icon('key', 2)}&nbsp; 0 / 1`);
    faces('focus');
    D.party[0].say('어디 있지?', 1600, true);
    const props = D.props;
    const keyAt = 1 + Math.floor(Math.random() * 3); // key shows up on the 2nd–4th search
    let misses = 0;
    props.forEach(p => p.el.classList.add('live'));
    const run = RUN;
    const found = await new Promise(res => {
      props.forEach(p => {
        p.el.onclick = () => {
          if (run !== RUN || !p.el.classList.contains('live')) return;
          p.el.classList.remove('live');
          p.img.classList.remove('wiggle'); void p.img.offsetWidth; p.img.classList.add('wiggle');
          const left = props.filter(q => q.el.classList.contains('live')).length;
          if (misses >= keyAt || left === 0) return res(p);
          misses++;
          p.el.classList.add('searched'); div('x', p.el, '', 'X');
          SND.bonk();
          SC.floatText(p.cx, p.y - 34, `<span style="color:#FF5663">✕</span> ${p.msg}`);
          const c = D.party[misses % D.party.length]; c.setFace('dizzy'); c.mode('recoil'); setTimeout(() => { if (run === RUN && !S.mission1) c.setFace('focus'); }, 700);
        };
      });
    });
    props.forEach(q => { q.el.classList.remove('live'); q.el.onclick = null; });
    // key pops out of the prop
    SND.key(); SC.sparkles(found.cx, found.cy - 20, 8, 50);
    SC.particles(found.cx, found.cy, 14, ['#FFD95F', '#FFF2B5', '#FFC94D'], { up: true, dist: 80 });
    const key = sp('key', 4, $('fx'), found.cx - 34, found.cy - 20);
    key.animate([{ transform: 'translateY(0) scale(.2)' }, { transform: 'translateY(-70px) scale(1.2)' }, { transform: 'translateY(-60px) scale(1)' }], { duration: 500, easing: 'steps(6)', fill: 'forwards' });
    SC.floatText(found.cx, found.cy - 120, '<span class="ttl sm gold" style="font-size:16px">KEY FOUND!</span>', '');
    const q = $('qCount'); if (q) q.innerHTML = `${icon('key', 2)}&nbsp; 1 / 1`;
    await sleep(900);
    key.animate([{ transform: 'translateY(-60px) scale(1)' }, { transform: `translate(${60 - found.cx}px, ${230 - found.cy}px) scale(.4)`, opacity: 0.2 }], { duration: 500, easing: 'steps(6)', fill: 'forwards' });
    await sleep(520); key.remove();
    await missionComplete(1);
  }

  /* ---------- MISSION 02 — CUT THE WIRES ---------- */
  async function mission2() {
    S.current = 2; updateHUD();
    questSign('MISSION 02', 'CUT THE WIRES', '폭탄을 해체하세요! 올바른 선을 끊어라.');
    faces('panic'); D.party[1].say('폭탄이다!!', 1400, true);
    await sleep(600);
    const W = [
      { name: '빨간', c: '#FF3B47', hi: '#FF8A8A', lo: '#C8172F' },
      { name: '파란', c: '#398FE3', hi: '#8AD7FF', lo: '#1D4E9E' },
      { name: '노란', c: '#FFD23E', hi: '#FFF2B5', lo: '#E09A2E' },
    ];
    const ans = Math.floor(Math.random() * 3);
    const banned = [0, 1, 2].filter(i => i !== ans)[Math.floor(Math.random() * 2)];
    const win = div('frame window win-in', ui, 'left:170px;top:128px;width:620px;height:340px;z-index:15', '<div class="wtitle">!! TRAP DEVICE !!</div>');
    sp('bomb', 4, win, 28, 58);
    const lcd = div('lcd abs', win, 'left:26px;top:196px', '00:10');
    const wires = W.map((w, i) => div('wire', win, `left:236px;top:${64 + i * 58}px;--c:${w.c};--hi:${w.hi};--lo:${w.lo}`, '<i class="term t1"></i><i class="seg a"></i><i class="seg b"></i><i class="term t2"></i>'));
    div('note ko', win, 'left:374px;top:246px;width:220px', `메모: <span style="color:${W[banned].lo}">${W[banned].name} 선</span>은<br>절대 자르지 마!`);
    const status = div('abs ko', win, 'left:20px;top:270px;width:340px;font-size:16px;line-height:1.4');
    status.textContent = '어떤 선을 끊어야 하지?';
    setTimeout(() => win.classList.remove('win-in'), 400);

    let left = 10, done = false;
    const run = RUN;
    const tick = setInterval(() => {
      if (run !== RUN || done) return clearInterval(tick);
      if (left > 0) { left--; lcd.textContent = `00:${String(left).padStart(2, '0')}`; SND.beep(left <= 3); }
      else if (!lcd.classList.contains('blink-fast')) { lcd.classList.add('blink-fast'); status.textContent = '…불발탄이었다?! 침착하게 계속 해체하자.'; }
    }, 1000);

    await new Promise(res => wires.forEach((wEl, i) => {
      wEl.onclick = () => {
        if (run !== RUN || done || wEl.classList.contains('cut')) return;
        wEl.classList.add('cut'); SND.cut();
        const r = wEl.getBoundingClientRect(), st = $('stage').getBoundingClientRect(), k = st.width / 960;
        const cx = (r.left + r.width / 2 - st.left) / k, cy = (r.top + r.height / 2 - st.top) / k;
        SC.particles(cx, cy, 12, ['#FFE894', '#FF8A3C', '#FFFFFF'], { dist: 50, gravity: 10 });
        if (i === ans) {
          done = true; clearInterval(tick); SND.disarm();
          lcd.classList.remove('blink-fast'); lcd.classList.add('ok'); lcd.textContent = 'SAFE';
          status.innerHTML = '<span class="ttl sm" style="--ex:#348C46;color:#A2E66E;font-size:14px">SYSTEM DISABLED</span>';
          res();
        } else {
          SND.wrong(); SND.zap(); SC.flash(true); loseHeart();
          win.classList.remove('shake-sm'); void win.offsetWidth; win.classList.add('shake-sm');
          status.innerHTML = '<span style="color:#FF5663">⚠ WRONG WIRE!</span> 다시 시도하세요.';
          faces('dizzy'); setTimeout(() => { if (run === RUN && !done) faces('panic'); }, 700);
        }
      };
    }));
    await sleep(1000);
    win.classList.add('win-out'); await sleep(320); win.remove();
    await missionComplete(2);
  }

  /* ---------- MISSION 03 — OPEN THE LOCK ---------- */
  async function mission3() {
    S.current = 3; updateHUD();
    questSign('MISSION 03', 'OPEN THE LOCK', '벽 석판의 순서대로 룬을 누르세요.');
    const KINDS = ['star', 'diamond', 'circle', 'tri'];
    const seq = shuffle(KINDS);
    D.tabletRunes.innerHTML = seq.map((k, i) => `<img src="${SPR['runeGold_' + k].url}" alt="">${i < 3 ? '<span class="ar">▶</span>' : ''}`).join('');
    D.tablet.classList.add('glow'); D.tabletGlow.style.opacity = 1; D.tabletGlow.classList.add('flicker');
    SND.sparkle(); SC.sparkles(118, 240, 6, 70);
    const hint = div('abs ghost ttl sm gold blink', ui, 'left:40px;top:352px;font-size:12px;z-index:14', '▲ HINT');
    faces('focus'); D.party[2].say('벽에 뭔가 있어!', 1600, true);
    await sleep(500);

    const win = div('frame window blue win-in', ui, 'left:446px;top:150px;width:470px;height:300px;z-index:15', '<div class="wtitle">RUNE LOCK</div>');
    const slots = div('slots', win);
    const slotEls = seq.map(() => div('slot', slots));
    const row = div('runes', win);
    const status = div('status', win, 'color:#8AD7FF', 'ENTER THE CODE');
    setTimeout(() => win.classList.remove('win-in'), 400);
    let input = [], done = false;
    const run = RUN;
    const reset = () => { input = []; slotEls.forEach(s => { s.innerHTML = ''; }); };

    await new Promise(res => KINDS.forEach((k, idx) => {
      const b = document.createElement('button'); b.className = 'rune-btn'; row.appendChild(b);
      sp('rune_' + k, 4, b, 16, 14);
      b.onclick = () => {
        if (run !== RUN || done) return;
        SND.rune(idx);
        b.classList.add('hit-on'); setTimeout(() => b.classList.remove('hit-on'), 120);
        if (k === seq[input.length]) {
          sp('rune_' + k, 4, slotEls[input.length], 11, 11, 'pop');
          input.push(k);
          if (input.length === 4) {
            done = true; SND.granted();
            status.style.color = '#7BD95A'; status.textContent = 'ACCESS GRANTED';
            slotEls.forEach(s => { s.style.boxShadow = 'inset 0 0 0 3px #7BD95A'; });
            res();
          }
        } else {
          SND.denied(); loseHeart(); SC.flash(true);
          status.style.color = '#FF5663'; status.textContent = 'ACCESS DENIED';
          win.classList.remove('shake-sm'); void win.offsetWidth; win.classList.add('shake-sm');
          faces('dizzy'); setTimeout(() => { if (run === RUN && !done) { faces('focus'); status.style.color = '#8AD7FF'; status.textContent = 'ENTER THE CODE'; } }, 900);
          reset();
        }
      };
    }));
    await sleep(1000);
    win.classList.add('win-out'); hint.remove();
    D.tablet.classList.remove('glow'); D.tabletGlow.style.opacity = 0;
    await sleep(320); win.remove();
    await missionComplete(3);
  }

  /* ---------- ESCAPE ---------- */
  async function escapeReady() {
    S.escapeUnlocked = true; S.phase = 'escape'; S.current = 4; updateHUD();
    // chains shatter, padlock drops
    SND.unlock(); SC.flash(); SC.shake(300, true);
    SC.particles(480, 390, 24, ['#AEB9E0', '#7885B5', '#E2E8FF', '#FFC94D'], { dist: 110 });
    D.locks.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(60px) rotate(20deg)', opacity: 0 }], { duration: 500, easing: 'steps(5)', fill: 'forwards' });
    D.btn.classList.add('ready'); escLabel();
    questSign('FINAL', 'PUSH TO ESCAPE!', '빨간 버튼을 눌러 탈출하세요!');
    faces('happy'); D.party[0].say('지금이야!', 1500, true);
    await banner(`${icon('lock', 4)}<div class="ttl gold" style="font-size:30px;margin-top:18px">ESCAPE BUTTON</div><div class="ttl md blue" style="font-size:24px;margin-top:22px">UNLOCKED</div>`, 1400, 200);
    faces('focus');
    await clickOnce(D.hitbox);
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
    await sleep(2500);
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
    const stars = div('center stars', L, 'top:244px');
    const starImgs = [0, 1, 2, 3, 4].map(() => sp('starEmpty', 4, stars));

    const rank = secs < 60 ? ['LEGEND', '전설의 탈출러'] : secs < 100 ? ['HERO', '함정 파괴자'] : secs < 150 ? ['ADVENTURER', '침착한 모험가'] : ['SURVIVOR', '끈질긴 생존자'];
    div('frame cream checklist', L, 'left:34px;top:300px;width:262px', `
      ${['FIND THE KEY', 'CUT THE WIRES', 'OPEN THE LOCK'].map(n => `<div class="ci">${icon('check', 2)}${n}</div>`).join('')}
      <div class="tot">3 / 3 COMPLETE</div>`);
    div('frame dark', L, 'left:664px;top:300px;width:262px;padding:14px 20px 14px', `
      <div style="font-family:var(--px);font-size:10px;color:var(--bl4)">CLEAR TIME</div>
      <div class="ttl sm" style="font-size:24px;margin:10px 0 14px">${fmt(S.tEnd - S.t0)}</div>
      <div style="font-family:var(--px);font-size:10px;color:var(--bl4)">RANK</div>
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
    for (let i = 0; i < 5; i++) {
      starImgs[i].src = SPR.star.url; starImgs[i].classList.add('pop'); SND.star(i);
      const r = starImgs[i].getBoundingClientRect(), st = $('stage').getBoundingClientRect(), k = st.width / 960;
      SC.sparkles((r.left - st.left) / k + 22, (r.top - st.top) / k + 20, 3, 20);
      await sleep(180);
    }
  }

  title();
})();
