import { getCollection, getEntry } from 'astro:content';

export async function getSettings() {
  const entry = await getEntry('settings', 'global');
  if (!entry) throw new Error('Missing src/content/settings/global.json');
  return entry.data;
}

export async function getHome() {
  const entry = await getEntry('home', 'home');
  if (!entry) throw new Error('Missing src/content/pages/home.json');
  return entry.data;
}

export async function getProjects() {
  const items = await getCollection('projects');
  return items.sort((a, b) => a.data.order - b.data.order || (b.data.year ?? 0) - (a.data.year ?? 0));
}

export async function getCatalog() {
  const items = await getCollection('catalog');
  return items.sort((a, b) => a.data.order - b.data.order || a.data.area - b.data.area);
}

export async function getSitePages() {
  return getCollection('site');
}

/** "+48 600 100 200" -> "tel:+48600100200" */
export const telHref = (phone = '') => `tel:${phone.replace(/[^\d+]/g, '')}`;

type Social = { label: string; url: string; icon?: 'instagram' | 'facebook' | 'youtube' | 'map' };

const isMapUrl = (url: string) => /google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(url);

/** Icon for a social link: explicit `icon` field, else guessed from label/URL. */
export function socialIcon(s: Social): NonNullable<Social['icon']> {
  if (s.icon) return s.icon;
  const key = `${s.label} ${s.url}`.toLowerCase();
  if (isMapUrl(s.url) || /mapa|map\b/.test(key)) return 'map';
  if (key.includes('youtu')) return 'youtube';
  if (key.includes('face')) return 'facebook';
  return 'instagram';
}

/** Google Maps link from the socials list (used to link the office address). */
export const mapUrl = (socials: Social[]) => socials.find((s) => socialIcon(s) === 'map' && s.url !== '#')?.url;

/** Zero-padded index: 1 -> "01" */
export const pad = (n: number) => String(n).padStart(2, '0');

export type Settings = Awaited<ReturnType<typeof getSettings>>;
export type Home = Awaited<ReturnType<typeof getHome>>;
