/** Small formatting helpers (Polish locale). */

/** Zero-padded index: 1 → "01" */
export const pad = (n: number) => String(n).padStart(2, '0');

/** 5 → "5,0" (decimals = 1), 1234 → "1 234" */
export const formatNumber = (value: number, decimals = 0) =>
  new Intl.NumberFormat('pl-PL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

/**
 * Polish plural form: plural(n, ['zdjęcie', 'zdjęcia', 'zdjęć'])
 * 1 → one · 2–4, 22–24 … → few · otherwise (incl. 12–14) → many
 */
export function plural(n: number, [one, few, many]: [string, string, string]) {
  if (n === 1) return one;
  const tens = n % 100;
  return [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(tens) ? few : many;
}

/** "+48 600 100 200" → "tel:+48600100200" */
export const telHref = (phone = '') => `tel:${phone.replace(/[^\d+]/g, '')}`;

export const isExternal = (url: string) => /^https?:\/\//.test(url);

/**
 * Clean URL path: "/kontakt/" → "/kontakt", "/o-nas.html" → "/o-nas", "/index.html" → "/".
 * (Static builds use file output — see astro.config.mjs — so Astro.url.pathname may end in ".html".)
 */
export const normalizePath = (path: string) => path.replace(/(\/index)?\.html$/, '').replace(/\/+$/, '') || '/';

/** True when `href` is the current page or one of its children (e.g. /realizacje/dom-pod-lasem). */
export function isCurrent(pathname: string, href: string) {
  const path = normalizePath(pathname);
  return path === href || path.startsWith(`${href}/`);
}
