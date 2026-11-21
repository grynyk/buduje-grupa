/**
 * Site navigation. `footerOnly` pages are linked from the footer but not from the header menu.
 * Order = order in the footer.
 */
export const NAV = [
  { label: 'O nas', href: '/o-nas' },
  { label: 'Oferta', href: '/oferta' },
  { label: 'Realizacje', href: '/realizacje' },
  { label: 'Katalog', href: '/katalog' },
  { label: 'Technologia', href: '/technologia', footerOnly: true },
  { label: 'Proces budowy', href: '/proces-budowy' },
  { label: 'Poradnik inwestora', href: '/poradnik-inwestora' },
  { label: 'Gwarancja', href: '/gwarancja', footerOnly: true },
  { label: 'Finansowanie', href: '/finansowanie', footerOnly: true },
  { label: 'Kontakt', href: '/kontakt' },
] as const;

/** Header (desktop + mobile menu). */
export const MAIN_NAV = NAV.filter((item) => !('footerOnly' in item && item.footerOnly));

/** True when `href` is the current page or one of its children (e.g. /realizacje/dom-pod-lasem). */
export const isCurrent = (pathname: string, href: string) => {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === href || path.startsWith(`${href}/`);
};
