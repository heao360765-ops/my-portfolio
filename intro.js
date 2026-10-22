/* A fictional visual boot sequence, isolated from the competition website. */
(() => {
  'use strict';
  const key='portfolio-prologue-v4';
  const clearPending=()=>{clearTimeout(window.__portfolioBoot?.timer);document.documentElement.classList.remove('intro-pending')};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const replay=document.querySelector('[data-replay-intro]');
  if(!replay || typeof HTMLDialogElement==='undefined' || !HTMLDialogElement.prototype.showModal){clearPending();return}
  replay.hidden=false;
  const scenes=[
    {name:'signal',start:0,end:2200,label:'01 / INITIALIZE'},
    {name:'confirm',start:2200,end:4400,label:'02 / IDENTIFY'},
    {name:'archive',start:4400,end:8200,label:'03 / LOAD ARCHIVE'},
    {name:'authorize',start:8200,end:9500,label:'04 / ACCESS GRANTED'},
    {name:'welcome',start:9500,end:11700,label:'05 / ENTER'},
  ];
  const duration=scenes.at(-1).end;
  const clamp=v=>Math.min(1,Math.max(0,v));
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
      <canvas class="intro-field" aria-hidden="true"></canvas><div class="intro-texture" aria-hidden="true"></div><div class="intro-edge" aria-hidden="true"></div>
      <header class="intro-top"><div class="intro-wordmark">FIELD<span>ARCHIVE / OS</span><small>PERSONAL PORTFOLIO · 001</small></div><div class="intro-controls"><button type="button" data-sound aria-pressed="false">开启播报</button><button type="button" data-pause aria-pressed="false">暂停</button><button type="button" data-skip>跳过 ↗</button></div></header>
      <div class="intro-rail" aria-hidden="true">${scenes.map((s,i)=>`<span data-rail="${s.name}"><b>0${i+1}</b>${s.label.split(' / ')[1]}</span>`).join('')}</div>
      <section class="intro-scene intro-signal" data-scene="signal" aria-hidden="true"><div class="intro-init"><div class="intro-cross">+</div><p>ESTABLISHING INTERFACE</p><span>正在唤醒创作档案</span><div class="intro-pulse"><i></i></div></div><div class="intro-boot-log"><span data-boot="0">[ 00 ] DISPLAY SIGNAL ........ ONLINE</span><span data-boot="1">[ 01 ] ARCHIVE INTERFACE ..... READY</span><span data-boot="2">[ 02 ] VISITOR CHANNEL ....... OPEN</span></div></section>
      <section class="intro-scene intro-confirm" data-scene="confirm" aria-hidden="true"><div class="intro-id-frame"><div class="intro-id-reticle" aria-hidden="true"></div><div class="intro-id"><svg class="intro-power" viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle class="intro-power-track" cx="50" cy="50" r="43" stroke="currentColor" stroke-width="2" stroke-dasharray="190 80"/><path d="M50 14v35M33 29a28 28 0 1 0 34 0" stroke="currentColor" stroke-width="3"/></svg><div><span class="intro-kicker">VISITOR / 访客</span><h2 data-id-title>IDENTIFYING</h2><p data-id-status>正在确认访问者</p><div class="intro-id-code"><i></i><span>GUEST — OPEN ARCHIVE</span><b data-id-mark>···</b></div></div></div><div class="intro-request">REQUEST RECEIVED <span>访问请求已接收</span></div><div class="intro-scan" aria-hidden="true"></div></div></section>
      <section class="intro-scene intro-archive" data-scene="archive" aria-hidden="true"><div class="intro-loader"><div class="intro-load-caption"><span>ACCESSING</span><b>Operation Records</b><small>创作档案接入中</small></div><div class="intro-load-number"><span data-load-number>00</span><small>%</small></div><div class="intro-load-track" aria-hidden="true"><i></i></div><div class="intro-load-state"><span data-load-state>INITIALIZING</span><span>ARCHIVE / 001</span></div><div class="intro-modules">${['界面框架','游戏开发','硬件探索','作品集入口'].map((s,i)=>`<div data-module="${i}"><span>0${i+1} / ${s}</span><b>WAIT</b></div>`).join('')}</div></div></section>
      <section class="intro-scene intro-authorize" data-scene="authorize" aria-hidden="true"><div class="intro-access-panel"><span class="intro-kicker">CONNECTION ESTABLISHED</span><div class="intro-access-icon" aria-hidden="true">↗</div><h2>ACCESS GRANTED</h2><p>访问已就绪</p><span class="intro-small">PORTFOLIO INTERFACE / READY</span><div class="intro-access-border" aria-hidden="true"></div></div></section>
      <section class="intro-scene intro-welcome" data-scene="welcome" aria-hidden="true"><div class="intro-welcome-panel"><div class="intro-panel-meta"><span>ACCESS TERMINAL / 001</span><span class="intro-online">● SESSION OPEN</span></div><div class="intro-welcome-layout"><div class="intro-welcome-index" aria-hidden="true"><span>05</span><small>ACCESS<br>COMPLETE</small><i></i></div><div class="intro-welcome-copy"><span class="intro-kicker">PERSONAL ARCHIVE · CONNECTION ESTABLISHED</span><h2 aria-label="WELCOME">${[...'WELCOME'].map((s,i)=>`<span aria-hidden="true" style="--letter:${i}">${s}</span>`).join('')}</h2><p>欢迎进入<span>个人作品集</span></p></div></div><div class="intro-welcome-rule"><i></i></div><div class="intro-panel-meta"><span>DESIGN / BUILD / EXPLORE</span><span>ALL SYSTEMS READY ↗</span></div></div></section>
      <footer class="intro-bottom"><span data-stage-label></span><div class="intro-progress" aria-hidden="true"><span></span></div><span data-counter></span></footer>`;
    document.body.append(dialog);document.body.classList.add('intro-open');active=dialog;
    const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d');
    let width=0,height=0,raf=0,elapsed=reduced.matches?9500:0,last=performance.now(),paused=false,exiting=false;
    const resize=()=>{width=dialog.clientWidth;height=dialog.clientHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0)};
    const observer=new ResizeObserver(resize);observer.observe(dialog);
    const soundtrack=new Audio(new URL('assets/audio/intro/system-voice-zh.mp3',document.baseURI).href);
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
    function field(time,stage){
      if(!ctx||!width)return;
      ctx.clearRect(0,0,width,height);
      const t=reduced.matches?9:time/1000,terrain=['archive','authorize','welcome'].includes(stage);
      const cx=width*.5,cy=height*.49,r=Math.min(width*.32,height*.35,300);
      if(!terrain){
        // Rotating point sphere, then the same geometry flattens into signal paths.
        const flatten=stage==='confirm'?clamp((time-2200)/700):0;
        for(let lat=-12;lat<=12;lat++)for(let lon=0;lon<64;lon++){
          const a=lat*Math.PI/26,b=lon*Math.PI/32+t*.4;
          const x=Math.cos(a)*Math.sin(b),y=Math.sin(a),z=Math.cos(a)*Math.cos(b);
          const px=cx+x*r*(1+flatten*.9),py=cy+y*r*(1-flatten*.5)+Math.sin(x*4+t)*flatten*55;
          ctx.fillStyle=`rgba(49,66,58,${(.06+(z+1)*.08)*(1-flatten*.55)})`;
          ctx.fillRect(px,py,1.2,1.2);
        }
        ctx.strokeStyle='#4d655c26';ctx.lineWidth=.65;
        for(let j=0;j<3;j++){ctx.beginPath();for(let i=0;i<=100;i++){const x=width*i/100,y=cy+Math.sin(i/100*6+t+j*.8)*(55+j*18);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
      }else{
        // A moving wire terrain gives depth while the central interface loads.
        ctx.lineWidth=.65;
        for(let row=0;row<42;row++){
          ctx.strokeStyle=`rgba(74,91,78,${.045+row/42*.16})`;ctx.beginPath();
          for(let col=0;col<=96;col++){
            const x=width*col/96,u=col/96;
            const y=height*.26+row*height*.021+Math.sin(u*8+row*.12-t*.85)*(25+row*.8)+Math.cos(u*4-t*.5)*28;
            col?ctx.lineTo(x,y):ctx.moveTo(x,y);
          }ctx.stroke();
        }
        ctx.strokeStyle='#687d6766';ctx.lineWidth=1;
        for(let j=0;j<2;j++){ctx.beginPath();for(let i=0;i<=140;i++){const x=width*i/140,y=cy+Math.sin(i/140*8-t*1.3+j*2)*50;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
      }
    }
    function loadProgress(p){
      const stops=[[0,0],[.12,17],[.2,17],[.4,48],[.49,48],[.7,83],[.8,83],[.95,100],[1,100]];
      for(let i=1;i<stops.length;i++)if(p<=stops[i][0]){const [a,v]=stops[i-1],[b,w]=stops[i];return v+(w-v)*(p-a)/(b-a)}return 100;
    }
    function render(time){
      const scene=scenes.find(s=>time<s.end)||scenes.at(-1),phase=clamp((time-scene.start)/(scene.end-scene.start));
      dialog.dataset.stage=scene.name;
      dialog.style.setProperty('--phase',phase);dialog.style.setProperty('--reveal',clamp(phase*3));dialog.style.setProperty('--progress',clamp(time/duration));
      dialog.style.setProperty('--welcome',clamp((time-9500)/1300));
      dialog.querySelectorAll('[data-scene]').forEach(el=>{const visible=el.dataset.scene===scene.name;el.classList.toggle('is-active',visible);el.setAttribute('aria-hidden',!visible)});
      dialog.querySelectorAll('[data-rail]').forEach((el,i)=>{el.classList.toggle('is-current',el.dataset.rail===scene.name);el.classList.toggle('is-done',time>=scenes[i].end)});
      dialog.querySelectorAll('[data-boot]').forEach((el,i)=>el.classList.toggle('is-shown',time>250+i*400));
      const confirmed=time>=2750;dialog.classList.toggle('is-confirmed',confirmed);
      dialog.querySelector('[data-id-title]').textContent=confirmed?'ID CONFIRMED':'IDENTIFYING';dialog.querySelector('[data-id-status]').textContent=confirmed?'访问者已确认':'正在确认访问者';dialog.querySelector('[data-id-mark]').textContent=confirmed?'✓':'···';
      const load=Math.round(loadProgress(clamp((time-4400)/3800)));
      dialog.style.setProperty('--load',load/100);dialog.querySelector('[data-load-number]').textContent=String(load).padStart(2,'0');
      const labels=['ASSEMBLING INTERFACE','INDEXING PROJECTS','MOUNTING ARCHIVE','OPENING PORTFOLIO','COMPLETE'];
      dialog.querySelector('[data-load-state]').textContent=labels[Math.min(4,Math.floor(load/25))];
      dialog.querySelectorAll('[data-module]').forEach((el,i)=>{const done=load>=(i+1)*25;el.classList.toggle('is-done',done);el.querySelector('b').textContent=done?'READY':load>=i*25?'LOAD':'WAIT'});
      dialog.querySelector('[data-stage-label]').textContent=scene.label;dialog.querySelector('[data-counter]').textContent=(time/1000).toFixed(2).padStart(5,'0')+' / SYS';
      field(time,scene.name);
    }
    function tick(now){if(active!==dialog||exiting)return;if(!paused&&!document.hidden)elapsed+=Math.min(now-last,80);last=now;if(soundWanted&&!soundtrack.paused&&soundtrack.readyState>=3&&elapsed-lastAudioSync>1200&&Math.abs(soundtrack.currentTime-elapsed/1000)>.35)syncSound();render(elapsed);if(elapsed>=duration)finish();else raf=requestAnimationFrame(tick)}
    dialog.showModal();clearPending();resize();render(elapsed);soundLabel('off');if(soundWanted)startSound();dialog.querySelector('[data-skip]').focus({preventScroll:true});raf=requestAnimationFrame(tick);
    dialog._release=release;
  }
  replay.addEventListener('click',open);
  if(!seen()&&!location.hash&&!reduced.matches&&!window.__portfolioBoot?.expired)open();else clearPending();
  addEventListener('pageshow',e=>{if(e.persisted&&active)active._release()});
})();
