'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const navToggle = $('.nav-toggle');
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.textContent = open ? '收起 −' : '目录 ＋';
  $('.main-nav').classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') navToggle.click();
});

const arrival = $('.arrival');
if (arrival) {
  let entered = false;
  try { entered = sessionStorage.getItem('wuxi-entered') === '1'; } catch { /* Browsing works without storage. */ }
  let restoreFocus;
  const enter = () => {
    if (arrival.hidden) return;
    try { sessionStorage.setItem('wuxi-entered', '1'); } catch { /* Optional preference. */ }
    arrival.classList.add('depart');
    document.body.classList.remove('modal-open');
    $$('.site-header, main, .site-footer, .skip-link').forEach(node => node.inert = false);
    window.setTimeout(() => { arrival.hidden = true; }, reduced.matches ? 0 : 650);
    restoreFocus?.focus({ preventScroll: true });
  };
  if (!entered && !window.location.hash) {
    arrival.hidden = false;
    document.body.classList.add('modal-open');
    restoreFocus = $('.hero-copy .text-link');
    $$('.site-header, main, .site-footer, .skip-link').forEach(node => node.inert = true);
    $('[data-enter]', arrival).focus({ preventScroll: true });
  }
  $$('[data-enter]').forEach(button => button.addEventListener('click', enter));
  arrival.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); enter(); }
    if (event.key === 'Tab') {
      const buttons = $$('button', arrival), index = buttons.indexOf(document.activeElement);
      if (event.shiftKey && index === 0) { event.preventDefault(); buttons.at(-1).focus(); }
      else if (!event.shiftKey && index === buttons.length - 1) { event.preventDefault(); buttons[0].focus(); }
    }
  });
}

$$('button[data-hour]').forEach(button => button.addEventListener('click', () => {
  const hour = button.dataset.hour;
  $('.home-hero').dataset.hour = hour;
  $$('button[data-hour]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  $('#hour-description').textContent = hour === 'day' ? '白昼 · 街巷尚有来往' : '暮色 · 寻找回去的灯';
}));

const places = {
  town: ['town-day', 'REGION 01 / OLD STREETS', '石街与屋檐', '灯柱、店铺与通向室内的门。先认清街口，再决定下一段路。'],
  country: ['countryside', 'REGION 02 / COUNTRYSIDE', '田野与风车', '沿田边的路向外走。留意村舍与岔路，也为回城留下一段时间。'],
  station: ['station', 'REGION 03 / RAILWAY STATION', '铁轨尽头的抵达', '列车停靠在石砌站台。这一段旅途的终点，是你认识小镇的起点。'],
};
$$('[data-place]').forEach(button => button.addEventListener('click', () => {
  const [photo, code, title, description] = places[button.dataset.place];
  const img = $('.place-image');
  img.src = `assets/screens/${photo}.webp`;
  img.alt = title + '游戏实景';
  $('#place-code').textContent = code;
  $('#place-title').textContent = title;
  $('#place-description').textContent = description;
  $$('[data-place]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));

const characters = {
  traveller: ['旅人', '一张单程车票', '提着旧皮箱来到雾汐镇。陌生的街道，等待你亲眼看清。', '01'],
  explorer: ['探访者', '寻找被遗忘的细节', '留意被忽略的脚印、污渍与旧物。真相常藏在不起眼的角落。', '02'],
  doctor: ['巫医', '面具后的远行者', '鸟喙面具下的陌生访客。随身的药囊，装着沿途见过的故事。', '03'],
  witch: ['女巫', '暮色中的来客', '宽檐帽与暗红长袍。穿过人群时，听见那些未说完的话。', '04'],
  detective: ['侦探', '带上你的放大镜', '黑礼帽下，一双留意细节的眼睛。透过放大镜，寻找小镇留下的痕迹。', '05'],
};
$$('[data-character]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.character, [name, subtitle, description, number] = characters[id];
  $('#character-image').src = `assets/characters/${id}.png`;
  $('#character-image').alt = name + '像素形象';
  $('#character-name').textContent = name;
  $('#character-subtitle').textContent = subtitle;
  $('#character-description').textContent = description;
  $('.character-no').textContent = number;
  $$('[data-character]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));

const studyTimes = {
  dawn: ['时刻1_6.5点.png', '06:30 / 清晨'],
  day: ['时刻3_12.0点.png', '12:00 / 正午'],
  dusk: ['时刻5_17.5点.png', '17:30 / 黄昏'],
};
$$('[data-study]').forEach(button => button.addEventListener('click', () => {
  const [file, caption] = studyTimes[button.dataset.study];
  $('#study-image').src = `素材/截图_昼夜/${file}`;
  $('#study-image').alt = caption + '的草地与旅人';
  $('#study-caption').textContent = caption;
  $$('[data-study]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));

const lightbox = $('.lightbox');
if (lightbox) {
  let currentIndex = 0, lastTrigger;
  const visiblePhotos = () => $$('.gallery-item:not([hidden]) [data-photo]');
  const displayPhoto = (index) => {
    const photos = visiblePhotos();
    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];
    $('img', lightbox).src = `assets/screens/${photo.dataset.photo}.webp`;
    $('img', lightbox).alt = photo.dataset.title;
    $('figcaption', lightbox).textContent = `${photo.dataset.title}  /  ${currentIndex + 1} · ${photos.length}`;
  };
  $$('[data-photo]').forEach(button => button.addEventListener('click', () => {
    lastTrigger = button;
    displayPhoto(visiblePhotos().indexOf(button));
    lightbox.showModal();
    document.body.classList.add('modal-open');
  }));
  $('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastTrigger?.focus({ preventScroll: true }); });
  $$('[data-gallery-step]').forEach(button => button.addEventListener('click', () => displayPhoto(currentIndex + Number(button.dataset.galleryStep))));
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); displayPhoto(currentIndex + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); displayPhoto(currentIndex - 1); }
  });
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('.gallery-item').forEach(item => item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter);
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
}
