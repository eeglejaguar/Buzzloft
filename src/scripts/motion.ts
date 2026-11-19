/**
 * Buzz Loft motion system
 * - Lenis smooth scroll driving GSAP ScrollTrigger
 * - Declarative data-attributes in markup, wired up here:
 *   data-split-lines  headline lines rise out of a mask
 *   data-reveal       "up" | "fade" on enter
 *   data-stagger      children cascade in
 *   data-slide        "left" | "right" scrubbed horizontal drift
 *   data-spin         icons rotate with scroll
 *   data-pop          inline media pops in
 *   data-parallax-*   scrubbed parallax layers
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

export function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    document.documentElement.classList.remove('js');
    initNav(null);
    return;
  }

  /* ---------- Smooth scroll ---------- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  $<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const target = id === '#top' ? 0 : document.querySelector<HTMLElement>(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement | number, { duration: 1.4 });
    });
  });

  initNav(lenis);
  initHero();
  initReveals();
  initStatement();
  initWork();
  initPov();
  initProcess();
  initCta();
  initFooter();

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1101px)', () => {
    initServicesPin();
    initQuotesScrub();
    initSlides();
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------- Nav: hide on scroll down, theme per section ---------- */
function initNav(lenis: Lenis | null) {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  const sections = $('[data-nav-theme]');
  const probe = () => nav.offsetHeight / 2;
  let last = 0;

  const onScroll = (y: number) => {
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > last && y > 400);
    last = y;
    // Pick the section currently under the nav's vertical centre
    const py = probe();
    const current = sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= py && r.bottom > py;
    });
    if (current) nav.classList.toggle('is-dark', current.dataset.navTheme === 'dark-text');
  };

  if (lenis) lenis.on('scroll', ({ scroll }: { scroll: number }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  ScrollTrigger.addEventListener('refresh', () => onScroll(window.scrollY));
  onScroll(window.scrollY);
}

/* ---------- Hero (on load) ---------- */
function initHero() {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) return;
  const lines = $('.line-mask > span', hero);
  const bg = hero.querySelector('[data-hero-bg]');
  const fades = $('[data-hero-fade]', hero);
  const nav = document.querySelector('[data-nav]');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(bg, { scale: 1.25, duration: 2.2 }, 0)
    .from(lines, { yPercent: 110, rotate: 3, duration: 1.4, stagger: 0.12 }, 0.15)
    .from(nav, { yPercent: -100, opacity: 0, duration: 1.2 }, 0.4)
    .from(fades, { y: 30, opacity: 0, duration: 1.2, stagger: 0.12 }, 0.7);

  gsap.to(bg, {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to($('.hero__title', hero), {
    yPercent: -30,
    opacity: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* ---------- Generic reveals ---------- */
function initReveals() {
  $('[data-split-lines]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.from($('.line-mask > span', el), {
      yPercent: 110,
      rotate: 2,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  $('[data-reveal]').forEach((el) => {
    const up = el.dataset.reveal === 'up';
    gsap.fromTo(
      el,
      { opacity: 0, y: up ? 40 : 0 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      },
    );
  });

  $('[data-stagger]').forEach((el) => {
    gsap.from(el.children, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  $('[data-spin]').forEach((el) => {
    gsap.fromTo(
      el,
      { rotate: -90 },
      {
        rotate: 90,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      },
    );
  });

  $('[data-spin-in]').forEach((el) => {
    gsap.from(el, {
      scale: 0,
      rotate: -180,
      duration: 1.2,
      ease: 'back.out(1.8)',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
}

/* Scrubbed horizontal drift for big headline lines (desktop) */
function initSlides() {
  $('[data-slide]').forEach((el) => {
    const dir = el.dataset.slide === 'left' ? -1 : 1;
    gsap.fromTo(
      el,
      { xPercent: 14 * -dir },
      {
        xPercent: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: 0.8 },
      },
    );
  });
}

/* ---------- Statement ---------- */
function initStatement() {
  $('[data-statement-row]').forEach((row, i) => {
    const words = $(':scope > span:not(.media)', row);
    const media = row.querySelector('[data-pop]');
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
    tl.from(words, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, i * 0.04);
    if (media) tl.from(media, { scale: 0, rotate: -25, duration: 1, ease: 'back.out(2)' }, 0.25);
  });

  const hourglass = document.querySelector('.media--hourglass img');
  if (hourglass) gsap.to(hourglass, { rotate: 180, duration: 1, ease: 'expo.inOut', repeat: -1, repeatDelay: 1.6 });
  const plane = document.querySelector('.media--leave');
  if (plane) gsap.to(plane, { x: 8, y: -6, rotate: -6, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

/* ---------- Work / case studies ---------- */
function initWork() {
  $('[data-case]').forEach((c) => {
    const clip = c.querySelector('[data-case-clip]');
    const inner = c.querySelector('[data-parallax-inner]');
    gsap.fromTo(
      clip,
      { clipPath: 'inset(18% 12% 18% 0% round 16px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 16px)',
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: c, start: 'top 80%' },
      },
    );
    gsap.fromTo(
      inner,
      { yPercent: -6 },
      { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

/* ---------- Point of view ---------- */
function initPov() {
  const pov = document.querySelector<HTMLElement>('.pov');
  const eye = pov?.querySelector<HTMLElement>('[data-eye]');
  if (!pov || !eye) return;

  gsap.from(eye, {
    scale: 0.6,
    opacity: 0,
    duration: 1.6,
    ease: 'expo.out',
    scrollTrigger: { trigger: eye, start: 'top 85%' },
  });

  if (window.matchMedia('(pointer: fine)').matches) {
    const xTo = gsap.quickTo(eye, 'x', { duration: 1.2, ease: 'power3' });
    const yTo = gsap.quickTo(eye, 'y', { duration: 1.2, ease: 'power3' });
    pov.addEventListener('pointermove', (e) => {
      const r = pov.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 80);
      yTo(((e.clientY - r.top) / r.height - 0.5) * 60);
    });
    pov.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  }
}

/* Services: pin the card while the cards scroll sideways through the blob */
function initServicesPin() {
  const services = document.querySelector<HTMLElement>('[data-services]');
  const blob = services?.querySelector<HTMLElement>('[data-services-blob]');
  const track = services?.querySelector<HTMLElement>('[data-services-track]');
  if (!services || !blob || !track) return;

  const distance = () => track.scrollWidth - blob.clientWidth + track.offsetLeft * 2;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: blob,
      start: 'center center',
      end: () => `+=${distance()}`,
      pin: services,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  tl.to(track, { x: () => -distance(), ease: 'none' });

  gsap.from(track.children, {
    y: 120,
    rotate: (i) => (i % 2 ? 4 : -4),
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.08,
    scrollTrigger: { trigger: blob, start: 'top 80%' },
  });
}

/* ---------- Process ---------- */
function initProcess() {
  const wave = document.querySelector('[data-wave]');
  const process = document.querySelector('[data-process]');
  if (wave && process) {
    gsap.fromTo(
      wave,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: wave, start: 'top 75%', end: 'bottom 75%', scrub: 0.6 },
      },
    );
  }
  $('[data-step]').forEach((step, i) => {
    gsap.from(step, {
      y: 100,
      x: i % 2 ? 60 : -60,
      rotate: i % 2 ? 3 : -3,
      opacity: 0,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: step, start: 'top 85%' },
    });
  });

  const bg = document.querySelector('[data-parallax-bg]');
  if (bg) {
    gsap.fromTo(
      bg,
      { yPercent: -8 },
      { yPercent: 8, ease: 'none', scrollTrigger: { trigger: bg.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  }
}

/* Testimonials drift sideways as you scroll (desktop) */
function initQuotesScrub() {
  const wrap = document.querySelector<HTMLElement>('[data-quotes]');
  const track = wrap?.querySelector<HTMLElement>('[data-quotes-track]');
  if (!wrap || !track) return;
  gsap.fromTo(
    track,
    { x: 0 },
    {
      x: () => -(track.scrollWidth - wrap.clientWidth + 48),
      ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top 85%', end: 'bottom 15%', scrub: 0.8, invalidateOnRefresh: true },
    },
  );
}

/* ---------- CTA ---------- */
function initCta() {
  $('[data-flower]').forEach((f, i) => {
    gsap.fromTo(
      f,
      { rotate: i ? 30 : -30 },
      {
        rotate: i ? -30 : 30,
        ease: 'none',
        scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      },
    );
  });

  const pill = document.querySelector<HTMLElement>('[data-magnetic]');
  if (!pill) return;
  gsap.from(pill, {
    scale: 0.7,
    opacity: 0,
    duration: 1.4,
    ease: 'elastic.out(1, 0.6)',
    scrollTrigger: { trigger: pill, start: 'top 85%' },
  });

  if (!window.matchMedia('(pointer: fine)').matches) return;
  const bg = pill.querySelector('[data-magnetic-bg]')!;
  const text = pill.querySelector('[data-magnetic-text]')!;
  const bx = gsap.quickTo(bg, 'x', { duration: 0.8, ease: 'power3' });
  const by = gsap.quickTo(bg, 'y', { duration: 0.8, ease: 'power3' });
  const tx = gsap.quickTo(text, 'x', { duration: 0.8, ease: 'power3' });
  const ty = gsap.quickTo(text, 'y', { duration: 0.8, ease: 'power3' });
  pill.addEventListener('pointermove', (e) => {
    const r = pill.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    bx(dx * 0.12); by(dy * 0.2);
    tx(dx * 0.22); ty(dy * 0.32);
  });
  pill.addEventListener('pointerleave', () => { bx(0); by(0); tx(0); ty(0); });
}

/* ---------- Footer ---------- */
function initFooter() {
  const card = document.querySelector<HTMLElement>('[data-footer-card]');
  if (card) {
    const parts = $('[data-wm-part]', card);
    const logo = card.querySelector('[data-wm-logo]');
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 55%' } });
    tl.from(parts, { yPercent: 100, duration: 1.4, ease: 'expo.out', stagger: 0.12 })
      .from(logo, { scale: 0, rotate: -180, duration: 1.3, ease: 'back.out(1.7)' }, 0.25);

    gsap.from(card, {
      scale: 0.94,
      borderRadius: '8rem',
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 30%', scrub: true },
    });
  }

  const shapesWrap = document.querySelector<HTMLElement>('[data-shapes]');
  const shapes = $('[data-shape]');
  if (!shapesWrap || !shapes.length) return;

  gsap.from(shapes, {
    yPercent: 160,
    rotate: (i) => (i % 2 ? 90 : -90),
    duration: 1.6,
    ease: 'bounce.out',
    stagger: { each: 0.1, from: 'random' },
    scrollTrigger: { trigger: shapesWrap, start: 'top 95%' },
    onComplete: () => {
      shapes.forEach((s, i) => {
        gsap.to(s, {
          y: -14 - (i % 3) * 6,
          rotate: i % 2 ? 6 : -6,
          duration: 2 + i * 0.3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      });
    },
  });

  shapes.forEach((s) => {
    s.addEventListener('pointerenter', () => {
      gsap.fromTo(s, { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
    });
  });
  shapesWrap.style.pointerEvents = 'auto';
}
