/* Portfolio-only opening film; competition pages do not load this file. */
(() => {
  'use strict';
  const key = 'portfolio-prologue-v2';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const replay = document.querySelector('[data-replay-intro]');
  if (!replay || !HTMLDialogElement.prototype.showModal) return;
  replay.hidden = false;
  // Visual titles only: no identity data is collected or verified.
  const scenes = [
    {name:'signal', start:0, end:650, label:'OPENING SEQUENCE'},
    {name:'confirm', start:650, end:2700, label:'VISITOR CONFIRMED'},
    {name:'archive', start:2700, end:4700, label:'ARCHIVE UNFOLDING'},
    {name:'welcome', start:4700, end:7400, label:'WELCOME / 欢迎进入'},
  ];
  let active = null;
  function seen() { try { return sessionStorage.getItem(key) === '1'; } catch { return false; } }
  function markSeen() { try { sessionStorage.setItem(key,'1'); } catch {} }
  function open() {
    if (active) return;
    const previous = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'portfolio-intro';
    dialog.setAttribute('aria-label','作品集入场动画');
    dialog.innerHTML = `
      <div class="intro-texture" aria-hidden="true"></div>
      <header class="intro-top"><div class="intro-wordmark">PORTFOLIO<small>PERSONAL WORK / OPENING SEQUENCE</small></div><div class="intro-controls"><button type="button" data-pause aria-pressed="false">暂停</button><button type="button" data-skip>跳过 ↗</button></div></header>
      <div class="intro-scene intro-signal" data-scene="signal" aria-hidden="true"><div class="intro-mark"><i></i></div><span>FIELD ARCHIVE / 001</span></div>
      <section class="intro-scene intro-confirm" data-scene="confirm" aria-hidden="true">
        <div class="intro-registration" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="intro-confirm-inner"><span class="intro-kicker">01 / ACCESS SEQUENCE</span><svg class="intro-power" viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M50 8v42M29 24a35 35 0 1 0 42 0" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="47" stroke="currentColor" stroke-width=".4" stroke-dasharray="1 5"/></svg><h2>VISITOR<br><em>CONFIRMED.</em></h2><p>访问者已确认</p><span class="intro-small">PERSONAL PORTFOLIO · OPEN ACCESS</span></div>
        <span class="intro-side-note">DESIGN + DEVELOPMENT + EXPLORATION</span>
      </section>
      <section class="intro-scene intro-archive" data-scene="archive" aria-hidden="true"><div class="intro-sheet-field" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div><div class="intro-archive-title"><span class="intro-kicker">02 / CREATIVE RECORD</span><h2>UNFOLD<br><em>THE ARCHIVE.</em></h2><p>创作档案展开</p></div><div class="intro-archive-code" aria-hidden="true">[ 001 — ∞ ]<br>IDEA / PROCESS / WORK</div></section>
      <section class="intro-scene intro-welcome" data-scene="welcome" aria-hidden="true"><div class="intro-perspective" aria-hidden="true"></div><div class="intro-welcome-sheet"><div class="intro-sheet-meta"><span>FIELD ARCHIVE</span><span>03 / ENTER</span></div><span class="intro-welcome-cross" aria-hidden="true">✳</span><h2>WELCOME<span>欢迎进入</span></h2><div class="intro-sheet-meta"><span>PERSONAL PORTFOLIO</span><span>DESIGN / BUILD / EXPLORE</span></div></div></section>
      <footer class="intro-bottom"><span data-stage-label></span><div class="intro-progress" aria-hidden="true"><span></span></div><span data-counter></span></footer>`;
    document.body.append(dialog);
    document.body.classList.add('intro-open');
    active = dialog;
    let raf = 0, elapsed = reduced.matches ? 6000 : 0, last = performance.now(), paused = false, exiting = false;
    const finish = () => {
      if (exiting) return;
      exiting = true;
      cancelAnimationFrame(raf);
      markSeen();
      dialog.classList.add('is-exiting');
      const cleanup = () => {
        if (active !== dialog) return;
        dialog.close(); dialog.remove(); active = null;
        document.body.classList.remove('intro-open');
        const target = previous === replay ? replay : document.querySelector('#intro-title');
        if (target) {
          if (!target.matches('button,a')) target.setAttribute('tabindex','-1');
          target.focus({preventScroll:true});
        }
      };
      if(reduced.matches) cleanup(); else setTimeout(cleanup,650);
    };
    dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
    dialog.querySelector('[data-skip]').onclick=finish;
    const pause=dialog.querySelector('[data-pause]');
    pause.onclick=()=>{paused=!paused;pause.textContent=paused?'继续':'暂停';pause.setAttribute('aria-pressed',String(paused));};
    function render(time){
      const scene=scenes.find(s=>time<s.end)||scenes.at(-1);
      const phase=Math.min(1,Math.max(0,(time-scene.start)/(scene.end-scene.start)));
      dialog.dataset.stage=scene.name;
      dialog.style.setProperty('--phase',String(phase));
      dialog.style.setProperty('--reveal',String(Math.min(1,phase*3)));
      dialog.style.setProperty('--progress',String(Math.min(1,time/7400)));
      dialog.querySelectorAll('[data-scene]').forEach(el=>{
        const visible=el.dataset.scene===scene.name;
        el.classList.toggle('is-active',visible);
        el.setAttribute('aria-hidden',String(!visible));
      });
      dialog.querySelector('[data-stage-label]').textContent=scene.label;
      dialog.querySelector('[data-counter]').textContent=String(Math.min(100,Math.floor(time/74))).padStart(3,'0')+' / 100';
    }
    function tick(now){
      if(active!==dialog||exiting) return;
      if(!paused&&!document.hidden) elapsed+=Math.min(now-last,80);
      last=now;render(elapsed);
      if(elapsed>=7400) finish(); else raf=requestAnimationFrame(tick);
    }
    render(elapsed);
    dialog.showModal();
    dialog.querySelector('[data-skip]').focus({preventScroll:true});
    raf=requestAnimationFrame(tick);
  }
  replay.addEventListener('click',open);
  if(!seen()&&!location.hash&&!reduced.matches)open();
  addEventListener('pageshow',event=>{if(event.persisted&&active){active.close();active.remove();active=null;document.body.classList.remove('intro-open');}});
})();
