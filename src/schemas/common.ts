/**
 * Building blocks shared by every content schema.
 * Mirror: the `&link_fields`, `&seo_fields`, `&theme` … anchors in public/admin/config.yml.
 */
import { z } from 'astro/zod';

export const link = z.object({ label: z.string(), href: z.string() });

/** Background of a section — maps to the .theme-* classes in global.scss. */
export const theme = z.enum(['light', 'paper', 'sage', 'dark']);

/** Beige band above the footer: which preset (texts in Ustawienia → Menu i stopka). */
export const PREFOOTER_VARIANTS = ['quote', 'visit', 'custom', 'none'] as const;
export const prefooter = z.enum(PREFOOTER_VARIANTS);
export type PrefooterVariant = z.infer<typeof prefooter>;

/** Per-page search-engine data. */
export const seo = z.object({
  title: z.string(),
  description: z.string().optional(),
  /** share image (Facebook, LinkedIn…); empty = the page's main photo or the site default */
  image: z.string().optional(),
  /** hide from Google and the sitemap */
  noindex: z.boolean().default(false),
});
export type Seo = z.infer<typeof seo>;

/** Same as `seo`, but every field optional — for entries whose title is generated (projects, catalog). */
export const seoOverride = seo.partial().optional();

/** Title + optional text, the most common list item. */
export const titled = z.object({ title: z.string(), text: z.string().optional() });
