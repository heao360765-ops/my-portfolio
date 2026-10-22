/* Portfolio-only prologue. The competition site never loads this script. */
(() => {
  'use strict';
  const key = 'portfolio-prologue-v1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const replay = document.querySelector('[data-replay-intro]');
  if (!replay || !HTMLDialogElement.prototype.showModal) return;
  replay.hidden = false;
  const lines = [
    {who:'访客', text:'这里，记录着什么？', at:1400},
    {who:'导览', text:'一个正在生长的游戏世界，和一些试着走进现实的想法。', at:3400},
    {who:'访客', text:'听起来，都还没有结束。', at:6500},
    {who:'导览', text:'是的。欢迎你，来看它们正在成为的样子。', at:8400},
  ];
  let active = null;
  function seen() { try { return sessionStorage.getItem(key) === '1'; } catch { return false; } }
  function markSeen() { try { sessionStorage.setItem(key,'1'); } catch { /* Storage is optional. */ } }
  function open() {
    if (active) return;
    const previous = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'portfolio-intro';
    dialog.setAttribute('aria-label','创作档案入场序幕');
    dialog.innerHTML = `
      <div class="intro-grain" aria-hidden="true"><div class="intro-grid"></div></div>
      <div class="intro-top"><div class="intro-wordmark">FIELD<br>ARCHIVE<small>PERSONAL WORK / OPEN SEQUENCE</small></div><div class="intro-controls"><button type="button" data-pause aria-pressed="false">暂停</button><button type="button" class="intro-skip" data-skip>跳过序幕 ↗</button></div></div>
      <div class="intro-layout"><div class="intro-art" aria-hidden="true">
      <svg class="intro-orbit" viewBox="0 0 520 520" fill="none"><g stroke="#afbea2" stroke-width=".65"><circle cx="260" cy="260" r="205"/><circle cx="260" cy="260" r="190" stroke-dasharray="2 9"/><path d="M0 260h520M260 0v520M70 70l380 380M70 450L450 70"/><g class="ring"><ellipse cx="260" cy="260" rx="215" ry="84" transform="rotate(-35 260 260)"/><ellipse cx="260" cy="260" rx="215" ry="84" transform="rotate(35 260 260)"/><rect x="125" y="125" width="270" height="270" transform="rotate(15 260 260)"/></g><g class="ring ring-alt"><ellipse cx="260" cy="260" rx="100" ry="230" transform="rotate(20 260 260)"/><circle cx="260" cy="55" r="5" fill="#d44b28" stroke="none"/></g></g><path d="M245 260h30m-15-15v30" stroke="#e6edde"/><path d="M60 385h120m-115 8h80m-85 8h120" stroke="#dce5d4" opacity=".45" stroke-width="4"/></svg>
      <div class="intro-archive-tag"><b>001 — ∞</b>OBSERVATION<br>IDEATION<br>ITERATION</div><span class="intro-ghost">Unfinished.</span><div class="intro-barcode"></div></div>
      <div class="intro-main"><div class="intro-index">CREATIVE RECORD / <span data-stage>01</span> — 04</div><h2 class="intro-heading">Beyond<span>the idea.</span><i class="intro-cross" aria-hidden="true"></i></h2><p class="intro-subtitle">从一个想法，走向一个世界。</p>
      <div class="intro-dialogue" aria-label="入场对白">${lines.map((line,i)=>`<div class="intro-line" data-line="${i}" hidden><span class="intro-speaker">${line.who}</span><p aria-label="${line.text}"><span aria-hidden="true" data-type></span></p></div>`).join('')}</div>
      <div class="intro-choices"><button type="button" class="intro-enter" data-enter>进入作品集 →</button><a href="games/wuxitown/" data-game>先看雾汐镇 ↗</a><button type="button" data-hardware>硬件探索 ↗</button></div><p class="intro-hint">创作档案 · 入场序幕 / ESC 可跳过</p></div></div>
      <div class="intro-bottom"><span>DESIGN / BUILD / EXPLORE<br>PERSONAL PORTFOLIO</span><div><span data-progress-label>序幕展开中</span><div class="intro-progress" aria-hidden="true"><span></span></div></div></div>
      <div class="intro-boot" aria-hidden="true"><div class="intro-boot-symbol"></div><p>OPENING THE ARCHIVE</p></div>`;
    document.body.append(dialog);
    document.body.classList.add('intro-open');
    active = dialog;
    let raf = 0, elapsed = 0, last = performance.now(), paused = false, exiting = false;
    const finish = (destination) => {
      if (exiting) return;
      exiting = true;
      cancelAnimationFrame(raf);
      markSeen();
      dialog.classList.add('is-exiting');
      const cleanup = () => {
        dialog.close(); dialog.remove(); active = null;
        document.body.classList.remove('intro-open');
        const target = destination === 'hardware' ? document.querySelector('#hardware') : previous === replay ? replay : document.querySelector('#intro-title');
        if (target) {
          if (!target.matches('button,a')) target.setAttribute('tabindex','-1');
          target.focus({preventScroll:true});
          if (destination === 'hardware') target.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
        }
      };
      if(reduced.matches) cleanup(); else setTimeout(cleanup,550);
    };
    dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
    dialog.querySelector('[data-skip]').onclick=()=>finish();
    dialog.querySelector('[data-enter]').onclick=()=>finish();
    dialog.querySelector('[data-hardware]').onclick=()=>finish('hardware');
    dialog.querySelector('[data-game]').onclick=()=>markSeen();
    const pause=dialog.querySelector('[data-pause]');
    pause.onclick=()=>{paused=!paused;pause.textContent=paused?'继续':'暂停';pause.setAttribute('aria-pressed',String(paused));dialog.classList.toggle('is-paused',paused);};
    function render(time){
      dialog.classList.toggle('is-awake',time>=950);
      const current=Math.max(0,lines.findLastIndex(line=>time>=line.at));
      dialog.querySelector('[data-stage]').textContent=String(current+1).padStart(2,'0');
      lines.forEach((line,i)=>{
        const row=dialog.querySelector(`[data-line="${i}"]`);
        row.hidden=time<line.at;
        row.classList.toggle('is-current',i===current);
        const count=reduced.matches?line.text.length:Math.max(0,Math.floor((time-line.at)/48));
        row.querySelector('[data-type]').textContent=line.text.slice(0,count);
      });
      dialog.style.setProperty('--progress',String(Math.min(1,time/10400)));
      const ready=time>=10400;
      dialog.classList.toggle('is-ready',ready);
      dialog.querySelector('[data-progress-label]').textContent=ready?'选择你的第一站':'序幕展开中';
    }
    function tick(now){
      if(active!==dialog) return;
      if(!paused && !document.hidden) elapsed+=Math.min(now-last,80);
      last=now;render(elapsed);
      if(elapsed<10400&&!exiting)raf=requestAnimationFrame(tick);
    }
    dialog.showModal();
    dialog.querySelector('[data-skip]').focus({preventScroll:true});
    if(reduced.matches){elapsed=10400;render(elapsed);}else raf=requestAnimationFrame(tick);
  }
  replay.addEventListener('click',open);
  // A direct section link should land at its content without a blocking prologue.
  if(!seen()&&!location.hash&&!reduced.matches)open();
  addEventListener('pageshow',event=>{if(event.persisted&&active){active.close();active.remove();active=null;document.body.classList.remove('intro-open');}});
})();
