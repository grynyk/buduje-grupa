import { gsap } from 'gsap';

/**
 * Pill filters for any `[data-filter-root]`:
 * buttons `[data-filter="key"]` ("*" = all), items `[data-item][data-tags="a|b"]`.
 */
export function initFilter() {
  document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach((root) => {
    if (root.dataset.bound) return;
    root.dataset.bound = 'true';

    const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-item]')];
    const count = root.querySelector<HTMLElement>('[data-filter-count]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    buttons.forEach((btn) =>
      btn.addEventListener('click', () => {
        const key = btn.dataset.filter!;
        buttons.forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });

        const show = items.filter((el) => key === '*' || (el.dataset.tags ?? '').split('|').includes(key));
        const apply = () => items.forEach((el) => (el.hidden = !show.includes(el)));
        if (count) count.textContent = `Wyświetlono: ${show.length}`;

        if (reduced) return apply();
        gsap.to(items, {
          autoAlpha: 0,
          y: 16,
          duration: 0.25,
          ease: 'power2.in',
          overwrite: true,
          onComplete: () => {
            apply();
            gsap.fromTo(show, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 });
          },
        });
      }),
    );
  });
}
