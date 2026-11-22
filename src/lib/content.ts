/** Typed access to the content collections (src/content/**, edited in the CMS). */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

async function single<C extends 'settings' | 'layout' | 'templates'>(collection: C, id: string, file: string) {
  const entry = await getEntry(collection, id);
  if (!entry) throw new Error(`Missing ${file}`);
  return entry.data as CollectionEntry<C>['data'];
}

export const getSettings = () => single('settings', 'global', 'src/content/settings/global.json');
export const getLayout = () => single('layout', 'layout', 'src/content/settings/layout.json');
export const getTemplates = () => single('templates', 'templates', 'src/content/settings/templates.json');

export type Settings = CollectionEntry<'settings'>['data'];
export type Page = CollectionEntry<'pages'>;
export type Project = CollectionEntry<'projects'>;
export type Design = CollectionEntry<'catalog'>;

/** Page entry id → URL path: "index" → "/", "o-nas" → "/o-nas". */
export const pagePath = (id: string) => (id === 'index' ? '/' : `/${id}`);
export const projectPath = (id: string) => `/realizacje/${id}`;
export const designPath = (id: string) => `/katalog/${id}`;

/** Pages that get their own URL (404 is rendered by src/pages/404.astro). */
export async function getPages() {
  return getCollection('pages', (p) => p.id !== '404');
}

export async function getPage(id: string) {
  const page = await getEntry('pages', id);
  if (!page) throw new Error(`Missing page "${id}" (src/content/pages or src/content/fixed-pages)`);
  return page;
}

export async function getProjects() {
  const items = await getCollection('projects');
  return items.sort((a, b) => a.data.order - b.data.order || (b.data.year ?? 0) - (a.data.year ?? 0));
}

export async function getCatalog() {
  const items = await getCollection('catalog');
  return items.sort((a, b) => a.data.order - b.data.order || a.data.area - b.data.area);
}
