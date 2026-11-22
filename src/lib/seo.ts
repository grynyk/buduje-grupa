/**
 * Search-engine helpers: page titles and schema.org structured data (JSON-LD).
 * Rendered in <head> by layouts/BaseLayout.astro.
 */
import type { Block } from '@/schemas/blocks';
import type { Seo } from '@/schemas/common';
import type { Settings } from './content';

export type JsonLd = Record<string, unknown>;
export interface Crumb {
  label: string;
  href?: string;
}

/** Generated title: titleTemplate "%s | BUDUJE GRUPA" + "Las 90 — Katalog" → "Las 90 — Katalog | BUDUJE GRUPA". */
export const templateTitle = (settings: Settings, name: string) => settings.seo.titleTemplate.replace('%s', name);

const abs = (path: string, site: URL) => new URL(path, site).toString();

/**
 * The company as a local business (matches the Google Maps listing).
 * `image`: absolute URL of the company photo, already run through the image pipeline by the layout.
 */
export function localBusiness(s: Settings, site: URL, image: URL): JsonLd {
  const [postalCode, ...locality] = (s.city ?? '').split(' ');
  const sameAs = s.socials.map((x) => x.url).filter((u) => /^https?:\/\//.test(u));
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': abs('/#company', site),
    name: s.legalName ?? s.companyName,
    description: s.tagline,
    url: site.toString(),
    image: image.toString(),
    telephone: s.phone?.replace(/\s+/g, ''),
    email: s.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address,
      postalCode,
      addressLocality: locality.join(' '),
      addressCountry: 'PL',
    },
    ...(s.geo && { geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng } }),
    ...(s.openingHours && { openingHours: s.openingHours }),
    ...(sameAs.length && { sameAs }),
  };
}

/** Site name for Google's results (home page only). */
export const website = (s: Settings, site: URL): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: s.companyName,
  url: site.toString(),
  inLanguage: 'pl-PL',
  publisher: { '@id': abs('/#company', site) },
});

/** Breadcrumb trail; the last crumb (current page) may have no href. */
export function breadcrumbs(crumbs: Crumb[], current: URL, site: URL): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ label: 'Strona główna', href: '/' }, ...crumbs].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.href ? abs(c.href, site) : current.toString(),
    })),
  };
}

/** FAQ rich results from every FAQ section on the page. */
export function faqPage(blocks: Block[]): JsonLd | undefined {
  const items = blocks.flatMap((b) => (b._template === 'faq' ? b.items : []));
  if (!items.length) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

/** First photo of a page — used as its share image when SEO → image is empty. */
export function firstImage(blocks: Block[]): string | undefined {
  for (const b of blocks) {
    if ('image' in b && b.image) return b.image;
  }
  return undefined;
}

/** SEO props a layout takes: a final title plus optional description, image, noindex. */
export type PageSeo = Partial<Seo> & { title: string };

/** Generated SEO values, overridden by whatever the editor filled in (empty fields are ignored). */
export function withOverrides(generated: PageSeo, override: Partial<Seo> = {}): PageSeo {
  const filled = Object.entries(override).filter(([, v]) => v !== undefined && v !== '');
  return { ...generated, ...Object.fromEntries(filled) };
}
