/* A fictional visual boot sequence, isolated from the competition website. */
(() => {
  'use strict';
  const key='portfolio-prologue-v5';
  const clearPending=()=>{clearTimeout(window.__portfolioBoot?.timer);document.documentElement.classList.remove('intro-pending')};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const replay=document.querySelector('[data-replay-intro]');
  if(!replay || typeof HTMLDialogElement==='undefined' || !HTMLDialogElement.prototype.showModal){clearPending();return}
  replay.hidden=false;
  const scenes=[
    {name:'signal',start:0,end:1800,label:'ESTABLISHING CONTACT'},
    {name:'confirm',start:1800,end:4000,label:'VISITOR IDENTIFIED'},
    {name:'archive',start:4000,end:7600,label:'ACCESSING ARCHIVE'},
    {name:'authorize',start:7600,end:8800,label:'CONNECTION ESTABLISHED'},
    {name:'welcome',start:8800,end:11200,label:'WELCOME'},
  ];
  const duration=scenes.at(-1).end;
  const clamp=v=>Math.min(1,Math.max(0,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
  const mix=(a,b,t)=>a+(b-a)*t;
  let active=null;
  const seen=()=>{try{return sessionStorage.getItem(key)==='1'}catch{return false}};
  const markSeen=()=>{try{sessionStorage.setItem(key,'1')}catch{}};
  function open(){
    if(active)return;
    const previous=document.activeElement;
    const dialog=document.createElement('dialog');
    dialog.className='portfolio-intro';
    dialog.setAttribute('aria-label','作品集系统启动动画');
    dialog.innerHTML=`
      <canvas class="intro-field" aria-hidden="true"></canvas><div class="intro-texture" aria-hidden="true"></div>
      <header class="intro-top"><div class="intro-wordmark">PORTFOLIO<small>FIELD NOTES / PERSONAL ARCHIVE</small></div><div class="intro-controls"><button type="button" data-sound aria-pressed="false">开启播报</button><button type="button" data-pause aria-pressed="false">暂停</button><button type="button" data-skip>跳过 ↗</button></div></header>
      <div class="intro-aperture" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i style="--i:${i}"></i>`).join('')}<span class="intro-aperture-mark">+</span></div>
      <section class="intro-scene intro-signal" data-scene="signal" aria-hidden="true"><div class="intro-init"><div class="intro-dot"></div><p>ACCESS REQUESTED</p></div></section>
      <section class="intro-scene intro-confirm" data-scene="confirm" aria-hidden="true"><div class="intro-id"><svg class="intro-power" viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle class="intro-power-track" cx="50" cy="50" r="43" stroke="currentColor" stroke-width="1" stroke-dasharray="190 80"/><path d="M50 14v35M33 29a28 28 0 1 0 34 0" stroke="currentColor" stroke-width="2.5"/></svg><div><span class="intro-kicker">VISITOR / OPEN ACCESS</span><h2 data-id-title>IDENTIFYING</h2><p data-id-status>确认访问者</p></div><span class="intro-id-dot" aria-hidden="true"></span></div></section>
      <section class="intro-scene intro-archive" data-scene="archive" aria-hidden="true"><div class="intro-loader"><div class="intro-load-heading"><span class="intro-kicker">ACCESSING THE ARCHIVE</span><div class="intro-load-number"><span data-load-number>00</span><small>%</small></div></div><div class="intro-load-track" aria-hidden="true"><i></i><b></b></div><p>创作档案接入中</p></div></section>
      <section class="intro-scene intro-authorize" data-scene="authorize" aria-hidden="true"><div class="intro-connection"><i aria-hidden="true"></i><span>CONNECTION ESTABLISHED</span></div></section>
      <section class="intro-scene intro-welcome" data-scene="welcome" aria-hidden="true"><div class="intro-welcome-copy"><span class="intro-kicker">THE ARCHIVE IS OPEN</span><h2 aria-label="WELCOME">${[...'WELCOME'].map((s,i)=>`<span aria-hidden="true" style="--letter:${i}">${s}</span>`).join('')}</h2><p>欢迎进入</p><div class="intro-welcome-rule" aria-hidden="true"><i></i></div><span class="intro-welcome-note">GAME / DESIGN / EXPLORATION</span></div></section>
      <footer class="intro-bottom"><span>ARCHIVE / 001</span><span data-stage-label></span><span class="intro-bottom-note">DESIGN IN PROGRESS</span></footer>`;
    document.body.append(dialog);document.body.classList.add('intro-open');active=dialog;
    const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d');
    let width=0,height=0,raf=0,elapsed=reduced.matches?8800:0,last=performance.now(),paused=false,exiting=false;
    const resize=()=>{width=dialog.clientWidth;height=dialog.clientHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0)};
    const observer=new ResizeObserver(resize);observer.observe(dialog);
    const soundtrack=new Audio(new URL('assets/audio/intro/entry-voice-zh-v5.mp3',document.baseURI).href);
    soundtrack.preload='auto';soundtrack.volume=.75;
    const sound=dialog.querySelector('[data-sound]');
    let soundWanted=true,soundAvailable=true,playRequest=0,lastAudioSync=-1000;
    function syncSound(){const target=elapsed/1000;if(soundtrack.seeking||!soundtrack.seekable.length)return;const end=soundtrack.seekable.end(soundtrack.seekable.length-1);if(target<end){try{soundtrack.currentTime=target;lastAudioSync=elapsed}catch{}}}
    try{soundWanted=sessionStorage.getItem('portfolio-voice-muted')!=='1'}catch{}
    function soundLabel(state){dialog.dataset.voice=state;sound.textContent=state==='on'?'播报已开':state==='loading'?'播报加载中':state==='unavailable'?'播报不可用':'开启播报';sound.setAttribute('aria-pressed',String(state==='on'))}
    function stopSound(){playRequest++;soundtrack.pause()}
    function startSound(){
      if(!soundWanted||!soundAvailable||paused||document.hidden||exiting)return;
      const request=++playRequest;soundLabel('loading');
      syncSound();
      soundtrack.play().then(()=>{if(request!==playRequest)return;if(active!==dialog||exiting||paused||!soundWanted){soundtrack.pause();return}soundLabel('on')}).catch(error=>{
        if(request!==playRequest||exiting)return;
        if(error.name==='NotAllowedError'){soundWanted=false;soundLabel('blocked')}
        else if(error.name!=='AbortError'){soundAvailable=false;sound.disabled=true;soundLabel('unavailable')}
      });
    }
    soundtrack.addEventListener('error',()=>{soundAvailable=false;sound.disabled=true;soundLabel('unavailable')});
    sound.onclick=()=>{soundWanted=!soundWanted;try{sessionStorage.setItem('portfolio-voice-muted',soundWanted?'0':'1')}catch{}if(soundWanted){if(paused)soundLabel('on');else startSound()}else{stopSound();soundLabel('off')}};
    const visibility=()=>{if(document.hidden)stopSound();else startSound()};
    document.addEventListener('visibilitychange',visibility);
    const release=()=>{stopSound();soundtrack.removeAttribute('src');soundtrack.load();document.removeEventListener('visibilitychange',visibility);cancelAnimationFrame(raf);observer.disconnect();dialog.close();dialog.remove();clearPending();if(active===dialog){active=null;document.body.classList.remove('intro-open')}};
    const finish=()=>{
      if(exiting)return;exiting=true;stopSound();cancelAnimationFrame(raf);markSeen();dialog.classList.add('is-exiting');
      const cleanup=()=>{if(active!==dialog)return;release();const target=previous===replay?replay:document.querySelector('#intro-title');if(target){if(!target.matches('button,a'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}};
      if(reduced.matches)cleanup();else setTimeout(cleanup,850);
    };
    dialog.addEventListener('cancel',e=>{e.preventDefault();finish()});dialog.querySelector('[data-skip]').onclick=finish;
    const pause=dialog.querySelector('[data-pause]');
    pause.onclick=()=>{paused=!paused;pause.textContent=paused?'继续':'暂停';pause.setAttribute('aria-pressed',String(paused));if(paused)stopSound();else startSound()};
    // All motion shares the same clock, so pause freezes geometry as well as text.
    function field(time){
      if(!ctx||!width)return;
      ctx.clearRect(0,0,width,height);
      const t=reduced.matches?9:time/1000,cx=width*.5,cy=height*.49;
      const r=Math.min(width*.32,height*.3,230);
      const dissolve=ease((time-1400)/1600);
      // The initial point cloud opens into the same signal paths used by later shots.
      if(dissolve<1){
        for(let lat=-14;lat<=14;lat++)for(let lon=0;lon<72;lon++){
          const a=lat*Math.PI/30,b=lon*Math.PI/36+t*.32;
          const x=Math.cos(a)*Math.sin(b),y=Math.sin(a),z=Math.cos(a)*Math.cos(b);
          const px=cx+x*r*(1+dissolve*.9),py=cy+y*r*(1-dissolve*.6)+Math.sin(x*4+t)*dissolve*40;
          ctx.fillStyle=`rgba(53,65,55,${(.04+(z+1)*.1)*(1-dissolve)})`;ctx.fillRect(px,py,1.1,1.1);
        }
      }
      const wave=ease((time-1000)/2200)*(1-ease((time-8500)/2300)*.8);
      ctx.lineWidth=.65;
      for(let row=0;row<15;row++){
        ctx.strokeStyle=`rgba(96,114,91,${(.02+row*.005)*wave})`;ctx.beginPath();
        for(let col=0;col<=100;col++){
          const u=col/100,x=u*width;
          const y=cy+Math.sin(u*7.5-t*.62+row*.07)*(50+row*2.3)+row*9-58;
          col?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }ctx.stroke();
      }
      // Short registration ticks frame the moving opening without forming a dashboard.
      const tickAlpha=ease((time-1700)/800)*.24;
      ctx.strokeStyle=`rgba(64,80,58,${tickAlpha})`;
      const margin=width<600?22:width*.08;
      [margin,width-margin].forEach(x=>{ctx.beginPath();ctx.moveTo(x,cy-45);ctx.lineTo(x,cy+45);for(let i=-3;i<=3;i++){ctx.moveTo(x-3,cy+i*12);ctx.lineTo(x+3,cy+i*12)}ctx.stroke()});
    }
    function loadProgress(p){
      // A quick contact, a short hold, then a smooth release; not equal-sized steps.
      const stops=[[0,0],[.16,26],[.27,29],[.58,72],[.7,75],[.94,100],[1,100]];
      for(let i=1;i<stops.length;i++)if(p<=stops[i][0]){const [a,v]=stops[i-1],[b,w]=stops[i];return mix(v,w,ease((p-a)/(b-a)))}return 100;
    }
    function render(time){
      const scene=scenes.find(s=>time<s.end)||scenes.at(-1),phase=clamp((time-scene.start)/(scene.end-scene.start));
      dialog.dataset.stage=scene.name;
      dialog.style.setProperty('--phase',phase);dialog.style.setProperty('--reveal',ease(phase*3));dialog.style.setProperty('--progress',clamp(time/duration));
      dialog.style.setProperty('--scene-opacity',Math.min(ease(phase*5),scene.name==='welcome'?1:ease((1-phase)*7)));
      dialog.style.setProperty('--welcome',ease((time-8800)/1200));
      dialog.querySelectorAll('[data-scene]').forEach(el=>{const visible=el.dataset.scene===scene.name;el.classList.toggle('is-active',visible);el.setAttribute('aria-hidden',!visible)});
      const confirmed=time>=2680;dialog.classList.toggle('is-confirmed',confirmed);
      dialog.querySelector('[data-id-title]').textContent=confirmed?'ID CONFIRMED':'IDENTIFYING';dialog.querySelector('[data-id-status]').textContent=confirmed?'访问者已确认':'确认访问者';
      const load=Math.round(loadProgress(clamp((time-4000)/3600)));dialog.style.setProperty('--load',load/100);dialog.querySelector('[data-load-number]').textContent=String(load).padStart(2,'0');
      // One frame changes dimensions throughout the film, carrying the eye between scenes.
      const smallW=Math.min(width*.76,410),largeW=Math.min(width*.8,870),largeH=Math.min(height*.46,350);
      let fw=180,fh=180,spread=0,angle=0,alpha=0;
      if(time>=1300&&time<4000){const q=ease((time-1300)/1300);fw=mix(180,smallW,q);fh=mix(180,190,q);spread=(1-q)*11;angle=(1-q)*-5;alpha=q*.58;}
      else if(time>=4000&&time<7600){const q=ease((time-4000)/1000);fw=mix(smallW,largeW,q);fh=mix(190,115,q);spread=Math.sin(clamp((time-4000)/3600)*Math.PI)*17;angle=Math.sin(clamp((time-4000)/3600)*Math.PI)*-3;alpha=.52;}
      else if(time>=7600){const q=ease((time-7600)/1550);fw=largeW;fh=mix(115,largeH,q);spread=(1-q)*20;angle=(1-q)*-3;alpha=.52;}
      dialog.style.setProperty('--frame-w',fw+'px');dialog.style.setProperty('--frame-h',fh+'px');dialog.style.setProperty('--frame-spread',spread+'px');dialog.style.setProperty('--frame-angle',angle+'deg');dialog.style.setProperty('--frame-alpha',alpha);
      dialog.querySelector('[data-stage-label]').textContent=scene.label;
      field(time);
    }
    function tick(now){if(active!==dialog||exiting)return;if(!paused&&!document.hidden)elapsed+=Math.min(now-last,80);last=now;if(soundWanted&&!soundtrack.paused&&soundtrack.readyState>=3&&elapsed-lastAudioSync>1200&&Math.abs(soundtrack.currentTime-elapsed/1000)>.35)syncSound();render(elapsed);if(elapsed>=duration)finish();else raf=requestAnimationFrame(tick)}
    dialog.showModal();clearPending();resize();render(elapsed);soundLabel('off');if(soundWanted)startSound();dialog.querySelector('[data-skip]').focus({preventScroll:true});raf=requestAnimationFrame(tick);
    dialog._release=release;
  }
  replay.addEventListener('click',open);
  if(!seen()&&!location.hash&&!reduced.matches&&!window.__portfolioBoot?.expired)open();else clearPending();
  addEventListener('pageshow',e=>{if(e.persisted&&active)active._release()});
})();
