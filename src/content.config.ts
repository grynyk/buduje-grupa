import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Schemas mirror the CMS config in public/admin/config.yml — keep both in sync when adding fields. */

const link = z.object({ label: z.string(), href: z.string() });
const intro = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
});

const prefooterItem = z.object({ title: z.string(), text: z.string().optional(), button: link.optional() });
export const PREFOOTER_VARIANTS = ['quote', 'visit', 'custom', 'none'] as const;
export type PrefooterVariant = (typeof PREFOOTER_VARIANTS)[number];

const settings = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/settings' }),
  schema: z.object({
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
    /** Beige band above the footer on every page except home (variant chosen per page). */
    prefooter: z.object({
      quote: prefooterItem,
      visit: prefooterItem,
      custom: prefooterItem,
    }),
  }),
});

const home = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string() }),
    hero: z.object({
      eyebrow: z.string().optional(),
      titleLines: z.array(z.string()),
      subtitle: z.string().optional(),
      image: z.string(),
      primaryCta: link,
      secondaryCta: link.optional(),
      badges: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    }),
    marquee: z.array(z.string()).default([]),
    about: z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      text: z.string().optional(),
      image: z.string(),
      imageSecondary: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      cta: link.optional(),
    }),
    stats: z
      .array(
        z.object({
          value: z.number(),
          decimals: z.number().default(0), // e.g. 1 → "5,0"
          suffix: z.string().optional(),
          label: z.string(),
        }),
      )
      .default([]),
    projects: intro,
    process: intro.extend({
      steps: z.array(z.object({ title: z.string(), text: z.string(), meta: z.string().optional() })),
    }),
    testimonials: z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      /** Public rating (e.g. Google). Shown above the quotes, or on its own when there are no quotes. */
      rating: z
        .object({
          score: z.string(), // "5,0"
          count: z.number(),
          source: z.string().default('Google'),
          url: z.string().optional(),
        })
        .optional(),
      /** Real client quotes only (copy them from the Google reviews). */
      items: z.array(z.object({ quote: z.string(), author: z.string(), role: z.string().optional() })).default([]),
    }),
    cta: z.object({
      title: z.string(),
      text: z.string().optional(),
      image: z.string(),
      button: link,
    }),
    contact: intro.optional(),
    /** Embedded Instagram posts (home page). */
    instagram: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        text: z.string().optional(),
        posts: z.array(z.string()).default([]),
      })
      .optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(99),
    icon: z.string().default('house'),
    excerpt: z.string(),
    image: z.string(),
    points: z.array(z.string()).default([]),
  }),
});

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
  }),
});

/* ---------------- Catalog (ready-made house designs) ---------------- */
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
    /** what can be adapted; empty → the default list from the brand mockup */
    modifications: z.array(z.string()).default([]),
    order: z.number().default(99),
  }),
});

/* ---------------- Site pages built from blocks ---------------- */
const theme = z.enum(['light', 'paper', 'sage', 'dark']);
const titled = { title: z.string(), text: z.string().optional() };

const blocks = z.discriminatedUnion('_template', [
  z.object({
    _template: z.literal('features'),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    text: z.string().optional(),
    numbered: z.boolean().default(false),
    columns: z.number().default(3),
    theme: theme.default('light'),
    /** grid: columns under the heading · split: heading left (sticky), 2×2 benefits right */
    layout: z.enum(['grid', 'split']).default('grid'),
    link: link.optional(),
    items: z.array(z.object({ ...titled, icon: z.string().optional() })).default([]),
  }),
  z.object({
    _template: z.literal('people'),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    text: z.string().optional(),
    /** team statement, shown as a signed quote under the cards */
    quote: z.string().optional(),
    /** quote signature; empty = the people's names */
    signature: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string().optional(),
          initials: z.string().optional(),
          photo: z.string().optional(),
          bio: z.string().optional(),
        }),
      )
      .default([]),
  }),
  z.object({
    _template: z.literal('quote'),
    text: z.string(),
    button: link.optional(),
  }),
  z.object({
    _template: z.literal('mediaText'),
    image: z.string(),
    imageAlt: z.string().optional(),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    text: z.string().optional(),
    items: z.array(z.object(titled)).default([]),
    note: z.string().optional(),
    button: link.optional(),
    reverse: z.boolean().default(false),
    theme: theme.default('light'),
  }),
  z.object({
    _template: z.literal('packages'),
    items: z
      .array(
        z.object({
          name: z.string(),
          lead: z.string().optional(),
          price: z.string().optional(),
          features: z.array(z.string()).default([]),
          highlighted: z.boolean().default(false),
          badge: z.string().optional(),
        }),
      )
      .default([]),
    button: link.optional(),
    includedTitle: z.string().optional(),
    included: z.array(z.string()).default([]),
  }),
  z.object({
    _template: z.literal('steps'),
    eyebrow: z.string().optional(),
    items: z.array(z.object(titled)).default([]),
  }),
  z.object({
    _template: z.literal('commitment'),
    image: z.string(),
    imageAlt: z.string().optional(),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    items: z.array(z.object(titled)).default([]),
    quote: z.string().optional(),
    button: link.optional(),
    theme: theme.default('light'),
  }),
  z.object({
    _template: z.literal('timeline'),
    eyebrow: z.string().optional(),
    weLabel: z.string().default('Po naszej stronie'),
    youLabel: z.string().default('Po Twojej stronie'),
    resultLabel: z.string().default('Efekt'),
    items: z
      .array(
        z.object({
          title: z.string(),
          duration: z.string().optional(),
          text: z.string().optional(),
          we: z.array(z.string()).default([]),
          you: z.array(z.string()).default([]),
          result: z.string().optional(),
        }),
      )
      .default([]),
  }),
  z.object({
    _template: z.literal('stats'),
    theme: theme.default('dark'),
    items: z.array(z.object({ value: z.string(), unit: z.string().optional(), label: z.string() })).default([]),
  }),
  z.object({
    _template: z.literal('layers'),
    eyebrow: z.string().optional(),
    items: z
      .array(z.object({ name: z.string(), text: z.string().optional(), color: z.string(), width: z.number().default(10) }))
      .default([]),
  }),
  z.object({
    _template: z.literal('guide'),
    /** hero: opens the page (h1, form beside) · closing: green band with the form at the end */
    variant: z.enum(['hero', 'closing']).default('hero'),
    eyebrow: z.string().optional(),
    title: z.string(),
    text: z.string().optional(),
    topics: z.array(z.string()).default([]),
    image: z.string().optional(),
    formTitle: z.string().optional(),
    buttonLabel: z.string().default('Odbieram bezpłatny poradnik'),
    note: z.string().optional(),
    /** optional PDF link shown after sending (as a backup to the e-mail) */
    pdf: z.string().optional(),
    showRating: z.boolean().default(false),
  }),
  z.object({
    _template: z.literal('faq'),
    /** h1 when it opens the page, h2 when another section comes first */
    heading: z.enum(['h1', 'h2']).default('h1'),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    items: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    aside: z.object({ eyebrow: z.string().optional(), title: z.string(), text: z.string().optional(), button: link.optional() }).optional(),
    image: z.string().optional(),
  }),
  z.object({
    _template: z.literal('articles'),
    eyebrow: z.string().optional(),
    theme: theme.default('paper'),
    items: z.array(z.object({ title: z.string(), text: z.string().optional(), href: z.string().optional() })).default([]),
  }),
  z.object({
    _template: z.literal('schedule'),
    eyebrow: z.string().optional(),
    stages: z.array(z.object({ label: z.string(), value: z.string().optional(), weight: z.number().default(1) })).default([]),
  }),
  z.object({
    _template: z.literal('estimate'),
    eyebrow: z.string().optional(),
    title: z.string(),
    text: z.string().optional(),
    standards: z.array(z.string()).default([]),
    buttonLabel: z.string().optional(),
  }),
  z.object({
    _template: z.literal('cta'),
    title: z.string(),
    text: z.string().optional(),
    button: link,
    theme: theme.default('paper'),
  }),
  z.object({
    _template: z.literal('catalog'),
  }),
  z.object({
    _template: z.literal('contact'),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    text: z.string().optional(),
    formTitle: z.string().optional(),
    choicesLabel: z.string().optional(),
    choices: z.array(z.string()).default([]),
    note: z.string().optional(),
  }),
  z.object({
    _template: z.literal('map'),
    label: z.string().optional(),
  }),
]);

const site = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/site' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string().optional() }),
    prefooter: z.enum(PREFOOTER_VARIANTS).default('quote'),
    hero: z
      .object({
        layout: z.enum(['split', 'image-side', 'image-bg', 'dark']).default('split'),
        eyebrow: z.string().optional(),
        title: z.string(),
        text: z.string().optional(),
        image: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    blocks: z.array(blocks).default([]),
  }),
});

export type Block = z.infer<typeof blocks>;
export type BlockOf<T extends Block['_template']> = Extract<Block, { _template: T }>;

export const collections = { settings, home, services, projects, catalog, site };
