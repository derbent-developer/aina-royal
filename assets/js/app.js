/* =========================================================================
   AINA ROYAL STUDIO — логика и анимации
   Без библиотек: IntersectionObserver + rAF-скролл.
   ========================================================================= */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const P  = 'assets/photos/';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ═════════════════════════════════════════════════ ЗАГРУЗЧИК ══ */
const loader = $('#loader');
const bar = $('.loader__bar i');
requestAnimationFrame(() => bar.style.width = '55%');
addEventListener('load', () => {
  bar.style.width = '100%';
  setTimeout(() => {
    loader.classList.add('is-off');
    document.body.classList.remove('is-locked');
    kickHero();
  }, 420);
});
document.body.classList.add('is-locked');
setTimeout(() => { // страховка, если что-то не догрузилось
  if (!loader.classList.contains('is-off')) {
    loader.classList.add('is-off');
    document.body.classList.remove('is-locked');
    kickHero();
  }
}, 4000);

function kickHero(){
  $$('.hero__title .line > span, .hero__title em > span').forEach((el, i) => {
    el.style.transition = 'transform 1.3s cubic-bezier(.16,1,.3,1) ' + (i * .12 + .05) + 's, opacity 1s ease ' + (i * .12 + .05) + 's';
    el.style.transform = 'none';
    el.style.opacity = '1';
  });
  ['.hero__kicker', '.hero__lead', '.hero__actions'].forEach((s, i) => {
    const el = $(s);
    el.style.transition = 'transform 1.1s cubic-bezier(.16,1,.3,1) ' + (.35 + i * .12) + 's, opacity .9s ease ' + (.35 + i * .12) + 's';
    el.style.transform = 'none';
    el.style.opacity = '1';
  });
}
// стартовые состояния для интро
$$('.hero__title .line > span, .hero__title em > span').forEach(el => { el.style.transform = 'translateY(105%)'; el.style.opacity = '0'; });
['.hero__kicker', '.hero__lead', '.hero__actions'].forEach(s => { const el = $(s); el.style.transform = 'translateY(24px)'; el.style.opacity = '0'; });

/* ══════════════════════════════════════════════════════ ШАПКА ══ */
const nav = $('#nav'), burger = $('#burger'), navLinks = $('#navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
navLinks.addEventListener('click', e => {
  if (e.target.tagName === 'A') { navLinks.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
});

/* ═══════════════════════════════════════════ ПОЯВЛЕНИЕ БЛОКОВ ══ */
const revealIO = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
}, { rootMargin: '0px 0px -12% 0px', threshold: .08 });
const observeReveals = () => $$('.reveal:not(.in), .gal__item:not(.in)').forEach(el => revealIO.observe(el));

/* ══════════════════════════════════════════════════ СЧЁТЧИКИ ══ */
const countIO = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1500;
    const tick = (t) => {
      const k = clamp((t - t0) / dur);
      const v = to * (1 - Math.pow(1 - k, 3));
      el.textContent = dec ? v.toFixed(dec).replace('.', ',') : Math.round(v);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: .5 });
$$('.count').forEach(el => countIO.observe(el));

/* ══════════════════════════════════════════════════ ИСТОРИЯ ══ */
const storyMedia = $('#storyMedia'), storyTexts = $('#storyTexts'), storyDots = $('#storyDots');
storyMedia.innerHTML = PHOTOS.story.map((p, i) =>
  `<figure class="${i === 0 ? 'is-on' : ''}"><img src="${P}${p}" alt="" loading="${i ? 'lazy' : 'eager'}"></figure>`).join('');
storyTexts.innerHTML = STORY.map((s, i) =>
  `<article class="${i === 0 ? 'is-on' : ''}">
     <p class="eyebrow">${s.kicker}</p>
     <h3>${s.title}</h3>
     <p>${s.text}</p>
   </article>`).join('');
storyDots.innerHTML = STORY.map((_, i) => `<i class="${i === 0 ? 'is-on' : ''}"></i>`).join('');
$('#storySpacer').style.height = (STORY.length * 100) + 'vh';

/* ═══════════════════════════════════════════════ ЛЕНТА РАБОТ ══ */
$('#stripTrack').innerHTML = PHOTOS.strip
  .map(p => `<figure><img src="${P}${p}" alt="Работа мастеров «Айна Рояль»" loading="lazy"></figure>`).join('');

/* ══════════════════════════════════════════ СКРОЛЛ-АНИМАЦИИ ══ */
const hero = $('#hero'), heroFrame = $('#heroFrame'), heroImg = $('#heroImg'), heroCopy = $('#heroCopy');
const story = $('.story'), stripSec = $('#strip'), stripTrack = $('#stripTrack');
let ticking = false;

function onScroll(){
  const y = scrollY, vh = innerHeight;

  /* шапка */
  nav.classList.toggle('is-stuck', y > 40);

  /* плавающая кнопка */
  $('.fab').classList.toggle('is-on', y > vh * 1.4 && y < document.body.scrollHeight - vh * 2.2);

  if (REDUCED) return;

  /* — герой: кадр «сжимается» в скруглённую карточку, текст уходит вверх — */
  const hp = clamp((y - hero.offsetTop) / (hero.offsetHeight - vh));
  const e = hp * hp;                                   // мягкое ускорение
  heroFrame.style.borderRadius = (e * 46) + 'px';
  heroFrame.style.transform = `scale(${1 - e * .12})`;
  heroImg.style.transform = `scale(${1.14 - e * .14}) translateY(${e * -3}%)`;
  heroImg.style.filter = `brightness(${1 - e * .18})`;
  heroCopy.style.transform = `translateY(${-e * 130}px) scale(${1 - e * .06})`;
  heroCopy.style.opacity = String(clamp(1 - hp * 1.7));

  /* — история: кадры и тексты меняются по прогрессу — */
  const st = story.offsetTop, sh = story.offsetHeight - vh;
  if (y > st - vh && y < st + sh + vh) {
    const sp = clamp((y - st) / sh);
    const idx = Math.min(STORY.length - 1, Math.floor(sp * STORY.length * .999));
    setStory(idx);
  }

  /* — лента: едет вбок — */
  const sr = stripSec.getBoundingClientRect();
  if (sr.top < vh && sr.bottom > 0) {
    const k = clamp((vh - sr.top) / (vh + sr.height));
    const max = Math.max(0, stripTrack.scrollWidth - innerWidth + 60);
    stripTrack.style.transform = `translate3d(${-k * max}px,0,0)`;
  }
}

let storyIdx = -1;
function setStory(i){
  if (i === storyIdx) return;
  storyIdx = i;
  $$('#storyMedia figure').forEach((f, n) => f.classList.toggle('is-on', n === i));
  $$('#storyTexts article').forEach((a, n) => a.classList.toggle('is-on', n === i));
  $$('#storyDots i').forEach((d, n) => d.classList.toggle('is-on', n === i));
}

addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });
addEventListener('resize', onScroll);

/* ══════════════════════════════════════════════════ УСЛУГИ ══ */
const SHOWN = 14;  // сколько позиций видно до нажатия «показать всё»
$('#svcTabs').innerHTML = SERVICES.map((s, i) =>
  `<button class="svc__tab ${i === 0 ? 'is-on' : ''}" data-i="${i}" role="tab">${s.title}</button>`).join('');

$('#svcPanels').innerHTML = SERVICES.map((s, i) => {
  const rows = s.items.map(([n, p], k) =>
    `<li${k >= SHOWN ? ' class="is-extra" hidden' : ''}>
       <span class="svc__name">${n}</span><span class="svc__dots"></span><span class="svc__price">${p.toLocaleString('ru-RU')} ₽</span>
     </li>`).join('');
  const more = s.items.length > SHOWN
    ? `<div class="svc__more"><button class="btn btn--ghost svc__toggle" type="button">Показать все ${s.items.length}</button></div>` : '';
  return `<div class="svc__panel ${i === 0 ? 'is-on' : ''}" data-i="${i}">
            <p class="svc__lead">${s.lead}</p>
            <ul class="svc__list">${rows}</ul>${more}
          </div>`;
}).join('');

$('#svcTabs').addEventListener('click', e => {
  const b = e.target.closest('.svc__tab'); if (!b) return;
  $$('.svc__tab').forEach(t => t.classList.toggle('is-on', t === b));
  $$('.svc__panel').forEach(p => p.classList.toggle('is-on', p.dataset.i === b.dataset.i));
});
$('#svcPanels').addEventListener('click', e => {
  const b = e.target.closest('.svc__toggle'); if (!b) return;
  const panel = b.closest('.svc__panel');
  const extras = $$('.is-extra', panel);
  const open = extras[0].hidden;
  extras.forEach(li => li.hidden = !open);
  b.textContent = open ? 'Свернуть' : `Показать все ${extras.length + SHOWN}`;
});

/* ═════════════════════════════════════════════════ МАСТЕРА ══ */
$('#mastersGrid').innerHTML = MASTERS.map(m =>
  `<button class="mcard" type="button" data-id="${m.id}">
     <div class="mcard__ava">${m.initials}</div>
     <h3 class="mcard__name">${m.name}</h3>
     <p class="mcard__role">${m.role}</p>
     ${m.rating ? `<div class="mcard__rate"><span class="mcard__stars">★★★★★</span> ${m.rating} <small>· ${m.reviews} оценок</small></div>` : ''}
     <div class="mcard__pick">Выбрать мастера</div>
   </button>`).join('');

$('#mastersGrid').addEventListener('click', e => {
  const c = e.target.closest('.mcard'); if (!c) return;
  pickMaster(c.dataset.id);
  $('#booking').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
});

/* ══════════════════════════════════════════════════ ЗАПИСЬ ══ */
const bk = { cat: SERVICES[0].id, service: null, price: null, master: 'any', day: null, time: null };
let step = 1;

const bkCat = $('#bkCat'), bkService = $('#bkService');
bkCat.innerHTML = SERVICES.map(s => `<option value="${s.id}">${s.title}</option>`).join('');

function fillServices(){
  const cat = SERVICES.find(s => s.id === bk.cat);
  bkService.innerHTML = cat.items.map(([n, p], i) => `<option value="${i}">${n} — ${p.toLocaleString('ru-RU')} ₽</option>`).join('');
  setService(0);
}
function setService(i){
  const cat = SERVICES.find(s => s.id === bk.cat);
  bk.service = cat.items[i][0];
  bk.price = cat.items[i][1];
  $('#bkPrice').innerHTML = `Стоимость услуги: <b>${bk.price.toLocaleString('ru-RU')} ₽</b>`;
}
bkCat.addEventListener('change', () => { bk.cat = bkCat.value; fillServices(); });
bkService.addEventListener('change', () => setService(+bkService.value));
fillServices();

/* мастера в форме */
function renderBkMasters(){
  $('#bkMasters').innerHTML = MASTERS.map(m =>
    `<button class="mcard ${m.id === bk.master ? 'is-on' : ''}" type="button" data-id="${m.id}">
       <div class="mcard__ava">${m.initials}</div>
       <h3 class="mcard__name">${m.name}</h3>
       <p class="mcard__role">${m.role}</p>
       ${m.rating ? `<div class="mcard__rate"><span class="mcard__stars">★★★★★</span> ${m.rating} <small>· ${m.reviews} оценок</small></div>` : ''}
       <div class="mcard__pick">${m.id === bk.master ? 'Выбран' : 'Выбрать'}</div>
     </button>`).join('');
}
$('#bkMasters').className = 'book__masters masters__grid';
renderBkMasters();
$('#bkMasters').addEventListener('click', e => {
  const c = e.target.closest('.mcard'); if (!c) return;
  bk.master = c.dataset.id; renderBkMasters();
});
function pickMaster(id){ bk.master = id; renderBkMasters(); goStep(2); }

/* даты и время */
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MN = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const days = [];
for (let i = 0; i < 14; i++) {
  const d = new Date(); d.setDate(d.getDate() + i);
  days.push(d);
}
$('#bkDays').innerHTML = days.map((d, i) =>
  `<button class="book__day ${i === 0 ? 'is-on' : ''}" type="button" data-i="${i}">
     <b>${d.getDate()}</b><small>${WD[d.getDay()]} · ${MN[d.getMonth()]}</small>
   </button>`).join('');
bk.day = days[0];

const TIMES = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
function renderTimes(){
  const now = new Date();
  const isToday = bk.day.toDateString() === now.toDateString();
  $('#bkTimes').innerHTML = TIMES.map(t => {
    const past = isToday && +t.slice(0, 2) <= now.getHours();
    return `<button class="book__time ${bk.time === t ? 'is-on' : ''}" type="button" data-t="${t}" ${past ? 'disabled style="opacity:.35;cursor:default"' : ''}>${t}</button>`;
  }).join('');
}
renderTimes();
$('#bkDays').addEventListener('click', e => {
  const b = e.target.closest('.book__day'); if (!b) return;
  $$('.book__day').forEach(d => d.classList.toggle('is-on', d === b));
  bk.day = days[+b.dataset.i]; bk.time = null; renderTimes();
});
$('#bkTimes').addEventListener('click', e => {
  const b = e.target.closest('.book__time'); if (!b || b.disabled) return;
  bk.time = b.dataset.t; renderTimes();
});

/* телефон — мягкая маска */
const bkPhone = $('#bkPhone');
bkPhone.addEventListener('input', () => {
  let d = bkPhone.value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let out = '+7';
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length >= 5) out += ') ' + d.slice(4, 7);
  if (d.length >= 8) out += '-' + d.slice(7, 9);
  if (d.length >= 10) out += '-' + d.slice(9, 11);
  bkPhone.value = out;
});

/* сводка */
function dateStr(d){ return `${d.getDate()} ${MN[d.getMonth()]}, ${WD[d.getDay()]}`; }
function renderSummary(){
  const m = MASTERS.find(x => x.id === bk.master);
  $('#bkSummary').innerHTML =
    `<h4>Ваша запись</h4>
     <dl>
       <div><dt>Услуга</dt><dd>${bk.service}</dd></div>
       <div><dt>Мастер</dt><dd>${m.name}</dd></div>
       <div><dt>Когда</dt><dd>${dateStr(bk.day)}${bk.time ? ', ' + bk.time : ''}</dd></div>
     </dl>
     <div class="total"><span>Стоимость</span><b>${bk.price.toLocaleString('ru-RU')} ₽</b></div>`;
}

/* шаги */
function goStep(n){
  step = n;
  $$('.book__pane').forEach(p => p.classList.toggle('is-active', +p.dataset.step === n));
  $$('#bookSteps li').forEach((li, i) => {
    li.classList.toggle('is-active', i + 1 === n);
    li.classList.toggle('is-done', i + 1 < n);
  });
  $('#bkBack').hidden = n === 1;
  $('#bkNext').textContent = n === 4 ? 'Отправить заявку' : 'Далее';
  if (n === 4) renderSummary();
}
$('#bkBack').addEventListener('click', () => goStep(Math.max(1, step - 1)));
$('#bkNext').addEventListener('click', () => {
  if (step === 3 && !bk.time) { $('#bkTimes').animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}], {duration:280}); return; }
  if (step < 4) { goStep(step + 1); return; }
  submit();
});
goStep(1);

function submit(){
  const name = $('#bkName').value.trim();
  const phone = $('#bkPhone').value.trim();
  if (name.length < 2 || phone.replace(/\D/g, '').length < 11) {
    [$('#bkName'), $('#bkPhone')].forEach(el => {
      if ((el === $('#bkName') && name.length < 2) || (el === $('#bkPhone') && phone.replace(/\D/g,'').length < 11)) {
        el.style.borderColor = '#c96b6b';
        el.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'none'}], {duration:250});
        el.addEventListener('input', () => el.style.borderColor = '', { once: true });
      }
    });
    return;
  }
  const m = MASTERS.find(x => x.id === bk.master);
  const note = $('#bkNote').value.trim();
  const text =
    `Здравствуйте! Хочу записаться в «Айна Рояль».\n\n` +
    `Услуга: ${bk.service}\n` +
    `Мастер: ${m.name}\n` +
    `Дата: ${dateStr(bk.day)}, ${bk.time}\n` +
    `Стоимость по прайсу: ${bk.price.toLocaleString('ru-RU')} ₽\n` +
    `Имя: ${name}\nТелефон: ${phone}` +
    (note ? `\nКомментарий: ${note}` : '');

  $('#bkWa').href = `https://wa.me/${SALON.phoneRaw}?text=${encodeURIComponent(text)}`;
  $('#bkDoneText').textContent =
    `${name}, мы записали: «${bk.service}», ${m.name}, ${dateStr(bk.day)} в ${bk.time}. ` +
    `Отправьте заявку в WhatsApp или позвоните — администратор подтвердит время.`;
  $('.book__steps').hidden = true;
  $('.book__body').hidden = true;
  $('.book__foot').hidden = true;
  $('#bkDone').hidden = false;
}
$('#bkAgain').addEventListener('click', () => {
  $('.book__steps').hidden = false;
  $('.book__body').hidden = false;
  $('.book__foot').hidden = false;
  $('#bkDone').hidden = true;
  goStep(1);
});

/* ═════════════════════════════════════════════════ ГАЛЕРЕЯ ══ */
$('#galFilters').innerHTML = GALLERY_FILTERS.map(([id, t], i) =>
  `<button class="gal__filter ${i === 0 ? 'is-on' : ''}" type="button" data-f="${id}">${t}</button>`).join('');

$('#galGrid').innerHTML = PHOTOS.gallery.map(([p, cat], i) =>
  `<figure class="gal__item" data-cat="${cat}" data-i="${i}">
     <img src="${P}${p}" alt="Салон «Айна Рояль» — фото ${i + 1}" loading="lazy">
   </figure>`).join('');

$('#galFilters').addEventListener('click', e => {
  const b = e.target.closest('.gal__filter'); if (!b) return;
  $$('.gal__filter').forEach(f => f.classList.toggle('is-on', f === b));
  const f = b.dataset.f;
  $$('.gal__item').forEach(it => it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f));
});

/* лайтбокс */
const lb = $('#lb'), lbImg = $('#lbImg');
let lbList = [], lbAt = 0;
$('#galGrid').addEventListener('click', e => {
  const it = e.target.closest('.gal__item'); if (!it) return;
  lbList = $$('.gal__item:not(.is-hidden)');
  lbAt = lbList.indexOf(it);
  openLb();
});
function openLb(){ lbImg.src = $('img', lbList[lbAt]).src; lb.hidden = false; document.body.classList.add('is-locked'); }
function moveLb(d){ lbAt = (lbAt + d + lbList.length) % lbList.length; lbImg.src = $('img', lbList[lbAt]).src; }
$('#lbClose').addEventListener('click', () => { lb.hidden = true; document.body.classList.remove('is-locked'); });
$('#lbPrev').addEventListener('click', () => moveLb(-1));
$('#lbNext').addEventListener('click', () => moveLb(1));
lb.addEventListener('click', e => { if (e.target === lb) { lb.hidden = true; document.body.classList.remove('is-locked'); } });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') { lb.hidden = true; document.body.classList.remove('is-locked'); }
  if (e.key === 'ArrowLeft') moveLb(-1);
  if (e.key === 'ArrowRight') moveLb(1);
});

/* ══════════════════════════════════════════════════ ОТЗЫВЫ ══ */
$('#topics').innerHTML = RATING_TOPICS.map(([n, pct, cnt]) =>
  `<div class="topic">
     <div class="topic__top"><b>${n}</b><span>${pct}%</span></div>
     <div class="topic__bar"><i data-w="${pct}"></i></div>
     <div class="topic__cnt">${cnt} отзывов</div>
   </div>`).join('');
new IntersectionObserver((es, o) => {
  es.forEach(e => { if (e.isIntersecting) { $$('.topic__bar i').forEach(i => i.style.width = i.dataset.w + '%'); o.disconnect(); } });
}, { threshold: .3 }).observe($('#topics'));

$('#revTrack').innerHTML = REVIEWS.map(r =>
  `<div class="rev__card"><blockquote class="rev__quote">
     <p class="rev__text">${r.text}</p>
     <div class="rev__who">
       <div class="rev__ava">${r.name[0]}</div>
       <div><div class="rev__name">${r.name}</div><div class="rev__meta">${r.meta}</div></div>
       <div class="rev__stars">★★★★★</div>
     </div>
   </blockquote></div>`).join('');
$('#revDots').innerHTML = REVIEWS.map((_, i) => `<i class="${i === 0 ? 'is-on' : ''}" data-i="${i}"></i>`).join('');

let revAt = 0;
function revGo(i){
  revAt = (i + REVIEWS.length) % REVIEWS.length;
  $('#revTrack').style.transform = `translateX(${-revAt * 100}%)`;
  $$('#revDots i').forEach((d, n) => d.classList.toggle('is-on', n === revAt));
}
$('#revPrev').addEventListener('click', () => revGo(revAt - 1));
$('#revNext').addEventListener('click', () => revGo(revAt + 1));
$('#revDots').addEventListener('click', e => { if (e.target.dataset.i) revGo(+e.target.dataset.i); });

/* ═══════════════════════════════════════════════════ КАРТА ══ */
$('#mapBtn').addEventListener('click', () => {
  $('#map').innerHTML =
    `<iframe src="https://yandex.ru/map-widget/v1/org/151131584876/" allowfullscreen loading="lazy" title="Айна Рояль на Яндекс Картах"></iframe>`;
});

/* ══════════════════════════════════════════════════ ПРОЧЕЕ ══ */
$('#year').textContent = new Date().getFullYear();
observeReveals();
onScroll();

})();
