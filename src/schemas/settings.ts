/** Site-wide settings — one JSON file each in src/content/settings/ (CMS → Ustawienia). */
import { z } from 'astro/zod';
import { link, prefooter } from './common';

/** settings/global.json — company details, SEO defaults, rating fallback */
export const company = z.object({
  companyName: z.string(),
  legalName: z.string().optional(),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  hours: z.string().optional(),
  nip: z.string().optional(),
  /** schema.org format for search engines, e.g. "Mo-Sa 09:00-18:00" */
  openingHours: z.string().optional(),
  geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
  socials: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
        icon: z.enum(['instagram', 'facebook', 'youtube', 'map']).optional(),
      }),
    )
    .default([]),
  seo: z.object({
    /** used for generated titles (realizations, catalog designs, 404): "%s" = the entry name */
    titleTemplate: z.string().default('%s | BUDUJE GRUPA'),
    /** share image when a page has no photo of its own; also the company image for Google */
    image: z.string(),
    /** Google Search Console → HTML tag → the `content` value */
    googleVerification: z.string().optional(),
  }),
  /** Google rating shown when the Places API key is missing (README → Google rating) */
  rating: z
    .object({
      score: z.number(),
      count: z.number(),
      url: z.string().optional(),
    })
    .optional(),
});

const prefooterItem = z.object({ title: z.string(), text: z.string().optional(), button: link.optional() });

/** settings/layout.json — menu, call-to-action button, band above the footer */
export const layout = z.object({
  nav: z.array(link.extend({ header: z.boolean().default(true) })).default([]),
  /** "Bezpłatna wycena": header, mobile menu and footer */
  cta: link,
  prefooter: z.object({
    quote: prefooterItem,
    visit: prefooterItem,
    custom: prefooterItem,
  }),
});

/** settings/templates.json — texts on the generated pages (/realizacje/…, /katalog/…) */
export const templates = z.object({
  project: z.object({
    prefooter: prefooter.default('visit'),
    askTitle: z.string(),
    askText: z.string().optional(),
    askButton: z.string(),
  }),
  catalog: z.object({
    prefooter: prefooter.default('custom'),
    eyebrow: z.string().default('Projekt domu'),
    askTitle: z.string(),
    askText: z.string().optional(),
    askButton: z.string(),
    standards: z.array(z.string()).default([]),
    modificationsTitle: z.string().default('Co możemy zmienić'),
    /** shown when a design has no list of its own */
    modifications: z.array(z.string()).default([]),
  }),
});
