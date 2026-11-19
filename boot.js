/* ============================================================
   seedLab boot sequence
   Act 1 signal → Act 2 lock → Act 3 login → Act 4 verify → Act 5 welcome
   Self-contained: builds its own DOM, canvas field, and WebAudio cues.
   ============================================================ */
(() => {
  const KEY = 'seedlab-boot-v1';
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MARK = 'assets/brand/seedlab-mark@2x.png';
  const VOICE = 'assets/audio/intro/entry-voice-zh-v7.mp3';

  /* ---------- timeline (ms) ---------- */
  const T = {
    lit: 700,
    hudIn: 1100,
    scan: 2200,
    lock: 3400,
    flash: 4500,
    loginIn: 4650,
    userType: 5200,
    passType: 6700,
    enterHint: 8000,
    identify: 8600,
    system: 9500,
    ringIn: 9750,
    voice: 10600,
    welcome: 13400,
    end: 15300,
    hardStop: 26000
  };

  const root = document.getElementById('seedlab-boot') || document.createElement('div');
  root.id = 'seedlab-boot';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'seedLab 启动序列，可按 Esc 跳过');
  root.innerHTML = `
    <canvas class="sb-canvas" aria-hidden="true"></canvas>

    <!-- ACT 1 / 2 -->
    <div class="sb-layer sb-signal is-on">
      <div class="sb-chrome" aria-hidden="true">
        <div class="sb-ruler top"></div>
        <div class="sb-ruler bottom"></div>
        <div class="sb-corner tl"></div><div class="sb-corner tr"></div>
        <div class="sb-corner bl"></div><div class="sb-corner br"></div>
      </div>
      <div class="sb-mark-wrap">
        <img src="${MARK}" alt="seedLab 标志" width="884" height="840">
        <div class="sb-scanline" aria-hidden="true"></div>
      </div>
      <div class="sb-hud" aria-hidden="true"><span class="sb-typing"></span><span class="cursor"></span></div>
      <div class="sb-hex" aria-hidden="true">0x7A4F<br>W-5<br>TB-09</div>
    </div>

    <!-- ACT 3 -->
    <div class="sb-layer sb-login">
      <div class="sb-login-frame">
        <span class="sb-sq" aria-hidden="true"></span>
        <div class="sb-login-brand">
          <div>
            <h1>SEEDLAB</h1>
            <div class="sb-rule"></div>
            <small>Private Terminal Service · 内部终端服务</small>
          </div>
          <img class="sb-mark-mini" src="${MARK}" alt="" width="442" height="420">
        </div>
        <div class="sb-form">
          <div class="sb-field">
            <label for="sb-user">USERNAME</label>
            <div class="sb-input" id="sb-user"><span class="sb-val"></span><span class="cursor"></span></div>
          </div>
          <div class="sb-field">
            <label for="sb-pass">PASSWORD</label>
            <div class="sb-input" id="sb-pass"><span class="sb-dots">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </span></div>
          </div>
          <div class="sb-login-status" aria-live="polite"></div>
          <button class="sb-enter" type="button">Enter 进入 ↗</button>
        </div>
        <div class="sb-progress" aria-hidden="true"><i></i></div>
      </div>
    </div>

    <!-- ACT 4 -->
    <div class="sb-layer sb-system">
      <div class="sb-win" aria-hidden="true">
        <div class="sb-win-bar"><i></i><i></i><i></i><span>seedlab / access control</span></div>
        <div class="sb-win-body">
          <div class="sb-sys-progress"><i></i></div>
          <div class="sb-ring">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <g class="ring-outer" fill="none" stroke="#17251f" stroke-width=".6" opacity=".5">
                <circle cx="100" cy="100" r="92" stroke-dasharray="1 7"/>
                <circle cx="100" cy="100" r="86" opacity=".35"/>
              </g>
              <g class="ring-mid" fill="none" stroke="#17251f" stroke-width=".9" opacity=".7">
                <circle cx="100" cy="100" r="70" class="ring-dash"/>
                <path d="M100 18v10M100 172v10M18 100h10M172 100h10" />
              </g>
              <g class="ring-dot" fill="#c8431f">
                <circle cx="100" cy="26" r="2.4"/>
              </g>
            </svg>
            <span class="pulse" aria-hidden="true"></span>
            <div class="sb-ring-core"><img src="${MARK}" alt="" width="442" height="420"></div>
          </div>
          <div class="sb-sys-msg">权限校验 · <b>ACCESS VERIFIED</b></div>
          <div class="sb-sys-log" aria-hidden="true">
            <div>→ mount <b>/seedlab/archive</b> ... ok</div>
            <div>→ verify operator signature ... ok</div>
            <div>→ open session <b>0x7A4F</b> ... ok</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ACT 5 -->
    <div class="sb-layer sb-welcome">
      <div class="sb-welcome-inner">
        <img src="${MARK}" alt="seedLab 标志" width="884" height="840">
        <div class="sb-welcome-text">Welcome to <b>SEEDLAB</b></div>
        <div class="sb-welcome-sub">Studio Workspace · 2026</div>
      </div>
    </div>

    <div class="sb-ctrl">
      <button type="button" class="sb-sound" aria-pressed="false">声音 OFF</button>
      <button type="button" class="sb-skip">跳过 SKIP</button>
    </div>
  `;
  if (!root.parentNode) document.body.append(root);

  const $ = (sel) => root.querySelector(sel);
  const canvas = $('.sb-canvas');
  const ctx = canvas.getContext('2d');

  const signal = $('.sb-signal');
  const hud = $('.sb-hud');
  const hudText = $('.sb-hud .sb-typing');
  const login = $('.sb-login');
  const loginStatus = $('.sb-login-status');
  const enterBtn = $('.sb-enter');
  const userVal = $('#sb-user .sb-val');
  const dots = Array.from(root.querySelectorAll('#sb-pass .sb-dots i'));
  const progressBar = login.querySelector('.sb-progress i');
  const system = $('.sb-system');
  const sysProgress = system.querySelector('.sb-sys-progress i');
  const welcome = $('.sb-welcome');
  const skipBtn = $('.sb-skip');
  const soundBtn = $('.sb-sound');

  /* ---------- canvas field ---------- */
  let W = 0, H = 0, dpr = 1;
  const blobs = Array.from({ length: 4 }, (_, i) => ({
    x: 0.5 + (i - 1.5) * 0.22,
    y: 0.5 + (i % 2 ? 0.14 : -0.1),
    r: 0.34 + (i % 3) * 0.1,
    sx: 0.05 + i * 0.013,
    sy: 0.04 + i * 0.017,
    ph: i * 1.7
  }));
  const dust = Array.from({ length: 42 }, () => ({
    x: Math.random(), y: Math.random(),
    v: 0.00004 + Math.random() * 0.00009,
    r: Math.random() * 1.1 + 0.35,
    a: 0.15 + Math.random() * 0.45
  }));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = root.clientWidth;
    H = root.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  function drawField(t, inDark) {
    ctx.clearRect(0, 0, W, H);
    if (!inDark) return;
    const s = Math.min(W, H);
    // soft luminous haze
    for (const b of blobs) {
      const bx = b.x * W + Math.sin(t * 0.00022 + b.ph) * W * 0.06;
      const by = b.y * H + Math.cos(t * 0.00019 + b.ph) * H * 0.05;
      const br = b.r * s * (0.9 + Math.sin(t * 0.0004 + b.ph) * 0.12);
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      const amp = 0.085 + Math.sin(t * 0.0005 + b.ph) * 0.02;
      g.addColorStop(0, `rgba(204,255,0,${amp})`);
      g.addColorStop(0.45, `rgba(160,210,0,${amp * 0.35})`);
      g.addColorStop(1, 'rgba(10,12,10,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
    // drifting dust
    ctx.fillStyle = '#ccff00';
    for (const d of dust) {
      const y = ((d.y - t * d.v) % 1 + 1) % 1;
      ctx.globalAlpha = d.a * (0.5 + 0.5 * Math.sin(t * 0.001 + d.x * 12));
      ctx.beginPath();
      ctx.arc(d.x * W, y * H, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- audio ---------- */
  let actx = null, drone = null, soundOn = false, voiceEl = null, voicePlayed = false;

  function ensureAudio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return true;
  }

  function env(node, peak, attack, decay) {
    const t0 = actx.currentTime;
    node.gain.setValueAtTime(0.0001, t0);
    node.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack);
    node.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  }

  function cueTick() {
    if (!soundOn || !actx) return;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'square'; o.frequency.value = 1500 + Math.random() * 500;
    o.connect(g); g.connect(actx.destination);
    env(g, 0.035, 0.002, 0.035);
    o.start(); o.stop(actx.currentTime + 0.06);
  }

  function cueBlip(freq = 880) {
    if (!soundOn || !actx) return;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(actx.destination);
    env(g, 0.045, 0.004, 0.16);
    o.start(); o.stop(actx.currentTime + 0.24);
  }

  function cueWhoosh() {
    if (!soundOn || !actx) return;
    const dur = 1.4;
    const buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
    const src = actx.createBufferSource(); src.buffer = buf;
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(240, actx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(2600, actx.currentTime + dur);
    const g = actx.createGain();
    src.connect(bp); bp.connect(g); g.connect(actx.destination);
    env(g, 0.07, 0.18, dur - 0.3);
    src.start(); src.stop(actx.currentTime + dur);
  }

  function cueDrone() {
    if (!soundOn || !actx || drone) return;
    const g = actx.createGain();
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.02, actx.currentTime + 1.2);
    const lp = actx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 320;
    g.connect(lp); lp.connect(actx.destination);
    drone = { nodes: [], g };
    [55, 82.5, 110.3].forEach((f, i) => {
      const o = actx.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = (i - 1) * 6;
      o.connect(g); o.start();
      drone.nodes.push(o);
    });
  }

  function stopDrone() {
    if (!drone || !actx) return;
    const { g, nodes } = drone;
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.8);
    nodes.forEach((n) => { try { n.stop(actx.currentTime + 0.9); } catch (e) {} });
    drone = null;
  }

  function playVoice() {
    if (voicePlayed || !soundOn) return;
    voicePlayed = true;
    if (!voiceEl) {
      voiceEl = new Audio(VOICE);
      voiceEl.preload = 'auto';
    }
    voiceEl.volume = 0.85;
    voiceEl.play().catch(() => {});
  }

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? '声音 ON' : '声音 OFF';
    if (soundOn) {
      if (ensureAudio()) {
        cueDrone();
        if (elapsed >= T.system && !voicePlayed) playVoice();
      }
    } else {
      stopDrone();
      if (voiceEl) voiceEl.pause();
    }
  });

  /* ---------- timeline runtime ---------- */
  let start = 0, raf = 0, elapsed = 0, done = false;
  const flags = {};
  let hudTextStr = '';
  let hudIndex = 0;
  let userTyped = 0;
  let passFilled = 0;
  const USER = 'operator';
  const HUD_COPY = 'seedlab terminal // node 0x7A4F // doc W-5 // awaiting operator';

  function once(name, t, at, fn) {
    if (!flags[name] && t >= at) { flags[name] = true; fn(); }
  }

  function typeHud(t) {
    if (elapsed < T.hudIn) return;
    const per = 26;
    const want = Math.min(HUD_COPY.length, Math.floor((elapsed - T.hudIn) / per));
    if (want > hudIndex) {
      if (hudIndex === 0) hud.classList.add('is-on');
      hudTextStr = HUD_COPY.slice(0, want);
      hudText.textContent = hudTextStr;
      hudIndex = want;
      if (want % 3 === 0) cueTick();
    }
  }

  function typeUser(t) {
    if (elapsed < T.userType) return;
    const dur = T.passType - T.userType - 300;
    const want = Math.min(USER.length, Math.floor(((elapsed - T.userType) / dur) * USER.length) + 1);
    if (want > userTyped) {
      userVal.textContent = USER.slice(0, want);
      userTyped = want;
      cueTick();
    }
  }

  function fillPass(t) {
    if (elapsed < T.passType) return;
    const dur = T.enterHint - T.passType - 500;
    const want = Math.min(dots.length, Math.floor(((elapsed - T.passType) / dur) * dots.length) + 1);
    if (want > passFilled) {
      for (let i = passFilled; i < want; i++) dots[i].classList.add('filled');
      passFilled = want;
      cueTick();
    }
  }

  function frame(now) {
    if (done) return;
    elapsed = now - start;

    const inDark = elapsed < T.flash || elapsed >= T.welcome;
    drawField(elapsed, inDark);

    typeHud(elapsed);
    typeUser(elapsed);
    fillPass(elapsed);

    once('lit', elapsed, T.lit, () => signal.classList.add('is-lit'));
    once('scan', elapsed, T.scan, () => {
      signal.classList.add('is-scanning');
      cueWhoosh();
    });
    once('lock', elapsed, T.lock, () => {
      signal.classList.add('is-locked');
      cueBlip(660);
    });
    once('flash', elapsed, T.flash, () => {
      stopDrone();
      cueBlip(1320);
    });
    once('loginIn', elapsed, T.loginIn, () => {
      signal.classList.remove('is-on');
      login.classList.add('is-on');
      loginStatus.textContent = '等待身份确认 · AUTHORIZING';
    });
    once('userDone', elapsed, T.passType - 200, () => {
      loginStatus.textContent = '凭据读取中 · READING CREDENTIALS';
    });
    once('enterHint', elapsed, T.enterHint, () => {
      enterBtn.classList.add('is-on');
      loginStatus.textContent = '就绪 · PRESS ENTER';
      progressBar.style.width = '72%';
    });
    once('identify', elapsed, T.identify, () => {
      loginStatus.textContent = '身份已确认 · IDENTIFIED';
      loginStatus.classList.add('ok');
      progressBar.style.width = '100%';
      cueBlip(1046);
      setTimeout(() => cueBlip(1568), 120);
    });
    once('system', elapsed, T.system, () => {
      login.classList.remove('is-on');
      system.classList.add('is-on');
      sysProgress.style.width = '34%';
    });
    once('ring', elapsed, T.ringIn, () => {
      sysProgress.style.width = '78%';
      cueBlip(520);
    });
    once('voice', elapsed, T.voice, () => {
      playVoice();
      sysProgress.style.width = '100%';
    });
    once('welcome', elapsed, T.welcome, () => {
      system.classList.remove('is-on');
      welcome.classList.add('is-on');
      if (!FORCED) finishSoon(1800);
    });

    if (!FORCED) {
      if (elapsed >= T.end) { finish(); return; }
      if (elapsed >= T.hardStop) { finish(); return; }
    }
    raf = requestAnimationFrame(frame);
  }

  let finishTimer = 0;
  function finishSoon(ms) {
    clearTimeout(finishTimer);
    finishTimer = setTimeout(finish, ms);
  }

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    clearTimeout(finishTimer);
    stopDrone();
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    root.classList.add('sb-leaving');
    document.documentElement.classList.remove('sb-pending');
    document.body.classList.remove('sb-open');
    setTimeout(() => {
      root.remove();
      const target = document.getElementById('main') || document.body;
      if (target && target.focus) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 560);
  }

  skipBtn.addEventListener('click', finish);
  enterBtn.addEventListener('click', () => {
    if (elapsed >= T.loginIn) { finish(); }
  });
  addEventListener('keydown', (e) => {
    if (done) return;
    if (e.key === 'Escape') { e.preventDefault(); finish(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && elapsed >= T.loginIn) {
      e.preventDefault();
      finish();
    }
  }, true);

  /* ---------- boot ---------- */
  // ?sbseek=5000 jumps the timeline (preview / debugging)
  const SEEK = Math.max(0, parseInt(new URLSearchParams(location.search).get('sbseek') || '0', 10) || 0);
  const FORCED = SEEK > 0;

  function run() {
    document.documentElement.classList.add('sb-pending');
    document.body.classList.add('sb-open');
    if (FORCED) root.classList.add('sb-fast');
    requestAnimationFrame((t) => {
      document.documentElement.classList.remove('sb-pending');
      start = t - SEEK;
      raf = requestAnimationFrame(frame);
    });
  }

  // already seen in this tab?
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  if (!FORCED && (seen || reduced || location.hash)) {
    document.documentElement.classList.remove('sb-pending');
    root.remove();
  } else {
    run();
  }

  // replay hook (footer button)
  const replay = document.querySelector('[data-replay-intro]');
  if (replay) {
    replay.hidden = false;
    replay.addEventListener('click', () => {
      const old = document.getElementById('seedlab-boot');
      if (old) old.remove();
      done = false; flags.lit = false;
      Object.keys(flags).forEach((k) => { flags[k] = false; });
      hudIndex = 0; userTyped = 0; passFilled = 0;
      hudText.textContent = '';
      dots.forEach((d) => d.classList.remove('filled'));
      userVal.textContent = '';
      [signal, login, system, welcome].forEach((l) => l.classList.remove('is-on'));
      signal.classList.add('is-on');
      signal.classList.remove('is-lit', 'is-scanning', 'is-locked');
      enterBtn.classList.remove('is-on');
      loginStatus.classList.remove('ok');
      progressBar.style.width = '0';
      sysProgress.style.width = '0';
      hud.classList.remove('is-on');
      voicePlayed = false;
      if (!root.parentNode) document.body.append(root);
      run();
    });
  }

  // expose for tooling / debugging
  window.__seedlabBoot = { finish, start: run, T };
})();
