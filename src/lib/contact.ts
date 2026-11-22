/** Company contact details and social links, derived from Ustawienia firmy. */
import type { IconName } from './icons';
import type { Settings } from './content';
import { isExternal, telHref } from './format';

type Social = Settings['socials'][number];
export type SocialIcon = NonNullable<Social['icon']>;

const isMapUrl = (url: string) => /google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(url);

/** Icon for a social link: explicit `icon` field, else guessed from label/URL. */
export function socialIcon(s: Social): SocialIcon {
  if (s.icon) return s.icon;
  const key = `${s.label} ${s.url}`.toLowerCase();
  if (isMapUrl(s.url) || /mapa|map\b/.test(key)) return 'map';
  if (key.includes('youtu')) return 'youtube';
  if (key.includes('face')) return 'facebook';
  return 'instagram';
}

/** Google Maps link from the socials list (used to link the office address). */
export const mapUrl = (socials: Social[]) => socials.find((s) => socialIcon(s) === 'map' && s.url !== '#')?.url;

/** Instagram profile URL, if one is set. */
export const instagramUrl = (socials: Social[]) =>
  socials.find((s) => socialIcon(s) === 'instagram' && isExternal(s.url))?.url;

export const fullAddress = (s: Settings) => [s.address, s.city].filter(Boolean).join(', ');

export interface ContactRow {
  icon: IconName;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

/** Phone, e-mail, office address and hours — the rows of every contact list on the site. */
export function contactRows(s: Settings): ContactRow[] {
  const rows: (ContactRow | '' | undefined)[] = [
    s.phone && { icon: 'phone', label: 'Telefon', value: s.phone, href: telHref(s.phone) },
    s.email && { icon: 'mail', label: 'E-mail', value: s.email, href: `mailto:${s.email}` },
    s.address && { icon: 'pin', label: 'Biuro', value: fullAddress(s), href: mapUrl(s.socials), external: true },
    s.hours && { icon: 'clock', label: 'Godziny', value: s.hours },
  ];
  return rows.filter((r): r is ContactRow => !!r);
}
