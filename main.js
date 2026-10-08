// 原始游戏素材只读使用；所有网页 UI 均由独立 HTML / CSS 渲染。
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(){ navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); }
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';navigation.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open));});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('open')){closeMenu();menuButton.focus();}});
const sections=[...document.querySelectorAll('main > section[id]')];
const navLinks=[...navigation.querySelectorAll('a')];
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-20% 0px -60% 0px',threshold:0});sections.forEach(s=>observer.observe(s));}
const scenes={dawn:{src:'素材/截图_昼夜/时刻1_6.5点.png',caption:'06:30 / 清晨',alt:'清晨 06:30，角色站在草地中'},day:{src:'素材/截图_昼夜/时刻3_12.0点.png',caption:'12:00 / 正午',alt:'正午 12:00，阳光下的草地与角色'},dusk:{src:'素材/截图_昼夜/时刻5_17.5点.png',caption:'17:30 / 黄昏',alt:'黄昏 17:30，暖色斜光照亮风草与角色'}};
const sceneImage=document.querySelector('#day-image');
document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{const scene=scenes[button.dataset.scene];sceneImage.src=scene.src;sceneImage.alt=scene.alt;document.querySelector('#scene-caption').textContent=scene.caption;document.querySelectorAll('[data-scene]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}));
const imageDialog=document.querySelector('#image-dialog');
const previewImage=document.querySelector('#preview-image');
document.querySelector('[data-preview]').addEventListener('click',()=>{previewImage.src=sceneImage.src;previewImage.alt=sceneImage.alt;document.querySelector('#preview-title').textContent=document.querySelector('#scene-caption').textContent;imageDialog.showModal();document.body.style.overflow='hidden';});
document.querySelector('.dialog-close').addEventListener('click',()=>imageDialog.close());
imageDialog.addEventListener('click',event=>{if(event.target===imageDialog){const box=imageDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)imageDialog.close();}});
imageDialog.addEventListener('close',()=>{document.body.style.overflow='';});
