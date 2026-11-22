/**
 * Content collections. Schemas live in src/schemas/ and mirror the CMS in public/admin/config.yml —
 * when you add a field on one side, add it on the other (`yarn check:cms` compares them).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { blocks } from '@/schemas/blocks';
import { prefooter, seo, seoOverride } from '@/schemas/common';
import { company, layout, templates } from '@/schemas/settings';

const settingsFile = (name: string) => glob({ pattern: `${name}.json`, base: './src/content/settings' });

/**
 * Every page of the site, id = file name: o-nas.json → /o-nas.
 * fixed-pages/ holds index.json (→ /) and 404.json — the CMS lists them separately so they can't be deleted.
 */
const pages = defineCollection({
  loader: glob({
    pattern: ['pages/*.json', 'fixed-pages/*.json'],
    base: './src/content',
    generateId: ({ entry }) => entry.replace(/^.*\//, '').replace(/\.json$/, ''),
  }),
  schema: z.object({
    seo,
    prefooter: prefooter.default('quote'),
    blocks: z.array(blocks).default([]),
  }),
});

/** Realizations (case studies) → /realizacje/<file name> */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    location: z.string().optional(),
    year: z.number().optional(),
    area: z.string().optional(),
    duration: z.string().optional(),
    scope: z.string().optional(),
    excerpt: z.string().optional(),
    cover: z.string(),
    gallery: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    seo: seoOverride,
  }),
});

/** Ready-made house designs → /katalog/<file name> */
const catalog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/catalog' }),
  schema: z.object({
    title: z.string(),
    area: z.number(), // m²
    rooms: z.string(),
    feature: z.string().optional(),
    floors: z.enum(['parterowy', 'z poddaszem']),
    image: z.string(),
    excerpt: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    /** floor plans (rzuty) — shown uncropped on white */
    plans: z.array(z.object({ image: z.string(), label: z.string().optional() })).default([]),
    /** what can be adapted; empty → the default list from Ustawienia → Strony szczegółów */
    modifications: z.array(z.string()).default([]),
    order: z.number().default(99),
    seo: seoOverride,
  }),
});

export const collections = {
  pages,
  projects,
  catalog,
  settings: defineCollection({ loader: settingsFile('global'), schema: company }),
  layout: defineCollection({ loader: settingsFile('layout'), schema: layout }),
  templates: defineCollection({ loader: settingsFile('templates'), schema: templates }),
};
