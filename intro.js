/* A fictional visual boot sequence, isolated from the competition website. */
(() => {
  'use strict';
  const key='portfolio-prologue-v6';
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
      <header class="intro-top"><div class="intro-wordmark">PORTFOLIO<small>INDEPENDENT WORKS / PORTFOLIO</small></div><div class="intro-controls"><button type="button" data-sound aria-pressed="false">开启播报</button><button type="button" data-pause aria-pressed="false">暂停</button><button type="button" data-skip>跳过 ↗</button></div></header>
      <div class="intro-aperture" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i style="--i:${i}"></i>`).join('')}<span class="intro-aperture-mark">+</span><div class="intro-plate"></div></div>
      <section class="intro-scene intro-signal" data-scene="signal" aria-hidden="true"><div class="intro-init"><div class="intro-dot"></div><p>ESTABLISHING CONTACT</p><span class="intro-orbit-label">001 / SIGNAL</span></div></section>
      <section class="intro-scene intro-confirm" data-scene="confirm" aria-hidden="true"><div class="intro-id"><svg class="intro-power" viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle class="intro-power-track" cx="50" cy="50" r="43" stroke="currentColor" stroke-width="1" stroke-dasharray="190 80"/><path d="M50 14v35M33 29a28 28 0 1 0 34 0" stroke="currentColor" stroke-width="5"/></svg><div><span class="intro-kicker">IDENTITY / 01</span><h2 data-id-title>IDENTIFYING</h2><p data-id-status>确认访问者</p></div><span class="intro-id-dot" aria-hidden="true"></span><div class="intro-id-stamp" aria-hidden="true">ACCESS<br>ACCEPTED<span>+</span></div></div></section>
      <section class="intro-scene intro-archive" data-scene="archive" aria-hidden="true"><div class="intro-loader"><div class="intro-load-heading"><span class="intro-kicker">CREATIVE<br>ARCHIVE</span><div class="intro-load-number"><span data-load-number>00</span><small>%</small></div></div><div class="intro-load-track" aria-hidden="true"><i></i><b></b></div><p>创作档案接入中</p></div></section>
      <section class="intro-scene intro-authorize" data-scene="authorize" aria-hidden="true"><div class="intro-connection"><i aria-hidden="true"></i><span>PERMISSION AUTHORIZED<small>连接已建立</small></span></div></section>
      <section class="intro-scene intro-welcome" data-scene="welcome" aria-hidden="true"><div class="intro-welcome-copy"><span class="intro-kicker">PERSONAL ARCHIVE <b>— 001</b></span><h2 aria-label="WELCOME">${[...'WELCOME'].map((s,i)=>`<span aria-hidden="true" style="--letter:${i}">${s}</span>${i===2?'<i class="intro-mobile-break" aria-hidden="true"></i>':''}`).join('')}</h2><p>欢迎进入</p><div class="intro-welcome-rule" aria-hidden="true"><i></i></div><span class="intro-welcome-note">GAME DEVELOPMENT<br>HARDWARE / VISUAL EXPERIMENTS</span><span class="intro-print-mark" aria-hidden="true">+</span></div></section>
      <footer class="intro-bottom"><span>ARCHIVE / 001</span><span data-stage-label></span><span class="intro-bottom-note">DESIGN IN PROGRESS</span></footer>`;
    document.body.append(dialog);document.body.classList.add('intro-open');active=dialog;
    const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d');
    let width=0,height=0,raf=0,elapsed=reduced.matches?8800:0,last=performance.now(),paused=false,exiting=false;
    const resize=()=>{width=dialog.clientWidth;height=dialog.clientHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0)};
    const observer=new ResizeObserver(resize);observer.observe(dialog);
    const soundtrack=new Audio(new URL('assets/audio/intro/entry-voice-zh-v6.mp3',document.baseURI).href);
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
    const visibility=()=>{last=performance.now();if(document.hidden)stopSound();else startSound()};
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
      const dive=ease((time-1200)/600),r=Math.min(width*.39,height*.46)*(1+dive*1.1);
      // A close point shell rushes past the camera; no persistent card behind it.
      if(time<1850){
        ctx.save();ctx.translate(cx,cy);ctx.rotate(-.2+t*.08);
        for(let lat=-18;lat<=18;lat++)for(let lon=0;lon<80;lon++){
          const a=lat*Math.PI/38,b=lon*Math.PI/40+t*.55;
          const x=Math.cos(a)*Math.sin(b),y=Math.sin(a),z=Math.cos(a)*Math.cos(b);
          const depth=1/(1-z*.24);
          ctx.fillStyle=`rgba(38,49,43,${(.08+(z+1)*.19)*(1-dive)})`;
          ctx.fillRect(x*r*depth,y*r*depth,1.2,1.2);
        }
        ctx.strokeStyle=`rgba(48,62,53,${.36*(1-dive)})`;ctx.lineWidth=.7;
        ctx.beginPath();ctx.ellipse(0,0,r*1.03,r*.25,-.65,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      // Fine continuous paths cross the full frame during identification.
      const cable=ease((time-1200)/550)*(1-ease((time-4000)/400));
      if(cable>0){ctx.save();ctx.strokeStyle=`rgba(62,76,62,${cable*.4})`;ctx.lineWidth=.8;
        for(let j=0;j<3;j++){ctx.beginPath();for(let i=0;i<=160;i++){
          const u=i/160,x=width*u,y=height*(.98-u)+Math.sin(u*10+t*.3+j*.6)*height*.14+j*12;
          i?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }ctx.stroke()}ctx.restore();}
      // The load shot is a moving landscape; perspective and camera drift carry the eye.
      const terrain=ease((time-3950)/380);
      if(terrain>0){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.16+Math.sin(t*.18)*.025);
        for(let row=0;row<52;row++){
          ctx.strokeStyle=`rgba(70,86,65,${terrain*(.1+row/52*.28)})`;ctx.lineWidth=.65;ctx.beginPath();
          for(let col=0;col<=110;col++){
            const u=col/110,x=(u-.5)*width*1.65;
            const y=(row-26)*height*.024+Math.sin(u*7.5+row*.065-t*.55)*(height*.12+row*.4)+Math.cos(u*3+t*.25)*height*.1;
            col?ctx.lineTo(x,y):ctx.moveTo(x,y);
            if(row%5===0&&col%10===0){ctx.fillStyle=`rgba(66,80,58,${terrain*.36})`;ctx.fillRect(x-1,y-1,2,2)}
          }ctx.stroke();
        }
        ctx.restore();
        const amplitude=height*.09;
        for(let j=0;j<2;j++){ctx.beginPath();ctx.strokeStyle=`rgba(42,59,43,${terrain*.6})`;ctx.lineWidth=1.2;
          for(let i=0;i<=160;i++){const u=i/160,x=u*width,y=cy+Math.sin(u*8-t*.75+j*2.5)*amplitude; i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
      }
      // Offset registration marks, like a moving printed plate.
      const mx=width<600?22:width*.075;
      ctx.strokeStyle='#55624c80';ctx.lineWidth=.8;
      [[mx,height*.23],[width-mx,height*.78]].forEach(([x,y])=>{ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x+9,y);ctx.moveTo(x,y-9);ctx.lineTo(x,y+9);ctx.stroke()});
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
      dialog.style.setProperty('--scene-opacity',1);
      dialog.style.setProperty('--cut',ease((time-scene.start)/300));
      dialog.style.setProperty('--identity',ease((time-2480)/280));
      dialog.style.setProperty('--camera',ease((time-7600)/1050));
      dialog.style.setProperty('--welcome',ease((time-8800)/650));
      dialog.querySelectorAll('[data-scene]').forEach(el=>{const visible=el.dataset.scene===scene.name;el.classList.toggle('is-active',visible);el.setAttribute('aria-hidden',!visible)});
      const confirmed=time>=2680;dialog.classList.toggle('is-confirmed',confirmed);
      dialog.querySelector('[data-id-title]').textContent=confirmed?'ID CONFIRMED':'IDENTIFYING';dialog.querySelector('[data-id-status]').textContent=confirmed?'访问者已确认':'确认访问者';
      const load=Math.round(loadProgress(clamp((time-4000)/3600)));dialog.style.setProperty('--load',load/100);dialog.querySelector('[data-load-number]').textContent=String(load).padStart(2,'0');
      // Frame bursts become a perspective paper plate, not five fixed UI screens.
      const small=Math.min(width*.58,300),largeW=Math.min(width*.84,1100),largeH=Math.min(height*.62,510);
      let fw=small,fh=small,spread=0,angle=0,alpha=0,tilt=0,scale=1;
      if(time>=3050&&time<4000){const q=ease((time-3050)/950);fw=small+q*width*.6;fh=small+q*height*.4;spread=q*33;angle=q*-7;alpha=Math.sin(q*Math.PI)*.7;}
      else if(time>=7600){const q=ease((time-7600)/900),w=ease((time-8600)/700);fw=mix(Math.min(width*.65,620),largeW,w);fh=mix(Math.min(height*.36,270),largeH,w);spread=(1-q)*22+3;angle=(1-q)*-5;alpha=1;tilt=(1-q)*72;scale=mix(.65,1,q);}
      dialog.style.setProperty('--frame-w',fw+'px');dialog.style.setProperty('--frame-h',fh+'px');dialog.style.setProperty('--frame-spread',spread+'px');dialog.style.setProperty('--frame-angle',angle+'deg');dialog.style.setProperty('--frame-alpha',alpha);
      dialog.style.setProperty('--plate-tilt',tilt+'deg');dialog.style.setProperty('--plate-scale',scale);
      dialog.querySelector('[data-stage-label]').textContent=scene.label;
      field(time);
    }
    function tick(now){if(active!==dialog||exiting)return;if(!paused&&!document.hidden)elapsed+=Math.max(0,now-last);last=now;if(soundWanted&&!soundtrack.paused&&soundtrack.readyState>=3&&elapsed-lastAudioSync>1200&&Math.abs(soundtrack.currentTime-elapsed/1000)>.35)syncSound();render(elapsed);if(elapsed>=duration)finish();else raf=requestAnimationFrame(tick)}
    dialog.showModal();clearPending();resize();render(elapsed);soundLabel('off');if(soundWanted)startSound();dialog.querySelector('[data-skip]').focus({preventScroll:true});raf=requestAnimationFrame(tick);
    dialog._release=release;
  }
  replay.addEventListener('click',open);
  if(!seen()&&!location.hash&&!reduced.matches&&!window.__portfolioBoot?.expired)open();else clearPending();
  addEventListener('pageshow',e=>{if(e.persisted&&active)active._release()});
})();
