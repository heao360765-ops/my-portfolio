/* ============================================================
   seedLab boot — minimal white OS, rebuilt from reference reel #2
   act1 dark handoff → act2 iris → act3 ring verify → act4 welcome
   Self-contained: builds its own DOM + WebAudio cues.
   ============================================================ */
(() => {
  const KEY = 'seedlab-boot-v2';
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MARK = 'assets/brand/seedlab-mark@2x.png';

  /* ---------- timeline (ms) ---------- */
  const T = {
    lit: 250,
    iris: 2400,
    irisEnd: 3300,
    screenOn: 3250,
    ring: 3700,
    copy: 4100,
    foot: 4900,
    swap: 6200,
    progress: 6600,
    out: 8700,
    welcome: 8800,
    end: 12300,
    hardStop: 30000
  };

  const root = document.getElementById('seedlab-boot') || document.createElement('div');
  root.id = 'seedlab-boot';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'seedLab 启动序列，可按 Esc 跳过');
  root.innerHTML = `
    <div class="sb-dark">
      <div class="sb-glow" aria-hidden="true"></div>
      <div class="sb-dark-inner">
        <img class="sb-dark-mark" src="${MARK}" alt="seedLab 标志" width="884" height="840">
        <p class="sb-dark-cap">seedlab terminal · initializing</p>
      </div>
    </div>

    <div class="sb-screen">
      <div class="sb-topbar" aria-hidden="true"><i></i></div>

      <header class="sb-brand">
        <b>SEEDLAB</b>
        <span>STUDIO WORKSPACE</span>
        <span>TERMINAL</span>
        <small>web profile · 2026</small>
        <div class="sb-rev">rev 0.1.0 <i></i></div>
      </header>

      <div class="sb-sysinfo" aria-hidden="true">fps 60 · gpu 12% · cpu 8% · latency 4ms</div>

      <div class="sb-center">
        <svg class="sb-ring" viewBox="0 0 400 400" aria-hidden="true">
          <circle class="r-ghost" cx="200" cy="200" r="196"></circle>
          <g class="r-spin">
            <circle class="r-arc" cx="200" cy="200" r="162" stroke-width="5" transform="rotate(-90 200 200)"></circle>
          </g>
          <g class="r-spin-rev">
            <circle class="r-arc2" cx="200" cy="200" r="118" stroke-width="2" transform="rotate(58 200 200)"></circle>
          </g>
          <circle class="dot" cx="200" cy="38" r="2.8"></circle>
          <circle class="dot" cx="322" cy="286" r="2.8"></circle>
          <circle class="dot-ink" cx="200" cy="362" r="3"></circle>
        </svg>
        <div class="sb-center-copy">
          <h1>接收访问需求</h1>
          <p>Access request received</p>
          <div class="sb-ticks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        </div>
      </div>

      <div class="sb-counter">[ 01 / 04 ] <b>access</b></div>
      <div class="sb-powered">powered by seedlab <i></i></div>

      <div class="sb-foot">
        <p>接收访问需求，建立会话通道…</p>
        <span>handshake established</span>
      </div>
    </div>

    <div class="sb-iris" aria-hidden="true"></div>

    <div class="sb-welcome">
      <div class="sb-wc">
        <p class="sb-wc-top">Welcome to</p>
        <p class="sb-wc-block">SEEDLAB</p>
        <img class="sb-wc-mark" src="${MARK}" alt="" width="442" height="420">
        <p class="sb-wc-sub">seedlab studio · 2026</p>
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
  const iris = $('.sb-iris');
  const screen = $('.sb-screen');
  const copy = $('.sb-center-copy');
  const centerH1 = copy.querySelector('h1');
  const centerP = copy.querySelector('p');
  const ticks = Array.from(copy.querySelectorAll('.sb-ticks i'));
  const footP = $('.sb-foot p');
  const footSpan = $('.sb-foot span');
  const counter = $('.sb-counter');
  const topbarFill = $('.sb-topbar i');
  const welcome = $('.sb-welcome');
  const skipBtn = $('.sb-skip');
  const soundBtn = $('.sb-sound');

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
    o.type = type || 'sine';
    o.frequency.value = freq;
    o.connect(g); g.connect(actx.destination);
    const t0 = actx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.start(); o.stop(t0 + dur + 0.02);
  }

  function whoosh(dur) {
    if (!soundOn || !actx) return;
    const d = dur || 0.9;
    const buf = actx.createBuffer(1, Math.floor(actx.sampleRate * d), actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = actx.createBufferSource(); src.buffer = buf;
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(220, actx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(2200, actx.currentTime + d);
    const g = actx.createGain();
    src.connect(bp); bp.connect(g); g.connect(actx.destination);
    const t0 = actx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    src.start(); src.stop(t0 + d);
  }

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? '声音 ON' : '声音 OFF';
    if (soundOn) {
      if (ensureAudio()) blip(880, 0.05, 0.18);
    }
  });

  /* ---------- runtime ---------- */
  let start = 0, raf = 0, done = false, elapsed = 0;
  const flags = {};
  let tickIndex = 0;

  const SEEK = Math.max(0, parseInt(new URLSearchParams(location.search).get('sbseek') || '0', 10) || 0);
  const FORCED = SEEK > 0;

  const darkMark = $('.sb-dark-mark');
  const darkCap = $('.sb-dark-cap');
  const arcEl = root.querySelector('.r-arc');
  const arc2El = root.querySelector('.r-arc2');

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;

  // rAF-driven visuals so the sequence stays seekable and recordable
  function paint(t) {
    if (!paint._init) {
      paint._init = true;
      // these elements are driven per-frame; CSS transitions would lag behind
      [darkMark, darkCap, iris, copy, $('.sb-foot'), arcEl, arc2El].forEach((el) => {
        if (el) el.style.transition = 'none';
      });
    }
    // icon rises out of the dark (250 → 1850ms)
    const p1 = easeOut(clamp01((t - 250) / 1600));
    darkMark.style.opacity = String(p1);
    darkMark.style.transform = `scale(${lerp(0.94, 1, p1)})`;
    darkMark.style.filter = `blur(${lerp(10, 0, p1)}px) brightness(${lerp(0.8, 1, p1)})`;
    darkCap.style.opacity = String(easeOut(clamp01((t - 900) / 900)));

    // white circle wipe (2400 → 3350ms)
    const p2 = easeOut(clamp01((t - 2400) / 950));
    iris.style.transform = `scale(${lerp(0, 1, p2)})`;
    iris.style.opacity = t >= 3420 ? '0' : '1';

    // ring draws itself (3700 → 5000ms / 250ms offset for the inner arc)
    const p3 = easeOut(clamp01((t - 3700) / 1300));
    if (arcEl) arcEl.style.strokeDasharray = `${(p3 * 430).toFixed(1)} 4000`;
    const p4 = easeOut(clamp01((t - 3950) / 1100));
    if (arc2El) arc2El.style.strokeDasharray = `${(p4 * 250).toFixed(1)} 4000`;

    // centre copy fades in with the ring
    copy.style.opacity = String(easeOut(clamp01((t - 4100) / 700)));
    copy.style.transform = `translateY(${lerp(8, 0, easeOut(clamp01((t - 4100) / 700)))}px)`;

    // footer line
    const f = easeOut(clamp01((t - 4900) / 600));
    const foot = $('.sb-foot');
    foot.style.opacity = String(f);
  }

  function once(name, t, at, fn) {
    if (!flags[name] && t >= at) { flags[name] = true; fn(); }
  }

  function frame(now) {
    if (done) return;
    elapsed = now - start;
    paint(elapsed);

    once('lit', elapsed, T.lit, () => dark.classList.add('is-lit'));

    once('iris', elapsed, T.iris, () => {
      // white circle grows from the centre, covering the dark handoff
      iris.style.transition = 'transform .95s cubic-bezier(.22,.61,.36,1)';
      requestAnimationFrame(() => { iris.style.transform = 'scale(1)'; });
      whoosh(1.0);
    });

    once('screenOn', elapsed, T.screenOn, () => {
      screen.classList.add('is-on');
      root.classList.add('on-paper');
    });

    once('irisGone', elapsed, T.irisEnd + 120, () => {
      dark.classList.add('is-off');
      iris.style.display = 'none';
    });

    once('ring', elapsed, T.ring, () => {
      screen.classList.add('is-ring');
      blip(660, 0.05, 0.3);
    });

    once('copy', elapsed, T.copy, () => {
      topbarFill.style.width = '26%';
    });

    once('foot', elapsed, T.foot, () => {
      screen.classList.add('is-foot');
      topbarFill.style.width = '48%';
    });

    // tick the dotted progress row
    if (elapsed >= T.foot && tickIndex < ticks.length) {
      const step = T.swap - T.foot;
      const want = Math.min(ticks.length, Math.floor(((elapsed - T.foot) / step) * ticks.length) + 1);
      while (tickIndex < want) {
        ticks[tickIndex].classList.add('on');
        tickIndex++;
        blip(1400, 0.02, 0.05, 'square');
      }
    }

    once('swap', elapsed, T.swap, () => {
      centerH1.textContent = '读取完毕 · 核验通过';
      centerP.textContent = 'Read complete · Verified';
      copy.classList.remove('is-swap');
      void copy.offsetWidth;
      copy.classList.add('is-swap');
      footP.textContent = '读取完毕，核验通过，权限已授予';
      footSpan.textContent = 'permission authorized';
      counter.innerHTML = '[ 05 / 06 ] <b>verify</b>';
      topbarFill.style.width = '82%';
      blip(660, 0.05, 0.25);
      setTimeout(() => blip(990, 0.045, 0.3), 110);
    });

    once('out', elapsed, T.out, () => {
      topbarFill.style.width = '100%';
      screen.classList.remove('is-on');
    });

    once('welcome', elapsed, T.welcome, () => {
      welcome.classList.add('is-on');
      blip(880, 0.05, 0.2);
      setTimeout(() => blip(1320, 0.04, 0.28), 130);
      if (!FORCED) finishSoon(3000);
    });

    if (!FORCED && (elapsed >= T.end || elapsed >= T.hardStop)) { finish(); return; }
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
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    root.classList.add('sb-leaving');
    document.documentElement.classList.remove('sb-pending');
    setTimeout(() => {
      root.remove();
      const target = document.getElementById('main') || document.body;
      if (target && target.focus) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 620);
  }

  skipBtn.addEventListener('click', finish);
  addEventListener('keydown', (e) => {
    if (done) return;
    if (e.key === 'Escape') { e.preventDefault(); finish(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); }
  }, true);

  function run() {
    if (FORCED) root.classList.add('sb-fast');
    document.documentElement.classList.remove('sb-pending');
    // reset for replay
    dark.classList.remove('is-lit', 'is-off');
    screen.classList.remove('is-on', 'is-ring', 'is-foot');
    welcome.classList.remove('is-on');
    root.classList.remove('on-paper', 'sb-leaving');
    iris.style.display = '';
    iris.style.transform = 'scale(0)';
    topbarFill.style.width = '0';
    ticks.forEach((t) => t.classList.remove('on'));
    tickIndex = 0;
    centerH1.textContent = '接收访问需求';
    centerP.textContent = 'Access request received';
    footP.textContent = '接收访问需求，建立会话通道…';
    footSpan.textContent = 'handshake established';
    counter.innerHTML = '[ 01 / 04 ] <b>access</b>';
    copy.classList.remove('is-swap');

    requestAnimationFrame((t) => {
      if (FORCED) {
        // freeze on the requested frame: paint once, then stop the loop
        start = t - SEEK;
        frame(t + 0.5);
        cancelAnimationFrame(raf);
      } else {
        start = t;
        raf = requestAnimationFrame(frame);
      }
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
      done = false;
      Object.keys(flags).forEach((k) => { flags[k] = false; });
      if (!root.parentNode) document.body.append(root);
      run();
    });
  }

  window.__seedlabBoot = { finish, run, T };
})();
