const $ = id => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Binary rain background */
(() => {
  const cv = $('bin'), ctx = cv.getContext('2d'), size = 18;
  let drops = [];
  function resize() {
    cv.width = innerWidth; cv.height = innerHeight;
    drops = Array.from({ length: Math.ceil(cv.width / size) }, () => Math.random() * -50);
    ctx.fillStyle = '#071B2B'; ctx.fillRect(0, 0, cv.width, cv.height);
  }
  function draw() {
    ctx.fillStyle = 'rgba(7, 27, 43, 0.13)';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.font = size + 'px "Fira Code", monospace';
    drops.forEach((y, i) => {
      ctx.fillStyle = Math.random() < .08 ? '#B9E4E8' : '#167D8D';
      ctx.fillText(Math.random() < .5 ? '0' : '1', i * size, y * size);
      if (y * size > cv.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    });
  }
  addEventListener('resize', resize);
  resize();
  if (reduce) { for (let i = 0; i < 40; i++) draw(); } else setInterval(draw, 60);
})();

/* 2. "Decode" effect: random 0/1 resolve into the real text */
function decode(el, final, ms = 900) {
  if (reduce) { el.textContent = final; return; }
  const t0 = performance.now();
  (function frame(t) {
    const p = Math.min((t - t0) / ms, 1), n = Math.floor(p * final.length);
    el.textContent = final.slice(0, n) + [...final.slice(n)].map(c => c === ' ' ? ' ' : (Math.random() < .5 ? '0' : '1')).join('');
    if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
  })(t0);
}
decode($('name'), $('name').dataset.text, 1200);

/* 3. Typewriter roles (edit the list) */
(() => {
  const roles = ['Full-Stack Developer', 'Problem Solver', 'Open-Source Contributor', 'Clean Code Fan'];
  const el = $('role');
  if (reduce) { el.textContent = roles[0]; return; }
  let r = 0, c = 0, del = false;
  (function tick() {
    const w = roles[r];
    el.textContent = w.slice(0, c);
    if (!del && c === w.length) { del = true; return setTimeout(tick, 1600); }
    if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 75);
  })();
})();

/* 4. Skills as binary meters: level 80 = 8 ones and 2 zeros */
document.querySelectorAll('.skill').forEach(s => {
  const ones = Math.round(+s.dataset.level / 10);
  const bits = document.createElement('span');
  bits.className = 'bits';
  bits.setAttribute('aria-label', s.dataset.level + ' percent');
  bits.innerHTML = Array.from({ length: 10 }, (_, i) => i < ones ? '<i class="on">1</i>' : '<i class="off">0</i>').join('');
  bits.querySelectorAll('i').forEach(i => i.style.fontStyle = 'normal');
  s.appendChild(bits);
});

/* 5. Reveal on scroll + decode section titles */
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  if (en.target.hasAttribute('data-decode')) decode(en.target, en.target.textContent);
  io.unobserve(en.target);
}), { threshold: .25 });
document.querySelectorAll('.reveal, [data-decode]').forEach(el => io.observe(el));

/* 6. Navbar: mobile menu + active section */
const menu = $('menu');
$('burger').onclick = () => menu.classList.toggle('open');
menu.onclick = e => { if (e.target.tagName === 'A') menu.classList.remove('open'); };
const links = [...menu.querySelectorAll('a')];
const nio = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id], footer[id]').forEach(s => nio.observe(s));

/* 7. Showcase gallery: thumbnails, filters, lightbox */
const shots = [...document.querySelectorAll('.shot')];
shots.forEach(s => {
  const thumbSrc = s.dataset.type === 'image' ? s.dataset.src : s.dataset.poster;
  if (!thumbSrc) return;
  const img = new Image();
  img.alt = s.dataset.title; img.loading = 'lazy';
  img.onload = () => s.querySelector('.thumb').prepend(img); // only shown if the file exists
  img.src = thumbSrc;
});
$('filters').onclick = e => {
  const f = e.target.dataset.f;
  if (!f) return;
  document.querySelectorAll('#filters button').forEach(b => b.classList.toggle('on', b === e.target));
  shots.forEach(s => s.hidden = f !== 'all' && s.dataset.type !== f);
};
const lb = $('lb'), body = $('lbBody');
shots.forEach(s => s.onclick = () => {
  const isVideo = s.dataset.type === 'video';
  const m = document.createElement(isVideo ? 'video' : 'img');
  m.src = s.dataset.src;
  if (isVideo) { m.controls = true; m.autoplay = true; } else m.alt = s.dataset.title;
  m.onerror = () => { body.innerHTML = `<p class="missing">File not found: ${s.dataset.src}<br>Add your ${s.dataset.type} to that path.</p>`; };
  body.replaceChildren(m);
  $('lbCap').textContent = s.dataset.title;
  lb.showModal();
});
const closeLb = () => lb.close();
$('lbClose').onclick = closeLb;
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
lb.addEventListener('close', () => body.replaceChildren()); // also stops any playing video

$('year').textContent = new Date().getFullYear();
