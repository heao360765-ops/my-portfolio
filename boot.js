/* ============================================================
   seedLab boot — 1:1 rebuild of reference reel #2
   19s · six steps · dark plate → paper OS → ring verify → blue welcome
   State-machine driven so any frame is reproducible via ?sbseek=
   ============================================================ */
(() => {
  const KEY = 'seedlab-boot-v4';
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GLYPH_GLOW = 'assets/brand/seedlab-glyph.png';
  const GLYPH_INK = 'assets/brand/seedlab-glyph-ink.png';

  /* ---------- timeline (ms) ---------- */
  const T = {
    irisAt: 2200,
    irisDur: 700,
    screenOn: 2150,
    boot: 2450,
    identity: 6100,
    confirm: 8300,
    request: 10100,
    read: 11900,
    verify: 13700,
    welcome: 16100,
    end: 19000,
    hardStop: 40000
  };

  const STEPS = {
    boot:     { no: '00', key: 'boot',     h: '系统自检中...',        p: 'SYSTEM SELF-CHECK',                 foot: '系统自检中，加载终端界面...',        footEn: 'system self-check' },
    identity: { no: '02', key: 'identity', h: '身份资料',             p: 'IDENTITY VERIFICATION',             foot: '核对身份资料...',                    footEn: 'identifying operator record' },
    confirm:  { no: '02', key: 'identity', h: '身份资料<em>确</em>认', p: 'IDENTITY VERIFICATION <em>ID CONFIRMED · 0009</em>', foot: '核对身份资料...', footEn: 'matching operator record' },
    request:  { no: '03', key: 'request',  h: '接收访问需求',          p: 'ACCESS REQUEST RECEIVED',           foot: '接收访问需求，建立会话通道...',      footEn: 'handshake established' },
    read:     { no: '04', key: 'read',     h: '开始读取权限',          p: 'PERMISSION READ STARTED',           foot: '开始读取权限，索引工作区与会话...',  footEn: 'reading permission set' },
    verify:   { no: '05', key: 'verify',   h: '读取完毕 · 核验通过',   p: 'READ COMPLETE · VERIFIED',          foot: '读取完毕，核验通过，权限已授予',     footEn: 'permission authorized' },
    welcome:  { no: '06', key: 'welcome',  h: '',                      p: '',                                   foot: '身份验证完成，会话已建立',          footEn: 'identity verified · session established' }
  };

  const clock = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  };

  const hexLines = () => {
    const rows = [];
    for (let r = 0; r < 4; r++) {
      const cells = [];
      for (let c = 0; c < 12; c++) cells.push(Math.floor(Math.random() * 90 + 10));
      rows.push(cells.join(' '));
    }
    return rows;
  };

  const root = document.getElementById('seedlab-boot') || document.createElement('div');
  root.id = 'seedlab-boot';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'seedLab 启动序列，可按 Esc 跳过');
  root.innerHTML = `
    <div class="sb-dark">
      <div class="sb-dark-sys">fps n/a · gpu 13% · cpu 19% · latency n/a</div>
      <div class="sb-dark-inner">
        <img class="sb-dark-mark" src="${GLYPH_GLOW}" alt="seedLab 标志" width="356" height="356">
        <div class="sb-dark-word">
          <b>SEEDLAB</b>
          <span>STUDIO WORKSPACE</span>
          <small>SEEDLAB HARNESS</small>
        </div>
      </div>
    </div>

    <div class="sb-screen">
      <header class="sb-brand">
        <b>SEEDLAB</b>
        <span>STUDIO WORKSPACE</span>
        <span>TERMINAL OS</span>
        <div class="sb-rev">rev 0.1.0 · web profile <em data-clock></em></div>
        <div class="sb-marks"><i></i><i></i><i></i><i></i></div>
      </header>

      <div class="sb-sysinfo">fps 60 · gpu 23% · cpu 12% · latency 4ms</div>
      <div class="sb-counter">[ 00 / 06 ] <b>boot</b></div>
      <div class="sb-powered">powered by seedlab <i></i></div>
      <div class="sb-wave" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="sb-rule"><i data-rule></i></div>

      <div class="sb-stage">
        <svg class="sb-ring" viewBox="0 0 400 400" aria-hidden="true">
          <circle class="mid-ghost" cx="200" cy="200" r="128" stroke-width="1"></circle>
          <path class="outer-a" d="M255.6 28.8 A180 180 0 0 1 206.3 379.9"></path>
          <path class="outer-b" d="M144.4 371.2 A180 180 0 0 1 193.7 20.1"></path>
          <path class="inner-a" d="M110 200 A90 90 0 0 1 290 200"></path>
          <path class="inner-b" d="M290 200 A90 90 0 0 1 110 200"></path>
          <circle class="dot" cx="177.8" cy="74" r="2.8"></circle>
          <circle class="dot" cx="310.8" cy="136" r="2.8"></circle>
          <circle class="dot" cx="89.2" cy="264" r="2.8"></circle>
          <circle class="tip" cx="255.6" cy="28.8" r="3.4"></circle>
          <circle class="tip" cx="206.3" cy="379.9" r="3.4"></circle>
        </svg>

        <div class="sb-copy" data-copy>
          <h1 data-h>系统自检中...</h1>
          <p data-p>SYSTEM SELF-CHECK</p>
        </div>

        <div class="sb-dots" data-dots aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
        </div>

        <img class="sb-stage-mark" data-stage-mark src="${GLYPH_INK}" alt="" width="356" height="356">
      </div>

      <div class="sb-form" data-form hidden>
        <div class="row"><span>姓名称谓</span><b>SEEDLAB</b></div>
        <div class="row"><span>身份编号</span><b>0009</b></div>
        <div class="row"><span>权限等级</span><b>9</b></div>
        <button type="button" data-confirm>确认身份 Confirm identity</button>
        <div class="hint">按 Enter / Space，或点击按钮继续</div>
      </div>

      <div class="sb-hex" data-hex hidden></div>

      <div class="sb-welcome">
        <div class="sb-wc">
          <p class="sb-wc-top">Welcome to</p>
          <div class="sb-wc-ruleline"></div>
          <p class="sb-wc-block">SEEDLAB</p>
          <img class="sb-wc-mark" src="${GLYPH_INK}" alt="" width="356" height="356">
          <p class="sb-wc-en">seedlab harness</p>
          <p class="sb-wc-cn">欢迎进入 seedLab 工作室</p>
        </div>
      </div>

      <div class="sb-foot">
        <p data-foot>系统自检中，加载终端界面...</p>
        <span data-foot-en>system self-check</span>
      </div>
    </div>

    <div class="sb-ctrl">
      <button type="button" class="sb-sound" aria-pressed="false">声音 OFF</button>
      <button type="button" class="sb-skip">跳过 SKIP</button>
    </div>
  `;
  if (!root.parentNode) document.body.append(root);

  const $ = (s) => root.querySelector(s);
  const dark = $('.sb-dark');
  const screen = $('.sb-screen');
  const stage = $('.sb-stage');
  const copyEl = $('[data-copy]');
  const hEl = $('[data-h]');
  const pEl = $('[data-p]');
  const dots = Array.from(root.querySelectorAll('[data-dots] i'));
  const stageMark = $('[data-stage-mark]');
  const form = $('[data-form]');
  const hexEl = $('[data-hex]');
  const welcome = $('.sb-welcome');
  const footEl = $('[data-foot]');
  const footEnEl = $('[data-foot-en]');
  const counterEl = $('.sb-counter');
  const ruleEl = $('[data-rule]');
  const clockEl = $('[data-clock]');
  const marks = Array.from(root.querySelectorAll('.sb-marks i'));
  const soundBtn = $('.sb-sound');
  const skipBtn = $('.sb-skip');

  /* ---------- audio ---------- */
  let actx = null, soundOn = false;
  function ensureAudio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return true;
  }
  function blip(freq, gain, dur, type) {
    if (!soundOn || !actx) return;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(actx.destination);
    const t0 = actx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.start(); o.stop(t0 + dur + 0.02);
  }
  function noiseBurst(dur, freq, gain) {
    if (!soundOn || !actx) return;
    const d = dur || 0.5;
    const buf = actx.createBuffer(1, Math.floor(actx.sampleRate * d), actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.45;
    const src = actx.createBufferSource(); src.buffer = buf;
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.value = freq || 900;
    const g = actx.createGain();
    src.connect(bp); bp.connect(g); g.connect(actx.destination);
    const t0 = actx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.05, t0 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    src.start(); src.stop(t0 + d);
  }
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? '声音 ON' : '声音 OFF';
    if (soundOn && ensureAudio()) blip(880, 0.05, 0.18);
  });

  /* ---------- state machine ---------- */
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;

  let currentStep = '';
  function setStep(name) {
    if (currentStep === name) return;
    currentStep = name;
    const s = STEPS[name];
    if (!s) return;
    hEl.innerHTML = s.h;
    pEl.innerHTML = s.p;
    footEl.textContent = s.foot;
    footEnEl.textContent = s.footEn;
    counterEl.innerHTML = '[ ' + s.no + ' / 06 ] <b>' + s.key + '</b>';

    copyEl.style.display = s.h ? '' : 'none';

    // element visibility per step
    form.hidden = name !== 'identity';
    hexEl.hidden = name !== 'read';
    stageMark.style.display = (name === 'read') ? 'block' : 'none';
    stage.style.display = (name === 'welcome') ? 'none' : 'flex';
    stage.classList.toggle('is-ring', name === 'verify');
    welcome.classList.toggle('is-on', name === 'welcome');

    // dot progress
    const dotMap = { boot: 0, identity: 2, confirm: 2, request: 3, read: 5, verify: 7, welcome: 7 };
    const n = dotMap[name] || 0;
    dots.forEach((d, i) => d.classList.toggle('on', i < n));

    // top-left marker strip
    const markMap = { boot: 1, identity: 2, confirm: 2, request: 3, read: 3, verify: 4, welcome: 4 };
    const m = markMap[name] || 0;
    marks.forEach((el, i) => el.classList.toggle('on', i === m - 1));

    if (name === 'read' && !hexEl.dataset.filled) {
      hexEl.dataset.filled = '1';
      hexEl.innerHTML = hexLines().map((r, i) => '<div>' + (i === 1 ? '<b>' + r + '</b>' : r) + '</div>').join('');
    }

    // sfx
    if (name === 'identity') blip(620, 0.04, 0.2);
    if (name === 'confirm') blip(880, 0.045, 0.22);
    if (name === 'request') { blip(660, 0.045, 0.25); noiseBurst(0.45, 1400, 0.035); }
    if (name === 'read') { blip(520, 0.04, 0.2); noiseBurst(0.7, 2400, 0.03); }
    if (name === 'verify') { blip(660, 0.05, 0.25); setTimeout(() => blip(990, 0.045, 0.3), 110); }
    if (name === 'welcome') { blip(880, 0.05, 0.2); setTimeout(() => blip(1320, 0.04, 0.3), 130); }
  }

  function stepFor(t) {
    if (t >= T.welcome) return 'welcome';
    if (t >= T.verify) return 'verify';
    if (t >= T.read) return 'read';
    if (t >= T.request) return 'request';
    if (t >= T.confirm) return 'confirm';
    if (t >= T.identity) return 'identity';
    if (t >= T.boot) return 'boot';
    return '';
  }

  function applyState(t) {
    // dark plate + iris
    const iris = clamp01((t - T.irisAt) / T.irisDur);
    screen.classList.toggle('is-on', t >= T.screenOn);
    dark.style.display = t >= T.irisAt + T.irisDur * 0.85 ? 'none' : 'grid';
    // fade the dark plate out under the white wash
    if (t >= T.irisAt) {
      dark.style.opacity = String(1 - easeOut(iris));
    } else {
      dark.style.opacity = '1';
    }

    // clock + rule
    ruleEl.style.width = (clamp01(t / T.end) * 100).toFixed(1) + '%';

    const s = stepFor(t);
    if (s) setStep(s);
  }

  /* ---------- runtime ---------- */
  let start = 0, raf = 0, done = false, elapsed = 0;
  let finishTimer = 0;
  const SEEK = Math.max(0, parseInt(new URLSearchParams(location.search).get('sbseek') || '0', 10) || 0);
  const FORCED = SEEK > 0;

  function finishSoon(ms) {
    clearTimeout(finishTimer);
    finishTimer = setTimeout(finish, ms);
  }

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    clearTimeout(finishTimer);
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    root.classList.add('sb-leaving');
    document.documentElement.classList.remove('sb-pending');
    setTimeout(() => {
      root.remove();
      const target = document.getElementById('main') || document.body;
      if (target && target.focus) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    }, 620);
  }

  function frame(now) {
    if (done) return;
    elapsed = now - start;
    applyState(elapsed);
    if (!FORCED) {
      if (elapsed >= T.end) { finish(); return; }
      if (elapsed >= T.hardStop) { finish(); return; }
    }
    raf = requestAnimationFrame(frame);
  }

  skipBtn.addEventListener('click', finish);
  form.querySelector('[data-confirm]').addEventListener('click', () => {
    if (elapsed > 0) { start -= Math.max(0, T.confirm - elapsed); }
  });
  addEventListener('keydown', (e) => {
    if (done) return;
    if (e.key === 'Escape') { e.preventDefault(); finish(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); }
  }, true);

  function reset() {
    currentStep = '';
    hexEl.dataset.filled = '';
    hexEl.innerHTML = '';
    clockEl.textContent = clock();
    dark.style.opacity = '1';
    dark.style.display = 'grid';
    screen.classList.remove('is-on');
    stage.classList.remove('is-ring');
    welcome.classList.remove('is-on');
    root.classList.remove('sb-leaving');
    ruleEl.style.width = '0';
    dots.forEach((d) => d.classList.remove('on'));
    marks.forEach((m) => m.classList.remove('on'));
    root.querySelector('.sb-stage .sb-copy h1').innerHTML = '系统自检中...';
  }

  function run() {
    if (FORCED) root.classList.add('sb-fast');
    document.documentElement.classList.remove('sb-pending');
    reset();
    requestAnimationFrame((t) => {
      if (FORCED) {
        start = t - SEEK;
        frame(t + 0.5);
        cancelAnimationFrame(raf);
      } else {
        start = t;
        raf = requestAnimationFrame(frame);
      }
    });
  }

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  if (!FORCED && (seen || reduced || location.hash)) {
    document.documentElement.classList.remove('sb-pending');
    root.remove();
  } else {
    run();
  }

  const replay = document.querySelector('[data-replay-intro]');
  if (replay) {
    replay.hidden = false;
    replay.addEventListener('click', () => {
      const old = document.getElementById('seedlab-boot');
      if (old) old.remove();
      done = false;
      if (!root.parentNode) document.body.append(root);
      run();
    });
  }

  window.__seedlabBoot = { finish, run, T };
})();
