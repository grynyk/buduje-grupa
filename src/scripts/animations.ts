import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

declare global {
  interface Window {
    __animFailsafe?: number;
  }
}

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const EASE = 'expo.out';

/* -------------------------------------------------------------------------- */
/*  Hero intro                                                                 */
/* -------------------------------------------------------------------------- */
function hero() {
  const root = document.querySelector<HTMLElement>('[data-hero]');
  if (!root) return;

  const media = root.querySelector('[data-hero-media]');
  const tl = gsap.timeline({ defaults: { ease: EASE } });

  if (media) {
    tl.fromTo(media, { scale: 1.18, clipPath: 'inset(8% 8% 8% 8%)' }, { scale: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8 }, 0);
  }
  const lines = $$('[data-hero-line]', root);
  const fades = $$('[data-hero-fade]', root);
  const badges = $$('[data-hero-badge]', root);
  if (lines.length) tl.fromTo(lines, { yPercent: 110, opacity: 1 }, { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.25);
  if (fades.length) tl.fromTo(fades, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.75);
  if (badges.length) tl.fromTo(badges, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.95);

  // Subtle scroll-out: full-bleed image drifts (not side images)
  if (media && !media.matches('figure')) {
    gsap.to(media, {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/* -------------------------------------------------------------------------- */
/*  Generic scroll reveals                                                     */
/* -------------------------------------------------------------------------- */
function reveals() {
  $$('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
  });

  $$('[data-reveal-stagger]').forEach((group) => {
    gsap.fromTo(
      group.children,
      { autoAlpha: 0, y: 32 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      },
    );
  });

  // Images that unmask from the bottom
  $$('[data-clip-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    );
  });
}

/* -------------------------------------------------------------------------- */
/*  Split headings (line-by-line mask reveal)                                  */
/* -------------------------------------------------------------------------- */
function splitHeadings() {
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true, // re-splits on resize / font load
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.2,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  Parallax images  (data-parallax="-10" → yPercent range)                    */
/* -------------------------------------------------------------------------- */
function parallax() {
  $$('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax || '10');
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });

  $$('[data-rotate]').forEach((el) => {
    gsap.to(el.querySelector('svg'), {
      rotate: 360,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  Number counters                                                            */
/* -------------------------------------------------------------------------- */
function counters() {
  $$('[data-counter]').forEach((el) => {
    const target = parseFloat(el.dataset.counter || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const fmt = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const state = { v: 0 };
    el.textContent = fmt.format(0);
    gsap.to(state, {
      v: target,
      duration: 2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = fmt.format(decimals ? state.v : Math.round(state.v))),
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  Marquee — infinite loop that speeds up / reverses with scroll velocity     */
/* -------------------------------------------------------------------------- */
function marquee() {
  $$('[data-marquee]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-marquee-track]');
    if (!track) return;

    const loop = gsap.to(track, { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
    let direction = 1;

    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate(self) {
        const v = self.getVelocity();
        if (self.direction !== direction) {
          direction = self.direction;
        }
        const boost = gsap.utils.clamp(1, 5, Math.abs(v) / 300);
        gsap.to(loop, { timeScale: direction * boost, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.2, ease: 'power2.out' });
      },
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  Process — progress rail + active step                                      */
/* -------------------------------------------------------------------------- */
function processTimeline() {
  const root = document.querySelector<HTMLElement>('[data-process]');
  if (!root) return;
  const line = root.querySelector('[data-process-line]');
  const steps = $$('[data-step]', root);

  if (line) {
    gsap.to(line, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: root.querySelector('.process__steps'),
        start: 'top 65%',
        end: 'bottom 65%',
        scrub: true,
      },
    });
  }

  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 65%',
      onEnter: () => step.classList.add('is-active'),
      onLeaveBack: () => step.classList.remove('is-active'),
    });
    gsap.from(step.querySelector('.step__body'), {
      autoAlpha: 0,
      x: 40,
      duration: 1,
      ease: EASE,
      scrollTrigger: { trigger: step, start: 'top 85%', once: true },
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  Footer wordmark — brand logo rises out of its mask as footer enters        */
/* -------------------------------------------------------------------------- */
function footerWordmark() {
  const el = document.querySelector<HTMLElement>('[data-footer-wordmark]');
  const svg = el?.querySelector('svg');
  if (!el || !svg) return;
  gsap.from(svg, {
    yPercent: 105,
    duration: 1.4,
    ease: EASE,
    scrollTrigger: { trigger: el, start: 'top 95%', once: true },
  });
}

/* -------------------------------------------------------------------------- */
/*  Page blocks: steps, payment schedule, wall layers                          */
/* -------------------------------------------------------------------------- */
function pageBlocks() {
  // Steps: items appear and connectors draw one after another
  $$('[data-steps]').forEach((list) => {
    const items = $$('[data-step-item]', list);
    const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 80%', once: true } });
    items.forEach((item, i) => {
      tl.fromTo(item, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE }, i * 0.12);
      const line = item.querySelector('.steps__line');
      if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, i * 0.12 + 0.2);
    });
  });

  // Process timeline: index rail fills as you scroll through the step panels
  $$('[data-timeline]').forEach((root) => {
    const bar = root.querySelector('[data-timeline-progress]');
    const steps = root.querySelector('.timeline__steps');
    if (!bar || !steps) return;
    gsap.to(bar, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: steps, start: 'top 35%', end: 'bottom 65%', scrub: true },
    });
    gsap.from($$('.tstep', root), {
      autoAlpha: 0,
      y: 32,
      duration: 0.9,
      ease: EASE,
      stagger: 0.1,
      scrollTrigger: { trigger: steps, start: 'top 85%', once: true },
    });
  });

  // Payment schedule: segments fill left → right
  $$('[data-schedule]').forEach((bar) => {
    gsap.fromTo(
      $$('.schedule__fill', bar),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.9, ease: 'power3.inOut', stagger: 0.15, scrollTrigger: { trigger: bar, start: 'top 85%', once: true } },
    );
  });

  // Wall cross-section: layers rise from the floor
  $$('[data-layers]').forEach((root) => {
    gsap.fromTo(
      $$('.layers__stripe', root),
      { scaleY: 0, transformOrigin: 'bottom' },
      { scaleY: 1, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: root, start: 'top 75%', once: true } },
    );
  });
}

/* -------------------------------------------------------------------------- */
/*  Entry point                                                                */
/* -------------------------------------------------------------------------- */
export function initAnimations() {
  clearTimeout(window.__animFailsafe);
  const html = document.documentElement;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || html.classList.contains('no-anim')) {
    html.classList.add('no-anim');
    return;
  }

  // Run after fonts are ready so SplitText measures the real lines.
  const start = () => {
    hero();
    splitHeadings();
    reveals();
    parallax();
    counters();
    marquee();
    processTimeline();
    pageBlocks();
    footerWordmark();
    ScrollTrigger.refresh();
    scrollToHash();
  };

  // Pin spacers change the page height after load, so a deep link like /#kontakt
  // must be re-applied once ScrollTrigger has laid everything out.
  const scrollToHash = () => {
    if (!location.hash) return;
    let target: Element | null = null;
    try {
      target = document.querySelector(decodeURIComponent(location.hash));
    } catch {
      return;
    }
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  };

  if (document.fonts?.status === 'loaded') start();
  else document.fonts.ready.then(start);

  // Images loading late change layout → recalc trigger positions.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
