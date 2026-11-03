(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // Videos: solo cargan y corren cuando están a la vista
  const clips = [...document.querySelectorAll('video[data-src]')];
  const play = v => {
    if (!v.src) { v.src = v.dataset.src; v.load(); }
    if (!calm) v.play().catch(() => {});
  };
  const seen = new IntersectionObserver(items => {
    items.forEach(i => { i.isIntersecting ? play(i.target) : i.target.pause(); });
  }, { rootMargin: '120px' });
  clips.forEach(v => seen.observe(v));

  // Reparte las tarjetas del hero
  const hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));
    if (!calm && matchMedia('(pointer:fine)').matches) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3) * 2);
        hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3) * 2);
      });
    }
  }

  // La frase corre por la curva de la M: se mueve sola y con el scroll
  const path = document.querySelector('.wave textPath');
  const frame = document.querySelector('.reel-frame');
  let unit = 0, t = 0;
  const measure = () => { if (path) unit = path.parentNode.getComputedTextLength() / 6; };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure); else measure();
  const tick = () => {
    if (path && unit) {
      t += .55;
      path.setAttribute('startOffset', (-((t + scrollY * .6) % unit)).toFixed(1));
    }
    if (frame) {
      const r = frame.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / innerHeight));
      frame.style.setProperty('--s', (.84 + .16 * Math.min(1, p * 1.5)).toFixed(4));
    }
    requestAnimationFrame(tick);
  };
  if (!calm) tick();

  // El fondo toma el color de cada proyecto
  const tones = [...document.querySelectorAll('[data-bg]')];
  if (tones.length) {
    const base = getComputedStyle(document.body).backgroundColor;
    const toneObs = new IntersectionObserver(items => {
      items.forEach(i => {
        if (i.isIntersecting) {
          document.body.style.backgroundColor = i.target.dataset.bg;
          document.body.style.color = i.target.dataset.fg;
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    tones.forEach(s => toneObs.observe(s));
    window.__baseTone = base;
  }

  // Filtros del muro
  const chips = [...document.querySelectorAll('.chips button')];
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(o => o.setAttribute('aria-pressed', o === c));
    const f = c.dataset.f;
    document.querySelectorAll('.piece').forEach(p => {
      p.classList.toggle('off', f !== 'todo' && !p.dataset.k.split(' ').includes(f));
    });
  }));

  // Visor
  const lb = document.querySelector('dialog.lb');
  if (lb) {
    const box = lb.querySelector('.lb-media');
    const cap = lb.querySelector('.lb-cap');
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-full]');
      if (!b) return;
      e.preventDefault();
      const src = b.dataset.full, video = /\.mp4$/.test(src);
      box.innerHTML = '';
      const el = document.createElement(video ? 'video' : 'img');
      el.src = src;
      if (video) { el.controls = true; el.autoplay = true; el.muted = true; el.playsInline = true; el.loop = true; }
      else el.alt = b.dataset.t || '';
      box.append(el);
      cap.textContent = b.dataset.t || '';
      lb.showModal();
    });
    const shut = () => { box.innerHTML = ''; lb.close(); };
    lb.querySelector('.lb-x').addEventListener('click', shut);
    lb.addEventListener('click', e => { if (e.target === lb) shut(); });
    lb.addEventListener('close', () => { if (!lb.open) box.innerHTML = ''; });
  }
})();
